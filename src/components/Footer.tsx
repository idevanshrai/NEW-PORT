import { useEffect, useState } from 'react';
import { PROFILE } from '../data';

export const Footer = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <footer id="contact" className="mt-20 mb-8 mx-4 md:mx-auto glass-panel rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden max-w-[1400px] w-[calc(100%-2rem)]">
            {/* Top Bar: Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 md:px-12 py-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <span className="text-sm font-mono text-white/60 tracking-wider">SYSTEM ONLINE</span>
                </div>
                <div className="text-sm font-mono text-white/40">
                    LOC: {time.toLocaleTimeString('en-US', { hour12: false, timeZoneName: 'short' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
                {/* Main CTA - Spans 8 cols */}
                <div className="md:col-span-8 p-8 md:p-16 border-r border-white/5 flex flex-col justify-between relative group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div>
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-tight">
                            AVAILABLE FOR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                                OPPORTUNITIES
                            </span>
                        </h2>
                        <p className="text-white/50 max-w-md text-lg leading-relaxed">
                            Specializing in building exceptional digital experiences.
                            Let's create something meaningful together.
                        </p>
                    </div>

                    <a
                        href={`mailto:${PROFILE.email}`}
                        className="inline-flex items-center gap-4 text-xl font-bold text-primary group-hover:text-white transition-colors mt-12 md:mt-0"
                    >
                        INITIALIZE_CONTACT <span className="material-symbols-outlined">arrow_forward</span>
                    </a>
                </div>

                {/* Sidebar - Spans 4 cols */}
                <div className="md:col-span-4 flex flex-col">
                    {/* Socials Block */}
                    <div className="flex-1 p-8 md:p-12 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <h4 className="font-mono text-xs text-secondary mb-6 tracking-widest uppercase">COMMUNICATION</h4>
                        <ul className="space-y-4">
                            {PROFILE.socials.map((social) => (
                                <li key={social.label}>
                                    <a
                                        href={social.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-2xl font-bold text-white hover:text-primary transition-colors flex items-center gap-2 group"
                                    >
                                        {social.label}
                                        <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all">arrow_outward</span>
                                    </a>
                                </li>
                            ))}
                            <li>
                                <a
                                    href={`mailto:${PROFILE.email}`}
                                    className="text-2xl font-bold text-white hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    Email
                                    <span className="material-symbols-outlined text-sm opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all">mail</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Meta Block */}
                    <div className="p-8 md:p-12 hover:bg-white/5 transition-colors">
                        <h4 className="font-mono text-xs text-secondary mb-6 tracking-widest uppercase">INDEX</h4>
                        <div className="flex justify-between items-end">
                            <ul className="text-sm space-y-2 text-white/50">
                                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#work" className="hover:text-white transition-colors">Experience</a></li>
                                <li><a href="#lab" className="hover:text-white transition-colors">Lab</a></li>
                            </ul>
                            <div className="text-right">
                                <p className="text-xs font-mono text-white/20 mb-1">VERSION 2.0.25</p>
                                <p className="text-white/40 text-sm">© {new Date().getFullYear()} {PROFILE.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
