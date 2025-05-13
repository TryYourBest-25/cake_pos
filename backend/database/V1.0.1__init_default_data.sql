-- ---------------------------------------------------------Dữ lệu mặc định------------------------------------------------

-- Dữ liệu cho bảng product_size
INSERT INTO product_size (unit, name, quantity, description)
VALUES ('cái', 'S', 1, 'Đơn vị (cái/phần)'),
       ('cái', 'M', 1, 'Đơn vị (cái/phần)'),
       ('cái', 'L', 1, 'Đơn vị (cái/phần)'),
       ('cái', 'NA', 1, 'Đơn vị (cái/phần)');

-- Dữ liệu cho bảng category
INSERT INTO category (category_id, name, description)
VALUES (1,'BÁNH NGỌT', 'Các loại bánh ngọt'),   
       (2,'BÁNH TRUNG THU', 'Các loại bánh trung thu');

-- Dữ liệu cho bảng membership_type
INSERT INTO membership_type (type, discount_value, discount_unit, required_point, description, is_active, valid_until)
VALUES ('NEWMEM', 0.000, 'FIXED', 0, 'Thành viên mới', 1, null),
       ('BRONZE', 1000, 'FIXED', 20, 'Thành viên hạng đồng', 1, TIME(DATE_ADD(NOW(), INTERVAL 365 DAY))),
       ('SILVER', 2000, 'FIXED', 50, 'Thành viên hạng bạc', 1, TIME(DATE_ADD(NOW(), INTERVAL 365 DAY))),
       ('GOLD', 1, 'PERCENTAGE', 100, 'Thành viên hạng vàng', 1, TIME(DATE_ADD(NOW(), INTERVAL 365 DAY))),
       ('PLATINUM', 2, 'PERCENTAGE', 200, 'Thành viên hạng bạch kim', 1, TIME(DATE_ADD(NOW(), INTERVAL 365 DAY)));

-- Dữ liệu cho bảng role
INSERT INTO role (name, description)
VALUES ('MANAGER', 'Quản trị viên - có toàn quyền quản lý hệ thống'),
       ('STAFF', 'Nhân viên - phục vụ và xử lý đơn hàng'),
       ('CUSTOMER', 'Khách hàng - người mua hàng'),
       ('GUEST', 'Khách vãng lai - người dùng chưa đăng ký');

-- Dữ liệu cho bảng payment_method
INSERT INTO payment_method (payment_name, payment_description)
VALUES ('CASH', 'Thanh toán bằng tiền mặt'),
       ('VISA', 'Thanh toán bằng thẻ Visa'),
       ('BANKCARD', 'Thanh toán bằng thẻ ngân hàng'),
       ('CREDIT_CARD', 'Thanh toán bằng thẻ tín dụng'),
       ('E-WALLET', 'Thanh toán bằng ví điện tử');

-- Dữ liệu cho bảng store
INSERT INTO store (name, address, phone, opening_time, closing_time, email, opening_date, tax_code)
    VALUE ('Bánh Ngọt Nhà Làm',
           '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
           '0987654321',
           '11:00:00',
           '22:00:00',
           'info@banhngotnhalam.com',
           '2023-01-01',
           '0123456789');

/**
 * Trigger bảo vệ loại thành viên mặc định khỏi việc thay đổi tên
 *
 * Chức năng: Ngăn chặn việc thay đổi tên của các loại thành viên cơ bản
 * Thực thi: Trước khi cập nhật bảng membership_type
 */
CREATE TRIGGER protect_default_membership_update
    BEFORE UPDATE
    ON membership_type
    FOR EACH ROW
