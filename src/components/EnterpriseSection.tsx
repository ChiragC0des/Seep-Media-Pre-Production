import { motion } from 'motion/react';

export default function EnterpriseSection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-medium tracking-tight mb-4">AI Creation Engine</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Professional tools designed for high-performance creative teams.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Asset Management */}
          <motion.div 
            className="md:col-span-2 glass-card rounded-3xl p-8 relative overflow-hidden h-[300px] flex flex-col justify-end"
            whileHover={{ y: -5 }}
          >
            <span className="material-symbols-outlined absolute top-8 left-8 text-3xl text-brand-accent text-[2rem]">movie_edit</span>
            <h3 className="font-display text-2xl font-medium mb-2">AI Ad & Film Generator</h3>
            <p className="text-sm text-gray-500">Create ads, trailers, and short films with AI</p>
          </motion.div>

          {/* Multi-Modal */}
          <motion.div 
            className="md:col-span-1 glass-card rounded-3xl p-8 relative h-[300px] flex flex-col justify-end"
            whileHover={{ y: -5 }}
          >
            <span className="material-symbols-outlined absolute top-8 left-8 text-3xl text-brand-orange text-[2rem]">token</span>
            <h3 className="font-display text-xl font-medium mb-2">Prompt Engine</h3>
            <p className="text-sm text-gray-400">Generate prompts for characters, worlds, and products</p>
          </motion.div>

          {/* Documentation */}
          <motion.div 
            className="md:col-span-1 glass-card rounded-3xl p-8 relative h-[300px] flex flex-col justify-end"
            whileHover={{ y: -5 }}
          >
            <span className="material-symbols-outlined absolute top-8 left-8 text-3xl text-gray-400 text-[2rem]">description</span>
            <h3 className="font-display text-xl font-medium mb-2">AI Script Writer</h3>
            <p className="text-sm text-gray-400">Turn ideas into production-ready scripts</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
