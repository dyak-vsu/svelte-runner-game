<script lang="ts">
	import GameWindow from "./GameWindow.svelte";
	import type { GameApi } from "./game/types";

	let game = $state<GameApi | null>(null);
</script>

<GameWindow bind:api={game} />

<button onclick={() => game?.start()}>Start</button>
<button onclick={() => game?.stop()}>Stop</button>

