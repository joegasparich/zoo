import { Vector } from "engine";
import { InputSystem, SYSTEM } from "engine/entities/systems";

import Actor, { ActorStateInput } from "entities/Actor";
import { Inputs } from "consts";
import ZooGame from "ZooGame";

export default class PlayerInputSystem extends InputSystem {
    public id = SYSTEM.INPUT_SYSTEM;

    public update(delta: number): void {
        super.update(delta);

        const actor = this.entity as Actor;

        this.inputVector = new Vector(
            +ZooGame.input.isInputHeld(Inputs.Right) - +ZooGame.input.isInputHeld(Inputs.Left),
            +ZooGame.input.isInputHeld(Inputs.Down) - +ZooGame.input.isInputHeld(Inputs.Up),
        ).truncate(1);

        // Movement
        if (ZooGame.input.isInputHeld(Inputs.Up) ||
            ZooGame.input.isInputHeld(Inputs.Down) ||
            ZooGame.input.isInputHeld(Inputs.Left) ||
            ZooGame.input.isInputHeld(Inputs.Right) &&
            !(ZooGame.input.isInputHeld(Inputs.Up) && ZooGame.input.isInputHeld(Inputs.Down)) &&
            !(ZooGame.input.isInputHeld(Inputs.Left) && ZooGame.input.isInputHeld(Inputs.Right))
        ) {
            actor.state.handleInput(ActorStateInput.MOVE);
        }

        if (!ZooGame.input.isInputHeld(Inputs.Up) &&
            !ZooGame.input.isInputHeld(Inputs.Down) &&
            !ZooGame.input.isInputHeld(Inputs.Left) &&
            !ZooGame.input.isInputHeld(Inputs.Right)
        ) {
            actor.state.handleInput(ActorStateInput.STILL);
        }
    }
}
