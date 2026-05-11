import { Check } from 'lucide-react';
import { motion } from 'motion/react';

const PLANS = [
  {
    name: "Starter",
    price: "0",
    description: "Free access to basic prompt generation",
    features: ["Up to 100 collections", "Basic visual search", "Mobile app access"],
    cta: "Start for free",
    featured: false
  },
  {
    name: "Creator",
    price: "12",
    description: "Full access to AI prompts, scripts, and generation tools",
    features: ["Unlimited collections", "Advanced AI Analysis", "Color & Scene search", "Private storage", "Master Library access"],
    cta: "Get Creator",
    featured: true
  },
  {
    name: "Studio",
    price: "39",
    description: "For teams creating high-volume AI content",
    features: ["Shared team workspaces", "Export high-res libraries", "Custom tags & API access"],
    cta: "Contact Sales",
    featured: false
  }
];

export default function PricingSection() {
  return (
    <section className="py-32 px-6 bg-gray-50" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-5xl font-medium tracking-tight">Simple Pricing</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan, i) => (
            <motion.div 
              key={i}
              className={`${plan.featured ? 'bg-black text-white scale-105 shadow-2xl z-10' : 'bg-white text-black border border-gray-100'} p-8 rounded-[2rem] flex flex-col relative`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              {plan.featured && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-brand-orange text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-full text-white">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-xl mb-1">{plan.name}</h3>
              <p className={`text-xs mb-4 ${plan.featured ? 'text-white/60' : 'text-gray-400'}`}>{plan.description}</p>
              <p className="text-4xl font-semibold mb-6">${plan.price} <span className={`text-sm font-normal ${plan.featured ? 'text-white/50' : 'text-gray-400'}`}>/mo</span></p>
              <ul className="space-y-4 mb-8 text-sm flex-grow">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-orange" /> {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-4 rounded-full font-bold transition-all ${
                  plan.featured 
                  ? 'bg-white text-black hover:bg-brand-gray' 
                  : 'border border-black text-black hover:bg-black hover:text-white'
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
