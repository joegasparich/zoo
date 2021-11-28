import { State } from "state";

import IdleBehaviour from "./Idle";

export type BEHAVIOUR_STATE =
      "IDLE";

export interface BehaviourData {
    id: BEHAVIOUR_STATE
}

export interface Behaviour extends State {
    id: BEHAVIOUR_STATE;
}

export function createBehaviour(behaviour: BehaviourData): Behaviour {
    switch(behaviour.id) {
        case "IDLE": return new IdleBehaviour();
        default: return undefined;
    }
}

export {
    IdleBehaviour,
};
