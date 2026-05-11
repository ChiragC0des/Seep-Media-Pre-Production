import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Video, 
  Users, 
  Mountain, 
  Package, 
  GitBranch, 
  Download,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MENU_ITEMS = [
  { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
  { icon: <Video size={20} />, label: 'Director (Create Flow)', path: '/studio' },
  { icon: <Users size={20} />, label: 'Characters', path: '/characters' },
  { icon: <Mountain size={20} />, label: 'Environments', path: '/environments' },
  { icon: <Package size={20} />, label: 'Objects', path: '/objects' },
  { icon: <GitBranch size={20} />, label: 'Workflows', path: '/workflows' },
  { icon: <Download size={20} />, label: 'Exports', path: '/exports' },
];

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="border-r border-gray-100 bg-white flex flex-col flex-shrink-0 relative"
    >
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="font-display font-bold text-xl tracking-tighter flex items-center gap-2 overflow-hidden">
          <div className="min-w-[32px] w-8 h-8 bg-[#FF5733] rounded-lg flex items-center justify-center text-xs text-white shrink-0">S</div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-1 whitespace-nowrap"
              >
                <span className="text-black">SEEP</span>
                <span className="text-black/20">MEDIA</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-black shadow-sm z-50 hover:scale-110 transition-transform"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <nav className={`flex-1 px-3 py-4 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative w-full ${
              location.pathname === item.path 
                ? 'bg-black text-white shadow-xl' 
                : 'text-gray-400 hover:text-black hover:bg-gray-50'
            }`}
          >
            <span className={`shrink-0 ${location.pathname === item.path ? 'text-[#FF5733]' : 'text-inherit opacity-60 group-hover:opacity-100 transition-opacity'}`}>
              {item.icon}
            </span>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium tracking-tight whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}
      </nav>

      <div className={`p-3 border-t border-gray-100 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <button 
          title={isCollapsed ? "Settings" : undefined}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 w-full transition-all group"
        >
          <Settings size={20} className="shrink-0 opacity-60 group-hover:opacity-100" />
          {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button 
          title={isCollapsed ? "Logout" : undefined}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-500/60 hover:text-red-500 hover:bg-red-50 w-full transition-all group"
        >
          <LogOut size={20} className="shrink-0 opacity-60" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
