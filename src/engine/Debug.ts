import { Game, Camera } from ".";
import { LAYERS } from "./constants";

class Debug {
    graphics: PIXI.Graphics;
    camera: Camera;

    init(game: Game) {
        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = LAYERS.DEBUG;
        game.stage.addChild(this.graphics);
        this.camera = game.camera;
    }

    update() {
        if (!this.graphics) return;
        this.graphics.pivot = this.camera.position.toPoint();
    }

    setLineStyle(thickness: number, colour: number) {
        if (!this.graphics) return;
        this.graphics.lineStyle(thickness, colour);
    }

    drawLine(startX: number, startY: number, endX: number, endy: number) {
        if (!this.graphics) return;
        this.graphics.moveTo(startX, startY);
        this.graphics.lineTo(endX, endy);
    }
}

export default new Debug();