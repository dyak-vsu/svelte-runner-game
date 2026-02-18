import type { GameConfig } from "./types";

export const defaultGameConfig: GameConfig = {
    world: {
        width: 1000,
        height: 300,
        gravity: 2400,
        groundLevelY: 250,
        baseSpeed: 600,
        maxSpeed: 600
    },
    player: {
        positionX: 80,
        maxLives: 3,
        width: 44,
        height: 48,
        jumpVelocity: 800,
    },
    damage: { collision: 1, enemyBullet: 1 },
    scoring: { distancePerSecond: 10, killEnemy: 50, collectCoin: 25 }
};
