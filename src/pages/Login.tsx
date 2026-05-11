import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2560")' }}>
      <div className="absolute inset-0 bg-white/80 backdrop-blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-12 rounded-[48px] space-y-12 relative overflow-hidden"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-black rounded-3xl mx-auto flex items-center justify-center shadow-2xl">
            <Sparkles size={32} className="text-[#FF5733]" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-4xl font-medium tracking-tight text-black">Seep Media</h1>
            <p className="text-black/40 text-sm font-light">Your space for inspiration.</p>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-black/30">Continue to Studio</p>
          
          <button 
            onClick={login}
            className="w-full bg-black text-white px-8 py-5 rounded-2xl flex items-center justify-between group hover:scale-[1.02] active:scale-95 transition-all shadow-2xl"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Sign in with Google</span>
            <ArrowRight size={18} className="text-[#FF5733] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-black/20 font-medium leading-relaxed">
            By continuing, you agree to Seep Media's <br />
            <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
