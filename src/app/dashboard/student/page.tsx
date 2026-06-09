'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, ClipboardList, Award, Download, Upload, ExternalLink, CheckCircle, GraduationCap, Filter } from 'lucide-react';
import Card from '@/components/Card';

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
  uploadedBy: { name: string };
  createdAt: string;
  course: { code: string; name: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  createdBy: { name: string };
  course: { code: string; name: string };
  mySubmission: {
    id: string;
    fileName: string;
    submittedAt: string;
    grade: string | null;
    feedback: string | null;
    gradedAt: string | null;
  } | null;
}

interface ScheduledClass {
  id: string;
  topic: string;
  description: string | null;
  startTime: string;
  duration: number;
  zoomLink: string;
  scheduledBy: { name: string };
  course: { code: string; name: string };
  myAttendance: {
    id: string;
    markedAt: string;
    status: string;
  } | null;
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'classes' | 'assignments' | 'grades'>('syllabus');

  // Loaded data state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');

  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [classes, setClasses] = useState<ScheduledClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Submissions state
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Time state to verify class active statuses reactively
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchMyCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const syllabusRes = await fetch(`/api/syllabus?courseId=${selectedCourseId}`);
      if (syllabusRes.ok) {
        const data = await syllabusRes.json();
        setSyllabi(data.syllabi || []);
      }

