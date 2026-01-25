import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxImageProps {
    src: string;
    className?: string;
}

export const ParallaxImage = ({ src, className }: ParallaxImageProps) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.2, 1.1]);

    return (
        <div ref={ref} className={`overflow-hidden h-full w-full ${className}`}>
            <motion.div
                style={{ y, scale, backgroundImage: `url('${src}')` }}
                className="w-full h-full bg-cover bg-center absolute inset-0"
            />
        </div>
    );
};
