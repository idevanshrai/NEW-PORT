// Animate terminal lines
function animateTerminal() {
  const lines = document.querySelectorAll('.terminal-line');
  const progressBar = document.getElementById('progress-bar');
  
  lines.forEach((line, index) => {
    setTimeout(() => {
      line.style.opacity = '1';
      line.style.transform = 'translateY(0)';
      line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      
      // Animate progress bar on the progress line
      if (index === 3) {
        setTimeout(() => {
          progressBar.style.width = '78%';
        }, 200);
      }
    }, index * 400);
  });
}

// Transition to main site
function enterSite() {
  const splash = document.getElementById("splash-screen");
  const site = document.getElementById("portfolio-site");

  // Apply blur to splash screen
  splash.style.filter = 'blur(20px)';
  splash.style.opacity = '0';
  
  setTimeout(() => {
    splash.style.display = 'none';
    site.classList.remove("opacity-0", "pointer-events-none");
    site.style.opacity = '1';
    site.style.transition = 'opacity 1s ease-in-out';
  }, 1000);
}

// Start animation sequence
setTimeout(() => {
  animateTerminal();
}, 500);

// Auto-enter site after animation completes
setTimeout(enterSite, 4500);

// Manual click to enter
document.getElementById('enter-command').addEventListener('click', enterSite);
