# Pos Ui

Cần thiết kế giao diện cho pos

## Yêu cầu

- Giao diện phải đẹp, responsive, dễ sử dụng.
- Ở phía bên phải là nơi thao tác:
  - Thêm, xóa thông tin khách hàng.
  - Thêm chương trình khuyến mãi bằng cách nhập mã khuyến mãi.
  - Hiển thị tổng tiền, thành tiền.
  - Có nút thanh toán.
- Khi Ấn vào nút thanh toán, sẽ chuyển đến trang thanh toán.
  - Hiển thị tiến trình gồm 3 bước:
    - xác nhận đơn hàng: gọi api tạo đơn hàng.
    - thanh toán: gọi api thanh toán.
    - hoàn thành: hiển thị hóa đơn.
    Có thể hủy đơn hàng ở bước thanh toán.

