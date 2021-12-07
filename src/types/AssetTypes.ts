import Vector from "vector";

enum Class {
    Mammal = "Mammal"
}

enum ConservationStatus {
    NearThreatened = "Near Threatened"
}

enum Location {
    Africa = "Africa"
}

type Range = [min: number, max: number];

export interface AnimalData {
    id: string;
    assetPath: string;
    sprite: string;
    name: string;
    species: string;
    class: Class;
    conservationStatus: ConservationStatus;
    location: Location[];
    weight: { // in kg
        male: Range;
        female: Range;
        newborn: Range;
    }
    habitat: string[]; // TODO: Define better
    foliage: Range; // Percentage of tiles to have foliage on
    diet: string[]; // TODO: Define better
    sociability: Range; // Preferred herd size
    space: number; // Number of tiles needed per animal
    lifespan: number; // Lifespan in years
    gestationPeriod: number; // Gestation time in months
    offspringCount: Range | number; // Number of offspring in a given pregnancy
    pubertyLength: number; // Time till adulthood in months
}

export interface TileObjectData {
    name: string;
    solid: boolean;
    pivot: Vector;
    size: Vector;
    sprite: string;
    canPlaceOnSlopes: boolean;
    canPlaceInWater: boolean;
    isFoliage: boolean;
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
