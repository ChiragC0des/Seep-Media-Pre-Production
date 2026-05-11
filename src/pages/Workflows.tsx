import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Sparkles, 
  ChevronRight, 
  Play, 
  MoreHorizontal, 
  Layout, 
  Zap, 
  Settings, 
  Clock,
  ArrowRight,
  Database,
  Eye,
  Box,
  Mountain,
  User,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCcw,
  Save,
  Edit2,
  MessageSquare,
  Send,
  User as UserIcon,
  Bot,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import { getDirectorResponse, ChatMessage, getDirectorVoice } from '../services/scriptDirectorService';
import { generateScenesFromScript } from '../services/sceneGenService';

interface Scene {
  id: string;
  name: string;
  description: string;
  duration: string;
  status: 'Ready'|'Pending'|'Processing';
}

interface Workflow {
  id: string;
  projectName: string;
  script: string;
  scenes: Scene[];
  updatedAt: any;
}

export default function Workflows() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Selection
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Form State
  const [projectName, setProjectName] = useState('');
  const [scriptText, setScriptText] = useState('');
  const [secondsPerScene, setSecondsPerScene] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Chat State
  const [sidebarTab, setSidebarTab] = useState<'assets' | 'director'>('assets');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isCastingDirector, setIsCastingDirector] = useState(false);
  const [isFinalizingScript, setIsFinalizingScript] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'workflows'), 
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Workflow[];
      setWorkflows(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'workflows');
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleGenerateScenes = async () => {
    if (!scriptText.trim()) return;
    setIsGenerating(true);
    
    try {
      const data = await generateScenesFromScript(scriptText, secondsPerScene);
      
      const formattedScenes: Scene[] = data.scenes.map((s: any, i: number) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: s.name,
        description: s.description,
        duration: s.duration,
        status: 'Ready'
      }));

      if (selectedWorkflow) {
        setSelectedWorkflow({ ...selectedWorkflow, scenes: formattedScenes });
      } else {
        // If we're creating from scratch, we can just update the temp state
        // The scenes will be saved when handleSaveWorkflow is called
        setSelectedWorkflow({
          id: 'temp',
          projectName: projectName || 'Untitled',
          script: scriptText,
          scenes: formattedScenes,
          updatedAt: serverTimestamp()
        } as any);
      }
    } catch (error) {
      console.error("Scene generation failed:", error);
      alert("Failed to generate scenes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!user || (!selectedWorkflow && !projectName)) return;
    setIsSaving(true);
    try {
      if (selectedWorkflow?.id && selectedWorkflow.id !== 'temp') {
        await updateDoc(doc(db, 'workflows', selectedWorkflow.id), {
          script: scriptText,
          projectName: projectName || selectedWorkflow.projectName,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'workflows'), {
          userId: user.uid,
          projectName: projectName || 'New Workflow',
          script: scriptText,
          scenes: selectedWorkflow?.scenes || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsCreating(false);
      setSelectedWorkflow(null);
      setProjectName('');
      setScriptText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'workflows');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;
    try {
      await deleteDoc(doc(db, 'workflows', id));
      if (selectedWorkflow?.id === id) setSelectedWorkflow(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'workflows');
    }
  };

  const handleAIBoothChat = async (overrideInput?: string) => {
    const input = overrideInput || chatInput;
    if (!input.trim() || isCastingDirector) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsCastingDirector(true);

    try {
      const response = await getDirectorResponse(
        scriptText,
        projectName || 'Untitled Production',
        chatMessages,
        input
      );
      
      const modelMsg: ChatMessage = { role: 'model', content: response };
      setChatMessages(prev => [...prev, modelMsg]);
    } catch (error) {
       console.error("Director failed:", error);
       setChatMessages(prev => [...prev, { role: 'model', content: "Director's booth signal is weak. Try again." }]);
    } finally {
      setIsCastingDirector(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        alert("Microphone access was denied. Please allow microphone permissions in your browser settings and try again.");
      } else {
        alert("Speech recognition error: " + event.error);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const playAISpeech = async (text: string, index: number) => {
    try {
      setPlayingVoiceId(index);
      const base64Audio = await getDirectorVoice(text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
          float32Data[i] = pcmData[i] / 32768.0;
        }

        const buffer = audioContext.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);
        
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.onended = () => setPlayingVoiceId(null);
        source.start();
      } else {
        setPlayingVoiceId(null);
      }
    } catch (error) {
      console.error("Speech playback failed:", error);
      setPlayingVoiceId(null);
    }
  };

  const applyScriptSuggestion = (content: string) => {
    const match = content.match(/\[SCRIPT_SUGGESTION\]([\s\S]*?)\[\/SCRIPT_SUGGESTION\]/);
    if (match && match[1]) {
      const suggestion = match[1].trim();
      setScriptText(prev => prev + "\n\n" + suggestion);
      // alert("Script suggestion applied to editor.");
    }
  };

  const handleFinalizeScript = async () => {
    if (!user || chatMessages.length === 0) return;
    setIsFinalizingScript(true);
    try {
      const { finalizeScriptIntoMainDraft } = await import('../services/scriptDirectorService');
      const updatedScript = await finalizeScriptIntoMainDraft(scriptText, chatMessages);
      setScriptText(updatedScript);
      alert("Script has been intelligently updated based on the entire conversation.");
      
      // Update firebase as well
      if (selectedWorkflow?.id && selectedWorkflow.id !== 'temp') {
        await updateDoc(doc(db, 'workflows', selectedWorkflow.id), {
          script: updatedScript,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
       console.error("Finalization failed:", error);
       alert("Failed to update script. Please try again.");
    } finally {
      setIsFinalizingScript(false);
    }
  };

  return (
    <div className="flex h-full bg-[#FAFAFA]">
      <AnimatePresence mode="wait">
        {!isCreating && !selectedWorkflow ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-12 overflow-y-auto"
          >
            <header className="flex justify-between items-end mb-12">
              <div>
                <div className="flex items-center gap-3 text-[#FF5733] mb-2">
                   <Zap size={20} />
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Cinematic Workflow</span>
                </div>
                <h1 className="font-display text-4xl font-medium text-black tracking-tight">Active Pipelines</h1>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setIsCreating(true);
                    setProjectName('');
                    setScriptText('');
                    setSelectedWorkflow(null);
                    setSidebarTab('director');
                  }}
                  className="bg-[#FF5733]/10 text-[#FF5733] px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-[#FF5733] hover:text-white transition-all shadow-sm"
                >
                  <Bot size={18} /> Talk to AI Director
                </button>
                <button 
                  onClick={() => {
                    setIsCreating(true);
                    setProjectName('');
                    setScriptText('');
                    setSelectedWorkflow(null);
                    setSidebarTab('assets');
                  }}
                  className="bg-black text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-black/90 transition-all shadow-xl"
                >
                  <Plus size={18} /> New Production
                </button>
              </div>
            </header>

            {loading ? (
              <div className="flex justify-center py-24"><Loader2 className="animate-spin text-black/10" size={40} /></div>
            ) : workflows.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-[32px] p-24 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center">
                  <Layout className="text-black/10" size={32} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">No pipelines yet</h3>
                <p className="text-xs text-black/20">Start by creating a new cinematic production pipeline.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {workflows.map(wf => (
                  <div 
                    key={wf.id}
                    onClick={() => {
                        setSelectedWorkflow(wf);
                        setProjectName(wf.projectName);
                        setScriptText(wf.script);
                    }}
                    className="bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-2xl transition-all cursor-pointer group relative"
                  >
                    <div className="absolute top-8 right-8 flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedWorkflow(wf); setProjectName(wf.projectName); setScriptText(wf.script); }}
                          className="p-1.5 bg-gray-50 text-black rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 shadow-sm"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, wf.id)}
                          className="p-1.5 bg-gray-50 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 shadow-sm"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black/20 group-hover:text-[#FF5733] group-hover:bg-[#FF5733]/5 transition-all">
                        <Database size={20} />
                      </div>
                      <div className="text-[8px] font-bold uppercase tracking-widest px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100">Live</div>
                    </div>
                    <h3 className="text-xl font-medium mb-2">{wf.projectName}</h3>
                    <p className="text-xs text-black/40 mb-6 truncate">{wf.script || 'No script yet'}</p>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-black/20">
                        <span className="flex items-center gap-1.5"><Clock size={12}/> {wf.scenes?.length || 0} Scenes</span>
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-black/20 group-hover:text-[#FF5733] flex items-center gap-2 transition-colors">
                        Launch <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex overflow-y-auto lg:overflow-hidden lg:flex-row flex-col w-full"
          >
            {/* Main Stage */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-100 overflow-visible lg:overflow-y-auto bg-[#FAFAFA] custom-scrollbar">
              <div className="p-12 max-w-4xl mx-auto w-full space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start gap-4">
                   <div className="space-y-4">
                     <button onClick={() => { setSelectedWorkflow(null); setIsCreating(false); }} className="text-[10px] font-bold uppercase tracking-widest text-black/20 hover:text-black flex items-center gap-2 transition-colors">
                       <RefreshCcw size={12} /> Back to Dashboard
                     </button>
                     <h1 className="font-display text-4xl font-medium tracking-tight text-black">Script Engine</h1>
                   </div>
                   <div className="flex gap-4">
                      <button 
                        onClick={handleSaveWorkflow} 
                        disabled={isSaving} 
                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-black transition-all flex items-center gap-2 disabled:opacity-20"
                      >
                        {isSaving ? <Loader2 size={12} className="animate-spin"/> : <Save size={12} />} Save Workflow
                      </button>
                   </div>
                </header>

                <div className="bg-white border border-gray-100 rounded-[40px] p-12 space-y-8 shadow-sm">
                   <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-black/20">Project Name</label>
                      <input 
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-2xl font-medium focus:ring-0 placeholder:text-black/10" 
                        placeholder="E.g. Project Exodus"
                      />
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-black/20">Production Script</label>
                        <span className="text-[8px] font-mono text-black/10">{scriptText.length} characters</span>
                      </div>
                      <textarea 
                        value={scriptText}
                        onChange={(e) => setScriptText(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded-3xl p-8 text-sm focus:ring-0 outline-none text-black min-h-[300px] leading-relaxed placeholder:text-black/10"
                        placeholder="Type or paste your cinematic script here. Our AI will analyze scene headers, character dialogue, and environment descriptions."
                      />
                   </div>

                   <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex items-center gap-3 bg-gray-50 px-4 rounded-2xl border border-gray-100">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 whitespace-nowrap">Scene Rhythm</span>
                        <div className="flex items-center gap-2">
                           <button onClick={() => setSecondsPerScene(Math.max(5, secondsPerScene - 5))} className="w-6 h-6 rounded bg-white border border-gray-100 text-xs">-</button>
                           <span className="text-xs font-bold w-12 text-center">{secondsPerScene}s</span>
                           <button onClick={() => setSecondsPerScene(Math.min(120, secondsPerScene + 5))} className="w-6 h-6 rounded bg-white border border-gray-100 text-xs">+</button>
                        </div>
                     </div>
                     <button 
                      onClick={handleGenerateScenes}
                      disabled={isGenerating || !scriptText.trim()}
                      className="flex-1 bg-black text-white py-6 rounded-[24px] font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                     >
                       {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                       {isGenerating ? 'Analyzing Structure...' : 'Extract & Generate Scenes'}
                     </button>
                   </div>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-widest text-black/20 text-center">Higgsfield Logic: Automating Scene Extraction via Neural Analysis</p>
              </div>
            </div>

            {/* Sidebar Assets & Director Booth */}
            <div className="w-full lg:w-[400px] h-[500px] lg:h-full bg-white flex flex-col border-l border-gray-100 shrink-0">
               <div className="flex border-b border-gray-100">
                 <button 
                  onClick={() => setSidebarTab('assets')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${sidebarTab === 'assets' ? 'text-black border-b-2 border-black' : 'text-black/20 hover:text-black/40'}`}
                 >
                   Production Assets
                 </button>
                 <button 
                  onClick={() => setSidebarTab('director')}
                  className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${sidebarTab === 'director' ? 'text-[#FF5733] border-b-2 border-[#FF5733]' : 'text-black/20 hover:text-black/40'}`}
                 >
                   <Sparkles size={12} className={sidebarTab === 'director' ? 'text-[#FF5733]' : ''} /> Director Booth
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {sidebarTab === 'assets' ? (
                  <div className="space-y-12">
                     <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/20">Scene Segments</h3>
                          <span className="text-[8px] font-bold bg-[#FF5733]/10 text-[#FF5733] px-2 py-0.5 rounded-full">{selectedWorkflow?.scenes?.length || 0} Found</span>
                       </div>
                       {selectedWorkflow?.scenes && selectedWorkflow.scenes.length > 0 ? (
                         <div className="space-y-3">
                           {selectedWorkflow.scenes.map((scene, i) => (
                             <motion.div 
                               initial={{ opacity: 0, x: 20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: i * 0.1 }}
                               key={scene.id} 
                               className="p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-[#FF5733]/40 transition-all cursor-pointer group"
                             >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[9px] font-bold text-[#FF5733]/60 uppercase tracking-widest">{scene.duration}</span>
                                  <Play size={10} className="text-black/20 group-hover:text-[#FF5733] transition-colors" />
                                </div>
                                <h4 className="text-[12px] font-bold text-black/80">{scene.name}</h4>
                                <p className="text-[10px] text-black/40 mt-1">{scene.description}</p>
                             </motion.div>
                           ))}
                         </div>
                       ) : (
                         <div className="py-12 text-center bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
                           <AlertCircle className="mx-auto text-black/5 mb-3" size={24} />
                           <p className="text-[9px] font-bold uppercase tracking-widest text-black/20">Generate scenes to view timeline</p>
                         </div>
                       )}
                     </div>

                     <div className="space-y-6">
                       <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/20">Production Entities</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <EntityLink 
                            icon={<UserIcon size={14}/>} 
                            label="Characters" 
                            count={isGenerating ? "..." : "00"} 
                            onClick={() => {
                              navigate('/characters', { 
                                state: { 
                                  prefill: { 
                                    details: `A character from the project "${projectName || 'Untitled'}". Script summary: ${scriptText.substring(0, 500)}...` 
                                  } 
                                } 
                              });
                            }}
                          />
                          <EntityLink 
                           icon={<Mountain size={14}/>} 
                           label="Environments" 
                           count={isGenerating ? "..." : (scriptText.toLowerCase().includes('city') ? "01" : "00")} 
                           onClick={() => {
                             if (scriptText.toLowerCase().includes('city')) {
                               navigate('/environments', { state: { prefill: { description: 'A floating city in space with glowing rings, near zero gravity' } } });
                             } else {
                               navigate('/environments');
                             }
                           }}
                          />
                          <EntityLink icon={<Box size={14}/>} label="Objects" count="00" onClick={() => navigate('/objects')} />
                          <EntityLink icon={<Zap size={14}/>} label="VFX" count="00" onClick={() => {}} />
                       </div>
                     </div>

                     <button className="w-full bg-[#FF5733]/5 text-[#FF5733] py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-[#FF5733]/20 hover:bg-[#FF5733] hover:text-white transition-all flex items-center justify-center gap-2">
                        Push Pipeline to Higgsfield
                     </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="space-y-6 flex-1">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-12 space-y-4">
                           <div className="w-16 h-16 bg-[#FF5733]/5 rounded-3xl flex items-center justify-center mx-auto text-[#FF5733]">
                             <Bot size={32} />
                           </div>
                           <h3 className="text-sm font-medium">AI Scene Director</h3>
                           <p className="text-[10px] text-black/40 leading-relaxed max-w-[200px] mx-auto">
                             "I'm here to help you flesh out your script. Ask me for plot twists, scene descriptions, or character motivations."
                           </p>
                           <div className="pt-8 grid grid-cols-1 gap-2">
                              <button 
                                onClick={() => handleAIBoothChat("I'm stuck. Can you suggest a dramatic plot twist for this scene?")}
                                className="text-[9px] font-bold uppercase tracking-widest p-3 bg-gray-50 rounded-xl hover:bg-[#FF5733]/10 hover:text-[#FF5733] transition-all text-black/40"
                              >
                                🚩 I'm stuck, suggest a twist
                              </button>
                              <button 
                                onClick={() => handleAIBoothChat("Write a professional dialogue between two characters arguing about a secret.")}
                                className="text-[9px] font-bold uppercase tracking-widest p-3 bg-gray-50 rounded-xl hover:bg-[#FF5733]/10 hover:text-[#FF5733] transition-all text-black/40"
                              >
                                💬 Write some dialogue
                              </button>
                              <button 
                                onClick={() => handleAIBoothChat("Describe a futuristic environment that feels cold and oppressive.")}
                                className="text-[9px] font-bold uppercase tracking-widest p-3 bg-gray-50 rounded-xl hover:bg-[#FF5733]/10 hover:text-[#FF5733] transition-all text-black/40"
                              >
                                🌍 Describe the world
                              </button>
                           </div>
                        </div>
                      )}
                      
                      {chatMessages.map((msg, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={`msg-${i}-${msg.role}`} 
                          className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-[#FF5733] text-white'}`}>
                            {msg.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                          </div>
                          <div className={`space-y-3 max-w-[80%]`}>
                            <div className={`p-4 rounded-[20px] text-xs leading-relaxed group relative ${msg.role === 'user' ? 'bg-gray-100 text-black' : 'bg-[#FF5733]/5 text-black border border-[#FF5733]/10'}`}>
                               {msg.content.replace(/\[SCRIPT_SUGGESTION\][\s\S]*?\[\/SCRIPT_SUGGESTION\]/g, (match) => {
                                 return "\n\n(Director suggested script adjustment)";
                               })}
                               
                               {msg.role === 'model' && (
                                 <button 
                                   onClick={() => playAISpeech(msg.content.replace(/\[SCRIPT_SUGGESTION\][\s\S]*?\[\/SCRIPT_SUGGESTION\]/g, ''), i)}
                                   className="absolute -right-2 -top-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                 >
                                   {playingVoiceId === i ? <Loader2 size={10} className="animate-spin" /> : <Volume2 size={10} />}
                                 </button>
                               )}
                            </div>
                            {/* Sync button removed - now handled by final sync */}
                          </div>
                        </motion.div>
                      ))}
                      {isCastingDirector && (
                         <div className="flex gap-3">
                           <div className="w-8 h-8 rounded-xl bg-[#FF5733] text-white flex items-center justify-center">
                             <Loader2 size={14} className="animate-spin" />
                           </div>
                           <div className="bg-gray-50 p-4 rounded-2xl animate-pulse w-24"></div>
                         </div>
                      )}

                      {chatMessages.length > 0 && (
                        <div className="pt-8">
                          <button 
                            onClick={handleFinalizeScript}
                            disabled={isFinalizingScript || isCastingDirector}
                            className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#FF5733] transition-all disabled:opacity-20 shadow-xl"
                          >
                            {isFinalizingScript ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isFinalizingScript ? 'Merging Changes...' : 'Confirm & Sync All Changes'}
                          </button>
                          <p className="text-[8px] text-black/20 text-center mt-3 uppercase tracking-widest">Merges all discussed script improvements</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
               </div>

               {sidebarTab === 'director' && (
                 <div className="p-6 border-t border-gray-100 bg-white">
                   <div className="relative flex items-center gap-2">
                      <div className="relative flex-1">
                        <input 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAIBoothChat()}
                          placeholder={isListening ? "Listening..." : "Discuss your script..."}
                          className={`w-full bg-gray-50 border-none rounded-2xl py-4 pl-6 pr-12 text-xs focus:ring-1 focus:ring-[#FF5733] outline-none transition-all ${isListening ? 'ring-2 ring-[#FF5733] bg-[#FF5733]/5' : ''}`}
                        />
                        <button 
                          onClick={() => toggleSpeechRecognition()}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-[#FF5733] text-white animate-pulse' : 'text-black/20 hover:text-black'}`}
                        >
                          {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                        </button>
                      </div>
                      <button 
                        onClick={handleAIBoothChat}
                        disabled={!chatInput.trim() || isCastingDirector}
                        className="p-4 bg-black text-white rounded-2xl hover:bg-[#FF5733] transition-all disabled:opacity-20 shrink-0"
                      >
                        <Send size={14} />
                      </button>
                   </div>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EntityLink({ icon, label, count, onClick }: { icon: React.ReactNode, label: string, count: string, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-white hover:shadow-lg transition-all cursor-pointer group text-left"
    >
       <div className="text-black/20 group-hover:text-[#FF5733] transition-colors mb-3">{icon}</div>
       <div className="space-y-0.5">
          <p className="text-[9px] font-bold text-black uppercase tracking-tight">{label}</p>
          <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest">{count} Ready</p>
       </div>
    </div>
  );
}
