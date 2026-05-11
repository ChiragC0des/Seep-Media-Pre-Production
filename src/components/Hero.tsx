import { motion } from 'motion/react';
import { useState } from 'react';

const APP_ICONS = [
  { src: "https://lh3.googleusercontent.com/aida/ADBb0uhOd4GbqNhzziMPx6pes5j3xaS8dzUai2vmBiZeon6QS6U4IbynASgNg2HeER0w2KcrQArN32IEi5xxA1JDgDYLvCJHIQr_w7y0aEODM-gI-Yt4t8bDfl2RDZd-L8L5iYsmKlQKsNxaiiHRbY4e5eLIken8DeUjbUnXYIJvJOEw2ZLb0PM0X_GJpHVJ9fzTh2F7JUXb9YvvFY3pMu5GcbAUGmSR0YO-tysch1bOWWcVCI0_f9kcpsOdtniYNxdODo6BIy3Vrj-cMio", top: "25%", left: "30%", size: "w-16 h-16" },
  { src: "https://lh3.googleusercontent.com/aida/ADBb0ugVc3zfq116dh8V4Wxuz8-ZqT_po-4YZceOmoiDQ0PLA9RqhR6adpdYVLoCxNu93UonSkd8AQ_5USoKdxZMlNoMeFoIYw9VhXc9qYQY_udcHngg59eC_AJcICk1eeT1XHshYTVpQBLDE4i0RTqAiomWsbCfDzsFGYn2YRcch1T8-liCUZAhohNNk74xglz3p0uW-vNotQV9m4DpsvAV4Zdtu6u4Q0DOZr3riqOkRCB93FY0cC_CWz6XrwXPBSaVYWIhGjpUEucDyLQ", top: "15%", left: "45%", size: "w-14 h-14" },
  { src: "https://lh3.googleusercontent.com/aida/ADBb0ujJrk8MEQRO-Kk0HJjvTizsaRHgFbOtoutAGyprp1FzKpke4nEGJ8PHqkB8nAqfCmjrVsY0xL3ceR0LyjlpBtvAdv9wbdqrkJMcqeKLG3aCkamoSKwAF33e-zmSELv8vdiLMVKZDgsjZc0DWZ9B7zjf5Dc21bKn_4-99T4SQIVKqbuFp5xU6K7rOD-GvKEBYyiFDP2LqBQ2TWdmyvlCv6AnSMaA-EdJg4_gYV3EvXrkGcGAv5fERY5xXTr3Es3fGMWVuHKIIrI1Y6k", top: "28%", left: "65%", size: "w-12 h-12" },
  { src: "https://lh3.googleusercontent.com/aida/ADBb0ugVc3zfq116dh8V4Wxuz8-ZqT_po-4YZceOmoiDQ0PLA9RqhR6adpdYVLoCxNu93UonSkd8AQ_5USoKdxZMlNoMeFoIYw9VhXc9qYQY_udcHngg59eC_AJcICk1eeT1XHshYTVpQBLDE4i0RTqAiomWsbCfDzsFGYn2YRcch1T8-liCUZAhohNNk74xglz3p0uW-vNotQV9m4DpsvAV4Zdtu6u4Q0DOZr3riqOkRCB93FY0cC_CWz6XrwXPBSaVYWIhGjpUEucDyLQ", top: "65%", left: "25%", size: "w-18 h-18" },
  { src: "https://lh3.googleusercontent.com/aida/ADBb0uhOd4GbqNhzziMPx6pes5j3xaS8dzUai2vmBiZeon6QS6U4IbynASgNg2HeER0w2KcrQArN32IEi5xxA1JDgDYLvCJHIQr_w7y0aEODM-gI-Yt4t8bDfl2RDZd-L8L5iYsmKlQKsNxaiiHRbY4e5eLIken8DeUjbUnXYIJvJOEw2ZLb0PM0X_GJpHVJ9fzTh2F7JUXb9YvvFY3pMu5GcbAUGmSR0YO-tysch1bOWWcVCI0_f9kcpsOdtniYNxdODo6BIy3Vrj-cMio", top: "70%", left: "55%", size: "w-14 h-14" },
  { src: "https://lh3.googleusercontent.com/aida/ADBb0ujJrk8MEQRO-Kk0HJjvTizsaRHgFbOtoutAGyprp1FzKpke4nEGJ8PHqkB8nAqfCmjrVsY0xL3ceR0LyjlpBtvAdv9wbdqrkJMcqeKLG3aCkamoSKwAF33e-zmSELv8vdiLMVKZDgsjZc0DWZ9B7zjf5Dc21bKn_4-99T4SQIVKqbuFp5xU6K7rOD-GvKEBYyiFDP2LqBQ2TWdmyvlCv6AnSMaA-EdJg4_gYV3EvXrkGcGAv5fERY5xXTr3Es3fGMWVuHKIIrI1Y6k", top: "55%", left: "75%", size: "w-16 h-16" },
];

