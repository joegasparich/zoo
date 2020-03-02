import { InputSystem } from ".";
import Actor from "entities/Actor";
import { INPUT } from "entities/state/State";
import { KEY } from "InputManager";
import Vector from "types/vector";

export default class PlayerInputSystem extends InputSystem {
    update(delta: number) {
        super.update(delta);

        const actor = this.entity as Actor;

        this.inputVector = new Vector(
            +actor.game.inputManager.isKeyHeld(KEY.RIGHT) - +actor.game.inputManager.isKeyHeld(KEY.LEFT),
            +actor.game.inputManager.isKeyHeld(KEY.DOWN) - +actor.game.inputManager.isKeyHeld(KEY.UP),
        )

        // Movement
        if (actor.game.inputManager.isKeyHeld(KEY.UP) ||
            actor.game.inputManager.isKeyHeld(KEY.DOWN) ||
            actor.game.inputManager.isKeyHeld(KEY.LEFT) ||
            actor.game.inputManager.isKeyHeld(KEY.RIGHT) &&
            !(actor.game.inputManager.isKeyHeld(KEY.UP) && actor.game.inputManager.isKeyHeld(KEY.DOWN)) &&
            !(actor.game.inputManager.isKeyHeld(KEY.LEFT) && actor.game.inputManager.isKeyHeld(KEY.RIGHT))
        ) {
            actor.state.handleInput(INPUT.MOVE);
        }

        if (!actor.game.inputManager.isKeyHeld(KEY.UP) &&
            !actor.game.inputManager.isKeyHeld(KEY.DOWN) &&
            !actor.game.inputManager.isKeyHeld(KEY.LEFT) &&
            !actor.game.inputManager.isKeyHeld(KEY.RIGHT)
        ) {
            actor.state.handleInput(INPUT.STILL);
        }

        // Actions
        if (actor.game.inputManager.isKeyPressed(KEY.SPACE)) {
            actor.state.handleInput(INPUT.USE);
        }
    }
}