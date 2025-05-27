-- Trigger kiểm tra thời hạn membership

CREATE OR REPLACE FUNCTION before_membership_update_check_expiration_func()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu cập nhật valid_until, đảm bảo phải là ngày trong tương lai
    IF NEW.valid_until IS NOT NULL AND NEW.valid_until <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Thời hạn membership phải là ngày trong tương lai' USING ERRCODE = '45000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_membership_update_check_expiration_trigger
    BEFORE UPDATE ON membership_type
    FOR EACH ROW EXECUTE FUNCTION before_membership_update_check_expiration_func();

CREATE OR REPLACE FUNCTION before_membership_insert_check_expiration_func()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu cập nhật valid_until, đảm bảo phải là ngày trong tương lai
    IF NEW.valid_until IS NOT NULL AND NEW.valid_until <= CURRENT_DATE THEN
        RAISE EXCEPTION 'Thời hạn membership phải là ngày trong tương lai' USING ERRCODE = '45000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_membership_insert_check_expiration_trigger
    BEFORE INSERT ON membership_type
    FOR EACH ROW EXECUTE FUNCTION before_membership_insert_check_expiration_func();

/**
 * Thủ tục reset membership về NEWMEM khi hết hạn
 *
 * Chức năng: Đặt lại loại thành viên của khách hàng về NEWMEM khi membership hiện tại hết hạn
 * Tham số: Không có
 * Xử lý:
 *   - Tìm ID của loại thành viên NEWMEM
 *   - Cập nhật các khách hàng có loại thành viên đã hết hạn về loại NEWMEM
 *   - Đặt điểm của khách hàng về 0
 *   - Tự động gia hạn thời hạn loại thành viên thêm 1 năm
 * Kết quả trả về:
 *   - Thông báo số lượng khách hàng đã được đặt lại thành viên
 *   - Thông báo số lượng loại thành viên đã được gia hạn
 */
CREATE OR REPLACE PROCEDURE sp_reset_expired_memberships()
LANGUAGE plpgsql
AS $$
DECLARE
    newmem_id SMALLINT;
    updated_customers_count INT;
    updated_membership_types_count INT;
BEGIN
    -- Lấy ID của loại thành viên NEWMEM
    SELECT mt.membership_type_id
    INTO newmem_id
    FROM membership_type mt
    WHERE mt.type = 'NEWMEM'
    LIMIT 1; -- Đảm bảo chỉ lấy 1 nếu có trùng (dù 'type' là unique)

    IF newmem_id IS NULL THEN
        RAISE NOTICE 'Không tìm thấy loại thành viên NEWMEM.';
        RETURN;
    END IF;

    -- Tìm và cập nhật các khách hàng có loại thành viên đã hết hạn
    UPDATE customer c
    SET membership_type_id = newmem_id,
        current_points     = 0,
        updated_at         = CURRENT_TIMESTAMP
    FROM membership_type mt
    WHERE c.membership_type_id = mt.membership_type_id
      AND mt.valid_until IS NOT NULL
      AND mt.valid_until < CURRENT_DATE
      AND mt.type != 'NEWMEM'; -- Không reset nếu đã là NEWMEM
    GET DIAGNOSTICS updated_customers_count = ROW_COUNT;

    -- Log kết quả
    RAISE NOTICE 'Đã reset % khách hàng về loại thành viên NEWMEM do hết hạn', updated_customers_count;

    -- Tự động cập nhật valid_until về sau 1 năm cho các membership type (ngoại trừ NEWMEM) đã hết hạn
    -- Logic này có vẻ lạ: gia hạn cho *loại* thành viên, không phải cho từng khách hàng.
    -- Nếu ý là gia hạn cho các khách hàng vừa bị reset thì cần logic khác.
    -- Giả sử là gia hạn cho các membership_type definitions.
    UPDATE membership_type mt
    SET valid_until = CURRENT_DATE + INTERVAL '1 year'
    WHERE mt.valid_until IS NOT NULL
      AND mt.valid_until < CURRENT_DATE
      AND mt.type != 'NEWMEM'; -- NEWMEM thường không có valid_until hoặc không nên tự động gia hạn theo cách này
    GET DIAGNOSTICS updated_membership_types_count = ROW_COUNT;

    -- Log kết quả cập nhật thời hạn
    RAISE NOTICE 'Đã cập nhật thời hạn cho % loại thành viên thêm 1 năm', updated_membership_types_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lỗi xảy ra trong sp_reset_expired_memberships: % - %', SQLSTATE, SQLERRM;
        -- Không có ROLLBACK rõ ràng ở đây vì PL/pgSQL procedure chạy trong một transaction
        -- Nếu có lỗi, toàn bộ procedure sẽ rollback trừ khi có sub-transaction.
