-- Thêm category mới
INSERT INTO categories (name, slug) VALUES
('Đồ gia dụng - Điện máy', 'do-gia-dung-dien-may'),
('Dụng cụ làm vườn', 'dung-cu-lam-vuon'),
('Vệ sinh nhà cửa', 've-sinh-nha-cua')
ON CONFLICT (slug) DO NOTHING;

-- Thêm sản phẩm cho "Đồ dùng nhà bếp" (category_id = 1)
INSERT INTO products (category_id, name, slug, description, price, stock, image_url) VALUES
(1, 'Bộ dao inox 5 món cao cấp', 'bo-dao-inox-5-mon-cao-cap', 'Bộ dao bếp inox chống gỉ, sắc bén', 450000, 80, 'https://placehold.co/300x300'),
(1, 'Máy xay sinh tố đa năng 2 cối', 'may-xay-sinh-to-da-nang-2-coi', 'Máy xay công suất lớn, 2 cối inox', 690000, 40, 'https://placehold.co/300x300'),
(1, 'Hộp đựng thực phẩm thủy tinh bộ 5', 'hop-dung-thuc-pham-thuy-tinh-bo-5', 'Bộ hộp thủy tinh chịu nhiệt, có nắp kín', 280000, 120, 'https://placehold.co/300x300'),
(1, 'Bình giữ nhiệt inox 500ml', 'binh-giu-nhiet-inox-500ml', 'Giữ nóng/lạnh 12 giờ, thiết kế nhỏ gọn', 178000, 90, 'https://placehold.co/300x300');

-- Thêm sản phẩm cho "Đồ dùng phòng tắm" (category_id = 2)
INSERT INTO products (category_id, name, slug, description, price, stock, image_url) VALUES
(2, 'Kệ để đồ phòng tắm inox treo tường', 'ke-de-do-phong-tam-inox-treo-tuong', 'Kệ inox chống gỉ, lắp đặt dễ dàng', 220000, 60, 'https://placehold.co/300x300'),
(2, 'Thảm chân chống trượt phòng tắm', 'tham-chan-chong-truot-phong-tam', 'Chất liệu cao su, chống thấm nước', 95000, 150, 'https://placehold.co/300x300'),
(2, 'Vòi sen tăng áp tiết kiệm nước', 'voi-sen-tang-ap-tiet-kiem-nuoc', 'Tăng áp lực nước, tiết kiệm 30% nước', 320000, 70, 'https://placehold.co/300x300');

-- Thêm sản phẩm cho "Đồ gia dụng - Điện máy" (category_id mới, lấy theo slug)
INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Quạt đứng điều khiển từ xa', 'quat-dung-dieu-khien-tu-xa', 'Quạt 3 tốc độ gió, có remote', 590000, 35, 'https://placehold.co/300x300' FROM categories WHERE slug = 'do-gia-dung-dien-may';

INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Bàn là hơi nước 2000W', 'ban-la-hoi-nuoc-2000w', 'Là quần áo nhanh, hơi nước mạnh', 380000, 55, 'https://placehold.co/300x300' FROM categories WHERE slug = 'do-gia-dung-dien-may';

INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Ấm đun nước siêu tốc inox 1.8L', 'am-dun-nuoc-sieu-toc-inox-1-8l', 'Tự ngắt khi sôi, an toàn cho gia đình', 250000, 100, 'https://placehold.co/300x300' FROM categories WHERE slug = 'do-gia-dung-dien-may';

-- Thêm sản phẩm cho "Dụng cụ làm vườn"
INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Bộ dụng cụ làm vườn mini 7 món', 'bo-dung-cu-lam-vuon-mini-7-mon', 'Đầy đủ dụng cụ cắt, xới, tưới cây', 165000, 75, 'https://placehold.co/300x300' FROM categories WHERE slug = 'dung-cu-lam-vuon';

INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Vòi tưới cây tự động xoay 360 độ', 'voi-tuoi-cay-tu-dong-xoay-360-do', 'Tưới đều, tiết kiệm nước', 135000, 90, 'https://placehold.co/300x300' FROM categories WHERE slug = 'dung-cu-lam-vuon';

-- Thêm sản phẩm cho "Vệ sinh nhà cửa"
INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Combo 12 viên vệ sinh lồng máy giặt', 'combo-12-vien-ve-sinh-long-may-giat', 'Diệt khuẩn, khử mùi hiệu quả', 99000, 200, 'https://placehold.co/300x300' FROM categories WHERE slug = 've-sinh-nha-cua';

INSERT INTO products (category_id, name, slug, description, price, stock, image_url)
SELECT id, 'Chổi lau nhà 360 độ kèm 2 đầu thay', 'choi-lau-nha-360-do-kem-2-dau-thay', 'Xoay 360 độ, lau sạch mọi góc', 145000, 130, 'https://placehold.co/300x300' FROM categories WHERE slug = 've-sinh-nha-cua';