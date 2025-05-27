-- File: src/main/resources/db/migration/dev/V1.0.5__scheduled_events.sql
-- Chứa các Stored Procedures và Events được lên lịch.

/**
 * Thủ tục vô hiệu hóa các discount đã hết hạn
 * 
 * Chức năng: Tự động vô hiệu hóa các giảm giá đã hết hạn bằng cách đặt trạng thái is_active = false
 * Tham số: Không có
 * Xử lý:
 *   - Cập nhật trạng thái is_active = false cho tất cả các discount có valid_until nhỏ hơn ngày hiện tại
 *   - Chỉ xử lý những discount đang ở trạng thái hoạt động (is_active = true)
 * Kết quả: Các discount hết hạn sẽ không còn được áp dụng trong hệ thống
 */
-- DELIMITER // -- Removed

CREATE OR REPLACE PROCEDURE sp_deactivate_expired_discounts()
LANGUAGE plpgsql
AS $$
BEGIN
    -- Ghi log bắt đầu (Tùy chọn)
    -- RAISE NOTICE 'Bắt đầu sp_deactivate_expired_discounts lúc %', NOW();

    UPDATE discount
    SET is_active = false, -- Sử dụng false cho kiểu BOOLEAN của PostgreSQL
        updated_at = CURRENT_TIMESTAMP
    WHERE is_active = true -- Chỉ cập nhật những cái đang active
      AND valid_until < CURRENT_DATE; -- CURDATE() của MySQL tương đương CURRENT_DATE của PostgreSQL

    -- Ghi log kết thúc (Tùy chọn)
    -- RAISE NOTICE 'Kết thúc sp_deactivate_expired_discounts lúc %', NOW();

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Lỗi xảy ra trong sp_deactivate_expired_discounts: % - %', SQLSTATE, SQLERRM;
END;
$$;

-- DELIMITER ; -- Removed

/**
 * Event tự động vô hiệu hóa các discount hết hạn hàng ngày
 * 
 * Chức năng: Lên lịch chạy thủ tục sp_deactivate_expired_discounts vào 1 giờ sáng hàng ngày
 * Lịch thực thi: Mỗi ngày một lần vào 1:00 AM
 * Thủ tục được gọi:
 *   - sp_deactivate_expired_discounts: Xử lý vô hiệu hóa tất cả discount đã hết hạn
 * Lưu ý: Thời gian có thể được điều chỉnh theo nhu cầu hoạt động của cửa hàng
 *
 * LƯU Ý QUAN TRỌNG: PostgreSQL không hỗ trợ CREATE EVENT trực tiếp như MySQL.
 * Bạn cần sử dụng một công cụ lập lịch bên ngoài (ví dụ: cron trên Linux/macOS, Task Scheduler trên Windows)
 * để gọi Stored Procedure này, hoặc sử dụng một extension như pg_cron.
 *
 * Ví dụ với pg_cron (sau khi cài đặt extension):
 * SELECT cron.schedule('deactivate-expired-discounts-daily', '0 1 * * *', $$CALL sp_deactivate_expired_discounts();$$);
 * Lệnh trên sẽ chạy vào 1:00 AM mỗi ngày.
 */
/*
CREATE EVENT event_deactivate_expired_discounts
    ON SCHEDULE EVERY 1 DAY
        STARTS (CURRENT_DATE + TIME '01:00:00') -- MySQL: TIMESTAMP(CURRENT_DATE, '01:00:00')
    DO
    BEGIN
        -- Gọi stored procedure
        CALL sp_deactivate_expired_discounts();
    END; -- Kết thúc DO block
*/
-- Các events và procedures khác (ví dụ: hủy order tự động) có thể được thêm ở đây.