-- ================================================================================================================
-- TRIGGER BẢO VỆ TRẠNG THÁI ĐƠN HÀNG VÀ THANH TOÁN
-- ================================================================================================================

-- Trigger bảo vệ cập nhật đơn hàng khi đã hủy hoặc hoàn thành
CREATE OR REPLACE FUNCTION protect_order_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra nếu đơn hàng đã bị hủy hoặc hoàn thành
    IF OLD.status IN ('CANCELLED', 'COMPLETED') THEN
        -- Cho phép cập nhật employee_id và customer_id thành null bất kể trạng thái
        IF (NEW.employee_id IS DISTINCT FROM OLD.employee_id AND NEW.employee_id IS NOT NULL) OR
           (NEW.customer_id IS DISTINCT FROM OLD.customer_id AND NEW.customer_id IS NOT NULL) OR
           (NEW.order_id IS DISTINCT FROM OLD.order_id) OR
           (NEW.order_time IS DISTINCT FROM OLD.order_time) OR
           (NEW.total_amount IS DISTINCT FROM OLD.total_amount) OR
           (NEW.final_amount IS DISTINCT FROM OLD.final_amount) OR
           (NEW.status IS DISTINCT FROM OLD.status) OR
           (NEW.customize_note IS DISTINCT FROM OLD.customize_note) THEN
            RAISE EXCEPTION 'Không thể cập nhật đơn hàng đã hủy hoặc hoàn thành. Chỉ được phép xóa thông tin nhân viên/khách hàng.' USING ERRCODE = '45000';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_order_status_update_trigger
    BEFORE UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION protect_order_status_update();

-- Trigger bảo vệ xóa đơn hàng khi đã hoàn thành
CREATE OR REPLACE FUNCTION protect_order_status_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Không cho phép xóa đơn hàng đã hoàn thành
    IF OLD.status = 'COMPLETED' THEN
        RAISE EXCEPTION 'Không thể xóa đơn hàng đã hoàn thành' USING ERRCODE = '45000';
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_order_status_delete_trigger
    BEFORE DELETE ON "order"
    FOR EACH ROW EXECUTE FUNCTION protect_order_status_delete();

-- ================================================================================================================
-- TRIGGER BẢO VỆ TRẠNG THÁI THANH TOÁN
-- ================================================================================================================

-- Trigger bảo vệ cập nhật thanh toán khi đã hủy hoặc đã thanh toán
CREATE OR REPLACE FUNCTION protect_payment_status_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra nếu thanh toán đã bị hủy hoặc đã hoàn tất
    IF OLD.status IN ('CANCELLED', 'PAID') THEN
        RAISE EXCEPTION 'Không thể cập nhật thanh toán đã hủy hoặc đã hoàn tất' USING ERRCODE = '45000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_payment_status_update_trigger
    BEFORE UPDATE ON payment
    FOR EACH ROW EXECUTE FUNCTION protect_payment_status_update();

-- Trigger bảo vệ xóa thanh toán khi đã hoàn tất
CREATE OR REPLACE FUNCTION protect_payment_status_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Không cho phép xóa thanh toán đã hoàn tất
    IF OLD.status = 'PAID' THEN
        RAISE EXCEPTION 'Không thể xóa thanh toán đã hoàn tất' USING ERRCODE = '45000';
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_payment_status_delete_trigger
    BEFORE DELETE ON payment
    FOR EACH ROW EXECUTE FUNCTION protect_payment_status_delete();

-- ================================================================================================================
-- TRIGGER BẢO VỆ CHI TIẾT ĐƠN HÀNG VÀ GIẢM GIÁ
-- ================================================================================================================

-- Trigger bảo vệ cập nhật chi tiết đơn hàng khi đơn hàng đã hủy hoặc hoàn thành
CREATE OR REPLACE FUNCTION protect_order_product_update()
RETURNS TRIGGER AS $$
DECLARE
    order_status_val order_status_enum;
BEGIN
    -- Lấy trạng thái đơn hàng
    SELECT status INTO order_status_val FROM "order" WHERE order_id = NEW.order_id;
    
    -- Kiểm tra nếu đơn hàng đã bị hủy hoặc hoàn thành
    IF order_status_val IN ('CANCELLED', 'COMPLETED') THEN
        RAISE EXCEPTION 'Không thể cập nhật chi tiết đơn hàng đã hủy hoặc hoàn thành' USING ERRCODE = '45000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_order_product_update_trigger
    BEFORE UPDATE ON order_product
    FOR EACH ROW EXECUTE FUNCTION protect_order_product_update();

-- Trigger bảo vệ thêm chi tiết đơn hàng khi đơn hàng đã hủy hoặc hoàn thành
CREATE OR REPLACE FUNCTION protect_order_product_insert()
RETURNS TRIGGER AS $$
DECLARE
    order_status_val order_status_enum;
BEGIN
    -- Lấy trạng thái đơn hàng
    SELECT status INTO order_status_val FROM "order" WHERE order_id = NEW.order_id;
    
    -- Kiểm tra nếu đơn hàng đã bị hủy hoặc hoàn thành
    IF order_status_val IN ('CANCELLED', 'COMPLETED') THEN
        RAISE EXCEPTION 'Không thể thêm sản phẩm vào đơn hàng đã hủy hoặc hoàn thành' USING ERRCODE = '45000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_order_product_insert_trigger
    BEFORE INSERT ON order_product
    FOR EACH ROW EXECUTE FUNCTION protect_order_product_insert();

-- Trigger bảo vệ cập nhật giảm giá đơn hàng khi đơn hàng đã hủy hoặc hoàn thành
CREATE OR REPLACE FUNCTION protect_order_discount_update()
RETURNS TRIGGER AS $$
DECLARE
    order_status_val order_status_enum;
BEGIN
    -- Lấy trạng thái đơn hàng
    SELECT status INTO order_status_val FROM "order" WHERE order_id = NEW.order_id;
    
    -- Kiểm tra nếu đơn hàng đã bị hủy hoặc hoàn thành
    IF order_status_val IN ('CANCELLED', 'COMPLETED') THEN
        RAISE EXCEPTION 'Không thể cập nhật giảm giá cho đơn hàng đã hủy hoặc hoàn thành' USING ERRCODE = '45000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_order_discount_update_trigger
    BEFORE UPDATE ON order_discount
    FOR EACH ROW EXECUTE FUNCTION protect_order_discount_update();

-- Trigger bảo vệ thêm giảm giá đơn hàng khi đơn hàng đã hủy hoặc hoàn thành
CREATE OR REPLACE FUNCTION protect_order_discount_insert()
RETURNS TRIGGER AS $$
DECLARE
    order_status_val order_status_enum;
BEGIN
    -- Lấy trạng thái đơn hàng
    SELECT status INTO order_status_val FROM "order" WHERE order_id = NEW.order_id;
    
    -- Kiểm tra nếu đơn hàng đã bị hủy hoặc hoàn thành
    IF order_status_val IN ('CANCELLED', 'COMPLETED') THEN
        RAISE EXCEPTION 'Không thể áp dụng giảm giá cho đơn hàng đã hủy hoặc hoàn thành' USING ERRCODE = '45000';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protect_order_discount_insert_trigger
    BEFORE INSERT ON order_discount
    FOR EACH ROW EXECUTE FUNCTION protect_order_discount_insert();
