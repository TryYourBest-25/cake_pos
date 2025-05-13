DELIMITER //

/**
 * Thủ tục cấp quyền theo vai trò cho người dùng
 *
 * Chức năng: Cấp quyền MySQL dựa trên vai trò của tài khoản trong hệ thống
 * Tham số:
 *   - p_account_id: ID của tài khoản người dùng cần cấp quyền
 * Xử lý:
 *   - Lấy thông tin tài khoản và vai trò từ database
 *   - Tạo username MySQL từ thông tin người dùng và vai trò (nếu chưa tồn tại)
 *   - Thu hồi tất cả các quyền cũ
 *   - Cấp quyền mới phù hợp với vai trò:
 *     + MANAGER: Tất cả quyền trên database và quyền EXECUTE trên tất cả stored procedures
 *     + STAFF: Quyền SELECT trên database và quyền EXECUTE giới hạn trên một số stored procedures
 * Kết quả:
 *   - Người dùng được cấp quyền MySQL phù hợp với vai trò trong hệ thống
 */
CREATE PROCEDURE sp_grant_permissions_by_role(
    IN p_account_id INT UNSIGNED
)
BEGIN
    DECLARE role_name VARCHAR(50);
    DECLARE username VARCHAR(50);
    DECLARE mysql_username VARCHAR(100);
    DECLARE db_name VARCHAR(64);
    DECLARE exit_handler BOOLEAN DEFAULT FALSE;

    -- Declare handler for errors to ensure transaction rollback
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
        BEGIN
            SET exit_handler = TRUE;
        END;

    START TRANSACTION;

    -- Lấy tên database hiện tại
    SELECT DATABASE() INTO db_name;

    -- Lấy thông tin tài khoản và vai trò
    SELECT a.username, r.name
    INTO username, role_name
    FROM account a
             JOIN role r ON a.role_id = r.role_id
    WHERE a.account_id = p_account_id;

    -- Chỉ xử lý cho MANAGER và STAFF
    IF role_name IN ('MANAGER', 'STAFF') THEN
        -- Tạo tên người dùng MySQL từ username và role
        SET mysql_username = CONCAT(username, '_', LOWER(role_name));

        -- Kiểm tra xem người dùng MySQL đã tồn tại chưa
        SET @user_exists = 0;
        SELECT COUNT(*)
        INTO @user_exists
        FROM mysql.user
        WHERE User = mysql_username
          AND (Host = 'localhost' OR Host = '%');

        -- Nếu chưa tồn tại, tạo người dùng MySQL mới với mật khẩu tạm thời
        IF @user_exists = 0 THEN
            SET @temp_password = CONCAT(username, '_temp_pwd');

            -- Create localhost user
            SET @sql_create_user_localhost =
                    CONCAT('CREATE USER \'', mysql_username, '\'@\'localhost\' IDENTIFIED BY \'', @temp_password, '\'');
            PREPARE stmt FROM @sql_create_user_localhost;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            -- Create remote user
            SET @sql_create_user_remote =
                    CONCAT('CREATE USER \'', mysql_username, '\'@\'%\' IDENTIFIED BY \'', @temp_password, '\'');
            PREPARE stmt FROM @sql_create_user_remote;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;

        -- Thu hồi tất cả quyền cũ trước khi cấp mới
        SET @sql_revoke_localhost =
                CONCAT('REVOKE ALL PRIVILEGES ON ', db_name, '.* FROM \'', mysql_username, '\'@\'localhost\'');
        PREPARE stmt FROM @sql_revoke_localhost;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @sql_revoke_remote =
                CONCAT('REVOKE ALL PRIVILEGES ON ', db_name, '.* FROM \'', mysql_username, '\'@\'%\'');
        PREPARE stmt FROM @sql_revoke_remote;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        -- Thu hồi quyền EXECUTE trên tất cả routines
        SET @sql_revoke_execute_localhost =
                CONCAT('REVOKE EXECUTE ON ', db_name, '.* FROM \'', mysql_username, '\'@\'localhost\'');
        PREPARE stmt FROM @sql_revoke_execute_localhost;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @sql_revoke_execute_remote =
                CONCAT('REVOKE EXECUTE ON ', db_name, '.* FROM \'', mysql_username, '\'@\'%\'');
        PREPARE stmt FROM @sql_revoke_execute_remote;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        IF role_name = 'MANAGER' THEN
            -- Cấp toàn quyền cho MANAGER
            SET @sql_grant_all_localhost =
                    CONCAT('GRANT ALL PRIVILEGES ON ', db_name, '.* TO \'', mysql_username, '\'@\'localhost\'');
            PREPARE stmt FROM @sql_grant_all_localhost;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SET @sql_grant_all_remote =
                    CONCAT('GRANT ALL PRIVILEGES ON ', db_name, '.* TO \'', mysql_username, '\'@\'%\'');
            PREPARE stmt FROM @sql_grant_all_remote;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SET @sql_grant_execute_localhost =
                    CONCAT('GRANT EXECUTE ON ', db_name, '.* TO \'', mysql_username, '\'@\'localhost\'');
            PREPARE stmt FROM @sql_grant_execute_localhost;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SET @sql_grant_execute_remote =
                    CONCAT('GRANT EXECUTE ON ', db_name, '.* TO \'', mysql_username, '\'@\'%\'');
            PREPARE stmt FROM @sql_grant_execute_remote;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SELECT mysql_username AS username,
                   role_name AS role,
                   'Đã cấp toàn quyền(ALL PRIVILEGES + EXECUTE) thành công' AS message;

        ELSEIF role_name = 'STAFF' THEN
            -- Cấp quyền SELECT trên tất cả các bảng
            SET @sql_grant_select_localhost =
                    CONCAT('GRANT SELECT ON ', db_name, '.* TO \'', mysql_username, '\'@\'localhost\'');
            PREPARE stmt FROM @sql_grant_select_localhost;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SET @sql_grant_select_remote =
                    CONCAT('GRANT SELECT ON ', db_name, '.* TO \'', mysql_username, '\'@\'%\'');
            PREPARE stmt FROM @sql_grant_select_remote;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            -- Grant execute on specific procedures
            SET @sql_grant_exec_proc1 =
                    CONCAT('GRANT EXECUTE ON PROCEDURE ', db_name, '.sp_create_full_order TO \'',
                           mysql_username, '\'@\'localhost\', \'', mysql_username, '\'@\'%\'');
            PREPARE stmt FROM @sql_grant_exec_proc1;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SET @sql_grant_exec_proc2 =
                    CONCAT('GRANT EXECUTE ON PROCEDURE ', db_name, '.sp_insert_customer TO \'',
                           mysql_username, '\'@\'localhost\', \'', mysql_username, '\'@\'%\'');
            PREPARE stmt FROM @sql_grant_exec_proc2;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SELECT mysql_username AS username,
                   role_name AS role,
                   'Đã cấp quyền SELECT và EXECUTE giới hạn cho STAFF thành công' AS message;
        END IF;

        -- Áp dụng thay đổi
        FLUSH PRIVILEGES;

    ELSE
        -- Trả về thông báo cho các vai trò khác
        SELECT 'Không cấp quyền DB cho vai trò này' AS message;
    END IF;

    -- Commit or rollback based on whether we encountered errors
    IF exit_handler THEN
        ROLLBACK;
        SELECT 'Có lỗi xảy ra, đã rollback' AS error_message;
    ELSE
        COMMIT;
    END IF;
