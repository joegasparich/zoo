import { Vector } from "engine";
import { InputManager } from "engine/managers";
import { InputSystem } from "engine/entities/systems";

import Actor, { ActorStateInput } from "entities/Actor";

export default class PlayerInputSystem extends InputSystem {
    id = "PLAYER_INPUT_SYSTEM";

    update(delta: number): void {
        super.update(delta);

        const actor = this.entity as Actor;

        this.inputVector = new Vector(
            +this.game.input.isKeyHeld(InputManager.KEY.RIGHT) - +this.game.input.isKeyHeld(InputManager.KEY.LEFT),
            +this.game.input.isKeyHeld(InputManager.KEY.DOWN) - +this.game.input.isKeyHeld(InputManager.KEY.UP),
        ).truncate(1);

        // Movement
        if (this.game.input.isKeyHeld(InputManager.KEY.UP) ||
            this.game.input.isKeyHeld(InputManager.KEY.DOWN) ||
            this.game.input.isKeyHeld(InputManager.KEY.LEFT) ||
            this.game.input.isKeyHeld(InputManager.KEY.RIGHT) &&
            !(this.game.input.isKeyHeld(InputManager.KEY.UP) && this.game.input.isKeyHeld(InputManager.KEY.DOWN)) &&
            !(this.game.input.isKeyHeld(InputManager.KEY.LEFT) && this.game.input.isKeyHeld(InputManager.KEY.RIGHT))
        ) {
            actor.state.handleInput(ActorStateInput.MOVE);
        }

        if (!this.game.input.isKeyHeld(InputManager.KEY.UP) &&
            !this.game.input.isKeyHeld(InputManager.KEY.DOWN) &&
            !this.game.input.isKeyHeld(InputManager.KEY.LEFT) &&
            !this.game.input.isKeyHeld(InputManager.KEY.RIGHT)
        ) {
            actor.state.handleInput(ActorStateInput.STILL);
        }

        // Actions
        if (this.game.input.isKeyPressed(InputManager.KEY.SPACE)) {
            actor.state.handleInput(ActorStateInput.USE);
        }
    }
}
