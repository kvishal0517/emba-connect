import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const mockSyllabusPath = path.join(__dirname, 'mock_syllabus.pdf');
const mockHomeworkPath = path.join(__dirname, 'mock_homework.pdf');

test.beforeAll(async () => {
  // Ensure the tests folder exists
  const testsDir = path.dirname(mockSyllabusPath);
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
  fs.writeFileSync(mockSyllabusPath, 'Mock syllabus content PDF');
  fs.writeFileSync(mockHomeworkPath, 'Mock student homework sheet PDF');

  // Clean database of previous E2E test runs to ensure a clean state
  try {
    console.log('Cleaning database test data...');
    // Delete attendance records related to the test student or class
    await prisma.attendance.deleteMany({
      where: {
        OR: [
          { student: { email: 'test_student_e2e@emba.com' } },
          { class: { topic: 'E2E Practice Session' } }
        ]
      }
    });

    // Delete submission records related to the test student or assignment
    await prisma.submission.deleteMany({
      where: {
        OR: [
          { student: { email: 'test_student_e2e@emba.com' } },
          { assignment: { title: 'Valuation Homework' } }
        ]
      }
    });

    // Delete student enrollments
    await prisma.enrollment.deleteMany({
      where: { student: { email: 'test_student_e2e@emba.com' } }
    });

    // Delete notifications related to the test users
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { user: { email: 'test_student_e2e@emba.com' } },
          { user: { email: 'temp_prof@emba.com' } },
          { message: { contains: 'Playwright' } }
        ]
      }
    });

    // Delete test classes, assignments, and syllabi
    await prisma.scheduledClass.deleteMany({
      where: { topic: 'E2E Practice Session' }
    });
    await prisma.assignment.deleteMany({
      where: { title: 'Valuation Homework' }
    });
    await prisma.syllabus.deleteMany({
      where: { title: 'Financial Accounting Spec' }
    });

    // Delete test users
    await prisma.user.deleteMany({
      where: {
        email: { in: ['test_student_e2e@emba.com', 'temp_prof@emba.com'] }
      }
    });

    // Ensure FIN101 course is assigned to Dr. Elizabeth Blackwell
    const blackwell = await prisma.user.findUnique({
      where: { email: 'elizabeth.blackwell@emba.com' }
    });
    if (blackwell) {
      await prisma.course.updateMany({
        where: { code: 'FIN101' },
        data: { professorId: blackwell.id }
      });
    }

    console.log('Database cleaned successfully.');
  } catch (err) {
    console.error('Error cleaning database:', err);
  }
});

test.afterAll(async () => {
  if (fs.existsSync(mockSyllabusPath)) fs.unlinkSync(mockSyllabusPath);
  if (fs.existsSync(mockHomeworkPath)) fs.unlinkSync(mockHomeworkPath);
  await prisma.$disconnect();
});

