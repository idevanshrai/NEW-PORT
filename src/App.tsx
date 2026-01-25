import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Hero } from './components/Hero';
import { ProjectCard } from './components/ProjectCard';
import { LabCarousel } from './components/LabCarousel';
import { AboutStats } from './components/AboutStats';
import { Reveal } from './components/Reveal';
import clsx from 'clsx';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <>
      <SplashScreen onComplete={handleSplashComplete} isVisible={showSplash} />

      <div
        className={clsx(
          "bg-background-dark min-h-screen text-white font-display overflow-x-hidden selection:bg-primary selection:text-background-dark transition-all duration-[1500ms] ease-out",
          showContent ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-lg translate-y-4 pointer-events-none"
        )}
      >
        {/* Fluid Background Mesh */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-accent-violet/20 rounded-full blur-[100px] animate-float mix-blend-screen"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full blur-[80px] animate-float-delayed mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-accent-pink/10 rounded-full blur-[120px] animate-float mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex min-h-screen w-full flex-col">
          <Hero />

          {/* Selected Works Section */}
          <section className="px-4 py-20 md:px-20 relative" id="work">
            <div className="max-w-[1400px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                  <h2 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/10 tracking-tighter mb-4">
                    Selected<br />Works
                  </h2>
                  <p className="text-lg text-white/60 max-w-md font-light leading-relaxed">
                    A collection of fluid interfaces and tacky-cool experiments designed to break the internet.
                  </p>
                </div>
                <div className="hidden md:block pb-4">
                  <span className="material-symbols-outlined text-6xl text-primary animate-spin-slow">asterisk</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Reveal delay={0.1}>
                  <ProjectCard
                    title="Fluid Commerce"
                    description="E-commerce experience with liquid transitions."
                    year="2023"
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuCQzJJgQeSlAi8mIZzK4a-43t98eOkRQAWYLBmsyP4WXzh1koxHBFdyv_EgAuBr7xkNYWy_s09Gg1EuFt4UH-wzx4RnK9bZU2NXLEC2lnEX8IMy9WY4pCcYJHLPknz8tpfcvL6cF2DWklHo6geCRoK2k4fj4CR6llBb_2JLal9rAsdVHmObA51V75VzmzxbQA3ubA-EBOqYU6iOoMXNhwsM8QwIwwYDXASSe__5jSPlt0GS-O37KV1S-NRwNJEo5TzK0VToYd1qmlI"
                    icon="water_drop"
                    accentColor="violet"
                  />
                </Reveal>
                <Reveal delay={0.2}>
                  <ProjectCard
                    className="md:mt-20"
                    title="Neon Dashboard"
                    description="Data visualization with glowing aesthetics."
                    year="2024"
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuBGQtqgALG6XX3mFc_0XjLaVA1ojcOPQ5Is54CwYC1UwCJYUA0mKbly1ODHsewy5rz4Aw0Ed9iSXJCOtex-e9nJkCIYGJB7Pwji1dnL-AT5xy5GnmtFuIIyEbHcqvkFJzj0Krd0UEnVkJj5S7wKew7OfDmlCGHtfrKVpPHLhwX_UMAGshndJcZmYCJd5fqcAyedjDZPSzeAKNO0rcYsVmUFB-TU44UuQjTTTfFjpCfBS5pDMlGox7PpTxeurnrp60EeKMK8n7yAZlU"
                    icon="bolt"
                    accentColor="primary"
                  />
                </Reveal>
                <Reveal delay={0.3}>
                  <ProjectCard
                    title="Retro Portfolio"
                    description="Y2K inspired personal site."
                    year="2022"
                    image="https://lh3.googleusercontent.com/aida-public/AB6AXuAbS2ndnfQoCe_WL4PURy8uuqjj1wWLX_WeYajjWiJZLsIg-dYJCkEpn2UCSKDEyfj9RjSD1xRhvywpBtSVwpjxrk4h9F0SNETShLh8jCPLQGES9vhr3srMwgcruXoOo5xR6vYbw4o-Vn5A17z4krHEYCq1ipCHQpuar9xJbEofq7QQ8SUNTvvpb5vqTm0aNKL4Y3ypZDbcThy5NtOLDWcN7dN_owixQTfBsiarQdvB81_QF9MEgp2pZTR-Fvr7-HiDGwW40gmLPkQ"
                    icon="stars"
                    accentColor="pink"
                  />
                </Reveal>
              </div>
            </div>
          </section>

          <Reveal width="100%" direction="right">
            <LabCarousel />
          </Reveal>

          <Reveal width="100%" direction="up">
            <AboutStats />
          </Reveal>
        </div>
      </div>
    </>
  );
}

export default App;
