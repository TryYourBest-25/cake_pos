-- ---------------------------------------------------------Dữ lệu mặc định------------------------------------------------

-- Dữ liệu cho bảng product_size
INSERT INTO product_size (unit, name, quantity, description)
VALUES ('cái', 'S', 1, 'Đơn vị (cái/phần)'),
       ('cái', 'M', 1, 'Đơn vị (cái/phần)'),
       ('cái', 'L', 1, 'Đơn vị (cái/phần)'),
       ('cái', 'NA', 1, 'Đơn vị (cái/phần)');

-- Dữ liệu cho bảng membership_type
INSERT INTO membership_type (type, discount_value, required_point, description, is_active, valid_until)
VALUES ('NEWMEM', 0, 0, 'Thành viên mới', true, null),
       ('BRONZE', 1, 20, 'Thành viên hạng đồng', true, NOW() + INTERVAL '365 days'),
       ('SILVER', 2,  50, 'Thành viên hạng bạc', true, NOW() + INTERVAL '365 days'),
       ('GOLD', 3,  100, 'Thành viên hạng vàng', true, NOW() + INTERVAL '365 days'),
       ('PLATINUM', 3.5,  200, 'Thành viên hạng bạch kim', true, NOW() + INTERVAL '365 days');

-- Dữ liệu cho bảng role
INSERT INTO role (name, description)
VALUES ('MANAGER', 'Quản trị viên - có toàn quyền quản lý hệ thống'),
       ('STAFF', 'Nhân viên - phục vụ và xử lý đơn hàng'),
       ('CUSTOMER', 'Khách hàng - người mua hàng'),
       ('GUEST', 'Khách vãng lai - người dùng chưa đăng ký');

-- Dữ liệu cho bảng payment_method
INSERT INTO payment_method (name, description)
VALUES ('CASH', 'Thanh toán bằng tiền mặt'),
       ('VNPAY', 'Thanh toán bằng VNPAY');
-- Dữ liệu cho bảng store
INSERT INTO store (name, address, phone, opening_time, closing_time, email, opening_date, tax_code)
    VALUES ('Bánh Ngọt Nhà Làm',
           '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
           '0987654321',
           '11:00:00',
           '22:00:00',
           'info@banhngotnhalam.com',
           '2023-01-01',
           '0123456789');

-- PostgreSQL Trigger Functions and Triggers

