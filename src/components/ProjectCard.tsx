import { ParallaxImage } from './ParallaxImage';

interface ProjectCardProps {
    title: string;
    description: string;
    year: string;
    image: string;
    icon: string;
    accentColor: "violet" | "primary" | "pink";
    className?: string;
}

export const ProjectCard = ({ title, description, year, image, icon, accentColor, className }: ProjectCardProps) => {
    const accentColors = {
        violet: {
            bg: "bg-accent-violet/10",
            text: "text-accent-violet",
            gradient: "from-accent-violet/20",
        },
        primary: {
            bg: "bg-primary/10",
            text: "text-primary",
            gradient: "from-primary/20",
        },
        pink: {
            bg: "bg-accent-pink/10",
            text: "text-accent-pink",
            gradient: "from-accent-pink/20",
        },
    };

    const color = accentColors[accentColor];

    return (
        <div className={`group relative aspect-[4/5] md:aspect-square ${className || ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} to-transparent rounded-[2rem] transform rotate-2 scale-95 group-hover:rotate-6 transition-transform duration-500`}></div>
            <div className="absolute inset-0 glass-panel rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden transition-transform duration-300 group-hover:-translate-y-2">
                <div className="w-full h-1/2 rounded-2xl mb-4 overflow-hidden relative">
                    <ParallaxImage src={image} className="absolute inset-0" />
                </div>
                <div className="relative z-10">
                    <div className="flex justify-between items-start">
                        <div className={`p-3 ${color.bg} rounded-full ${color.text} mb-4`}>
                            <span className="material-symbols-outlined">{icon}</span>
                        </div>
                        <span className="text-xs font-mono border border-white/20 rounded-full px-2 py-1 text-white/50">{year}</span>
                    </div>
                    <h3 className="text-3xl font-bold leading-tight mb-1 text-white">{title}</h3>
                    <p className="text-white/50 text-sm">{description}</p>
                </div>
            </div>
        </div>
    );
};
