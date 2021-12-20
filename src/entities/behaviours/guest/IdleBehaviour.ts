import { GuestComponent } from "entities/components";
import { BehaviourData, GUEST_BEHAVIOUR_STATE } from ".";
import { Behaviour } from "..";

export default class IdleBehaviour implements Behaviour {
    public id: GUEST_BEHAVIOUR_STATE = "IDLE";

    public update(delta: number, guest: GuestComponent): void {
        // TODO: Move randomly
    }

    public save(): BehaviourData {
        return {
            id: this.id,
        };
    }

    public load(data: BehaviourData): void {}
}
