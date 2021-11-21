import { Collider } from "managers";
import Vector from "vector";

export interface TileObjectData {
    name: string;
    solid: boolean;
    collider: Collider;
    pivot: Vector;
    size: Vector;
    sprite: string;
    canPlaceOnSlopes: boolean;
    canPlaceInWater: boolean;
}

export interface GroundTileData {
    name: string;
    tileset: string;
    variants: number[];
    solid: boolean;
}

export interface WallData {
    assetPath: string;
    name: string;
    type: string;
    spriteSheet: string;
    cellHeight: number;
    cellWidth: number;
    solid: boolean;
}

export interface PathData {
    assetPath: string;
    name: string;
    spriteSheet: string;
    cellHeight: number;
    cellWidth: number;
}
