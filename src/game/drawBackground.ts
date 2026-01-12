export function drawBackground(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number,
    offsetX: number
): void {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, offsetX, height - (height * 0.2));
}