CREATE OR REPLACE FUNCTION protect_default_membership_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.type IN ('NEWMEM', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM') THEN
        IF NEW.type IS DISTINCT FROM OLD.type THEN
            RAISE EXCEPTION 'Không thể thay đổi tên loại thành viên mặc định' USING ERRCODE = '45000';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_default_membership_update_trigger
    BEFORE UPDATE ON membership_type
    FOR EACH ROW EXECUTE FUNCTION protect_default_membership_on_update();

CREATE OR REPLACE FUNCTION protect_default_membership_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.type IN ('NEWMEM') THEN
        RAISE EXCEPTION 'Không thể xóa loại thành viên mặc định' USING ERRCODE = '45000';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_default_membership_delete_trigger
    BEFORE DELETE ON membership_type
    FOR EACH ROW EXECUTE FUNCTION protect_default_membership_on_delete();

CREATE OR REPLACE FUNCTION protect_default_role_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name IN ('MANAGER', 'STAFF', 'CUSTOMER', 'GUEST') THEN
        IF NEW.name IS DISTINCT FROM OLD.name THEN
            RAISE EXCEPTION 'Không thể thay đổi tên vai trò mặc định' USING ERRCODE = '45000';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_default_role_update_trigger
    BEFORE UPDATE ON role
    FOR EACH ROW EXECUTE FUNCTION protect_default_role_on_update();

CREATE OR REPLACE FUNCTION protect_default_role_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.name IN ('MANAGER', 'STAFF', 'CUSTOMER', 'GUEST') THEN
        RAISE EXCEPTION 'Không thể xóa vai trò mặc định' USING ERRCODE = '45000';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_default_role_delete_trigger
    BEFORE DELETE ON role
    FOR EACH ROW EXECUTE FUNCTION protect_default_role_on_delete();

CREATE OR REPLACE FUNCTION protect_default_payment_method_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.payment_name IN ('CASH', 'VNPAY') THEN
        IF NEW.payment_name IS DISTINCT FROM OLD.payment_name THEN
            RAISE EXCEPTION 'Không thể thay đổi tên phương thức thanh toán mặc định' USING ERRCODE = '45000';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_default_payment_method_update_trigger
    BEFORE UPDATE ON payment_method
    FOR EACH ROW EXECUTE FUNCTION protect_default_payment_method_on_update();

CREATE OR REPLACE FUNCTION protect_default_payment_method_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.payment_name IN ('CASH', 'VNPAY') THEN
        RAISE EXCEPTION 'Không thể xóa phương thức thanh toán mặc định' USING ERRCODE = '45000';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_default_payment_method_delete_trigger
    BEFORE DELETE ON payment_method
    FOR EACH ROW EXECUTE FUNCTION protect_default_payment_method_on_delete();

CREATE OR REPLACE FUNCTION before_store_insert_func()
RETURNS TRIGGER AS $$
DECLARE
    store_count INT;
BEGIN
    SELECT COUNT(*) INTO store_count FROM store;
    IF store_count > 0 THEN
        RAISE EXCEPTION 'Không thể tạo thêm thông tin cửa hàng mới. Chỉ được phép có một bản ghi thông tin cửa hàng.' USING ERRCODE = '45000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_store_insert_trigger
    BEFORE INSERT ON store
    FOR EACH ROW EXECUTE FUNCTION before_store_insert_func();

CREATE OR REPLACE FUNCTION before_store_delete_func()
RETURNS TRIGGER AS $$
DECLARE
    store_count INT;
BEGIN
    SELECT COUNT(*) INTO store_count FROM store;
    IF store_count = 1 THEN
        RAISE EXCEPTION 'Không thể xóa thông tin cửa hàng duy nhất. Cửa hàng phải luôn có thông tin.' USING ERRCODE = '45000';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_store_delete_trigger
    BEFORE DELETE ON store
    FOR EACH ROW EXECUTE FUNCTION before_store_delete_func();

CREATE OR REPLACE FUNCTION before_store_update_func()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.store_id IS DISTINCT FROM OLD.store_id THEN
        RAISE EXCEPTION 'Không thể thay đổi ID của cửa hàng. Chỉ được phép cập nhật thông tin.' USING ERRCODE = '45000';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_store_update_trigger
    BEFORE UPDATE ON store
    FOR EACH ROW EXECUTE FUNCTION before_store_update_func();

-- ================================================================================================================
-- Dữ liệu cho tài khoản và người dùng
-- ================================================================================================================

-- Tạo tài khoản cho Manager (3 người) - Mật khẩu: "123456"
INSERT INTO account (role_id, username, password_hash, is_active, is_locked) VALUES
((SELECT role_id FROM role WHERE name = 'MANAGER'), 'manager1', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'MANAGER'), 'manager2', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'MANAGER'), 'manager3', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false);

-- Tạo tài khoản cho Staff (3 người) - Mật khẩu: "123456"
INSERT INTO account (role_id, username, password_hash, is_active, is_locked) VALUES
((SELECT role_id FROM role WHERE name = 'STAFF'), 'staff1', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'STAFF'), 'staff2', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'STAFF'), 'staff3', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false);

