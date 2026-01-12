import type {
    WorldConfig,
    PlayerConfig,
    DamageConfig,
    ScoringConfig,
    GameConfig,
} from "./types";


export const worldConfig: WorldConfig = {
    width: 800,
    height: 200,
    gravity: 2400,
    groundY: 170,
    baseSpeed: 120,
    maxSpeed: 600,
};

export const playerConfig: PlayerConfig = {
    startX: 80,
    width: 32,
    height: 48,
    jumpVelocity: 900,
    shootCooldownMs: 250,
    maxLives: 3,
};

export const damageConfig: DamageConfig = {
    collision: 1,
    enemyBullet: 1,
};

export const scoringConfig: ScoringConfig = {
    distancePerSecond: 10,
    killEnemy: 50,
    collectCoin: 25,
};

/* =======================
   DEFAULT GAME CONFIG
   ======================= */

export const defaultGameConfig: GameConfig = {
    world: worldConfig,
    player: playerConfig,
    damage: damageConfig,
    scoring: scoringConfig,
};