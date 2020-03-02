import Entity from "entities/Entity";
import { SYSTEM } from "entities/systems";

export default abstract class System {
    id: SYSTEM
    entity: Entity;

    start(entity: Entity) {
        this.entity = entity;
    }
    preUpdate(delta: number) {}
    update(delta: number){}
    postUpdate(delta: number) {}
    end() {}
}