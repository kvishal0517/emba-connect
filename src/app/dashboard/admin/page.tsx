'use client';

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar, Plus, Edit2, Trash2, Check, UserMinus, GraduationCap, UserPlus } from 'lucide-react';
import Card from '@/components/Card';
import Modal from '@/components/Modal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  term: string;
  professorId: string | null;
  professor: { id: string; name: string } | null;
  enrollments: Array<{ student: { id: string; name: string; email: string } }>;
  _count: { enrollments: number };
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [syllabiCount, setSyllabiCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);

  // UI State
  const [activeTab, setActiveTab] = useState<'pending' | 'manage' | 'courses'>('pending');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Course Modal states
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // User Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('STUDENT');
  const [formStatus, setFormStatus] = useState('APPROVED');
  const [formError, setFormError] = useState('');

  // Course Form states
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseTerm, setCourseTerm] = useState('Current Term');
  const [courseProfId, setCourseProfId] = useState('');
  const [courseError, setCourseError] = useState('');

  // Student enrollments state
  const [enrolledStudentIds, setEnrolledStudentIds] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      const coursesRes = await fetch('/api/courses');
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }

      const syllabusRes = await fetch('/api/syllabus');
      if (syllabusRes.ok) {
        const data = await syllabusRes.json();
        setSyllabiCount(data.syllabi?.length || 0);
      }

      const classesRes = await fetch('/api/classes');
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClassesCount(data.classes?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (
        detail.type === 'USERS_UPDATED' ||
        detail.type === 'COURSES_UPDATED' ||
        detail.type === 'NOTIFICATIONS_UPDATED'
      ) {
        fetchData();
      }
    };

    window.addEventListener('emba-realtime', handleRealtime);

    return () => {
      window.removeEventListener('emba-realtime', handleRealtime);
    };
  }, []);

  // Filter out Admins and Super Admins, because normal Admins cannot manage them
  const manageableUsers = users.filter(
    (u) => u.role === 'PROFESSOR' || u.role === 'STUDENT'
  );

  const pendingRegistrations = manageableUsers.filter((u) => u.status === 'PENDING');
  const approvedUsers = manageableUsers.filter((u) => u.status === 'APPROVED');

  const filteredManageableUsers = approvedUsers.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredCourses = courses.filter((c) => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.professor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const professors = users.filter(u => u.role === 'PROFESSOR' && u.status === 'APPROVED');
  const approvedStudents = users.filter(u => u.role === 'STUDENT' && u.status === 'APPROVED');

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });

      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve user');
      }
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject and delete this registration?')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject user');
      }
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');

      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setIsAddModalOpen(false);
      fetchData();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormPassword('');
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError('');

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          role: formRole,
          status: formStatus,
          password: formPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // COURSE CRUD HANDLERS
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCourseError('');
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: courseCode,
          name: courseName,
          description: courseDesc,
          term: courseTerm,
          professorId: courseProfId || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create course');

      setIsAddCourseOpen(false);
      setCourseCode('');
      setCourseName('');
      setCourseDesc('');
      setCourseTerm('Current Term');
      setCourseProfId('');
      fetchData();
    } catch (err: any) {
      setCourseError(err.message);
    }
  };

  const openEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setCourseCode(course.code);
    setCourseName(course.name);
    setCourseDesc(course.description || '');
    setCourseTerm(course.term);
    setCourseProfId(course.professorId || '');
    setCourseError('');
    setIsEditCourseOpen(true);
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setCourseError('');
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: courseCode,
          name: courseName,
          description: courseDesc,
          term: courseTerm,
          professorId: courseProfId || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update course');

      setIsEditCourseOpen(false);
      setSelectedCourse(null);
      fetchData();
    } catch (err: any) {
      setCourseError(err.message);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course? All associated syllabi, assignments, and class lectures will be deleted.')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete course');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEnrollModal = (course: Course) => {
    setSelectedCourse(course);
    const currentlyEnrolledIds = course.enrollments.map(e => e.student.id);
    setEnrolledStudentIds(currentlyEnrolledIds);
    setIsEnrollModalOpen(true);
  };

  const handleToggleEnrollment = (studentId: string) => {
    setEnrolledStudentIds(prev => 
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSaveEnrollments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: enrolledStudentIds })
      });
      if (res.ok) {
        setIsEnrollModalOpen(false);
        setSelectedCourse(null);
        fetchData();
        alert('Student enrollments synchronized successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to enroll students');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Approve accounts, manage professors & students, and organize courses.</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', border: '1px solid var(--border-color)', padding: '4px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-card)' }}>
          <button
            onClick={() => { setActiveTab('pending'); setSearchQuery(''); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              backgroundColor: activeTab === 'pending' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'pending' ? 'var(--bg-card)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Pending Approval ({pendingRegistrations.length})
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('manage'); setSearchQuery(''); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              backgroundColor: activeTab === 'manage' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'manage' ? 'var(--bg-card)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Manage Users
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('courses'); setSearchQuery(''); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              backgroundColor: activeTab === 'courses' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'courses' ? 'var(--bg-card)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GraduationCap size={14} /> Courses
            </span>
          </button>
        </div>
      </div>

      {/* Grid of stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,113,227,0.08)', color: 'var(--accent-blue)' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Workspace Accounts</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>
              {users.filter((u) => u.status === 'APPROVED').length}
            </h3>
          </div>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(52,199,89,0.08)', color: 'var(--accent-green)' }}>
            <BookOpen size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Academic Syllabi</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{syllabiCount}</h3>
          </div>
        </Card>

        <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,149,0,0.08)', color: 'var(--accent-yellow)' }}>
            <Calendar size={20} />
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Scheduled Classes</span>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{classesCount}</h3>
          </div>
        </Card>
      </div>

      {/* Tab: PENDING REGISTRATIONS */}
      {activeTab === 'pending' && (
        <Card>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Pending Registration Approvals
          </h3>
          {pendingRegistrations.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', padding: '32px 0', textAlign: 'center', fontSize: '14px' }}>
              No registrations waiting for approval.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {pendingRegistrations.map((u) => (
                <Card key={u.id} style={{ border: '1px solid var(--border-color)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{u.name}</h4>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{u.email}</span>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '9px', fontWeight: '700', marginTop: '8px',
                      backgroundColor: u.role === 'PROFESSOR' ? 'rgba(175,82,222,0.1)' : 'rgba(255,149,0,0.1)',
                      color: u.role === 'PROFESSOR' ? '#af52de' : 'var(--accent-yellow)',
                    }}>
                      Requested Role: {u.role}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleApprove(u.id)}
                      style={{
                        padding: '10px', backgroundColor: 'var(--accent-green)', color: 'white', border: 'none',
                        borderRadius: 'var(--radius-pill)', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(u.id)}
                      style={{
                        padding: '10px', backgroundColor: 'transparent', border: '1px solid var(--border-color)',
                        color: 'var(--accent-red)', borderRadius: 'var(--radius-pill)', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}
                    >
                      <UserMinus size={14} /> Reject
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab: MANAGE USERS */}
      {activeTab === 'manage' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>Professors & Students Directory</h3>
            <button
              onClick={() => {
                setFormError('');
                setFormName('');
                setFormEmail('');
                setFormPassword('');
                setFormRole('STUDENT');
                setIsAddModalOpen(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 113, 227, 0.2)', transition: 'opacity 0.2s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={14} /> Add User
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search directory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, minWidth: '200px', padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="PROFESSOR">Professors</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto', margin: '0 -24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email Address</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Date Added</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManageableUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No accounts match your query.
                    </td>
                  </tr>
                ) : (
                  filteredManageableUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 24px', fontWeight: '500' }}>{u.name}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: '700',
                          backgroundColor: u.role === 'PROFESSOR' ? 'rgba(175,82,222,0.1)' : 'rgba(255,149,0,0.1)',
                          color: u.role === 'PROFESSOR' ? '#af52de' : 'var(--accent-yellow)',
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-tertiary)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(u)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px' }}
                            title="Edit User"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '6px' }}
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>Courses Directory</h3>
            <button
              onClick={() => {
                setCourseError('');
                setCourseCode('');
                setCourseName('');
                setCourseDesc('');
                setCourseTerm('Current Term');
                setCourseProfId('');
                setIsAddCourseOpen(true);
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 113, 227, 0.2)', transition: 'opacity 0.2s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={14} /> Add Course
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search by course code, title, or professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              }}
            />
          </div>

          <div style={{ overflowX: 'auto', margin: '0 -24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Code</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Course Title</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Term</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Professor</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Students Enrolled</th>
                  <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No courses registered yet.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '14px 24px', fontWeight: '700', color: 'var(--accent-blue)' }}>{c.code}</td>
                      <td style={{ padding: '14px 24px', fontWeight: '500' }}>{c.name}</td>
                      <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{c.term}</td>
                      <td style={{ padding: '14px 24px' }}>
                        {c.professor ? (
                          <span style={{ fontWeight: '500' }}>{c.professor.name}</span>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700',
                          backgroundColor: 'rgba(52,199,89,0.1)', color: 'var(--accent-green)'
                        }}>
                          {c._count?.enrollments || 0} Enrolled
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEnrollModal(c)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#af52de', padding: '6px' }}
                            title="Enroll Students"
                          >
                            <UserPlus size={15} />
                          </button>
                          <button
                            onClick={() => openEditCourse(c)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px' }}
                            title="Edit course"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '6px' }}
                            title="Delete course"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal: Add User */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Account">
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              {formError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Alice Johnson"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="alice@emba.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              required
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>System Role</label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="STUDENT">Student</option>
              <option value="PROFESSOR">Professor</option>
            </select>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
          >
            Create Account
          </button>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Account Details">
        {selectedUser && (
          <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                {formError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>New Password (Leave blank to keep current)</label>
              <input
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>System Role</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="STUDENT">Student</option>
                  <option value="PROFESSOR">Professor</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Approval Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
            >
              Save Changes
            </button>
          </form>
        )}
      </Modal>

      {/* Modal: Add Course */}
      <Modal isOpen={isAddCourseOpen} onClose={() => setIsAddCourseOpen(false)} title="Create New Course">
        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {courseError && (
            <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              {courseError}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course Code</label>
            <input
              type="text"
              required
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g., FIN101"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course Name</label>
            <input
              type="text"
              required
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g., Corporate Finance Management"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course Description</label>
            <textarea
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              placeholder="Brief summary of syllabus objectives..."
              rows={2}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Academic Term</label>
              <input
                type="text"
                required
                value={courseTerm}
                onChange={(e) => setCourseTerm(e.target.value)}
                placeholder="Current Term"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Assign Professor</label>
              <select
                value={courseProfId}
                onChange={(e) => setCourseProfId(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">Unassigned / Select Professor</option>
                {professors.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            style={{ width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
          >
            Create Course
          </button>
        </form>
      </Modal>

      {/* Modal: Edit Course */}
      <Modal isOpen={isEditCourseOpen} onClose={() => setIsEditCourseOpen(false)} title="Modify Course Details">
        {selectedCourse && (
          <form onSubmit={handleEditCourse} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courseError && (
              <div style={{ backgroundColor: 'rgba(255, 59, 48, 0.08)', color: 'var(--accent-red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
                {courseError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course Code</label>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course Name</label>
              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Course Description</label>
              <textarea
                value={courseDesc}
                onChange={(e) => setCourseDesc(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Academic Term</label>
                <input
                  type="text"
                  required
                  value={courseTerm}
                  onChange={(e) => setCourseTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '4px' }}>Assign Professor</label>
                <select
                  value={courseProfId}
                  onChange={(e) => setCourseProfId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">Unassigned / Select Professor</option>
                  {professors.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
            >
              Save Course Changes
            </button>
          </form>
        )}
      </Modal>

      {/* Modal: Enroll Students */}
      <Modal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} title={`Enroll Students: ${selectedCourse?.code} - ${selectedCourse?.name}`}>
        {selectedCourse && (
          <form onSubmit={handleSaveEnrollments} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Select approved students to enroll in this course. Unchecking a student will unenroll them.
            </p>

            <div style={{ maxHeight: '40vh', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {approvedStudents.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>No approved students in system database.</p>
              ) : (
                approvedStudents.map(student => {
                  const isChecked = enrolledStudentIds.includes(student.id);
                  return (
                    <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: isChecked ? 'rgba(0,113,227,0.02)' : 'transparent' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleEnrollment(student.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>{student.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{student.email}</span>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <button
              type="submit"
              style={{ width: '100%', padding: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}
            >
              Sync Enrollment List
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
