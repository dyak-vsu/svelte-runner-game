<script lang="ts">
    import { onDestroy } from "svelte";
    import { drawBackground } from "./game/drawBackground";
    import { createPlayer, updatePlayer, drawPlayer, jump } from "./game/player";
    import { createRafLoop } from "./game/raf";

    import {
        createHazardsState,
        updateHazards,
        drawHazards,
        getReadyShooters,
        resetShooterCooldown,
        hasHazardCollision
    } from "./game/hazard";

    import {
        createProjectilesState,
        updateProjectiles,
        drawProjectiles,
        spawnEnemyShot,
        spawnPlayerShot,
        resolveProjectileCollisions,
        applyProjectileCollisionResult
    } from "./game/projectiles";

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
    const SPEED = worldConfig.baseSpeed;

    // ===== ASSET =====
    const bg = new Image();
    bg.src = "/bg-road.png";

    // ===== STATE =====
    let offsetX = 0;
    let player = createPlayer(worldConfig, playerConfig);
    let hazards = createHazardsState();
    let projectiles = createProjectilesState();
    let isGameOver = false;

    function resetGame() {
        offsetX = 0;
        player = createPlayer(worldConfig, playerConfig);
        hazards = createHazardsState();
        projectiles = createProjectilesState();
        isGameOver = false;
    }

    function init() {
        ctx = canvas!.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
    }

    function ready(): boolean {
        return !!ctx && bg.naturalWidth > 0;
    }

    function tick(dt: number) {
        if (isGameOver) return;

        offsetX -= SPEED * dt;

        updatePlayer(player, dt, worldConfig);
        updateHazards(hazards, dt, worldConfig, SPEED);

        // shooters shoot
        for (const shooter of getReadyShooters(hazards)) {
            const shotX = shooter.x - 2;
            const shotY = worldConfig.groundLevelY - shooter.height + 16;
            spawnEnemyShot(projectiles, shotX, shotY);
            resetShooterCooldown(shooter);
        }

        updateProjectiles(projectiles, dt, worldConfig);

        // collisions
        if (hasHazardCollision(player, hazards, worldConfig)) {
            isGameOver = true;
            loop.stop();
            return;
        }
        const result = resolveProjectileCollisions(player, hazards, projectiles, worldConfig);

        if (result.playerHitByEnemyProjectile) {
            isGameOver = true;
            loop.stop();
            return;
        }

        applyProjectileCollisionResult(hazards, projectiles, result);

        // draw
        ctx!.clearRect(0, 0, WIDTH, HEIGHT);
        drawBackground(ctx!, bg, WIDTH, HEIGHT, offsetX);
        ctx!.fillRect(0, worldConfig.groundLevelY, WIDTH, 2);

        drawPlayer(ctx!, player);
        drawHazards(ctx!, hazards, worldConfig);
        drawProjectiles(ctx!, projectiles);
    }

    function onShoot() {
        if (isGameOver) return;
        const x = player.positionX + player.width + 4;
        const y = player.feetY - player.height + 16;
        spawnPlayerShot(projectiles, x, y);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.code === "Space" || e.code === "ArrowUp") {
            e.preventDefault();
            if (!isGameOver) jump(player, playerConfig);
        }

        if (e.code === "KeyX") {
            onShoot();
        }

        if (e.code === "KeyR") {
            resetGame();
            loop.start();
        }
    }

    function onPointerDown() {
        if (!isGameOver) jump(player, playerConfig);
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
        resetGame();
        // автозапуск по желанию:
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

<canvas
        bind:this={canvas}
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
