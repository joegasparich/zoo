import { COMPONENT, Component } from "entities/components";
import Game from "Game";
import Vector from "vector";
import { Entity } from "..";
import { ComponentSaveData } from "./Component";

export interface SolidComponentSaveData extends ComponentSaveData {
    size: number[];
}

export default class SolidComponent extends Component {
    public id: COMPONENT = "SOLID_COMPONENT";
    public type: COMPONENT = "SOLID_COMPONENT";

    public constructor(public size = new Vector(1, 1)) {
        super();
    }

    public start(entity: Entity): void {
        super.start(entity);

        for (let i=0; i < this.size.x; i++) {
            for (let j=0; j < this.size.y; j++) {
                Game.map.setTileSolid(this.entity.position.floor().add(new Vector(i, j)), true);
            }
        }
    }

    public end(): void {
        for (let i=0; i < this.size.x; i++) {
            for (let j=0; j < this.size.y; j++) {
                Game.map.setTileSolid(this.entity.position.floor().add(new Vector(i, j)), false);
            }
        }
    }

    public save(): SolidComponentSaveData {
        return {
            ...super.save(),
            size: Vector.Serialize(this.size),
        };
    }

    public load(data: SolidComponentSaveData): void {
        this.size = Vector.Deserialize(data.size);
    }
}
