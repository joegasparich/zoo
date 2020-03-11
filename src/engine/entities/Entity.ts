import { v1 as uuid } from 'uuid';

import { Game, Vector } from 'engine';
import { System } from './systems';

export default class Entity {
    game: Game;
    id: string;
    position: Vector;

    systems: Map<string, System>

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.id = uuid();
        this.systems = new Map();
        this.position = pos;
    }

    start() {}
    preUpdate(delta: number) {
        this.systems.forEach(system => {
            system.preUpdate(delta);
        });}
    update(delta: number) {
        this.systems.forEach(system => {
            system.update(delta);
        });
    }
    postUpdate(delta: number) {
        this.systems.forEach(system => {
            system.postUpdate(delta);
        });
    }
    remove() {
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

        system.start(this);
        return system;
    }

    getSystem(type: string) {
        return this.systems.get(type);
    }
}