BEGIN
    IF OLD.type IN ('NEWMEM', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM') THEN
        IF NEW.type != OLD.type THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Không thể thay đổi tên loại thành viên mặc định';
        END IF;
    END IF;
END //

/**
 * Trigger ngăn chặn việc xóa các loại thành viên mặc định
 *
 * Chức năng: Kiểm tra và ngăn chặn việc xóa các loại thành viên cơ bản
 * Thực thi: Trước khi xóa bản ghi từ bảng membership_type
 */
CREATE TRIGGER protect_default_membership_delete
    BEFORE DELETE
    ON membership_type
    FOR EACH ROW
BEGIN
    IF OLD.type IN ('NEWMEM', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể xóa loại thành viên mặc định';
    END IF;
END //

/**
 * Trigger bảo vệ vai trò mặc định khỏi việc thay đổi tên
 *
 * Chức năng: Ngăn chặn việc thay đổi tên của các vai trò cơ bản trong hệ thống
 * Thực thi: Trước khi cập nhật bảng role
 */
CREATE TRIGGER protect_default_role_update
    BEFORE UPDATE
    ON role
    FOR EACH ROW
BEGIN
    IF OLD.name IN ('MANAGER', 'STAFF', 'CUSTOMER', 'GUEST') THEN
        IF NEW.name != OLD.name THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Không thể thay đổi tên vai trò mặc định';
        END IF;
    END IF;
END //

/**
 * Trigger ngăn chặn việc xóa các vai trò mặc định
 *
 * Chức năng: Kiểm tra và ngăn chặn việc xóa các vai trò cơ bản trong hệ thống
 * Thực thi: Trước khi xóa bản ghi từ bảng role
 */
CREATE TRIGGER protect_default_role_delete
    BEFORE DELETE
    ON role
    FOR EACH ROW
BEGIN
    IF OLD.name IN ('MANAGER', 'STAFF', 'CUSTOMER', 'GUEST') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể xóa vai trò mặc định';
    END IF;
END //

/**
 * Trigger bảo vệ phương thức thanh toán mặc định khỏi việc thay đổi tên
 *
 * Chức năng: Ngăn chặn việc thay đổi tên của các phương thức thanh toán cơ bản
 * Thực thi: Trước khi cập nhật bảng payment_method
 */
CREATE TRIGGER protect_default_payment_method_update
    BEFORE UPDATE
    ON payment_method
    FOR EACH ROW
BEGIN
    IF OLD.payment_name IN ('CASH', 'VISA', 'BANKCARD', 'CREDIT_CARD', 'E-WALLET') THEN
        IF NEW.payment_name != OLD.payment_name THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Không thể thay đổi tên phương thức thanh toán mặc định';
        END IF;
    END IF;
END //

/**
 * Trigger ngăn chặn việc xóa các phương thức thanh toán mặc định
 *
 * Chức năng: Kiểm tra và ngăn chặn việc xóa các phương thức thanh toán cơ bản
 * Thực thi: Trước khi xóa bản ghi từ bảng payment_method
 */
CREATE TRIGGER protect_default_payment_method_delete
    BEFORE DELETE
    ON payment_method
    FOR EACH ROW
BEGIN
    IF OLD.payment_name IN ('CASH', 'VISA', 'BANKCARD', 'CREDIT_CARD', 'E-WALLET') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể xóa phương thức thanh toán mặc định';
    END IF;
END //

DELIMITER ;

DELIMITER //

/**
 * Trigger ngăn chặn việc thêm mới thông tin cửa hàng nếu đã tồn tại
 * 
 * Chức năng: Đảm bảo trong hệ thống chỉ có một bản ghi thông tin cửa hàng duy nhất
 * Thực thi: Trước khi thêm bản ghi vào bảng store
 */
CREATE TRIGGER before_store_insert
    BEFORE INSERT ON store
    FOR EACH ROW
BEGIN
    DECLARE store_count INT;

    -- Đếm số lượng bản ghi hiện có
    SELECT COUNT(*) INTO store_count FROM store;

    -- Nếu đã có bản ghi, từ chối thêm mới
    IF store_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể tạo thêm thông tin cửa hàng mới. Chỉ được phép có một bản ghi thông tin cửa hàng.';
    END IF;
END //

/**
 * Trigger ngăn chặn việc xóa thông tin cửa hàng duy nhất
 * 
 * Chức năng: Đảm bảo luôn có thông tin cửa hàng trong hệ thống
 * Thực thi: Trước khi xóa bản ghi từ bảng store
 */
CREATE TRIGGER before_store_delete
    BEFORE DELETE ON store
    FOR EACH ROW
BEGIN
    DECLARE store_count INT;

    -- Đếm số lượng bản ghi hiện có
    SELECT COUNT(*) INTO store_count FROM store;

    -- Nếu chỉ có một bản ghi, từ chối xóa
    IF store_count = 1 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể xóa thông tin cửa hàng duy nhất. Cửa hàng phải luôn có thông tin.';
    END IF;
END //

DELIMITER ;

DELIMITER //

/**
 * Trigger chỉ cho phép cập nhật thông tin cửa hàng, không đổi ID
 * 
 * Chức năng: Đảm bảo không thay đổi ID của cửa hàng khi cập nhật thông tin
 * Thực thi: Trước khi cập nhật bảng store
 */
CREATE TRIGGER before_store_update
    BEFORE UPDATE ON store
    FOR EACH ROW
BEGIN
    -- Đảm bảo không thay đổi ID
    IF NEW.store_id != OLD.store_id THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể thay đổi ID của cửa hàng. Chỉ được phép cập nhật thông tin.';
    END IF;
END //

DELIMITER ;
