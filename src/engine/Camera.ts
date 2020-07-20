import { Game, Vector } from ".";

export default class Camera {
    private game: Game;
    private worldPosition: Vector;
    public scale: number;
    private target: Vector;
    public offset: Vector;

    public constructor(game: Game, pos: Vector, scale: number) {
        this.game = game;
        this.worldPosition = pos;
        this.scale = scale;
        this.offset = new Vector(game.opts.windowWidth/2, game.opts.windowHeight/2);
    }

    public goToPosition(position: Vector): void {
        this.target = position;
    }

    public update(): void {
        if (this.target) {
            this.worldPosition = Vector.Lerp(this.worldPosition, this.target, 0.1 * this.game.opts.gameSpeed);
        }
    }

    public worldToScreenPosition(worldPos: Vector): Vector {
        if (!worldPos) {
            console.error("No world position was provided");
            return;
        }

        return worldPos.subtract(this.worldPosition).multiply(this.game.opts.worldScale * this.scale).add(this.offset);
    }

    public screenToWorldPosition(screenPos: Vector): Vector {
        if (!screenPos) {
            console.error("No screen position was provided");
            return;
        }

        return screenPos.subtract(this.offset).divide(this.game.opts.worldScale * this.scale).add(this.worldPosition);
    }
}
