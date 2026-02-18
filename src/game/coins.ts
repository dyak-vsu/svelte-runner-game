import type { WorldConfig } from "../configs/types";
import type { Player } from "./player";

export type Coin = {
    id: number;
    x: number;
    y: number;
    radius: number;
};

export type CoinsState = {
    items: Coin[];
    nextId: number;
    timeToNextSpawnSec: number;
};

export function createCoinsState(): CoinsState {
    return {
        items: [],
        nextId: 1,
        timeToNextSpawnSec: 1.5
    };
}

function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}

export function updateCoins(
    state: CoinsState,
    dt: number,
    world: WorldConfig,
    scrollSpeed: number
) {
    // движение влево
    state.items = state.items
        .map(c => ({ ...c, x: c.x - scrollSpeed * dt }))
        .filter(c => c.x + c.radius > -20);

    // таймер спавна
    state.timeToNextSpawnSec -= dt;
    if (state.timeToNextSpawnSec <= 0) {
        spawnCoin(state, world);
        state.timeToNextSpawnSec = randomRange(1.0, 2.5);
    }
}

function spawnCoin(state: CoinsState, world: WorldConfig) {
    const groundY = world.groundLevelY;

    const isAir = Math.random() < 0.5;

    const y = isAir
        ? groundY - randomRange(40, 90)
        : groundY - 20;

    state.items.push({
        id: state.nextId++,
        x: world.width + 20,
        y,
        radius: 8
    });
}

export function drawCoins(ctx: CanvasRenderingContext2D, state: CoinsState) {
    ctx.save();
    ctx.fillStyle = "gold";

    for (const c of state.items) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

export function resolveCoinCollection(
    player: Player,
    state: CoinsState
): number[] {
    const collectedIds: number[] = [];

    const pLeft = player.positionX;
    const pRight = player.positionX + player.width;
    const pTop = player.feetY - player.height;
    const pBottom = player.feetY;

    for (const c of state.items) {
        const left = c.x - c.radius;
        const right = c.x + c.radius;
        const top = c.y - c.radius;
        const bottom = c.y + c.radius;

        const overlap =
            pLeft < right &&
            pRight > left &&
            pTop < bottom &&
            pBottom > top;

        if (overlap) collectedIds.push(c.id);
    }

    return collectedIds;
}

export function removeCollectedCoins(
    state: CoinsState,
    collectedIds: number[]
) {
    const set = new Set(collectedIds);
    state.items = state.items.filter(c => !set.has(c.id));
}
