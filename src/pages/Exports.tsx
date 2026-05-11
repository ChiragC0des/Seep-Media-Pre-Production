import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Download, 
  FileJson, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Database
} from 'lucide-react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function Exports() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'workflows'), where('userId', '==', user.uid), orderBy('updatedAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorkflows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'workflows');
    });
    return unsubscribe;
  }, [user]);

  const activeWorkflow = workflows[0];
  const scenes = activeWorkflow?.scenes || [];

  return (
    <div className="p-16 max-w-5xl mx-auto space-y-16">
      <header className="space-y-4 text-center">
         <div className="inline-flex items-center gap-3 text-[#FF5733] bg-[#FF5733]/5 px-4 py-2 rounded-full border border-[#FF5733]/10">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Production Finalized</span>
         </div>
         <h1 className="font-display text-6xl font-medium tracking-tight text-black">Structured Output</h1>
         <p className="text-black/40 text-lg font-light max-w-2xl mx-auto">Your cinematic assets are compiled and ready for external generation tools.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 shadow-sm">
            <div className="flex justify-between items-center">
               <h3 className="font-display text-2xl font-medium text-black">Export Bundle</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-black/10" /></div>
            ) : scenes.length > 0 ? (
              <div className="space-y-4">
                {scenes.map((scene: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#FF5733] shadow-sm">
                        <FileJson size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-black uppercase tracking-tight">{scene.title}</p>
                        <p className="text-[10px] text-black/20 uppercase font-mono">{scene.dur} • JSON</p>
                      </div>
                    </div>
                    <Download size={14} className="text-black/10 group-hover:text-black transition-colors" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-[32px] p-20 text-center space-y-4">
                <div className="w-12 h-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                  <Download className="text-black/10" size={24} />
                </div>
                <p className="text-xs text-black/20 italic">No assets ready for export. Complete a production flow in the Seep Director.</p>
              </div>
            )}
         </div>

         <div className="bg-white border border-gray-100 rounded-[40px] p-10 space-y-8 flex flex-col shadow-sm">
            <h3 className="font-display text-2xl font-medium text-black">Direct Injections</h3>
            <p className="text-black/40 text-sm font-light">Copy raw prompt strings formatted specifically for Hexfield and other major generation pipelines.</p>
            
            <div className="flex-1 space-y-4">
                <ExportAction label="Hexfield V2 Structure" icon={<ExternalLink size={16} />} />
                <ExportAction label="Midjourney Style Matrix" icon={<ExternalLink size={16} />} />
                <ExportAction label="Stable Video Sequence" icon={<ExternalLink size={16} />} />
            </div>

            {scenes.length > 0 && (
              <div className="bg-gray-100 rounded-3xl p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF5733]">Active Scene Prompt Block</span>
                      <button className="text-black/20 hover:text-black"><Copy size={14}/></button>
                  </div>
                  <div className="font-mono text-[10px] text-black/40 break-all leading-loose">
                      /generate --workflow {activeWorkflow.id} --scene {scenes[0].number} --char {activeWorkflow.selectedCharacter || 'none'} --env {activeWorkflow.selectedEnvironment || 'default'}
                  </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function ExportAction({ label, icon }: { label: string, icon: any }) {
    return (
        <button className="w-full flex items-center justify-between p-6 border border-gray-100 bg-white shadow-sm rounded-2xl hover:border-[#FF5733]/40 hover:bg-gray-50 transition-all group">
            <span className="text-sm font-medium tracking-tight text-black/80 group-hover:text-black">{label}</span>
            <div className="text-black/20 group-hover:text-[#FF5733] transition-colors">{icon}</div>
        </button>
    );
}
