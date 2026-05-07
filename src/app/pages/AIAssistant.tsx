import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Bot, Send, User, Loader2, ArrowRight, Calendar, FileText, Users, BookOpen, TrendingUp, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, dataService, type User as UserType, type ClassSession, type Assignment } from '@/app/lib/db';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    label: string;
    path: string;
    icon?: any;
  };
}

// Generate unique IDs
export const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// EMBA AI Logic
export const generateEMBAAIResponse = (
  query: string,
  cachedUser: UserType | null,
  cachedClasses: ClassSession[],
  cachedAssignments: Assignment[]
): { text: string; action?: { label: string; path: string; icon?: any } } => {
  const lowerQuery = query.toLowerCase().trim();

  // Schedule/Class queries
  if (lowerQuery.match(/(schedule|class|next class|when is|upcoming class)/)) {
    const nextClass = cachedClasses[0];
    if (nextClass) {
      return {
        text: `Your next class is **${nextClass.topic}** scheduled for **${new Date(nextClass.date).toLocaleDateString()}** at **${nextClass.startTime}**. The class will be held at ${nextClass.location}.${nextClass.meetingLink ? '\n\n📺 Virtual meeting link is available in the schedule.' : ''}`,
        action: { label: 'View Full Schedule', path: '/student/schedule', icon: Calendar }
      };
    }
    return {
      text: "You have no upcoming classes scheduled at the moment. Check your schedule for the full semester calendar.",
      action: { label: 'View Schedule', path: '/student/schedule', icon: Calendar }
    };
  }

  // Assignment queries
  if (lowerQuery.match(/(assignment|homework|due|submit|deadline)/)) {
    const pending = cachedAssignments.filter(a => a.status === 'pending');
    const submitted = cachedAssignments.filter(a => a.status === 'submitted');
    const graded = cachedAssignments.filter(a => a.status === 'graded');

    if (pending.length > 0) {
      const nextAssignment = pending[0];
      return {
        text: `You have **${pending.length} pending assignment(s)**.\n\n📝 Next up: **${nextAssignment.title}** due on **${new Date(nextAssignment.dueDate).toLocaleDateString()}**.\n\nStatus Summary:\n• Pending: ${pending.length}\n• Submitted: ${submitted.length}\n• Graded: ${graded.length}`,
        action: { label: 'View Assignments', path: '/student/assignments', icon: FileText }
      };
    }
    return {
      text: `Great job! You have no pending assignments at the moment.\n\n📊 Summary:\n• Submitted: ${submitted.length}\n• Graded: ${graded.length}`,
      action: { label: 'View All Assignments', path: '/student/assignments', icon: FileText }
    };
  }

  // GPA/Grades queries
  if (lowerQuery.match(/(gpa|grade|score|performance|result)/)) {
    const graded = cachedAssignments.filter(a => a.status === 'graded');
    return {
      text: `Your current GPA is **3.8** (Excellent!). You've completed **${graded.length} graded assignments** this semester.\n\n🎓 Keep up the outstanding work! Your academic performance places you in the top tier of your cohort.`,
      action: { label: 'View Detailed Performance', path: '/student/dashboard', icon: TrendingUp }
    };
  }

  // Professor queries
  if (lowerQuery.match(/(professor|faculty|instructor|office hour|contact)/)) {
    return {
      text: "You can view all your professors, their contact information, office hours, and expertise in the **Professors** section. Each professor's profile includes:\n\n• 📧 Email contact\n• 🕐 Office hours\n• 💼 LinkedIn profile\n• 📚 Department & bio",
      action: { label: 'View Professors', path: '/student/professors', icon: Users }
    };
  }

  // Syllabus queries
  if (lowerQuery.match(/(syllabus|course material|resource|reading|textbook)/)) {
    return {
      text: "Access all your **course syllabi**, reading materials, and resources in the Syllabus section. You'll find:\n\n• 📄 Course outlines\n• 📚 Required readings\n• 🎥 Video resources\n• 🔗 External links\n• 📎 Supplementary materials",
      action: { label: 'View Syllabus', path: '/student/syllabus', icon: BookOpen }
    };
  }

  // Notes queries
  if (lowerQuery.match(/(note|study note|notebook|write)/)) {
    return {
      text: "Organize your study materials in the **Notes** section. Features include:\n\n• ✍️ Create & edit notes\n• 🏷️ Tag by course\n• 🔍 Search functionality\n• 📅 Auto-timestamps\n• 💾 Auto-save",
      action: { label: 'Go to Notes', path: '/student/notes', icon: FileText }
    };
  }

  // Calendar queries
  if (lowerQuery.match(/(calendar|event|date|when)/)) {
    return {
      text: "View your complete **academic calendar** with all important dates:\n\n• 📅 Class sessions\n• ✅ Assignment deadlines\n• 📝 Exam dates\n• 🎯 Project milestones\n• 🎓 Academic events",
      action: { label: 'Open Calendar', path: '/student/calendar', icon: Calendar }
    };
  }

  // Settings queries
  if (lowerQuery.match(/(setting|profile|account|preference|password)/)) {
    return {
      text: "Manage your account settings, update your profile, and configure preferences in the **Settings** section.",
      action: { label: 'Go to Settings', path: '/student/settings', icon: User }
    };
  }

  // Greetings
  if (lowerQuery.match(/(^hi$|^hello$|^hey$|greeting|good morning|good afternoon|good evening)/)) {
    const userName = cachedUser ? cachedUser.name.split(' ')[0] : 'there';
    return {
      text: `Hello ${userName}! 👋\n\nI'm your EMBA Academic Assistant. I'm here to help you with:\n\n• 📅 Class schedules\n• 📝 Assignments\n• 👨‍🏫 Professor information\n• 📚 Course materials\n• 📊 Your grades\n• And much more!\n\nWhat would you like to know?`
    };
  }

  // Help
  if (lowerQuery.match(/(help|what can you do|assist|support|guide)/)) {
    return {
      text: `I can help you with:\n\n**📅 Scheduling**\n• Class schedules and locations\n• Meeting links and timezones\n• Academic calendar\n\n**📝 Academics**\n• Assignment deadlines\n• Grade tracking\n• Course materials\n\n**👥 People**\n• Professor contacts\n• Office hours\n• Department info\n\n**📖 Resources**\n• Syllabus access\n• Study notes\n• Course resources\n\nTry asking: "When is my next class?" or "What assignments are due?"`
    };
  }

  // Thank you
  if (lowerQuery.match(/(thank|thanks|appreciate)/)) {
    return { text: "You're very welcome! Feel free to ask me anything else about your EMBA program. I'm here to help! 😊" };
  }

  // Default response
  return {
    text: "I'm here to help with your EMBA academic needs! You can ask me about:\n\n• Your class schedule\n• Assignment deadlines\n• Professor information\n• Course materials\n• Your grades and GPA\n• Study notes and resources\n\nWhat would you like to know?",
    action: { label: 'View Dashboard', path: '/student/dashboard', icon: GraduationCap }
  };
};

