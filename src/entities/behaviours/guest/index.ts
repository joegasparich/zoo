import { Behaviour } from "..";
import IdleBehaviour from "./IdleBehaviour";
import ViewBehaviour from "./ViewBehaviour";
import LeaveBehaviour from "./LeaveBehaviour";
import { GuestComponent } from "entities/components";

export type GUEST_BEHAVIOUR_STATE = "IDLE" | "VIEW" | "LEAVE";

export interface BehaviourData {
    id: GUEST_BEHAVIOUR_STATE;
}

export function createBehaviour(behaviour: BehaviourData, guest: GuestComponent): Behaviour {
    switch (behaviour.id) {
        case "IDLE":
            return new IdleBehaviour(guest);
        case "VIEW":
            return new ViewBehaviour(guest);
        case "LEAVE":
            return new LeaveBehaviour(guest);
        default:
            return undefined;
    }
}

export { IdleBehaviour, ViewBehaviour, LeaveBehaviour };
