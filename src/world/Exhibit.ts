import { Config } from "consts";
import { WorldEvent } from "consts/events";
import { Entity } from "entities";
import Game from "Game";
import Graphics from "Graphics";
import { removeItem } from "helpers/util";
import Mediator from "Mediator";
import { TileObjectData } from "types/AssetTypes";
import Vector from "vector";
import Area from "./Area";
import { Biome } from "./BiomeGrid";
import { ZOO_AREA } from "./World";

export interface ExhibitSaveData {
    areaId: string;
    animals: string[];
}

export default class Exhibit {
    public biomeDistribution: Partial<Record<Biome, number>>;
    public size: number;
    public animals: Entity[];
    public foliage: TileObjectData[];
    public hilliness: number;
    public waterness: number;
    public viewingArea: Vector[];
    public viewingAreaHighlighted = false;

    private biomeListener: string;
    private placeTileObjectListener: string;
    private deleteTileObjectListener: string;
    private elevationListener: string;
    private areaListener: string;

    public constructor(public area?: Area) {
        this.animals = [];

        this.biomeListener = Mediator.on(WorldEvent.BIOMES_UPDATED, () => {
            this.biomeDistribution = this.updateBiomes();
        });
        this.placeTileObjectListener = Mediator.on(WorldEvent.PLACE_TILE_OBJECT, () => {
            this.foliage = this.updateFoliage();
        });
        this.deleteTileObjectListener = Mediator.on(WorldEvent.DELETE_TILE_OBJECT, () => {
            this.foliage = this.updateFoliage();
        });
        this.elevationListener = Mediator.on(WorldEvent.ELEVATION_UPDATED, () => {
            [this.hilliness, this.waterness] = this.updateElevation();
        });
        this.areaListener = Mediator.on(WorldEvent.AREAS_UPDATED, () => {
            this.recalculate();
        });
    }

    public postUpdate(): void {
        if (this.viewingAreaHighlighted) this.highlightViewingArea();
    }

    public recalculate(): void {
        this.biomeDistribution = this.updateBiomes();
        this.size = this.area.getCells().length;
        this.foliage = this.updateFoliage();
        [this.hilliness, this.waterness] = this.updateElevation();
        this.viewingArea = this.updateViewingArea();
    }

    public updateBiomes(): Partial<Record<Biome, number>> {
        const count: Partial<Record<Biome, number>> = {};
        let totalBiomes = 0;

        this.area.getCells().forEach(cell => {
            const biomes = Game.world.biomeGrid.getBiomesInMapCell(cell.position);
            totalBiomes += biomes.length;
            biomes.forEach(biome => {
                if (!count[biome]) {
                    count[biome] = 1;
                } else {
                    count[biome] += 1;
                }
            });
        });

        Object.keys(count).forEach((key) => {
            const biome = +key as Biome;
            count[biome] = count[biome] / totalBiomes;
        });

        return count;
    }

    public updateElevation(): [hill: number, water: number] {
        let hilliness = 0;
        let waterness = 0;

        this.area.getCells().forEach(cell => {
            if (Game.world.waterGrid.isPositionWater(cell.position)) {
                waterness++;
            } else if (Game.world.elevationGrid.isPositionSloped(cell.position)) {
                hilliness++;
            }
        });

        return [hilliness / this.size, waterness / this.size];
    }

    public updateFoliage(): TileObjectData[] {
        const foliage: TileObjectData[] = [];

        this.area.getCells().forEach(cell => {
            const tileObj = Game.world.getTileObjectAtPos(cell.position)?.getComponent("TILE_OBJECT_COMPONENT");
            if (tileObj?.data?.isFoliage) {
                foliage.push(tileObj.data);
            }
        });

        return foliage;
    }

    public updateViewingArea(): Vector[] {
        const viewingArea: Vector[] = [];

        this.area.getCells().forEach(cell => {
            Game.map.getAdjacentCells(cell.position).forEach(adjCell => {
                if (Game.map.isPositionInMap(adjCell.position)
                 && Game.world.getAreaAtPosition(adjCell.position).id === ZOO_AREA) {
                    if (!viewingArea.find(i => i.toString() === cell.position.toString())) {
                        viewingArea.push(adjCell.position);
                    }
                }
            });
        });

        return viewingArea;
    }

    public addAnimal(animal: Entity): void {
        this.animals.push(animal);
    }

    public removeAnimal(animal: Entity): void {
        removeItem(this.animals, animal);

        if (this.animals.length === 0) {
            this.delete();
        }
    }

    public delete(): void {
        this.animals.forEach(animal => {
            animal.getComponent("ANIMAL_BEHAVIOUR_COMPONENT").findExhibit();
        });

        Mediator.unsubscribe(WorldEvent.BIOMES_UPDATED, this.biomeListener);
        Mediator.unsubscribe(WorldEvent.PLACE_TILE_OBJECT, this.placeTileObjectListener);
        Mediator.unsubscribe(WorldEvent.DELETE_TILE_OBJECT, this.deleteTileObjectListener);
        Mediator.unsubscribe(WorldEvent.ELEVATION_UPDATED, this.elevationListener);
        Mediator.unsubscribe(WorldEvent.AREAS_UPDATED, this.areaListener);

        Game.world.deleteExhibitByAreaId(this.area.id);
    }

    public save(): ExhibitSaveData {
        return {
            areaId: this.area.id,
            animals: this.animals.map(animal => animal.id),
        };
    }

    public load(data: ExhibitSaveData): void {
        this.area = Game.world.getAreaById(data.areaId);
        this.animals = data.animals.map(animalId => Game.getEntityById(animalId));

        this.recalculate();
    }

    public highlightViewingArea(): void {
        this.viewingArea?.forEach(cell => {
            const worldCellPos = cell.multiply(Config.WORLD_SCALE);
            Graphics.setLineStyle(0);
            Graphics.drawRect(worldCellPos.x, worldCellPos.y, Config.WORLD_SCALE, Config.WORLD_SCALE, this.area.colour, 0.5);
        });
    }
}
