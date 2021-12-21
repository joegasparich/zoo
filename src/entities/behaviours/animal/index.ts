import IdleBehaviour from "./IdleBehaviour";
import ConsumeBehaviour from "./ConsumeBehaviour";
import { Behaviour } from "..";
import { AnimalBehaviourComponent } from "entities/components";

export type ANIMAL_BEHAVIOUR_STATE = "IDLE" | "CONSUME";

export interface BehaviourData {
    id: ANIMAL_BEHAVIOUR_STATE;
}

export function createBehaviour(behaviour: BehaviourData, animal: AnimalBehaviourComponent): Behaviour {
    switch (behaviour.id) {
        case "IDLE":
            return new IdleBehaviour(animal);
        case "CONSUME":
            return new ConsumeBehaviour(animal);
        default:
            return undefined;
    }
}

export { IdleBehaviour, ConsumeBehaviour };
