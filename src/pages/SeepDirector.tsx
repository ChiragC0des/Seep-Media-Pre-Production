import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Users, 
  Mountain, 
  Video,
  FileText,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Loader2,
  User,
  Box,
  Save,
  Database,
  Plus,
  Volume2,
  Trash2,
  Send,
  Settings,
  Activity,
  Zap,
  Bot,
  Search,
  Dna,
  FileJson,
  Mic,
  MicOff
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, query, where, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, getDirectorVoice } from '../services/scriptDirectorService';
import { generateScenesFromScript } from '../services/sceneGenService';
import { cinematicEngine, Project } from '../services/cinematicEngine';

// Defined Steps for the Production Pipeline
type Step = 'neural_script' | 'scene_engine' | 'asset_mapping' | 'cinematography' | 'master_matrix';

interface Scene {
  id?: string;
  number: number;
  dur: string;
  title: string;
  body: string;
  dialogue?: string;
  action?: string;
  cameraType?: string;
  motionType?: string;
  mappedChars?: string[];
  mappedProps?: string[];
  mappedEnv?: string;
}

const SeepDirector = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowId = searchParams.get('id');

  const [currentStep, setCurrentStep] = useState<Step>('neural_script');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [script, setScript] = useState('');
  const [projectName, setProjectName] = useState('Untitled Production');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [secondsPerScene, setSecondsPerScene] = useState(15);
  
  // Chat/Director State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isDirectorThinking, setIsDirectorThinking] = useState(false);
  const [isFinalizingScript, setIsFinalizingScript] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Archive State
  const [characters, setCharacters] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [objects, setObjects] = useState<any[]>([]);
  const [selectedSceneIdx, setSelectedSceneIdx] = useState(0);

  // Cinematic Memory State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [memory, setMemory] = useState<any>(null);
  const [isInitializingMemory, setIsInitializingMemory] = useState(true);

  // Layout State
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  const updateActiveProjectField = async (field: string, value: string) => {
    if (!activeProject || !user) return;
    try {
      await updateDoc(doc(db, 'projects', activeProject.id!), {
        [field]: value,
        updatedAt: serverTimestamp()
      });
      setActiveProject(prev => prev ? { ...prev, [field]: value } : null);
    } catch (error) {
       handleFirestoreError(error, OperationType.UPDATE, 'projects');
    }
  };

  const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
    { id: 'neural_script', label: '1. Drafting & Booth', icon: <Bot size={14} /> },
    { id: 'scene_engine', label: '2. Scene Engine', icon: <Layers size={14} /> },
    { id: 'asset_mapping', label: '3. Asset Definition', icon: <Users size={14} /> },
    { id: 'cinematography', label: '4. Camera & Motion', icon: <Video size={14} /> },
    { id: 'master_matrix', label: '5. Excel Compilation', icon: <FileText size={14} /> },
  ];

  useEffect(() => {
    if (!user) return;

    const initMemory = async () => {
      setIsInitializingMemory(true);
      const userProjects = await cinematicEngine.getProjects();
      if (userProjects && userProjects.length > 0) {
        setProjects(userProjects as Project[]);
        // Auto-select first project for now or if ID matches
        setActiveProject(userProjects[0] as Project);
      } else {
        // Create a default project if none exist
        const newProjId = await cinematicEngine.createProject('Genesis Production', 'The first cinematic universe.');
        const updatedProjects = await cinematicEngine.getProjects();
        setProjects(updatedProjects as Project[]);
        setActiveProject(updatedProjects?.find(p => p.id === newProjId) as Project || null);
      }
      setIsInitializingMemory(false);
    };

    initMemory();
  }, [user]);

  useEffect(() => {
     if (!activeProject || !user) return;
     
     const unsubs: (() => void)[] = [];
     const memoryColls = ['characters', 'environments', 'objects', 'storyBeats', 'relationships', 'cinematicStyles'];

     memoryColls.forEach(col => {
       const path = `projects/${activeProject.id}/${col}`;
       const q = query(collection(db, path), where('userId', '==', user.uid));
       const unsub = onSnapshot(q, (snap) => {
         const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
         if (col === 'characters') setCharacters(data);
         if (col === 'environments') setEnvironments(data);
         if (col === 'objects') setObjects(data);
         setMemory((prev: any) => ({ ...prev, [col]: data }));
       }, (error) => handleFirestoreError(error, OperationType.LIST, path));
       unsubs.push(unsub);
     });

     return () => unsubs.forEach(unsub => unsub());
  }, [activeProject, user]);

  useEffect(() => {
    if (!user) return;

    if (workflowId) {
      const fetchWorkflow = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'workflows', workflowId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProjectName(data.projectName || data.name || 'Untitled Production');
            setScript(data.script || '');
            setScenes(data.scenes || []);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'workflows');
        }
      };
      fetchWorkflow();
    }

    return () => {};
  }, [workflowId, user]);

  const handleNext = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const workflowData = {
        projectName,
        script,
        updatedAt: serverTimestamp(),
        scenes,
        mode: 'advanced'
      };

      if (!workflowId) {
        const docRef = await addDoc(collection(db, 'workflows'), {
          ...workflowData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        navigate(`/studio?id=${docRef.id}`, { replace: true });
      } else {
        await updateDoc(doc(db, 'workflows', workflowId), workflowData);
      }

      const idx = steps.findIndex(s => s.id === currentStep);
      if (idx < steps.length - 1) {
        setCurrentStep(steps[idx + 1].id);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'workflows');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAIBoothChat = async (overrideInput?: string) => {
    const input = overrideInput || chatInput;
    if (!input.trim() || isDirectorThinking || !activeProject) return;
    
    const userMsg: ChatMessage = { role: 'user', content: input };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsDirectorThinking(true);

    try {
      const response = await cinematicEngine.generateNexusResponse(activeProject.id!, input, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDirectorThinking(false);
    }
  };

  const handleFinalizeScript = async () => {
    if (!user || chatMessages.length === 0) return;
    setIsFinalizingScript(true);
    try {
      const { finalizeScriptIntoMainDraft } = await import('../services/scriptDirectorService');
      const updatedScript = await finalizeScriptIntoMainDraft(script, chatMessages);
      setScript(updatedScript);
    } catch (error) {
      console.error(error);
    } finally {
      setIsFinalizingScript(false);
    }
  };

  const playAISpeech = async (text: string, index: number) => {
    try {
      setPlayingVoiceId(index);
      const base64Audio = await getDirectorVoice(text);
      if (base64Audio) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const bytes = new Uint8Array(atob(base64Audio).split('').map(c => c.charCodeAt(0)));
        const pcmData = new Int16Array(bytes.buffer);
        const float32Data = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) float32Data[i] = pcmData[i] / 32768.0;
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
      setPlayingVoiceId(null);
    }
  };

  const startVoiceCapture = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSceneGeneration = async () => {
    if (!script.trim()) return;
    setIsProcessing(true);
    try {
      const data = await generateScenesFromScript(script, secondsPerScene);
      setScenes(data.scenes.map((s: any, i: number) => ({
        number: i + 1,
        dur: s.duration,
        title: s.name,
        body: s.description,
        dialogue: s.dialogue || '',
        action: s.action || '',
        cameraType: 'Wide Shot',
        motionType: 'Static',
        mappedChars: [],
        mappedProps: [],
        mappedEnv: ''
      })));
      setCurrentStep('scene_engine');
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateScene = (idx: number, updates: Partial<Scene>) => {
    const newScenes = [...scenes];
    newScenes[idx] = { ...newScenes[idx], ...updates };
    setScenes(newScenes);
  };

  const toggleAsset = (idx: number, type: 'char' | 'prop', id: string) => {
    const scene = scenes[idx];
    const field = type === 'char' ? 'mappedChars' : 'mappedProps';
    const current = (scene as any)[field] || [];
    const updated = current.includes(id) ? current.filter((i: string) => i !== id) : [...current, id];
    updateScene(idx, { [field]: updated });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-[#FF5733]/10">
      <div className={`max-w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 h-screen overflow-hidden`}>
        
        {/* Sidebar: Navigation & Controls - High Contrast Technical Style */}
        <div className={`${isLeftCollapsed ? 'md:col-span-1' : 'md:col-span-3'} border-r border-[#E5E5E5] flex flex-col bg-white h-full overflow-hidden shadow-[1px_0_0_0_#E5E5E5] transition-all duration-300 relative`}>
          <button 
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            className="absolute top-8 -right-3 z-[60] bg-white border border-[#E5E5E5] rounded-full p-1 shadow-md hover:text-[#FF5733] transition-colors"
          >
            {isLeftCollapsed ? <ChevronRight size={14} /> : <RotateCcw size={14} className="-scale-x-100" />}
          </button>

          {!isLeftCollapsed ? (
            <>
              <div className="p-8 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-4 mb-10 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="bg-[#1A1A1A] text-white p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.12)] group-hover:scale-105 transition-transform">
                <Bot size={20} className="text-[#FF5733]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-black opacity-30">Studio</p>
                <h1 className="text-xs font-black tracking-tight uppercase">Director V.2</h1>
              </div>
            </div>

            <nav className="space-y-2">
              {steps.map((st, i) => (
                <button 
                   key={st.id} 
                   onClick={() => setCurrentStep(st.id)}
                   className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 relative group ${
                     currentStep === st.id 
                     ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[0_8px_16px_rgba(0,0,0,0.1)]' 
                     : 'bg-white border-transparent text-black/40 hover:bg-[#FAFAFA]'
                   }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-black font-mono ${currentStep === st.id ? 'text-[#FF5733]' : 'text-black/20'}`}>0{i + 1}</span>
                    <span className="text-[11px] font-black uppercase tracking-tight">{st.label.split('. ')[1]}</span>
                  </div>
                  {currentStep === st.id && <Zap size={10} className="text-[#FF5733] fill-[#FF5733]" />}
                  {currentStep !== st.id && <div className="absolute left-0 w-1 h-0 bg-[#FF5733] group-hover:h-4 rounded-full transition-all duration-300" />}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8">
             <section className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-black/20">Active Universe</label>
                    <select 
                      value={activeProject?.id || ''} 
                      onChange={(e) => setActiveProject(projects.find(p => p.id === e.target.value) || null)}
                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold outline-none"
                    >
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-black/20">Genre Meta</label>
                    <div className="grid grid-cols-2 gap-2">
                       <input 
                         type="text" placeholder="Genre" value={activeProject?.genre || ''} 
                         onChange={(e) => updateActiveProjectField('genre', e.target.value)}
                         className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-[#FF5733]/40"
                       />
                       <input 
                         type="text" placeholder="Tone" value={activeProject?.tone || ''} 
                         onChange={(e) => updateActiveProjectField('tone', e.target.value)}
                         className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold outline-none focus:border-[#FF5733]/40"
                       />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-wider text-black/20">Alias</label>
                    <input 
                      type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)}
                      className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[8px] font-black uppercase tracking-wider text-black/20">Tempo</label>
                      <span className="text-[9px] font-bold text-[#FF5733]">{secondsPerScene}s</span>
                    </div>
                    <input 
                      type="range" min="5" max="180" step="5" value={secondsPerScene} onChange={(e) => setSecondsPerScene(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-lg appearance-none accent-[#FF5733]"
                    />
                  </div>
                </div>
             </section>
          </div>
            </>
          ) : (
            <div className="flex flex-col items-center pt-24 gap-8">
              {steps.map(st => (
                <div key={st.id} className={`p-3 rounded-xl transition-all ${currentStep === st.id ? 'bg-[#1A1A1A] text-[#FF5733]' : 'text-black/10'}`}>
                  {st.icon}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Center: Main Workflow Canvas (Neural Workstation) */}
        <div className={`${(isLeftCollapsed && isRightCollapsed) ? 'md:col-span-10' : (isLeftCollapsed || isRightCollapsed) ? 'md:col-span-8' : 'md:col-span-6'} bg-white overflow-hidden flex flex-col h-full relative transition-all duration-300`}>
           {/* Neural Background Pattern */}
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
           
           <div className="flex-1 overflow-y-auto p-12 scrollbar-thin relative z-10">
             <AnimatePresence mode="wait">
              {currentStep === 'neural_script' && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="h-full flex flex-col space-y-12">
                  <header className="space-y-4">
                     <div className="flex items-center gap-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                          <Zap size={10} className="text-[#FF5733]" /> Phase 01: Drafting
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-[#EEEEEE] to-transparent" />
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-[#FF5733]" />
                             <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">Neural Load: 12%</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-emerald-500" />
                             <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">Link: Stable</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.9]">Neural<br />Workstation</h2>
                           <p className="text-xs font-bold text-black/30 uppercase tracking-[0.4em]">Integrated Director & Drafting Booth</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black transition-colors">
                           <Settings size={12} />
                           System Config
                        </button>
                     </div>
                   </header>
                   
                   <div className="flex flex-col gap-10 flex-1">
                     {/* Director's Booth - Command Center Style */}
                     <div className="bg-white rounded-[2.5rem] border border-[#EEEEEE] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden group relative min-h-[500px]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#FF5733]" />
                        <div className="p-6 border-b border-[#F5F5F5] flex justify-between items-center bg-white/80 backdrop-blur-md relative z-10">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                                 <Bot size={18} className="text-[#FF5733]" />
                              </div>
                              <div className="space-y-0.5">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Director Nexus</span>
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase text-black/30">Active Intelligence</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-4">
                              {chatMessages.length > 0 && (
                                <button onClick={handleFinalizeScript} disabled={isFinalizingScript} className="h-10 px-5 rounded-xl bg-[#FF5733]/5 text-[9px] font-black uppercase text-[#FF5733] border border-[#FF5733]/10 hover:bg-[#FF5733] hover:text-white transition-all flex items-center gap-2">
                                  {isFinalizingScript ? <Loader2 size={12} className="animate-spin" /> : <Dna size={12} />}
                                  <span>Sync to Script</span>
                                </button>
                              )}
                           </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[#FDFDFD] relative">
                           {/* Terminal Grid Overlay */}
                           <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                           {chatMessages.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center space-y-6">
                                 <div className="w-20 h-20 rounded-full bg-[#FAFAFA] border border-[#EEEEEE] flex items-center justify-center text-black/10 group-hover:text-[#FF5733]/20 transition-colors">
                                    <Bot size={40} strokeWidth={1.5} />
                                 </div>
                                 <div className="text-center space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20">Awaiting Directions</p>
                                    <p className="text-xs font-medium text-black/40 italic">"What visual energy shall we capture today?"</p>
                                 </div>
                              </div>
                           )}
                           {chatMessages.map((msg, i) => (
                              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} relative z-10`}>
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                                  msg.role === 'user' 
                                  ? 'bg-[#1A1A1A] border-white/10 text-[#FF5733]' 
                                  : 'bg-white border-[#EEEEEE] text-black/20'
                                }`}>
                                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>
                                 <div className={`relative p-8 rounded-[2rem] text-[13px] font-medium leading-[1.6] max-w-[85%] shadow-sm transition-all hover:shadow-md ${
                                   msg.role === 'user' 
                                   ? 'bg-[#1A1A1A] text-white rounded-tr-none' 
                                   : 'bg-white border border-[#EEEEEE] text-[#1A1A1A] rounded-tl-none'
                                 }`}>
                                   <div className="whitespace-pre-wrap">
                                      {msg.content}
                                   </div>
                                   {msg.role === 'model' && (
                                     <button 
                                       onClick={() => playAISpeech(msg.content, i)} 
                                       className="absolute -right-12 top-0 bg-white border border-[#EEEEEE] p-3 rounded-xl shadow-sm hover:bg-[#FAFAFA] transition-all hover:scale-110 active:scale-95 group/voice"
                                       aria-label="Speak response"
                                     >
                                       {playingVoiceId === i ? <Loader2 size={12} className="animate-spin text-[#FF5733]" /> : <Volume2 size={16} className="text-[#FF5733] group-hover/voice:scale-110 transition-transform" />}
                                     </button>
                                   )}
                                </div>
                              </div>
                           ))}
                           {isDirectorThinking && (
                              <div className="flex items-center gap-3 px-2 relative z-10">
                                <div className="flex gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733] animate-bounce [animation-delay:-0.3s]" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733] animate-bounce [animation-delay:-0.15s]" />
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733] animate-bounce" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5733]/60">director analyzing intent...</span>
                              </div>
                           )}
                        </div>

                        {/* Neural Command Shortcuts */}
                        <div className="px-8 py-4 flex gap-2 overflow-x-auto scrollbar-hide border-t border-[#F5F5F5] bg-[#FDFDFD]/80 relative z-10">
                          {[
                            { label: 'Brainstorm Openings', prompt: 'Brainstorm multiple cinematic openings for this story, explaining the emotional impact of each.' },
                            { label: 'Director\'s Table', prompt: 'Let\'s enter Director\'s Table mode. Analyze the current script, what emotionally works, and suggest future payoffs.' },
                            { label: 'Deepen Chemistry', prompt: 'Analyze the relationship dynamics and suggest a slow-burn micro-moment to deepen the chemistry.' },
                            { label: 'Living World', prompt: 'Add atmospheric living-world details to the current scene to make it feel more inhabited and gradual.' }
                          ].map((cmd, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAIBoothChat(cmd.prompt)}
                              className="shrink-0 px-4 py-2 rounded-full border border-[#EEEEEE] bg-white text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-[#FF5733] hover:border-[#FF5733]/50 hover:shadow-sm transition-all"
                            >
                              {cmd.label}
                            </button>
                          ))}
                        </div>

                        <div className="p-8 border-t border-[#F5F5F5] bg-white relative z-10">
                           <div className="flex gap-4 items-center bg-[#FAFAFA] p-2.5 rounded-[2rem] border border-[#EEEEEE] focus-within:border-[#FF5733] focus-within:ring-4 focus-within:ring-[#FF5733]/5 transition-all shadow-inner">
                               <div className="pl-4 text-black/20">
                                <Search size={16} />
                              </div>
                              <input 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAIBoothChat()}
                                placeholder="Sync directions with the neural engine..."
                                className="flex-1 bg-transparent border-none px-2 py-4 text-base outline-none font-medium placeholder:text-black/10"
                                aria-label="Director input"
                              />
                              <button 
                                onClick={startVoiceCapture}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-[#FF5733] text-white animate-pulse' : 'bg-white border border-[#EEEEEE] text-black/40 hover:text-[#FF5733]'}`}
                                title={isRecording ? 'Stop Recording' : 'Voice Input'}
                              >
                                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                              </button>
                              <button 
                                onClick={() => handleAIBoothChat()} 
                                className="bg-[#1A1A1A] text-white w-14 h-14 rounded-[1.2rem] shadow-xl hover:bg-[#FF5733] active:scale-95 transition-all flex items-center justify-center group"
                                aria-label="Send direction"
                              >
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                           </div>
                        </div>
                     </div>
                     {/* Drafting Area - Scripting Console */}
                     <div className="bg-[#FAFAFA] rounded-[2.5rem] p-10 border border-[#EEEEEE] shadow-inner flex flex-col group/draft relative overflow-hidden min-h-[500px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5733]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="mb-8 flex justify-between items-center relative z-10">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-xl bg-white border border-[#EEEEEE] flex items-center justify-center text-[#FF5733] shadow-sm">
                                 <FileText size={14} />
                              </div>
                              <div className="space-y-0.5">
                                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Main Production Script</label>
                                 <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase text-black/20 tracking-widest">Real-time Syncing</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#EEEEEE] rounded-lg shadow-sm">
                              <span className="text-[9px] font-mono font-bold text-black/30 tracking-tighter">Line Counts Active</span>
                           </div>
                        </div>
                        <div className="flex-1 relative z-10 flex">
                           <div className="w-8 flex flex-col pt-1 text-[10px] font-mono text-black/10 select-none">
                              {[...Array(20)].map((_, i) => <div key={i} className="leading-[1.75] h-7">{i + 1}</div>)}
                           </div>
                           <textarea 
                               value={script} onChange={(e) => setScript(e.target.value)}
                               placeholder="Start directing your masterpiece... (E.g. A noir alleyway, rain hitting the concrete.)"
                               className="flex-1 bg-transparent text-[#1A1A1A] text-lg font-medium leading-[1.75] outline-none resize-none placeholder:text-black/10 custom-scrollbar selection:bg-[#FF5733]/20 font-sans"
                               aria-label="Script editor"
                           />
                        </div>
                     </div>
                   </div>

                   <div className="flex justify-end pt-4">
                      <button 
                         onClick={handleSceneGeneration}
                         disabled={isProcessing || !script.trim()}
                         className="bg-black text-white px-12 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-[#FF5733] shadow-2xl transition-all active:scale-95 disabled:bg-gray-100"
                      >
                         {isProcessing ? <RotateCcw size={16} className="animate-spin" /> : <Layers size={16} />}
                         Initiate Sequence Engine
                      </button>
                   </div>
                </motion.div>
              )}

              {currentStep === 'scene_engine' && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-24">
                  <header className="flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 py-6 z-20">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2">
                          <Layers size={14} className="text-[#FF5733]" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Sequence Engine</p>
                       </div>
                       <h2 className="text-4xl font-black tracking-tighter uppercase px-1">Neural Segmentation</h2>
                    </div>
                    <button onClick={() => setCurrentStep('neural_script')} className="flex items-center gap-2 px-5 py-2.5 bg-[#FAFAFA] border border-[#EEEEEE] text-[10px] font-black uppercase tracking-widest text-black/60 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm">
                      <RotateCcw size={12} />
                      <span>Back to Draft</span>
                    </button>
                  </header>
                   <div className="grid grid-cols-1 gap-12 pt-6">
                    {scenes.map((sc, i) => (
                      <div key={i} className="bg-white rounded-[3.5rem] border border-[#EEEEEE] shadow-[0_32px_64px_-24px_rgba(0,0,0,0.06)] hover:shadow-[0_48px_96px_-32px_rgba(0,0,0,0.12)] transition-all group overflow-hidden relative border-l-[12px] border-l-[#1A1A1A] hover:border-l-[#FF5733]">
                        {/* Film Grain/Noise Effect Sub-layer */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/film-grain.png")' }} />
                        
                        <div className="absolute top-[-20%] right-[-10%] w-[40%] aspect-square bg-[#FF5733]/5 rounded-full blur-[100px] group-hover:bg-[#FF5733]/15 transition-all duration-700" />
                        
                        <div className="p-12 relative z-10">
                          <header className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-8">
                               <div className="relative">
                                  <div className="w-16 h-16 rounded-[2rem] bg-[#1A1A1A] text-white flex items-center justify-center text-3xl font-black shadow-2xl group-hover:bg-[#FF5733] transition-colors relative z-10">
                                    {sc.number}
                                  </div>
                                  <div className="absolute inset-0 bg-[#FF5733]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                               </div>
                               <div className="space-y-1.5">
                                 <h4 className="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A]">{sc.title}</h4>
                                 <div className="flex items-center gap-4">
                                   <div className="flex items-center gap-2 px-3 py-1 bg-[#FAFAFA] border border-[#EEEEEE] rounded-full">
                                      <Zap size={10} className="text-[#FF5733]" />
                                      <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">{sc.dur} Sequence</span>
                                   </div>
                                   <div className="h-1 w-1 rounded-full bg-black/10" />
                                   <span className="text-[10px] font-bold text-black/20 uppercase tracking-widest">Neural Rank: A+</span>
                                 </div>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button className="p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl text-black/20 hover:text-[#FF5733] hover:bg-white transition-all">
                                  <RotateCcw size={16} />
                               </button>
                               <button className="p-3 bg-[#FAFAFA] border border-[#EEEEEE] rounded-xl text-black/20 hover:text-black hover:bg-white transition-all">
                                  <Plus size={16} />
                               </button>
                            </div>
                          </header>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                             {/* Atmosphere Card */}
                             <div className="md:col-span-5 space-y-6">
                                <div className="flex items-center justify-between px-1">
                                  <div className="flex items-center gap-2 text-[#FF5733]">
                                    <Sparkles size={14} strokeWidth={2.5} />
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em]">Atmosphere Blueprint</label>
                                  </div>
                                  <div className="h-px flex-1 mx-6 bg-gradient-to-r from-black/5 to-transparent" />
                                </div>
                                <div className="bg-[#1A1A1A] rounded-[2rem] p-10 relative overflow-hidden group/atmosphere">
                                   <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-white">
                                      <Dna size={40} />
                                   </div>
                                   <p className="text-base font-medium text-white/80 leading-relaxed italic selection:bg-[#FF5733]/40">
                                      "{sc.body}"
                                   </p>
                                   <div className="mt-8 flex gap-3">
                                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-white/40">Visual Tone: Dark</span>
                                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-white/40">Pacing: Dynamic</span>
                                   </div>
                                </div>
                             </div>

                             {/* Functional Edits */}
                             <div className="md:col-span-7 space-y-10">
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 px-2">
                                    <Volume2 size={14} className="text-[#FF5733]" />
                                    <label className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Neural Dialogue Output</label>
                                  </div>
                                  <div className="relative">
                                    <textarea 
                                      value={sc.dialogue} onChange={(e) => updateScene(i, { dialogue: e.target.value })}
                                      className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-[2rem] p-8 text-[14px] font-bold text-[#1A1A1A] focus:border-[#FF5733] focus:bg-white outline-none min-h-[110px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all resize-none leading-relaxed"
                                      placeholder="Character voice data required..."
                                    />
                                    <div className="absolute right-6 bottom-6 flex gap-2">
                                       <button className="p-2 bg-white rounded-lg shadow-sm text-black/20 hover:text-[#FF5733] transition-colors"><RotateCcw size={14}/></button>
                                       <button className="p-2 bg-white rounded-lg shadow-sm text-black/20 hover:text-[#FF5733] transition-colors"><CheckCircle2 size={14}/></button>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div className="flex items-center gap-3 px-2">
                                    <Activity size={14} className="text-[#FF5733]" />
                                    <label className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em]">Motion & Action Vector</label>
                                  </div>
                                  <div className="relative">
                                    <textarea 
                                      value={sc.action} onChange={(e) => updateScene(i, { action: e.target.value })}
                                      className="w-full bg-[#FAFAFA] border border-[#EEEEEE] rounded-[2rem] p-8 text-[14px] font-bold text-[#1A1A1A] focus:border-[#FF5733] focus:bg-white outline-none min-h-[110px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all resize-none leading-relaxed"
                                      placeholder="Kinetic instructions required..."
                                    />
                                    <div className="absolute right-6 bottom-6 flex gap-2">
                                       <button className="p-2 bg-white rounded-lg shadow-sm text-black/20 hover:text-[#FF5733] transition-colors"><RotateCcw size={14}/></button>
                                       <button className="p-2 bg-white rounded-lg shadow-sm text-black/20 hover:text-[#FF5733] transition-colors"><CheckCircle2 size={14}/></button>
                                    </div>
                                  </div>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-center py-16">
                     <button onClick={() => setCurrentStep('asset_mapping')} className="bg-[#1A1A1A] text-white px-20 py-7 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-6 hover:bg-[#FF5733] shadow-[0_32px_64px_-16px_rgba(255,87,51,0.25)] transition-all active:scale-95 group">
                        Map Assets to Sequence
                        <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                     </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 'asset_mapping' && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                   <header className="space-y-2">
                     <div className="flex items-center gap-2">
                        <Users size={14} className="text-[#FF5733]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Resource Binding</p>
                     </div>
                     <h2 className="text-4xl font-black tracking-tighter uppercase px-1">Talent & World Mapping</h2>
                   </header>
                   
                   <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                      {scenes.map((sc, i) => (
                        <button 
                          key={i} onClick={() => setSelectedSceneIdx(i)}
                          className={`shrink-0 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${selectedSceneIdx === i ? 'bg-[#1A1A1A] text-[#FF5733] shadow-xl border-[#1A1A1A]' : 'bg-white border-[#EEEEEE] border text-black/30 hover:text-black hover:bg-[#FAFAFA]'}`}
                        >
                          S.{sc.number < 10 ? `0${sc.number}` : sc.number}
                        </button>
                      ))}
                   </div>

                   <div className="bg-white rounded-[3.5rem] p-12 border border-[#EEEEEE] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-16">
                      <div className="flex items-center gap-8 border-b border-[#F5F5F5] pb-10">
                         <div className="w-20 h-20 rounded-[2.5rem] bg-[#1A1A1A] text-white flex items-center justify-center font-black text-3xl shadow-2xl border-4 border-[#FF5733]/10">{selectedSceneIdx + 1}</div>
                         <div className="space-y-1">
                            <h3 className="text-3xl font-black tracking-tighter uppercase">{scenes[selectedSceneIdx].title}</h3>
                            <p className="text-[11px] font-black text-[#FF5733] uppercase tracking-[0.3em]">Mapping Sequence Dependencies</p>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 gap-16">
                         <div className="space-y-8">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-3">
                                <Users size={16} /> Cast Selection
                              </h4>
                              <span className="text-[10px] font-black font-mono text-black/20 uppercase tracking-widest">{scenes[selectedSceneIdx].mappedChars?.length || 0} Bindings</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                               {characters.map(char => (
                                 <button 
                                   key={char.id} 
                                   onClick={() => toggleAsset(selectedSceneIdx, 'char', char.id)}
                                   className={`p-4 rounded-2xl border transition-all flex flex-col gap-4 group ${scenes[selectedSceneIdx].mappedChars?.includes(char.id) ? 'bg-[#1A1A1A] text-white border-black ring-4 ring-[#FF5733]/20' : 'bg-[#FAFAFA] border-transparent hover:border-[#FF5733]/30'}`}
                                 >
                                   <div className="w-full aspect-square rounded-xl overflow-hidden shadow-inner grayscale group-hover:grayscale-0 transition-all">
                                      <img src={char.img} alt="" className="w-full h-full object-cover" />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-tight truncate px-1 text-center">{char.name}</span>
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-3">
                                <Box size={16} /> Asset Repository
                              </h4>
                              <span className="text-[10px] font-black font-mono text-black/20 uppercase tracking-widest">{scenes[selectedSceneIdx].mappedProps?.length || 0} Objects</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                               {objects.map(obj => (
                                 <button 
                                   key={obj.id} 
                                   onClick={() => toggleAsset(selectedSceneIdx, 'prop', obj.id)}
                                   className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${scenes[selectedSceneIdx].mappedProps?.includes(obj.id) ? 'bg-[#1A1A1A] text-white border-black ring-4 ring-[#FF5733]/20' : 'bg-[#FAFAFA] border-transparent hover:border-[#FF5733]/30'}`}
                                 >
                                   <div className={`p-2.5 rounded-xl ${scenes[selectedSceneIdx].mappedProps?.includes(obj.id) ? 'bg-[#FF5733]/20' : 'bg-white'}`}>
                                     <Box size={16} className={scenes[selectedSceneIdx].mappedProps?.includes(obj.id) ? 'text-[#FF5733]' : 'text-black/10'} />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-tight truncate">{obj.name}</span>
                                 </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className="flex justify-between items-center">
                              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center gap-3">
                                <Mountain size={16} /> World Environment
                              </h4>
                              <span className="text-[10px] font-black font-mono text-[#FF5733] uppercase tracking-widest active-pulse">Primary Set</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                               {environments.map(env => (
                                 <button 
                                   key={env.id} 
                                   onClick={() => updateScene(selectedSceneIdx, { mappedEnv: env.id })}
                                   className={`p-5 rounded-2xl border transition-all flex items-center gap-4 ${scenes[selectedSceneIdx].mappedEnv === env.id ? 'bg-[#1A1A1A] text-white border-black ring-4 ring-[#FF5733]/20' : 'bg-[#FAFAFA] border-transparent hover:border-[#FF5733]/30'}`}
                                 >
                                   <div className={`p-2.5 rounded-xl ${scenes[selectedSceneIdx].mappedEnv === env.id ? 'bg-[#FF5733]/20' : 'bg-white'}`}>
                                     <Mountain size={16} className={scenes[selectedSceneIdx].mappedEnv === env.id ? 'text-[#FF5733]' : 'text-black/20'} />
                                   </div>
                                   <span className="text-[10px] font-black uppercase tracking-tight truncate">{env.category}</span>
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                      <div className="pt-10 flex justify-end">
                        <button onClick={() => setCurrentStep('cinematography')} className="bg-[#1A1A1A] text-white px-12 py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-[#FF5733] transition-all group shadow-2xl">
                          Define Camera Logic 
                          <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                        </button>
                      </div>
                   </div>
                </motion.div>
              )}

              {currentStep === 'cinematography' && (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-40">
                   <header className="space-y-2">
                     <div className="flex items-center gap-2">
                        <Video size={14} className="text-[#FF5733]" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Visual Engineering</p>
                     </div>
                     <h2 className="text-4xl font-black tracking-tighter uppercase px-1">Cinematography Directives</h2>
                   </header>
                   <div className="grid grid-cols-1 gap-6">
                     {scenes.map((sc, i) => (
                       <div key={i} className="bg-white rounded-[2.5rem] p-12 border border-[#EEEEEE] shadow-xl flex items-center gap-12 group transition-all hover:bg-[#1A1A1A] hover:text-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5733]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#FF5733]/20 transition-all" />
                          <div className="w-20 h-20 rounded-[2.5rem] bg-[#FAFAFA] flex items-center justify-center text-3xl font-black text-[#1A1A1A] border border-[#EEEEEE] group-hover:bg-[#FF5733] group-hover:border-transparent group-hover:text-white transition-all shadow-inner relative z-10">{sc.number}</div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity">Visual Frame Angle</label>
                                <select 
                                  value={sc.cameraType} onChange={(e) => updateScene(i, { cameraType: e.target.value })}
                                  className="w-full bg-[#FAFAFA] text-[#1A1A1A] border-none rounded-2xl px-6 py-5 text-[12px] font-black uppercase tracking-widest outline-none ring-1 ring-black/5 focus:ring-[#FF5733]/30 transition-all"
                                >
                                   {['Wide Shot', 'Close-Up', 'Bird\'s Eye View', 'Extreme Close-Up', 'Dolly Shot', 'Handheld'].map(t => <option key={t}>{t}</option>)}
                                </select>
                             </div>
                             <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 group-hover:opacity-60 transition-opacity">Kinetic Trajectory</label>
                                <select 
                                  value={sc.motionType} onChange={(e) => updateScene(i, { motionType: e.target.value })}
                                  className="w-full bg-[#FAFAFA] text-[#1A1A1A] border-none rounded-2xl px-6 py-5 text-[12px] font-black uppercase tracking-widest outline-none ring-1 ring-black/5 focus:ring-[#FF5733]/30 transition-all"
                                >
                                   {['Static', 'Orbit', 'Linear Zoom', 'Fluid Handheld', 'Slow Pull Back', 'Trucking'].map(t => <option key={t}>{t}</option>)}
                                </select>
                             </div>
                          </div>
                       </div>
                     ))}
                   </div>
                   <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#1A1A1A] backdrop-blur-3xl px-16 py-8 rounded-[3rem] border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.3)] flex items-center gap-12 z-[100]">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-[#FF5733] border-t-transparent animate-spin" />
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Analysis Complete</span>
                      </div>
                      <button onClick={() => setCurrentStep('master_matrix')} className="bg-[#FF5733] text-white px-12 py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#FF5733]/40">
                        Synthesize Master Matrix 
                        <CheckCircle2 size={20} />
                      </button>
                   </div>
                </motion.div>
              )}

              {currentStep === 'master_matrix' && (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-32">
                   <header className="flex justify-between items-end bg-[#FAFAFA] -m-12 p-12 mb-12 border-b border-[#EEEEEE] shadow-sm">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2">
                           <FileJson size={14} className="text-[#FF5733]" />
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Technical Documentation</p>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase px-1">Master Production Grid</h2>
                     </div>
                     <div className="flex gap-4">
                        <button onClick={() => window.print()} className="bg-white px-8 py-4 rounded-xl border border-[#EEEEEE] text-[10px] font-black uppercase tracking-widest hover:bg-[#FAFAFA] flex items-center gap-3 transition-all shadow-sm">
                          <FileText size={14}/> <span>Export PDF</span>
                        </button>
                        <button onClick={handleNext} className="bg-[#1A1A1A] text-white px-10 py-4.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#FF5733] transition-all shadow-[0_8px_16px_rgba(0,0,0,0.1)]">
                          <Save size={16}/> <span>Commit to Engine</span>
                        </button>
                     </div>
                   </header>

                   <div className="bg-white rounded-[2.5rem] border border-[#EEEEEE] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1200px]">
                         <thead className="bg-[#FAFAFA] border-b border-[#EEEEEE]">
                            <tr>
                               {['SEQ', 'DIALOGUES & V.O.', 'ACTION & ATMOSPHERE', 'TALENT BINDING', 'TECHNICAL ASSETS', 'ENVIRONMENT', 'CAMERA OPS'].map(h => (
                                 <th key={h} className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.2em] text-black/30 bg-[#FAFAFA]/50">{h}</th>
                               ))}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-[#F5F5F5]">
                            {scenes.map((sc, i) => (
                              <tr key={i} className="hover:bg-[#FF5733]/[0.02] transition-colors group">
                                 <td className="px-8 py-10 align-top">
                                   <div className="text-sm font-mono font-black bg-[#1A1A1A] text-white w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-[#FF5733] transition-colors shadow-lg">
                                     {i + 1 < 10 ? `0${i + 1}` : i + 1}
                                   </div>
                                 </td>
                                 <td className="px-8 py-10 align-top max-w-[240px]">
                                   <p className="text-[12px] font-bold text-[#1A1A1A] leading-relaxed selection:bg-[#FF5733]/20">{sc.dialogue || 'NO DATA'}</p>
                                 </td>
                                 <td className="px-8 py-10 align-top max-w-[340px]">
                                   <p className="text-[11px] font-medium text-black/50 italic leading-relaxed selection:bg-[#FF5733]/20">{sc.action || sc.body}</p>
                                 </td>
                                 <td className="px-8 py-10 align-top">
                                    <div className="flex flex-wrap gap-2">
                                       {sc.mappedChars?.map(cid => {
                                          const c = characters.find(char => char.id === cid);
                                          return <span key={cid} className="px-3 py-1.5 rounded-lg bg-[#F5F5F5] text-[#1A1A1A] text-[9px] font-black uppercase border border-[#EEEEEE] group-hover:border-[#FF5733]/20 transition-colors shadow-sm">{c?.name || '---'}</span>
                                       })}
                                       {(!sc.mappedChars || sc.mappedChars.length === 0) && <span className="text-[9px] font-black text-black/10 uppercase tracking-widest">---</span>}
                                    </div>
                                 </td>
                                 <td className="px-8 py-10 align-top">
                                    <div className="flex flex-wrap gap-2">
                                       {sc.mappedProps?.map(pid => {
                                          const p = objects.find(obj => obj.id === pid);
                                          return <span key={pid} className="px-3 py-1.5 rounded-lg bg-[#FFF4F0] text-[#FF5733] text-[9px] font-black uppercase border border-[#FFE0D1] group-hover:bg-[#FF5733] group-hover:text-white group-hover:border-transparent transition-all shadow-sm">{p?.name || '---'}</span>
                                       })}
                                       {(!sc.mappedProps || sc.mappedProps.length === 0) && <span className="text-[9px] font-black text-black/10 uppercase tracking-widest">---</span>}
                                    </div>
                                 </td>
                                 <td className="px-8 py-10 align-top">
                                    <span className="text-[10px] font-black text-[#1A1A1A] bg-[#FAFAFA] px-4 py-2 rounded-full border border-[#EEEEEE] uppercase tracking-[0.1em] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                                      {environments.find(e => e.id === sc.mappedEnv)?.category || 'UNMAPPED'}
                                    </span>
                                 </td>
                                 <td className="px-8 py-10 align-top">
                                    <div className="space-y-2">
                                       <p className="text-[10px] font-black uppercase tracking-tight text-[#1A1A1A]">{sc.cameraType}</p>
                                       <div className="flex items-center gap-2">
                                          <div className="w-1 h-1 rounded-full bg-[#FF5733]" />
                                          <p className="text-[9px] font-bold text-black/30 uppercase tracking-[0.2em]">{sc.motionType}</p>
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div className="flex flex-col items-center justify-center pt-24 pb-12 space-y-6">
                      <div className="w-24 h-24 bg-[#1A1A1A] text-white rounded-[3rem] flex items-center justify-center shadow-3xl shadow-black/30 transform hover:scale-110 active:scale-95 transition-all cursor-pointer group">
                        <CheckCircle2 size={40} className="group-hover:text-[#FF5733] transition-colors" />
                      </div>
                      <div className="text-center space-y-2">
                        <h4 className="text-2xl font-black uppercase tracking-tighter">Production Baseline Synthesized</h4>
                        <p className="text-sm font-medium text-black/30 max-w-sm mx-auto leading-relaxed">The production grid has been successfully verified. All neural dependencies are synced and ready for engine export.</p>
                      </div>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
           </div>
        </div>

        {/* Right Side: Universe Memory - Master Asset Registry */}
        <div className={`${isRightCollapsed ? 'md:col-span-1' : 'md:col-span-3'} border-l border-[#EEEEEE] flex flex-col bg-[#FDFDFD] h-full overflow-hidden shadow-[inset_1px_0_0_rgba(0,0,0,0.02)] transition-all duration-300 relative`}>
           <button 
             onClick={() => setIsRightCollapsed(!isRightCollapsed)}
             className="absolute top-8 -left-3 z-[60] bg-white border border-[#EEEEEE] rounded-full p-1 shadow-md hover:text-[#FF5733] transition-colors"
           >
             {isRightCollapsed ? <RotateCcw size={14} className="scale-x-100" /> : <ChevronRight size={14} />}
           </button>

           {!isRightCollapsed ? (
             <>
               <header className="p-8 border-b border-[#F5F5F5] flex items-center justify-between bg-white backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="bg-[#FF5733]/10 p-1.5 rounded-lg">
                  <Database size={14} className="text-[#FF5733]" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#1A1A1A]">Universe Memory</h3>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">Nexus-Linked</span>
              </div>
           </header>

           <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-10">
             <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-black/20">Characters</h3>
                  <Users size={12} className="text-black/10" />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {characters.map(char => (
                    <div key={char.id} className="p-2.5 rounded-xl border border-gray-50 bg-white flex items-center gap-3 group hover:bg-[#1A1A1A] hover:text-white transition-all cursor-pointer shadow-sm">
                       <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center text-[10px] font-black">
                         {char.img ? <img src={char.img} alt="" className="w-full h-full object-cover" /> : char.name[0]}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-black uppercase truncate">{char.name}</p>
                          <p className="text-[7px] font-bold opacity-30 uppercase truncate">{char.archetype || 'Asset'}</p>
                       </div>
                    </div>
                  ))}
                  {characters.length === 0 && <p className="text-[8px] text-black/10 italic text-center py-2">Persistence empty.</p>}
                </div>
             </section>

             <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-black/20">Environments</h3>
                  <Mountain size={12} className="text-black/10" />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                   {environments.map(env => (
                      <div key={env.id} className="px-4 py-3 rounded-lg border border-gray-100 bg-white hover:border-[#FF5733]/40 transition-all flex items-center gap-3 cursor-pointer shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733]/40" />
                        <span className="text-[9px] font-bold uppercase truncate">{env.name || env.category}</span>
                      </div>
                   ))}
                </div>
             </section>

             <section className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-black/20">Persistent Objects</h3>
                  <Box size={12} className="text-black/10" />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                   {objects.map(obj => (
                      <div key={obj.id} className="px-4 py-3 rounded-lg border border-gray-100 bg-white hover:border-[#FF5733]/40 transition-all flex items-center gap-3 cursor-pointer shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                        <span className="text-[9px] font-bold uppercase truncate">{obj.name}</span>
                      </div>
                   ))}
                </div>
             </section>
             
             {memory?.relationships?.length > 0 && (
               <section className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-black/20">Emotional Dynamics</h3>
                    <Users size={12} className="text-black/10" />
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                     {memory.relationships.map((rel: any) => (
                        <div key={rel.id} className="px-4 py-3 rounded-lg border border-red-50 bg-white hover:border-red-500/40 transition-all flex items-center justify-between cursor-pointer shadow-sm">
                          <span className="text-[9px] font-bold uppercase truncate max-w-[60%]">{rel.characterA} x {rel.characterB}</span>
                          <span className="text-[7px] font-black text-red-500 uppercase">{rel.status}</span>
                        </div>
                     ))}
                  </div>
               </section>
             )}

             <section className="pt-6 border-t border-gray-100 space-y-4">
                <button 
                  onClick={() => {
                    const name = prompt('Character Name:');
                    if (name) cinematicEngine.saveCharacter({ name, projectId: activeProject?.id });
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-[#FF5733] hover:border-[#FF5733]/40 transition-all"
                >
                  <Plus size={12} /> Add to Character Memory
                </button>
                <button 
                  onClick={() => {
                    const name = prompt('Environment Name:');
                    if (name) cinematicEngine.saveEnvironment({ name, projectId: activeProject?.id });
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 text-[9px] font-black uppercase tracking-widest text-black/30 hover:text-[#FF5733] hover:border-[#FF5733]/40 transition-all"
                >
                  <Plus size={12} /> Add to World Cache
                </button>
             </section>
           </div>
             </>
           ) : (
            <div className="flex flex-col items-center pt-24 gap-8">
              <Database size={16} className="text-[#FF5733]" />
              <Users size={16} className="text-black/10" />
              <Mountain size={16} className="text-black/10" />
              <Box size={16} className="text-black/10" />
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SeepDirector;
