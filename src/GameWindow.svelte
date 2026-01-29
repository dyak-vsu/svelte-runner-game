<script lang="ts">
    import { onDestroy } from "svelte";
    import { drawBackground } from "./game/drawBackground";
    import { createPlayer, updatePlayer, drawPlayer, jump } from "./game/player";
    import { createObstaclesState, updateObstacles, drawObstacles, hasCollision } from "./game/obstacles";
    import { createRafLoop } from "./game/raf";
    import { createEnemiesState, updateEnemies, drawEnemies, hasEnemyCollision } from "./game/enemies";


    import { defaultGameConfig } from "./configs/defaultGame";

    type GameApi = { start: () => void; stop: () => void };
    let { api = $bindable<GameApi>() } = $props();

    let canvas = $state<HTMLCanvasElement | null>(null);
    let ctx: CanvasRenderingContext2D | null = null;

    // ===== CONFIG =====
    const config = defaultGameConfig;
    const worldConfig = config.world;
    const playerConfig = config.player;

    const WIDTH = worldConfig.width;
    const HEIGHT = worldConfig.height;

    // Сейчас используем baseSpeed как скорость скролла
    const SPEED = worldConfig.baseSpeed;

    // ===== ASSET =====
    const bg = new Image();
    bg.src = "/bg-road.png";

    // ===== STATE =====
    let offsetX = 0;
    let player = createPlayer(worldConfig, playerConfig);
    let obstacles = createObstaclesState();
    let enemies = createEnemiesState();
    let isGameOver = false;

    function init() {
        ctx = canvas!.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
    }

    function ready(): boolean {
        return !!ctx && bg.naturalWidth > 0;
    }

    function tick(dt: number) {
        offsetX -= SPEED * dt;

        updatePlayer(player, dt, worldConfig);
        updateObstacles(obstacles, dt, worldConfig, SPEED);
        updateEnemies(enemies, dt, worldConfig, SPEED);

        ctx!.clearRect(0, 0, WIDTH, HEIGHT);
        drawBackground(ctx!, bg, WIDTH, HEIGHT, offsetX);

        // земля (линия)
        ctx!.fillRect(0, worldConfig.groundLevelY, WIDTH, 2);

        // игрок
        drawPlayer(ctx!, player);
        drawObstacles(ctx!, obstacles, worldConfig);
        drawEnemies(ctx!, enemies, worldConfig);

        if (hasCollision(player, obstacles, worldConfig)) {
            console.log("COLLISION! stopping loop", { running: loop.isRunning?.() });
            isGameOver = true;
            loop.stop();
            console.log("AFTER stop", { running: loop.isRunning?.() });
            return; // <-- ВАЖНО
        }

        if (hasCollision(player, obstacles, worldConfig) || hasEnemyCollision(player, enemies, worldConfig)) {
            isGameOver = true;
            loop.stop();
            return;
        }
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            jump(player, playerConfig);
        }
    }

    function onPointerDown() {
        jump(player, playerConfig);
    }

    const loop = createRafLoop((dt) => {
        if (!ready()) return;
        tick(dt);
    });

    $effect(() => {
        if (!canvas || ctx) return;
        init();
        window.addEventListener("keydown", onKeyDown);
    });

    bg.onload = () => {
        offsetX = 0;
        player = createPlayer(worldConfig, playerConfig);
        obstacles = createObstaclesState();
        enemies = createEnemiesState();
        isGameOver = false;
        if (ctx) loop.start();
    };

    api = {
        start: () => loop.start(),
        stop: () => loop.stop()
    };

    onDestroy(() => {
        loop.stop();
        window.removeEventListener("keydown", onKeyDown);
    });
</script>

<canvas bind:this={canvas}
        width={WIDTH}
        height={HEIGHT}
        onpointerdown={onPointerDown}>
</canvas>

<style>
    canvas {
        border: 1px solid #ccc;
        image-rendering: pixelated;
        touch-action: manipulation;
    }
</style>
