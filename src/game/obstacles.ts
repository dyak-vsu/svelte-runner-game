import type { WorldConfig } from "../configs/types";
import type { Player } from "./player";

export type Obstacle = {
    id: number;
    x: number;
    width: number;
    height: number;
};

export type ObstaclesState = {
    items: Obstacle[];
    timeToNextSpawnSec: number;
    nextId: number;
};

export function createObstaclesState(): ObstaclesState {
    return {
        items: [],
        timeToNextSpawnSec: 0.8,
        nextId: 1
    };
}

function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}

export function updateObstacles(
    state: ObstaclesState,
    dt: number,
    world: WorldConfig,
    scrollSpeed: number
) {
    // move
    state.items = state.items
        .map((o) => ({ ...o, x: o.x - scrollSpeed * dt }))
        .filter((o) => o.x + o.width > -50);

    // spawn timer
    state.timeToNextSpawnSec -= dt;
    if (state.timeToNextSpawnSec <= 0) {
        spawnObstacle(state, world);

        // следующая задержка
        state.timeToNextSpawnSec = randomRange(0.55, 1.8);
    }
}

function spawnObstacle(state: ObstaclesState, world: WorldConfig) {
    const width = Math.floor(randomRange(18, 38));
    const height = Math.floor(randomRange(26, 52));

    state.items = [
        ...state.items,
        {
            id: state.nextId++,
            x: world.width + 20,
            width,
            height
        }
    ];
}

export function drawObstacles(ctx: CanvasRenderingContext2D, state: ObstaclesState, world: WorldConfig) {
    for (const o of state.items) {
        const topY = world.groundLevelY - o.height;
        ctx.fillRect(o.x, topY, o.width, o.height);
    }
}

export function hasCollision(player: Player, state: ObstaclesState, world: WorldConfig): boolean {
    // Player box
    const pLeft = player.positionX;
    const pRight = player.positionX + player.width;
    const pTop = player.feetY - player.height;
    const pBottom = player.feetY;
    console.log("P", { x: player.positionX, y: player.feetY, w: player.width, h: player.height }, "O0", state.items[0]);


    for (const o of state.items) {
        const oLeft = o.x;
        const oRight = o.x + o.width;
        const oTop = world.groundLevelY - o.height;
        const oBottom = world.groundLevelY;

        const overlap =
            pLeft < oRight &&
            pRight > oLeft &&
            pTop < oBottom &&
            pBottom > oTop;

        if (overlap) return true;
    }
    return false;
}
