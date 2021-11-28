import { Entity } from "entities";
import Game from "Game";
import { removeItem } from "helpers/util";
import Area from "./Area";
import { Biome } from "./BiomeGrid";

export interface ExhibitSaveData {
    areaId: string;
    name: string;
    animals: string[];
}

export default class Exhibit {
    public biomeDistribution: Partial<Record<Biome, number>>;
    public size: number;
    public animals: Entity[];

    public constructor(public area?: Area, public name?: string) {
        this.animals = [];
    }

    public recalculate(): void {
        this.biomeDistribution = this.updateBiomes();
        this.size = this.area.getCells().length;
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

    public addAnimal(animal: Entity): void {
        this.animals.push(animal);
    }

    public removeAnimal(animal: Entity): void {
        removeItem(this.animals, animal);
    }

    public save(): ExhibitSaveData {
        return {
            areaId: this.area.id,
            name: this.name,
            animals: this.animals.map(animal => animal.id),
        };
    }

    public load(data: ExhibitSaveData): void {
        this.area = Game.world.getAreaById(data.areaId);
        this.name = data.name;
        this.animals = data.animals.map(animalId => Game.getEntityById(animalId));

        this.recalculate();
    }
}
