import { Entity } from "entities";
import { COMPONENT } from ".";

export interface ComponentSaveData {
    id: COMPONENT;
    disabled: boolean;
}

export default abstract class Component {
    public id: COMPONENT;
    public type: COMPONENT;
    public requires: COMPONENT[] = [];
    public entity: Entity;

    public disabled: boolean;
    protected hasStarted: boolean;

    public start(entity: Entity): void {
        this.entity = entity;
        this.hasStarted = true;

        for (const component of this.requires) {
            if (!entity.getComponent(component)) {
                console.error(`${this.id} requires ${component}`);
            }
        }
    }
    public preUpdate(delta: number): void {}
    public update(delta: number): void {}
    public postUpdate(delta: number): void {}
    public end(): void {}

    public save(): ComponentSaveData {
        return {
            id: this.id,
            disabled: this.disabled,
        };
    }
    public load(data: ComponentSaveData): void {
        this.id = data.id;
        this.disabled = data.disabled;
    }

    public printDebug(): void {}
}
