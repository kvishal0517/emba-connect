import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { ClassSession, Course, Professor } from '@/app/lib/db';

// Export classes to PDF
export function exportClassScheduleToPDF(
  classes: ClassSession[],
  courses: Course[],
  professors: Professor[],
  title: string = 'Class Schedule'
) {
  const doc = new jsPDF();
  
  // Add logo/header
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // Navy blue
  doc.text('EMBA Connect', 14, 20);
  
  doc.setFontSize(14);
  doc.text(title, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 37);
  
  // Get course and professor helper
  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  const getProfessor = (professorId: string) => professors.find(p => p.id === professorId);
  
  // Prepare table data
  const tableData = classes
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .map(cls => {
      const course = getCourse(cls.courseId);
      const professor = course ? getProfessor(course.professorId) : null;
      
      return [
        format(new Date(cls.date), 'MMM dd, yyyy'),
        `${cls.startTime} - ${cls.endTime}`,
        course?.code || 'N/A',
        cls.topic,
        professor?.name || 'N/A',
        cls.status
      ];
    });
  
  // Add table
  autoTable(doc, {
    startY: 45,
    head: [['Date', 'Time', 'Course', 'Topic', 'Professor', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42], // Navy blue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { top: 45 },
    didDrawPage: (data) => {
      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });
  
  // Save PDF
  doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Export to CSV
export function exportClassScheduleToCSV(
  classes: ClassSession[],
  courses: Course[],
  professors: Professor[],
  filename: string = 'class_schedule'
) {
  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  const getProfessor = (professorId: string) => professors.find(p => p.id === professorId);
  
  // CSV Headers
  const headers = ['Date', 'Start Time', 'End Time', 'Course Code', 'Course Name', 'Topic', 'Professor', 'Department', 'Location', 'Meeting Link', 'Status'];
  
  // CSV Data
  const rows = classes
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    })
    .map(cls => {
      const course = getCourse(cls.courseId);
      const professor = course ? getProfessor(course.professorId) : null;
      
      return [
        format(new Date(cls.date), 'yyyy-MM-dd'),
        cls.startTime,
        cls.endTime,
        course?.code || '',
        course?.name || '',
        cls.topic,
        professor?.name || '',
        professor?.department || '',
        cls.location,
        cls.meetingLink,
        cls.status
      ];
    });
  
  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export assignments to PDF
export function exportAssignmentsToPDF(
  assignments: any[],
  courses: Course[],
  title: string = 'Assignments Report'
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('EMBA Connect', 14, 20);
  
  doc.setFontSize(14);
  doc.text(title, 14, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 37);
  
  const getCourse = (courseId: string) => courses.find(c => c.id === courseId);
  
  const tableData = assignments.map(assignment => {
    const course = getCourse(assignment.courseId);
    return [
      course?.code || 'N/A',
      assignment.title,
      format(new Date(assignment.dueDate), 'MMM dd, yyyy'),
      `${assignment.maxPoints} pts`,
      assignment.status
    ];
  });
  
  autoTable(doc, {
    startY: 45,
    head: [['Course', 'Title', 'Due Date', 'Points', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });
  
  doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Export generic table data to CSV
export function exportToCSV(
  headers: string[],
  data: (string | number)[][],
  filename: string = 'export'
) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export single course syllabus to PDF
export function exportSyllabusToPDF(
  course: Course,
  professor: Professor | null,
  resources: any[] = []
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('EMBA Connect', 14, 20);

  doc.setFontSize(16);
  doc.text('Course Syllabus', 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 37);

  // Course Information
  let yPosition = 50;

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(course.name, 14, yPosition);

  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Course Code: ${course.code}`, 14, yPosition);

  yPosition += 5;
  doc.text(`Credits: ${course.credits}`, 14, yPosition);

  if (professor) {
    yPosition += 5;
    doc.text(`Professor: ${professor.name}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Department: ${professor.department}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Email: ${professor.email}`, 14, yPosition);
    yPosition += 5;
    doc.text(`Office Hours: ${professor.officeHours}`, 14, yPosition);
  }

  // Course Description
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Course Description', 14, yPosition);

  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const descriptionLines = doc.splitTextToSize(course.description, 180);
  doc.text(descriptionLines, 14, yPosition);
  yPosition += descriptionLines.length * 5 + 5;

  // Course Modules
  yPosition += 5;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Course Modules', 14, yPosition);

  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  const modules = [
    '1. Introduction & Core Concepts',
    '2. Advanced Frameworks',
    '3. Case Studies & Application',
    '4. Final Project Guidelines'
  ];
  modules.forEach(module => {
    doc.text(module, 14, yPosition);
    yPosition += 5;
  });

  // Resources
  if (resources.length > 0) {
    yPosition += 5;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Course Resources', 14, yPosition);

    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);

    resources.forEach((resource, idx) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`${idx + 1}. ${resource.title} (${resource.type.toUpperCase()})`, 14, yPosition);
      yPosition += 5;
    });
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save PDF
  doc.save(`${course.code}_Syllabus_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// Export all syllabi to PDF
export function exportAllSyllabiToPDF(
  courses: Course[],
  professors: Professor[],
  resources: any[] = []
) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text('EMBA Connect', 14, 20);

  doc.setFontSize(16);
  doc.text('Complete Course Syllabi', 14, 30);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 37);
  doc.text(`Total Courses: ${courses.length}`, 14, 42);

  let yPosition = 55;

  courses.forEach((course, courseIdx) => {
    const professor = professors.find(p => p.id === course.professorId);
    const courseResources = resources.filter(r => r.courseId === course.id);

    if (courseIdx > 0) {
      doc.addPage();
      yPosition = 20;
    }

    // Course header
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(course.name, 14, yPosition);

    yPosition += 7;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${course.code} • ${course.credits} Credits`, 14, yPosition);

    if (professor) {
      yPosition += 5;
      doc.text(`Professor: ${professor.name} (${professor.department})`, 14, yPosition);
    }

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(course.description, 180);
    doc.text(descLines, 14, yPosition);
    yPosition += descLines.length * 5 + 5;

    // Resources
    if (courseResources.length > 0) {
      yPosition += 5;
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Resources:', 14, yPosition);
      yPosition += 5;
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      courseResources.forEach(res => {
        doc.text(`• ${res.title} (${res.type})`, 18, yPosition);
        yPosition += 4;
      });
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`All_Syllabi_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
