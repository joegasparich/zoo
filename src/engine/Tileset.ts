import { TileSetData } from "./map";

export default class Tileset {
    texture: PIXI.Texture;
    rows: number;
    cols: number;
    tileSize: number;

    constructor(data: TileSetData) {
        if (!data.image) {
            console.error("Tried to create tileset with no texture");
            return null;
        }

        this.texture = data.image;
        this.rows = Math.floor(data.height / data.tileSize);
        this.cols = Math.floor(data.width / data.tileSize);
        this.tileSize = data.tileSize;
    }

    private getRectFromIndex(index: number): PIXI.Rectangle {
        const row = Math.min(index % this.cols, this.cols - 1);
        const col = Math.min(Math.floor(index / this.cols), this.rows - 1);

        return new PIXI.Rectangle(
            row * this.tileSize,
            col * this.tileSize,
            this.tileSize,
            this.tileSize,
        );
    }

    getTile(index: number): PIXI.Texture {
        this.texture.frame = this.getRectFromIndex(index);
        return this.texture.clone();
    }
}
