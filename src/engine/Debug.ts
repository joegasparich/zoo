import { Game, Camera, Vector } from ".";
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

    preUpdate() {
        if (!this.graphics) return;
        this.graphics.clear()
    }

    postUpdate() {
        if (!this.graphics) return;
        this.graphics.pivot = this.camera.screenPosition.toPoint();
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

    drawVectorList(vertices: Vector[]) {
        let lastVertex: Vector = null;
        vertices.forEach(vertex => {
            if (!lastVertex) {
                lastVertex = vertex;
                return;
            }

            this.drawLine(
                lastVertex.x,
                lastVertex.y,
                vertex.x,
                vertex.y
            );
            lastVertex = vertex;
        })
    }

    drawCircle(pos: Vector, radius: number) {
        if (!this.graphics) return;
        this.graphics.drawCircle(pos.x, pos.y, radius);
    }
}

export default new Debug();