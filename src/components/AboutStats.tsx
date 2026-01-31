import { PROFILE } from '../data';

export const AboutStats = () => {
    return (
        <section className="px-4 py-8 md:py-20 md:px-20 max-w-[1200px] mx-auto w-full" id="about">
            <div className="glass-panel rounded-[2rem] md:rounded-[3rem] relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-pink/20 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col">
                    {/* Top Section: Bio */}
                    <div className="flex flex-col md:flex-row gap-10 md:gap-16 p-8 md:p-16 pb-0 md:pb-8 items-center">
                        {/* Left: Image */}
                        <div className="w-full md:w-[40%] flex-shrink-0">
                            <div
                                className="w-full aspect-[4/5] rounded-2xl bg-cover bg-center border border-white/10 shadow-2xl relative group overflow-hidden"
                                style={{ backgroundImage: `url('${PROFILE.about.avatarUrl}')` }}
                            >
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                            </div>
                        </div>

                        {/* Right: Content */}
                        <div className="w-full md:w-[60%] flex flex-col justify-center">
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">About Me</h2>
                            <div className="h-1.5 w-24 bg-primary rounded-full mb-8 shadow-[0_0_15px_rgba(170,255,0,0.5)]" />

                            <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light mb-10">
                                {PROFILE.about.quote}
                            </p>

                            <div>
                                <a
                                    href="/resume.pdf"
                                    download="Devansh_Rai_Resume.pdf"
                                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold px-8 py-4 rounded-full text-lg hover:scale-105 transition-all w-full md:w-auto inline-flex items-center gap-2 group"
                                >
                                    <span className="material-symbols-outlined group-hover:text-primary transition-colors">download</span>
                                    DOWNLOAD RESUME
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Stats */}
                    <div className="mt-8 md:mt-12 p-8 md:p-16 border-t border-white/5 bg-black/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {PROFILE.about.stats.map((stat) => (
                                <div key={stat.label} className="flex items-center gap-5 group">
                                    <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform border border-white/5`}>
                                        <span className="material-symbols-outlined text-3xl">{stat.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-4xl font-black text-white mb-1">{stat.value}</p>
                                        <p className="text-white/40 text-sm uppercase tracking-widest font-mono">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
