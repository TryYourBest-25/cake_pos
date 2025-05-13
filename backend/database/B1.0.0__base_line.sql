create table category
(
    category_id        smallint unsigned auto_increment comment 'Mã danh mục' primary key,
    name               varchar(100)                       not null comment 'Tên danh mục',
    description        varchar(1000)                      null comment 'Mô tả danh mục',
    created_at         datetime default CURRENT_TIMESTAMP null,
    updated_at         datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_category_name unique (name)
);

create table coupon
(
    coupon_id   int unsigned auto_increment comment 'Mã coupon' primary key,
    coupon      varchar(15)                        not null comment 'Mã giảm giá',
    description varchar(1000)                      null comment 'Mô tả',
    created_at  datetime default CURRENT_TIMESTAMP null comment 'Ngày tạo',
    updated_at  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_coupon_coupon unique (coupon)
);

create table discount
(
    discount_id              int unsigned auto_increment comment 'Mã định danh duy nhất cho chương trình giảm giá' primary key,
    name                     varchar(500)                         not null,
    description              varchar(1000)                        null,
    coupon_id                int unsigned                         not null comment 'Liên kết với mã giảm giá (coupon), NULL nếu không yêu cầu mã giảm giá',
    discount_value           decimal(11, 3)                       not null comment 'Giá trị giảm giá (phần trăm hoặc số tiền cố định)',
    discount_type            enum ('FIXED', 'PERCENTAGE')         not null comment 'Loại giảm giá enum ("PERCENTAGE", "FIXED")',
    min_required_order_value decimal(11, 3)                       not null comment 'Gái trị đơn hàng tối thiểu có thể áp dụng',
    max_discount_amount      decimal(11, 3)                       not null comment 'Giới hạn số tiền giảm giá tối đa, NULL nếu không giới hạn',
    min_required_product     smallint unsigned                    null comment 'Số lượng sản phẩm tối thiểu cần mua để khuyến mãi',
    valid_from               datetime                             null comment 'Thời điểm bắt đầu hiệu lực của chương trình giảm giá',
    valid_until              datetime                             not null comment 'Thời điểm kết thúc hiệu lực của chương trình giảm giá',
    current_uses             int unsigned                         null comment 'Số lần đã sử dụng chương trình giảm giá này',
    max_uses                 int unsigned                         null comment 'Số lần sử dụng tối đa cho chương trình giảm giá, NULL nếu không giới hạn',
    max_uses_per_customer    smallint unsigned                    null comment 'Số lần tối đa mỗi khách hàng được sử dụng chương trình giảm giá này, NULL nếu không giới hạn',
    is_active                tinyint(1) default 1                 not null comment 'Trạng thái kích hoạt: 1 - đang hoạt động, 0 - không hoạt động',
    created_at               datetime   default CURRENT_TIMESTAMP null comment 'Thời điểm tạo chương trình giảm giá',
    updated_at               datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment 'Thời điểm cập nhật gần nhất',
    constraint uk_discount_coupon_id unique (coupon_id),
    constraint uk_discount_name unique (name),
    constraint fk_discount_coupon foreign key (coupon_id) references coupon (coupon_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

create table membership_type
(
    membership_type_id tinyint unsigned auto_increment comment 'Mã loại thành viên' primary key,
    type               varchar(50)                          not null comment 'Loại thành viên',
    discount_value     decimal(10, 3)                       not null comment 'Giá trị giảm giá',
    discount_unit      enum ('FIXED', 'PERCENTAGE')         not null comment 'Đơn vị giảm giá (PERCENT, FIXED)',
    required_point     int                                  not null comment 'Điểm yêu cầu',
    description        varchar(255)                         null comment 'Mô tả',
    valid_until        datetime                             null comment 'Ngày hết hạn',
    is_active          tinyint(1) default 1                 null comment 'Trạng thái (1: Hoạt động, 0: Không hoạt động)',
    created_at         datetime   default CURRENT_TIMESTAMP null,
    updated_at         datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_membership_type_type unique (type),
    constraint uk_membership_type_required_point unique (required_point)
);

create table payment_method
(
    payment_method_id   tinyint unsigned auto_increment comment 'Mã phương thức thanh toán' primary key,
    payment_name        varchar(50)                        not null comment 'Tên phương thức thanh toán',
    payment_description varchar(255)                       null comment 'Mô tả phương thức thanh toán',
    created_at          datetime default CURRENT_TIMESTAMP null,
    updated_at          datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_payment_method_payment_name unique (payment_name)
);

create table product
(
    product_id   mediumint unsigned auto_increment comment 'Mã sản phẩm' primary key,
    category_id  smallint unsigned                    null comment 'Mã danh mục',
    name         varchar(100)                         not null comment 'Tên sản phẩm',
    description  varchar(1000)                        null comment 'Mô tả sản phẩm',
    is_signature tinyint(1) default 0                 null comment 'Sản phẩm đặc trưng (1: Có, 0: Không)',
    image_path   varchar(1000)                        null comment 'Đường dẫn mô tả hình ảnh',
    created_at   datetime   default CURRENT_TIMESTAMP null comment 'Thời gian tạo',
    updated_at   datetime   default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment 'Thời gian cập nhật',
    index idx_product_category_id (category_id),
    constraint uk_product_name unique (name),
    constraint fk_product_category foreign key (category_id) references category (category_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

create table role
(
    role_id     tinyint unsigned auto_increment comment 'Mã vai trò' primary key,
    name        varchar(50)                        not null comment 'Tên vai trò (ví dụ: admin, staff, customer)',
    description varchar(1000)                      null comment 'Mô tả vai trò',
    CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 50),
    created_at  datetime default CURRENT_TIMESTAMP null,
    updated_at  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_role_name unique (name)
);

create table account
(
    account_id    int unsigned auto_increment comment 'Mã tài khoản' primary key,
    role_id       tinyint unsigned                       not null comment 'Mã vai trò',
    username      varchar(50)                            not null comment 'Tên đăng nhập',
    password_hash varchar(255)                           not null comment 'Mật khẩu đã mã hóa',
    is_active     tinyint(1)   default 0                 null comment 'Tài khoản hoạt động (1: Có, 0: Không)',
    is_locked     tinyint(1)   default 0                 not null comment 'Tài khoản có bị khóa hay không (Có: 1, Không:0)',
    last_login    timestamp                              null comment 'Lần đăng nhập cuối',
    token_version int unsigned default '0'               not null comment 'Kiểm tra tính hợp lệ của token',
    created_at    datetime     default CURRENT_TIMESTAMP null comment 'Thời gian tạo',
    updated_at    datetime     default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment 'Thời gian cập nhật',
    constraint uk_account_username unique (username),
    index idx_account_role_id (role_id),
    constraint fk_account_role foreign key (role_id) references role (role_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

create table customer
(
    customer_id        int unsigned auto_increment comment 'Mã khách hàng' primary key,
    membership_type_id tinyint unsigned                    not null comment 'Mã loại thành viên',
    account_id         int unsigned                        null comment 'Mã tài khoản',
    last_name          varchar(70)                         null comment 'Họ',
    first_name         varchar(70)                         null comment 'Tên',
    phone              varchar(15)                         not null comment 'Số điện thoại',
    email              varchar(100)                        null comment 'Email',
    current_points     int       default 0                 null comment 'Điểm hiện tại',
    gender             enum ('MALE', 'FEMALE', 'OTHER')    null comment 'Giới tính',
    created_at         timestamp default CURRENT_TIMESTAMP null comment 'Ngày tạo',
    updated_at         timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment 'Ngày cập nhật',
    constraint uk_customer_email unique (email),
    constraint uk_customer_phone unique (phone),
    index idx_customer_account_id (account_id),
    index idx_customer_membership_type_id (membership_type_id),
    constraint fk_customer_membership_type foreign key (membership_type_id) references membership_type (membership_type_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    constraint fk_customer_account foreign key (account_id) references account (account_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

create table employee
(
    employee_id int unsigned auto_increment comment 'Mã nhân viên' primary key,
    account_id  int unsigned                       not null comment 'Mã tài khoản',
    position    varchar(50)                        not null comment 'Chức vụ',
    last_name   varchar(70)                        not null comment 'Họ',
    first_name  varchar(70)                        not null comment 'Tên',
    gender      enum ('MALE', 'FEMALE', 'OTHER')   null comment 'Giới tính',
    phone       varchar(15)                        not null comment 'Số điện thoại',
    email       varchar(100)                       not null comment 'Email',
    created_at  datetime default CURRENT_TIMESTAMP null,
    updated_at  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_employee_account_id unique (account_id),
    constraint uk_employee_email unique (email),
    constraint uk_employee_phone unique (phone),
    constraint fk_employee_account foreign key (account_id) references account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

create table manager
(
    manager_id int unsigned auto_increment comment 'Mã quản lý' primary key,
    account_id int unsigned                       not null comment 'Mã tài khoản',
    last_name  varchar(70)                        not null comment 'Họ',
    first_name varchar(70)                        not null comment 'Tên',
    gender     enum ('MALE', 'FEMALE', 'OTHER')   null comment 'Giới tính',
    phone      varchar(15)                        not null comment 'Số điện thoại',
    email      varchar(100)                       not null comment 'Email',
    created_at datetime default CURRENT_TIMESTAMP null,
    updated_at datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_manager_account_id unique (account_id),
    constraint uk_manager_email unique (email),
    constraint uk_manager_phone unique (phone),
    constraint fk_manager_account foreign key (account_id) references account (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

create table `order`
(
    order_id       int unsigned auto_increment comment 'Mã đơn hàng' primary key,
    customer_id    int unsigned                                  null comment 'Mã khách hàng',
    employee_id    int unsigned                                  not null comment 'Mã nhân viên',
    order_time     timestamp    default CURRENT_TIMESTAMP        null comment 'Thời gian đặt hàng',
    total_amount   decimal(11, 3)                                null comment 'Tổng tiền',
    final_amount   decimal(11, 3)                                null comment 'Thành tiền',
    status         enum ('PROCESSING', 'CANCELLED', 'COMPLETED') null comment 'Trạng thái đơn hàng',
    customize_note varchar(1000)                                 null comment 'Ghi chú tùy chỉnh',
    point          int unsigned default '1'                      null,
    created_at     datetime     default CURRENT_TIMESTAMP        null,
    updated_at     datetime     default CURRENT_TIMESTAMP        null on update CURRENT_TIMESTAMP,
    index idx_order_employee_id (employee_id),
    constraint fk_order_customer foreign key (customer_id) references customer (customer_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    constraint fk_order_employee foreign key (employee_id) references employee (employee_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

create table order_discount
(
    order_discount_id int unsigned auto_increment comment 'Mã giảm giá đơn hàng' primary key,
    order_id          int unsigned                       not null comment 'Mã đơn  hàng áp dụng giảm giá',
    discount_id       int unsigned                       not null comment 'Mã chương trình giảm giá được áp dụng',
    discount_amount   decimal(11, 3)                     not null comment 'Số tiền giảm giá được áp dụng',
    created_at        datetime default CURRENT_TIMESTAMP null,
    updated_at        datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_order_discount_order_discount unique (order_id, discount_id),
    constraint fk_order_discount_order foreign key (order_id) references `order` (order_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_order_discount_discount foreign key (discount_id) references discount (discount_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

create table payment
(
    payment_id        int unsigned auto_increment comment 'Mã thanh toán' primary key,
    order_id          int unsigned                             not null comment 'Mã đơn hàng',
    payment_method_id tinyint unsigned                         not null comment 'Mã phương thức thanh toán',
    status            enum ('PROCESSING', 'CANCELLED', 'PAID') null comment 'Trạng thái thanh toán',
    amount_paid       decimal(11, 3)                           null comment 'Số tiền đã trả',
    change_amount     decimal(11, 3) default 0.000             null comment 'Tiền thừa',
    payment_time      timestamp      default CURRENT_TIMESTAMP null comment 'Thời gian thanh toán',
    created_at        datetime       default CURRENT_TIMESTAMP null,
    updated_at        datetime       default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    index idx_payment_payment_method_id (payment_method_id),
    constraint fk_payment_order foreign key (order_id) references `order` (order_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_payment_payment_method foreign key (payment_method_id) references payment_method (payment_method_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

create table store
(
    store_id     tinyint unsigned auto_increment comment 'Mã cửa hàng' primary key,
    name         varchar(100)                       not null comment 'Tên cửa hàng',
    address      varchar(255)                       not null comment 'Địa chỉ',
    phone        varchar(15)                        not null comment 'Số điện thoại',
    opening_time time                               not null comment 'Thời gian mở cửa',
    closing_time time                               not null,
    email        varchar(100)                       not null comment 'Email',
    opening_date date                               not null comment 'Ngày khai trương',
    tax_code     varchar(20)                        not null comment 'Mã số thuế',
    created_at   datetime default CURRENT_TIMESTAMP null,
    updated_at   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);


create table product_size
(
    size_id     smallint unsigned auto_increment comment 'Mã kích thước' primary key,
    name        varchar(5)                         not null comment 'Tên kích thước (ví dụ: S, M, L)',
    unit        varchar(15)                        not null comment 'Đơn vị tính',
    quantity    smallint unsigned                  not null comment 'Số lượng',
    description varchar(1000)                      null comment 'Mô tả',
    created_at  datetime default CURRENT_TIMESTAMP null,
    updated_at  datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_product_size_unit_name unique (unit, name)
);

create table product_price
(
    product_price_id int unsigned auto_increment comment 'Mã giá sản phẩm' primary key,
    product_id       mediumint unsigned                 not null comment 'Mã sản phẩm',
    size_id          smallint unsigned                  not null comment 'Mã kích thước',
    price            decimal(11, 3)                     not null comment 'Giá',
    is_active        boolean                            not null default TRUE comment 'Trạng thái kích hoạt',
    created_at       datetime default CURRENT_TIMESTAMP null comment 'Thời gian tạo',
    updated_at       datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment 'Thời gian cập nhật',
    constraint uk_product_price_product_size unique (product_id, size_id),
    index idx_product_price_product_id (product_id),
    index idx_product_price_size_id (size_id),
    constraint fk_product_price_product foreign key (product_id) references product (product_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_product_price_product_size foreign key (size_id) references product_size (size_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

create table order_product
(
    order_product_id int unsigned auto_increment comment 'Mã chi tiết đơn hàng' primary key,
    order_id         int unsigned                       not null comment 'Mã đơn hàng',
    product_price_id int unsigned                       not null comment 'Mã giá sản phẩm',
    quantity         smallint unsigned                  not null comment 'Số lượng',
    `option`         varchar(500)                       null comment 'Tùy chọn cho việc lựa chọn lượng đá, đường ',
    created_at       datetime default CURRENT_TIMESTAMP null,
    updated_at       datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_order_product_order_product_price unique (order_id, product_price_id),
    index idx_order_product_order_id (order_id),
    index idx_order_product_product_price_id (product_price_id),
    constraint fk_order_product_order foreign key (order_id) references `order` (order_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    constraint fk_order_product_product_price foreign key (product_price_id) references product_price (product_price_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);




