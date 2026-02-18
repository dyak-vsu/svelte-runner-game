import type { WorldConfig } from "../configs/types";
import type { Player } from "./player";
import type { HazardsState } from "./hazard";

export type ProjectileSource = "player" | "enemy";

export type Projectile = {
    id: number;
    source: ProjectileSource;

    x: number;
    y: number;

    vx: number;      // + вправо, - влево
    width: number;
    height: number;
};

export type ProjectilesState = {
    items: Projectile[];
    nextId: number;
};

export function createProjectilesState(): ProjectilesState {
    return { items: [], nextId: 1 };
}

export function spawnProjectile(
    state: ProjectilesState,
    p: Omit<Projectile, "id">
) {
    state.items = [...state.items, { ...p, id: state.nextId++ }];
}

export function spawnPlayerShot(
    state: ProjectilesState,
    x: number,
    y: number
) {
    spawnProjectile(state, {
        source: "player",
        x,
        y,
        vx: 900,
        width: 10,
        height: 4
    });
}

export function spawnEnemyShot(
    state: ProjectilesState,
    x: number,
    y: number
) {
    spawnProjectile(state, {
        source: "enemy",
        x,
        y,
        vx: -900,
        width: 10,
        height: 4
    });
}

export function updateProjectiles(state: ProjectilesState, dt: number, world: WorldConfig) {
    state.items = state.items
        .map((b) => ({ ...b, x: b.x + b.vx * dt }))
        .filter((b) => b.x + b.width > -50 && b.x < world.width + 50);
}

export function drawProjectiles(ctx: CanvasRenderingContext2D, state: ProjectilesState) {
    ctx.save();
    for (const b of state.items) {
        ctx.fillStyle = b.source === "player" ? "white" : "orange";
        ctx.fillRect(b.x, b.y, b.width, b.height);
    }
    ctx.restore();
}

function aabb(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export type ProjectileCollisionResult = {
    playerHitByEnemyProjectile: boolean;
    enemyProjectileHitId: number | null;
    removedHazardIds: number[];        // кого убили пули игрока
    removedProjectileIds: number[];    // какие пули удалить (попавшие)
};

/**
 * 1) enemy projectile -> player => playerHitByEnemyProjectile = true
 * 2) player projectile -> hazards (кроме cactus) => удаляем hazard + пулю
 *
 * Важно: функция НЕ стопает loop и НЕ меняет isGameOver — только считает результат.
 */
export function resolveProjectileCollisions(
    player: Player,
    hazards: HazardsState,
    projectiles: ProjectilesState,
    world: WorldConfig
): ProjectileCollisionResult {
    // enemy -> player
    for (const p of projectiles.items) {
        if (p.source !== "enemy") continue;

        const hit = aabb(
            p.x,
            p.y,
            p.width,
            p.height,
            player.positionX,
            player.feetY - player.height,
            player.width,
            player.height
        );

        if (hit) {
            return {
                playerHitByEnemyProjectile: true,
                enemyProjectileHitId: p.id,
                removedHazardIds: [],
                removedProjectileIds: []
            };
        }
    }

    //player -> hazards
    const removedHazardIds: number[] = [];
    const removedProjectileIds: number[] = [];

    for (const p of projectiles.items) {
        if (p.source !== "player") continue;

        for (const h of hazards.items) {
            if (h.kind === "cactus") continue;

            const hx = h.x;
            const hy = world.groundLevelY - h.height;

            const hit = aabb(p.x, p.y, p.width, p.height, hx, hy, h.width, h.height);
            if (!hit) continue;

            removedHazardIds.push(h.id);
            removedProjectileIds.push(p.id);
            break;
        }
    }

    return {
        playerHitByEnemyProjectile: false,
        enemyProjectileHitId: null,
        removedHazardIds,
        removedProjectileIds
    };
}

export function applyProjectileCollisionResult(
    hazards: HazardsState,
    projectiles: ProjectilesState,
    result: ProjectileCollisionResult
) {
    if (result.removedHazardIds.length) {
        const removed = new Set(result.removedHazardIds);
        hazards.items = hazards.items.filter((h) => !removed.has(h.id));
    }

    if (result.removedProjectileIds.length) {
        const removed = new Set(result.removedProjectileIds);
        projectiles.items = projectiles.items.filter((p) => !removed.has(p.id));
    }

    if (result.enemyProjectileHitId !== null) {
        const id = result.enemyProjectileHitId;
        projectiles.items = projectiles.items.filter((p) => p.id !== id);
    }
}