import SpriteSheet, { SpriteSheetData } from "./SpriteSheet";

export interface TileSetData extends SpriteSheetData {
    path: string;
    tiles: TileData[];
}

export interface TileData {
    id: number;
    solid: boolean;
}

export default class Tileset extends SpriteSheet {
    tiles: Map<number, TileData>;

    constructor(data: TileSetData) {
        super(data);

        this.tiles = new Map();
        data.tiles.forEach(tile => {
            this.tiles.set(tile.id, tile);
        });
    }

    getTileData(id: number): TileData {
        return this.tiles.get(id);
    }
}
