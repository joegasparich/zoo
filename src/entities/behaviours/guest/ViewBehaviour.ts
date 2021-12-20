import { AnimalBehaviourComponent, GuestComponent } from "entities/components";
import { randomBool } from "helpers/math";
import Vector from "vector";
import { GUEST_BEHAVIOUR_STATE, BehaviourData } from ".";
import { Behaviour } from "..";
import IdleBehaviour from "./IdleBehaviour";

interface ViewData extends BehaviourData {
    viewingTile: number[];
    exhibitId: string;
}

export default class ViewBehaviour implements Behaviour {
    public id: GUEST_BEHAVIOUR_STATE = "VIEW";

    public constructor(private viewingTile?: Vector, private exhibitId?: string) {}

    public async update(delta: number, guest: GuestComponent): Promise<void> {
        if (!this.viewingTile) {
            guest.stateMachine.setState(new IdleBehaviour());
            guest.inputVector = Vector.Zero();
            return;
        }
        if (!guest.pathfinder.hasPath()) {
            const hasPath = await guest.pathfinder.pathTo(this.viewingTile);
            if (!hasPath) {
                guest.stateMachine.setState(new IdleBehaviour());
                guest.inputVector = Vector.Zero();
                return;
            }
        }

        if (guest.pathfinder.hasPath()) {
            if (guest.pathfinder.followPath()) {
                guest.setExhibitVisited(this.exhibitId);
                guest.stateMachine.setState(new IdleBehaviour());
                guest.inputVector = Vector.Zero();
            }
            guest.inputVector =
                guest.pathfinder.currentTarget?.subtract(guest.entity.position).normalize() ?? Vector.Zero();
        }
    }

    public save(): ViewData {
        return {
            id: this.id,
            viewingTile: Vector.Serialize(this.viewingTile),
            exhibitId: this.exhibitId,
        };
    }

    public load(data: ViewData): void {
        this.viewingTile = Vector.Deserialize(data.viewingTile);
        this.exhibitId = data.exhibitId;
    }
}
