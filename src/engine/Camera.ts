import { Game, Vector } from '.';

export default class Camera {
    game: Game;
    position: Vector;
    target: Vector;

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.position = pos;
    }

    goToPosition(position: Vector) {
        this.target = position;
    }

    update() {
        if (this.target) {
            this.position = Vector.Lerp(this.position, this.target, 0.1);
        }
    }
}
