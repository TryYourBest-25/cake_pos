-- Trigger kiểm tra thời hạn membership
DELIMITER //

/**
 * Trigger kiểm tra thời hạn khi cập nhật membership_type
 *
 * Chức năng: Đảm bảo rằng thời hạn membership được cập nhật phải là ngày trong tương lai
 * Thực thi: Trước khi cập nhật bảng membership_type
 * Tham số:
 *   - NEW: Dữ liệu mới sẽ được cập nhật
 *   - OLD: Dữ liệu hiện tại của bản ghi
 * Xử lý: Nếu ngày hết hạn không phải là ngày tương lai, sẽ báo lỗi và ngăn cập nhật
 */
CREATE TRIGGER before_membership_update_check_expiration
    BEFORE UPDATE
    ON membership_type
    FOR EACH ROW
BEGIN
    -- Nếu cập nhật valid_until, đảm bảo phải là ngày trong tương lai
    IF NEW.valid_until IS NOT NULL AND NEW.valid_until <= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Thời hạn membership phải là ngày trong tương lai';
    END IF;
END //

/**
 * Trigger kiểm tra thời hạn khi thêm mới membership_type
 *
 * Chức năng: Đảm bảo rằng thời hạn membership khi tạo mới phải là ngày trong tương lai
 * Thực thi: Trước khi thêm bản ghi vào bảng membership_type
 * Tham số:
 *   - NEW: Dữ liệu mới sẽ được thêm vào
 * Xử lý: Nếu ngày hết hạn không phải là ngày tương lai, sẽ báo lỗi và ngăn thêm mới
 */
CREATE TRIGGER before_membership_insert_check_expiration
    BEFORE INSERT
    ON membership_type
    FOR EACH ROW
BEGIN
    -- Nếu cập nhật valid_until, đảm bảo phải là ngày trong tương lai
    IF NEW.valid_until IS NOT NULL AND NEW.valid_until <= CURRENT_DATE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Thời hạn membership phải là ngày trong tương lai';
    END IF;
END //

DELIMITER ;

DELIMITER //

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
CREATE PROCEDURE sp_reset_expired_memberships()
BEGIN
    DECLARE newmem_id TINYINT UNSIGNED;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            SELECT 'Error occurred - transaction rolled back' AS result;
        END;

    START TRANSACTION;


    -- Lấy ID của loại thành viên NEWMEM
    SELECT membership_type_id
    INTO newmem_id
    FROM membership_type
    WHERE type = 'NEWMEM';

    -- Tìm và cập nhật các khách hàng có loại thành viên đã hết hạn
    UPDATE customer c
        JOIN membership_type mt ON c.membership_type_id = mt.membership_type_id
    SET c.membership_type_id = newmem_id,
        c.current_points     = 0,
        c.updated_at         = CURRENT_TIMESTAMP
    WHERE mt.valid_until IS NOT NULL
      AND mt.valid_until < CURRENT_DATE
      AND mt.type != 'NEWMEM';
    -- Log kết quả
    SELECT CONCAT('Đã reset ', ROW_COUNT(), ' khách hàng về loại thành viên NEWMEM do hết hạn') AS result;

    -- Tự động cập nhật valid_until về sau 1 năm cho các membership đã hết hạn
    UPDATE membership_type mt
    SET mt.valid_until = DATE_ADD(CURRENT_DATE, INTERVAL 1 YEAR)
    WHERE mt.valid_until IS NOT NULL
      AND mt.valid_until < CURRENT_DATE
      AND mt.type != 'NEWMEM';

    -- Log kết quả cập nhật thời hạn
    SELECT CONCAT('Đã cập nhật thời hạn cho ', ROW_COUNT(), ' loại thành viên thêm 1 năm') AS update_result;

    COMMIT;
END //

DELIMITER ;

DELIMITER //

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
CREATE PROCEDURE sp_recalculate_customer_memberships()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            SELECT 'Error occurred - transaction rolled back' AS result;
        END;

    START TRANSACTION;

    -- Cập nhật loại thành viên dựa trên điểm hiện tại
    UPDATE customer c
    SET c.membership_type_id = (SELECT mt.membership_type_id
                                FROM membership_type mt
                                WHERE c.current_points >= mt.required_point
                                  AND (mt.valid_until IS NULL OR mt.valid_until > CURRENT_DATE)
                                ORDER BY mt.required_point DESC
                                LIMIT 1),
        c.updated_at         = CURRENT_TIMESTAMP
    WHERE c.current_points > 0;

    -- Log kết quả
    SELECT CONCAT('Đã tái cấp loại thành viên cho ', ROW_COUNT(), ' khách hàng dựa trên điểm hiện tại') AS result;

    COMMIT;
END //

DELIMITER ;
DELIMITER //

/**
 * Event tự động kiểm tra và cập nhật membership hàng ngày
 *
 * Chức năng: Lên lịch chạy các thủ tục kiểm tra membership hết hạn và tái cấp thành viên mỗi ngày
 * Lịch thực thi: Mỗi ngày một lần, bắt đầu từ ngày mai
 * Các thủ tục được gọi:
 *   - sp_reset_expired_memberships: Đặt lại membership hết hạn
 *   - sp_recalculate_customer_memberships: Cập nhật lại loại thành viên theo điểm
 */
CREATE EVENT IF NOT EXISTS event_check_expired_memberships
    ON SCHEDULE EVERY 1 DAY
        STARTS CURRENT_DATE + INTERVAL 1 DAY
    DO
    BEGIN
        CALL sp_reset_expired_memberships();
        -- Thêm thủ tục tái cấp lại thành viên dựa trên điểm hiện tại
        CALL sp_recalculate_customer_memberships();
    END //

DELIMITER ;


-- Kiểm tra trạng thái hiện tại của Event Scheduler
SHOW VARIABLES LIKE 'event_scheduler';

-- Bật Event Scheduler nếu chưa được bật
SET GLOBAL event_scheduler = ON;
