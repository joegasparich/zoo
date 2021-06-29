import { Entity } from "entities";

export interface ComponentSaveData {
    id: string;
    disabled: boolean;
}

export default abstract class Component {
    public id: string;
    public type: string;
    public entity: Entity;

    public disabled: boolean;
    protected hasStarted: boolean;

    public start(entity: Entity): void {
        this.entity = entity;
        this.hasStarted = true;
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
}
