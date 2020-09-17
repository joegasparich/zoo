import { v1 as uuid } from "uuid";

import { Game, Vector } from "engine";
import { System } from "./systems";
import { SystemSaveData } from "./systems/System";

export interface EntitySaveData {
    id: string;
    position: number[];
    systemData: SystemSaveData[];
}

export default class Entity {
    public game: Game;
    public id: string;

    private systems: Map<string, System>;

    private hasStarted: boolean;

    public constructor(game: Game, public position: Vector, public saveable = true) {
        this.game = game;
        this.id = uuid();
        this.systems = new Map();

        this.game.registerEntity(this);
    }

    public start(): void {
        this.hasStarted = true;

        this.systems.forEach(system => system.start(this));
    }

    public preUpdate(delta: number): void {
        this.systems.forEach(system => {
            if(!system.disabled) system.preUpdate(delta);
        });
    }

    public update(delta: number): void {
        this.systems.forEach(system => {
            if(!system.disabled) system.update(delta);
        });
    }

    public postUpdate(delta: number): void {
        this.systems.forEach(system => {
            if(!system.disabled) system.postUpdate(delta);
        });
    }

    public remove(): void {
        this.systems.forEach(system => {
            system.end();
        });
        this.game.unregisterEntity(this.id);
    }

    public addSystem<T extends System>(system: T): T {
        if (this.systems.has(system.type)) {
            return system;
        }

        this.systems.set(system.type, system);

        if (this.hasStarted) {
            system.start(this);
        }
        return system;
    }

    public removeSystem(systemId: string): void {
        if (this.systems.has(systemId)) {
            this.systems.get(systemId).end();
            this.systems.delete(systemId);
        }
    }

    public getSystem(type: string): System {
        return this.systems.get(type);
    }

    public save(): EntitySaveData {
        return {
            id: this.id,
            position: Vector.Serialize(this.position),
            systemData: Array.from(this.systems.values()).map(system => system.save()),
        };
    }

    public load(data: EntitySaveData, systems: System[]): void {
        this.id = data.id;
        this.position = Vector.Deserialize(data.position);
    }
}
