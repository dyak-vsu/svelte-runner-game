<script lang="ts">
    import { drawBackground } from "./game/drawBackground";
    import { createRafLoop } from "./game/raf";
    import { onDestroy } from "svelte";

    type GameApi = { start: () => void; stop: () => void };
    let { api = $bindable<GameApi>() } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let ctx: CanvasRenderingContext2D | null = null;

    //Preload
    const bg = new Image();
    bg.src = "/bg-road.png";

    //Config init
    const WIDTH = 800;
    const HEIGHT = 200;
    const SPEED = 600;

    let offsetX = 0;

    function init() {
        ctx = canvas!.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
    }

    function ready(): boolean {
        return !!ctx && bg.naturalWidth > 0;
    }

    function tick(dt: number) {
        offsetX -= SPEED * dt;
        ctx!.clearRect(0, 0, WIDTH, HEIGHT);
        drawBackground(ctx!, bg, WIDTH, HEIGHT, offsetX);
    }

    const loop = createRafLoop((dt) => {
        if (!ready()) return;
        tick(dt);
    });

    $effect(() => {
        if (!canvas || ctx) return;
        init();
    });

    bg.onload = () => {
        offsetX = 0;
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
