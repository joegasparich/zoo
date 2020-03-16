import { Entity } from "engine/entities";

export default abstract class System {
    id: string;
    entity: Entity;

    start(entity: Entity): void {
        this.entity = entity;
    }
    preUpdate(delta: number): void {}
    update(delta: number): void {}
    postUpdate(delta: number): void {}
    end(): void {}
}
