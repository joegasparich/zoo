import Inputs from "constants/inputs";
import { Events, Game } from "engine";
import { lerp } from "engine/helpers/math";
import Mediator from "engine/Mediator";

const minZoom = 0.5;
const maxZoom = 10;

Mediator.on(Events.GameEvent.UPDATE, update);

function update(opts: {delta: number; game: Game}): void {
    const {delta, game} = opts;

    if(game.input.isInputHeld(Inputs.ZoomIn)) {
        // zoom in
        game.camera.scale = Math.exp(lerp(Math.log(game.camera.scale), Math.log(maxZoom), 0.01));
    }
    if(game.input.isInputHeld(Inputs.ZoomOut)) {
        // zoom out
        game.camera.scale = Math.exp(lerp(Math.log(game.camera.scale), Math.log(minZoom), 0.01));
    }
}
