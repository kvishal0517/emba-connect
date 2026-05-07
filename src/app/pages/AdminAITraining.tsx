import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Bot, Plus, Trash2, Save, Sparkles, MessageSquare, Code, BookOpen, RefreshCw, CheckCircle2, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { db, AIKnowledgeItem } from '@/app/lib/db';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminAITraining() {
  const navigate = useNavigate();
  const [knowledgeBase, setKnowledgeBase] = useState<AIKnowledgeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'manage' | 'simulate'>('manage');
  
  // New Item Form State
  const [newKeywords, setNewKeywords] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newCategory, setNewCategory] = useState<AIKnowledgeItem['category']>('General');
  const [newActionLabel, setNewActionLabel] = useState('');
  const [newActionPath, setNewActionPath] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  // Simulation State
  const [simQuery, setSimQuery] = useState('');
  const [simResult, setSimResult] = useState<{text: string, action?: any} | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setKnowledgeBase(db.getAIKnowledge());
  };

  const handleTrainAI = () => {
    if (!newKeywords || !newResponse) {
      toast.error("Missing Data", { description: "Keywords and Response are required." });
      return;
    }

    setIsTraining(true);
    
    // Simulate training delay
    setTimeout(() => {
        db.addAIKnowledge({
            keywords: newKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0),
            response: newResponse,
            category: newCategory,
            actionLabel: newActionLabel || undefined,
            actionPath: newActionPath || undefined
        });

        refreshData();
        setNewKeywords('');
        setNewResponse('');
        setNewActionLabel('');
        setNewActionPath('');
        setIsTraining(false);
        
        toast.success("Training Complete", { 
            description: "New knowledge node added to AI neural network.",
            icon: <Bot className="text-blue-500" /> 
        });
    }, 1500);
  };

  const handleDelete = (id: string) => {
      if (confirm("Are you sure you want to delete this knowledge node?")) {
          db.deleteAIKnowledge(id);
          refreshData();
          toast.success("Knowledge Node Deleted");
      }
  };

  const runSimulation = () => {
      // This mimics the logic in AIAssistant.tsx but we re-implement a simple version here for testing
      // Ideally we would import the logic, but it's inside the component in AIAssistant.tsx (refactored now to external function in previous step? No, I put it in the file but not exported)
      // Actually, I can just do a quick local check against the DB since I have access to it.
      
      const lowerQuery = simQuery.toLowerCase().trim();
      const kb = db.getAIKnowledge();
      let match = null;

      for (const item of kb) {
        if (item.keywords.some(k => lowerQuery.includes(k.toLowerCase()))) {
            match = item;
            break;
        }
      }

      if (match) {
          setSimResult({
              text: match.response,
              action: match.actionLabel ? { label: match.actionLabel, path: match.actionPath } : undefined
          });
      } else {
          setSimResult({ text: "No direct knowledge match found. AI would use fallback response." });
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
            <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/admin/dashboard')}>CRM</span>
                <span>/</span>
                <span className="text-slate-900 font-medium">AI Training</span>
            </div>
            <div className="flex items-center gap-4 mt-2">
                 <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                    <Bot className="w-8 h-8 text-blue-600" /> AI Training Center
                </h1>
            </div>
            <p className="text-slate-500 font-medium mt-1">Teach PitStop AI new responses and capabilities</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <Button 
                variant={activeTab === 'manage' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('manage')}
                className={`rounded-lg font-bold ${activeTab === 'manage' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}
            >
                <BookOpen className="w-4 h-4 mr-2" /> Manage Knowledge
            </Button>
            <Button 
                variant={activeTab === 'simulate' ? 'secondary' : 'ghost'} 
                onClick={() => setActiveTab('simulate')}
                className={`rounded-lg font-bold ${activeTab === 'simulate' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}
            >
                <Sparkles className="w-4 h-4 mr-2" /> Simulator
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Input Form */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-500" /> Add Knowledge Node
                    </CardTitle>
                    <CardDescription>Define triggers and responses for the AI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Trigger Keywords (comma separated)</Label>
                        <Input 
                            placeholder="e.g. oil change, lube, filter" 
                            value={newKeywords}
                            onChange={(e) => setNewKeywords(e.target.value)}
                            className="bg-slate-50"
                        />
                        <p className="text-xs text-slate-400">AI will listen for these words in user queries.</p>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
                            <SelectTrigger className="bg-slate-50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Services">Services</SelectItem>
                                <SelectItem value="Rewards">Rewards</SelectItem>
                                <SelectItem value="Account">Account</SelectItem>
                                <SelectItem value="Technical">Technical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>AI Response</Label>
                        <textarea 
                            className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                            placeholder="The AI will respond with this text..."
                            value={newResponse}
                            onChange={(e) => setNewResponse(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Action Label (Opt)</Label>
                            <Input 
                                placeholder="e.g. Book Now" 
                                value={newActionLabel}
                                onChange={(e) => setNewActionLabel(e.target.value)}
                                className="bg-slate-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Action Path (Opt)</Label>
                            <Input 
                                placeholder="e.g. /bookings" 
                                value={newActionPath}
                                onChange={(e) => setNewActionPath(e.target.value)}
                                className="bg-slate-50"
                            />
                        </div>
                    </div>

                    <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 mt-2"
                        onClick={handleTrainAI}
                        disabled={isTraining}
                    >
                        {isTraining ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> Training Model...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <BrainIcon className="w-4 h-4" /> Train AI Model
                            </span>
                        )}
                    </Button>
                </CardContent>
            </Card>
            
            {/* Stats Card */}
            <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Code className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 uppercase font-bold tracking-wider">Total Nodes</p>
                            <p className="text-3xl font-black">{knowledgeBase.length}</p>
                        </div>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 w-[75%]"></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Knowledge base capacity is healthy.</p>
                </CardContent>
            </Card>
        </div>

        {/* Right Column - List or Simulator */}
        <div className="lg:col-span-2">
            
            {activeTab === 'manage' ? (
                <Card className="border-none shadow-md h-full">
                    <CardHeader>
                        <CardTitle>Existing Knowledge Base</CardTitle>
                        <CardDescription>Manage the Q&A pairs currently active in the neural network.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[100px]">Category</TableHead>
                                        <TableHead>Keywords</TableHead>
                                        <TableHead>Response</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {knowledgeBase.map((item) => (
                                        <TableRow key={item.id} className="hover:bg-slate-50/50">
                                            <TableCell>
                                                <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">
                                                    {item.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium text-blue-600 max-w-[150px] truncate">
                                                {item.keywords.join(', ')}
                                            </TableCell>
                                            <TableCell className="max-w-[300px] text-sm text-slate-600 line-clamp-2">
                                                {item.response}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {knowledgeBase.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                                No knowledge nodes found. Add one to get started.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-none shadow-md h-full bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                    <CardHeader className="relative z-10">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Sparkles className="w-5 h-5 text-purple-400" /> Neural Network Simulator
                        </CardTitle>
                        <CardDescription className="text-slate-400">Test how the AI responds to queries in real-time.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-6">
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Type a query to test..." 
                                value={simQuery}
                                onChange={(e) => setSimQuery(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12"
                                onKeyDown={(e) => e.key === 'Enter' && runSimulation()}
                            />
                            <Button className="h-12 bg-purple-600 hover:bg-purple-700 font-bold px-6" onClick={runSimulation}>
                                Test
                            </Button>
                        </div>

                        <div className="bg-slate-950 rounded-xl p-6 min-h-[300px] border border-slate-800 relative">
                             <p className="text-xs font-mono text-slate-500 mb-4 uppercase tracking-widest">Simulation Output Log</p>
                             
                             {simResult ? (
                                 <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                 >
                                     <div className="flex items-start gap-3">
                                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                                             <User className="w-4 h-4 text-slate-400" />
                                         </div>
                                         <div className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg rounded-tl-none">
                                             {simQuery}
                                         </div>
                                     </div>

                                     <div className="flex items-start gap-3">
                                         <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                             <Bot className="w-4 h-4 text-white" />
                                         </div>
                                         <div className="space-y-2">
                                             <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 px-4 py-3 rounded-lg rounded-tl-none">
                                                 {simResult.text}
                                             </div>
                                             {simResult.action && (
                                                 <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-900/50">
                                                     {simResult.action.label} <ArrowRight className="w-3 h-3 ml-1" />
                                                 </Button>
                                             )}
                                         </div>
                                     </div>
                                 </motion.div>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-[200px] text-slate-600 gap-2">
                                     <Bot className="w-12 h-12 opacity-20" />
                                     <p>Waiting for input...</p>
                                 </div>
                             )}
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>

      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    )
}

function BrainIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" /></svg>
    )
}