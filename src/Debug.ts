import LAYERS from "constants/LAYERS";
import { Game } from "Game";
import Camera from "Camera";
import CONFIG from "constants/config";

class Debug {
    graphics: PIXI.Graphics;
    camera: Camera;

    constructor() {
        if (!CONFIG.ENABLE_DEBUG) return;
        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = LAYERS.DEBUG;
    }

    init(game: Game) {
        if (!CONFIG.ENABLE_DEBUG) return;
        game.stage.addChild(this.graphics);
        this.camera = game.getCamera();
    }

    update() {
        if (!CONFIG.ENABLE_DEBUG) return;
        this.graphics.pivot = this.camera.position.toPoint();
    }

    setLineStyle(thickness: number, colour: number) {
        if (!CONFIG.ENABLE_DEBUG) return;
        this.graphics.lineStyle(thickness, colour);
    }

    drawLine(startX: number, startY: number, endX: number, endy: number) {
        if (!CONFIG.ENABLE_DEBUG) return;
        this.graphics.moveTo(startX, startY);
        this.graphics.lineTo(endX, endy);
    }
}

export default new Debug();