<script lang="ts">
    import GameWindow from "./GameWindow.svelte";
    import type { GameApi } from "./game/types";

    let game = $state<GameApi | null>(null);
</script>

<div class="layout">
    <div class="game-area">
        <GameWindow bind:api={game} />
    </div>

    <div class="controls">
        <button onclick={() => game?.restart()}>Start</button>
        <button onclick={() => game?.jump()}>Jump</button>
        <button onclick={() => game?.shoot()}>Shoot</button>
    </div>
</div>

<style>
    .layout {
        height: 100vh;
        display: grid;
        grid-template-rows: 2fr 1fr;
        gap: 16px;
        padding: 16px;
        box-sizing: border-box;
    }

    .game-area {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .controls {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    button {
        padding: 12px 24px;
        font-size: 16px;
    }
</style>
