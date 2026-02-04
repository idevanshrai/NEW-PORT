import type { Project } from '../data';

export const ProjectCard = ({ title, description, year, image, icon, accentColor, repo }: Project) => {
    const colorMap = {
        violet: 'text-accent-violet border-accent-violet/20 group-hover:border-accent-violet/50',
        primary: 'text-primary border-primary/20 group-hover:border-primary/50',
        pink: 'text-accent-pink border-accent-pink/20 group-hover:border-accent-pink/50'
    };

    return (
        <div className="group relative aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500" data-cursor-snap>
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className={`p-3 rounded-full bg-white/5 backdrop-blur border ${colorMap[accentColor]} text-2xl material-symbols-outlined transition-colors`}>
                        {icon}
                    </span>
                    <span className="font-mono text-sm bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                        {year}
                    </span>
                </div>

                <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
                    <h3 className="text-3xl font-black mb-2 leading-none">{title}</h3>
                    <p className="text-white/60 font-light text-sm line-clamp-3 group-hover:text-white/80 transition-colors">
                        {description}
                    </p>
                </div>
            </div>

            {/* Hover Reveal Button */}
            <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20">
                {repo ? (
                    <a
                        href={repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-background-dark w-12 h-12 rounded-full flex items-center justify-center font-bold hover:scale-110 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_outward</span>
                    </a>
                ) : (
                    <button className="bg-white text-background-dark w-12 h-12 rounded-full flex items-center justify-center font-bold hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">arrow_outward</span>
                    </button>
                )}
            </div>
        </div>
    );
};
