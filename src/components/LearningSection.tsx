import { motion } from 'motion/react';

export default function LearningSection() {
  return (
    <section className="py-32 px-6 bg-white border-t border-gray-100" id="learning">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase mb-4 block text-brand-orange">Educational Portal</span>
            <h2 className="font-display text-4xl md:text-6xl font-medium tracking-tight mb-8">Learn AI <br /> content creation.</h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed">
              Free guides on prompts, AI filmmaking, and content creation
            </p>
            <div className="space-y-6">
              <motion.div 
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
                whileHover={{ x: 10 }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                  <h4 className="font-display font-medium text-xl">The Seep Playbook</h4>
                  <p className="text-gray-400 text-sm">Core fundamentals of the Seep ecosystem.</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
                whileHover={{ x: 10 }}
              >
                <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center text-brand-accent group-hover:bg-brand-accent group-hover:text-white transition-all">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <div>
                  <h4 className="font-display font-medium text-xl">Masterclasses</h4>
                  <p className="text-gray-400 text-sm">Deep dives with industry leading visual artists.</p>
                </div>
              </motion.div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-[3rem] bg-gray-100 overflow-hidden relative shadow-2xl">
              <img 
                referrerPolicy="no-referrer"
                src="https://lh3.googleusercontent.com/aida/ADBb0uhOd4GbqNhzziMPx6pes5j3xaS8dzUai2vmBiZeon6QS6U4IbynASgNg2HeER0w2KcrQArN32IEi5xxA1JDgDYLvCJHIQr_w7y0aEODM-gI-Yt4t8bDfl2RDZd-L8L5iYsmKlQKsNxaiiHRbY4e5eLIken8DeUjbUnXYIJvJOEw2ZLb0PM0X_GJpHVJ9fzTh2F7JUXb9YvvFY3pMu5GcbAUGmSR0YO-tysch1bOWWcVCI0_f9kcpsOdtniYNxdODo6BIy3Vrj-cMio" 
                alt="Learning" 
                className="w-full h-full object-cover grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
            {/* Floating Card */}
            <motion.div 
              className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 max-w-[240px]"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Tutorial</span>
              </div>
              <p className="font-medium text-sm mb-4 leading-snug">Rendering Volumetric Lighting in Seep Studio</p>
              <button className="text-xs font-bold text-brand-accent">Join Now →</button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
