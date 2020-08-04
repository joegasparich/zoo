import { System } from ".";
import { Vector } from "engine";

export default abstract class InputSystem extends System {
    public inputVector: Vector = new Vector(0, 0);
}
