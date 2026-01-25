export const AboutStats = () => {
    return (
        <section className="px-4 py-20 md:px-20 max-w-[1200px] mx-auto w-full" id="about">
            <div className="glass-panel rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[60px]"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent-pink/20 rounded-full blur-[60px]"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 text-white">
                        <h2 className="text-4xl font-bold mb-6">Quantified Self</h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">timer</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-black">5+</p>
                                    <p className="text-white/50 text-sm uppercase tracking-wider">Years Experience</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-accent-violet group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-black">40+</p>
                                    <p className="text-white/50 text-sm uppercase tracking-wider">Projects Shipped</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-accent-pink group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-3xl">local_cafe</span>
                                </div>
                                <div>
                                    <p className="text-3xl font-black">1000+</p>
                                    <p className="text-white/50 text-sm uppercase tracking-wider">Coffees Consumed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full flex flex-col items-center text-center gap-8 border-t md:border-t-0 md:border-l border-white/10 pt-8 md:pt-0 md:pl-12">
                        <div className="w-32 h-32 rounded-full bg-cover bg-center border-4 border-white/10 shadow-2xl" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCiWpLViB2tU0adUpgOqE8ZSxcWUJ72gKNCq7nI8D75lEFMb0MYbq8WyXcTYWAESTpx6RMzGPDQhJfCgPZJS7bne14HcgbUvup5VQsShIRiJJHlQljNXGryO1YyN-LrhUNJGFpzqWJ_93IRJJ2qSzdCaw_Gxlf0yshgRHWMiLQQd_DuGgXpl0bMEFB9fqLugxbWxPi2yL71AoDV1B_wWvgvFXg7jU3G8cu0YRyhnwMP2OnNt_6_4Kjpxr2b9ogyWPpgXRis77_3LTQ')" }}></div>
                        <p className="text-xl md:text-2xl font-light text-white">
                            "I build things that feel alive. No boring divs allowed."
                        </p>
                        <button className="bg-primary text-background-dark font-black px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform w-full md:w-auto">
                            DOWNLOAD RESUME
                        </button>
                    </div>
                </div>
            </div>
            <footer className="mt-20 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-sm">
                <p>© 2024 Devansh Rai. All rights reserved.</p>
                <div className="flex gap-6">
                    <a className="hover:text-primary transition-colors" href="#">Instagram</a>
                    <a className="hover:text-primary transition-colors" href="#">Twitter</a>
                    <a className="hover:text-primary transition-colors" href="#">GitHub</a>
                    <a className="hover:text-primary transition-colors" href="#">LinkedIn</a>
                </div>
            </footer>
        </section>
    );
};
