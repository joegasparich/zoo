import { AnimalBehaviourComponent } from "entities/components";
import { randomBool } from "helpers/math";
import Vector from "vector";
import { ANIMAL_BEHAVIOUR_STATE, BehaviourData } from ".";
import { Behaviour } from "..";

const RANDOM_MOVE_INTERVAL = 5000;

interface IdleData extends BehaviourData {
    timer: number;
}

export default class IdleBehaviour implements Behaviour {
    public id: ANIMAL_BEHAVIOUR_STATE = "IDLE";

    private timer = 0;

    public constructor(private animal: AnimalBehaviourComponent) {}

    public exit(): void {
        this.animal.pathfinder?.clearPath();
        this.animal.inputVector = Vector.Zero();
    }

    public update(delta: number): void {
        // Move randomly
        const currentTime = new Date().getTime();
        if (currentTime > this.timer) {
            if (randomBool()) {
                this.animal.pathfinder.pathTo(this.animal.exhibit?.area.getRandomPos());
            } else {
                this.animal.pathfinder.clearPath();
                this.animal.inputVector = Vector.Zero();
            }
            this.timer = currentTime + RANDOM_MOVE_INTERVAL;
        }

        if (this.animal.pathfinder.hasPath()) {
            this.animal.pathfinder.followPath();
            this.animal.inputVector =
                this.animal.pathfinder.currentTarget?.subtract(this.animal.entity.position).normalize() ??
                Vector.Zero();
        }
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
