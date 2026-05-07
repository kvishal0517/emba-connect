import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Bot, Send, User, Loader2, X, RefreshCw } from 'lucide-react';
import { db, dataService, type User as UserType, type ClassSession, type Assignment } from '@/app/lib/db';
import { motion, AnimatePresence } from 'framer-motion';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Hello! I'm your EMBA Academic Assistant. How can I help you today?",
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

  // Load data when chatbot opens
  useEffect(() => {
    if (isOpen && !cachedUser) {
      const loadData = async () => {
        try {
          const userData = await db.getCurrentUser();
          if (!userData) return;
          
          // Get student record to get the studentId
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    
    // Add user message
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // Mock AI Logic - now uses cached data
    setTimeout(() => {
      let responseText = "I'm sorry, I didn't quite catch that. Can you rephrase?";
      const lowerText = userText.toLowerCase();

      if (lowerText.includes('schedule') || lowerText.includes('class')) {
        const nextClass = cachedClasses[0];
        if (nextClass) {
          responseText = `Your next class is **${nextClass.topic}** starting on ${new Date(nextClass.startTime).toLocaleDateString()} at ${new Date(nextClass.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. It will be held in ${nextClass.location}.`;
        } else {
          responseText = "You have no upcoming classes scheduled.";
        }
      } else if (lowerText.includes('assignment') || lowerText.includes('homework')) {
        const pending = cachedAssignments.filter(a => a.status === 'pending');
        if (pending.length > 0) {
          responseText = `You have ${pending.length} pending assignment(s). The next one due is **${pending[0].title}** on ${new Date(pending[0].dueDate).toLocaleDateString()}.`;
        } else {
          responseText = "Great job! You have no pending assignments.";
        }
      } else if (lowerText.includes('grade') || lowerText.includes('gpa')) {
        if (cachedUser) {
          responseText = `Your current GPA is **${cachedUser.gpa}**. Keep up the good work!`;
        }
      } else if (lowerText.includes('professor') || lowerText.includes('contact')) {
        responseText = "You can find contact details for all your professors in the **Directory** section of the portal.";
      } else if (lowerText.includes('exam')) {
        responseText = "The **Mid-Term Exams** are scheduled for next month. Check the 'Announcements' section for the detailed timetable.";
      }

      const botMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[600px]"
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500 p-1.5 rounded-lg">
                  <Bot className="h-4 w-4 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Academic AI</h3>
                  <p className="text-xs text-slate-300">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 min-h-[300px]"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-amber-500 text-slate-900 rounded-tr-none font-medium' 
                      : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                    }
                  `}>
                    <p dangerouslySetInnerHTML={{ __html: msg.content }} />
                    <span className="text-[10px] opacity-50 block mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about schedule, grades..."
                  className="flex-1 border-slate-200 focus-visible:ring-amber-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={!inputValue.trim() || isTyping}
                >
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-slate-900 text-amber-500 shadow-xl shadow-slate-900/30 flex items-center justify-center border-2 border-amber-500 hover:scale-105 active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ rotate: 10 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-8 w-8" />}
        {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
        )}
      </motion.button>
    </>
  );
}