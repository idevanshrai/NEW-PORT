import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const Cursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    // Use MotionValues for high-performance updates
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring physics - Tuned for a weighted, premium feel
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check for interactive elements
            const isInteractive =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('cursor-pointer') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setIsHovering(!!isInteractive);
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    // Only show on non-touch devices
    if (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) return null;

    return (
        <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999]">
            {/* Main Cursor Dot */}
            <motion.div
                className="fixed top-0 left-0 bg-primary z-50 mix-blend-difference"
                style={{
                    x: mouseX,
                    y: mouseY,
                    width: 8,
                    height: 8,
                    translateX: '-50%',
                    translateY: '-50%',
                    borderRadius: '50%'
                }}
            />

            {/* Glass Ring Follower */}
            <motion.div
                className="fixed top-0 left-0 border border-primary/50 bg-white/5 z-40 box-border backdrop-blur-[1px]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%',
                    borderRadius: '50%',
                }}
                animate={{
                    width: isHovering ? 64 : 32,
                    height: isHovering ? 64 : 32,
                    opacity: isHovering ? 1 : 0.6,
                    borderColor: isHovering ? '#aaff00' : 'rgba(170, 255, 0, 0.3)',
                    backgroundColor: isHovering ? 'rgba(170, 255, 0, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    scale: isClicking ? 0.9 : 1,
                }}
                transition={{
                    type: "tween",
                    duration: 0.2
                }}
            />
        </div>
    );
};
