'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ClipboardList, CheckSquare, Plus, Trash2, Download, Award, Check, X, Filter, GraduationCap } from 'lucide-react';
import Card from '@/components/Card';
import Modal from '@/components/Modal';

interface Course {
  id: string;
  code: string;
  name: string;
  term: string;
}

interface Syllabus {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  createdAt: string;
  course: { code: string; name: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  course: { code: string; name: string };
  _count?: { submissions: number };
}

interface Submission {
  id: string;
  fileName: string;
  submittedAt: string;
  grade: string | null;
  feedback: string | null;
  student: {
    id: string;
    name: string;
    email: string;
  };
}

interface ScheduledClass {
  id: string;
  topic: string;
  description: string | null;
  startTime: string;
  duration: number;
  zoomLink: string;
  course: { code: string; name: string };
}

interface AttendanceRecord {
  studentId: string;
  name: string;
  email: string;
  markedAt: string | null;
  status: string;
}

export default function ProfessorDashboard() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'assignments' | 'zoom' | 'attendance'>('syllabus');

  // Loaded data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');

  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<ScheduledClass[]>([]);

  // Form Course selection states
  const [syllabusCourseId, setSyllabusCourseId] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('');
  const [zoomCourseId, setZoomCourseId] = useState('');

  // 1. Syllabus states
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [syllabusTitle, setSyllabusTitle] = useState('');
  const [syllabusDesc, setSyllabusDesc] = useState('');
  const [syllabusLoading, setSyllabusLoading] = useState(false);

  // 2. Assignment states
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
  
  // Grading states
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [formGrade, setFormGrade] = useState('');
  const [formFeedback, setFormFeedback] = useState('');

  // 3. Zoom scheduling states
  const [zoomTopic, setZoomTopic] = useState('');
  const [zoomDesc, setZoomDesc] = useState('');
  const [zoomTime, setZoomTime] = useState('');
  const [zoomDuration, setZoomDuration] = useState('60');
  const [zoomLink, setZoomLink] = useState('');

  // 4. Attendance tracker states
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

