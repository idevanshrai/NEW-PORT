import { Reveal } from './Reveal';

export const Hero = () => {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 @container">
            {/* Scattered Nav Items */}
            <nav className="absolute inset-0 pointer-events-none z-20 hidden md:block">
                <a className="pointer-events-auto absolute top-12 left-12 group transition-transform hover:scale-110" href="#work">
                    <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(170,255,0,0.4)] transition-all duration-300">
                        <span className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-primary">Projects</span>
                    </div>
                </a>
                <a className="pointer-events-auto absolute top-24 right-16 group transition-transform hover:scale-110" href="#about">
                    <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-accent-pink/50 hover:shadow-[0_0_15px_rgba(255,51,204,0.4)] transition-all duration-300">
                        <span className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-accent-pink">About</span>
                    </div>
                </a>
                <a className="pointer-events-auto absolute bottom-32 left-20 group transition-transform hover:scale-110" href="#lab">
                    <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:border-accent-violet/50 hover:shadow-[0_0_15px_rgba(163,0,255,0.4)] transition-all duration-300">
                        <span className="text-sm font-bold tracking-widest uppercase text-white group-hover:text-accent-violet">Lab</span>
                    </div>
                </a>
                <a className="pointer-events-auto absolute bottom-12 right-12 group transition-transform hover:scale-110" href="#contact">
                    <div className="px-8 py-4 rounded-full bg-primary text-background-dark hover:bg-white hover:scale-105 transition-all duration-300 font-black tracking-tighter">
                        LET'S TALK
                    </div>
                </a>
            </nav>

            {/* Mobile Nav */}
            <nav className="md:hidden w-full flex justify-between items-center absolute top-0 p-6 z-20">
                <span className="font-bold text-xl text-white">DR</span>
                <button className="p-2 bg-white/10 rounded-full text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </nav>

            {/* Main Hero Content */}
            <div className="flex flex-col items-center justify-center text-center gap-2 z-10 mix-blend-normal">
                <Reveal direction="down">
                    <h1 className="text-[12vw] leading-[0.85] font-black tracking-tighter text-white mix-blend-lighten hover:skew-x-6 transition-transform duration-500 cursor-default select-none">
                        DEVANSH<br /><span className="text-white/20 blur-[1px]">RAI</span>
                    </h1>
                </Reveal>
                <Reveal delay={0.4}>
                    <div className="mt-8 relative group cursor-pointer">
                        <div className="absolute -inset-4 bg-gradient-to-r from-accent-violet via-primary to-accent-pink opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                        <div className="relative px-8 py-2 border border-white/20 rounded-full bg-background-dark/30 backdrop-blur-sm">
                            <h2 className="text-2xl md:text-4xl font-bold rainbow-oil-text uppercase tracking-widest">
                                Software Developer
                            </h2>
                        </div>
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
