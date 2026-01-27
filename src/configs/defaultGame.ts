import type { GameConfig } from "./types";

export const defaultGameConfig: GameConfig = {
    world: {
        width: 800,
        height: 200,
        gravity: 2400,
        groundLevelY: 170,
        baseSpeed: 300,
        maxSpeed: 600
    },
    player: {
        positionX: 80,
        width: 44,
        height: 48,
        jumpVelocity: 800,
    },
    damage: { collision: 1, enemyBullet: 1 },
    scoring: { distancePerSecond: 10, killEnemy: 50, collectCoin: 25 }
};
