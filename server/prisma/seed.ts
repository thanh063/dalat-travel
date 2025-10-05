import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';
import { toSlug } from '../src/utils/slug';

async function main() {
  // 1) Users (ghi đè password/role nếu đã tồn tại)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.dev' },
    update: { password: await bcrypt.hash('admin123', 10), role: 'ADMIN', fullName: 'Admin' },
    create: { fullName: 'Admin', email: 'admin@demo.dev', password: await bcrypt.hash('admin123', 10), role: 'ADMIN' }
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@demo.dev' },
    update: { password: await bcrypt.hash('user123', 10), role: 'USER', fullName: 'User Demo' },
    create: { fullName: 'User Demo', email: 'user@demo.dev', password: await bcrypt.hash('user123', 10), role: 'USER' }
  });

  // 2) Tags (slug là unique)
  const tagCQ = await prisma.tag.upsert({
    where: { slug: 'canh-quan' },
    update: {},
    create: { name: 'cảnh quan', slug: 'canh-quan' }
  });
  const tagSA = await prisma.tag.upsert({
    where: { slug: 'song-ao' },
    update: {},
    create: { name: 'sống ảo', slug: 'song-ao' }
  });

  // 3) Places mẫu (ảnh dùng link online, không cần file local)
  //   - Bạn có thể thay bằng bất kỳ URL tuyệt đối nào khác.
  const samples = [
    {
      name: 'Thung Lũng Tình Yêu',
      address: '7/8 Mai Anh Đào, Đà Lạt',
      price: 120000,
      description: 'Khu du lịch nổi tiếng với cảnh quan thơ mộng.',
      imageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop'
    },
    {
      name: 'Quảng Trường Lâm Viên',
      address: 'Trần Quốc Toản, Đà Lạt',
      price: 0,
      description: 'Biểu tượng bông atiso sắc xanh đặc trưng của Đà Lạt.',
      imageUrl:
        'https://images.unsplash.com/photo-1519682337058-a94d519337bc?q=80&w=1600&auto=format&fit=crop'
    },
    {
      name: 'Đồi Chè Cầu Đất',
      address: 'Cầu Đất, Xuân Trường',
      price: 150000,
      description: 'Đồi chè xanh mướt, không khí trong lành lý tưởng check-in.',
      imageUrl:
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop'
    }
  ];

  for (const s of samples) {
    const slug = toSlug(s.name);

    // upsert Place theo slug
    const place = await prisma.place.upsert({
      where: { slug },
      update: {
        address: s.address,
        price: s.price,
        description: s.description,
        imageUrl: s.imageUrl
      },
      create: { ...s, slug }
    });

    // gán 2 tag mặc định: cảnh quan + sống ảo
    await prisma.placeTag.upsert({
      where: { placeId_tagId: { placeId: place.id, tagId: tagCQ.id } },
      update: {},
      create: { placeId: place.id, tagId: tagCQ.id }
    });
    await prisma.placeTag.upsert({
      where: { placeId_tagId: { placeId: place.id, tagId: tagSA.id } },
      update: {},
      create: { placeId: place.id, tagId: tagSA.id }
    });
  }

  console.log('Seed done:', { admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
