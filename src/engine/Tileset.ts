import { TileSetData, TileData } from "./map";

export default class Tileset {
    texture: PIXI.Texture;
    rows: number;
    cols: number;
    tileSize: number;
    tiles: Map<number, TileData>;

    constructor(data: TileSetData) {
        if (!data.image) {
            console.error("Tried to create tileset with no texture");
            return null;
        }

        this.texture = data.image;
        this.rows = Math.floor(data.height / data.tileSize);
        this.cols = Math.floor(data.width / data.tileSize);
        this.tileSize = data.tileSize;

        this.tiles = new Map();
        data.tiles.forEach(tile => {
            this.tiles.set(tile.id, tile);
        });
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

    getTileData(id: number): TileData {
        return this.tiles.get(id);
    }

    getTileTexture(id: number): PIXI.Texture {
        this.texture.frame = this.getRectFromIndex(id);
        return this.texture.clone();
    }
}
