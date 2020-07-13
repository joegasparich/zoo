import CONFIG from "constants/config";
import { Game, Vector } from ".";

export default class Camera {
    game: Game;
    worldPosition: Vector;
    scale: number;
    target: Vector;
    offset: Vector;

    constructor(game: Game, pos: Vector, scale: number) {
        this.game = game;
        this.worldPosition = pos;
        this.scale = scale;
        this.offset = new Vector(CONFIG.WINDOW_WIDTH/2, CONFIG.WINDOW_HEIGHT/2);
    }

    goToPosition(position: Vector): void {
        this.target = position;
    }

    update(): void {
        if (this.target) {
            this.worldPosition = Vector.Lerp(this.worldPosition, this.target, 0.1 * this.game.opts.gameSpeed);
        }
    }

    worldToScreenPosition(worldPos: Vector): Vector {
        if (!worldPos) {
            console.error("No world position was provided");
            return;
        }

        return worldPos.subtract(this.worldPosition).multiply(this.game.opts.worldScale * this.scale).add(this.offset);
    }

    screenToWorldPosition(screenPos: Vector): Vector {
        if (!screenPos) {
            console.error("No screen position was provided");
            return;
        }

        return screenPos.subtract(this.offset).divide(this.game.opts.worldScale * this.scale).add(this.worldPosition);
    }
}
