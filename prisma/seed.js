const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Course-scoped EMBA Connect data...');

  const passwordHash = await bcrypt.hash('Password123', 10);

  // 1. Create System Settings
  const settingsToSeed = [
    { key: 'system_name', value: 'EMBA Connect' },
    { key: 'require_approval', value: 'true' },
    { key: 'allow_signup', value: 'true' },
  ];

  for (const setting of settingsToSeed) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting
    });
  }
  console.log('System settings seeded.');

  // 2. Create Core Admin Accounts
  const admins = [
    { email: 'superadmin@emba.com', name: 'Super Admin User', role: 'SUPER_ADMIN', status: 'APPROVED' },
    { email: 'admin@emba.com', name: 'System Admin User', role: 'ADMIN', status: 'APPROVED' }
  ];

  for (const a of admins) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { ...a, passwordHash }
    });
  }

  // 3. Create Professors (Including default professor@emba.com)
  const professors = [
    { email: 'professor@emba.com', name: 'Professor John Doe', role: 'PROFESSOR', status: 'APPROVED' },
    { email: 'elizabeth.blackwell@emba.com', name: 'Dr. Elizabeth Blackwell', role: 'PROFESSOR', status: 'APPROVED' },
    { email: 'alan.turing@emba.com', name: 'Dr. Alan Turing', role: 'PROFESSOR', status: 'APPROVED' },
    { email: 'grace.hopper@emba.com', name: 'Dr. Grace Hopper', role: 'PROFESSOR', status: 'APPROVED' },
    { email: 'richard.feynman@emba.com', name: 'Dr. Richard Feynman', role: 'PROFESSOR', status: 'APPROVED' },
    { email: 'ada.lovelace@emba.com', name: 'Dr. Ada Lovelace', role: 'PROFESSOR', status: 'APPROVED' }
  ];

  const professorMap = {};
  for (const p of professors) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, passwordHash }
    });
    professorMap[p.email] = user.id;
  }
  console.log('Professors seeded.');

  // 4. Create Students (Including default student@emba.com)
  const students = [
    { email: 'student@emba.com', name: 'Student Alice Smith', role: 'STUDENT', status: 'APPROVED' },
    { email: 'jfk@emba.com', name: 'John F. Kennedy', role: 'STUDENT', status: 'APPROVED' },
    { email: 'churchill@emba.com', name: 'Winston Churchill', role: 'STUDENT', status: 'APPROVED' },
    { email: 'eleanor@emba.com', name: 'Eleanor Roosevelt', role: 'STUDENT', status: 'APPROVED' },
    { email: 'marie.curie@emba.com', name: 'Marie Curie', role: 'STUDENT', status: 'APPROVED' },
    { email: 'mandela@emba.com', name: 'Nelson Mandela', role: 'STUDENT', status: 'APPROVED' }
  ];

  const studentMap = {};
  for (const s of students) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, passwordHash }
    });
    studentMap[s.email] = user.id;
  }
  console.log('Students seeded.');

  // 5. Create Courses, assigned to the professors
  const courses = [
    { code: 'ACC101', name: 'Financial Accounting Spec', term: 'Fall 2026', description: 'Intro to balance sheet modeling and reporting.', profEmail: 'professor@emba.com' },
    { code: 'FIN101', name: 'Corporate Finance', term: 'Fall 2026', description: 'Advanced financial analysis and asset valuation.', profEmail: 'elizabeth.blackwell@emba.com' },
    { code: 'MIS302', name: 'Management Information Systems', term: 'Fall 2026', description: 'Database systems and corporate IT architecture.', profEmail: 'alan.turing@emba.com' },
    { code: 'OPS202', name: 'Operations Management', term: 'Fall 2026', description: 'Supply chain logistics and lean scheduling designs.', profEmail: 'grace.hopper@emba.com' },
    { code: 'QMT401', name: 'Quantitative Methods', term: 'Fall 2026', description: 'Statistical decision-making and forecasting regressions.', profEmail: 'richard.feynman@emba.com' },
    { code: 'ENT301', name: 'Innovation & Entrepreneurship', term: 'Fall 2026', description: 'New venture incubation and product scaling strategies.', profEmail: 'ada.lovelace@emba.com' }
  ];

  const courseMap = {};
  for (const c of courses) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {
        professorId: professorMap[c.profEmail]
      },
      create: {
        code: c.code,
        name: c.name,
        term: c.term,
        description: c.description,
        professorId: professorMap[c.profEmail]
      }
    });
    courseMap[c.code] = course.id;
  }
  console.log('Courses seeded.');

  // 6. Enroll Students in Courses
  const enrollments = [
    // Alice Smith enrolled in ACC101 and FIN101
    { studentEmail: 'student@emba.com', courseCode: 'ACC101' },
    { studentEmail: 'student@emba.com', courseCode: 'FIN101' },

    // Marie Curie enrolled in FIN101 and QMT401
    { studentEmail: 'marie.curie@emba.com', courseCode: 'FIN101' },
    { studentEmail: 'marie.curie@emba.com', courseCode: 'QMT401' },

    // John F. Kennedy enrolled in FIN101, MIS302, and ENT301
    { studentEmail: 'jfk@emba.com', courseCode: 'FIN101' },
    { studentEmail: 'jfk@emba.com', courseCode: 'MIS302' },
    { studentEmail: 'jfk@emba.com', courseCode: 'ENT301' },

    // Winston Churchill enrolled in OPS202 and ENT301
    { studentEmail: 'churchill@emba.com', courseCode: 'OPS202' },
    { studentEmail: 'churchill@emba.com', courseCode: 'ENT301' },

    // Eleanor Roosevelt enrolled in MIS302 and OPS202
    { studentEmail: 'eleanor@emba.com', courseCode: 'MIS302' },
    { studentEmail: 'eleanor@emba.com', courseCode: 'OPS202' },

    // Nelson Mandela enrolled in FIN101, OPS202, and QMT401
    { studentEmail: 'mandela@emba.com', courseCode: 'FIN101' },
    { studentEmail: 'mandela@emba.com', courseCode: 'OPS202' },
    { studentEmail: 'mandela@emba.com', courseCode: 'QMT401' }
  ];

  for (const e of enrollments) {
    const studentId = studentMap[e.studentEmail];
    const courseId = courseMap[e.courseCode];

    await prisma.enrollment.upsert({
      where: {
        courseId_studentId: {
          courseId,
          studentId
        }
      },
      update: {},
      create: {
        courseId,
        studentId
      }
    });
  }
  console.log('Enrollments seeded.');
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
