import { motion } from 'motion/react';

const ITEMS = [
  {
    series: "Series 01",
    title: "AI Ad Films",
    image: "https://lh3.googleusercontent.com/aida/ADBb0ugVc3zfq116dh8V4Wxuz8-ZqT_po-4YZceOmoiDQ0PLA9RqhR6adpdYVLoCxNu93UonSkd8AQ_5USoKdxZMlNoMeFoIYw9VhXc9qYQY_udcHngg59eC_AJcICk1eeT1XHshYTVpQBLDE4i0RTqAiomWsbCfDzsFGYn2YRcch1T8-liCUZAhohNNk74xglz3p0uW-vNotQV9m4DpsvAV4Zdtu6u4Q0DOZr3riqOkRCB93FY0cC_CWz6XrwXPBSaVYWIhGjpUEucDyLQ",
    bgColor: "bg-black",
    textColor: "text-white",
    subColor: "text-white/60",
    gradColor: "from-black/80"
  },
  {
    series: "Series 02",
    title: "AI Product Visuals",
    image: "https://lh3.googleusercontent.com/aida/ADBb0uhOd4GbqNhzziMPx6pes5j3xaS8dzUai2vmBiZeon6QS6U4IbynASgNg2HeER0w2KcrQArN32IEi5xxA1JDgDYLvCJHIQr_w7y0aEODM-gI-Yt4t8bDfl2RDZd-L8L5iYsmKlQKsNxaiiHRbY4e5eLIken8DeUjbUnXYIJvJOEw2ZLb0PM0X_GJpHVJ9fzTh2F7JUXb9YvvFY3pMu5GcbAUGmSR0YO-tysch1bOWWcVCI0_f9kcpsOdtniYNxdODo6BIy3Vrj-cMio",
    bgColor: "bg-brand-orange/10",
    textColor: "text-black",
    subColor: "text-black/40",
    gradColor: "from-black/10"
  },
  {
    series: "Series 03",
    title: "AI Cinematic Worlds",
    image: "https://lh3.googleusercontent.com/aida/ADBb0ujJrk8MEQRO-Kk0HJjvTizsaRHgFbOtoutAGyprp1FzKpke4nEGJ8PHqkB8nAqfCmjrVsY0xL3ceR0LyjlpBtvAdv9wbdqrkJMcqeKLG3aCkamoSKwAF33e-zmSELv8vdiLMVKZDgsjZc0DWZ9B7zjf5Dc21bKn_4-99T4SQIVKqbuFp5xU6K7rOD-GvKEBYyiFDP2LqBQ2TWdmyvlCv6AnSMaA-EdJg4_gYV3EvXrkGcGAv5fERY5xXTr3Es3fGMWVuHKIIrI1Y6k",
    bgColor: "bg-gray-200",
    textColor: "text-black",
    subColor: "text-black/40",
    gradColor: ""
  }
];

export default function GallerySection() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ITEMS.map((item, i) => (
            <motion.div 
              key={i}
              className={`group relative aspect-[4/5] rounded-3xl overflow-hidden ${item.bgColor}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <img 
                referrerPolicy="no-referrer"
                src={item.image} 
                alt={item.title} 
                className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${item.bgColor === 'bg-black' ? 'opacity-80' : ''}`}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${item.gradColor} via-transparent to-transparent`}></div>
              <div className="absolute bottom-8 left-8">
                <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 block ${item.subColor}`}>
                  {item.series}
                </span>
                <h3 className={`font-display text-2xl font-medium ${item.textColor}`}>{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
