import { AnimalBehaviourComponent } from "entities/components";
import { randomBool } from "helpers/math";
import Vector from "vector";
import { Behaviour, BehaviourData, BEHAVIOUR_STATE } from ".";

const RANDOM_MOVE_INTERVAL = 5000;

interface IdleData extends BehaviourData {
    timer: number;
}

export default class IdleBehaviour implements Behaviour {
    public id: BEHAVIOUR_STATE = "IDLE";
    private timer = 0;

    public update(delta: number, animal: AnimalBehaviourComponent): void {
        // Move randomly
        const currentTime = new Date().getTime();
        if (currentTime > this.timer) {
            if (randomBool()) {
                animal.pathfinder.pathTo(animal.exhibit.area.getRandomPos());
            } else {
                animal.pathfinder.resetPath();
                animal.inputVector = Vector.Zero();
            }
            this.timer = currentTime + RANDOM_MOVE_INTERVAL;
        }

        if (animal.pathfinder.hasPath()) {
            animal.pathfinder.followPath();
            animal.inputVector = animal.pathfinder.currentTarget?.subtract(animal.entity.position).normalize() ?? Vector.Zero();
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
