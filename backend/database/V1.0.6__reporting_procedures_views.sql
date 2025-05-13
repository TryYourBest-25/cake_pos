-- File: src/main/resources/db/migration/dev/V1.0.6__reporting_procedures_views.sql
-- Chứa các Stored Procedures và Views phục vụ mục đích báo cáo.

-- Bắt đầu với Stored Procedures

-- Ví dụ: Procedure báo cáo doanh thu theo khoảng thời gian
DELIMITER //

CREATE PROCEDURE sp_report_revenue_by_date_range(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT
        DATE(o.order_time) AS report_date,
        COUNT(o.order_id) AS total_orders,
        SUM(o.total_amount) AS total_revenue_before_discount,
        SUM(IFNULL(od.total_discount, 0)) AS total_discount_applied, -- Use IFNULL for orders without discounts
        SUM(o.final_amount) AS total_final_revenue
    FROM `order` o
             LEFT JOIN (
        SELECT
            order_id,
            SUM(discount_amount) AS total_discount
        FROM order_discount
        GROUP BY order_id
    ) od ON o.order_id = od.order_id
    WHERE o.status = 'COMPLETED' -- Chỉ tính các đơn hàng đã hoàn thành
      AND DATE(o.order_time) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(o.order_time)
    ORDER BY report_date;
END //

DELIMITER ;

-- Thêm các procedures báo cáo khác vào đây...

-- Procedure báo cáo doanh thu theo nhân viên trong khoảng thời gian
DELIMITER //

CREATE PROCEDURE sp_report_revenue_by_employee(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT
        e.employee_id,
        CONCAT(e.last_name, ' ', e.first_name) AS employee_name,
        e.position,
        COUNT(o.order_id) AS total_orders_handled,
        SUM(IFNULL(o.final_amount, 0)) AS total_revenue_generated -- Summing final amount handled by employee
    FROM employee e
             JOIN `order` o ON e.employee_id = o.employee_id
    WHERE o.status = 'COMPLETED'
      AND DATE(o.order_time) BETWEEN p_start_date AND p_end_date
    GROUP BY e.employee_id, employee_name, e.position
    ORDER BY total_revenue_generated DESC, employee_name;
END //

DELIMITER ;


-- Procedure báo cáo top sản phẩm bán chạy (theo số lượng) trong khoảng thời gian
DELIMITER //

CREATE PROCEDURE sp_report_top_selling_products(
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_limit INT -- Số lượng sản phẩm top muốn hiển thị
)
BEGIN
    SELECT
        p.product_id,
        p.name AS product_name,
        ps.name AS size_name, -- Include size name
        uom.symbol AS unit_symbol, -- Include unit symbol
        SUM(op.quantity) AS total_quantity_sold,
        SUM(op.quantity * pp.price) AS total_revenue_from_product
    FROM order_product op
             JOIN `order` o ON op.order_id = o.order_id
             JOIN product_price pp ON op.product_price_id = pp.product_price_id
             JOIN product p ON pp.product_id = p.product_id
             JOIN product_size ps ON pp.size_id = ps.size_id -- Join to get size name
             JOIN unit_of_measure uom ON ps.unit_id = uom.unit_id -- Join to get unit symbol
    WHERE o.status = 'COMPLETED'
      AND DATE(o.order_time) BETWEEN p_start_date AND p_end_date
    GROUP BY p.product_id, p.name, ps.name, uom.symbol -- Group by product and size
    ORDER BY total_quantity_sold DESC
    LIMIT p_limit;
END //

DELIMITER ;


-- Thêm các procedures báo cáo khác vào đây... 