import { PROFILE } from '../data';

export const Footer = () => {
    return (
        <footer className="py-10 flex flex-col-reverse md:flex-row justify-between items-center gap-6 text-white/30 text-sm max-w-[1400px] mx-auto w-full px-4 md:px-20">
            <p>© {new Date().getFullYear()} {PROFILE.name}. All rights reserved.</p>
            <div className="flex gap-6 flex-wrap justify-center">
                {PROFILE.socials.map((social) => (
                    <a key={social.label} className="hover:text-primary transition-colors" href={social.url}>{social.label}</a>
                ))}
            </div>
        </footer>
    );
};
