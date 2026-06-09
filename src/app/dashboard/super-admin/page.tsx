'use client';

import React, { useState, useEffect } from 'react';
import { Users, Shield, BookOpen, Calendar, Plus, Edit2, Trash2, Settings, BarChart2, GraduationCap, UserPlus } from 'lucide-react';
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

interface Setting {
  key: string;
  value: string;
}

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [syllabiCount, setSyllabiCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  
  // Settings state
  const [systemName, setSystemName] = useState('EMBA Connect');
  const [requireApproval, setRequireApproval] = useState(true);
  const [allowSignup, setAllowSignup] = useState(true);

  // UI state
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'settings'>('users');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Modal states
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
  const [formSuccess, setFormSuccess] = useState('');

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
      // 1. Fetch Users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      // 2. Fetch Courses
      const coursesRes = await fetch('/api/courses');
      if (coursesRes.ok) {
        const data = await coursesRes.json();
        setCourses(data.courses || []);
      }

      // 3. Fetch Syllabi for metrics
      const syllabusRes = await fetch('/api/syllabus');
      if (syllabusRes.ok) {
        const data = await syllabusRes.json();
        setSyllabiCount(data.syllabi?.length || 0);
      }

      // 4. Fetch Classes for metrics
      const classesRes = await fetch('/api/classes');
      if (classesRes.ok) {
        const data = await classesRes.json();
        setClassesCount(data.classes?.length || 0);
      }

      // 5. Fetch System Settings
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        const settingsList = data.settings as Setting[] || [];
        
        const sysName = settingsList.find(s => s.key === 'system_name')?.value;
        const reqAppr = settingsList.find(s => s.key === 'require_approval')?.value;
        const alSign = settingsList.find(s => s.key === 'allow_signup')?.value;

        if (sysName) setSystemName(sysName);
        if (reqAppr) setRequireApproval(reqAppr === 'true');
        if (alSign) setAllowSignup(alSign === 'true');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchData();

    const handleRealtime = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (
        detail.type === 'USERS_UPDATED' ||
        detail.type === 'COURSES_UPDATED' ||
        detail.type === 'NOTIFICATIONS_UPDATED' ||
        detail.type === 'SYSTEM_SETTINGS_UPDATED'
      ) {
        fetchData();
      }
    };

    window.addEventListener('emba-realtime', handleRealtime);

    return () => {
      window.removeEventListener('emba-realtime', handleRealtime);
    };
  }, []);

  // Filtered Users list
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Filtered Courses list
  const filteredCourses = courses.filter((c) => {
    return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (c.professor?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const professors = users.filter(u => u.role === 'PROFESSOR' && u.status === 'APPROVED');
  const approvedStudents = users.filter(u => u.role === 'STUDENT' && u.status === 'APPROVED');

  // Analytics helper metrics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const profCount = users.filter(u => u.role === 'PROFESSOR').length;
  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const pendingCount = users.filter(u => u.status === 'PENDING').length;
  const courseCount = courses.length;

  // USER CRUD HANDLERS
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

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

      setFormSuccess('User created successfully');
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
    setFormSuccess('');
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

      setFormSuccess('User updated successfully');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      fetchData();
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

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

  const handleSaveSettings = async () => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: [
            { key: 'system_name', value: systemName },
            { key: 'require_approval', value: String(requireApproval) },
            { key: 'allow_signup', value: String(allowSignup) },
          ],
        }),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
        fetchData();
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.03em' }}>Super Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>System monitoring, user roles, courses directory, and core configs.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', border: '1px solid var(--border-color)', padding: '4px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--bg-card)' }}>
          <button
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              backgroundColor: activeTab === 'users' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'users' ? 'var(--bg-card)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} /> Users
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
          <button
            onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}
            style={{
              padding: '8px 16px', borderRadius: 'var(--radius-pill)', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              backgroundColor: activeTab === 'settings' ? 'var(--text-primary)' : 'transparent',
              color: activeTab === 'settings' ? 'var(--bg-card)' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14} /> Settings
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          {/* Analytics Metrics cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,113,227,0.08)', color: 'var(--accent-blue)' }}>
                <Users size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Accounts</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{totalUsers}</h3>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(52,199,89,0.08)', color: 'var(--accent-green)' }}>
                <Shield size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Admins</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{adminCount}</h3>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(175,82,222,0.08)', color: '#af52de' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Professors</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{profCount}</h3>
              </div>
            </Card>

            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,149,0,0.08)', color: 'var(--accent-yellow)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Students</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{studentCount}</h3>
              </div>
            </Card>

            {pendingCount > 0 && (
              <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,149,0,0.3)', backgroundColor: 'rgba(255,149,0,0.03)' }}>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,149,0,0.12)', color: 'var(--accent-yellow)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Pending Approval</span>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px', color: 'var(--accent-yellow)' }}>{pendingCount}</h3>
                </div>
              </Card>
            )}
          </div>

          {/* User Management Section */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>Accounts Database</h3>
              <button
                onClick={() => {
                  setFormError('');
                  setFormSuccess('');
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

            {/* Filter and search bar */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name or email..."
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
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="PROFESSOR">Professor</option>
                <option value="STUDENT">Student</option>
              </select>
            </div>

            {/* User Table */}
            <div style={{ overflowX: 'auto', margin: '0 -24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.01)' }}>
                    <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Name</th>
                    <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email</th>
                    <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 24px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No accounts found in this criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '14px 24px', fontWeight: '500' }}>{u.name}</td>
                        <td style={{ padding: '14px 24px', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: '700',
                            backgroundColor: u.role === 'SUPER_ADMIN' ? 'rgba(52,199,89,0.1)' : u.role === 'ADMIN' ? 'rgba(0,113,227,0.1)' : u.role === 'PROFESSOR' ? 'rgba(175,82,222,0.1)' : 'rgba(255,149,0,0.1)',
                            color: u.role === 'SUPER_ADMIN' ? 'var(--accent-green)' : u.role === 'ADMIN' ? 'var(--accent-blue)' : u.role === 'PROFESSOR' ? '#af52de' : 'var(--accent-yellow)',
                          }}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px' }}>
                          <span style={{
                            display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                            backgroundColor: u.status === 'APPROVED' ? 'var(--accent-green)' : 'var(--accent-yellow)', marginRight: '6px',
                          }} />
                          <span style={{ fontWeight: '500', color: u.status === 'APPROVED' ? 'var(--text-primary)' : 'var(--accent-yellow)' }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openEditModal(u)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '6px' }}
                              title="Edit user"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '6px' }}
                              title="Delete user"
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
        </>
      )}

      {activeTab === 'courses' && (
        <>
          {/* Courses Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(0,113,227,0.08)', color: 'var(--accent-blue)' }}>
                <GraduationCap size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Courses</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{courseCount}</h3>
              </div>
            </Card>
            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(175,82,222,0.08)', color: '#af52de' }}>
                <BookOpen size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Documents Distributed</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{syllabiCount}</h3>
              </div>
            </Card>
            <Card style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,149,0,0.08)', color: 'var(--accent-yellow)' }}>
                <Calendar size={20} />
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Active Classes</span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{classesCount}</h3>
              </div>
            </Card>
          </div>

          {/* Courses Manager */}
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

            {/* Filter and search bar */}
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

            {/* Courses Table */}
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
        </>
      )}

      {activeTab === 'settings' && (
        /* Settings Tab View */
        <Card style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} />
            System Configurations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>System Portal Name</label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>Require Registration Approval</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>New student/professor registrations will start as pending.</span>
              </div>
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '20px 0' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>Allow Public Signups</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Enables the public registration form.</span>
              </div>
              <input
                type="checkbox"
                checked={allowSignup}
                onChange={(e) => setAllowSignup(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-blue)' }}
              />
            </div>

            <button
              onClick={handleSaveSettings}
              style={{
                backgroundColor: 'var(--text-primary)', color: 'var(--bg-card)', border: 'none', padding: '12px 24px',
                borderRadius: 'var(--radius-pill)', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                transition: 'opacity 0.2s ease', alignSelf: 'flex-start',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Save Configuration
            </button>
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
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
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
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
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