-- Tạo tài khoản cho Customer (5 người) - Mật khẩu: "123456"
INSERT INTO account (role_id, username, password_hash, is_active, is_locked) VALUES
((SELECT role_id FROM role WHERE name = 'CUSTOMER'), 'customer1', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'CUSTOMER'), 'customer2', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'CUSTOMER'), 'customer3', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'CUSTOMER'), 'customer4', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false),
((SELECT role_id FROM role WHERE name = 'CUSTOMER'), 'customer5', '$2a$10$9osuezRS/O.jawrXQ1ecr.Jht2AN0XXkff/4wMlPPbHsgUPzYKTdG', true, false);

-- Tạo thông tin Manager
INSERT INTO manager (account_id, last_name, first_name, gender, phone, email) VALUES
((SELECT account_id FROM account WHERE username = 'manager1'), 'Nguyễn', 'Văn Minh', 'MALE', '0901234567', 'nguyenvanminh@banhngotnhalam.com'),
((SELECT account_id FROM account WHERE username = 'manager2'), 'Trần', 'Thị Lan', 'FEMALE', '0901234568', 'tranthilan@banhngotnhalam.com'),
((SELECT account_id FROM account WHERE username = 'manager3'), 'Lê', 'Văn Hùng', 'MALE', '0901234569', 'levanhung@banhngotnhalam.com');

-- Tạo thông tin Employee
INSERT INTO employee (account_id, position, last_name, first_name, gender, phone, email) VALUES
((SELECT account_id FROM account WHERE username = 'staff1'), 'Nhân viên phục vụ', 'Phạm', 'Thị Mai', 'FEMALE', '0902345678', 'phamthimai@banhngotnhalam.com'),
((SELECT account_id FROM account WHERE username = 'staff2'), 'Nhân viên pha chế', 'Hoàng', 'Văn Nam', 'MALE', '0902345679', 'hoangvannam@banhngotnhalam.com'),
((SELECT account_id FROM account WHERE username = 'staff3'), 'Nhân viên thu ngân', 'Võ', 'Thị Hoa', 'FEMALE', '0902345680', 'vothihoa@banhngotnhalam.com');

-- Tạo thông tin Customer
INSERT INTO customer (membership_type_id, account_id, last_name, first_name, phone, current_points, gender) VALUES
((SELECT membership_type_id FROM membership_type WHERE type = 'NEWMEM'), (SELECT account_id FROM account WHERE username = 'customer1'), 'Đinh', 'Văn An', '0903456789', 0, 'MALE'),
((SELECT membership_type_id FROM membership_type WHERE type = 'BRONZE'), (SELECT account_id FROM account WHERE username = 'customer2'), 'Bùi', 'Thị Bình', '0903456790', 25, 'FEMALE'),
((SELECT membership_type_id FROM membership_type WHERE type = 'SILVER'), (SELECT account_id FROM account WHERE username = 'customer3'), 'Đặng', 'Văn Cường', '0903456791', 65, 'MALE'),
((SELECT membership_type_id FROM membership_type WHERE type = 'GOLD'), (SELECT account_id FROM account WHERE username = 'customer4'), 'Lý', 'Thị Dung', '0903456792', 120, 'FEMALE'),
((SELECT membership_type_id FROM membership_type WHERE type = 'PLATINUM'), (SELECT account_id FROM account WHERE username = 'customer5'), 'Vương', 'Văn Em', '0903456793', 250, 'MALE');

-- Thêm một số khách hàng không có tài khoản (khách vãng lai)
INSERT INTO customer (membership_type_id, account_id, last_name, first_name, phone, current_points, gender) VALUES
((SELECT membership_type_id FROM membership_type WHERE type = 'NEWMEM'), NULL, 'Ngô', 'Thị Phượng', '0904567890', 0, 'FEMALE'),
((SELECT membership_type_id FROM membership_type WHERE type = 'NEWMEM'), NULL, 'Trịnh', 'Văn Quang', '0904567891', 0, 'MALE'),
((SELECT membership_type_id FROM membership_type WHERE type = 'BRONZE'), NULL, 'Phan', 'Thị Hương', '0904567892', 22, 'FEMALE');
