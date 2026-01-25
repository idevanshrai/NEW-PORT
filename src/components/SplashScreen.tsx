import { useEffect, useState } from 'react';
import clsx from 'clsx';

interface SplashScreenProps {
    onComplete: () => void;
    isVisible: boolean;
}

export const SplashScreen = ({ onComplete, isVisible }: SplashScreenProps) => {
    const [lines, setLines] = useState([false, false, false, false]);
    const [progress, setProgress] = useState(0);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        // Sequence logic
        const timeouts: number[] = [];

        // Line 1
        timeouts.push(setTimeout(() => setLines(prev => [true, prev[1], prev[2], prev[3]]), 0));
        // Line 2
        timeouts.push(setTimeout(() => setLines(prev => [prev[0], true, prev[2], prev[3]]), 400));
        // Line 3
        timeouts.push(setTimeout(() => setLines(prev => [prev[0], prev[1], true, prev[3]]), 800));
        // Line 4 & Progress
        timeouts.push(setTimeout(() => {
            setLines(prev => [prev[0], prev[1], prev[2], true]);
            // Start progress bar
            setTimeout(() => setProgress(78), 200);
        }, 1200));

        // System Ready & Button
        timeouts.push(setTimeout(() => setShowButton(true), 1600));

        // Auto enter
        timeouts.push(setTimeout(() => handleEnter(), 4500));

        return () => timeouts.forEach(clearTimeout);
    }, []);

    const handleEnter = () => {
        onComplete();
    };

    return (
        <div
            className={clsx(
                "fixed inset-0 z-[9999] bg-background-dark transition-all duration-[1500ms] ease-in-out pointer-events-none",
                !isVisible ? "blur-[20px] opacity-0 scale-110" : "opacity-100 blur-0 scale-100 pointer-events-auto"
            )}
        >
            <div className="fixed inset-0 z-0 fluid-mesh"></div>

            <div className="fixed inset-0 z-10 flex items-center justify-center opacity-10 select-none pointer-events-none">
                <h1 className="text-[40vw] font-black tracking-tighter monogram-glow text-white">DR</h1>
            </div>

            <main className="relative z-20 w-full h-full flex items-center justify-center p-4">
                <div className="w-full max-w-3xl aspect-[16/10] md:aspect-[16/9] glass-morphism rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-white/40">terminal</span>
                            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">
                                DR-SYSTEM-BOOT-v2.04
                            </span>
                        </div>
                        <div className="w-12"></div>
                    </div>

                    <div className="flex-1 p-8 font-mono text-sm md:text-base overflow-hidden leading-relaxed text-white">
                        <div className="space-y-2">
                            {/* Line 1 */}
                            <div className={clsx("flex gap-3 transition-all duration-500", lines[0] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
                                <span className="text-primary opacity-50">#</span>
                                <span className="text-white/80">Initializing kernel modules...</span>
                                <span className="text-primary">[OK]</span>
                            </div>

                            {/* Line 2 */}
                            <div className={clsx("flex gap-3 transition-all duration-500", lines[1] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
                                <span className="text-primary opacity-50">#</span>
                                <span className="text-white/80">Connecting to <span className="text-accent-violet">dev-mesh-network</span></span>
                                <span className="text-accent-pink">...ESTABLISHED</span>
                            </div>

                            {/* Line 3 */}
                            <div className={clsx("flex gap-3 transition-all duration-500", lines[2] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
                                <span className="text-primary opacity-50">#</span>
                                <span className="text-white/80">Loading assets: <span className="text-accent-violet">creativity.so, logic.bin</span></span>
                            </div>

                            {/* Progress Bar */}
                            <div className={clsx("pl-7 w-full transition-all duration-500", lines[3] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2")}>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2 mb-4">
                                    <div
                                        className="bg-primary h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* System Ready */}
                            {showButton && (
                                <div className="animate-fade-in flex gap-3">
                                    <span className="text-primary opacity-50">#</span>
                                    <span className="text-primary font-bold text-glow">System Ready.</span>
                                </div>
                            )}

                            {/* Enter Button */}
                            {showButton && (
                                <div
                                    className="flex gap-3 pt-6 cursor-pointer group"
                                    onClick={handleEnter}
                                >
                                    <span className="text-primary opacity-50">&gt;</span>
                                    <span className="text-white cursor-blink group-hover:text-primary transition-colors">Run Portfolio_Main.exe</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-12 opacity-30 select-none">
                            <pre className="text-xs leading-tight">
                                <span className="text-accent-pink">const</span> <span className="text-primary">DevanshRai</span> = {'{'}{'\n'}
                                {'  '}role: <span className="text-accent-violet">'Full Stack Alchemist'</span>,{'\n'}
                                {'  '}passion: <span className="text-accent-violet">'Fluid UI / High Performance'</span>,{'\n'}
                                {'  '}motto: <span className="text-accent-violet">'No boring divs allowed'</span>{'\n'}
                                {'}'};{'\n'}
                                <span className="text-primary">DevanshRai</span>.<span className="text-accent-pink">init</span>();
                            </pre>
                        </div>
                    </div>

                    <div className="px-6 py-2 border-t border-white/10 bg-white/5 flex items-center justify-between text-[10px] font-mono text-white/30">
                        <div className="flex gap-4">
                            <span>UTF-8</span>
                            <span className="text-primary">100% ONLINE</span>
                        </div>
                        <div className="flex gap-4">
                            <span>L: 42 C: 12</span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_#aaff00]"></span>
                                STABLE
                            </span>
                        </div>
                    </div>
                </div>
            </main>

            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] left-[15%] w-[30rem] h-[30rem] bg-accent-violet/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[10%] right-[15%] w-[25rem] h-[25rem] bg-primary/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-accent-pink/5 rounded-full blur-[150px]"></div>
            </div>
        </div>
    );
};
