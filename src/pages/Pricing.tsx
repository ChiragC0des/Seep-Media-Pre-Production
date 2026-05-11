import { motion } from 'motion/react';
import { Check, Info, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: "Director Access",
    price: "0",
    description: "Full access to the Seep Media creative stack during early access",
    features: [
      "Neural Scene Director Flow",
      "Consistent Character Engine",
      "World & Mood Environments",
      "Unlimited Production Pipelines",
      "Direct Prompt Injections"
    ],
    cta: "Continue Producing",
    featured: true
  }
];

export default function Pricing() {
  return (
    <div className="py-24 pb-48 px-6 min-h-full bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-[#FF5733]/10 text-[#FF5733] px-4 py-2 rounded-full mb-8 border border-[#FF5733]/20"
          >
            <Star size={14} fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Limited Early Access</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-8xl font-semibold tracking-tight mb-8 text-black"
          >
            Studio Access
          </motion.h1>
          <p className="text-xl text-black/40 font-light max-w-2xl mx-auto leading-relaxed">Seep Media is currently in early access. All neural filmmaking tools are available without charge for founding directors.</p>
        </div>

        <div className="max-w-xl mx-auto mb-48">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col p-12 md:p-16 rounded-[60px] transition-all h-full bg-black text-white shadow-2xl z-10 overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5733]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="mb-12 relative z-10">
                <h3 className="font-display text-3xl mb-4">{plan.name}</h3>
                <p className="text-sm mb-10 text-white/40 font-light leading-relaxed">{plan.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-semibold tracking-tighter">${plan.price}</span>
                  <span className="text-lg text-white/20">/mo</span>
                </div>
              </div>
              
              <ul className="space-y-6 mb-12 flex-grow relative z-10">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-4 text-sm font-light">
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                      <Check size={10} className="text-[#FF5733]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link to="/studio" className="w-full py-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all bg-[#FF5733] text-white hover:bg-[#FF5733]/90 text-center shadow-xl">
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {[
            { q: "What is neural filmmaking?", a: "It's the intersection of creative direction and deep learning models to automate the structured parts of production." },
            { q: "Is it really free for now?", a: "Yes. During early access, we want to hear from directors on how to better the pipeline for real-world use." },
            { q: "Can I export my prompts?", a: "Absolutely. Everything you produce remains yours and can be exported as structured JSON for any AI engine." },
            { q: "What about IP rights?", a: "You own 100% of the creative scripts, character designs, and workflows you build on Seep Media." }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5733]">{item.q}</h4>
              <p className="text-black/40 text-sm font-light leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
