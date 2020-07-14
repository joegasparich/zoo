import { Vector } from "engine";
import { InputSystem } from "engine/entities/systems";

import Actor, { ActorStateInput } from "entities/Actor";
import Inputs from "constants/inputs";

export default class PlayerInputSystem extends InputSystem {
    public id = "PLAYER_INPUT_SYSTEM";

    public update(delta: number): void {
        super.update(delta);

        const actor = this.entity as Actor;

        this.inputVector = new Vector(
            +this.game.input.isInputHeld(Inputs.Right) - +this.game.input.isInputHeld(Inputs.Left),
            +this.game.input.isInputHeld(Inputs.Down) - +this.game.input.isInputHeld(Inputs.Up),
        ).truncate(1);

        // Movement
        if (this.game.input.isInputHeld(Inputs.Up) ||
            this.game.input.isInputHeld(Inputs.Down) ||
            this.game.input.isInputHeld(Inputs.Left) ||
            this.game.input.isInputHeld(Inputs.Right) &&
            !(this.game.input.isInputHeld(Inputs.Up) && this.game.input.isInputHeld(Inputs.Down)) &&
            !(this.game.input.isInputHeld(Inputs.Left) && this.game.input.isInputHeld(Inputs.Right))
        ) {
            actor.state.handleInput(ActorStateInput.MOVE);
        }

        if (!this.game.input.isInputHeld(Inputs.Up) &&
            !this.game.input.isInputHeld(Inputs.Down) &&
            !this.game.input.isInputHeld(Inputs.Left) &&
            !this.game.input.isInputHeld(Inputs.Right)
        ) {
            actor.state.handleInput(ActorStateInput.STILL);
        }
    }
}
