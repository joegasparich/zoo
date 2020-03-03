export default class Tileset {
    texture: PIXI.Texture;
    rows: number;
    cols: number;
    tileWidth: number;
    tileHeight: number;

    constructor(texture: PIXI.Texture, tileWidth: number, tileHeight: number) {
        this.texture = texture;
        this.rows = Math.floor(texture.width / tileWidth);
        this.cols = Math.floor(texture.height / tileHeight);
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    private getRectFromIndex(index: number): PIXI.Rectangle {
        const row = Math.min(index % this.rows, this.rows - 1);
        const col = Math.min(Math.floor(index / this.cols), this.cols - 1);

        return new PIXI.Rectangle(
            row * this.tileWidth,
            col * this.tileHeight,
            this.tileWidth,
            this.tileHeight
        )
    }

    getTile(index: number): PIXI.Texture {
        this.texture.frame = this.getRectFromIndex(index);
        return this.texture.clone();
    }
}
