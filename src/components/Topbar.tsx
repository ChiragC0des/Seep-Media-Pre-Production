import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Bell, Search, LogOut, Info, User, Mountain, Package, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      const queryLower = searchQuery.toLowerCase();
      const results: any[] = [];
      const collections = ['characters', 'environments', 'objects', 'workflows'];
      
      try {
        for (const colName of collections) {
          const q = query(collection(db, colName), where('userId', '==', user.uid));
          const snapshot = await getDocs(q);
          snapshot.forEach(doc => {
            const data = doc.data();
            const name = data.name || data.description || '';
            if (name.toLowerCase().includes(queryLower)) {
              results.push({
                id: doc.id,
                title: name,
                type: colName === 'workflows' ? 'Workflows' : colName.charAt(0).toUpperCase() + colName.slice(1, -1),
                path: colName === 'workflows' ? '/studio' : `/${colName}`
              });
            }
          });
        }
        setSearchResults(results.slice(0, 5));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  return (
    <header className="h-16 border-b border-gray-100 bg-white/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-6 flex-1">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            defaultValue="Untitled Project"
            className="bg-transparent border-none focus:ring-0 text-sm font-medium text-black/80 hover:text-black transition-colors p-0 w-64"
          />
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#FF5733] bg-[#FF5733]/5 px-2 py-0.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5733] animate-pulse"></div>
            Draft
          </div>
        </div>

        <div className="relative w-full max-w-md ml-4">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearchFocused ? 'text-[#FF5733]' : 'text-black/20'}`} />
          <input 
            type="text" 
            placeholder="Search assets, scenes, prompts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full bg-gray-50 border border-gray-100 rounded-full pl-10 pr-4 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-[#FF5733]/5 focus:border-[#FF5733]/20 transition-all placeholder:text-black/20"
          />

          <AnimatePresence>
            {isSearchFocused && searchQuery.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl p-4 overflow-hidden z-[70]"
              >
                <div className="space-y-1">
                  {isSearching ? (
                    <p className="text-[10px] text-black/20 text-center py-4">Searching...</p>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link 
                        key={`${result.type}-${result.id}`}
                        to={result.path}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group"
                      >
                         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-black/20 group-hover:text-[#FF5733]">
                           {result.type === 'Character' && <User size={14} />}
                           {result.type === 'Environment' && <Mountain size={14} />}
                           {result.type === 'Object' && <Package size={14} />}
                           {result.type === 'Workflows' && <FileText size={14} />}
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-black uppercase tracking-tight truncate max-w-[200px]">{result.title}</p>
                            <p className="text-[8px] font-bold text-black/20 uppercase tracking-widest">{result.type}</p>
                         </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-[10px] text-black/20 text-center py-4">No results for "{searchQuery}"</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 transition-colors relative rounded-xl ${showNotifications ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <Bell size={20} />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-white border border-gray-100 rounded-[32px] shadow-2xl p-6 z-[60]"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-black/40">Studio Notifications</h3>
                </div>
                
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <Bell size={20} className="text-black/10" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/20">No new notifications</p>
                </div>

                <button className="w-full mt-2 py-3 text-[10px] font-bold uppercase tracking-widest text-black/20 hover:text-black transition-colors border-t border-gray-50">
                  Settings
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>

        <button 
          onClick={() => alert('Exporting Production Pack to Higgsfield...')}
          className="flex items-center gap-2 bg-[#FF5733] text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg"
        >
          <Sparkles size={14} />
          Export Pack
        </button>

        <div className="flex items-center gap-3 ml-2 group relative">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              alt="Profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          <button 
            onClick={logout}
            className="p-1.5 text-black/20 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
