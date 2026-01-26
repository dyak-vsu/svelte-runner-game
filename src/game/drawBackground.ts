export function drawBackground(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    width: number,
    height: number,
    offsetX: number
): void {
    const imgW = image.width;
    let leadingOffsetX = -(-offsetX % imgW)
    let followingOffsetX = leadingOffsetX + imgW

    ctx.drawImage(image, leadingOffsetX, height - (height * 0.2));
    ctx.drawImage(image, followingOffsetX, height - (height * 0.2));
}