export default function Hero() {
  const [opening, setOpening] = useState<number | null>(null);

  const handleIconClick = (index: number) => {
    setOpening(index);
    setTimeout(() => setOpening(null), 1500);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 hero-gradient overflow-hidden" data-purpose="hero-section">
      {/* Overlay for zoom animation */}
      <div className={`fixed inset-0 bg-black z-90 transition-opacity duration-400 pointer-events-none ${opening !== null ? 'opacity-100' : 'opacity-0'}`} id="app-overlay"></div>

      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[min(90vw,800px)] aspect-square z-0 pointer-events-none">
      </div>

      <div className="absolute top-[58%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[min(90vw,800px)] aspect-square pointer-events-none z-10">
        {APP_ICONS.map((icon, i) => {
          const angle = (i / APP_ICONS.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 35; // slightly reduced for tighter circle
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                top: opening === i ? '50%' : `${y}%`, 
                left: opening === i ? '50%' : `${x}%`,
              }}
              transition={{ 
                delay: i * 0.1, 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                top: { duration: opening === i ? 0.6 : 0.8 },
                left: { duration: opening === i ? 0.6 : 0.8 }
              }}
              className={`absolute ${icon.size} rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-auto cursor-pointer transition-shadow duration-400 group hover:scale-110 hover:shadow-[0_0_30px_rgba(82,104,183,0.4)] ${opening === i ? 'fixed !top-1/2 !left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[60] rounded-none z-[100] transition-[transform] duration-700 ease-[cubic-bezier(0.7,0,0.3,1)]' : '-translate-x-1/2 -translate-y-1/2'}`}
              style={{ 
                zIndex: opening === i ? 100 : 10
              }}
              onClick={() => handleIconClick(i)}
            >
              <img 
                referrerPolicy="no-referrer" 
                src={icon.src} 
                className={`rounded-lg object-cover transition-opacity duration-300 ${opening === i ? 'opacity-0' : 'w-10 h-10'}`} 
                alt="" 
              />
              <div className="absolute inset-0 rounded-full border border-black/5 group-hover:border-brand-accent/20 transition-colors"></div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        className="relative z-10 text-center max-w-3xl mt-12"
        id="hero-content"
      >
        <span className="text-xs font-bold tracking-widest uppercase mb-4 block text-gray-500">Seep Media</span>
        <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight mb-4 leading-[1.1]">
          Create cinematic <br /> AI content.
        </h1>
        <p className="text-xl text-gray-500 font-light mb-8">
          Ads. Trailers. AI films. Prompts. Scripts — all in one place.
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <button className="bg-black text-white px-8 py-3 rounded-full font-medium hover:scale-105 transition-transform">
            Start Creating
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"></path></svg>
            See AI Demo
          </button>
        </div>
      </motion.div>
    </section>
  );
}
