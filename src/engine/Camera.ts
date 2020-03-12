import { Game, Vector } from '.';
import { WORLD_SCALE } from './constants';

export default class Camera {
    game: Game;
    position: Vector;
    screenPosition: Vector;
    target: Vector;

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.position = pos;
        this.screenPosition = pos.multiply(WORLD_SCALE);
    }

    goToPosition(position: Vector) {
        this.target = position;
    }

    update() {
        if (this.target) {
            this.position = Vector.Lerp(this.position, this.target, 0.1);
            this.screenPosition = this.position.multiply(WORLD_SCALE);
        }
    }
}
