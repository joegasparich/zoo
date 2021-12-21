import { GuestComponent } from "entities/components";
import Game from "Game";
import { randomBool } from "helpers/math";
import { randomItem } from "helpers/util";
import Vector from "vector";
import { ZOO_AREA } from "world/World";
import { BehaviourData, GUEST_BEHAVIOUR_STATE } from ".";
import { Behaviour } from "..";

const RANDOM_MOVE_INTERVAL = 5000;
const WANDER_DIST = 5;

interface IdleData extends BehaviourData {
    timer: number;
}

export default class IdleBehaviour implements Behaviour {
    public id: GUEST_BEHAVIOUR_STATE = "IDLE";

    private timer = 0;

    public constructor(private guest: GuestComponent) {}

    public exit(): void {
        this.guest.pathfinder?.clearPath();
        this.guest.inputVector = Vector.Zero();
    }

    public update(delta: number): void {
        // Move randomly
        const currentTime = new Date().getTime();
        if (currentTime > this.timer) {
            if (randomBool()) {
                this.guest.pathfinder.pathTo(this.getRandomNearbyPos());
            } else {
                this.guest.pathfinder.clearPath();
                this.guest.inputVector = Vector.Zero();
            }
            this.timer = currentTime + RANDOM_MOVE_INTERVAL;
        }

        if (this.guest.pathfinder.hasPath()) {
            this.guest.pathfinder.followPath();
            this.guest.inputVector =
                this.guest.pathfinder.currentTarget?.subtract(this.guest.entity.position).normalize() ?? Vector.Zero();
        }
    }

    private getRandomNearbyPos(): Vector {
        let currentPos = this.guest.entity.position.floor();
        let nearbyTiles = [];
        for (let i = -WANDER_DIST; i < WANDER_DIST; i++) {
            for (let j = -WANDER_DIST; j < WANDER_DIST; j++) {
                const pos = currentPos.add(new Vector(i, j));
                if (
                    Game.map.isPositionInMap(pos) &&
                    Game.map.isTileFree(pos) &&
                    Game.world.getAreaAtPosition(pos).id === ZOO_AREA
                ) {
                    nearbyTiles.push(pos);
                }
            }
        }

        const pathedTiles = nearbyTiles.filter(pos => !!Game.world.pathGrid.getPathAtTile(pos));

        return randomItem(pathedTiles.length ? pathedTiles : nearbyTiles);
    }

    public save(): IdleData {
        return {
            id: this.id,
            // TODO: do we need some kind of game time which all timers work off of
            timer: this.timer - new Date().getTime(),
        };
    }

    public load(data: IdleData): void {
        this.timer = new Date().getTime() + data.timer;
    }
}