END//

/**
 * Thủ tục thu hồi quyền MySQL khi tài khoản bị khóa
 *
 * Chức năng: Thu hồi tất cả quyền trên database khi tài khoản bị khóa
 * Tham số:
 *   - p_account_id: ID của tài khoản cần thu hồi quyền
 * Xử lý:
 *   - Lấy thông tin tài khoản và vai trò từ database
 *   - Tạo tên username MySQL từ thông tin tài khoản
 *   - Thu hồi tất cả quyền trên database nếu người dùng MySQL tồn tại
 * Kết quả:
 *   - Người dùng bị thu hồi tất cả quyền MySQL khi tài khoản bị khóa
 */
CREATE PROCEDURE sp_revoke_permissions(
    IN p_account_id INT UNSIGNED
)
BEGIN
    DECLARE role_name VARCHAR(50);
    DECLARE username VARCHAR(50);
    DECLARE mysql_username VARCHAR(100);
    DECLARE db_name VARCHAR(64);
    -- Biến lưu tên database

    -- Lấy tên database hiện tại
    SELECT DATABASE() INTO db_name;

    -- Lấy thông tin tài khoản và vai trò
    SELECT a.username, r.name
    INTO username, role_name
    FROM account a
             JOIN role r ON a.role_id = r.role_id
    WHERE a.account_id = p_account_id;

    -- Chỉ xử lý cho MANAGER và STAFF
    IF role_name IN ('MANAGER', 'STAFF') THEN
        -- Tạo tên người dùng MySQL từ username và role
        SET mysql_username = CONCAT(username, '_', LOWER(role_name));

        -- Kiểm tra xem người dùng MySQL có tồn tại không
        SET @user_exists = 0;
        SELECT COUNT(*)
        INTO @user_exists
        FROM mysql.user
        WHERE User = mysql_username
          AND (Host = 'localhost' OR Host = '%');

        IF @user_exists > 0 THEN
            -- Thu hồi tất cả quyền trên database cụ thể
            SET @sql_revoke_localhost =
                    CONCAT('REVOKE ALL PRIVILEGES ON ', db_name, '.* FROM \'', mysql_username,
                           '\'@\'localhost\'');
            PREPARE stmt FROM @sql_revoke_localhost;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            SET @sql_revoke_remote = CONCAT('REVOKE ALL PRIVILEGES ON ', db_name, '.* FROM \'', mysql_username,
                                            '\'@\'%\'');
            PREPARE stmt FROM @sql_revoke_remote;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;

            -- Áp dụng thay đổi
            FLUSH PRIVILEGES;

            -- Trả về thông tin
            SELECT mysql_username                  AS username,
                   ' Đã thu hồi quyền thành công ' AS message;
        ELSE
            -- Trả về thông báo
            SELECT ' Người dùng MySQL không tồn tại ' AS message;
        END IF;
    ELSE
        -- Trả về thông báo
        SELECT ' Không cần thu hồi quyền cho vai trò này ' AS message;
    END IF;
