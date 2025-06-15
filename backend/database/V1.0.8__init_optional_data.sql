-- ================================================================================================================
-- DỮ LIỆU TÙY CHỌN - DANH MỤC, SẢN PHẨM VÀ GIÁ
-- ================================================================================================================

-- Thêm các danh mục mới
INSERT INTO category (name, description) VALUES
('BÁNH MÌ', 'Các loại bánh mì tươi ngon'),
('BÁNH DẺO', 'Các loại bánh dẻo truyền thống'),
('BÁNH QUY', 'Các loại bánh quy đặc biệt'),
('BÁNH NGỌT', 'Các loại bánh ngọt'),
('BÁNH TRUNG THU', 'Các loại bánh trung thu');

-- Thêm các kích thước bổ sung (đã có S, M, L, NA trong data mặc định)
-- Không cần thêm vì đã có trong V1.0.1

-- Thêm sản phẩm cho danh mục BÁNH MÌ
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'BÁNH MÌ'), 'Bánh mì pate', 'Bánh mì pate truyền thống với nhân pate thịt', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Fcach_an_banh_mi_1.webp?alt=media&token=e9956857-8c1a-445f-b9a8-4844fef486c1'),
((SELECT category_id FROM category WHERE name = 'BÁNH MÌ'), 'Bánh mì thịt nướng', 'Bánh mì với thịt nướng thơm lừng', true, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Fbanh_mi_nam_nuong_1_giac_da_doi_2_1f6a3c07e26647b7892757f0bc54b494_master.webp?alt=media&token=89f68433-e14b-4d68-9f05-24ee9f8efbae'),
((SELECT category_id FROM category WHERE name = 'BÁNH MÌ'), 'Bánh mì chả cá', 'Bánh mì chả cá Nha Trang đặc biệt', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Fbanh-mi-cha-ca-nha-trang-0_1687277813.jpg?alt=media&token=c50879f8-1fa1-4e00-a979-27e81449ac59'),
((SELECT category_id FROM category WHERE name = 'BÁNH MÌ'), 'Bánh mì xíu mại', 'Bánh mì xíu mại sốt cà chua', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2F1-o-banh-mi-thit-bao-nhieu-calo-6.jpg.webp?alt=media&token=69405e60-13e9-4bc7-8835-ad2e5820c796');

-- Thêm sản phẩm cho danh mục BÁNH NGỌT
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'BÁNH NGỌT'), 'Bánh flan', 'Bánh flan caramen mềm mịn', true, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Fbanh-flan-socola-2_71a4b9be8ddc459c9be9a7226ae74476.webp?alt=media&token=101cab5d-dc80-4a63-b5a6-bf76cc34543d'),
((SELECT category_id FROM category WHERE name = 'BÁNH NGỌT'), 'Bánh tiramisu', 'Bánh tiramisu Italia chính gốc', true, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Fbanh-tiramisu.jpg?alt=media&token=6c1af2f0-1c38-4215-a41e-73bccdd4cd53'),
((SELECT category_id FROM category WHERE name = 'BÁNH NGỌT'), 'Bánh red velvet', 'Bánh red velvet với kem cheese', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2F272745036-238575765147965-7680-1115-4365-1644826455.webp?alt=media&token=1e400c77-9620-488e-8886-0586387c44b1'),
((SELECT category_id FROM category WHERE name = 'BÁNH NGỌT'), 'Bánh cheesecake', 'Bánh cheesecake New York style', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Funnamed.jpg?alt=media&token=6d662e9f-b010-4428-9b2f-508a3f03ffb2'),
((SELECT category_id FROM category WHERE name = 'BÁNH NGỌT'), 'Bánh chocolate', 'Bánh chocolate đen đậm đà', true, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2FCac-Loai-Banh-Socola-De-Lam-1.jpg?alt=media&token=f608b051-8d7f-4a58-867d-2977db0d1bd9');

-- Thêm sản phẩm cho danh mục BÁNH DẺO
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'BÁNH DẺO'), 'Bánh dẻo đậu xanh', 'Bánh dẻo nhân đậu xanh thơm ngon', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2F5.png?alt=media&token=e65c8f12-5f52-46d8-b666-53bf2a87cba6'),
((SELECT category_id FROM category WHERE name = 'BÁNH DẺO'), 'Bánh dẻo khoai môn', 'Bánh dẻo nhân khoai môn tím', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2F1834_cach-sen-nhan-dau-do-khoai-mon-deo-min-don-gian-cho-banh-trung-thu-17.jpg?alt=media&token=f2edcd4c-985b-41f2-affa-92624af4c9fa');

-- Thêm sản phẩm cho danh mục BÁNH TRUNG THU
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'BÁNH TRUNG THU'), 'Bánh nướng truyền thống', 'Bánh trung thu nướng nhân thập cẩm', true, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Fcach-lam-banh-trung-thu-bang-noi-chien-khong-dau-3.jpg?alt=media&token=9c4f183f-0c67-43aa-bde4-e20790537d54');

-- Thêm sản phẩm cho danh mục BÁNH TẾT
INSERT INTO product (category_id, name, description, is_signature, image_path) VALUES
((SELECT category_id FROM category WHERE name = 'BÁNH QUY'), 'Bánh quy socola', 'Bánh quy socola đặc biệt', true, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2Flam-banh-quy-socola-bang-noi-chien-khong-dau-thumb_bf86e7ab03b24c5fb6351f48a6200e5f.webp?alt=media&token=89b4c87d-7c19-4ec2-89f8-896887ab8bbb'),
((SELECT category_id FROM category WHERE name = 'BÁNH QUY'), 'Bánh quy dừa', 'Bánh quy dừa đặc biệt', false, 'https://firebasestorage.googleapis.com/v0/b/cakepos.firebasestorage.app/o/product%2F35ba66d3-77fa-4caa-b3bd-1a1c7c874c0e-jpeg.jpg?alt=media&token=d1684a35-7d7d-40cc-8562-cf63eecd7ed2');

-- ================================================================================================================
-- GIÁ SẢN PHẨM CHO CÁC KÍCH THƯỚC
-- ================================================================================================================

-- Giá cho BÁNH MÌ (chỉ có size NA - không áp dụng size)
INSERT INTO product_price (product_id, size_id, price, is_active) VALUES
-- Bánh mì pate
((SELECT product_id FROM product WHERE name = 'Bánh mì pate'), (SELECT size_id FROM product_size WHERE name = 'NA'), 25000, true),
-- Bánh mì thịt nướng
((SELECT product_id FROM product WHERE name = 'Bánh mì thịt nướng'), (SELECT size_id FROM product_size WHERE name = 'NA'), 35000, true),
-- Bánh mì chả cá
((SELECT product_id FROM product WHERE name = 'Bánh mì chả cá'), (SELECT size_id FROM product_size WHERE name = 'NA'), 30000, true),
-- Bánh mì xíu mại
((SELECT product_id FROM product WHERE name = 'Bánh mì xíu mại'), (SELECT size_id FROM product_size WHERE name = 'NA'), 28000, true);

-- Giá cho BÁNH NGỌT (có nhiều size S, M, L)
INSERT INTO product_price (product_id, size_id, price, is_active) VALUES
-- Bánh flan
((SELECT product_id FROM product WHERE name = 'Bánh flan'), (SELECT size_id FROM product_size WHERE name = 'S'), 15000, true),
((SELECT product_id FROM product WHERE name = 'Bánh flan'), (SELECT size_id FROM product_size WHERE name = 'M'), 25000, true),
((SELECT product_id FROM product WHERE name = 'Bánh flan'), (SELECT size_id FROM product_size WHERE name = 'L'), 35000, true),
-- Bánh tiramisu
((SELECT product_id FROM product WHERE name = 'Bánh tiramisu'), (SELECT size_id FROM product_size WHERE name = 'S'), 45000, true),
((SELECT product_id FROM product WHERE name = 'Bánh tiramisu'), (SELECT size_id FROM product_size WHERE name = 'M'), 75000, true),
((SELECT product_id FROM product WHERE name = 'Bánh tiramisu'), (SELECT size_id FROM product_size WHERE name = 'L'), 120000, true),
-- Bánh red velvet
((SELECT product_id FROM product WHERE name = 'Bánh red velvet'), (SELECT size_id FROM product_size WHERE name = 'S'), 40000, true),
((SELECT product_id FROM product WHERE name = 'Bánh red velvet'), (SELECT size_id FROM product_size WHERE name = 'M'), 65000, true),
((SELECT product_id FROM product WHERE name = 'Bánh red velvet'), (SELECT size_id FROM product_size WHERE name = 'L'), 95000, true),
-- Bánh cheesecake
((SELECT product_id FROM product WHERE name = 'Bánh cheesecake'), (SELECT size_id FROM product_size WHERE name = 'S'), 42000, true),
((SELECT product_id FROM product WHERE name = 'Bánh cheesecake'), (SELECT size_id FROM product_size WHERE name = 'M'), 68000, true),
((SELECT product_id FROM product WHERE name = 'Bánh cheesecake'), (SELECT size_id FROM product_size WHERE name = 'L'), 98000, true),
-- Bánh chocolate
((SELECT product_id FROM product WHERE name = 'Bánh chocolate'), (SELECT size_id FROM product_size WHERE name = 'S'), 38000, true),
((SELECT product_id FROM product WHERE name = 'Bánh chocolate'), (SELECT size_id FROM product_size WHERE name = 'M'), 62000, true),
((SELECT product_id FROM product WHERE name = 'Bánh chocolate'), (SELECT size_id FROM product_size WHERE name = 'L'), 88000, true);

-- Giá cho BÁNH DẺO (chỉ có size NA)
INSERT INTO product_price (product_id, size_id, price, is_active) VALUES
-- Bánh dẻo đậu xanh
((SELECT product_id FROM product WHERE name = 'Bánh dẻo đậu xanh'), (SELECT size_id FROM product_size WHERE name = 'NA'), 12000, true),
-- Bánh dẻo khoai môn
((SELECT product_id FROM product WHERE name = 'Bánh dẻo khoai môn'), (SELECT size_id FROM product_size WHERE name = 'NA'), 14000, true);

-- Giá cho BÁNH TRUNG THU (có size S, M, L)
INSERT INTO product_price (product_id, size_id, price, is_active) VALUES
-- Bánh nướng truyền thống
((SELECT product_id FROM product WHERE name = 'Bánh nướng truyền thống'), (SELECT size_id FROM product_size WHERE name = 'S'), 80000, true),
((SELECT product_id FROM product WHERE name = 'Bánh nướng truyền thống'), (SELECT size_id FROM product_size WHERE name = 'M'), 150000, true),
((SELECT product_id FROM product WHERE name = 'Bánh nướng truyền thống'), (SELECT size_id FROM product_size WHERE name = 'L'), 250000, true);

-- Giá cho BÁNH TẾT (chỉ có size NA)
INSERT INTO product_price (product_id, size_id, price, is_active) VALUES
-- Bánh quy socola
((SELECT product_id FROM product WHERE name = 'Bánh quy socola'), (SELECT size_id FROM product_size WHERE name = 'NA'), 45000, true),
-- Bánh quy dừa
((SELECT product_id FROM product WHERE name = 'Bánh quy dừa'), (SELECT size_id FROM product_size WHERE name = 'NA'), 40000, true);
