import { lerp } from "helpers/math";
import Mediator from "Mediator";
import Game from "Game";
import { GameEvent, Inputs } from "consts";

const minZoom = 0.5;
const maxZoom = 10;

Mediator.on(GameEvent.UPDATE, update);

function update(opts: {delta: number}): void {
    const {delta} = opts;

    if(Game.input.isInputHeld(Inputs.ZoomIn)) {
        // zoom in
        Game.camera.scale = Math.exp(lerp(Math.log(Game.camera.scale), Math.log(maxZoom), 0.01));
    }
    if(Game.input.isInputHeld(Inputs.ZoomOut)) {
        // zoom out
        Game.camera.scale = Math.exp(lerp(Math.log(Game.camera.scale), Math.log(minZoom), 0.01));
    }
}