END //

/**
 * Thủ tục khóa/mở khóa tài khoản và xử lý quyền tương ứng
 *
 * Chức năng: Thay đổi trạng thái khóa của tài khoản và cập nhật quyền MySQL tương ứng
 * Tham số:
 *   - p_account_id: ID của tài khoản cần khóa/mở khóa
 *   - p_is_locked: Trạng thái khóa mới (1: Khóa, 0: Mở khóa)
 * Xử lý:
 *   - Kiểm tra trạng thái khóa hiện tại của tài khoản
 *   - Nếu trạng thái thay đổi:
 *     + Cập nhật trạng thái khóa trong bảng account
 *     + Gọi các thủ tục thu hồi hoặc cấp quyền tương ứng
 * Kết quả:
 *   - Tài khoản được khóa/mở khóa và quyền MySQL được cập nhật phù hợp
 */
CREATE PROCEDURE sp_lock_unlock_account(
    IN p_account_id INT UNSIGNED,
    IN p_is_locked TINYINT(1)
)
BEGIN
    DECLARE current_lock_status TINYINT(1);

    -- Lấy trạng thái khóa hiện tại
    SELECT is_locked
    INTO current_lock_status
    FROM account
    WHERE account_id = p_account_id;

    -- Chỉ thực hiện nếu trạng thái thay đổi
    IF current_lock_status != p_is_locked THEN
        -- Bắt đầu transaction
        START TRANSACTION;

        -- Cập nhật trạng thái khóa
        UPDATE account
        SET is_locked  = p_is_locked,
            updated_at = CURRENT_TIMESTAMP
        WHERE account_id = p_account_id;

        -- Xử lý quyền dựa trên trạng thái khóa mới
        IF p_is_locked = 1 THEN
            -- Khóa tài khoản: thu hồi quyền
            CALL sp_revoke_permissions(p_account_id);
            SELECT 'Tài khoản đã bị khóa và quyền đã bị thu hồi' AS message;
        ELSE
            -- Mở khóa tài khoản: cấp lại quyền SELECT và EXECUTE giới hạn (sử dụng sp_grant_permissions_by_role đã sửa)
            CALL sp_grant_permissions_by_role(p_account_id);
            SELECT 'Tài khoản đã được mở khóa và quyền đã được cấp lại' AS message;
        END IF;

        -- Hoàn tất transaction
        COMMIT;
    ELSE
        SELECT 'Trạng thái khóa không thay đổi' AS message;
    END IF;
