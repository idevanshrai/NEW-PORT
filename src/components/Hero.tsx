import { useState, useEffect } from 'react';
import { Reveal } from './Reveal';
import { PROFILE } from '../data';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';


export const Hero = () => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(70);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % PROFILE.hero.subtitles.length;
            const fullText = PROFILE.hero.subtitles[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 70);

            if (!isDeleting && text === fullText) {
                setTimeout(() => setIsDeleting(true), 3000); // Pause at end
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 @container overflow-hidden pt-20 md:pt-0">
            {/* Green Blob - Bottom Right (Enhanced Visibility) */}
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/40 rounded-full blur-[120px] pointer-events-none z-0 opacity-50 mix-blend-screen"></div>

            {/* Scattered Nav Items */}
            <nav className="absolute inset-0 pointer-events-none z-20 hidden md:block">
                {PROFILE.nav.map((item, index) => {
                    // Update positions to avoid the 3D area on the right
                    const positions = [
                        "top-12 left-12",       // Top Left
                        "bottom-12 left-12",    // Bottom Left
                        "top-12 right-12",      // Top Right
                        "bottom-12 right-12",   // Bottom Right
                    ];
                    // safe index
                    const posIndex = index % positions.length;

                    return (
                        <a
                            key={item.label}
                            className={`pointer-events-auto absolute ${positions[posIndex]} group transition-transform hover:scale-110`}
                            href={item.href}
                        >
                            <div className={`px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-${item.color}/50 transition-all duration-300`}>
                                <span className={`text-sm font-bold tracking-widest uppercase text-white group-hover:text-${item.color}`}>{item.label}</span>
                            </div>
                        </a>
                    );
                })}

                <a className="pointer-events-auto absolute bottom-12 right-12 group transition-transform hover:scale-110" href="#contact">
                    <div className="px-8 py-4 rounded-full bg-primary text-background-dark hover:bg-white hover:scale-105 transition-all duration-300 font-black tracking-tighter">
                        LET'S TALK
                    </div>
                </a>
            </nav>

            {/* Mobile Nav */}
            <nav className="md:hidden w-full flex justify-between items-center absolute top-0 p-6 z-20">
                <span className="font-bold text-xl text-white">{PROFILE.initials}</span>
                <button className="p-2 bg-white/10 rounded-full text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </nav>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto w-full flex flex-col items-center justify-center text-center gap-8 relative z-10">

                <Reveal direction="down">
                    <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter text-white mix-blend-lighten hover:skew-x-6 transition-transform duration-500 cursor-default select-none">
                        {PROFILE.hero.title1}<br />
                        <span className="text-white/20 blur-[1px]">{PROFILE.hero.title2}</span>
                    </h1>
                </Reveal>

                <Reveal delay={0.2}>
                    <div className="mt-8 relative group cursor-pointer">
                        <div className="relative px-6 py-2 border border-white/10 rounded-full bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors duration-300">
                            <h2 className="text-lg md:text-2xl font-medium subpixel-antialiased text-white uppercase tracking-widest whitespace-nowrap min-h-[1.5em] flex items-center justify-center">
                                {text}<span className="ml-2 animate-blink inline-block w-2 h-6 bg-primary shadow-[0_0_10px_#aaff00] align-middle opacity-100"></span>
                            </h2>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.4}>
                    <p className="text-white/60 text-lg md:text-xl max-w-xl font-light leading-relaxed">
                        {PROFILE.hero.description}
                    </p>
                </Reveal>

                <Reveal delay={0.6}>
                    <div className="flex gap-6 mt-4">
                        {PROFILE.socials.map((social) => (
                            <a
                                key={social.label}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-white/50 transition-colors duration-300 hover:scale-110 transform
                                    ${social.label === 'Instagram' ? 'hover:text-[#E1306C]' : ''}
                                    ${social.label === 'Twitter' ? 'hover:text-[#1DA1F2]' : ''}
                                    ${social.label === 'GitHub' ? 'hover:text-white' : ''}
                                    ${social.label === 'LinkedIn' ? 'hover:text-[#0077B5]' : ''}
                                `}
                            >
                                {social.label === 'Instagram' && <FaInstagram size={32} />}
                                {social.label === 'Twitter' && <FaTwitter size={32} />}
                                {social.label === 'GitHub' && <FaGithub size={32} />}
                                {social.label === 'LinkedIn' && <FaLinkedin size={32} />}
                            </a>
                        ))}
                    </div>
                </Reveal>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce md:hidden">
                <span className="material-symbols-outlined text-white/50">arrow_downward</span>
            </div>
        </div>
    );
};
