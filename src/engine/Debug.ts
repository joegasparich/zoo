import { Game, Camera, Vector, Layers } from ".";

class Debug {
    graphics: PIXI.Graphics;
    camera: Camera;

    init(game: Game): void {
        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = Layers.DEBUG;
        game.stage.addChild(this.graphics);
        this.camera = game.camera;
    }

    preUpdate(): void {
        if (!this.graphics) return;
        this.graphics.clear();
    }

    postUpdate(): void {
        if (!this.graphics) return;
        this.graphics.pivot = this.camera.screenPosition.toPoint();
    }

    setLineStyle(thickness: number, colour: number): void {
        if (!this.graphics) return;
        this.graphics.lineStyle(thickness, colour);
    }

    drawLine(startX: number, startY: number, endX: number, endy: number): void {
        if (!this.graphics) return;
        this.graphics.moveTo(startX, startY);
        this.graphics.lineTo(endX, endy);
    }

    drawVectorList(vertices: Vector[]): void {
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
                vertex.y,
            );
            lastVertex = vertex;
        });
        this.drawLine(
            lastVertex.x,
            lastVertex.y,
            vertices[0].x,
            vertices[0].y,
        );
    }

    drawCircle(pos: Vector, radius: number): void {
        if (!this.graphics) return;
        this.graphics.drawCircle(pos.x, pos.y, radius);
    }
}

export default new Debug();
