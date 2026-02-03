import { useState } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { Hero } from './components/Hero';
import { ProjectCard } from './components/ProjectCard';
import { LabCarousel } from './components/LabCarousel';
import { ExperienceTimeline } from './components/ExperienceTimeline';
import { AboutStats } from './components/AboutStats';
import { Reveal } from './components/Reveal';
import { Cursor } from './components/Cursor';
import { GitHubActivity } from './components/GitHubActivity';
import { Footer } from './components/Footer';
import clsx from 'clsx';
import { Analytics } from '@vercel/analytics/react';

import { PROJECTS } from './data';

import { SmoothScroll } from './components/SmoothScroll';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setTimeout(() => setShowContent(true), 100);
  };

  return (
    <>
      <Analytics />
      <SmoothScroll />
      <Cursor />
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
          <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-accent-pink/10 rounded-full blur-[120px] animate-float mix-blend-overlay"></div>
        </div>

        <div className="relative z-10 flex min-h-screen w-full flex-col">
          <Hero />

          <Reveal width="100%" direction="up">
            <AboutStats />
          </Reveal>


          <ExperienceTimeline />

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
                {PROJECTS.map((project, index) => (
                  <Reveal key={`${project.title}-${index}`} delay={0.1 + (index % 3) * 0.1} width="100%">
                    <ProjectCard
                      title={project.title}
                      description={project.description}
                      year={project.year}
                      image={project.image}
                      icon={project.icon}
                      accentColor={project.accentColor}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <Reveal width="100%" direction="right">
            <LabCarousel />
          </Reveal>

          <Reveal width="100%" direction="up">
            <GitHubActivity />
          </Reveal>

          <Footer />
        </div>
      </div>
    </>
  );
}

export default App;
