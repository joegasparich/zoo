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
            actor.state.handleInput(ActorStateInput.MOVE);
        }

        if (!actor.game.inputManager.isKeyHeld(InputManager.KEY.UP) &&
            !actor.game.inputManager.isKeyHeld(InputManager.KEY.DOWN) &&
            !actor.game.inputManager.isKeyHeld(InputManager.KEY.LEFT) &&
            !actor.game.inputManager.isKeyHeld(InputManager.KEY.RIGHT)
        ) {
            actor.state.handleInput(ActorStateInput.STILL);
        }

        // Actions
        if (actor.game.inputManager.isKeyPressed(InputManager.KEY.SPACE)) {
            actor.state.handleInput(ActorStateInput.USE);
        }
    }
}
