import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Box, 
  Sparkles, 
  Zap, 
  Shield, 
  Settings, 
  Database, 
  Cpu, 
  Dna, 
  Camera, 
  Copy, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  ChevronRight,
  Package,
  Layers,
  Scale,
  Activity
} from 'lucide-react';
import { generateObject, generateObjectVisualPrompt } from '../services/objectGenService';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp, serverTimestamp } from 'firebase/firestore';

const Objects = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech');
  const [rarity, setRarity] = useState('Common');
  const [material, setMaterial] = useState('Composite Alloy');
  const [origin, setOrigin] = useState('New Tokyo Foundry');
  const [dimensions, setDimensions] = useState('45cm x 22cm x 12cm');
  const [weight, setWeight] = useState('2.4kg');
  const [functionality, setFunctionality] = useState('Standard Unit');
  const [state, setState] = useState('Pristine');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [visualPrompt, setVisualPrompt] = useState<{ visualPrompt: string, worldJSON: string } | null>(null);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Tech');
  const [savedObjects, setSavedObjects] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'objects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedObjects(docs);
    }, (error) => {
      console.error("Firestore error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleAIGenerate = async () => {
    setIsGeneratingProfile(true);
    try {
      const result = await generateObject(aiCustomPrompt);
      setName(result.name);
      setDescription(result.description);
      setCategory(result.category);
      setRarity(result.rarity || 'Common');
      setMaterial(result.material);
      setOrigin(result.origin);
      setDimensions(result.dimensions);
      setWeight(result.weight);
      setFunctionality(result.functionality);
      setState(result.state);
      setActiveTab(result.category);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingProfile(false);
    }
  };

  const handleSyncWorld = async () => {
    setIsSyncing(true);
    try {
      const obj = { name, description, category, rarity, material, origin, dimensions, weight, functionality, state };
      const result = await generateObjectVisualPrompt(obj);
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
    if (!auth.currentUser) return;

    const objData = {
      name,
      description,
      category,
      rarity,
      material,
      origin,
      dimensions,
      weight,
      functionality,
      state,
      visualPrompt: visualPrompt?.visualPrompt || null,
      worldJSON: visualPrompt?.worldJSON || null,
      createdAt: serverTimestamp(),
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, 'objects'), objData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'objects');
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
              <Box size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-black uppercase">Prop Engine</h1>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Active Node: v4.28</span>
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
                    placeholder="Describe your object (e.g. 'A rusted cybernetic arm overflowing with bioluminescent plants')..."
                    className="w-full bg-[#FAFAFA] border border-gray-50 rounded-2xl p-6 text-sm font-medium focus:border-emerald-600/40 focus:bg-white transition-all outline-none min-h-[120px] resize-none shadow-inner placeholder:text-black/20"
                  />
                  <div className="absolute -top-3 left-6 flex items-center gap-2">
                    <div className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest shadow-lg">Concept Seed</div>
                    <button 
                       onClick={() => setAiCustomPrompt(`CRAFTING PARAMETERS:
- Handcrafted miniature aesthetic
- Weathered materials (brass, leather, glass)
- Internal mechanisms visible
- Emissive core lighting`)}
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
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/80">Entity Schema</h3>
              </div>
              <div className="space-y-6">
                <InputGroup label="Identity" value={name} onChange={setName} placeholder="Object Designation" />
                <SelectGroup label="Category" options={['Weapon', 'Tech', 'Artifact', 'Tool', 'Vehicle', 'Decor']} value={category} onChange={setCategory} />
                <SelectGroup label="Rarity" options={['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Exotic']} value={rarity} onChange={setRarity} />
                <SelectGroup label="Surface Material" options={['Composite Alloy', 'Natural Timber', 'Obsidian Glass', 'Biomatter', 'Worn Leather']} value={material} onChange={setMaterial} />
                <InputGroup label="Origin" value={origin} onChange={setOrigin} placeholder="Manufacturing Location" />
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Dimensions" value={dimensions} onChange={setDimensions} placeholder="Size" />
                  <InputGroup label="Mass" value={weight} onChange={setWeight} placeholder="Weight" />
                </div>
                <InputGroup label="Primary Logic" value={functionality} onChange={setFunctionality} placeholder="Object Usage" />
                <SelectGroup label="Current Integrity" options={['Pristine', 'Weathered', 'Ancient', 'Damaged', 'Corrupted']} value={state} onChange={setState} />
              </div>
            </section>

            <button 
              onClick={handleSave}
              className="w-full border-2 border-black/5 text-black/30 rounded-2xl py-4 font-black uppercase tracking-[0.2em] text-[10px] hover:border-black hover:text-black transition-all"
            >
              Commit to Archive
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-8 bg-[#F5F5F5] h-screen overflow-y-auto custom-scrollbar p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              {['Weapon', 'Tech', 'Artifact', 'Tool', 'Vehicle', 'Decor'].map((tab) => (
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
              disabled={isSyncing || !name}
              className="bg-black text-white px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-600 disabled:bg-gray-200 transition-all active:scale-95 shadow-2xl"
            >
              {isSyncing ? <RotateCcw size={14} className="animate-spin" /> : <Camera size={14} />}
              Render Cinematic Draft
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 h-full">
            <div className="xl:col-span-7 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-black/5 border border-white">
                <header className="flex justify-between items-start mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">{rarity}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1 rounded-full">{state}</span>
                    </div>
                    <h2 className="text-4xl font-black text-black tracking-tight leading-none mb-4">{name || 'Object.Null'}</h2>
                    <p className="text-sm font-medium text-black/50 leading-relaxed max-w-sm">{description || 'Initial schema pending. Start the Neural Architect to generate object profiles.'}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-black/20 mb-1">Authentic ID</span>
                    <span className="text-[10px] font-mono font-bold text-black/40">#PX-992-K</span>
                  </div>
                </header>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Surface', val: material, icon: Layers },
                    { label: 'Origin', val: origin, icon: Database },
                    { label: 'Form Factor', val: dimensions, icon: Package },
                    { label: 'Mass', val: weight, icon: Scale },
                    { label: 'Class', val: category, icon: Box },
                    { label: 'Function', val: functionality, icon: Activity },
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
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Prop Visual Specification</span>
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
                      <span className="text-[8px] font-bold text-black/20 uppercase tracking-widest px-2">Engine JSON (Physical Interaction Data)</span>
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
                    <Camera size={32} className="text-black/10 mb-4" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-black/20">Render Preview Pending</h4>
                    <p className="text-[10px] font-medium text-black/20 max-w-[200px] mt-2">Initialize cinematic draft to view technical specs and materials.</p>
                </div>
              )}
            </div>

            <div className="xl:col-span-5 h-full">
              <section className="bg-white rounded-[2.5rem] p-8 border border-gray-100 h-full overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-black/20" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-black">Object Archive</h3>
                  </div>
                  <span className="text-[10px] font-bold text-black/40">{savedObjects.length} Entities</span>
                </div>

                <div className="space-y-4">
                  {savedObjects.filter(obj => obj.category === activeTab).length > 0 ? (
                    savedObjects.filter(obj => obj.category === activeTab).map((obj) => (
                      <div key={obj.id} className="group cursor-pointer">
                        <div className="bg-[#FAFAFA] border border-gray-50 rounded-2xl p-5 hover:bg-black hover:text-white transition-all duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-black uppercase tracking-tight group-hover:text-white">{obj.name}</h4>
                            <span className="text-[8px] font-bold opacity-30 group-hover:opacity-60">{obj.rarity}</span>
                          </div>
                          <p className="text-[10px] opacity-40 leading-relaxed mb-4 line-clamp-2 font-medium group-hover:opacity-70">{obj.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-black/5 group-hover:border-white/10">
                            <div className="flex items-center gap-2">
                               <Package size={10} className="opacity-20 group-hover:opacity-60" />
                               <span className="text-[9px] font-bold opacity-30 group-hover:opacity-60 uppercase">{obj.material}</span>
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

export default Objects;
