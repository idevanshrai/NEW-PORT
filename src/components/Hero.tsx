import { useState, useEffect } from 'react';
import { Reveal } from './Reveal';
import { PROFILE } from '../data';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram } from 'react-icons/fa';

export const Hero = () => {
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % PROFILE.hero.subtitles.length;
            const fullText = PROFILE.hero.subtitles[i];

            setText(isDeleting
                ? fullText.substring(0, text.length - 1)
                : fullText.substring(0, text.length + 1)
            );

            setTypingSpeed(isDeleting ? 30 : 150);

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
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 @container">
            {/* Scattered Nav Items */}
            <nav className="absolute inset-0 pointer-events-none z-20 hidden md:block">
                {PROFILE.nav.map((item, index) => {
                    const positions = [
                        "top-12 left-12",
                        "top-24 right-16",
                        "bottom-32 left-20",
                        "bottom-24 right-32", // Added position for potential extra items
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

            {/* Main Hero Content */}
            <div className="flex flex-col items-center justify-center text-center gap-4 z-10 mix-blend-normal mt-[-10vh]">
                <Reveal direction="down">
                    <h1 className="text-[15vw] md:text-[12vw] leading-[0.85] font-black tracking-tighter text-white mix-blend-lighten hover:skew-x-6 transition-transform duration-500 cursor-default select-none">
                        {PROFILE.hero.title1}<br />
                        <span className="hidden md:inline text-white/20 blur-[1px]">{PROFILE.hero.title2}</span>
                        <span className="md:hidden">{PROFILE.hero.title2}</span>
                    </h1>
                </Reveal>
                <Reveal delay={0.4}>
                    <div className="mt-6 relative group cursor-pointer w-fit mx-auto px-6">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-white/5 blur-xl group-hover:opacity-75 transition-opacity duration-500 rounded-lg"></div>

                        {/* Content Box */}
                        <div className="relative px-8 py-3 border border-white/20 rounded-lg bg-white/5 backdrop-blur-xl w-full flex items-center justify-center min-h-[60px] shadow-2xl">
                            <h2 className="text-lg md:text-2xl font-bold text-white capitalize tracking-widest font-mono whitespace-nowrap">
                                {text}<span className="animate-blink text-primary">|</span>
                            </h2>
                        </div>
                    </div>
                </Reveal>

                <Reveal delay={0.6}>
                    <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mt-8 font-light leading-relaxed">
                        {PROFILE.hero.description}
                    </p>
                </Reveal>

                <Reveal delay={0.8}>
                    <div className="flex gap-6 mt-8">
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
                                {social.label === 'Instagram' && <FaInstagram size={28} />}
                                {social.label === 'Twitter' && <FaTwitter size={28} />}
                                {social.label === 'GitHub' && <FaGithub size={28} />}
                                {social.label === 'LinkedIn' && <FaLinkedin size={28} />}
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
