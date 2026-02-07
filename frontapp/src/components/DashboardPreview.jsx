import { motion } from "framer-motion";

export default function DashboardPreview() {
  const forms = [
    { id: 1, name: "Customer Feedback Form", date: "10:24 AM", initial: "C", color: "bg-mahogany", text: "text-rice" },
    { id: 2, name: "Event Registration 2026", date: "09:15 AM", initial: "E", color: "bg-vanilla", text: "text-mahogany" },
    { id: 3, name: "Product Research Survey", date: "Yesterday", initial: "P", color: "bg-vanilla", text: "text-mahogany" },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="w-full max-w-[1400px] mt-12 relative px-4 md:px-0"
    >
      {/* Background Blobs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-sand/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-mahogany/5 rounded-full blur-3xl -z-10"></div>

      {/* Main Dashboard Shell */}
      <div className="bg-rice/80 backdrop-blur-md p-4 md:p-8 rounded-[40px] md:rounded-[60px] shadow-2xl border-4 border-white/50 overflow-hidden relative group animate-glow-pulse text-left">
        
        {/* Real-looking Header */}
        <header className="flex items-center justify-between mb-10 md:mb-12 gap-4">
          <img src="/assets/icons/arphatra-form-1.svg" alt="" className="w-20 md:w-28 opacity-80" />
          
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex items-center gap-3 w-full rounded-full px-5 py-2 border-2 border-mahogany/20 bg-white/30">
              <img src="/assets/icons/homepage/search-icon.svg" alt="" className="w-4 h-4 opacity-40" />
              <div className="h-4 w-32 bg-mahogany/10 rounded-full"></div>
            </div>
          </div>

          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-mahogany/10 border-2 border-white shadow-sm overflow-hidden">
             <img src="/assets/icons/homepage/Avatar.svg" alt="" className="w-full h-full object-cover" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-start">
          
          {/* Left Column: Greeting & Quick Actions */}
          <div className="flex flex-col gap-8">
            <section className="space-y-1">
              <p className="text-sm md:text-lg font-medium text-mahogany/60">Good Morning, User!</p>
              <h2 className="text-2xl md:text-3xl font-bold text-mahogany leading-tight">Ready to create a new form today?</h2>
            </section>

            <div className="flex flex-col md:flex-row items-start gap-6 relative">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-sand rounded-[30px] md:rounded-[40px] overflow-hidden shadow-lg border-4 border-white w-full md:w-56 shrink-0"
              >
                <img src="/assets/images/new-form.png" alt="" className="w-full h-auto" />
              </motion.div>

              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="hidden md:block w-full h-24 rounded-[30px] bg-mahogany/5 border-2 border-mahogany/5 overflow-hidden">
                   <img src="/assets/images/recent.png" alt="" className="w-full h-full object-cover opacity-50" />
                </div>
                <div className="flex gap-3">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[25px] md:rounded-[30px] bg-mahogany flex items-center justify-center shadow-xl text-rice text-2xl md:text-3xl font-bold">C</div>
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[25px] md:rounded-[30px] bg-vanilla border-4 border-mahogany flex items-center justify-center shadow-lg text-mahogany text-2xl md:text-3xl font-bold">E</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: List View */}
          <div className="flex flex-col h-full min-h-[400px]">
            {/* Tabs Mockup */}
            <div className="flex justify-end gap-6 mb-6">
                <div className="relative font-bold text-mahogany text-sm md:text-base">
                    Today
                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-mahogany rounded-full"></div>
                </div>
                <div className="font-bold text-mahogany/30 text-sm md:text-base">Yesterday</div>
                <div className="font-bold text-mahogany/30 text-sm md:text-base">2 Days ago</div>
            </div>

            <div className="bg-vanilla/60 rounded-[35px] md:rounded-[45px] p-5 md:p-8 flex-1 flex flex-col gap-4 shadow-inner border border-white/40">
              {/* List Header */}
              <div className="grid grid-cols-[1.5fr_1fr_40px] gap-4 px-4 pb-4 border-b border-mahogany/10 font-bold text-[10px] md:text-xs text-mahogany/40 uppercase tracking-widest">
                <div className="text-center">Name</div>
                <div className="text-center">Last Opened</div>
                <div></div>
              </div>

              {/* Form Items */}
              <div className="space-y-3">
                {forms.map((form) => (
                    <motion.div 
                        key={form.id}
                        variants={itemVariants}
                        whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.8)" }}
                        className="grid grid-cols-[1.5fr_1fr_40px] items-center p-3 md:p-4 rounded-2xl md:rounded-3xl bg-white/40 border border-white/60 shadow-sm cursor-default transition-colors"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-mahogany/5 flex items-center justify-center shrink-0">
                                <img src="/assets/icons/homepage/doc-icon.svg" alt="" className="w-4 h-4 md:w-5 md:h-5 opacity-40" />
                            </div>
                            <p className="font-bold text-mahogany text-xs md:text-base truncate">{form.name}</p>
                        </div>
                        <div className="text-center text-[10px] md:text-sm font-medium text-mahogany/60">
                            {form.date}
                        </div>
                        <div className="flex justify-center">
                            <img src="/assets/icons/homepage/more-vertical.svg" alt="" className="w-4 h-4 md:w-5 md:h-5 opacity-20" />
                        </div>
                    </motion.div>
                ))}
              </div>

              {/* Empty Space Decoration */}
              <div className="flex-1 flex items-center justify-center opacity-5 mt-4">
                  <img src="/assets/icons/arphatra-form-1.svg" alt="" className="w-40 h-auto grayscale" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Status Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-mahogany text-rice px-6 py-2.5 rounded-full font-bold shadow-2xl flex items-center gap-3 text-xs md:text-sm whitespace-nowrap z-20">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-ping"></div>
            Real-time Dashboard Analytics
        </div>
      </div>
    </motion.div>
  );
}