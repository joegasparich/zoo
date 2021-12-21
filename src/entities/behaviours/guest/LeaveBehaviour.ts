import { GuestComponent } from "entities/components";
import Game from "Game";
import Vector from "vector";
import { GUEST_BEHAVIOUR_STATE } from ".";
import { Behaviour } from "..";

export default class LeaveBehaviour implements Behaviour {
    public id: GUEST_BEHAVIOUR_STATE = "LEAVE";

    public constructor(private guest: GuestComponent) {}

    public exit(): void {
        this.guest.pathfinder?.clearPath();
    }

    public update(delta: number): void {
        if (!this.guest.pathfinder.hasPath()) {
            this.guest.pathfinder.pathTo(Game.zoo.entrance.position);
        } else {
            if (this.guest.pathfinder.followPath()) {
                // TODO: Tell the zoo we left
                this.guest.entity.remove();
            }
            this.guest.inputVector =
                this.guest.pathfinder.currentTarget?.subtract(this.guest.entity.position).normalize() ?? Vector.Zero();
        }
    }
}
