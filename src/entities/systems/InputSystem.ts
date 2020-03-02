import { System } from ".";
import Vector from "types/vector";

export default abstract class InputSystem extends System {
    inputVector: Vector = new Vector(0, 0);
}