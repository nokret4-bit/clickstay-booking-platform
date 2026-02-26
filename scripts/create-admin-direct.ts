import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('\n=== Creating Admin Account ===\n');

    const name = 'Admin';
    const email = 'adminko@yahoo.com';
    const password = 'qwerty123';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(`⚠️  User with email ${email} already exists!`);
      console.log('Updating password...');
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword,
          role: 'ADMIN',
        },
      });
      
      console.log('\n✅ Admin account updated successfully!');
      console.log(`Name: ${updatedUser.name}`);
      console.log(`Email: ${updatedUser.email}`);
      console.log(`Role: ${updatedUser.role}`);
      console.log('\nYou can now log in with the new password.\n');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        updatedAt: new Date(),
      },
    });

    console.log('\n✅ Admin account created successfully!');
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log('\nYou can now log in with these credentials.\n');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
