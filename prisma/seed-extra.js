const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Inserting 5 professors and 5 students...');

  const passwordHash = await bcrypt.hash('Password123', 10);

  const extraUsers = [
    // 5 Professors
    {
      email: 'elizabeth.blackwell@emba.com',
      name: 'Dr. Elizabeth Blackwell',
      role: 'PROFESSOR',
      status: 'APPROVED'
    },
    {
      email: 'alan.turing@emba.com',
      name: 'Dr. Alan Turing',
      role: 'PROFESSOR',
      status: 'APPROVED'
    },
    {
      email: 'grace.hopper@emba.com',
      name: 'Dr. Grace Hopper',
      role: 'PROFESSOR',
      status: 'APPROVED'
    },
    {
      email: 'richard.feynman@emba.com',
      name: 'Dr. Richard Feynman',
      role: 'PROFESSOR',
      status: 'APPROVED'
    },
    {
      email: 'ada.lovelace@emba.com',
      name: 'Dr. Ada Lovelace',
      role: 'PROFESSOR',
      status: 'APPROVED'
    },

    // 5 Students
    {
      email: 'jfk@emba.com',
      name: 'John F. Kennedy',
      role: 'STUDENT',
      status: 'APPROVED'
    },
    {
      email: 'churchill@emba.com',
      name: 'Winston Churchill',
      role: 'STUDENT',
      status: 'APPROVED'
    },
    {
      email: 'eleanor@emba.com',
      name: 'Eleanor Roosevelt',
      role: 'STUDENT',
      status: 'APPROVED'
    },
    {
      email: 'marie.curie@emba.com',
      name: 'Marie Curie',
      role: 'STUDENT',
      status: 'APPROVED'
    },
    {
      email: 'mandela@emba.com',
      name: 'Nelson Mandela',
      role: 'STUDENT',
      status: 'APPROVED'
    }
  ];

  for (const userData of extraUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: userData.status,
          passwordHash,
        }
      });
      console.log(`Created ${userData.role} user: ${user.name} (${user.email})`);
    } else {
      console.log(`User ${userData.email} already exists.`);
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
