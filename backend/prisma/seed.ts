import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Categories
  const cat1 = await prisma.category.upsert({ where: { slug: 'do-dung-nha-bep' }, update: {}, create: { name: 'Đồ dùng nhà bếp', slug: 'do-dung-nha-bep' } });
  const cat2 = await prisma.category.upsert({ where: { slug: 'do-dung-phong-tam' }, update: {}, create: { name: 'Đồ dùng phòng tắm', slug: 'do-dung-phong-tam' } });
  const cat3 = await prisma.category.upsert({ where: { slug: 'do-gia-dung-dien-may' }, update: {}, create: { name: 'Đồ gia dụng - Điện máy', slug: 'do-gia-dung-dien-may' } });
  const cat4 = await prisma.category.upsert({ where: { slug: 'dung-cu-lam-vuon' }, update: {}, create: { name: 'Dụng cụ làm vườn', slug: 'dung-cu-lam-vuon' } });
  const cat5 = await prisma.category.upsert({ where: { slug: 've-sinh-nha-cua' }, update: {}, create: { name: 'Vệ sinh nhà cửa', slug: 've-sinh-nha-cua' } });

  const products = [
    {
      categoryId: cat1.id, name: 'Nồi cơm điện 1.8L', slug: 'noi-com-dien-1-8l',
      description: 'Nồi cơm điện công nghệ mới với chế độ nấu thông minh, giữ cơm nóng 24h. Lòng nồi hợp kim nhôm chống dính cao cấp.',
      price: 850000, originalPrice: 990000, stock: 50, soldCount: 128, views: 2500,
      brand: 'Sunhouse', weight: 2.5, warranty: '12 tháng', isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    },
    {
      categoryId: cat1.id, name: 'Chảo chống dính 28cm', slug: 'chao-chong-dinh-28cm',
      description: 'Chảo chống dính cao cấp 3 lớp đáy từ, dùng được cho bếp từ. Tay cầm bakelite chống nóng.',
      price: 320000, originalPrice: 399000, stock: 100, soldCount: 345, views: 4200,
      brand: 'Lock&Lock', weight: 0.8, warranty: '6 tháng', isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400',
    },
    {
      categoryId: cat1.id, name: 'Bộ dao inox 5 món cao cấp', slug: 'bo-dao-inox-5-mon-cao-cap',
      description: 'Bộ dao bếp inox chống gỉ 5 món: dao đầu bếp, dao gọt, dao thái, dao xương, kéo. Lưỡi dao thép không gỉ Nhật Bản.',
      price: 450000, stock: 80, soldCount: 89, views: 1800,
      brand: 'Kai', weight: 1.2, warranty: '24 tháng',
      imageUrl: 'https://images.unsplash.com/photo-1593618998160-3403e1e8c6e1?w=400',
    },
    {
      categoryId: cat1.id, name: 'Máy xay sinh tố đa năng 2 cối', slug: 'may-xay-sinh-to-da-nang-2-coi',
      description: 'Máy xay công suất lớn 500W, 2 cối xay riêng biệt. Lưỡi dao thép không gỉ 4 cánh.',
      price: 690000, originalPrice: 850000, stock: 40, soldCount: 210, views: 3800,
      brand: 'Philips', weight: 3.0, warranty: '12 tháng', isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?w=400',
    },
    {
      categoryId: cat2.id, name: 'Kệ để đồ phòng tắm inox', slug: 'ke-de-do-phong-tam-inox',
      description: 'Kệ inox 304 chống gỉ, chịu lực tốt. Phù hợp cho mọi không gian phòng tắm.',
      price: 220000, stock: 60, soldCount: 167, views: 2100,
      brand: 'Inax', weight: 0.5, warranty: '12 tháng',
      imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
    },
    {
      categoryId: cat2.id, name: 'Thảm chân chống trượt', slug: 'tham-chan-chong-truot',
      description: 'Thảm cao su tổng hợp chống trượt, thấm nước tốt. Dễ vệ sinh, nhanh khô.',
      price: 95000, stock: 150, soldCount: 423, views: 5600,
      brand: 'Kodama', weight: 0.3, isFeatured: true,
      imageUrl: 'https://images.unsplash.com/photo-1604800692423-0a3ce4b0e9ca?w=400',
    },
    {
      categoryId: cat3.id, name: 'Quạt đứng điều khiển từ xa', slug: 'quat-dung-dieu-khien-tu-xa',
      description: 'Quạt 3 tốc độ gió, điều kèm remote. Chế độ xoay ngang, hẹn giờ tắt.',
      price: 590000, originalPrice: 720000, stock: 35, soldCount: 94, views: 1500,
      brand: 'Asia', weight: 4.5, warranty: '24 tháng',
      imageUrl: 'https://images.unsplash.com/photo-1585129882278-e1e00a1ce48b?w=400',
    },
    {
      categoryId: cat4.id, name: 'Bộ dụng cụ làm vườn mini 7 món', slug: 'bo-dung-cu-lam-vuon-mini-7-mon',
      description: 'Đầy đủ dụng cụ cắt, xới, tỉa cây. Tay cầm nhựa chống trượt, sang trọng.',
      price: 165000, stock: 75, soldCount: 56, views: 890,
      brand: 'GardenPro', weight: 0.6, warranty: '6 tháng',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    },
    {
      categoryId: cat5.id, name: 'Chổi lau nhà 360 độ', slug: 'choi-lau-nha-360-do',
      description: 'Xoay 360 độ, lau sạch mọi góc nhà. Sợi microfiber thấm nước gấp 5 lần thông thường.',
      price: 145000, stock: 130, soldCount: 289, views: 3200,
      brand: 'Sunshine', weight: 0.4, warranty: '3 tháng',
      imageUrl: 'https://images.unsplash.com/photo-1585681415552-40f3b7e9c4c6?w=400',
    },
  ];

  const productAttributes: Record<string, { name: string; value: string }[]> = {
    'noi-com-dien-1-8l': [
      { name: 'Chất liệu', value: 'Hợp kim nhôm' },
      { name: 'Dung tích', value: '1.8 lít' },
      { name: 'Công suất', value: '700W' },
      { name: 'Màu sắc', value: 'Trắng' },
    ],
    'chao-chong-dinh-28cm': [
      { name: 'Chất liệu', value: 'Nhôm chống dính 3 lớp' },
      { name: 'Đường kính', value: '28 cm' },
      { name: 'Màu sắc', value: 'Đen' },
      { name: 'Dùng cho bếp', value: 'Gas, điện, hồng ngoại' },
    ],
    'bo-dao-inox-5-mon-cao-cap': [
      { name: 'Chất liệu', value: 'Inox 430' },
      { name: 'Số lượng', value: '5 món' },
      { name: 'Màu sắc', value: 'Bạc' },
    ],
    'may-xay-sinh-to-da-nang-2-coi': [
      { name: 'Chất liệu', value: 'Nhựa cao cấp, lưỡi thép không gỉ' },
      { name: 'Dung tích', value: '1.25 lít' },
      { name: 'Công suất', value: '500W' },
      { name: 'Số cối', value: '02 cối' },
    ],
    'ke-de-do-phong-tam-inox': [
      { name: 'Chất liệu', value: 'Inox 304' },
      { name: 'Kích thước', value: '45x20x10 cm' },
      { name: 'Màu sắc', value: 'Bạc' },
    ],
    'tham-chan-chong-truot': [
      { name: 'Chất liệu', value: 'Cao su tổng hợp' },
      { name: 'Kích thước', value: '60x40 cm' },
      { name: 'Màu sắc', value: 'Xám' },
    ],
    'quat-dung-dieu-khien-tu-xa': [
      { name: 'Chất liệu', value: 'Nhựa ABS, thép' },
      { name: 'Công suất', value: '45W' },
      { name: 'Tốc độ gió', value: '03 tốc độ' },
      { name: 'Điều khiển', value: 'Remote từ xa' },
    ],
    'bo-dung-cu-lam-vuon-mini-7-mon': [
      { name: 'Chất liệu', value: 'Thép carbon, nhựa' },
      { name: 'Số lượng', value: '07 món' },
    ],
    'choi-lau-nha-360-do': [
      { name: 'Chất liệu', value: 'Sợi microfiber, nhôm' },
      { name: 'Kích thước', value: '120 cm' },
      { name: 'Tính năng', value: 'Xoay 360 độ' },
    ],
  };

  // Upsert products with new fields
  for (const p of products) {
    const attributes = productAttributes[p.slug] || [];
    const { soldCount, views, originalPrice, brand, weight, warranty, isFeatured, ...rest } = p;

    await prisma.productAttribute.deleteMany({ where: { product: { slug: p.slug } } });

    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        originalPrice, brand, weight, warranty,
        soldCount, views, isFeatured,
      },
      create: { ...rest, originalPrice, brand, weight, warranty, soldCount, views, isFeatured },
    });

    if (attributes.length) {
      await prisma.productAttribute.createMany({
        data: attributes.map((attr, idx) => ({
          productId: created.id,
          name: attr.name,
          value: attr.value,
          sortOrder: idx,
        })),
      });
    }

    const images = [
      { url: p.imageUrl, alt: p.name, sortOrder: 0 },
      { url: `https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400`, alt: `${p.name} - Ảnh 2`, sortOrder: 1 },
      { url: `https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400`, alt: `${p.name} - Ảnh 3`, sortOrder: 2 },
    ];

    // Delete existing images and create fresh set
    await prisma.productImage.deleteMany({ where: { productId: created.id } });
    for (const img of images) {
      await prisma.productImage.create({
        data: { productId: created.id, ...img },
      });
    }
  }

  // Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: { passwordHash, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
    create: { fullName: 'Admin', email: 'admin@shop.com', passwordHash, role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
  });

  const customerHash = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@shop.com' },
    update: { passwordHash: customerHash, phone: '0909123456', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer' },
    create: { fullName: 'Nguyễn Văn A', email: 'customer@shop.com', passwordHash: customerHash, role: 'customer', phone: '0909123456', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=customer' },
  });

  // Sample addresses for test customer
  await prisma.address.deleteMany({ where: { userId: customer.id } });
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Nguyễn Văn A',
      phone: '0909123456',
      province: 'Hà Nội',
      district: 'Huyện Quốc Oai',
      ward: 'Xã Sài Sơn',
      detail: 'Thôn Phúc Đức, Xã Sài Sơn',
      isDefault: true,
    },
  });

  // Vouchers
  const vouchers = [
    { code: 'GIAM10', discountType: 'percent' as any, discountValue: 10, minOrderAmount: 100000, maxDiscount: 50000, quantity: 0, description: 'Giảm 10% cho đơn từ 100.000đ', expiresAt: new Date('2027-12-31') },
    { code: 'WELCOME', discountType: 'percent' as any, discountValue: 20, minOrderAmount: 0, maxDiscount: 1000000, quantity: 0, description: 'Dành cho khách hàng mới, tối đa 1.000.000đ', expiresAt: new Date('2027-12-31') },
    { code: 'WELCOME10', discountType: 'percent' as any, discountValue: 10, minOrderAmount: 0, maxDiscount: 50000, quantity: 100, description: 'Giảm 10% cho đơn hàng đầu tiên' },
    { code: 'FREE50', discountType: 'fixed' as any, discountValue: 50000, minOrderAmount: 300000, quantity: 50, description: 'Giảm 50.000đ cho đơn từ 300.000đ' },
    { code: 'SHIP30', discountType: 'fixed' as any, discountValue: 30000, minOrderAmount: 200000, quantity: 200, description: 'Giảm 30.000đ phí vận chuyển' },
    { code: 'SUMMER15', discountType: 'percent' as any, discountValue: 15, minOrderAmount: 500000, maxDiscount: 100000, quantity: 30, expiresAt: new Date('2026-09-30'), description: 'Giảm 15% mùa hè, tối đa 100.000đ' },
  ];

  for (const v of vouchers) {
    await prisma.voucher.upsert({ where: { code: v.code }, update: {}, create: v });
  }

  // Settings
  const settings = [
    { key: 'site_name', value: 'ShopGiaDung' },
    { key: 'site_description', value: 'Shop đồ gia dụng chất lượng cao - Uy tín hàng đầu Việt Nam' },
    { key: 'site_logo', value: '/logo.png' },
    { key: 'contact_phone', value: '1900 1234 56' },
    { key: 'contact_email', value: 'info@shopgiadung.vn' },
    { key: 'contact_address', value: 'Thôn Phúc Đức, Xã Sài Sơn, Huyện Quốc Oai, Hà Nội' },
    { key: 'social_facebook', value: 'https://facebook.com/shopgiadung' },
    { key: 'social_youtube', value: 'https://youtube.com/@shopgiadung' },
    { key: 'shipping_fee', value: '30000' },
    { key: 'free_shipping_min', value: '500000' },
    { key: 'seo_title', value: 'ShopGiaDung - Đồ gia dụng chính hãng giá tốt' },
    { key: 'seo_description', value: 'ShopGiaDung cung cấp đồ gia dụng chính hãng giá tốt nhất thị trường. Miễn phí vận chuyển cho đơn trên 500.000đ.' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }

  // Sliders (homepage banners)
  const sliders = [
    { title: 'Mùa hè sôi động', subtitle: 'Giảm đến 30% đồ gia dụng mùa hè', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200', linkUrl: '/products?sort=price_asc', sortOrder: 0 },
    { title: 'Bộ sưu tập nhà bếp', subtitle: 'Ưu đãi đặc biệt cho bộ nồi chảo cao cấp', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', linkUrl: '/products?category=1', sortOrder: 1 },
    { title: 'Gia dụng chính hãng', subtitle: 'Cam kết chất lượng, bảo hành 12 tháng', imageUrl: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=1200', linkUrl: '/products', sortOrder: 2 },
  ];

  await prisma.slider.deleteMany();
  for (const sl of sliders) {
    await prisma.slider.create({ data: sl });
  }

  // Static pages
  const pages = [
    {
      title: 'Giới thiệu',
      slug: 'about',
      content: `<h2>Về ShopGiaDung</h2>
<p>ShopGiaDung là cửa hàng chuyên cung cấp các sản phẩm đồ gia dụng chính hãng, chất lượng cao cho mọi gia đình Việt. Với hơn 5 năm kinh nghiệm trong lĩnh vực phân phối đồ gia dụng, chúng tôi tự hào là đối tác tin cậy của hàng nghìn khách hàng trên toàn quốc.</p>
<h3>Tầm nhìn</h3>
<p>Trở thành hệ thống bán lẻ đồ gia dụng hàng đầu Việt Nam, mang đến những sản phẩm chất lượng với giá cả cạnh tranh nhất.</p>
<h3>Sứ mệnh</h3>
<p>Cam kết cung cấp sản phẩm chính hãng 100%, dịch vụ khách hàng tận tâm, giao hàng nhanh chóng trên toàn quốc.</p>`,
      metaDescription: 'Giới thiệu về ShopGiaDung - Đồ gia dụng chính hãng',
    },
    {
      title: 'Chính sách mua hàng',
      slug: 'policy',
      content: `<h2>Chính sách mua hàng</h2>
<h3>1. Phương thức thanh toán</h3>
<ul><li>Thanh toán khi nhận hàng (COD)</li><li>Chuyển khoản ngân hàng</li><li>Thanh toán qua thẻ tín dụng</li></ul>
<h3>2. Chính sách giao hàng</h3>
<ul><li>Miễn phí giao hàng cho đơn từ 500.000đ</li><li>Giao hàng trong 2-5 ngày làm việc</li><li>Giao hàng toàn quốc</li></ul>
<h3>3. Chính sách đổi trả</h3>
<ul><li>Đổi trả trong 30 ngày nếu lỗi nhà sản xuất</li><li>Hoàn tiền 100% nếu sản phẩm không đúng mô tả</li><li>Sản phẩm phải còn nguyên tem, hộp</li></ul>`,
      metaDescription: 'Chính sách mua hàng, đổi trả, giao hàng của ShopGiaDung',
    },
    {
      title: 'Câu hỏi thường gặp',
      slug: 'faq',
      content: `<h2>Câu hỏi thường gặp</h2>
<h3>Làm thế nào để đặt hàng?</h3>
<p>Bạn có thể đặt hàng trực tiếp trên website, hoặc gọi hotline 1900 1234 56 để được tư vấn.</p>
<h3>Thời gian giao hàng bao lâu?</h3>
<p>Chúng tôi giao hàng trong vòng 2-5 ngày làm việc tùy khu vực.</p>
<h3>Có được kiểm tra hàng trước khi thanh toán không?</h3>
<p>Có, bạn được kiểm tra hàng trước khi thanh toán. Vui lòng kiểm tra kỹ sản phẩm trước khi nhận.</p>
<h3>Làm thế nào để đổi trả hàng?</h3>
<p>Liên hệ hotline 1900 1234 56 hoặc email info@shopgiadung.vn để được hỗ trợ đổi trả.</p>`,
      metaDescription: 'FAQ - Các câu hỏi thường gặp về mua hàng tại ShopGiaDung',
    },
    {
      title: 'Chính sách bảo mật',
      slug: 'privacy',
      content: `<h2>Chính sách bảo mật</h2>
<p>ShopGiaDung cam kết bảo vệ thông tin cá nhân của khách hàng. Mọi thông tin thu thập chỉ được sử dụng để xử lý đơn hàng và cải thiện dịch vụ.</p>
<h3>Thu thập thông tin</h3>
<p>Chúng tôi thu thập thông tin khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi.</p>
<h3>Bảo mật thông tin</h3>
<p>Thông tin của bạn được mã hóa và lưu trữ an toàn. Chúng tôi không chia sẻ thông tin với bên thứ ba.</p>`,
      metaDescription: 'Chính sách bảo mật thông tin khách hàng tại ShopGiaDung',
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
