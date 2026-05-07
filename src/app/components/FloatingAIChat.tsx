import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Bot, Send, X, Minimize2, Maximize2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { db, dataService, type User, type ClassSession, type Assignment } from '@/app/lib/db';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: {
    label: string;
    path: string;
  };
}

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hi! I'm your EMBA Academic Assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Cache data for AI responses
  const [cachedUser, setCachedUser] = useState<User | null>(null);
  const [cachedClasses, setCachedClasses] = useState<ClassSession[]>([]);
  const [cachedAssignments, setCachedAssignments] = useState<Assignment[]>([]);

  // Load data when chatbot opens
  useEffect(() => {
    if (isOpen && !cachedUser) {
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
          console.error('Error loading chatbot data:', error);
        }
      };
      loadData();
    }
  }, [isOpen, cachedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  const generateEMBAAIResponse = (query: string): { text: string; action?: { label: string; path: string } } => {
    const lowerQuery = query.toLowerCase().trim();

    // Schedule/Class queries
    if (lowerQuery.includes('schedule') || lowerQuery.includes('class') || lowerQuery.includes('next class')) {
      const nextClass = cachedClasses[0];
      if (nextClass) {
        return {
          text: `Your next class is **${nextClass.topic}** on ${new Date(nextClass.date).toLocaleDateString()} at ${nextClass.startTime}. Location: ${nextClass.location}`,
          action: { label: 'View Full Schedule', path: '/student/schedule' }
        };
      }
      return { text: "You have no upcoming classes scheduled." };
    }

    // Assignment queries
    if (lowerQuery.includes('assignment') || lowerQuery.includes('homework') || lowerQuery.includes('due')) {
      const pending = cachedAssignments.filter(a => a.status === 'pending');
      if (pending.length > 0) {
        return {
          text: `You have **${pending.length} pending assignment(s)**. The next one is due on ${new Date(pending[0].dueDate).toLocaleDateString()}.`,
          action: { label: 'View Assignments', path: '/student/assignments' }
        };
      }
      return {
        text: "Great job! You have no pending assignments at the moment.",
        action: { label: 'View All Assignments', path: '/student/assignments' }
      };
    }

    // GPA/Grades queries
    if (lowerQuery.includes('gpa') || lowerQuery.includes('grade')) {
      return {
        text: "Your current GPA is **3.8**. Keep up the excellent work!",
        action: { label: 'View Detailed Grades', path: '/student/dashboard' }
      };
    }

    // Professor queries
    if (lowerQuery.includes('professor') || lowerQuery.includes('faculty') || lowerQuery.includes('office hour')) {
      return {
        text: "You can view all your professors, their contact information, and office hours in the Professors section.",
        action: { label: 'View Professors', path: '/student/professors' }
      };
    }

    // Syllabus queries
    if (lowerQuery.includes('syllabus') || lowerQuery.includes('course material')) {
      return {
        text: "You can access all course syllabi and materials in the Syllabus section.",
        action: { label: 'View Syllabus', path: '/student/syllabus' }
      };
    }

    // Notes queries
    if (lowerQuery.includes('note')) {
      return {
        text: "You can create, edit, and organize your study notes in the Notes section.",
        action: { label: 'Go to Notes', path: '/student/notes' }
      };
    }

    // Calendar queries
    if (lowerQuery.includes('calendar') || lowerQuery.includes('event')) {
      return {
        text: "View your complete academic calendar including classes, assignments, and important dates.",
        action: { label: 'Open Calendar', path: '/student/calendar' }
      };
    }

    // Greetings
    if (lowerQuery.match(/(hi|hello|hey|greetings)/)) {
      return { text: `Hello${cachedUser ? ' ' + cachedUser.name.split(' ')[0] : ''}! How can I assist you with your EMBA studies today?` };
    }

    // Help
    if (lowerQuery.includes('help')) {
      return { text: "I can help you with:\n• Class schedules and locations\n• Assignment deadlines\n• Professor information\n• Course materials and syllabus\n• Your grades and GPA\n• Study notes\n\nWhat would you like to know?" };
    }

    // Default response
    return { text: "I'm here to help with your EMBA academic needs. Try asking about your schedule, assignments, professors, or grades!" };
  };

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
          const response = generateEMBAAIResponse(userText);

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
          toast.error("AI Connection Error");
        } finally {
          setIsTyping(false);
        }
      }, 800);
    } catch (e) {
      setIsTyping(false);
    }
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setIsOpen(false); // Close on mobile after navigation
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
        <motion.button
          className="h-16 w-16 rounded-full shadow-2xl border-4 border-white bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center transition-all hover:scale-110 hover:shadow-blue-600/50"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ rotate: 10 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          {isOpen ? <X className="h-8 w-8 text-white" /> : <Bot className="h-8 w-8 text-white" />}
        </motion.button>
        
        {!isOpen && (
            <span className="absolute top-0 right-0 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] text-white font-bold items-center justify-center">1</span>
            </span>
        )}
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed z-40 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col
              ${isMinimized ? 'w-72 h-14 bottom-24 right-4 md:bottom-8 md:right-24' : 'w-[90vw] md:w-[400px] h-[500px] bottom-36 right-4 md:bottom-24 md:right-8'}
            `}
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">EMBA Assistant</h3>
                  {!isMinimized && <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">Online</p>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
              <>
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
                >
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                      }`}>
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                        
                        {msg.action && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActionClick(msg.action!.path)}
                            className={`mt-3 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                              msg.role === 'user' 
                                ? 'bg-white/10 hover:bg-white/20 text-white' 
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                            }`}
                          >
                            {msg.action.icon && <msg.action.icon className="h-3 w-3" />}
                            {msg.action.label}
                          </motion.button>
                        )}
                        
                        <p className={`text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex gap-1 items-center">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask about classes, assignments..."
                      className="rounded-xl border-slate-200 focus-visible:ring-blue-500 bg-slate-50"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!inputValue.trim() || isTyping}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {['Next class', 'Assignments', 'My GPA', 'Help'].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setInputValue(suggestion)}
                                className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-white border border-slate-200 hover:border-blue-200 text-slate-500 hover:text-blue-600 px-2 py-1 rounded-full whitespace-nowrap transition-all"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}