END //

DELIMITER //

/**
 * Thủ tục tạo tài khoản MANAGER
 *
 * Chức năng: Tạo tài khoản và thông tin quản lý với quyền hạn MANAGER
 * Tham số:
 *   - p_username: Tên đăng nhập
 *   - p_password: Mật khẩu (đã hash)
 *   - p_last_name: Họ của quản lý
 *   - p_first_name: Tên của quản lý
 *   - p_gender: Giới tính
 *   - p_phone: Số điện thoại
 *   - p_email: Email
 * Tham số trả về:
 *   - p_new_account_id: ID của tài khoản mới được tạo (NULL nếu thất bại)
 *   - p_status_message: Thông báo kết quả
 * Xử lý:
 *   - Lấy role_id của vai trò MANAGER
 *   - Tạo tài khoản mới với vai trò MANAGER
 *   - Cấp quyền MySQL cho tài khoản
 *   - Tạo thông tin quản lý liên kết với tài khoản
 * Kết quả:
 *   - Tài khoản quản lý mới được tạo với đầy đủ thông tin và quyền hạn
 */
CREATE PROCEDURE sp_create_manager_account(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255), -- Nên là mật khẩu đã hash từ ứng dụng
    IN p_last_name VARCHAR(70),
    IN p_first_name VARCHAR(70),
    IN p_gender ENUM ('MALE', 'FEMALE', 'OTHER'),
    IN p_phone VARCHAR(15),
    IN p_email VARCHAR(100),
    OUT p_new_account_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
-- Label for LEAVE defined directly after BEGIN
create_manager_proc:
BEGIN
    DECLARE manager_role_id TINYINT UNSIGNED;
    DECLARE v_account_id INT UNSIGNED;
    DECLARE v_manager_id INT UNSIGNED;
    -- Use declared local variable for OUT param

    -- Error handling
    DECLARE exit handler for sqlexception
        BEGIN
            ROLLBACK;
            SET p_new_account_id = NULL;
            SET p_status_message = 'Lỗi SQL xảy ra, giao dịch đã được hủy bỏ.';
        END;

    -- Lấy role_id của MANAGER
    SELECT role_id INTO manager_role_id FROM role WHERE name = 'MANAGER';
    IF manager_role_id IS NULL THEN
        SET p_status_message = 'Không tìm thấy vai trò MANAGER.';
        LEAVE create_manager_proc; -- Exit the procedure using label
    END IF;

    -- Bắt đầu transaction
    START TRANSACTION;

    -- 1. Tạo tài khoản sử dụng sp_insert_account
    CALL sp_insert_account(
            manager_role_id,
            p_username,
            p_password, -- Truyền mật khẩu (đã hash hoặc chưa tùy logic ứng dụng)
            0, -- is_active = FALSE (as per user change)
            0, -- is_locked = FALSE
            v_account_id
         );

    IF v_account_id IS NULL THEN
        ROLLBACK;
        SET p_status_message = 'Không thể tạo tài khoản.';
        LEAVE create_manager_proc;
    END IF;

    -- 2. Cấp quyền SELECT cho tài khoản mới (sử dụng sp_grant_permissions_by_role đã sửa)
    CALL sp_grant_permissions_by_role(v_account_id);
    -- Lưu ý: Kiểm tra kết quả của sp_grant_permissions_by_role nếu cần

    -- 3. Tạo thông tin Manager sử dụng sp_insert_manager
    CALL sp_insert_manager(
            v_account_id,
            p_last_name,
            p_first_name,
            p_gender,
            p_phone,
            p_email,
            v_manager_id -- Use declared variable for OUT param
         );

    -- Kiểm tra lỗi sau khi gọi sp_insert_manager
#     IF v_manager_id IS NULL OR v_manager_id <= 0 THEN
#         SIGNAL SQLSTATE '45000'
#             SET MESSAGE_TEXT = 'Không thể tạo thông tin manager.';
#         ROLLBACK;
#         SET p_status_message = 'Không thể tạo thông tin manager.';
#         LEAVE create_manager_proc;
#     END IF;

    -- Hoàn tất transaction
    COMMIT;

    -- Trả về kết quả
    SET p_new_account_id = v_account_id;
    SET p_status_message = 'Đã tạo tài khoản MANAGER và cấp quyền thành công.'; -- Updated message slightly

