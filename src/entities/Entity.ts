import Game from "Game";
import { v1 as uuid } from "uuid";
import Vector from "vector";

import { Component, createComponent } from "./components";
import { ComponentSaveData } from "./components/Component";

export interface EntitySaveData {
    id: string;
    position: number[];
    componentData: ComponentSaveData[];
}

export default class Entity {
    public id: string;

    private components: Map<string, Component>;

    private hasStarted: boolean;

    public constructor(public position: Vector, public saveable = true) {
        this.id = uuid();
        this.components = new Map();

        Game.registerEntity(this);
    }

    public start(): void {
        this.hasStarted = true;

        this.components.forEach(component => component.start(this));
    }

    public preUpdate(delta: number): void {
        this.components.forEach(component => {
            if(!component.disabled) component.preUpdate(delta);
        });
    }

    public update(delta: number): void {
        this.components.forEach(component => {
            if(!component.disabled) component.update(delta);
        });
    }

    public postUpdate(delta: number): void {
        this.components.forEach(component => {
            if(!component.disabled) component.postUpdate(delta);
        });
    }

    public remove(): void {
        this.components.forEach(component => {
            component.end();
        });
        Game.unregisterEntity(this.id);
    }

    public addComponent<T extends Component>(component: T): T {
        if (this.components.has(component.type)) {
            return component;
        }

        this.components.set(component.type, component);

        if (this.hasStarted) {
            component.start(this);
        }
        return component;
    }

    public removeComponent(componentId: string): void {
        if (this.components.has(componentId)) {
            this.components.get(componentId).end();
            this.components.delete(componentId);
        }
    }

    public getComponent(type: string): Component {
        return this.components.get(type);
    }

    public save(): EntitySaveData {
        return {
            id: this.id,
            position: Vector.Serialize(this.position),
            componentData: Array.from(this.components.values()).map(component => component.save()),
        };
    }

    public load(data: EntitySaveData, components: Component[]): void {
        this.id = data.id;
        this.position = Vector.Deserialize(data.position);
    }

    public static loadEntity(data: EntitySaveData): Entity {
        const entity = new Entity(Vector.Deserialize(data.position), true);
        entity.id = data.id;

        data.componentData.forEach(componentData => {
            const component = createComponent(componentData);
            if (!component) return;

            entity.addComponent(component);
            component.load(componentData);
        });

        return entity;
    }
}
