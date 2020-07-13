import { Entity } from "engine/entities";

export default abstract class System {
    id: string;
    entity: Entity;

    protected hasStarted: boolean;

    start(entity: Entity): void {
        this.entity = entity;
        this.hasStarted = true;
    }
    preUpdate(delta: number): void {}
    update(delta: number): void {}
    postUpdate(delta: number): void {}
    end(): void {}
}
