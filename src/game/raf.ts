export type FrameCallback = (dt: number) => void;

export function createRafLoop(onFrame: FrameCallback) {
    let rafId: number | null = null;
    let lastTime = 0;

    function frame(timeMs: number) {
        if (lastTime === 0) lastTime = timeMs;

        const dt = (timeMs - lastTime) / 1000;
        lastTime = timeMs;

        onFrame(dt);

        rafId = requestAnimationFrame(frame);
    }

    return {
        start() {
            if (rafId !== null) return;
            lastTime = 0;
            rafId = requestAnimationFrame(frame);
        },

        stop() {
            if (rafId === null) return;
            cancelAnimationFrame(rafId);
            rafId = null;
        },

        isRunning() {
            return rafId !== null;
        }
    };
}
