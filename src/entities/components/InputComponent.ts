import { COMPONENT, Component } from ".";
import Vector from "vector";

export default abstract class InputComponent extends Component {
    public id: COMPONENT = "INPUT_COMPONENT";
    public type: COMPONENT = "INPUT_COMPONENT";

    public inputVector: Vector = new Vector(0, 0);

    public printDebug(): void {
        super.printDebug();

        console.log(`Input Vector: ${this.inputVector}`);
    }
}
