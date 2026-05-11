import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  Wind,
  Loader2,
  Plus,
  Trash2,
  RotateCcw,
  User,
  Search,
  Edit2,
  Copy,
  Check,
  FileJson,
  Settings,
  Scale,
  Activity,
  Database,
  Zap,
  CheckCircle2,
  Sun,
  Dna,
  Palette
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { generateCharacter, generateCharacterVisualPrompt } from '../services/characterGenService';

const Characters = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Human');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  const [visualPrompt, setVisualPrompt] = useState<{ visualPrompt: string, characterJSON: string } | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('Human');
  const [archetype, setArchetype] = useState('');
  const [motivation, setMotivation] = useState('');
  const [details, setDetails] = useState('');
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [skinTone, setSkinTone] = useState('Fair');
  const [features, setFeatures] = useState('');
  const [faceShape, setFaceShape] = useState('Oval');
  const [jawline, setJawline] = useState('Sharp');
  const [nose, setNose] = useState('Straight');
  const [eyeColor, setEyeColor] = useState('Blue');
  const [hairStyle, setHairStyle] = useState('Short Cropped');
  const [hairColor, setHairColor] = useState('Black');
  const [attire, setAttire] = useState('');
  const [materials, setMaterials] = useState('');
  const [role, setRole] = useState('Hero');
  const [personality, setPersonality] = useState('');

  useEffect(() => {
    if (location.state?.prefill) {
      const pre = location.state.prefill;
      setName(pre.name || '');
      setDetails(pre.details || pre.description || '');
      if (pre.type) setType(pre.type);
    }
  }, [location.state]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'characters'), where('createdBy', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCharacters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'characters');
    });
    return unsubscribe;
  }, [user]);

  const handleAIGenerate = async () => {
    setIsGeneratingProfile(true);
    try {
      const prompt = aiCustomPrompt || name || archetype || motivation || details;
      const result = await generateCharacter(prompt, type);
      
      setName(result.name || '');
      setType(result.type || type);
      setArchetype(result.archetype || '');
      setMotivation(result.motivation || '');
      setHeight(result.physical?.height || 175);
      setAge(result.physical?.age || 25);
      setSkinTone(result.physical?.skinTone || 'Fair');
      setFeatures(result.physical?.features || '');
      setFaceShape(result.facial?.shape || 'Oval');
      setJawline(result.facial?.jawline || 'Sharp');
      setNose(result.facial?.nose || 'Straight');
      setEyeColor(result.eyesHair?.eyeColor || 'Blue');
      setHairColor(result.eyesHair?.hairColor || 'Black');
      setHairStyle(result.eyesHair?.hairStyle || 'Short');
      setAttire(result.style?.attire || '');
      setMaterials(result.style?.materials || '');
      setRole(result.behavior?.role || 'Hero');
      setPersonality(result.behavior?.personality || '');
      
      setActiveTab(result.type || type);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleSyncCharacter = async () => {
    setIsSyncing(true);
    try {
      const charData = {
        name, type, archetype, motivation, details,
        physical: { height, age, skinTone, features },
        facial: { shape: faceShape, jawline, nose },
        eyesHair: { eyeColor, hairStyle, hairColor },
        style: { attire, materials },
        behavior: { role, personality }
      };
      const result = await generateCharacterVisualPrompt(charData);
      setVisualPrompt(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !name) return;
    setIsSaving(true);
    try {
      const payload = {
        name, type, archetype, motivation, details,
        physical: { height, age, skinTone, features },
        facial: { shape: faceShape, jawline, nose },
        eyesHair: { eyeColor, hairStyle, hairColor },
        style: { attire, materials },
        behavior: { role, personality },
        visualPrompt: visualPrompt?.visualPrompt || null,
        characterJSON: visualPrompt?.characterJSON || null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        img: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
      };
      await addDoc(collection(db, 'characters'), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'characters');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopying(type);
    setTimeout(() => setCopying(null), 2000);
  };

  const copyPosePrompt = (pose: string) => {
    if (!visualPrompt) return;
    const posePrompts: Record<string, string> = {
      'Front': 'Full body front view posing, symmetric pose, standing straight, character facing the camera, clear view of facial features and outfit details.',
      'Back': 'Full body back view posing, character facing away from the camera, showing back details of clothing, accessories and hair.',
      'Right': 'Full body right side profile view posing, character looking towards the right side of the frame.',
      'Left': 'Full body left side profile view posing, character looking towards the left side of the frame.'
    };
    const fullPrompt = `${visualPrompt.visualPrompt}\n\nPOSE & ORIENTATION: ${posePrompts[pose]}`;
    copyToClipboard(fullPrompt, `pose-${pose}`);
  };

  const InputGroup = ({ label, value, onChange, placeholder }: any) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">{label}</label>
      <input 
        type="text" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-[#FF5733]/40 focus:bg-white transition-all outline-none"
      />
    </div>
  );

  const SelectGroup = ({ label, options, value, onChange }: any) => (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-black/40 px-1">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold focus:border-[#FF5733]/40 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
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
            <div className="bg-black text-white p-2.5 rounded-2xl shadow-xl -rotate-3">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-black uppercase">Character Engine</h1>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF5733]">Neural Casting: Active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733] animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                  <Sparkles size={14} className="text-black/60" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">Neural Sculptor</h3>
              </div>
              
              <div className="space-y-6">
                <div className="relative">
                  <textarea 
                    value={aiCustomPrompt}
                    onChange={(e) => setAiCustomPrompt(e.target.value)}
                    placeholder="Describe your character (e.g. 'A stoic futuristic detective in a heavy leather coat')..."
                    className="w-full bg-[#FAFAFA] border border-gray-50 rounded-2xl p-6 text-sm font-medium focus:border-[#FF5733]/40 focus:bg-white transition-all outline-none min-h-[120px] resize-none shadow-inner placeholder:text-black/20"
                  />
                  <div className="absolute -top-3 left-6 flex items-center gap-2">
                    <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">Character Seed</div>
                    <button 
                       onClick={() => setAiCustomPrompt(`BIOLOGICAL TRAITS:
- Ancient cybernetic organism
- Weathered bronze-like skin
- Glowing optics and internal circuitry
- Tall, gaunt frame with elegant posture`)}
                        className="bg-[#FF5733] text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all"
                    >
                      Load Template
                    </button>
                  </div>
                </div>
                <button 
                  onClick={handleAIGenerate}
                  disabled={isGeneratingProfile}
                  className="w-full bg-black text-white rounded-2xl py-5 px-6 font-bold flex items-center justify-center gap-3 hover:bg-[#FF5733] transition-all group active:scale-95 disabled:bg-gray-200"
                >
                  {isGeneratingProfile ? (
                    <RotateCcw className="animate-spin text-white/50" />
                  ) : (
                    <>
                      <Zap size={18} className="text-[#FF5733] group-hover:text-white" />
                      <span className="uppercase tracking-widest text-xs">Initialize Casting</span>
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
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">Entity Schema</h3>
              </div>
              <div className="space-y-6">
                <InputGroup label="Name" value={name} onChange={setName} placeholder="Entity Designation" />
                <InputGroup label="Archetype" value={archetype} onChange={setArchetype} placeholder="e.g. The Outcast" />
                <SelectGroup label="Species Class" options={['Human', 'Alien', 'Animal', 'Android', 'Custom']} value={type} onChange={setType} />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Age" value={age.toString()} onChange={(v: string) => setAge(parseInt(v) || 0)} placeholder="Cycles" />
                  <InputGroup label="Height (cm)" value={height.toString()} onChange={(v: string) => setHeight(parseInt(v) || 0)} placeholder="Units" />
                </div>
                <InputGroup label="Skin / Surface" value={skinTone} onChange={setSkinTone} placeholder="Texture/Tone" />
                <SelectGroup label="Identity Role" options={['Hero', 'Antagonist', 'Mentor', 'Specialist', 'Ambiguous']} value={role} onChange={setRole} />
                <div className="grid grid-cols-2 gap-4">
                  <SelectGroup label="Cranial Shape" options={['Oval', 'Angular', 'Crested', 'Square', 'Heart']} value={faceShape} onChange={setFaceShape} />
                  <SelectGroup label="Jaw Architecture" options={['Sharp', 'Receding', 'Soft', 'Mechanical']} value={jawline} onChange={setJawline} />
                </div>
              </div>
            </section>

            <button 
              onClick={handleSave}
              className="w-full border-2 border-black/5 text-black/30 rounded-2xl py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:border-[#FF5733] hover:text-[#FF5733] transition-all"
            >
              Commit to Roster
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-8 bg-[#F5F5F5] h-screen overflow-y-auto custom-scrollbar p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              {['Human', 'Alien', 'Animal', 'Android', 'Custom'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[9px] font-black uppercase tracking-[0.2em] pb-2 transition-all relative ${activeTab === tab ? 'text-[#FF5733]' : 'text-black/20 hover:text-black/40'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="tab-underline-char" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF5733] rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleSyncCharacter}
              disabled={isSyncing || !name}
              className="bg-black text-white px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-[#FF5733] disabled:bg-gray-200 transition-all active:scale-95 shadow-2xl"
            >
              {isSyncing ? <RotateCcw size={14} className="animate-spin" /> : <Dna size={14} />}
              Synthesize Visual Draft
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
            <div className="xl:col-span-7 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white">
                <header className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-[#FAFAFA] overflow-hidden border border-gray-100 shadow-inner group">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'default'}`} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="Avatar" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest bg-[#FFF4F0] text-[#FF5733] px-3 py-1 rounded-full border border-[#FFE0D1]">{role}</span>
                         <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">{type}</span>
                      </div>
                      <h2 className="text-4xl font-black text-black tracking-tight leading-none mb-4">{name || 'Entity.Null'}</h2>
                      <p className="text-sm font-medium text-black/50 leading-relaxed max-w-sm">{archetype ? `A ${archetype.toLowerCase()} possessing ${personality?.toLowerCase() || 'unique behavioral patterns'}.` : 'Initial casting pending. Start the Neural Sculptor to define character essence.'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-black/20 mb-1">Casting ID</span>
                    <span className="text-[10px] font-mono font-bold text-black/40">#CHAR-{Math.floor(Math.random() * 999)}-X</span>
                  </div>
                </header>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Surface', val: skinTone, icon: Palette },
                    { label: 'Height', val: `${height}cm`, icon: Scale },
                    { label: 'Age', val: `${age} Cycles`, icon: Activity },
                    { label: 'Anatomy', val: faceShape, icon: User },
                    { label: 'Eye Color', val: eyeColor, icon: Sparkles },
                    { label: 'Archetype', val: archetype, icon: Users },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-[#FAFAFA] border border-gray-50 rounded-3xl p-5 flex items-start gap-4 hover:shadow-lg transition-all hover:bg-white group">
                      <div className="bg-white p-2 rounded-xl shadow-sm group-hover:bg-[#FFF4F0] transition-all">
                        <item.icon size={16} className="text-black/40 group-hover:text-[#FF5733]" />
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
                      <span className="text-[10px] font-bold text-[#FF5733] uppercase tracking-widest bg-[#FFF4F0] px-3 py-1 rounded-full border border-[#FFE0D1]">Character Visual Specification</span>
                      <button onClick={() => copyToClipboard(visualPrompt.visualPrompt, 'prompt')} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-[#FF5733] transition-all flex items-center gap-2">
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
                             <h5 className="text-[9px] font-bold uppercase tracking-tighter text-[#FF5733] mb-3 border-b border-[#FFE0D1] pb-2">{title}</h5>
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
                      <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest px-2">Entity JSON (Character Data)</span>
                      <button onClick={() => copyToClipboard(visualPrompt.characterJSON, 'json')} className="bg-white px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest text-black/60 shadow-sm hover:bg-black hover:text-white transition-all">
                        {copying === 'json' ? 'Data Cached' : 'Copy Entity JSON'}
                      </button>
                    </div>
                    <div className="bg-black text-[#FF5733] rounded-2xl p-6 overflow-hidden">
                      <pre className="text-[9px] font-mono opacity-80 overflow-x-auto whitespace-pre h-32 custom-scrollbar">
                        {visualPrompt.characterJSON}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 rounded-[2.5rem] bg-white/50 border-2 border-dashed border-black/5 flex flex-col items-center justify-center text-center p-12">
                    <Search size={32} className="text-black/10 mb-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20">Synthesis Pending</h4>
                    <p className="text-[10px] font-medium text-black/20 max-w-[200px] mt-2">Synthesize visual draft to view character specs and biological data.</p>
                </div>
              )}
            </div>

            <div className="xl:col-span-5 h-full flex flex-col gap-8">
              {visualPrompt && (
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm shrink-0">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={16} className="text-[#FF5733]" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-black">Pose Calibration Studio</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Front', 'Back', 'Right', 'Left'].map(pose => (
                      <button
                        key={pose}
                        onClick={() => copyPosePrompt(pose)}
                        className={`py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                          copying === `pose-${pose}` 
                            ? 'bg-black text-white border-black' 
                            : 'bg-[#FAFAFA] border-gray-100 text-black/60 hover:border-[#FF5733] hover:text-[#FF5733]'
                        }`}
                      >
                        {copying === `pose-${pose}` ? <Check size={12} /> : null}
                        {pose} View
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-[9px] font-medium text-black/30 text-center uppercase tracking-wider">Generates view-specific visual prompt</p>
                </div>
              )}

              <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-black/20" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-black">Active Roster</h3>
                  </div>
                  <span className="text-[10px] font-bold text-black/40">{characters.length} Entities</span>
                </div>

                <div className="space-y-4">
                  {characters.filter(char => char.type === activeTab).length > 0 ? (
                    characters.filter(char => char.type === activeTab).map((char) => (
                      <div key={char.id} className="group cursor-pointer">
                        <div 
                          className="bg-[#FAFAFA] border border-gray-50 rounded-2xl p-5 hover:bg-black hover:text-white transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-white line-clamp-1">{char.name}</h4>
                            <span className="text-[8px] font-bold opacity-30 group-hover:opacity-60">{char.archetype}</span>
                          </div>
                          <p className="text-[10px] opacity-40 leading-relaxed mb-4 line-clamp-2 font-medium group-hover:opacity-70">{char.personality || 'Standard behavioral profile.'}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-black/5 group-hover:border-white/10">
                            <div className="flex items-center gap-2">
                               <Dna size={10} className="opacity-20 group-hover:opacity-60" />
                               <span className="text-[9px] font-bold opacity-30 group-hover:opacity-60 uppercase">{char.role}</span>
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

export default Characters;
