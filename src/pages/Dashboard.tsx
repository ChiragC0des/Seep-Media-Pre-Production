import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  Users, 
  Mountain, 
  Box, 
  Zap, 
  Play, 
  Search,
  Database,
  ArrowUpRight,
  TrendingUp,
  Loader2,
  Trash2,
  Bot
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [counts, setCounts] = useState({ characters: 0, environments: 0, objects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch Workflows
    const workflowsQuery = query(
      collection(db, 'workflows'),
      where('userId', '==', user.uid),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );

    const unsubscribeWorkflows = onSnapshot(workflowsQuery, (snapshot) => {
      setWorkflows(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'workflows');
    });

    // Fetch Counts
    const fetchCounts = () => {
      // Characters use 'createdBy'
      const charQuery = query(collection(db, 'characters'), where('createdBy', '==', user.uid));
      onSnapshot(charQuery, (snapshot) => {
        setCounts(prev => ({ ...prev, characters: snapshot.size }));
      });

      // Environments use 'userId'
      const envQuery = query(collection(db, 'environments'), where('userId', '==', user.uid));
      onSnapshot(envQuery, (snapshot) => {
        setCounts(prev => ({ ...prev, environments: snapshot.size }));
      });

      // Objects use 'userId'
      const objQuery = query(collection(db, 'objects'), where('userId', '==', user.uid));
      onSnapshot(objQuery, (snapshot) => {
        setCounts(prev => ({ ...prev, objects: snapshot.size }));
      });
    };

    fetchCounts();
    return () => unsubscribeWorkflows();
  }, [user]);

  const handleDeleteWorkflow = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this workflow?')) return;
    try {
      await deleteDoc(doc(db, 'workflows', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'workflows');
    }
  };

  const statCards = [
    { label: "Active Characters", value: counts.characters, icon: <Users size={20} />, color: "text-blue-600", bg: "bg-blue-50", link: "/characters" },
    { label: "Scene Environments", value: counts.environments, icon: <Mountain size={20} />, color: "text-emerald-600", bg: "bg-emerald-50", link: "/environments" },
    { label: "Prop Inventory", value: counts.objects, icon: <Box size={20} />, color: "text-purple-600", bg: "bg-purple-50", link: "/objects" },
  ];

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-black mb-2">
            Welcome back, <span className="text-[#FF5733]">{user?.displayName?.split(' ')[0] || 'Director'}</span>
          </h1>
          <p className="text-black/40 text-lg font-light tracking-wide italic">Your cinematic universe is waiting for its next frame.</p>
        </div>
        <Link 
          to="/studio"
          className="bg-black text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-black/90 transition-all shadow-xl hover:scale-105"
        >
          <Plus size={18} /> New Production
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <Link 
            key={stat.label}
            to={stat.link}
            className="bg-white border border-gray-100 rounded-[32px] p-8 hover:shadow-2xl transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <ArrowUpRight className="text-black/10 group-hover:text-black transition-colors" size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-4xl font-display font-medium text-black">{stat.value}</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/20">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        {/* Recent Pipelines */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">Recent Production Pipelines</h2>
            <Link to="/studio" className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black transition-colors">View All</Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="animate-spin text-black/10" size={32} /></div>
            ) : workflows.length > 0 ? (
              workflows.map((wf, i) => (
                <motion.div 
                  key={wf.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => navigate('/studio')}
                  className="bg-white border border-gray-100 rounded-[32px] p-8 flex items-center justify-between hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-black/10 group-hover:text-[#FF5733] group-hover:bg-[#FF5733]/5 transition-all">
                      <Database size={24}/>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-black mb-1">{wf.projectName}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-black/20">
                        <span className="flex items-center gap-1.5"><Clock size={12}/> {wf.updatedAt ? new Date(wf.updatedAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                        <span className="flex items-center gap-1.5"><Users size={12}/> {wf.scenes?.length || 0} Scenes</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <button onClick={(e) => handleDeleteWorkflow(e, wf.id)} className="p-3 text-black/10 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                     <div className="bg-black text-white p-4 rounded-2xl group-hover:bg-[#FF5733] transition-colors shadow-lg">
                       <Play size={18} fill="currentColor" />
                     </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white border border-dashed border-gray-100 rounded-[32px] p-24 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center">
                  <Database className="text-black/10" size={32} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">No pipelines found</h3>
                <Link to="/studio" className="text-[#FF5733] text-xs font-bold uppercase tracking-widest hover:underline">Create your first</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
           <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/20">Quick Actions</h2>
           <div className="bg-white border border-gray-100 rounded-[32px] overflow-hidden p-8 space-y-6">
               <QuickAction 
                 icon={<Bot className="text-[#FF5733]" size={18} />} 
                 title="AI Director" 
                 desc="Talk to your production's brain"
                 onClick={() => navigate('/studio', { state: { focusDirector: true } })}
               />
               <div className="h-[1px] bg-gray-50"></div>
               <QuickAction 
                 icon={<Sparkles className="text-orange-500" size={18} />} 
                 title="Character AI" 
                 desc="Draft a new character concept"
                 onClick={() => navigate('/characters')}
               />
              <div className="h-[1px] bg-gray-50"></div>
              <QuickAction 
                icon={<Search className="text-blue-500" size={18} />} 
                title="Browse Library" 
                desc="Search through global prompts"
                onClick={() => navigate('/marketplace')}
              />
              <div className="h-[1px] bg-gray-50"></div>
              <QuickAction 
                icon={<TrendingUp className="text-emerald-500" size={18} />} 
                title="Efficiency" 
                desc="Optimize your script flow"
                onClick={() => navigate('/studio')}
              />
           </div>

           <div className="bg-[#FF5733] rounded-[32px] p-8 text-white space-y-4 shadow-2xl relative overflow-hidden group cursor-pointer">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              <div className="flex justify-between items-start">
                 <Zap size={24} />
                 <ArrowUpRight size={20} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-xl font-medium tracking-tight">Upgrade Studio</h3>
                 <p className="text-xs text-white/60 leading-relaxed font-light">Get unlimited neural processing and team collaboration tiers.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 group w-full text-left">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white group-hover:shadow-lg">
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-bold text-black group-hover:text-[#FF5733] transition-colors uppercase tracking-tight">{title}</h4>
        <p className="text-[10px] text-gray-400 font-light truncate max-w-[150px]">{desc}</p>
      </div>
    </button>
  );
}
