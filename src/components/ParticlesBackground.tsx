import React, { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";
import { IOptions, RecursivePartial } from "tsparticles-engine";

const ParticlesBackground: React.FC = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const options: RecursivePartial<IOptions> = useMemo(() => ({
        fullScreen: {
            enable: true,
            zIndex: 0, // Behind main content which is z-10
        },
        background: {
            color: {
                value: "transparent",
            },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onHover: {
                    enable: true,
                    mode: "grab",
                },
                // Removed onClick push for a more subtle effect
            },
            modes: {
                grab: {
                    distance: 140,
                    links: {
                        opacity: 0.6,
                    }
                },
            },
        },
        particles: {
            color: {
                value: "#67e8f9", // text-accent (a light neon-cyan)
            },
            links: {
                color: "#a78bfa", // bright-violet
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "out",
                },
                random: true,
                speed: 0.3, // Slower speed
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 1200, // Increased area for fewer particles
                },
                value: 40, // Reduced value for fewer particles
            },
            opacity: {
                value: { min: 0.1, max: 0.4 }, // slightly less max opacity
                animation: {
                    enable: true,
                    speed: 1,
                    sync: false
                }
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 2 }, // Smaller particles
            },
        },
        detectRetina: true,
    }), []);

    return (
        <Particles
            id="tsparticles-background"
            init={particlesInit}
            options={options}
        />
    );
};

export default ParticlesBackground;