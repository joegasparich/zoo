import { Entity } from "engine/entities";

export default abstract class System {
    id: string
    entity: Entity;

    start(entity: Entity) {
        this.entity = entity;
    }
    preUpdate(delta: number) {}
    update(delta: number){}
    postUpdate(delta: number) {}
    end() {}
}