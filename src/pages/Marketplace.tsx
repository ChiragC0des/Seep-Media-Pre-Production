import { motion } from 'motion/react';
import { Search, Grid } from 'lucide-react';
import { useState } from 'react';

const PROMPTS = [
  { id: 1, title: "Neo-Noir Street", category: "Cinematic", description: "Rain-slicked streets with glowing neon reflections and deep shadows.", img: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800" },
  { id: 2, title: "Cyberpunk Portrait", category: "Character", description: "Ultra-detailed portrait with bio-luminescent implants.", img: "https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=800" },
  { id: 3, title: "Desert Mirage", category: "World", description: "Vast sand dunes with heat haze distortion and orange skies.", img: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=800" },
  { id: 4, title: "Minimalist Watch", category: "Product", description: "Sleek metallic watch on a dark monolithic background.", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" },
  { id: 5, title: "High-Fashion Gown", category: "Fashion", description: "Voluminous silk dress flowing in a zero-gravity environment.", img: "https://images.unsplash.com/photo-1539109132345-c49ac7c50b39?auto=format&fit=crop&q=80&w=800" },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPrompts = PROMPTS.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 min-h-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Hero Section */}
        <div className="mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-7xl font-semibold tracking-tight mb-6"
          >
            Prompt Marketplace
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 font-light max-w-2xl"
          >
            High-performing prompts for every use case.
          </motion.p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div className="flex flex-wrap gap-2">
            {["All", "Character", "World", "Product", "Fashion", "Cinematic"].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full transition-all ${
                  activeCategory === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search marketplace..." 
              className="w-full bg-gray-50 border-none rounded-full pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-black/5"
            />
          </div>
        </div>

        {/* Prompt Grid */}
        <div className="mb-20">
          {filteredPrompts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {filteredPrompts.map((p, i) => (
                 <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={p.id} 
                  className="group cursor-pointer"
                 >
                   <div className="aspect-[4/5] rounded-[40px] overflow-hidden bg-gray-100 mb-6 relative">
                     <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="bg-white text-black px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest">View Blueprint</button>
                     </div>
                   </div>
                   <div className="space-y-1">
                      <div className="text-[10px] text-[#FF5733] font-bold uppercase tracking-widest">{p.category}</div>
                      <h3 className="font-display text-xl font-medium">{p.title}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
                   </div>
                 </motion.div>
               ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-[40px] p-24 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center">
                <Grid className="text-black/10" size={32} />
              </div>
              <div className="space-y-1">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-black/40">No matching prompts</h3>
                 <p className="text-xs text-black/20">Try adjusting your search or category filters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
