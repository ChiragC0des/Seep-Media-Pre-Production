import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

const WORDS = ["imagine.", "build.", "create.", "see."];

export default function SearchSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % WORDS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-32 px-6 bg-white" id="features">
      <div className="max-w-4xl mx-auto mb-16">
        <div className="flex flex-col items-start gap-4">
          <div className="font-display text-4xl md:text-5xl font-medium flex flex-wrap items-center gap-x-4 gap-y-2 text-left w-full">
            <span>Create the way you</span>
            <div className="h-[1.4em] overflow-hidden relative inline-flex items-center text-brand-accent italic min-w-[200px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={WORDS[index]}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 flex items-center"
                >
                  {WORDS[index]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-brand-accent/20 to-brand-orange/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white/40 backdrop-blur-2xl border border-black/5 rounded-full px-8 py-6 flex items-center gap-4 shadow-2xl">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-xl font-light w-full placeholder:text-gray-300" 
              placeholder="Generate an ad, character, world, or script..."
            />
            <div className="flex gap-2">
              <span className="bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">Visual</span>
              <span className="bg-black/5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400">Color</span>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-gray-400 text-sm">Generate AI visuals, prompts, and scripts — instantly.</p>
      </div>
    </section>
  );
}
