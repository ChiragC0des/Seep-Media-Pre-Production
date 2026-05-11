import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const ASSETS = [
  {
    title: "AI Character",
    count: "12,400 assets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCG5TaRu3NcWszEt5aJ2gzXY0Kf7zqduv0xxS38S9RDfDQhzZdHLEn2SWz-0Q4YvASwdydSxMYTeTc4rZRLyh2a8uPnUiep3yQwrqi1wYZtu6P8zCE9pYBVMQaayphGznM5xLbY6JnhKgFBQqzLZUXt8tRj6X4UyJjiBE75OvHW-9Ezbz0TAcjUZPZV410CjJOKB7Sd1oJ17nYEAF3-Wf1ACo7-QoLBtpkXXunirGL2YqwjEvxrTElpzMaLST9o8-vCw_k-DSlt5cy7"
  },
  {
    title: "AI World",
    count: "8,900 assets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlEXiizok6iFbyJ3rckzhIgv2cG1iyEMPQ-s5pywOR7zvCi1UHC7pHWQn559RLoJQsqvznl7LZQqLdFkghHi7jA5gPQFaxA5EHiyXYNTWOjSWtazqXlpUlTJ1JeQ3Ne-LsCms10FkF7L-gUQnp00sSE17tCmyj_wyvuRGhhri-l6Y7RSPM7hE7TaU0Fb0X1wCzkXVwgQtbm-xxZj7lJjWVRzIO8JMo5EHgaik4Ow5cVhyspjWsXGkAT9PUDUwYdE9GLTZY7QKgKhaG"
  },
  {
    title: "AI Product",
    count: "4,200 assets",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuClu8BU-2f-CnRFJ02E51FtA1QlcFX4C3RK0eqK1QXGLCEPGd2TxMCoCvw_iElWHmWq7-xSr8Yp0wamr2zCYfiMpvleoPUvyCgIOHSYhDi_jPf4DHqiHRACgFbCW7RuUnZzNHSGxu7OJUd7_bs7GjMZv8rdq16EFQqlTpQaOzLTlfSkUWUfZDLj37oF_nh2gPy5sYIWj7lF4wN36YUEnMm771wFlIgSaJ6cTvpA6rNx7NX6tfx9KleX-gwPFNLRZgeYQbYf35jFkBMV"
  },
  {
    title: "AI Fashion",
    count: "15,100 assets",
    image: "https://lh3.googleusercontent.com/aida/ADBb0ugVc3zfq116dh8V4Wxuz8-ZqT_po-4YZceOmoiDQ0PLA9RqhR6adpdYVLoCxNu93UonSkd8AQ_5USoKdxZMlNoMeFoIYw9VhXc9qYQY_udcHngg59eC_AJcICk1eeT1XHshYTVpQBLDE4i0RTqAiomWsbCfDzsFGYn2YRcch1T8-liCUZAhohNNk74xglz3p0uW-vNotQV9m4DpsvAV4Zdtu6u4Q0DOZr3riqOkRCB93FY0cC_CWz6XrwXPBSaVYWIhGjpUEucDyLQ"
  }
];

export default function MarketplaceSection() {
  return (
    <section className="py-24 px-6 bg-gray-50" id="marketplace">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-display text-4xl font-medium mb-2">Prompt Marketplace</h2>
            <p className="text-gray-500">Buy, sell, and use high-performing AI prompts</p>
          </div>
          <Link to="/marketplace" className="text-sm font-medium border-b border-black pb-1 hover:text-brand-accent hover:border-brand-accent transition-colors">View Marketplace</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ASSETS.map((asset, i) => (
            <motion.div 
              key={i} 
              className="group cursor-pointer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-200">
                <img 
                  referrerPolicy="no-referrer"
                  src={asset.image} 
                  alt={asset.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              </div>
              <h4 className="font-medium text-sm">{asset.title}</h4>
              <p className="text-xs text-gray-400">{asset.count}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