END;
$$;

/**
 * Thủ tục tái cấp lại thành viên dựa trên điểm hiện tại
 *
 * Chức năng: Tính toán và cập nhật lại loại thành viên của khách hàng dựa trên điểm hiện tại
 * Tham số: Không có
 * Xử lý:
 *   - Cập nhật khách hàng sang loại thành viên phù hợp theo điểm hiện có
 *   - Chỉ xét các khách hàng có điểm > 0
 *   - Chỉ xét các loại thành viên còn thời hạn
 * Kết quả trả về:
 *   - Thông báo số lượng khách hàng đã được cập nhật loại thành viên
 */
CREATE OR REPLACE PROCEDURE sp_recalculate_customer_memberships()
LANGUAGE plpgsql
AS $$
DECLARE
    updated_customers_count INT;
BEGIN
    -- Cập nhật loại thành viên dựa trên điểm hiện tại
    UPDATE customer c
    SET membership_type_id = sub.new_membership_type_id,
        updated_at         = CURRENT_TIMESTAMP
    FROM (
        SELECT 
            c_inner.customer_id,
            (SELECT mt.membership_type_id
             FROM membership_type mt
             WHERE c_inner.current_points >= mt.required_point
               AND (mt.valid_until IS NULL OR mt.valid_until > CURRENT_DATE)
               AND mt.is_active = TRUE -- Chỉ xét các loại thành viên đang active
             ORDER BY mt.required_point DESC
             LIMIT 1) as new_membership_type_id
        FROM customer c_inner
        WHERE c_inner.current_points > 0
    ) AS sub
    WHERE c.customer_id = sub.customer_id AND c.membership_type_id IS DISTINCT FROM sub.new_membership_type_id;

    GET DIAGNOSTICS updated_customers_count = ROW_COUNT;
    -- Log kết quả
    RAISE NOTICE 'Đã tái cấp loại thành viên cho % khách hàng dựa trên điểm hiện tại', updated_customers_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lỗi xảy ra trong sp_recalculate_customer_memberships: % - %', SQLSTATE, SQLERRM;
END;
$$;

/**
 * Event tự động kiểm tra và cập nhật membership hàng ngày
 *
 * Chức năng: Lên lịch chạy các thủ tục kiểm tra membership hết hạn và tái cấp thành viên mỗi ngày
 * Lịch thực thi: Mỗi ngày một lần, bắt đầu từ ngày mai
 * Các thủ tục được gọi:
 *   - sp_reset_expired_memberships: Đặt lại membership hết hạn
 *   - sp_recalculate_customer_memberships: Cập nhật lại loại thành viên theo điểm
 *
 * LƯU Ý QUAN TRỌNG: PostgreSQL không hỗ trợ CREATE EVENT trực tiếp như MySQL.
 * Bạn cần sử dụng một công cụ lập lịch bên ngoài (ví dụ: cron trên Linux/macOS, Task Scheduler trên Windows)
 * để gọi các Stored Procedure này, hoặc sử dụng một extension như pg_cron.
 *
 * Ví dụ với pg_cron (sau khi cài đặt extension):
 * SELECT cron.schedule('membership-daily-check', '0 1 * * *', $$CALL sp_reset_expired_memberships(); CALL sp_recalculate_customer_memberships();$$);
 * Lệnh trên sẽ chạy vào 1:00 AM mỗi ngày.
 */
/*
CREATE EVENT IF NOT EXISTS event_check_expired_memberships
    ON SCHEDULE EVERY 1 DAY
        STARTS CURRENT_DATE + INTERVAL 1 DAY -- PostgreSQL: CURRENT_DATE + INTERVAL '1 day'
    DO
    BEGIN
        CALL sp_reset_expired_memberships();
        -- Thêm thủ tục tái cấp lại thành viên dựa trên điểm hiện tại
        CALL sp_recalculate_customer_memberships();
    END //
*/
-- DELIMITER ; -- Removed


-- Các lệnh sau đây là đặc thù của MySQL và không áp dụng cho PostgreSQL:
-- SHOW VARIABLES LIKE 'event_scheduler';
-- SET GLOBAL event_scheduler = ON;
