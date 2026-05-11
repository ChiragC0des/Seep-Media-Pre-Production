export default function Footer() {
  return (
    <footer className="bg-white py-24 px-6 border-t border-gray-100">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="mb-16 text-center">
          <p className="text-sm text-gray-400 mb-6 font-medium tracking-widest uppercase">Start your journey.</p>
          <h2 className="font-display text-4xl md:text-5xl font-medium mb-12">Start creating with AI.</h2>
          <button className="bg-black text-white px-12 py-5 rounded-full text-lg font-medium hover:scale-105 transition-transform shadow-2xl">
            Start Now
          </button>
        </div>
        
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 text-sm text-gray-500 mb-20 border-t border-black/5 pt-20">
          <div className="space-y-3">
            <p className="text-black font-semibold uppercase tracking-widest text-[10px]">Social</p>
            <a href="#" className="block hover:text-black transition-colors">Instagram</a>
            <a href="#" className="block hover:text-black transition-colors">TikTok</a>
            <a href="#" className="block hover:text-black transition-colors">Twitter/X</a>
          </div>
          <div className="space-y-3">
            <p className="text-black font-semibold uppercase tracking-widest text-[10px]">Product</p>
            <a href="#" className="block hover:text-black transition-colors">Download</a>
            <a href="#" className="block hover:text-black transition-colors">Marketplace</a>
            <a href="#" className="block hover:text-black transition-colors">Release Notes</a>
          </div>
          <div className="space-y-3">
            <p className="text-black font-semibold uppercase tracking-widest text-[10px]">Company</p>
            <a href="#" className="block hover:text-black transition-colors">Careers</a>
            <a href="#" className="block hover:text-black transition-colors">About</a>
            <a href="#" className="block hover:text-black transition-colors">Blog</a>
          </div>
          <div className="space-y-3">
            <p className="text-black font-semibold uppercase tracking-widest text-[10px]">Legal</p>
            <a href="#" className="block hover:text-black transition-colors">Privacy</a>
            <a href="#" className="block hover:text-black transition-colors">Terms</a>
            <a href="#" className="block hover:text-black transition-colors">Security</a>
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row justify-between items-center md:items-end gap-12">
          <div className="flex items-center gap-1 group">
            <h2 className="font-display text-[15vw] md:text-[12vw] font-bold leading-none tracking-tighter text-brand-orange opacity-20 uppercase">SEEP</h2>
            <div className="bg-black/5 backdrop-blur-xl border border-black/10 px-6 py-3 rounded-2xl">
              <span className="font-display text-[6vw] md:text-[4vw] font-bold text-black opacity-40">MEDIA</span>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-end pb-8">
            <svg className="w-12 h-12 mb-6 text-brand-orange" fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"></circle>
              <circle cx="20" cy="20" fill="currentColor" r="4"></circle>
              <path d="M20 2v4M20 34v4M2 20h4M34 20h4" stroke="currentColor" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-medium">© 2024 Seep Media Ltd.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
