<script lang="ts">
    import { drawBackground } from "./game/drawBackground";
    import { createRafLoop } from "./game/raf";
    import { onDestroy } from "svelte";

    let { api = $bindable<{
        start: () => void;
        stop: () => void;
    }>() } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let ctx: CanvasRenderingContext2D | null = null;

    const WIDTH = 800;
    const HEIGHT = 200;

    let offsetX = 0;
    const SPEED = 120;

    const bg = new Image();
    bg.src = "/bg-road.png";

    function init() {
        ctx = canvas!.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
    }

    const loop = createRafLoop((dt) => {
        if (!ctx || bg.naturalWidth === 0) return;
        offsetX -= SPEED * dt;
        drawBackground(ctx, bg, WIDTH, HEIGHT, offsetX);
    });

    $effect(() => {
        if (!canvas || ctx) return;
        init();

        if (bg.complete && bg.naturalWidth > 0) {
            loop.start();
        }
    });

    bg.onload = () => {
        if (ctx) loop.start();
    };

    api = {
        start: () => loop.start(),
        stop: () => loop.stop()
    };

    onDestroy(() => loop.stop());
</script>

<canvas bind:this={canvas} width={WIDTH} height={HEIGHT}></canvas>

<style>
    canvas {
        border: 1px solid #ccc;
        image-rendering: pixelated;
    }
</style>
