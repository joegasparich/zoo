import { Game } from 'Game';
import Vector from 'types/vector';
import Entity from 'entities/Entity';
import CONFIG from 'constants/config';

export default class Camera {
    game: Game;
    position: Vector;
    focus: Entity;

    constructor(game: Game, pos: Vector) {
        this.game = game;
        this.position = pos;
    }

    setFocus(focus: Entity) {
        this.focus = focus;
    }

    update() {
        if (focus) {
            this.position = this.focus.position.subtract(new Vector(CONFIG.WINDOW_WIDTH/2, CONFIG.WINDOW_HEIGHT/2));
        }
    }
}
