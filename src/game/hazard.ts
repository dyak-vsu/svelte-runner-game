import type { WorldConfig } from "../configs/types";
import {Player} from "./player";

export type HazardKind = "cactus" | "fighter" | "shooter";

type BaseHazard = {
    id: number;
    kind: HazardKind;

    x: number;
    width: number;
    height: number;

    extraSpeed: number; // 0 для кактуса, >0 для врагов
};

export type CactusHazard = BaseHazard & {
    kind: "cactus";
};

export type FighterHazard = BaseHazard & {
    kind: "fighter";
};

export type ShooterHazard = BaseHazard & {
    kind: "shooter";
    shootCooldownSec: number;
};

export type Hazard = CactusHazard | FighterHazard | ShooterHazard;

export type HazardsState = {
    items: Hazard[];
    nextId: number;
    timeToNextSpawnSec: number;
};

export function createHazardsState(): HazardsState {
    return { items: [], nextId: 1, timeToNextSpawnSec: 0.9 };
}

function randomRange(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function pickKind(): HazardKind {
    const r = Math.random();
    if (r < 0.55) return "cactus";
    if (r < 0.85) return "fighter";
    return "shooter";
}

function spawnHazard(state: HazardsState, world: WorldConfig) {
    const kind = pickKind();
    const id = state.nextId++;
    const x = world.width + 20;

    if (kind === "cactus") {
        state.items = [
            ...state.items,
            {
                id,
                kind: "cactus",
                x,
                width: Math.floor(randomRange(18, 38)),
                height: Math.floor(randomRange(26, 52)),
                extraSpeed: 0
            }
        ];
        return;
    }

    if (kind === "fighter") {
        state.items = [
            ...state.items,
            {
                id,
                kind: "fighter",
                x,
                width: 34,
                height: 44,
                extraSpeed: randomRange(0, 90)
            }
        ];
        return;
    }

    // shooter
    state.items = [
        ...state.items,
        {
            id,
            kind: "shooter",
            x,
            width: 30,
            height: 46,
            extraSpeed: randomRange(0, 40),
            shootCooldownSec: randomRange(0.2, 0.4)
        }
    ];
}

export function updateHazards(state: HazardsState, dt: number, world: WorldConfig, scrollSpeed: number) {
    state.items = state.items
        .map((h) => {
            const moved: Hazard = { ...h, x: h.x - (scrollSpeed + h.extraSpeed) * dt } as Hazard;

            // только shooter имеет cooldown
            if (moved.kind === "shooter") {
                moved.shootCooldownSec = Math.max(0, moved.shootCooldownSec - dt);
            }

            return moved;
        })
        .filter((h) => h.x + h.width > -80);

    state.timeToNextSpawnSec -= dt;
    if (state.timeToNextSpawnSec <= 0) {
        spawnHazard(state, world);
        state.timeToNextSpawnSec = randomRange(0.75, 1.35);
    }
}

export function drawHazards(ctx: CanvasRenderingContext2D, state: HazardsState, world: WorldConfig) {
    for (const h of state.items) {
        const y = world.groundLevelY - h.height;
        ctx.fillStyle = h.kind === "cactus" ? "black" : h.kind === "fighter" ? "red" : "purple";
        ctx.fillRect(h.x, y, h.width, h.height);
    }
}

export function getReadyShooters(state: HazardsState): ShooterHazard[] {
    return state.items.filter((h): h is ShooterHazard => h.kind === "shooter" && h.shootCooldownSec <= 0);
}

export function resetShooterCooldown(shooter: ShooterHazard) {
    shooter.shootCooldownSec = 0.3 + Math.random() * 0.3;
}

export function hasHazardCollision(player: Player, state: HazardsState, world: WorldConfig): boolean {
    const pLeft = player.positionX;
    const pRight = player.positionX + player.width;
    const pTop = player.feetY - player.height;
    const pBottom = player.feetY;

    for (const h of state.items) {
        const hLeft = h.x;
        const hRight = h.x + h.width;
        const hTop = world.groundLevelY - h.height;
        const hBottom = world.groundLevelY;

        const overlap =
            pLeft < hRight &&
            pRight > hLeft &&
            pTop < hBottom &&
            pBottom > hTop;

        if (overlap) return true;
    }
    return false;
}