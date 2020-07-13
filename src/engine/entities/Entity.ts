import { v1 as uuid } from "uuid";

import { Game, Vector } from "engine";
import { System } from "./systems";

export default class Entity {
    game: Game;
    id: string;
    position: Vector;

    systems: Map<string, System>;

    private hasStarted: boolean;

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.id = uuid();
        this.systems = new Map();
        this.position = pos;

        this.game.registerEntity(this);
    }

    start(): void {
        this.hasStarted = true;

        this.systems.forEach(system => system.start(this));
    }

    preUpdate(delta: number): void {
        this.systems.forEach(system => {
            system.preUpdate(delta);
        });
    }

    update(delta: number): void {
        this.systems.forEach(system => {
            system.update(delta);
        });
    }

    postUpdate(delta: number): void {
        this.systems.forEach(system => {
            system.postUpdate(delta);
        });
    }

    remove(): void {
        this.systems.forEach(system => {
            system.end();
        });
        this.game.deleteEntity(this.id);
    }

    addSystem<T extends System>(system: T): T {
        if (this.systems.has(system.id)) {
            return system;
        }

        this.systems.set(system.id, system);

        if (this.hasStarted) {
            system.start(this);
        }
        return system;
    }

    getSystem(type: string): System {
        return this.systems.get(type);
    }
}