  const fetchMyCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        const myTaughtCourses = data.courses || [];
        setCourses(myTaughtCourses);
        if (myTaughtCourses.length > 0) {
          setSyllabusCourseId(myTaughtCourses[0].id);
          setAssignCourseId(myTaughtCourses[0].id);
          setZoomCourseId(myTaughtCourses[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSyllabi = async () => {
    const res = await fetch(`/api/syllabus?courseId=${selectedCourseId}`);
    if (res.ok) {
      const data = await res.json();
      setSyllabi(data.syllabi || []);
    }
  };

  const fetchAssignments = async () => {
    const res = await fetch(`/api/assignments?courseId=${selectedCourseId}`);
    if (res.ok) {
      const data = await res.json();
      setAssignments(data.assignments || []);
    }
  };

  const fetchClasses = async () => {
    const res = await fetch(`/api/classes?courseId=${selectedCourseId}`);
    if (res.ok) {
      const data = await res.json();
      setClasses(data.classes || []);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  useEffect(() => {
    fetchSyllabi();
    fetchAssignments();
    fetchClasses();

    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === 'SYLLABUS_UPDATED') {
        fetchSyllabi();
      } else if (detail.type === 'ASSIGNMENTS_UPDATED') {
        fetchAssignments();
      } else if (detail.type === 'CLASSES_UPDATED') {
        fetchClasses();
      } else if (detail.type === 'SUBMISSIONS_UPDATED') {
        fetchAssignments();
        if (isSubmissionsModalOpen && selectedAssignment) {
          fetchSubmissions(selectedAssignment.id);
        }
      } else if (detail.type === 'ATTENDANCE_UPDATED') {
        if (isAttendanceModalOpen && selectedClass) {
          fetchAttendance(selectedClass.id);
        }
      } else if (detail.type === 'COURSES_UPDATED') {
        fetchMyCourses();
      }
    };

    window.addEventListener('emba-realtime', handleRealtime);

    return () => {
      window.removeEventListener('emba-realtime', handleRealtime);
    };
  }, [selectedCourseId, isSubmissionsModalOpen, selectedAssignment, isAttendanceModalOpen, selectedClass]);

  // Sync active course tab forms when top-level selection changes
  useEffect(() => {
    if (selectedCourseId !== 'ALL') {
      setSyllabusCourseId(selectedCourseId);
      setAssignCourseId(selectedCourseId);
      setZoomCourseId(selectedCourseId);
    } else if (courses.length > 0) {
      setSyllabusCourseId(courses[0].id);
      setAssignCourseId(courses[0].id);
      setZoomCourseId(courses[0].id);
    }
  }, [selectedCourseId, courses]);

  // Handle Syllabus upload
  const handleUploadSyllabus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syllabusFile || !syllabusTitle || !syllabusCourseId) return;
    setSyllabusLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', syllabusFile);
      formData.append('title', syllabusTitle);
      formData.append('description', syllabusDesc);
      formData.append('courseId', syllabusCourseId);

      const res = await fetch('/api/syllabus', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSyllabusTitle('');
        setSyllabusDesc('');
        setSyllabusFile(null);
        // Reset file input element manually
        const fileInput = document.getElementById('syllabus-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        fetchSyllabi();
        alert('Syllabus uploaded and broadcasted successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload syllabus');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSyllabusLoading(false);
    }
  };

  const handleDeleteSyllabus = async (id: string) => {
    if (!confirm('Delete this syllabus?')) return;
    const res = await fetch(`/api/syllabus/${id}`, { method: 'DELETE' });
    if (res.ok) fetchSyllabi();
  };

  // Handle Assignment creation
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle || !assignDueDate || !assignCourseId) return;

    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignTitle,
          description: assignDesc,
          dueDate: assignDueDate,
          courseId: assignCourseId,
        }),
      });

      if (res.ok) {
        setAssignTitle('');
        setAssignDesc('');
        setAssignDueDate('');
        fetchAssignments();
        alert('Assignment posted successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to post assignment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment? This deletes all student submissions for it too.')) return;
    const res = await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    if (res.ok) fetchAssignments();
  };

  // Fetch assignment submissions data without opening the modal
  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submissions`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // View assignment submissions
  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionsModalOpen(true);
    await fetchSubmissions(assignment.id);
  };

  // Open grading modal
  const openGradingModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setFormGrade(sub.grade || '');
    setFormFeedback(sub.feedback || '');
    setIsGradingModalOpen(true);
  };

  // Submit student grade
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !formGrade) return;

    try {
      const res = await fetch(`/api/assignments/submissions/${selectedSubmission.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: formGrade,
          feedback: formFeedback,
        }),
      });

      if (res.ok) {
        setIsGradingModalOpen(false);
        if (selectedAssignment) {
          fetchSubmissions(selectedAssignment.id);
        }
        alert('Submission graded successfully!');
      } else {
        alert('Failed to submit grade');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Zoom Scheduler
  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoomTopic || !zoomTime || !zoomLink || !zoomCourseId) return;

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: zoomTopic,
          description: zoomDesc,
          startTime: zoomTime,
          duration: Number(zoomDuration),
          zoomLink,
          courseId: zoomCourseId,
        }),
      });

      if (res.ok) {
        setZoomTopic('');
        setZoomDesc('');
        setZoomTime('');
        setZoomLink('');
        fetchClasses();
        alert('Zoom class scheduled and students notified!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to schedule class');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Delete this scheduled class?')) return;
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    if (res.ok) fetchClasses();
  };

  // Fetch class attendance records without opening the modal
  const fetchAttendance = async (classId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}/attendance`);
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data.attendances || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // View Class Attendance sheet
  const handleViewAttendance = async (item: ScheduledClass) => {
    setSelectedClass(item);
    setIsAttendanceModalOpen(true);
    await fetchAttendance(item.id);
  };

  // Professor toggle manual student attendance status
  const handleToggleAttendance = async (studentId: string, currentStatus: string) => {
    if (!selectedClass) return;
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';

    try {
      const res = await fetch(`/api/classes/${selectedClass.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchAttendance(selectedClass.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Title & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>Professor Workspace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Distribute syllabi, schedule lectures, manage assignments, and record student marks.</p>
        </div>

        {/* Filters dropdown & Tab Switcher */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Top Course Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-card)' }}>
            <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Course:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">All Taught Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', border: '1px solid var(--border-color)', padding: '4px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-card)' }}>
            <button
              onClick={() => setActiveTab('syllabus')}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'syllabus' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'syllabus' ? 'var(--bg-card)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BookOpen size={14} /> Syllabus</span>
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'assignments' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'assignments' ? 'var(--bg-card)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ClipboardList size={14} /> Assignments</span>
            </button>
            <button
              onClick={() => setActiveTab('zoom')}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'zoom' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'zoom' ? 'var(--bg-card)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Zoom Class</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'attendance' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'attendance' ? 'var(--bg-card)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckSquare size={14} /> Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <GraduationCap size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Courses Assigned</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
            You are not assigned as an instructor to any courses for the current term. Please contact an Administrator to configure your course assignments.
          </p>
        </Card>
      ) : (
        <>
          {/* Tab Contents: SYLLABUS */}
          {activeTab === 'syllabus' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
              {/* Upload syllabus form */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Upload Syllabus</h3>
                <form onSubmit={handleUploadSyllabus} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Course</label>
                    <select
                      value={syllabusCourseId}
                      onChange={(e) => setSyllabusCourseId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Document Title</label>
                    <input
                      type="text"
                      required
                      value={syllabusTitle}
                      onChange={(e) => setSyllabusTitle(e.target.value)}
                      placeholder="E.g., Course Syllabus & Timeline"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Brief Description</label>
                    <textarea
                      value={syllabusDesc}
                      onChange={(e) => setSyllabusDesc(e.target.value)}
                      placeholder="Outline topics covered, office hours..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Syllabus File (PDF, Word, etc.)</label>
                    <input
                      id="syllabus-file-input"
                      type="file"
                      required
                      onChange={(e) => setSyllabusFile(e.target.files ? e.target.files[0] : null)}
                      style={{ fontSize: '13px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={syllabusLoading}
                    style={{
                      width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'opacity 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {syllabusLoading ? 'Uploading...' : 'Upload & Distribute'}
                  </button>
                </form>
              </Card>

              {/* List of uploaded syllabi */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Uploaded Documents</h3>
                {syllabi.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>No syllabus documents uploaded yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {syllabi.map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {s.course.code}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{s.title}</h4>
                          {s.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.description}</p>}
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginTop: '6px' }}>
                            File: {s.fileName} &bull; Uploaded {new Date(s.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <a
                            href={`/api/documents/download?id=${s.id}&type=syllabus`}
                            style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '50%', color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            title="Download file"
                          >
                            <Download size={15} />
                          </a>
                          <button
                            onClick={() => handleDeleteSyllabus(s.id)}
                            style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '50%', color: 'var(--accent-red)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            title="Delete document"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Tab Contents: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
              {/* Create assignment form */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Post Assignment</h3>
                <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Course</label>
                    <select
                      value={assignCourseId}
                      onChange={(e) => setAssignCourseId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Assignment Title</label>
                    <input
                      type="text"
                      required
                      value={assignTitle}
                      onChange={(e) => setAssignTitle(e.target.value)}
                      placeholder="Homework 1: Financial Modeling"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Instructions / Description</label>
                    <textarea
                      value={assignDesc}
                      onChange={(e) => setAssignDesc(e.target.value)}
                      placeholder="Outline the steps and upload templates here..."
                      rows={3}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Due Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={assignDueDate}
                      onChange={(e) => setAssignDueDate(e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'opacity 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Post Assignment
                  </button>
                </form>
              </Card>

              {/* List of assignments */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Current Assignments</h3>
                {assignments.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>No assignments posted yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignments.map((a) => (
                      <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {a.course.code}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{a.title}</h4>
                          {a.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{a.description}</p>}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                            <span>Due: {new Date(a.dueDate).toLocaleString()}</span>
                            <span>&bull;</span>
                            <span style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>
                              Submissions: {a._count?.submissions || 0}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleViewSubmissions(a)}
                            style={{
                              border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: '600', color: 'var(--accent-blue)', backgroundColor: 'var(--bg-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <Award size={13} /> Submissions
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(a.id)}
                            style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '50%', color: 'var(--accent-red)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            title="Delete assignment"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Tab Contents: ZOOM MEETING SCHEDULER */}
          {activeTab === 'zoom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', alignItems: 'start' }}>
              {/* Schedule form */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Schedule Class Session</h3>
                <form onSubmit={handleScheduleClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Target Course</label>
                    <select
                      value={zoomCourseId}
                      onChange={(e) => setZoomCourseId(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Session Topic</label>
                    <input
                      type="text"
                      required
                      value={zoomTopic}
                      onChange={(e) => setZoomTopic(e.target.value)}
                      placeholder="E.g., Lecture 3: Option Models"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Short Description</label>
                    <input
                      type="text"
                      value={zoomDesc}
                      onChange={(e) => setZoomDesc(e.target.value)}
                      placeholder="Topics, pre-reads..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Start Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={zoomTime}
                        onChange={(e) => setZoomTime(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Duration (min)</label>
                      <input
                        type="number"
                        required
                        value={zoomDuration}
                        onChange={(e) => setZoomDuration(e.target.value)}
                        placeholder="60"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Zoom Invite Link</label>
                    <input
                      type="url"
                      required
                      value={zoomLink}
                      onChange={(e) => setZoomLink(e.target.value)}
                      placeholder="https://zoom.us/j/123456789..."
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px', transition: 'opacity 0.2s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Schedule & Broadcast
                  </button>
                </form>
              </Card>

              {/* List of classes */}
              <Card>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Lecture Broadcasts</h3>
                {classes.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>No classes scheduled yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {classes.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {item.course.code}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{item.topic}</h4>
                          {item.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.description}</p>}
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                            <span>Time: {new Date(item.startTime).toLocaleString()}</span>
                            <span>&bull;</span>
                            <span>Duration: {item.duration} mins</span>
                          </div>
                          <a href={item.zoomLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-blue)', display: 'inline-block', marginTop: '6px', fontWeight: '500' }}>
                            {item.zoomLink.substring(0, 45)}...
                          </a>
                        </div>
                        <div>
                          <button
                            onClick={() => handleDeleteClass(item.id)}
                            style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '50%', color: 'var(--accent-red)', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            title="Cancel class"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Tab Contents: ATTENDANCE TRACKER LIST */}
          {activeTab === 'attendance' && (
            <Card>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Attendance Reports by Session</h3>
              {classes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '24px 0', textAlign: 'center' }}>Schedule a class first to track attendance.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {classes.map((item) => (
                    <Card key={item.id} style={{ padding: '20px', border: '1px solid var(--border-color)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                          {item.course.code}
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{item.topic}</h4>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                          {new Date(item.startTime).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewAttendance(item)}
                        style={{
                          width: '100%', padding: '10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-page)')}
                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                      >
                        <CheckSquare size={14} /> Open Attendance Log
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          )}
        </>
      )}

      {/* Modal: View & Grade Submissions */}
      <Modal isOpen={isSubmissionsModalOpen} onClose={() => setIsSubmissionsModalOpen(false)} title={`Submissions: ${selectedAssignment?.title}`}>
        {submissions.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No student submissions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
            {submissions.map((sub) => (
              <div key={sub.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{sub.student.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{sub.student.email}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginTop: '4px' }}>
                    Submitted: {new Date(sub.submittedAt).toLocaleString()}
                  </span>
                  
                  {/* Grade Display */}
                  {sub.grade ? (
                    <div style={{ marginTop: '8px', fontSize: '12px' }}>
                      <span style={{ backgroundColor: 'rgba(52,199,89,0.1)', color: 'var(--accent-green)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontWeight: '700' }}>
                        Grade: {sub.grade}
                      </span>
                      {sub.feedback && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>&ldquo;{sub.feedback}&rdquo;</p>}
                    </div>
                  ) : (
                    <span style={{ display: 'inline-block', marginTop: '8px', backgroundColor: 'rgba(255,149,0,0.1)', color: 'var(--accent-yellow)', padding: '2px 8px', borderRadius: 'var(--radius-pill)', fontSize: '10px', fontWeight: '700' }}>
                      Ungraded
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`/api/documents/download?id=${sub.id}&type=submission`}
                    style={{ border: '1px solid var(--border-color)', padding: '8px', borderRadius: '50%', color: 'var(--accent-blue)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    title="Download submission file"
                  >
                    <Download size={14} />
                  </a>
                  <button
                    onClick={() => openGradingModal(sub)}
                    style={{ border: '1px solid var(--accent-blue)', backgroundColor: 'rgba(0,113,227,0.05)', color: 'var(--accent-blue)', padding: '8px 12px', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Grade
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Modal: Input Grade & Feedback */}
      <Modal isOpen={isGradingModalOpen} onClose={() => setIsGradingModalOpen(false)} title={`Grade Submission: ${selectedSubmission?.student.name}`}>
        {selectedSubmission && (
          <form onSubmit={handleGradeSubmission} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>File submitted: <strong>{selectedSubmission.fileName}</strong></p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Marks / Grade</label>
              <input
                type="text"
                required
                value={formGrade}
                onChange={(e) => setFormGrade(e.target.value)}
                placeholder="E.g., A, 95%, 48/50"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Feedback Comments</label>
              <textarea
                value={formFeedback}
                onChange={(e) => setFormFeedback(e.target.value)}
                placeholder="Great structuring of models, check your calculations on tab 2..."
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer' }}
            >
              Submit Grade Evaluation
            </button>
          </form>
        )}
      </Modal>

      {/* Modal: View Class Attendance Sheet */}
      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title={`Attendance: ${selectedClass?.topic}`}>
        <div style={{ maxHeight: '60vh', overflowY: 'auto', margin: '0 -20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                <th style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Student</th>
                <th style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Check-in Time</th>
                <th style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Override</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No students enrolled in this course.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((rec) => (
                  <tr key={rec.studentId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontWeight: '600', display: 'block' }}>{rec.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{rec.email}</span>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--text-secondary)' }}>
                      {rec.markedAt ? new Date(rec.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '700',
                        backgroundColor: rec.status === 'PRESENT' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
                        color: rec.status === 'PRESENT' ? 'var(--accent-green)' : 'var(--accent-red)',
                      }}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleAttendance(rec.studentId, rec.status)}
                        style={{
                          border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)',
                          padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '11px', fontWeight: '600', cursor: 'pointer',
                        }}
                      >
                        {rec.status === 'PRESENT' ? 'Mark Absent' : 'Mark Present'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
