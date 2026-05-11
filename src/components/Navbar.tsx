import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-16 flex items-center px-6 md:px-12 justify-between" data-purpose="main-navigation">
      <div className="flex items-center gap-8">
        <Link className="font-display font-bold text-2xl tracking-tighter" to="/">
          <span className="text-[#FF5733]">SEEP</span> <span className="text-[#000000]">MEDIA</span>
        </Link>
        <div className="hidden lg:flex gap-6 text-sm font-medium text-gray-600">
          <Link className="hover:text-black transition-colors" to="/studio">Studio</Link>
          <Link className="hover:text-black transition-colors" to="/prompts">Prompts</Link>
          <Link className="hover:text-black transition-colors" to="/scripts">Scripts</Link>
          <Link className="hover:text-black transition-colors" to="/marketplace">Marketplace</Link>
          <Link className="hover:text-black transition-colors" to="/learning">Learning</Link>
          <Link className="hover:text-black transition-colors" to="/pricing">Pricing</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link className="text-sm font-medium px-4 py-2 hover:bg-gray-100 rounded-full transition-all" to="/dashboard">Dashboard</Link>
        <Link className="text-sm font-medium bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition-all" to="/studio">Start Creating</Link>
      </div>
    </nav>
  );
}
