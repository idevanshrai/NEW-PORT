import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValue, useMotionTemplate } from 'framer-motion';
import { EXPERIENCE } from '../data';

// Helper to extract tech tags from description
const getTechTags = (desc: string) => {
    const keywords = ["Python", "C++", "Java", "Flutter", "Dart", "React", "Node", "Arduino", "Machine Learning", "AI", "iOS", "Android", "SQL", "Leadership", "Robotics"];
    return keywords.filter(keyword => desc.toLowerCase().includes(keyword.toLowerCase()));
};

// Card with 3D Tilt Effect
const ExperienceCard = ({ item, index }: { item: any, index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        mouseX.set(x - centerX);
        mouseY.set(y - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const rotateX = useTransform(mouseY, [-200, 200], [2, -2]);
    const rotateY = useTransform(mouseX, [-200, 200], [-2, 2]);
    const springConfig = { damping: 20, stiffness: 200 };
    const springRotateX = useSpring(rotateX, springConfig);
    const springRotateY = useSpring(rotateY, springConfig);

    // Dynamic tags
    const tags = getTechTags(item.description);

    // Extract year from period for watermark
    const year = item.period.split(' - ')[0].replace(/[^0-9]/g, '');

    return (
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Desktop Watermark (Opposite Side) */}
            <div className={`hidden md:flex ${index % 2 === 0 ? 'justify-start order-1' : 'justify-end order-2'} opacity-80 select-none`}>
                <span className="text-[8rem] font-black text-white/10 leading-none tracking-tighter mix-blend-overlay">
                    {year}
                </span>
            </div>

            {/* Content Side */}
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative pl-10 md:pl-0 ${index % 2 === 0 ? 'order-2' : 'order-1'}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Desktop: Center Dot */}
                <div className={`hidden md:flex absolute top-[32px] ${index % 2 === 0 ? '-left-[27px]' : '-right-[27px]'} w-3.5 h-3.5 rounded-full border border-white/20 bg-background-dark z-20 items-center justify-center group-hover:border-primary transition-colors duration-500`}>
                    <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Desktop: Connector Line */}
                <div className={`hidden md:block absolute top-[38px] ${index % 2 === 0 ? 'left-[-20px] w-5' : 'right-[-20px] w-5'} h-px bg-white/10 group-hover:bg-primary/50 transition-colors duration-500`} />

                {/* Mobile: Left Dot */}
                <div className="md:hidden absolute left-[16px] top-[32px] w-4 h-4 rounded-full border border-white/20 bg-background-dark z-20 flex items-center justify-center transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Mobile: Connector Line */}
                <div className="md:hidden absolute left-[16px] top-[39px] w-6 h-[2px] bg-white/10 group-hover:bg-primary/50 transition-colors duration-500" />


                {/* Content Card with Tilt */}
                <motion.div
                    style={{
                        rotateX: springRotateX,
                        rotateY: springRotateY,
                        transformStyle: "preserve-3d"
                    }}
                    className={`group perspective-1000 ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}
                    data-cursor-snap
                >
                    <div className="glass-panel p-6 rounded-[2rem] relative overflow-hidden transition-all duration-500 hover:bg-white/5 hover:shadow-[0_0_30px_rgba(170,255,0,0.05)] border border-white/5 hover:border-white/10">
                        {/* Mouse Glow */}
                        <motion.div
                            className="absolute pointer-events-none -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{
                                background: useMotionTemplate`
                                    radial-gradient(
                                        650px circle at ${mouseX}px ${mouseY}px,
                                        rgba(170, 255, 0, 0.08),
                                        transparent 80%
                                    )
                                `
                            }}
                        />

                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-start' : 'md:items-end'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-white/50">
                                    {item.period}
                                </span>
                                {item.icon && <span className="material-symbols-outlined text-lg text-primary opacity-80">{item.icon}</span>}
                            </div>

                            <h3 className="text-2xl font-black text-white mb-1 leading-tight">{item.title}</h3>
                            <p className="text-lg font-bold text-primary mb-3">{item.organization}</p>

                            <p className="text-white/60 leading-relaxed font-light text-base max-w-lg mb-4">
                                {item.description}
                            </p>

                            {/* Tech Tags */}
                            {tags.length > 0 && (
                                <div className={`flex flex-wrap gap-2 ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                                    {tags.map(tag => (
                                        <span key={tag} className="text-xs font-mono text-white/40 px-2 py-1 rounded hover:text-primary hover:bg-primary/10 transition-colors cursor-default border border-white/5 hover:border-white/10">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export const ExperienceTimeline = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section className="py-20 px-4 md:px-20 relative bg-background-dark z-10" id="experience" ref={containerRef}>

            <div className="max-w-[1200px] mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-16 text-center"
                >
                    <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/10 tracking-tighter mb-4 relative inline-block">
                        My<br />Experience
                    </h2>
                    <p className="text-white/50 max-w-lg text-center mx-auto text-lg leading-relaxed">
                        A retrospective of my academic and professional journey.
                    </p>
                </motion.div>

                <div className="relative pl-0 pr-0">
                    {/* Central Line - Desktop */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/5 transform -translate-x-1/2 z-0" />
                    <motion.div
                        style={{ scaleY, transformOrigin: 'top' }}
                        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary to-transparent transform -translate-x-1/2 z-0 shadow-[0_0_15px_rgba(170,255,0,0.6)]"
                    />

                    {/* Left Line - Mobile */}
                    <div className="md:hidden absolute left-[15px] top-0 bottom-0 w-[2px] bg-white/10 z-0" />
                    <motion.div
                        style={{ scaleY, transformOrigin: 'top' }}
                        className="md:hidden absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-primary to-transparent z-0 shadow-[0_0_15px_rgba(170,255,0,0.6)]"
                    />

                    <div className="space-y-20">
                        {/* Education Section */}
                        <div className="relative">
                            <div className="flex justify-start md:justify-center mb-8 pl-10 md:pl-0 pt-2">
                                <span className="bg-zinc-900/90 backdrop-blur-md border border-white/20 px-6 py-2 md:px-8 md:py-3 rounded-full text-lg md:text-xl font-bold text-primary uppercase tracking-widest z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    Education
                                </span>
                            </div>
                            <div className="space-y-8">
                                {EXPERIENCE.education.map((item, index) => (
                                    <ExperienceCard key={index} item={{ ...item, icon: 'school' }} index={index} />
                                ))}
                            </div>
                        </div>

                        {/* Professional Section */}
                        <div className="relative">
                            <div className="flex justify-start md:justify-center mb-8 pl-10 md:pl-0 pt-10 border-t border-white/5 md:border-none">
                                <span className="bg-zinc-900/90 backdrop-blur-md border border-white/20 px-6 py-2 md:px-8 md:py-3 rounded-full text-lg md:text-xl font-bold text-primary uppercase tracking-widest z-10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                                    Professional
                                </span>
                            </div>
                            <div className="space-y-8">
                                {EXPERIENCE.professional.map((item, index) => (
                                    <ExperienceCard key={index} item={{ ...item, icon: 'work' }} index={index + EXPERIENCE.education.length} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
