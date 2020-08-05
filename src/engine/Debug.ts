import { Game, Camera, Vector, Layers } from ".";

// TODO: Refactor into Draw class and then inherit from it and include logging features
class Debug {
    private graphics: PIXI.Graphics;
    private game: Game;
    private camera: Camera;

    public init(game: Game): void {
        this.game = game;
        this.camera = game.camera;

        this.graphics = new PIXI.Graphics();
        this.graphics.parentGroup = Layers.DEBUG;
        game.stage.addChild(this.graphics);
        this.graphics.position = this.camera.offset.toPoint();
    }

    public preUpdate(): void {
        if (!this.graphics) return;
        this.graphics.clear();

        if (this.game.opts.enableDebug) {
            this.graphics.visible = true;
        } else {
            this.graphics.visible = false;
        }
    }

    public postUpdate(): void {
        if (!this.graphics) return;
        this.graphics.scale.set(this.camera.scale, this.camera.scale);
        this.graphics.position = this.camera.worldToScreenPosition(Vector.Zero).toPoint();
    }

    public setLineStyle(thickness: number, colour: number): void {
        if (!this.graphics) return;
        this.graphics.lineStyle(thickness, colour);
    }

    public drawLine(startX: number, startY: number, endX: number, endy: number): void {
        if (!this.graphics) return;
        this.graphics.moveTo(startX, startY);
        this.graphics.lineTo(endX, endy);
    }

    public drawVectorList(vertices: Vector[]): void {
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

    public drawCircle(pos: Vector, radius: number, fill?: number, fillAlpha = 1): void {
        if (!this.graphics) return;
        if (fill) this.graphics.beginFill(fill, fillAlpha);
        this.graphics.drawCircle(pos.x, pos.y, radius);
        if (fill) this.graphics.endFill();
    }

    public drawPolygon(vertices: Vector[], fill?: number, fillAlpha = 1): void {
        if (!this.graphics) return;
        if (fill) this.graphics.beginFill(fill, fillAlpha);
        this.graphics.drawPolygon(vertices.map(vertex => vertex.toPoint()));
        if (fill) this.graphics.endFill();
    }

    public drawX(pos: Vector, size: number): void {
        if (!this.graphics) return;
        this.drawLine(pos.x - size, pos.y - size, pos.x + size, pos.y + size);
        this.drawLine(pos.x - size, pos.y + size, pos.x + size, pos.y - size);
    }
}

export default new Debug();
