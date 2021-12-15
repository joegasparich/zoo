import Vector from "vector";

export enum Class {
    Mammal = "Mammal"
}

export enum ConservationStatus {
    NearThreatened = "Near Threatened"
}

export enum Location {
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

export enum TileObjectType {
    Foliage = "foliage",
    Building = "building",
    Consumable = "consumable"
}

export interface TileObjectData {
    name: string;
    solid: boolean;
    pivot: Vector;
    scale?: number;
    size: Vector;
    sprite: string;
    canPlaceOnSlopes: boolean;
    canPlaceInWater: boolean;
    type: TileObjectType;
}

export enum ConsumableType {
    Thirst = "thirst",
    Hunger = "hunger",
    Energy = "energy"
}

export enum ConsumerType {
    Animal = "animal",
    Guest = "guest",
    Staff = "staff",
}

export interface ConsumableData extends TileObjectData {
    consumableType: ConsumableType,
    consumer: ConsumerType
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
