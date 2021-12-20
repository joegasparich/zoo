import IdleBehaviour from "./IdleBehaviour";
import { Behaviour } from "..";

export type GUEST_BEHAVIOUR_STATE = "IDLE" | "VIEW";

export interface BehaviourData {
    id: GUEST_BEHAVIOUR_STATE;
}

export function createBehaviour(behaviour: BehaviourData): Behaviour {
    switch (behaviour.id) {
        case "IDLE":
            return new IdleBehaviour();
        default:
            return undefined;
    }
}

export { IdleBehaviour };
