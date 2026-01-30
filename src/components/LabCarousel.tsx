import { useRef } from 'react';
import { LAB_PROJECTS } from '../data';

export const LabCarousel = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-20 relative overflow-hidden" id="lab">
            {/* Background Noise/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-violet/5 to-transparent pointer-events-none" />

            <div className="max-w-[1400px] mx-auto px-4 md:px-20 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40 tracking-tighter mb-4">
                        The Lab
                    </h2>
                    <p className="text-white/50 max-w-sm">
                        Experiments, sketches, and unfinished symphonies.
                    </p>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={scrollLeft}
                        className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_back</span>
                    </button>
                    <button
                        onClick={scrollRight}
                        className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-2xl">arrow_forward</span>
                    </button>
                </div>
            </div>

            {/* Carousel */}
            <div
                ref={containerRef}
                className="flex gap-8 overflow-x-auto px-4 md:px-20 pb-12 snap-x snap-mandatory hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {LAB_PROJECTS.map((project, index) => (
                    <div
                        key={index}
                        className="min-w-[300px] md:min-w-[400px] snap-center group relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-white/5 border border-white/10"
                        data-cursor-snap
                    >
                        <img
                            src={project.image}
                            alt={project.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent" />

                        <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <h3 className="text-2xl font-bold mb-1">{project.title}</h3>
                            <p className="text-accent-violet font-mono text-sm">{project.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
