// ===== WORLD =====
export interface WorldConfig {
    width: number;
    height: number;
    gravity: number;
    groundY: number;
    baseSpeed: number;
    maxSpeed: number;
}

// ===== PLAYER =====
export interface PlayerConfig {
    startX: number;
    width: number;
    height: number;
    jumpVelocity: number;
    shootCooldownMs: number;
    maxLives: number;
}

// ===== DAMAGE =====
export interface DamageConfig {
    collision: number;
    enemyBullet: number;
}

// ===== SCORING =====
export interface ScoringConfig {
    distancePerSecond: number;
    killEnemy: number;
    collectCoin: number;
}

// ===== ROOT =====
export interface GameConfig {
    world: WorldConfig;
    player: PlayerConfig;
    damage: DamageConfig;
    scoring: ScoringConfig;
}
