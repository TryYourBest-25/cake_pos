SET search_path = public;

CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE order_status_enum AS ENUM ('PROCESSING', 'CANCELLED', 'COMPLETED');
CREATE TYPE payment_status_enum AS ENUM ('PROCESSING', 'CANCELLED', 'PAID');

create table category
(
    category_id SMALLSERIAL primary key,
    name        varchar(100)                        not null,
    description varchar(1000)                       null,
    created_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_category_name unique (name)
);

COMMENT ON COLUMN category.category_id IS 'Mã danh mục';
COMMENT ON COLUMN category.name IS 'Tên danh mục';
COMMENT ON COLUMN category.description IS 'Mô tả danh mục';

create table coupon
(
    coupon_id   SERIAL primary key,
    coupon      varchar(15)                         not null,
    description varchar(1000)                       null,
    created_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_coupon_coupon unique (coupon)
);

COMMENT ON COLUMN coupon.coupon_id IS 'Mã coupon';
COMMENT ON COLUMN coupon.coupon IS 'Mã giảm giá';
COMMENT ON COLUMN coupon.description IS 'Mô tả';
COMMENT ON COLUMN coupon.created_at IS 'Ngày tạo';

create table discount
(
    discount_id              SERIAL primary key,
    name                     varchar(500)                        not null,
    description              varchar(1000)                       null,
    coupon_id                integer                             not null,
    discount_value           decimal(4, 1)                       not null,
    min_required_order_value integer                             not null,
    max_discount_amount      integer                             not null,
    min_required_product     smallint                            null,
    valid_from               TIMESTAMP                           null,
    valid_until              TIMESTAMP                           not null,
    current_uses             integer                             null,
    max_uses                 integer                             null,
    max_uses_per_customer    smallint                            null,
    is_active                BOOLEAN   default true              not null,
    created_at               TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at               TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_discount_coupon_id unique (coupon_id),
    constraint uk_discount_name unique (name),
    constraint chk_discount_value_positive check (discount_value >= 0 and discount_value <= 100),
    constraint fk_discount_coupon foreign key (coupon_id) references coupon (coupon_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON COLUMN discount.discount_id IS 'Mã định danh duy nhất cho chương trình giảm giá';
COMMENT ON COLUMN discount.coupon_id IS 'Liên kết với mã giảm giá (coupon), NULL nếu không yêu cầu mã giảm giá';
COMMENT ON COLUMN discount.discount_value IS 'Giá trị giảm giá (phần trăm hoặc số tiền cố định)';
COMMENT ON COLUMN discount.min_required_order_value IS 'Gái trị đơn hàng tối thiểu có thể áp dụng';
COMMENT ON COLUMN discount.max_discount_amount IS 'Giới hạn số tiền giảm giá tối đa, NULL nếu không giới hạn';
COMMENT ON COLUMN discount.min_required_product IS 'Số lượng sản phẩm tối thiểu cần mua để khuyến mãi';
COMMENT ON COLUMN discount.valid_from IS 'Thời điểm bắt đầu hiệu lực của chương trình giảm giá';
COMMENT ON COLUMN discount.valid_until IS 'Thời điểm kết thúc hiệu lực của chương trình giảm giá';
COMMENT ON COLUMN discount.current_uses IS 'Số lần đã sử dụng chương trình giảm giá này';
COMMENT ON COLUMN discount.max_uses IS 'Số lần sử dụng tối đa cho chương trình giảm giá, NULL nếu không giới hạn';
COMMENT ON COLUMN discount.max_uses_per_customer IS 'Số lần tối đa mỗi khách hàng được sử dụng chương trình giảm giá này, NULL nếu không giới hạn';
COMMENT ON COLUMN discount.is_active IS 'Trạng thái kích hoạt: TRUE - đang hoạt động, FALSE - không hoạt động';
COMMENT ON COLUMN discount.created_at IS 'Thời điểm tạo chương trình giảm giá';
COMMENT ON COLUMN discount.updated_at IS 'Thời điểm cập nhật gần nhất';

create table membership_type
(
    membership_type_id SMALLSERIAL primary key,
    type               varchar(50)                         not null,
    discount_value     decimal(4, 1)                       not null,
    required_point     integer                             not null,
    description        varchar(255)                        null,
    valid_until        TIMESTAMP                           null,
    is_active          BOOLEAN   default true              null,
    created_at         TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at         TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint chk_discount_value_positive check (discount_value >= 0 and discount_value <= 100),
    constraint uk_membership_type_type unique (type),
    constraint uk_membership_type_required_point unique (required_point)
);

COMMENT ON COLUMN membership_type.membership_type_id IS 'Mã loại thành viên';
COMMENT ON COLUMN membership_type.type IS 'Loại thành viên';
COMMENT ON COLUMN membership_type.discount_value IS 'Giá trị giảm giá';
COMMENT ON COLUMN membership_type.required_point IS 'Điểm yêu cầu';
COMMENT ON COLUMN membership_type.description IS 'Mô tả';
COMMENT ON COLUMN membership_type.valid_until IS 'Thời gian hết hạn';
COMMENT ON COLUMN membership_type.is_active IS 'Trạng thái (TRUE: Hoạt động, FALSE: Không hoạt động)';

create table payment_method
(
    payment_method_id SMALLSERIAL primary key,
    name              varchar(50)                         not null,
    description       varchar(255)                        null,
    created_at        TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at        TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_payment_method_name unique (name)
);

COMMENT ON COLUMN payment_method.payment_method_id IS 'Mã phương thức thanh toán';
COMMENT ON COLUMN payment_method.name IS 'Tên phương thức thanh toán';
COMMENT ON COLUMN payment_method.description IS 'Mô tả phương thức thanh toán';

create table product
(
    product_id   SERIAL primary key,
    category_id  smallint                            null,
    name         varchar(100)                        not null,
    description  varchar(1000)                       null,
    is_signature BOOLEAN   default false             null,
    image_path   varchar(1000)                       null,
    created_at   TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at   TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_product_name unique (name),
    constraint fk_product_category foreign key (category_id) references category (category_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

COMMENT ON COLUMN product.product_id IS 'Mã sản phẩm';
COMMENT ON COLUMN product.category_id IS 'Mã danh mục';
COMMENT ON COLUMN product.name IS 'Tên sản phẩm';
COMMENT ON COLUMN product.description IS 'Mô tả sản phẩm';
COMMENT ON COLUMN product.is_signature IS 'Sản phẩm đặc trưng (TRUE: Có, FALSE: Không)';
COMMENT ON COLUMN product.image_path IS 'Đường dẫn mô tả hình ảnh';
COMMENT ON COLUMN product.created_at IS 'Thời gian tạo';
COMMENT ON COLUMN product.updated_at IS 'Thời gian cập nhật';

create table role
(
    role_id     SMALLSERIAL primary key,
    name        varchar(50)                         not null,
    description varchar(1000)                       null,
    CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 50),
    created_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_role_name unique (name)
);

COMMENT ON COLUMN role.role_id IS 'Mã vai trò';
COMMENT ON COLUMN role.name IS 'Tên vai trò (ví dụ: admin, staff, customer)';
COMMENT ON COLUMN role.description IS 'Mô tả vai trò';

create table account
(
    account_id    SERIAL primary key,
    role_id       smallint                            not null,
    username      varchar(50)                         not null,
    password_hash varchar(255)                        not null,
    is_active     BOOLEAN   default false             null,
    is_locked     BOOLEAN   default false             not null,
    last_login    TIMESTAMP                           null,
    refresh_token varchar(255)                        null,
    created_at    TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at    TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_account_username unique (username),
    constraint fk_account_role foreign key (role_id) references role (role_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON COLUMN account.account_id IS 'Mã tài khoản';
COMMENT ON COLUMN account.role_id IS 'Mã vai trò';
COMMENT ON COLUMN account.username IS 'Tên đăng nhập';
COMMENT ON COLUMN account.password_hash IS 'Mật khẩu đã mã hóa';
COMMENT ON COLUMN account.is_active IS 'Tài khoản hoạt động (TRUE: Có, FALSE: Không)';
COMMENT ON COLUMN account.is_locked IS 'Tài khoản có bị khóa hay không (Có: TRUE, Không:FALSE)';
COMMENT ON COLUMN account.last_login IS 'Lần đăng nhập cuối';
COMMENT ON COLUMN account.refresh_token IS 'Refresh token';
COMMENT ON COLUMN account.created_at IS 'Thời gian tạo';
COMMENT ON COLUMN account.updated_at IS 'Thời gian cập nhật';

create table customer
(
    customer_id        SERIAL primary key,
    membership_type_id smallint                            not null,
    account_id         integer                             null,
    last_name          varchar(70)                         null,
    first_name         varchar(70)                         null,
    phone              varchar(15)                         not null,
    current_points     integer   default 0                 null,
    gender             gender_enum                         null,
    created_at         TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at         TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_customer_phone unique (phone),
    constraint fk_customer_membership_type foreign key (membership_type_id) references membership_type (membership_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    constraint fk_customer_account foreign key (account_id) references account (account_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

COMMENT ON COLUMN customer.customer_id IS 'Mã khách hàng';
COMMENT ON COLUMN customer.membership_type_id IS 'Mã loại thành viên';
COMMENT ON COLUMN customer.account_id IS 'Mã tài khoản';
COMMENT ON COLUMN customer.last_name IS 'Họ';
COMMENT ON COLUMN customer.first_name IS 'Tên';
COMMENT ON COLUMN customer.phone IS 'Số điện thoại';
COMMENT ON COLUMN customer.current_points IS 'Điểm hiện tại';
COMMENT ON COLUMN customer.gender IS 'Giới tính';
COMMENT ON COLUMN customer.created_at IS 'Ngày tạo';
COMMENT ON COLUMN customer.updated_at IS 'Ngày cập nhật';

CREATE INDEX idx_customer_account_id ON customer (account_id);
CREATE INDEX idx_customer_membership_type_id ON customer (membership_type_id);

create table employee
(
    employee_id SERIAL primary key,
    account_id  integer                             not null,
    position    varchar(50)                         not null,
    last_name   varchar(70)                         not null,
    first_name  varchar(70)                         not null,
    gender      gender_enum                         null,
    phone       varchar(15)                         not null,
    email       varchar(100)                        not null,
    created_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_employee_account_id unique (account_id),
    constraint uk_employee_email unique (email),
    constraint uk_employee_phone unique (phone),
    constraint fk_employee_account foreign key (account_id) references account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON COLUMN employee.employee_id IS 'Mã nhân viên';
COMMENT ON COLUMN employee.account_id IS 'Mã tài khoản';
COMMENT ON COLUMN employee.position IS 'Chức vụ';
COMMENT ON COLUMN employee.last_name IS 'Họ';
COMMENT ON COLUMN employee.first_name IS 'Tên';
COMMENT ON COLUMN employee.gender IS 'Giới tính';
COMMENT ON COLUMN employee.phone IS 'Số điện thoại';
COMMENT ON COLUMN employee.email IS 'Email';

create table manager
(
    manager_id SERIAL primary key,
    account_id integer                             not null,
    last_name  varchar(70)                         not null,
    first_name varchar(70)                         not null,
    gender     gender_enum                         null,
    phone      varchar(15)                         not null,
    email      varchar(100)                        not null,
    created_at TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_manager_account_id unique (account_id),
    constraint uk_manager_email unique (email),
    constraint uk_manager_phone unique (phone),
    constraint fk_manager_account foreign key (account_id) references account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON COLUMN manager.manager_id IS 'Mã quản lý';
COMMENT ON COLUMN manager.account_id IS 'Mã tài khoản';
COMMENT ON COLUMN manager.last_name IS 'Họ';
COMMENT ON COLUMN manager.first_name IS 'Tên';
COMMENT ON COLUMN manager.gender IS 'Giới tính';
COMMENT ON COLUMN manager.phone IS 'Số điện thoại';
COMMENT ON COLUMN manager.email IS 'Email';

create table "order"
(
    order_id       SERIAL primary key,
    customer_id    integer                             null,
    employee_id    integer                             not null,
    order_time     TIMESTAMP default CURRENT_TIMESTAMP null,
    total_amount   integer                             null,
    final_amount   integer                             null,
    status         order_status_enum                   null,
    customize_note varchar(1000)                       null,
    created_at     TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at     TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint fk_order_customer foreign key (customer_id) references customer (customer_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    constraint fk_order_employee foreign key (employee_id) references employee (employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON COLUMN "order".order_id IS 'Mã đơn hàng';
COMMENT ON COLUMN "order".customer_id IS 'Mã khách hàng';
COMMENT ON COLUMN "order".employee_id IS 'Mã nhân viên';
COMMENT ON COLUMN "order".order_time IS 'Thời gian đặt hàng';
COMMENT ON COLUMN "order".total_amount IS 'Tổng tiền';
COMMENT ON COLUMN "order".final_amount IS 'Thành tiền';
COMMENT ON COLUMN "order".status IS 'Trạng thái đơn hàng';
COMMENT ON COLUMN "order".customize_note IS 'Ghi chú tùy chỉnh';

CREATE INDEX idx_order_employee_id ON "order" (employee_id);
CREATE INDEX idx_order_customer_id ON "order" (customer_id);

create table order_discount
(
    order_discount_id SERIAL primary key,
    order_id          integer                             not null,
    discount_id       integer                             not null,
    discount_amount   integer                             not null,
    created_at        TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at        TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_order_discount_order_discount unique (order_id, discount_id),
    constraint fk_order_discount_order foreign key (order_id) references "order" (order_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_order_discount_discount foreign key (discount_id) references discount (discount_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON COLUMN order_discount.order_discount_id IS 'Mã giảm giá đơn hàng';
COMMENT ON COLUMN order_discount.order_id IS 'Mã đơn hàng áp dụng giảm giá';
COMMENT ON COLUMN order_discount.discount_id IS 'Mã chương trình giảm giá được áp dụng';
COMMENT ON COLUMN order_discount.discount_amount IS 'Số tiền giảm giá được áp dụng';

create table payment
(
    payment_id        SERIAL primary key,
    order_id          integer                                  not null,
    payment_method_id smallint                                 not null,
    status            payment_status_enum                      null,
    amount_paid       decimal(11, 3)                           null,
    change_amount     decimal(11, 3) default 0.000             null,
    payment_time      TIMESTAMP      default CURRENT_TIMESTAMP null,
    created_at        TIMESTAMP      default CURRENT_TIMESTAMP null,
    updated_at        TIMESTAMP      default CURRENT_TIMESTAMP null,
    constraint fk_payment_order foreign key (order_id) references "order" (order_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_payment_payment_method foreign key (payment_method_id) references payment_method (payment_method_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

COMMENT ON COLUMN payment.payment_id IS 'Mã thanh toán';
COMMENT ON COLUMN payment.order_id IS 'Mã đơn hàng';
COMMENT ON COLUMN payment.payment_method_id IS 'Mã phương thức thanh toán';
COMMENT ON COLUMN payment.status IS 'Trạng thái thanh toán';
COMMENT ON COLUMN payment.amount_paid IS 'Số tiền đã trả';
COMMENT ON COLUMN payment.change_amount IS 'Tiền thừa';
COMMENT ON COLUMN payment.payment_time IS 'Thời gian thanh toán';

CREATE INDEX idx_payment_order_id ON payment (order_id);
CREATE INDEX idx_payment_payment_method_id ON payment (payment_method_id);

create table store
(
    store_id     SMALLSERIAL primary key,
    name         varchar(100)                        not null,
    address      varchar(255)                        not null,
    phone        varchar(15)                         not null,
    opening_time time                                not null,
    closing_time time                                not null,
    email        varchar(100)                        not null,
    opening_date date                                not null,
    tax_code     varchar(20)                         not null,
    created_at   TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at   TIMESTAMP default CURRENT_TIMESTAMP null
);

COMMENT ON COLUMN store.store_id IS 'Mã cửa hàng';
COMMENT ON COLUMN store.name IS 'Tên cửa hàng';
COMMENT ON COLUMN store.address IS 'Địa chỉ';
COMMENT ON COLUMN store.phone IS 'Số điện thoại';
COMMENT ON COLUMN store.opening_time IS 'Thời gian mở cửa';
COMMENT ON COLUMN store.closing_time IS 'Thời gian đóng cửa';
COMMENT ON COLUMN store.email IS 'Email';
COMMENT ON COLUMN store.opening_date IS 'Ngày khai trương';
COMMENT ON COLUMN store.tax_code IS 'Mã số thuế';

create table product_size
(
    size_id     SMALLSERIAL primary key,
    name        varchar(5)                          not null,
    unit        varchar(15)                         not null,
    quantity    smallint                            not null,
    description varchar(1000)                       null,
    created_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at  TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_product_size_unit_name unique (unit, name)
);

COMMENT ON COLUMN product_size.size_id IS 'Mã kích thước';
COMMENT ON COLUMN product_size.name IS 'Tên kích thước (ví dụ: S, M, L)';
COMMENT ON COLUMN product_size.unit IS 'Đơn vị tính';
COMMENT ON COLUMN product_size.quantity IS 'Số lượng';
COMMENT ON COLUMN product_size.description IS 'Mô tả';

create table product_price
(
    product_price_id SERIAL primary key,
    product_id       integer                             not null,
    size_id          smallint                            not null,
    price            integer                             not null,
    is_active        boolean                             not null default TRUE,
    created_at       TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at       TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_product_price_product_size unique (product_id, size_id),
    constraint fk_product_price_product foreign key (product_id) references product (product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_product_price_product_size foreign key (size_id) references product_size (size_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON COLUMN product_price.product_price_id IS 'Mã giá sản phẩm';
COMMENT ON COLUMN product_price.product_id IS 'Mã sản phẩm';
COMMENT ON COLUMN product_price.size_id IS 'Mã kích thước';
COMMENT ON COLUMN product_price.price IS 'Giá';
COMMENT ON COLUMN product_price.is_active IS 'Trạng thái kích hoạt';
COMMENT ON COLUMN product_price.created_at IS 'Thời gian tạo';
COMMENT ON COLUMN product_price.updated_at IS 'Thời gian cập nhật';

CREATE INDEX idx_product_price_product_id ON product_price (product_id);
CREATE INDEX idx_product_price_size_id ON product_price (size_id);

create table order_product
(
    order_product_id SERIAL primary key,
    order_id         integer                             not null,
    product_price_id integer                             not null,
    quantity         smallint                            not null,
    "option"         varchar(500)                        null,
    created_at       TIMESTAMP default CURRENT_TIMESTAMP null,
    updated_at       TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint uk_order_product_order_product_price unique (order_id, product_price_id),
    constraint fk_order_product_order foreign key (order_id) references "order" (order_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_order_product_product_price foreign key (product_price_id) references product_price (product_price_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

COMMENT ON COLUMN order_product.order_product_id IS 'Mã chi tiết đơn hàng';
COMMENT ON COLUMN order_product.order_id IS 'Mã đơn hàng';
COMMENT ON COLUMN order_product.product_price_id IS 'Mã giá sản phẩm';
COMMENT ON COLUMN order_product.quantity IS 'Số lượng';
COMMENT ON COLUMN order_product."option" IS 'Tùy chọn cho việc lựa chọn lượng đá, đường ';

CREATE INDEX idx_order_product_order_id ON order_product (order_id);
CREATE INDEX idx_order_product_product_price_id ON order_product (product_price_id);




