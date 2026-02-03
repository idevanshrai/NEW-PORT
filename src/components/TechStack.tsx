import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Decal, Float, useTexture, Environment, OrbitControls, RoundedBox } from '@react-three/drei';
import { useMemo, Suspense, useRef, useState } from 'react';
import * as THREE from 'three';
import { PROFILE } from '../data';

const TechTile = ({ position, skill }: { position: [number, number, number], skill: { name: string, slug: string, color: string } }) => {
    const iconUrl = `https://cdn.simpleicons.org/${skill.slug}/white`;
    const texture = useTexture(iconUrl);
    const meshRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const { gl } = useThree();

    useMemo(() => {
        // High Quality Texture Settings
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
    }, [texture, gl]);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Gentle looking around float
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
        meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5 + position[1]) * 0.1;

        if (hovered) {
            meshRef.current.rotation.y += state.clock.getDelta();
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.2, 0.1);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
            <group
                ref={meshRef}
                position={position}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                scale={hovered ? 1.15 : 1}
            >
                {/* Sleek, Thin Rounded Tile (iOS App Icon Style) */}
                <RoundedBox args={[1.6, 1.6, 0.2]} radius={0.3} smoothness={4} castShadow receiveShadow>
                    {/* Premium Dark Glassy Material */}
                    <meshPhysicalMaterial
                        color={hovered ? "#222" : "#111"}
                        roughness={0.2}
                        metalness={0.8}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        emissive={skill.color}
                        emissiveIntensity={hovered ? 0.3 : 0.05}
                    />

                    {/* High-Res Icon Decal */}
                    <Decal
                        position={[0, 0, 0.11]}
                        rotation={[0, 0, 0]}
                        scale={1.0}
                        map={texture}
                    />
                </RoundedBox>

                {/* Dynamic Backlight */}
                <pointLight position={[0, 0, -1]} distance={4} intensity={hovered ? 4 : 1} color={skill.color} />
            </group>
        </Float>
    );
};

export const TechStack = () => {
    return (
        <section className="h-[80vh] w-full relative overflow-hidden flex flex-col justify-center items-center" id="tech-stack">
            <div className="absolute top-20 z-10 text-center pointer-events-none mix-blend-overlay opacity-20">
                <h2 className="text-[12rem] md:text-[14rem] font-black text-white/5 tracking-tighter leading-none select-none">
                    ICONS
                </h2>
            </div>

            <div className="absolute inset-0 z-0">
                {/* 1.5 DPR for Performance/Quality Balance on Retina */}
                <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]} camera={{ position: [0, 0, 14], fov: 35 }}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} castShadow />
                    <pointLight position={[-10, -5, -10]} intensity={1} color="white" />

                    <Suspense fallback={null}>
                        <group position={[-0.5, 0.5, 0]}>
                            {PROFILE.skills && PROFILE.skills.map((skill, i) => {
                                const col = i % 4;
                                const row = Math.floor(i / 4);

                                const spacingX = 2.4;
                                const spacingY = 2.4;
                                const offsetX = -3.6;
                                const offsetY = 2.4;

                                const x = col * spacingX + offsetX;
                                const y = -(row * spacingY) + offsetY;

                                return (
                                    <TechTile
                                        key={skill.slug}
                                        skill={skill}
                                        position={[x, y, 0]}
                                    />
                                );
                            })}
                        </group>
                    </Suspense>

                    <Environment preset="studio" />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.2} />
                </Canvas>
            </div>
            <div className="absolute bottom-10 left-0 right-0 text-center z-10 pointer-events-none">
                <p className="text-white/40 text-sm uppercase tracking-[0.5em]">Interactive 3D Grid</p>
            </div>
        </section>
    );
};