END create_manager_proc //-- End labeled block

/**
 * Thủ tục tạo tài khoản STAFF
 *
 * Chức năng: Tạo tài khoản và thông tin nhân viên với quyền hạn STAFF
 * Tham số:
 *   - p_username: Tên đăng nhập
 *   - p_password: Mật khẩu (đã hash)
 *   - p_position: Vị trí/chức vụ của nhân viên
 *   - p_last_name: Họ của nhân viên
 *   - p_first_name: Tên của nhân viên
 *   - p_gender: Giới tính
 *   - p_phone: Số điện thoại
 *   - p_email: Email
 * Tham số trả về:
 *   - p_new_account_id: ID của tài khoản mới được tạo (NULL nếu thất bại)
 *   - p_status_message: Thông báo kết quả
 * Xử lý:
 *   - Lấy role_id của vai trò STAFF
 *   - Tạo tài khoản mới với vai trò STAFF
 *   - Cấp quyền MySQL giới hạn cho tài khoản
 *   - Tạo thông tin nhân viên liên kết với tài khoản
 * Kết quả:
 *   - Tài khoản nhân viên mới được tạo với đầy đủ thông tin và quyền hạn
 */
CREATE PROCEDURE sp_create_staff_account(
    IN p_username VARCHAR(50),
    IN p_password VARCHAR(255), -- Nên là mật khẩu đã hash từ ứng dụng
    IN p_position VARCHAR(50),
    IN p_last_name VARCHAR(70),
    IN p_first_name VARCHAR(70),
    IN p_gender ENUM ('MALE', 'FEMALE', 'OTHER'),
    IN p_phone VARCHAR(15),
    IN p_email VARCHAR(100),
    OUT p_new_account_id INT UNSIGNED,
    OUT p_status_message VARCHAR(255)
)
-- Label for LEAVE defined directly after BEGIN
create_staff_proc:
BEGIN
    DECLARE staff_role_id TINYINT UNSIGNED;
    DECLARE v_account_id INT UNSIGNED;
    DECLARE v_employee_id INT UNSIGNED;
    -- Use declared local variable for OUT param

    -- Error handling
    DECLARE exit handler for sqlexception
        BEGIN
        END;

    -- Lấy role_id của STAFF
    SELECT role_id INTO staff_role_id FROM role WHERE name = 'STAFF';
    IF staff_role_id IS NULL THEN
        SET p_status_message = 'Không tìm thấy vai trò STAFF.';
        LEAVE create_staff_proc; -- Exit the procedure using label
    END IF;

    -- Bắt đầu transaction
    START TRANSACTION;

    -- 1. Tạo tài khoản sử dụng sp_insert_account
    CALL sp_insert_account(
            staff_role_id,
            p_username,
            p_password,
            0, -- is_active = TRUE (Staff active by default)
            0, -- is_locked = FALSE
            v_account_id
         );

    IF v_account_id IS NULL THEN
        ROLLBACK;
        SET p_status_message = 'Không thể tạo tài khoản.';
        LEAVE create_staff_proc;
    END IF;

    -- 2. Cấp quyền SELECT cho tài khoản mới (sử dụng sp_grant_permissions_by_role đã sửa)
    CALL sp_grant_permissions_by_role(v_account_id);
    -- Lưu ý: Kiểm tra kết quả của sp_grant_permissions_by_role nếu cần

    -- 3. Tạo thông tin Employee sử dụng sp_insert_employee
    CALL sp_insert_employee(
            v_account_id,
            p_position,
            p_last_name,
            p_first_name,
            p_gender,
            p_phone,
            p_email,
            v_employee_id -- Use declared variable for OUT param
         );

    -- Kiểm tra lỗi sau khi gọi sp_insert_employee
    IF v_employee_id IS NULL OR v_employee_id <= 0 THEN
        ROLLBACK;
        SET p_status_message = 'Không thể tạo thông tin employee.';
        LEAVE create_staff_proc;
    END IF;

    -- Hoàn tất transaction
    COMMIT;

    -- Trả về kết quả
    SET p_new_account_id = v_account_id;
    SET p_status_message = 'Đã tạo tài khoản STAFF và cấp quyền thành công.'; -- Updated message slightly

