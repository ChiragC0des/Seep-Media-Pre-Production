import { motion } from 'motion/react';
import { BookOpen, Video, Zap, Clock, Star, ArrowRight, Play } from 'lucide-react';

const COURSES = [
  {
    title: "Prompt Engineering for Film",
    level: "Beginner",
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
    category: "Prompt Engineering"
  },
  {
    title: "Cinematic Lighting in AI",
    level: "Advanced",
    duration: "1.5 hours",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&q=80&w=800",
    category: "AI Filmmaking"
  },
  {
    title: "AI Scriptwriting Masterclass",
    level: "Intermediate",
    duration: "2 hours",
    image: "https://images.unsplash.com/photo-1485846234645-a62644ef7467?auto=format&fit=crop&q=80&w=800",
    category: "Content Creation"
  }
];

export default function Learning() {
  return (
    <div className="py-12 pb-20 px-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-semibold tracking-tight mb-4 text-black"
          >
            Director's Academy
          </motion.h1>
          <p className="text-xl text-black/40 font-light max-w-2xl mx-auto">Master the art of neural filmmaking and cinematic prompt engineering.</p>
        </div>

        {/* Categories chips */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {["All Courses", "Prompt Engineering", "AI Filmmaking", "Content Creation"].map((cat, i) => (
            <button key={i} className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${i === 0 ? 'bg-black text-white shadow-lg' : 'bg-white border border-gray-100 text-black/40 hover:border-black/20'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {COURSES.map((course, i) => (
            <motion.div 
               key={course.title}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-white border border-gray-100 rounded-[40px] overflow-hidden group hover:shadow-2xl transition-all cursor-pointer"
            >
               <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                        <Play size={24} fill="black" />
                     </div>
                  </div>
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest text-[#FF5733]">
                     {course.level}
                  </div>
               </div>
               <div className="p-8 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/20">{course.category}</p>
                  <h3 className="text-xl font-medium tracking-tight text-black">{course.title}</h3>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/20">
                        <Clock size={12} /> {course.duration}
                     </div>
                     <ArrowRight size={16} className="text-black/10 group-hover:text-black transition-all group-hover:translate-x-1" />
                  </div>
               </div>
            </motion.div>
          ))}
        </div>

        {/* Guides List */}
        <div className="bg-gray-50 rounded-[60px] p-12 md:p-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="font-display text-4xl md:text-5xl font-medium leading-tight text-black">Master the tools with <br /> our free guides.</h2>
              <p className="text-black/40 leading-relaxed font-light">Detailed documentation and creative workflows to help you integrate AI into your production pipeline.</p>
              <div className="space-y-4">
                {[
                  "Neural Prompt StructuresV2",
                  "AI Camera Movement Techniques",
                  "Integrating Scripts with Content Studio",
                  "Monetizing on the Marketplace"
                ].map((guide, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl group cursor-pointer hover:bg-black transition-colors border border-transparent hover:border-black">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white/10 group-hover:text-white transition-colors">
                        <BookOpen size={18} />
                      </div>
                      <span className="font-medium text-black group-hover:text-white transition-colors">{guide}</span>
                    </div>
                    <ArrowRight size={18} className="text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-white rounded-[40px] shadow-2xl p-1 relative z-10 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200" alt="Masterclass" className="w-full h-full object-cover rounded-[38px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-10 left-10 text-white">
                   <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Exclusive Content</p>
                   <h3 className="text-3xl font-medium tracking-tight">Director Masterclasses</h3>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#FF5733]/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
