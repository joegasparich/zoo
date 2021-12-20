import { State } from "state";
import { ANIMAL_BEHAVIOUR_STATE } from "./animal";
import { GUEST_BEHAVIOUR_STATE } from "./guest";

export interface Behaviour extends State {
    id: ANIMAL_BEHAVIOUR_STATE | GUEST_BEHAVIOUR_STATE;
}
