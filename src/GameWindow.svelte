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
    const damageConfig = config.damage;
    const scoringConfig = config.scoring;

    const WIDTH = worldConfig.width;
    const HEIGHT = worldConfig.height;
    const SPEED = worldConfig.baseSpeed;
    const HURT_COOLDOWN_SEC = 0.6;

    // ===== ASSET =====
    const bg = new Image();
    bg.src = "/bg-road.png";

    // ===== STATE =====
    let offsetX = 0;
    let player = createPlayer(worldConfig, playerConfig);
    let hazards = createHazardsState();
    let projectiles = createProjectilesState();
    let isGameOver = false;
    let lives = playerConfig.maxLives ?? 3;
    let hurtCooldownSec = 0;
    let score = 0;
    let distanceAcc = 0;


    function resetGame() {
        offsetX = 0;
        score = 0;
        distanceAcc = 0;
        player = createPlayer(worldConfig, playerConfig);
        hazards = createHazardsState();
        projectiles = createProjectilesState();
        lives = playerConfig.maxLives ?? 3;
        hurtCooldownSec = 0;
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

        distanceAcc += scoringConfig.distancePerSecond * dt;
        const add = Math.floor(distanceAcc);
        if (add > 0) {
            score += add;
            distanceAcc -= add;
        }

        offsetX -= SPEED * dt;
        hurtCooldownSec = Math.max(0, hurtCooldownSec - dt);

        updatePlayer(player, dt, worldConfig);
        updateHazards(hazards, dt, worldConfig, SPEED);

        // shoot
        for (const shooter of getReadyShooters(hazards)) {
            const shotX = shooter.x - 2;
            const shotY = worldConfig.groundLevelY - shooter.height + 16;
            spawnEnemyShot(projectiles, shotX, shotY);
            resetShooterCooldown(shooter);
        }

        updateProjectiles(projectiles, dt, worldConfig);

        // collisions
        if (hasHazardCollision(player, hazards, worldConfig)) {
            applyDamage(damageConfig.collision ?? 1);
            if (isGameOver) return;
        }

        const result = resolveProjectileCollisions(player, hazards, projectiles, worldConfig);

        addKillScore(result.removedHazardIds);

        if (result.playerHitByEnemyProjectile) {
            applyDamage(damageConfig.enemyBullet ?? 1);
        }

        applyProjectileCollisionResult(hazards, projectiles, result);
        if (isGameOver) return;

        // draw
        ctx!.clearRect(0, 0, WIDTH, HEIGHT);
        drawBackground(ctx!, bg, WIDTH, HEIGHT, offsetX);
        ctx!.fillRect(0, worldConfig.groundLevelY, WIDTH, 2);

        drawPlayer(ctx!, player);
        drawHazards(ctx!, hazards, worldConfig);
        drawProjectiles(ctx!, projectiles);
        ctx!.save();
        ctx!.fillStyle = "black";
        ctx!.font = "14px monospace";
        ctx!.fillText(`Lives: ${lives}`, 10, 18);
        ctx!.fillText(`Score: ${score}`, 10, 36);
        ctx!.restore();
    }

    function onShoot() {
        if (isGameOver) return;
        const x = player.positionX + player.width + 4;
        const y = player.feetY - player.height + 16;
        spawnPlayerShot(projectiles, x, y);
    }

    function addKillScore(removedHazardIds: number[]) {
        const killedIds = new Set(removedHazardIds);
        if (killedIds.size === 0) return;

        let kills = 0;
        for (const h of hazards.items) {
            if (killedIds.has(h.id) && h.kind !== "cactus") kills++;
        }
        score += kills * scoringConfig.killEnemy;
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

    function applyDamage(amount: number) {
        if (amount <= 0) return;
        if (hurtCooldownSec > 0) return; // уже “в броне”

        lives -= amount;
        hurtCooldownSec = HURT_COOLDOWN_SEC;

        if (lives <= 0) {
            isGameOver = true;
            loop.stop();
        }
    }

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
