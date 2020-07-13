import { Vector } from "engine";
import { InputManager } from "engine/managers";
import { InputSystem } from "engine/entities/systems";

import Actor, { ActorStateInput } from "entities/Actor";

export default class PlayerInputSystem extends InputSystem {
    id = "PLAYER_INPUT_SYSTEM";

    update(delta: number): void {
        super.update(delta);

        const actor = this.entity as Actor;
        const game = this.entity.game;

        this.inputVector = new Vector(
            +game.input.isKeyHeld(InputManager.KEY.RIGHT) - +game.input.isKeyHeld(InputManager.KEY.LEFT),
            +game.input.isKeyHeld(InputManager.KEY.DOWN) - +game.input.isKeyHeld(InputManager.KEY.UP),
        ).truncate(1);

        // Movement
        if (game.input.isKeyHeld(InputManager.KEY.UP) ||
            game.input.isKeyHeld(InputManager.KEY.DOWN) ||
            game.input.isKeyHeld(InputManager.KEY.LEFT) ||
            game.input.isKeyHeld(InputManager.KEY.RIGHT) &&
            !(game.input.isKeyHeld(InputManager.KEY.UP) && game.input.isKeyHeld(InputManager.KEY.DOWN)) &&
            !(game.input.isKeyHeld(InputManager.KEY.LEFT) && game.input.isKeyHeld(InputManager.KEY.RIGHT))
        ) {
            actor.state.handleInput(ActorStateInput.MOVE);
        }

        if (!game.input.isKeyHeld(InputManager.KEY.UP) &&
            !game.input.isKeyHeld(InputManager.KEY.DOWN) &&
            !game.input.isKeyHeld(InputManager.KEY.LEFT) &&
            !game.input.isKeyHeld(InputManager.KEY.RIGHT)
        ) {
            actor.state.handleInput(ActorStateInput.STILL);
        }

        // Actions
        if (game.input.isKeyPressed(InputManager.KEY.SPACE)) {
            actor.state.handleInput(ActorStateInput.USE);
        }
    }
}
