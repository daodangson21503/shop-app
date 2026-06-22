const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Tạo categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Đồ dùng nhà bếp', slug: 'do-dung-nha-bep' } }),
    prisma.category.create({ data: { name: 'Đồ dùng phòng tắm', slug: 'do-dung-phong-tam' } }),
    prisma.category.create({ data: { name: 'Đồ gia dụng - Điện máy', slug: 'do-gia-dung-dien-may' } }),
    prisma.category.create({ data: { name: 'Dụng cụ làm vườn', slug: 'dung-cu-lam-vuon' } }),
    prisma.category.create({ data: { name: 'Vệ sinh nhà cửa', slug: 've-sinh-nha-cua' } }),
  ]);

  // 2. Tạo products
  await prisma.product.createMany({
    data: [
      { categoryId: categories[0].id, name: 'Nồi cơm điện 1.8L', slug: 'noi-com-dien-1-8l', description: 'Nồi cơm điện công nghệ mới', price: 850000, stock: 50, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[0].id, name: 'Chảo chống dính 28cm', slug: 'chao-chong-dinh-28cm', description: 'Chảo chống dính cao cấp', price: 320000, stock: 100, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[0].id, name: 'Bộ dao inox 5 món cao cấp', slug: 'bo-dao-inox-5-mon-cao-cap', description: 'Bộ dao bếp inox chống gỉ', price: 450000, stock: 80, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[0].id, name: 'Máy xay sinh tố đa năng 2 cối', slug: 'may-xay-sinh-to-da-nang-2-coi', description: 'Máy xay công suất lớn', price: 690000, stock: 40, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[1].id, name: 'Kệ để đồ phòng tắm inox', slug: 'ke-de-do-phong-tam-inox', description: 'Kệ inox chống gỉ', price: 220000, stock: 60, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[1].id, name: 'Thảm chân chống trượt', slug: 'tham-chan-chong-truot', description: 'Chất liệu cao su, chống thấm', price: 95000, stock: 150, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[2].id, name: 'Quạt đứng điều khiển từ xa', slug: 'quat-dung-dieu-khien-tu-xa', description: 'Quạt 3 tốc độ gió', price: 590000, stock: 35, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[3].id, name: 'Bộ dụng cụ làm vườn mini 7 món', slug: 'bo-dung-cu-lam-vuon-mini-7-mon', description: 'Đầy đủ dụng cụ cắt, xới, tưới', price: 165000, stock: 75, imageUrl: 'https://placehold.co/300x300' },
      { categoryId: categories[4].id, name: 'Chổi lau nhà 360 độ', slug: 'choi-lau-nha-360-do', description: 'Xoay 360 độ, lau sạch mọi góc', price: 145000, stock: 130, imageUrl: 'https://placehold.co/300x300' },
    ],
  });

  // 3. Tạo Admin user với password hash thật
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      fullName: 'Admin',
      email: 'admin@shop.com',
      passwordHash,
      role: 'admin',
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });