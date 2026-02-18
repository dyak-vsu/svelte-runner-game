import type { WorldConfig, PlayerConfig} from "../configs/types";

export type Player = {
    positionX: number;
    feetY: number;
    width: number;
    height: number;
    verticalVelocity: number;
    maxLives: number;
    isOnGround: boolean;
};

export function createPlayer(worldConfig: WorldConfig, playerConfig: PlayerConfig): Player {
    return {
        positionX: playerConfig.positionX,
        feetY: worldConfig.groundLevelY,
        width: playerConfig.width,
        height: playerConfig.height,
        maxLives: playerConfig.maxLives,
        verticalVelocity: 0,
        isOnGround: true
    };
}

export function jump(player: Player, playerConfig: PlayerConfig) {
    if (!player.isOnGround) return;
    player.verticalVelocity = -playerConfig.jumpVelocity;
    player.isOnGround = false;
}

export function updatePlayer(player: Player, dt: number, worldConfig: WorldConfig) {
    player.verticalVelocity += worldConfig.gravity * dt;
    player.feetY += player.verticalVelocity * dt;

    if (player.feetY >= worldConfig.groundLevelY) {
        player.feetY = worldConfig.groundLevelY;
        player.verticalVelocity = 0;
        player.isOnGround = true;
    }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, player: Player) {
    // пока просто прямоугольник
    ctx.fillRect(player.positionX, player.feetY - player.height, player.width, player.height);
}
