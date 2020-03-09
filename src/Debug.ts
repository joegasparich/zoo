import LAYERS from "constants/LAYERS";
import { Game } from "Game";
import Camera from "Camera";

class Debug {
    graphics: PIXI.Graphics;
    camera: Camera;

    constructor() {
        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = LAYERS.DEBUG;
    }

    init(game: Game) {
        game.stage.addChild(this.graphics);
        this.camera = game.getCamera();
    }

    update() {
        this.graphics.pivot = this.camera.position.toPoint();
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