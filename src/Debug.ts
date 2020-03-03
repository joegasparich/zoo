import LAYERS from "constants/LAYERS";
import { Game } from "Game";

class Debug {
    graphics: PIXI.Graphics;

    constructor() {
        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = LAYERS.DEBUG;
    }

    init(game: Game) {
        game.stage.addChild(this.graphics);
    }

    setLineStyle(thickness: number, colour: number) {
        this.graphics.lineStyle(thickness, colour);
    }

    drawLine(startX: number, startY: number, endX: number, endy: number) {
        this.graphics.moveTo(startX, startY);
        this.graphics.lineTo(endX, endy);
    }
}

export default new Debug();