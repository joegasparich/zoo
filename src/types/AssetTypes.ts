import { Vector } from "engine";
import { Collider } from "engine/managers";

export interface TileObjectData {
    name: string;
    solid: boolean;
    collider: Collider;
    width: number;
    height: number;
    pivot: Vector;
    sprite: string;
}

export interface GroundTileData {
    name: string;
    tileset: string;
    variants: number[];
    solid: boolean;
}

export interface WallData {
    name: string;
    type: string;
    spriteSheet: string;
    cellHeight: number;
    cellWidth: number;
    solid: boolean;
}