export default function AIAssistant() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hello! I'm your EMBA Academic Assistant. I can help you with class schedules, assignments, professors, course materials, and more. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cache data for AI responses
  const [cachedUser, setCachedUser] = useState<UserType | null>(null);
  const [cachedClasses, setCachedClasses] = useState<ClassSession[]>([]);
  const [cachedAssignments, setCachedAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = await db.getCurrentUser();
        if (!userData) return;

        const studentRecord = await dataService.getStudentByUserId(userData.id);
        if (!studentRecord) return;

        const [classData, assignmentData] = await Promise.all([
          db.getStudentClasses(studentRecord.id),
          db.getStudentAssignments(studentRecord.id)
        ]);
        setCachedUser(userData);
        setCachedClasses(classData);
        setCachedAssignments(assignmentData);
      } catch (error) {
        console.error('Error loading AI assistant data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    const userText = inputValue.trim();
    if (!userText) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      setTimeout(() => {
        try {
          const response = generateEMBAAIResponse(userText, cachedUser, cachedClasses, cachedAssignments);

          const botMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: response.text,
            timestamp: new Date(),
            action: response.action
          };

          setMessages(prev => [...prev, botMessage]);
        } catch (err) {
          console.error("AI Generation Error:", err);
          toast.error("AI Connection Error", { description: "Please try again." });

          setMessages(prev => [...prev, {
            id: generateId(),
            role: 'assistant',
            content: "I encountered a system error. Please try asking again.",
            timestamp: new Date()
          }]);
        } finally {
          setIsTyping(false);
        }
      }, 800);
    } catch (e) {
      setIsTyping(false);
      console.error("Handler Error:", e);
    }
  };

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  const quickActions = [
    { label: 'Next Class', icon: Calendar, query: 'When is my next class?' },
    { label: 'Assignments', icon: FileText, query: 'Show my assignments' },
    { label: 'My GPA', icon: TrendingUp, query: 'What is my GPA?' },
    { label: 'Professors', icon: Users, query: 'Show my professors' },
  ];

  return (
    <div className="h-screen max-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-24 md:pb-8 font-sans text-slate-900 p-4 md:p-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              EMBA Academic Assistant
            </h1>
            <p className="text-slate-500 font-medium">Your intelligent academic companion</p>
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-600 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickActions.map((action) => (
                <Card
                  key={action.label}
                  className="p-4 hover:shadow-md transition-all cursor-pointer border-slate-200 hover:border-blue-300 hover:bg-blue-50 group"
                  onClick={() => setInputValue(action.query)}
                >
                  <action.icon className="h-5 w-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold text-slate-700">{action.label}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <Card className="flex-1 flex flex-col border-slate-200 shadow-xl overflow-hidden min-h-0">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 bg-white"
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Loading AI Assistant...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-2xl p-4 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                      }`}>
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }}
                        />

                        {msg.action && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActionClick(msg.action!.path)}
                            className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                              msg.role === 'user'
                                ? 'bg-white/10 hover:bg-white/20 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {msg.action.icon && <msg.action.icon className="h-4 w-4" />}
                            {msg.action.label}
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </motion.button>
                        )}

                        <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-2 items-center">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about classes, assignments, professors..."
                className="rounded-xl border-slate-300 focus-visible:ring-blue-500 bg-white"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputValue.trim() || isTyping || isLoading}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
