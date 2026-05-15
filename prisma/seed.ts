import { PrismaClient, UserRole, LocationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@mysanmar.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@mysanmar.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      phone: '+8801700000000',
    },
  });

  console.log('✅ Super admin created:', superAdmin.email);

  // Create Meeting Rooms - Tower One Chittagong
  const rooms = await Promise.all([
    prisma.meetingRoom.upsert({
      where: { id: 'room-ctg-01' },
      update: {},
      create: {
        id: 'room-ctg-01',
        name: 'Boardroom A',
        location: LocationType.TOWER_ONE_CHITTAGONG,
        capacity: 20,
        amenities: ['projector', 'whiteboard', 'video_conferencing', 'ac'],
      },
    }),
    prisma.meetingRoom.upsert({
      where: { id: 'room-ctg-02' },
      update: {},
      create: {
        id: 'room-ctg-02',
        name: 'Meeting Room B',
        location: LocationType.TOWER_ONE_CHITTAGONG,
        capacity: 8,
        amenities: ['tv_screen', 'whiteboard', 'ac'],
      },
    }),
    prisma.meetingRoom.upsert({
      where: { id: 'room-dhk-01' },
      update: {},
      create: {
        id: 'room-dhk-01',
        name: 'Conference Hall',
        location: LocationType.TOWER_TWO_DHAKA,
        capacity: 30,
        amenities: ['projector', 'whiteboard', 'video_conferencing', 'ac', 'catering'],
      },
    }),
  ]);

  console.log(`✅ ${rooms.length} meeting rooms created`);

  // Create Projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'proj-ctg-01' },
      update: {},
      create: {
        id: 'proj-ctg-01',
        name: 'Sanmar Tower One',
        location: LocationType.TOWER_ONE_CHITTAGONG,
        address: 'Agrabad, Chittagong',
        hasMarketingSuite: true,
      },
    }),
    prisma.project.upsert({
      where: { id: 'proj-dhk-01' },
      update: {},
      create: {
        id: 'proj-dhk-01',
        name: 'Sanmar Tower Two',
        location: LocationType.TOWER_TWO_DHAKA,
        address: 'Gulshan, Dhaka',
        hasMarketingSuite: true,
      },
    }),
  ]);

  console.log(`✅ ${projects.length} projects created`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
