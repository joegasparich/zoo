import { v1 as uuid } from "uuid";

import { Game, Vector } from "engine";
import { System } from "./systems";

export default class Entity {
    public game: Game;
    public id: string;
    public position: Vector;

    private systems: Map<string, System>;

    private hasStarted: boolean;

    public constructor(game: Game, pos: Vector) {
        this.game = game;
        this.id = uuid();
        this.systems = new Map();
        this.position = pos;

        this.game.registerEntity(this);
    }

    public start(): void {
        this.hasStarted = true;

        this.systems.forEach(system => system.start(this));
    }

    public preUpdate(delta: number): void {
        this.systems.forEach(system => {
            system.preUpdate(delta);
        });
    }

    public update(delta: number): void {
        this.systems.forEach(system => {
            system.update(delta);
        });
    }

    public postUpdate(delta: number): void {
        this.systems.forEach(system => {
            system.postUpdate(delta);
        });
    }

    public remove(): void {
        this.systems.forEach(system => {
            system.end();
        });
        this.game.deleteEntity(this.id);
    }

    public addSystem<T extends System>(system: T): T {
        if (this.systems.has(system.id)) {
            return system;
        }

        this.systems.set(system.id, system);

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
}
