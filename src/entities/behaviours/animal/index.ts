import IdleBehaviour from "./IdleBehaviour";
import ConsumeBehaviour from "./ConsumeBehaviour";
import { Behaviour } from "..";

export type ANIMAL_BEHAVIOUR_STATE = "IDLE" | "CONSUME";

export interface BehaviourData {
    id: ANIMAL_BEHAVIOUR_STATE;
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