      const classesRes = await fetch(`/api/classes?courseId=${selectedCourseId}`);
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClasses(data.classes || []);
      }

      const assignmentsRes = await fetch(`/api/assignments?courseId=${selectedCourseId}`);
      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyCourses();

    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (
        detail.type === 'SYLLABUS_UPDATED' ||
        detail.type === 'CLASSES_UPDATED' ||
        detail.type === 'ASSIGNMENTS_UPDATED' ||
        detail.type === 'SUBMISSIONS_UPDATED' ||
        detail.type === 'ATTENDANCE_UPDATED'
      ) {
        fetchData();
      } else if (detail.type === 'COURSES_UPDATED') {
        fetchMyCourses();
        fetchData();
      }
    };

    window.addEventListener('emba-realtime', handleRealtime);

    // Update time every 10 seconds to keep live badge and attendance checks active
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => {
      window.removeEventListener('emba-realtime', handleRealtime);
      clearInterval(timer);
    };
  }, [selectedCourseId]);

  useEffect(() => {
    fetchData();
  }, [selectedCourseId]);

  // Check if class is currently live
  const isClassLive = (item: ScheduledClass) => {
    const start = new Date(item.startTime);
    const end = new Date(start.getTime() + item.duration * 60 * 1000);
    return currentTime >= start && currentTime <= end;
  };

  // Check if check-in is open (15 mins early to 15 mins late)
  const isCheckInOpen = (item: ScheduledClass) => {
    const start = new Date(item.startTime);
    const end = new Date(start.getTime() + item.duration * 60 * 1000);
    const earlyLimit = new Date(start.getTime() - 15 * 60 * 1000);
    const lateLimit = new Date(end.getTime() + 15 * 60 * 1000);
    return currentTime >= earlyLimit && currentTime <= lateLimit;
  };

  // Mark student attendance
  const handleMarkAttendance = async (classId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        fetchData();
        alert('Attendance logged successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to mark attendance');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle assignment sheet submit
  const handleSubmitAssignment = async (e: React.FormEvent, assignmentId: string) => {
    e.preventDefault();
    if (!submissionFile) return;
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', submissionFile);

      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSubmissionFile(null);
        setActiveUploadId(null);
        fetchData();
        alert('Assignment sheet submitted successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Dashboard Top Title & Course Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>Student Workspace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Access lecture syllabus documents, join Zoom calls, submit work sheets, and view grades.</p>
        </div>

        {/* Tab & Course selector */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Enrolled Course Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', padding: '6px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-card)' }}>
            <Filter size={13} style={{ color: 'var(--text-secondary)' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              style={{ border: 'none', backgroundColor: 'transparent', fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer' }}
            >
              <option value="ALL">All Enrolled Courses</option>
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
              onClick={() => setActiveTab('classes')}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'classes' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'classes' ? 'var(--bg-card)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> Classes</span>
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
              onClick={() => setActiveTab('grades')}
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                backgroundColor: activeTab === 'grades' ? 'var(--text-primary)' : 'transparent',
                color: activeTab === 'grades' ? 'var(--bg-card)' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={14} /> Grades</span>
            </button>
          </div>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <GraduationCap size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Enrolled Courses</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto', fontSize: '14px', lineHeight: '1.5' }}>
            You are not currently enrolled in any courses for this academic term. Please contact the program administrator to complete your registration enrollment.
          </p>
        </Card>
      ) : (
        <>
          {/* Tab: SYLLABUS LIST */}
          {activeTab === 'syllabus' && (
            <Card style={{ maxWidth: '800px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Shared Syllabus Documents</h3>
              {syllabi.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>No syllabus documents shared yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {syllabi.map((s) => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {s.course.code} &bull; {s.course.name}
                        </span>
                        <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{s.title}</h4>
                        {s.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.description}</p>}
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginTop: '6px' }}>
                          Shared by {s.uploadedBy.name} &bull; {new Date(s.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={`/api/documents/download?id=${s.id}&type=syllabus`}
                        style={{
                          border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)',
                          padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '12px', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}
                        title="Download Syllabus"
                      >
                        <Download size={14} /> Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Tab: CLASSES SCHEDULE & ATTENDANCE */}
          {activeTab === 'classes' && (
            <Card style={{ maxWidth: '850px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Lecture Broadcast Schedule</h3>
              {classes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>No classes scheduled yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {classes.map((item) => {
                    const live = isClassLive(item);
                    const checkInOpen = isCheckInOpen(item);
                    const hasMarked = item.myAttendance !== null;

                    return (
                      <div key={item.id} style={{
                        border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                        backgroundColor: live ? 'rgba(0, 113, 227, 0.02)' : 'var(--bg-card)',
                        borderColor: live ? 'rgba(0, 113, 227, 0.3)' : 'var(--border-color)',
                      }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {item.course.code} &bull; {item.course.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{item.topic}</h4>
                            {live && (
                              <span style={{
                                backgroundColor: 'var(--accent-red)', color: 'white', fontSize: '9px', fontWeight: '700',
                                padding: '2px 8px', borderRadius: 'var(--radius-pill)', textTransform: 'uppercase',
                              }}>
                                Live
                              </span>
                            )}
                          </div>
                          
                          {item.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.description}</p>}
                          
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                            <span>Time: {new Date(item.startTime).toLocaleString()}</span>
                            <span>&bull;</span>
                            <span>Duration: {item.duration} mins</span>
                            <span>&bull;</span>
                            <span>Professor: {item.scheduledBy.name}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Attendance Action */}
                          {hasMarked ? (
                            <span style={{
                              display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: '600',
                              backgroundColor: 'rgba(52, 199, 89, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                            }}>
                              <CheckCircle size={14} /> Attendance Logged
                            </span>
                          ) : checkInOpen ? (
                            <button
                              onClick={() => handleMarkAttendance(item.id)}
                              style={{
                                padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none',
                                backgroundColor: 'var(--accent-green)', color: 'white', fontSize: '12px', fontWeight: '600',
                                cursor: 'pointer', transition: 'opacity 0.2s ease'
                              }}
                            >
                              Mark Attendance
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Check-in closed</span>
                          )}

                          {/* Zoom Link */}
                          <a
                            href={item.zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-card)', color: 'var(--accent-blue)', fontSize: '12px', fontWeight: '600',
                              display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                          >
                            Join Zoom <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Tab: ASSIGNMENTS UPLOADS */}
          {activeTab === 'assignments' && (
            <Card style={{ maxWidth: '850px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Your Assignments</h3>
              {assignments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>No assignments posted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {assignments.map((a) => {
                    const isUploaded = a.mySubmission !== null && a.mySubmission !== undefined;
                    const isGraded = isUploaded && a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined;

                    return (
                      <div key={a.id} style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                              {a.course.code} &bull; {a.course.name}
                            </span>
                            <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{a.title}</h4>
                            {a.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>{a.description}</p>}
                            <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                              <span>Due Date: {new Date(a.dueDate).toLocaleString()}</span>
                              <span>&bull;</span>
                              <span>Instructor: {a.createdBy.name}</span>
                            </div>
                          </div>

                          {/* Submission badge */}
                          <div>
                            {isGraded ? (
                              <span style={{
                                backgroundColor: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-green)', fontSize: '11px', fontWeight: '700',
                                padding: '4px 12px', borderRadius: 'var(--radius-pill)'
                              }}>
                                Graded: {a.mySubmission?.grade}
                              </span>
                            ) : isUploaded ? (
                              <span style={{
                                backgroundColor: 'rgba(0, 113, 227, 0.1)', color: 'var(--accent-blue)', fontSize: '11px', fontWeight: '700',
                                padding: '4px 12px', borderRadius: 'var(--radius-pill)'
                              }}>
                                Submitted
                              </span>
                            ) : (
                              <span style={{
                                backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--accent-red)', fontSize: '11px', fontWeight: '700',
                                padding: '4px 12px', borderRadius: 'var(--radius-pill)'
                              }}>
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {/* File submission slot / resubmission */}
                        {(!isUploaded || !isGraded) && (
                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                            {isUploaded && (
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                You uploaded: <strong>{a.mySubmission?.fileName}</strong> on {new Date(a.mySubmission?.submittedAt || '').toLocaleString()}. You can upload a new sheet below to replace it.
                              </p>
                            )}

                            {activeUploadId === a.id ? (
                              <form onSubmit={(e) => handleSubmitAssignment(e, a.id)} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input
                                  type="file"
                                  required
                                  onChange={(e) => setSubmissionFile(e.target.files ? e.target.files[0] : null)}
                                  style={{ fontSize: '13px' }}
                                />
                                <button
                                  type="submit"
                                  disabled={uploadLoading}
                                  style={{
                                    padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', backgroundColor: 'var(--text-primary)',
                                    color: 'var(--bg-card)', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                                  }}
                                >
                                  {uploadLoading ? 'Uploading...' : 'Submit Sheet'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setActiveUploadId(null); setSubmissionFile(null); }}
                                  style={{
                                    padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)',
                                    backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                                  }}
                                >
                                  Cancel
                                </button>
                              </form>
                            ) : (
                              <button
                                onClick={() => setActiveUploadId(a.id)}
                                style={{
                                  padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '12px', fontWeight: '600',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                              >
                                <Upload size={14} /> {isUploaded ? 'Re-upload Solution Sheet' : 'Upload Solution Sheet'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Tab: GRADES CARD REPORT */}
          {activeTab === 'grades' && (
            <Card style={{ maxWidth: '800px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>Academic Report Card</h3>
              {assignments.filter(a => a.mySubmission !== null && a.mySubmission !== undefined).length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '24px 0', textAlign: 'center' }}>No assignment submissions recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {assignments.filter(a => a.mySubmission !== null && a.mySubmission !== undefined).map((a) => {
                    const sub = a.mySubmission!;
                    return (
                      <div key={a.id} style={{ border: '1px solid var(--border-color)', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-blue)', display: 'block', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {a.course.code} &bull; {a.course.name}
                          </span>
                          <h4 style={{ fontSize: '15px', fontWeight: '700' }}>{a.title}</h4>
                          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', marginTop: '4px' }}>
                            Submitted: {new Date(sub.submittedAt).toLocaleDateString()} &bull; File: {sub.fileName}
                          </span>
                          {sub.feedback && (
                            <div style={{ marginTop: '12px', borderLeft: '3px solid var(--border-color)', paddingLeft: '12px', fontStyle: 'italic', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              &ldquo;{sub.feedback}&rdquo;
                            </div>
                          )}
                        </div>

                        <div>
                          {sub.grade ? (
                            <span style={{
                              backgroundColor: 'rgba(52, 199, 89, 0.1)', color: 'var(--accent-green)', fontSize: '14px', fontWeight: '800',
                              padding: '6px 16px', borderRadius: 'var(--radius-pill)'
                            }}>
                              {sub.grade}
                            </span>
                          ) : (
                            <span style={{
                              backgroundColor: 'rgba(255, 149, 0, 0.1)', color: 'var(--accent-yellow)', fontSize: '11px', fontWeight: '700',
                              padding: '6px 12px', borderRadius: 'var(--radius-pill)'
                            }}>
                              Ungraded
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
