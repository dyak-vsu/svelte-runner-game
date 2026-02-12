export type WorldConfig = {
    width: number;
    height: number;

    gravity: number;     // px/s^2
    groundLevelY: number;   // y уровня земли
    baseSpeed: number;   // px/s
    maxSpeed: number;    // px/s
};

export type PlayerConfig = {
    positionX: number;
    width: number;
    height: number;
    maxLives: number;
    jumpVelocity: number; // px/s
};

export type DamageConfig = {
    collision: number;
    enemyBullet: number;
};

export type ScoringConfig = {
    distancePerSecond: number;
    killEnemy: number;
    collectCoin: number;
};

export type GameConfig = {
    world: WorldConfig;
    player: PlayerConfig;
    damage: DamageConfig;
    scoring: ScoringConfig;
};
