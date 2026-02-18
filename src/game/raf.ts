export type FrameCallback = (dt: number) => void;

export function createRafLoop(onFrame: FrameCallback) {
    let rafId: number | null = null;
    let lastTime = 0;
    let running = false;

    function frame(timeMs: number) {
        if (!running) return;

        if (lastTime === 0) lastTime = timeMs;

        const dt = (timeMs - lastTime) / 1000;
        lastTime = timeMs;

        onFrame(dt);

        // планируем следующий кадр ТОЛЬКО если всё ещё running
        if (running) {
            rafId = requestAnimationFrame(frame);
        }
    }

    return {
        start() {
            if (running) return;
            running = true;
            lastTime = 0;
            rafId = requestAnimationFrame(frame);
        },

        stop() {
            running = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        },

        isRunning() {
            return running;
        }
    };
}
