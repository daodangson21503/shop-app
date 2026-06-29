const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
 const updates = [
  { slug: 'noi-com-dien-1-8l',             imageUrl: '' },
  { slug: 'chao-chong-dinh-28cm',          imageUrl: '' },
  { slug: 'bo-dao-inox-5-mon-cao-cap',     imageUrl: '' },
  { slug: 'may-xay-sinh-to-da-nang-2-coi', imageUrl: '' },
  { slug: 'ke-de-do-phong-tam-inox',       imageUrl: '' },
  { slug: 'tham-chan-chong-truot',          imageUrl: '' },
  { slug: 'quat-dung-dieu-khien-tu-xa',    imageUrl: '' },
  { slug: 'bo-dung-cu-lam-vuon-mini-7-mon',imageUrl: '' },
  { slug: 'choi-lau-nha-360-do',           imageUrl: '' },
];

  for (const item of updates) {
    await prisma.product.update({
      where: { slug: item.slug },
      data: { imageUrl: item.imageUrl },
    });
    console.log(` Updated: ${item.slug}`);
  }
  console.log(' Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());