import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mountain, 
  Sun, 
  CloudRain, 
  Wind, 
  Sparkles,
  Search,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Loader2,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Settings,
  RotateCcw,
  Scale,
  Activity,
  Database
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, limit, where, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { generateEnvironment, generateEnvironmentVisualPrompt } from '../services/worldGenService';

const Environments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [description, setDescription] = useState('');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [scale, setScale] = useState('1:1 Human');
  const [category, setCategory] = useState('Exterior');
  const [tone, setTone] = useState('Cinematic');
  const [timeOfDay, setTimeOfDay] = useState('Sunset');
  const [mood, setMood] = useState('Epic');
  const [gravity, setGravity] = useState('Normal');
  const [behavior, setBehavior] = useState('Dynamic');
  const [motionEffects, setMotionEffects] = useState('');
  const [lighting, setLighting] = useState('Dramatic');
  const [atmospheres, setAtmospheres] = useState<string[]>(['Rain']);
  
  const [visualPrompt, setVisualPrompt] = useState<{ visualPrompt: string, worldJSON: string } | null>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Exterior');
  const [environments, setEnvironments] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state?.prefill?.description) {
      setDescription(location.state.prefill.description);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'environments'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEnvironments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'environments');
    });
    return unsubscribe;
  }, [user]);

  const handleAIGenerate = async () => {
    setIsGeneratingProfile(true);
    try {
      const prompt = aiCustomPrompt || description;
      const result = await generateEnvironment(prompt);
      setDescription(result.description);
      setScale(result.scale || '1:1 Human');
      setCategory(result.category || 'Exterior');
      setTone(result.tone || 'Cinematic');
      setTimeOfDay(result.timeOfDay || 'Sunset');
      setMood(result.mood || 'Epic');
      setGravity(result.gravity || 'Normal');
      setBehavior(result.behavior || 'Dynamic');
      setMotionEffects(result.motionEffects || '');
      setLighting(result.lighting || 'Dramatic');
      setAtmospheres(result.atmospheres || []);
      setActiveTab(result.category || 'Exterior');
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleSyncWorld = async () => {
    setIsSyncing(true);
    try {
      const envData = { description, category, scale, tone, timeOfDay, mood, gravity, behavior, motionEffects, lighting, atmospheres };
      const result = await generateEnvironmentVisualPrompt(envData);
      setVisualPrompt(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopying(type);
    setTimeout(() => setCopying(null), 2000);
  };

  const handleSave = async () => {
    if (!user || !description) return;
    setIsSaving(true);
    try {
      const payload = {
        description,
        category,
        tone,
        timeOfDay,
        mood,
        gravity,
        behavior,
        motionEffects,
        lighting,
        atmospheres,
        scale,
        visualPrompt: visualPrompt?.visualPrompt || null,
        worldJSON: visualPrompt?.worldJSON || null,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'environments'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'environments');
    } finally {
      setIsSaving(false);
    }
  };

  const InputGroup = ({ label, value, onChange, placeholder }: any) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-emerald-600/40 focus:bg-white transition-all outline-none"
      />
    </div>
  );

  const SelectGroup = ({ label, options, value, onChange }: any) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-emerald-600/40 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
      >
        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Control Panel */}
        <div className="lg:col-span-4 border-r border-gray-100 h-screen overflow-y-auto custom-scrollbar p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-black text-white p-2.5 rounded-2xl shadow-xl rotate-3">
              <Mountain size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-black uppercase">World Engine</h1>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Active Node: v8.12</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                  <Sparkles size={14} className="text-black/60" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">Neural Architect</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <textarea 
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Describe your world vision (e.g. 'A futuristic Tokyo submerged in glowing turquoise water')..."
                    className="w-full bg-[#FAFAFA] border border-gray-50 rounded-2xl p-6 text-sm font-medium focus:border-emerald-600/40 focus:bg-white transition-all outline-none min-h-[120px] resize-none shadow-inner placeholder:text-black/20"
                  />
                  <div className="absolute -top-3 left-6 flex items-center gap-2">
                    <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">Environment Seed</div>
                    <button 
                       onClick={() => setAiCustomPrompt(`SCALE & MATERIAL REALISM:
- Miniature / Macro scale 
- Traditional Japanese wooden houses
- Handcrafted model-making quality
LIGHTING:
- Warm lantern glow, moonlit shadows, volumetric fog`)}
                       className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all"
                    >
                      Load Template
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleAIGenerate}
                  disabled={isGeneratingProfile}
                  className="w-full bg-black text-white rounded-2xl py-5 px-6 font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all group active:scale-95 disabled:bg-gray-200"
                >
                  {isGeneratingProfile ? (
                    <RotateCcw className="animate-spin text-white/50" />
                  ) : (
                    <>
                      <Zap size={18} className="text-emerald-400 group-hover:text-white" />
                      <span className="uppercase tracking-widest text-xs">Initialize Generation</span>
                    </>
                  )}
                </button>
              </div>
            </section>

            <section className="space-y-6 bg-[#FAFAFA] rounded-3xl p-8 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Settings size={14} className="text-black/60" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">World Schema</h3>
              </div>
              <div className="space-y-6">
                <InputGroup label="Identity" value={description} onChange={setDescription} placeholder="Environment Designation" />
                <SelectGroup label="Category" options={['Interior', 'Exterior', 'Urban', 'Nature', 'Sci-Fi', 'Fantasy', 'Custom']} value={category} onChange={setCategory} />
                <SelectGroup label="Visual Tone" options={['Cinematic', 'Realistic', 'Anime', 'Surreal', 'Stylized']} value={tone} onChange={setTone} />
                <div className="grid grid-cols-2 gap-4">
                  <SelectGroup label="Time of Day" options={['Morning', 'Noon', 'Sunset', 'Night', 'Timeless']} value={timeOfDay} onChange={setTimeOfDay} />
                  <SelectGroup label="Atmospheric Mood" options={['Calm', 'Dark', 'Intense', 'Dreamlike', 'Epic']} value={mood} onChange={setMood} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SelectGroup label="Scale Factor" options={['1:1 Human', 'Miniature/Macro', 'Galactic', 'Isometric']} value={scale} onChange={setScale} />
                  <SelectGroup label="Gravity" options={['Normal', 'Low', 'Zero', 'Custom']} value={gravity} onChange={setGravity} />
                </div>
                <SelectGroup label="Lighting Strategy" options={['Dramatic', 'Soft', 'Neon', 'High Contrast', 'Volumetric', 'Natural']} value={lighting} onChange={setLighting} />
                <InputGroup label="Motion Effects" value={motionEffects} onChange={setMotionEffects} placeholder="e.g. Heat haze, falling leaves" />
              </div>
            </section>

            <button 
              onClick={handleSave}
              className="w-full border-2 border-black/5 text-black/30 rounded-2xl py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:border-black hover:text-black transition-all"
            >
              Commit to Library
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-8 bg-[#F5F5F5] h-screen overflow-y-auto custom-scrollbar p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              {['Interior', 'Exterior', 'Urban', 'Nature', 'Sci-Fi', 'Fantasy'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative ${activeTab === tab ? 'text-emerald-600' : 'text-black/20 hover:text-black/40'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleSyncWorld}
              disabled={isSyncing || !description}
              className="bg-black text-white px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 disabled:bg-gray-200 transition-all active:scale-95 shadow-2xl"
            >
              {isSyncing ? <RotateCcw size={14} className="animate-spin" /> : <Sun size={14} />}
              Render Cinematic Draft
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
            <div className="xl:col-span-7 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white">
                <header className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">{tone}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">{timeOfDay}</span>
                    </div>
                    <h2 className="text-4xl font-black text-black tracking-tight leading-none mb-4">{description || 'Environment.Null'}</h2>
                    <p className="text-sm font-medium text-black/50 leading-relaxed max-w-sm">{description ? `A cinematic ${category.toLowerCase()} environment set during ${timeOfDay.toLowerCase()} with a ${mood.toLowerCase()} atmosphere.` : 'Initial schema pending. Start the Neural Architect to generate world profiles.'}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-black/20 mb-1">Authentic ID</span>
                    <span className="text-[10px] font-mono font-bold text-black/40">#ENV-{Math.floor(Math.random() * 999)}-Z</span>
                  </div>
                </header>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Lighting', val: lighting, icon: Sun },
                    { label: 'Scale', val: scale, icon: Scale },
                    { label: 'Gravity', val: gravity, icon: Wind },
                    { label: 'Mood', val: mood, icon: Sparkles },
                    { label: 'Category', val: category, icon: Mountain },
                    { label: 'Behavior', val: behavior, icon: Activity },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#FAFAFA] border border-gray-50 rounded-3xl p-5 flex items-start gap-4 hover:shadow-lg transition-all hover:bg-white group">
                      <div className="bg-white p-2 rounded-xl shadow-sm group-hover:bg-emerald-50 transition-all">
                        <item.icon size={16} className="text-black/40 group-hover:text-emerald-600" />
                      </div>
                      <div>
                        <span className="block text-[8px] font-black uppercase tracking-widest text-black/30 mb-1">{item.label}</span>
                        <span className="text-[11px] font-bold text-black/80">{item.val || '---'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {visualPrompt ? (
                <div className="space-y-12 pb-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">World Visual Specification</span>
                      <button onClick={() => copyToClipboard(visualPrompt.visualPrompt, 'prompt')} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-emerald-600 transition-all flex items-center gap-2">
                        {copying === 'prompt' ? <CheckCircle2 size={12} /> : null}
                        {copying === 'prompt' ? 'Copied' : 'Copy Prompt'}
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {visualPrompt.visualPrompt.split(/\n(?=[A-Z\s\d—]+\:)/).filter(Boolean).map((section, idx) => {
                         const splitAt = section.indexOf(':');
                         if (splitAt === -1) return null;
                         const title = section.substring(0, splitAt);
                         const content = section.substring(splitAt + 1);
                         return (
                           <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                             <h5 className="text-[9px] font-bold uppercase tracking-tighter text-emerald-600 mb-3 border-b border-emerald-50 pb-2">{title}</h5>
                             <p className="text-[11px] text-black/60 leading-relaxed font-medium whitespace-pre-wrap">
                               {content.trim()}
                             </p>
                           </div>
                         )
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-2 bg-black/5 rounded-xl">
                      <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest px-2">Engine JSON (Environmental Setup)</span>
                      <button onClick={() => copyToClipboard(visualPrompt.worldJSON, 'json')} className="bg-white px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest text-black/60 shadow-sm hover:bg-black hover:text-white transition-all">
                        {copying === 'json' ? 'Data Cached' : 'Copy Engine JSON'}
                      </button>
                    </div>
                    <div className="bg-black text-emerald-400 rounded-2xl p-6 overflow-hidden">
                      <pre className="text-[9px] font-mono opacity-80 overflow-x-auto whitespace-pre h-32 custom-scrollbar">
                        {visualPrompt.worldJSON}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-[2.5rem] bg-white/50 border-2 border-dashed border-black/5 flex flex-col items-center justify-center text-center p-12">
                    <Search size={32} className="text-black/10 mb-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20">Render Preview Pending</h4>
                    <p className="text-[10px] font-medium text-black/20 max-w-[200px] mt-2">Initialize cinematic draft to view environmental specs and climate data.</p>
                </div>
              )}
            </div>

            <div className="xl:col-span-5 h-full">
              <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-black/20" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-black">World Archive</h3>
                  </div>
                  <span className="text-[10px] font-bold text-black/40">{environments.length} Entities</span>
                </div>

                <div className="space-y-4">
                  {environments.filter(env => env.category === activeTab).length > 0 ? (
                    environments.filter(env => env.category === activeTab).map((env) => (
                      <div key={env.id} className="group cursor-pointer">
                        <div className="bg-[#FAFAFA] border border-gray-50 rounded-2xl p-5 hover:bg-black hover:text-white transition-all duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-white line-clamp-1">{env.description}</h4>
                            <span className="text-[8px] font-bold opacity-30 group-hover:opacity-60">{env.tone}</span>
                          </div>
                          <p className="text-[10px] opacity-40 leading-relaxed mb-4 line-clamp-2 font-medium group-hover:opacity-70">{env.mood} • {env.timeOfDay}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-black/5 group-hover:border-white/10">
                            <div className="flex items-center gap-2">
                               <CloudRain size={10} className="opacity-20 group-hover:opacity-60" />
                               <span className="text-[9px] font-bold opacity-30 group-hover:opacity-60 uppercase">{env.lighting}</span>
                            </div>
                            <ChevronRight size={14} className="opacity-10 group-hover:opacity-40" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-[10px] font-bold text-black/20 uppercase tracking-widest">No Records Found</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Environments;

