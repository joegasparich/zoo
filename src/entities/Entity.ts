import { Config } from "consts";
import Game from "Game";
import Graphics from "Graphics";
import { v1 as uuid } from "uuid";
import Vector from "vector";

import { COMPONENT, Component, ComponentType, createComponent } from "./components";
import { ComponentSaveData } from "./components/Component";

export interface EntitySaveData {
    id: string;
    position: number[];
    componentData: ComponentSaveData[];
}

export default class Entity {
    public id: string;
    public exists: boolean;

    private componentIdMap: Map<string, Component>; // This is a map to id
    private componentTypeMap: Map<string, Component>; // This is a map to type

    private hasStarted: boolean;

    public constructor(public position: Vector, public saveable = true) {
        this.id = uuid();
        this.componentIdMap = new Map();
        this.componentTypeMap = new Map();

        Game.registerEntity(this);
        this.exists = true;
    }

    public start(): void {
        this.hasStarted = true;

        this.componentTypeMap.forEach(component => component.start(this));
    }

    public preUpdate(delta: number): void {
        this.componentTypeMap.forEach(component => {
            if (!component.disabled) component.preUpdate(delta);
        });
    }

    public update(delta: number): void {
        this.componentTypeMap.forEach(component => {
            if (!component.disabled) component.update(delta);
        });
    }

    public postUpdate(delta: number): void {
        this.componentTypeMap.forEach(component => {
            if (!component.disabled) component.postUpdate(delta);
        });
    }

    public remove(): void {
        this.componentTypeMap.forEach(component => {
            component.end();
        });
        Game.unregisterEntity(this.id);
        this.exists = false;
    }

    public addComponent<T extends Component>(component: T): T {
        if (this.componentTypeMap.has(component.type)) {
            return component;
        }

        this.componentTypeMap.set(component.type, component);
        this.componentIdMap.set(component.id, component);

        if (this.hasStarted) {
            component.start(this);
        }
        return component;
    }

    public removeComponent(componentId: COMPONENT): void {
        if (this.componentIdMap.has(componentId)) {
            const component = this.componentIdMap.get(componentId);
            component.end();
            this.componentIdMap.delete(componentId);
            this.componentTypeMap.delete(component.type);
        }
    }

    public getComponent<T extends COMPONENT>(type: T): ComponentType<T> {
        return (
            (this.componentIdMap.get(type) as ComponentType<T>) ?? (this.componentTypeMap.get(type) as ComponentType<T>)
        );
    }

    public getAllComponents(): Component[] {
        return Array.from(this.componentTypeMap.values());
    }

    public save(): EntitySaveData {
        return {
            id: this.id,
            position: Vector.Serialize(this.position),
            componentData: Array.from(this.componentTypeMap.values()).map(component => component.save()),
        };
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

    public drawDebug(): void {
        Graphics.setLineStyle(0.5, 0xffffff);
        Graphics.drawCircle(this.position.multiply(Config.WORLD_SCALE), 2, 0xffffff);
    }
}
