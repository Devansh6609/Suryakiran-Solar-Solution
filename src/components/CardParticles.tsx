import React, { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";
import { IOptions, RecursivePartial } from "tsparticles-engine";

const CardParticles: React.FC = () => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    const options: RecursivePartial<IOptions> = useMemo(() => ({
        fullScreen: {
            enable: false, // This is crucial to contain it
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
            },
            modes: {
                grab: {
                    distance: 100,
                    links: {
                        opacity: 0.8,
                    }
                },
            },
        },
        particles: {
            color: {
                value: "#a78bfa", // bright-violet
            },
            links: {
                color: "#06b6d4", // neon-cyan
                distance: 120,
                enable: true,
                opacity: 0.2,
                width: 1,
            },
            collisions: {
                enable: false,
            },
            move: {
                direction: "none",
                enable: true,
                outModes: {
                    default: "out",
                },
                random: true,
                speed: 0.3,
                straight: false,
            },
            number: {
                density: {
                    enable: true,
                    area: 600, // smaller area for fewer particles
                },
                value: 30, // fewer particles for a smaller space
            },
            opacity: {
                value: { min: 0.1, max: 0.5 },
            },
            shape: {
                type: "circle",
            },
            size: {
                value: { min: 1, max: 2 },
            },
        },
        detectRetina: true,
    }), []);

    return (
        <Particles
            id="card-tsparticles"
            init={particlesInit}
            options={options}
            className="absolute top-0 left-0 w-full h-full z-0"
        />
    );
};

export default CardParticles;