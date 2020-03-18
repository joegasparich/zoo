import { Vector } from "engine";
import { InputManager } from "engine/managers";
import { InputSystem } from "engine/entities/systems";
import { INPUT } from "engine/entities/state";

import Actor from "entities/Actor";

export default class PlayerInputSystem extends InputSystem {
    id = "PLAYER_INPUT_SYSTEM";

    update(delta: number): void {
        super.update(delta);

        const actor = this.entity as Actor;

        this.inputVector = new Vector(
            +actor.game.inputManager.isKeyHeld(InputManager.KEY.RIGHT) - +actor.game.inputManager.isKeyHeld(InputManager.KEY.LEFT),
            +actor.game.inputManager.isKeyHeld(InputManager.KEY.DOWN) - +actor.game.inputManager.isKeyHeld(InputManager.KEY.UP),
        ).truncate(1);

        // Movement
        if (actor.game.inputManager.isKeyHeld(InputManager.KEY.UP) ||
            actor.game.inputManager.isKeyHeld(InputManager.KEY.DOWN) ||
            actor.game.inputManager.isKeyHeld(InputManager.KEY.LEFT) ||
            actor.game.inputManager.isKeyHeld(InputManager.KEY.RIGHT) &&
            !(actor.game.inputManager.isKeyHeld(InputManager.KEY.UP) && actor.game.inputManager.isKeyHeld(InputManager.KEY.DOWN)) &&
            !(actor.game.inputManager.isKeyHeld(InputManager.KEY.LEFT) && actor.game.inputManager.isKeyHeld(InputManager.KEY.RIGHT))
        ) {
            actor.state.handleInput(INPUT.MOVE);
        }

        if (!actor.game.inputManager.isKeyHeld(InputManager.KEY.UP) &&
            !actor.game.inputManager.isKeyHeld(InputManager.KEY.DOWN) &&
            !actor.game.inputManager.isKeyHeld(InputManager.KEY.LEFT) &&
            !actor.game.inputManager.isKeyHeld(InputManager.KEY.RIGHT)
        ) {
            actor.state.handleInput(INPUT.STILL);
        }

        // Actions
        if (actor.game.inputManager.isKeyPressed(InputManager.KEY.SPACE)) {
            actor.state.handleInput(INPUT.USE);
        }
    }
}