END create_staff_proc// -- End labeled block

DELIMITER //

/**
 * Trigger bảo vệ tài khoản admin mặc định khỏi việc thay đổi username
 *
 * Chức năng: Ngăn chặn việc thay đổi username của tài khoản admin mặc định
 * Thực thi: Trước khi cập nhật bảng account
 * Kiểm tra:
 *   - Kiểm tra xem tài khoản có phải admin mặc định không
 *   - Nếu là admin mặc định và username bị thay đổi, sẽ báo lỗi
 * Mục đích: Đảm bảo an toàn cho tài khoản admin quan trọng nhất của hệ thống
 */
CREATE TRIGGER protect_default_admin_update
    BEFORE UPDATE
    ON account
    FOR EACH ROW
BEGIN
    DECLARE is_default_admin BOOLEAN;

    SELECT EXISTS(SELECT 1
                  FROM manager m
                           JOIN account a ON m.account_id = a.account_id
                  WHERE a.account_id = OLD.account_id
                    AND a.username = 'admin'
                    AND m.email = 'admin@milkteashop.com')
    INTO is_default_admin;

    IF is_default_admin AND NEW.username != 'admin' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể thay đổi username của tài khoản admin mặc định';
    END IF;
END //

/**
 * Trigger bảo vệ tài khoản admin mặc định khỏi việc xóa
 *
 * Chức năng: Ngăn chặn việc xóa tài khoản admin mặc định
 * Thực thi: Trước khi xóa bản ghi từ bảng account
 * Kiểm tra:
 *   - Kiểm tra xem tài khoản cần xóa có phải là admin mặc định không
 *   - Nếu là admin mặc định, sẽ báo lỗi và ngăn chặn việc xóa
 * Mục đích: Đảm bảo an toàn cho tài khoản admin quan trọng nhất của hệ thống
 */
CREATE TRIGGER protect_default_admin_delete
    BEFORE DELETE
    ON account
    FOR EACH ROW
BEGIN
    DECLARE is_default_admin BOOLEAN;

    SELECT EXISTS(SELECT 1
                  FROM manager m
                           JOIN account a ON m.account_id = a.account_id
                  WHERE a.account_id = OLD.account_id
                    AND a.username = 'admin'
                    AND m.email = 'admin@milkteashop.com')
    INTO is_default_admin;

    IF is_default_admin THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Không thể xóa tài khoản admin mặc định';
    END IF;
END //
# 
DELIMITER ;

-- Tạo Manager
SET @new_manager_id = NULL;
SET @manager_status = '';
CALL sp_create_manager_account(
        'admin',
        '{bcrypt}$2a$10$WMn1T29Wu7giJtgKJ11GruP95voXc9unATF.0GuCtpOcm8oqkxY92',
        'NGUYỄN NGỌC',
        'PHÚ',
        'MALE',
        '0987654321',
        'admin@milkteashop.com',
        @new_manager_id,
        @manager_status
     );
SELECT @new_manager_id AS manager_account_id, @manager_status AS status;

Tạo Staff
SET @new_staff_id = NULL;
SET @staff_status = '';
CALL sp_create_staff_account(
        'vanphong',
        '{bcrypt}$2a$10$WMn1T29Wu7giJtgKJ11GruP95voXc9unATF.0GuCtpOcm8oqkxY92',
        'Nhân Viên Bán Hàng',
        'Nguyễn Văn',
        'Phương',
        'MALE',
        '0985712345',
        'thpa@gmail.com',
        @new_staff_id,
        @staff_status
     );
SELECT @new_staff_id AS staff_account_id, @staff_status AS status;

CALL sp_create_staff_account('thanhphuong',
                             '{bcrypt}$2a$10$WMn1T29Wu7giJtgKJ11GruP95voXc9unATF.0GuCtpOcm8oqkxY92',
                             'Nhân Viên Bán Hàng',
                             'Nguyễn Thành',
                             'Phương',
                             'MALE',
                             '0981234567',
                             'thp@gmail.com',
                             @new_staff_id,
                             @staff_status);
SELECT @new_staff_id AS staff_account_id, @staff_status AS status;

