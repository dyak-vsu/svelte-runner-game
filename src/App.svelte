<script lang="ts">
	import {drawBackground} from "./game/drawBackground";
	import { createRafLoop } from "./game/raf";
	import { onDestroy } from "svelte";

	let canvas = $state<HTMLCanvasElement | null>(null);
	let ctx = $state<CanvasRenderingContext2D | null>(null);

	const WIDTH = 800;
	const HEIGHT = 200;

	let offsetX = 0;
	const SPEED = 100;


	let bg = new Image();
	bg.src = "/bg-road.png";

	function init() {
		ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;
	}

	const loop = createRafLoop((dt) => {
		offsetX -= SPEED * dt;
		drawBackground(ctx, bg, WIDTH, HEIGHT, offsetX);
	});

	$effect(() => {
		init();
	})

	bg.onload = () => {
		if (ctx) {
			loop.start();
		}
	};

	onDestroy(() => loop.stop());
</script>

<main>
	<canvas bind:this={canvas} width={WIDTH} height={HEIGHT} ></canvas>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		margin-top: 40px;
	}

	canvas {
		border: 1px solid #ccc;
		image-rendering: pixelated;
	}
</style>

