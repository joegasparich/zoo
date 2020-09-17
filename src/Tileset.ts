import SpriteSheet, { SpriteSheetData } from "./SpriteSheet";

export interface TileSetData extends SpriteSheetData {
    path: string;
    tiles: TileData[];
}

export interface TileData {
    id: number;
    solid: boolean;
}

export default class TileSet extends SpriteSheet {
    public tiles: Map<number, TileData>;

    public constructor(data: TileSetData) {
        super(data);

        this.tiles = new Map();
        data.tiles.forEach(tile => {
            this.tiles.set(tile.id, tile);
        });
    }

    public getTileData(id: number): TileData {
        return this.tiles.get(id);
    }
}
