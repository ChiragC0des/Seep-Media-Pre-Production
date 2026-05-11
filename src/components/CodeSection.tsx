import { Play } from 'lucide-react';
import { motion } from 'motion/react';

export default function CodeSection() {
  return (
    <section className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        <h2 className="font-display text-4xl font-medium mb-4">Write scripts. Generate scenes. Go live.</h2>
        <p className="text-gray-500 mb-12 max-w-2xl">AI-powered script writing for ads, films, and storytelling</p>
        <div className="w-full max-w-4xl bg-brand-black rounded-3xl p-6 shadow-2xl relative text-left">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="ml-4 text-xs font-mono text-white/40">v-script_generator.ai</span>
          </div>
          <div className="font-mono text-sm space-y-2">
            <p className="text-brand-accent">import &#123; renderScene &#125; from "@seep/core";</p>
            <p className="text-white/60">// Generate cinematic sequences from prompts</p>
            <p className="text-white"><span className="text-brand-orange">const</span> script = [</p>
            <p className="text-white pl-4">  &#123; scene: 01, mood: "Neo-Noir", prompt: "&#123;&#123;collection.sci-fi_noir_01&#125;&#125;" &#125;,</p>
            <p className="text-white pl-4">  &#123; scene: 02, mood: "Experimental", focus: "Particle Systems" &#125;</p>
            <p className="text-white">];</p>
            <p className="text-white"><span className="text-brand-orange">renderScene</span>(script).<span className="text-brand-accent">then</span>(output =&gt; &#123;</p>
            <p className="text-white pl-4">  console.log(<span className="text-green-400">"Production ready sequence generated"</span>);</p>
            <p className="text-white">&#125;);</p>
          </div>
          
          <motion.div 
            className="absolute -right-8 bottom-12 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-xl hidden md:block"
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-brand-accent flex items-center justify-center">
                <span className="material-symbols-outlined text-white">play_arrow</span>
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase">Rendering</p>
                <p className="text-xs text-white font-medium">Sequence 01-A</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
