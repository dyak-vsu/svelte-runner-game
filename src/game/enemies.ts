import type { WorldConfig } from "../configs/types";
import type { Player } from "./player";

export type EnemyType = "fighter" | "shooter";

export type Enemy = {
    id: number;
    type: EnemyType;
    x: number;
    width: number;
    height: number;
    extraSpeed: number; // доп. скорость к scrollSpeed (влево)
};

export type EnemiesState = {
    items: Enemy[];
    nextId: number;
    timeToNextSpawnSec: number;
};

export function createEnemiesState(): EnemiesState {
    return {
        items: [],
        nextId: 1,
        timeToNextSpawnSec: 1.6
    };
}

function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}

export function updateEnemies(
    state: EnemiesState,
    dt: number,
    world: WorldConfig,
    scrollSpeed: number
) {
    // move + cleanup
    state.items = state.items
        .map((e) => ({ ...e, x: e.x - (scrollSpeed + e.extraSpeed) * dt }))
        .filter((e) => e.x + e.width > -80);

    // spawn
    state.timeToNextSpawnSec -= dt;
    if (state.timeToNextSpawnSec <= 0) {
        spawnEnemy(state, world);
        state.timeToNextSpawnSec = randomRange(1.2, 2.2);
    }
}

function spawnEnemy(state: EnemiesState, world: WorldConfig) {
    const type: EnemyType = Math.random() < 0.5 ? "fighter" : "shooter";

    // размеры чуть разные (для интереса)
    const width = type === "fighter" ? 34 : 30;
    const height = type === "fighter" ? 44 : 46;

    state.items = [
        ...state.items,
        {
            id: state.nextId++,
            type,
            x: world.width + 20,
            width,
            height,
            extraSpeed: type === "fighter" ? randomRange(0, 90) : randomRange(0, 40)
        }
    ];
}

export function drawEnemies(
    ctx: CanvasRenderingContext2D,
    state: EnemiesState,
    world: WorldConfig
) {
    ctx.save();
    ctx.fillStyle = "red";
    for (const e of state.items) {
        const topY = world.groundLevelY - e.height;
        ctx.fillRect(e.x, topY, e.width, e.height);
    }
    ctx.restore();
}

export function hasEnemyCollision(
    player: Player,
    state: EnemiesState,
    world: WorldConfig
): boolean {
    const pLeft = player.positionX;
    const pRight = player.positionX + player.width;
    const pTop = player.feetY - player.height;
    const pBottom = player.feetY;

    for (const e of state.items) {
        const eLeft = e.x;
        const eRight = e.x + e.width;
        const eTop = world.groundLevelY - e.height;
        const eBottom = world.groundLevelY;

        const overlap =
            pLeft < eRight &&
            pRight > eLeft &&
            pTop < eBottom &&
            pBottom > eTop;

        if (overlap) return true;
    }
    return false;
}