test.describe('EMBA Connect E2E Lifecycle Test', () => {
  test.use({ baseURL: 'http://localhost:5173' });

  // Global dialog handler to auto-accept alerts and confirms
  test.beforeEach(({ page }) => {
    page.on('dialog', async dialog => {
      console.log(`Auto-accepting dialog: [${dialog.type()}] "${dialog.message()}"`);
      await dialog.accept();
    });
  });

  const testStudentEmail = 'test_student_e2e@emba.com';
  const testStudentName = 'Playwright Test Student';
  const testPassword = 'Password123';

  test('1. Super Admin CRUD and Student Registration Signup', async ({ page }) => {
    // 1.1. Navigate to landing page
    await page.goto('/');
    await expect(page.locator('text=Academic management, simplified.')).toBeVisible();

    // 1.2. Login as Super Admin
    await page.goto('/login');
    await page.fill('#email', 'superadmin@emba.com');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    // Super admin dashboard loaded
    await page.waitForURL('/dashboard/super-admin');
    await expect(page.locator('text=Super Admin Panel')).toBeVisible();

    // 1.3. CRUD User Test: Create a temporary user
    await page.click('text=Add User');
    await page.fill('input[placeholder="Alice Johnson"]', 'Temporary Professor');
    await page.fill('input[placeholder="alice@emba.com"]', 'temp_prof@emba.com');
    await page.fill('input[placeholder="••••••••"]', 'Password123');
    await page.locator('form select').selectOption('PROFESSOR');
    await page.click('button:has-text("Create Account")');

    // Verify temp user is created
    await expect(page.locator('text=temp_prof@emba.com')).toBeVisible();

    // Edit the temporary user
    const tempUserRow = page.locator('tr:has-text("temp_prof@emba.com")');
    await tempUserRow.locator('button[title="Edit user"]').click();
    await page.fill('input[value="Temporary Professor"]', 'Temporary Professor Edited');
    await page.click('button:has-text("Save Changes")');

    // Verify edited name
    await expect(page.locator('text=Temporary Professor Edited')).toBeVisible();

    // Delete the temporary user
    await tempUserRow.locator('button[title="Delete user"]').click();

    // Verify user is gone
    await expect(page.locator('text=temp_prof@emba.com')).not.toBeVisible();

    // Log out as Super Admin
    await page.click('button:has-text("Super")');
    await page.click('text=Log Out');
    await page.waitForURL('/login');

    // 1.4. Student registers publicly (creates PENDING status)
    await page.goto('/signup');
    await page.fill('#name', testStudentName);
    await page.fill('#email', testStudentEmail);
    await page.fill('#password', testPassword);
    await page.selectOption('#role', 'STUDENT');
    await page.click('button[type="submit"]');

    // Redirected to pending approval screen
    await page.waitForURL('/pending-approval');
    await expect(page.locator('text=Approval Pending')).toBeVisible();

    // Log out as Pending Student
    await page.click('button:has-text("Log Out")');
    await page.waitForURL('/login');
  });

  test('2. Admin approves the pending student registration and enrolls them', async ({ page }) => {
    // Log in as Admin
    await page.goto('/login');
    await page.fill('#email', 'admin@emba.com');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    // Admin dashboard loaded
    await page.waitForURL('/dashboard/admin');
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    await expect(page.locator('text=Pending Approval')).toBeVisible();

    // Approve the student registration
    const studentCard = page.locator(`div:has-text("${testStudentName}")`).filter({ has: page.locator('button:has-text("Approve")') }).first();
    await studentCard.locator('button:has-text("Approve")').click();

    // Enroll student in FIN101 Course
    await page.locator('button:has-text("Courses")').click();
    await expect(page.locator('text=FIN101')).toBeVisible();
    
    // Open enrollment modal for FIN101
    const finRow = page.locator('tr:has-text("FIN101")');
    await finRow.locator('button[title="Enroll Students"]').click();

    // Toggle enrollment for Playwright Test Student
    const studentLabel = page.locator(`label:has-text("${testStudentName}")`);
    await studentLabel.locator('input[type="checkbox"]').check();
    await page.click('button:has-text("Sync Enrollment List")');

    // Log out
    await page.click('button:has-text("System")');
    await page.click('text=Log Out');
    await page.waitForURL('/login');
  });

  test('3. Professor uploads syllabus, creates assignment, and schedules Zoom', async ({ page }) => {
    // Log in as Professor Blackwell (teaching FIN101)
    await page.goto('/login');
    await page.fill('#email', 'elizabeth.blackwell@emba.com');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    // Professor dashboard loaded
    await page.waitForURL('/dashboard/professor');
    await expect(page.locator('text=Professor Workspace')).toBeVisible();

    // 3.1. Upload Syllabus
    await page.fill('input[placeholder="E.g., Course Syllabus & Timeline"]', 'Financial Accounting Spec');
    await page.fill('textarea[placeholder="Outline topics covered, office hours..."]', 'Intro to assets, liabilities, and balance sheet models.');
    await page.setInputFiles('input[type="file"]', mockSyllabusPath);
    await page.click('button:has-text("Upload & Distribute")');

    // Verify syllabus uploaded
    await expect(page.locator('text=Financial Accounting Spec')).toBeVisible();

    // 3.2. Create Assignment
    await page.locator('button:has-text("Assignments")').click();
    await page.fill('input[placeholder="Homework 1: Financial Modeling"]', 'Valuation Homework');
    await page.fill('textarea[placeholder="Outline the steps and upload templates here..."]', 'Build an DCF model of a listed stock.');
    
    // Set due date to tomorrow in local time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}T${String(tomorrow.getHours()).padStart(2, '0')}:${String(tomorrow.getMinutes()).padStart(2, '0')}`;
    await page.fill('input[type="datetime-local"]', dateString);
    await page.click('button:has-text("Post Assignment")');

    // Verify assignment posted
    await expect(page.locator('text=Valuation Homework')).toBeVisible();

    // 3.3. Schedule Zoom Meeting
    await page.locator('button:has-text("Zoom Class")').click();
    await page.fill('input[placeholder="E.g., Lecture 3: Option Models"]', 'E2E Practice Session');
    await page.fill('input[placeholder="Topics, pre-reads..."]', 'Class E2E testing practice review.');
    
    // Set zoom start time in local time (set to 5 mins early so check-in window is open)
    const tenMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const timeString = `${tenMinsAgo.getFullYear()}-${String(tenMinsAgo.getMonth() + 1).padStart(2, '0')}-${String(tenMinsAgo.getDate()).padStart(2, '0')}T${String(tenMinsAgo.getHours()).padStart(2, '0')}:${String(tenMinsAgo.getMinutes()).padStart(2, '0')}`;
    await page.fill('input[type="datetime-local"]', timeString);
    await page.fill('input[placeholder="60"]', '60');
    await page.fill('input[placeholder="https://zoom.us/j/123456789..."]', 'https://zoom.us/j/99999999999');
    await page.click('button:has-text("Schedule & Broadcast")');

    // Verify class scheduled
    await expect(page.locator('text=E2E Practice Session')).toBeVisible();

    // Log out
    await page.click('button:has-text("Dr.")');
    await page.click('text=Log Out');
    await page.waitForURL('/login');
  });

  test('4. Student downloads syllabus, marks attendance, and submits assignment', async ({ page }) => {
    // Log in as Student
    await page.goto('/login');
    await page.fill('#email', testStudentEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');

    // Student dashboard loaded
    await page.waitForURL('/dashboard/student');
    await expect(page.locator('text=Student Workspace')).toBeVisible();

    // Verify syllabus document exists
    await expect(page.locator('text=Financial Accounting Spec')).toBeVisible();

    // 4.1. Mark Class Attendance
    await page.locator('button:has-text("Classes")').click();
    await expect(page.locator('text=E2E Practice Session')).toBeVisible();
    await expect(page.locator('text=Live')).toBeVisible();
    await page.click('button:has-text("Mark Attendance")');

    // Verify attendance state updated
    await expect(page.locator('text=Attendance Logged')).toBeVisible();

    // 4.2. Submit Assignment Sheet
    await page.locator('button:has-text("Assignments")').click();
    await expect(page.locator('text=Valuation Homework')).toBeVisible();
    await page.click('button:has-text("Upload Solution Sheet")');
    await page.setInputFiles('input[type="file"]', mockHomeworkPath);
    await page.click('button:has-text("Submit Sheet")');

    // Verify submission submitted
    await expect(page.locator('text=Submitted')).toBeVisible();

    // Log out
    await page.click('button:has-text("Playwright")');
    await page.click('text=Log Out');
    await page.waitForURL('/login');
  });

  test('5. Professor grades submission and checks attendance logs', async ({ page }) => {
    // Log in as Professor Blackwell
    await page.goto('/login');
    await page.fill('#email', 'elizabeth.blackwell@emba.com');
    await page.fill('#password', 'Password123');
    await page.click('button[type="submit"]');

    // Professor dashboard loaded
    await page.waitForURL('/dashboard/professor');

    // Go to assignments and open submissions
    await page.locator('button:has-text("Assignments")').click();
    const valuationRow = page.locator('div:has-text("Valuation Homework")').filter({ has: page.locator('button:has-text("Submissions")') }).first();
    await valuationRow.locator('button:has-text("Submissions")').click();

    // Grade student submission
    const studentRow = page.locator(`div:has-text("${testStudentName}")`).filter({ has: page.locator('button:has-text("Grade")') }).first();
    await studentRow.locator('button:has-text("Grade")').click();

    await page.fill('input[placeholder="E.g., A, 95%, 48/50"]', 'A+');
    await page.fill('textarea[placeholder="Great structuring of models, check your calculations on tab 2..."]', 'Excellent balance sheet forecasting!');
    await page.click('button:has-text("Submit Grade Evaluation")');

    // Wait for grading modal to close
    await expect(page.locator('h3:has-text("Grade Submission:")')).not.toBeVisible();

    // Close submissions modal
    await page.click('button[aria-label="Close modal"]');

    // Wait for submissions modal to close
    await expect(page.locator('h3:has-text("Submissions:")')).not.toBeVisible();

    // Go to attendance tab
    await page.locator('button:has-text("Attendance")').click();
    const classRow = page.locator('div:has-text("E2E Practice Session")').filter({ has: page.locator('button:has-text("Open Attendance Log")') }).first();
    await classRow.locator('button:has-text("Open Attendance Log")').click();

    // Verify student is marked PRESENT
    const studentAttendanceRow = page.locator(`tr:has-text("${testStudentName}")`);
    await expect(studentAttendanceRow.locator('text=PRESENT')).toBeVisible();

    // Log out
    await page.click('button[aria-label="Close modal"]'); // Close attendance log
    await expect(page.locator('h3:has-text("Attendance:")')).not.toBeVisible();
    await page.click('button:has-text("Dr.")');
    await page.click('text=Log Out');
    await page.waitForURL('/login');
  });

  test('6. Student verifies updated grade card and alerts', async ({ page }) => {
    // Log in as Student
    await page.goto('/login');
    await page.fill('#email', testStudentEmail);
    await page.fill('#password', testPassword);
    await page.click('button[type="submit"]');

    // Student dashboard loaded
    await page.waitForURL('/dashboard/student');

    // Go to Grades tab
    await page.locator('button:has-text("Grades")').click();
    await expect(page.locator('text=Valuation Homework')).toBeVisible();
    await expect(page.locator('text=A+')).toBeVisible();
    await expect(page.locator('text=Excellent balance sheet forecasting!')).toBeVisible();
  });
});
