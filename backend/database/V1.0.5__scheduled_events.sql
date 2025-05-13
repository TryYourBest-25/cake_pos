-- File: src/main/resources/db/migration/dev/V1.0.5__scheduled_events.sql
-- Chứa các Stored Procedures và Events được lên lịch.

/**
 * Thủ tục vô hiệu hóa các discount đã hết hạn
 * 
 * Chức năng: Tự động vô hiệu hóa các giảm giá đã hết hạn bằng cách đặt trạng thái is_active = 0
 * Tham số: Không có
 * Xử lý:
 *   - Cập nhật trạng thái is_active = 0 cho tất cả các discount có valid_until nhỏ hơn ngày hiện tại
 *   - Chỉ xử lý những discount đang ở trạng thái hoạt động (is_active = 1)
 * Kết quả: Các discount hết hạn sẽ không còn được áp dụng trong hệ thống
 */
DELIMITER //

CREATE PROCEDURE sp_deactivate_expired_discounts()
BEGIN
    -- Ghi log bắt đầu (Tùy chọn)
    -- INSERT INTO event_log (event_name, start_time) VALUES ('sp_deactivate_expired_discounts', NOW());

    UPDATE discount
    SET is_active = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE is_active = 1 -- Chỉ cập nhật những cái đang active
      AND valid_until < CURDATE(); -- Sử dụng '<' để chỉ vô hiệu hóa SAU ngày hết hạn.
    -- Nếu muốn vô hiệu hóa VÀO ngày hết hạn, dùng '<='

    -- Ghi log kết thúc (Tùy chọn)
    -- INSERT INTO event_log (event_name, end_time, status) VALUES ('sp_deactivate_expired_discounts', NOW(), 'Completed');

    -- Error handling có thể được thêm vào nếu cần
END //

DELIMITER ;

/**
 * Event tự động vô hiệu hóa các discount hết hạn hàng ngày
 * 
 * Chức năng: Lên lịch chạy thủ tục sp_deactivate_expired_discounts vào 1 giờ sáng hàng ngày
 * Lịch thực thi: Mỗi ngày một lần vào 1:00 AM
 * Thủ tục được gọi:
 *   - sp_deactivate_expired_discounts: Xử lý vô hiệu hóa tất cả discount đã hết hạn
 * Lưu ý: Thời gian có thể được điều chỉnh theo nhu cầu hoạt động của cửa hàng
 */
CREATE EVENT event_deactivate_expired_discounts
    ON SCHEDULE EVERY 1 DAY
        STARTS TIMESTAMP(CURRENT_DATE, '01:00:00') -- Bắt đầu vào 1 giờ sáng ngày hiện tại
    DO
    BEGIN
        -- Gọi stored procedure
        CALL sp_deactivate_expired_discounts();
    END; -- Kết thúc DO block

-- Các events và procedures khác (ví dụ: hủy order tự động) có thể được thêm ở đây.