import { Sprite } from 'pixi.js';
import { v1 as uuid } from 'uuid';

import { Game } from 'Game';
import Vector from 'types/vector';
import { SYSTEM, System } from 'entities/systems';

export default class Entity {
    game: Game;
    id: string;
    sprite: Sprite;
    position: Vector;

    systems: Map<SYSTEM, System>

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.id = uuid();
        this.systems = new Map();
        this.position = pos;
    }

    start() {
        this.systems.forEach(system => {
            system.start(this);
        });
    }
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
        return system;
    }

    getSystem(type: SYSTEM) {
        return this.systems.get(type);
    }
}
