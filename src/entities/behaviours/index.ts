import { State } from "state";

import IdleBehaviour from "./IdleBehaviour";
import ConsumeBehaviour from "./ConsumeBehaviour";

export type BEHAVIOUR_STATE = "IDLE" | "CONSUME";

export interface BehaviourData {
    id: BEHAVIOUR_STATE;
}

export interface Behaviour extends State {
    id: BEHAVIOUR_STATE;
}

export function createBehaviour(behaviour: BehaviourData): Behaviour {
    switch (behaviour.id) {
        case "IDLE":
            return new IdleBehaviour();
        case "CONSUME":
            return new ConsumeBehaviour();
        default:
            return undefined;
    }
}

export { IdleBehaviour, ConsumeBehaviour };
