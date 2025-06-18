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

-- ================================================================================================================
-- TRIGGER TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
-- ================================================================================================================

-- Trigger tự động chuyển order status sang COMPLETED khi thanh toán PAID
CREATE OR REPLACE FUNCTION auto_complete_order_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra nếu thanh toán được cập nhật thành PAID
    IF NEW.status = 'PAID' AND (OLD.status IS NULL OR OLD.status != 'PAID') THEN
        -- Cập nhật trạng thái đơn hàng thành COMPLETED
        UPDATE "order" 
        SET status = 'COMPLETED', 
            updated_at = CURRENT_TIMESTAMP
        WHERE order_id = NEW.order_id 
          AND status != 'CANCELLED'; -- Không cập nhật nếu đơn hàng đã bị hủy
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_complete_order_on_payment_trigger
    AFTER UPDATE ON payment
    FOR EACH ROW EXECUTE FUNCTION auto_complete_order_on_payment();

-- Trigger tự động chuyển order status sang COMPLETED khi thêm thanh toán PAID mới
CREATE OR REPLACE FUNCTION auto_complete_order_on_payment_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra nếu thanh toán mới được thêm với trạng thái PAID
    IF NEW.status = 'PAID' THEN
        -- Cập nhật trạng thái đơn hàng thành COMPLETED
        UPDATE "order" 
        SET status = 'COMPLETED', 
            updated_at = CURRENT_TIMESTAMP
        WHERE order_id = NEW.order_id 
          AND status != 'CANCELLED'; -- Không cập nhật nếu đơn hàng đã bị hủy
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_complete_order_on_payment_insert_trigger
    AFTER INSERT ON payment
    FOR EACH ROW EXECUTE FUNCTION auto_complete_order_on_payment_insert();

-- Trigger tự động hủy các thanh toán đang PROCESSING khi đơn hàng bị hủy
CREATE OR REPLACE FUNCTION auto_cancel_processing_payments()
RETURNS TRIGGER AS $$
BEGIN
    -- Kiểm tra nếu đơn hàng được cập nhật thành CANCELLED
    IF NEW.status = 'CANCELLED' AND (OLD.status IS NULL OR OLD.status != 'CANCELLED') THEN
        -- Cập nhật tất cả thanh toán đang PROCESSING thành CANCELLED
        UPDATE payment 
        SET status = 'CANCELLED', 
            updated_at = CURRENT_TIMESTAMP
        WHERE order_id = NEW.order_id 
          AND status = 'PROCESSING';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_cancel_processing_payments_trigger
    AFTER UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION auto_cancel_processing_payments();

-- ================================================================================================================
-- TRIGGER CỘNG ĐIỂM VÀ CẬP NHẬT SỐ LẦN SỬ DỤNG KHUYẾN MÃI
-- ================================================================================================================

-- Trigger tự động cộng điểm cho khách hàng và tăng số lần sử dụng khuyến mãi khi đơn hàng COMPLETED
CREATE OR REPLACE FUNCTION reward_customer_and_update_discount_usage()
RETURNS TRIGGER AS $$
DECLARE
    discount_record RECORD;
BEGIN
    -- Kiểm tra nếu đơn hàng được cập nhật thành COMPLETED
    IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
        
        -- 1. Cộng điểm cho khách hàng (nếu có customer_id)
        IF NEW.customer_id IS NOT NULL THEN
            UPDATE customer 
            SET current_points = COALESCE(current_points, 0) + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = NEW.customer_id;
        END IF;
        
        -- 2. Tăng số lần sử dụng cho tất cả chương trình khuyến mãi được áp dụng trong đơn hàng
        FOR discount_record IN 
            SELECT DISTINCT d.discount_id 
            FROM discount d
            INNER JOIN order_discount od ON d.discount_id = od.discount_id
            WHERE od.order_id = NEW.order_id
        LOOP
            UPDATE discount 
            SET current_uses = COALESCE(current_uses, 0) + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE discount_id = discount_record.discount_id;
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reward_customer_and_update_discount_usage_trigger
    AFTER UPDATE ON "order"
    FOR EACH ROW EXECUTE FUNCTION reward_customer_and_update_discount_usage();

-- Trigger tự động cộng điểm cho khách hàng và tăng số lần sử dụng khuyến mãi khi thêm đơn hàng COMPLETED mới
CREATE OR REPLACE FUNCTION reward_customer_and_update_discount_usage_insert()
RETURNS TRIGGER AS $$
DECLARE
    discount_record RECORD;
BEGIN
    -- Kiểm tra nếu đơn hàng mới được thêm với trạng thái COMPLETED
    IF NEW.status = 'COMPLETED' THEN
        
        -- 1. Cộng điểm cho khách hàng (nếu có customer_id)
        IF NEW.customer_id IS NOT NULL THEN
            UPDATE customer 
            SET current_points = COALESCE(current_points, 0) + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE customer_id = NEW.customer_id;
        END IF;
        
        -- 2. Tăng số lần sử dụng cho tất cả chương trình khuyến mãi được áp dụng trong đơn hàng
        FOR discount_record IN 
            SELECT DISTINCT d.discount_id 
            FROM discount d
            INNER JOIN order_discount od ON d.discount_id = od.discount_id
            WHERE od.order_id = NEW.order_id
        LOOP
            UPDATE discount 
            SET current_uses = COALESCE(current_uses, 0) + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE discount_id = discount_record.discount_id;
        END LOOP;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reward_customer_and_update_discount_usage_insert_trigger
    AFTER INSERT ON "order"
    FOR EACH ROW EXECUTE FUNCTION reward_customer_and_update_discount_usage_insert();
