export interface TileObjectData {
    name: string;
    solid: boolean;
    width: number;
    height: number;
    sprite: string;
}

export interface GroundTileData {
    name: string;
    tileset: string;
    variants: number[];
    solid: boolean;
}
