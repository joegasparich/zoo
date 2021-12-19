import { Graphics as PGraphics } from "@pixi/graphics";
import { toObservablePoint } from "helpers/vectorHelper";

import Camera from "Camera";
import Game from "Game";
import Vector from "vector";
import { RenderLayers } from "consts";

enum Colour {
    White = 0xffffff,
    Black = 0x000000,
}

class Graphics {
    private graphics: PGraphics;
    private camera: Camera;

    public Colour = Colour;

    public init(): void {
        this.camera = Game.camera;

        this.graphics = new PGraphics();
        Game.addToStage(this.graphics, RenderLayers.DEBUG);
    }

    public preUpdate(): void {
        if (!this.graphics) return;

        this.graphics.clear();

        if (Game.opts.enableDebug) {
            this.graphics.visible = true;
        } else {
            this.graphics.visible = false;
        }
    }

    public setLineStyle(thickness: number, colour = Colour.Black): void {
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

            this.drawLine(lastVertex.x, lastVertex.y, vertex.x, vertex.y);
            lastVertex = vertex;
        });
        this.drawLine(lastVertex.x, lastVertex.y, vertices[0].x, vertices[0].y);
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
        this.graphics.drawPolygon(vertices.map(vertex => toObservablePoint(vertex)));
        if (fill) this.graphics.endFill();
    }

    public drawRect(x: number, y: number, width: number, height: number, fill?: number, fillAlpha = 1): void {
        if (!this.graphics) return;

        if (fill) this.graphics.beginFill(fill, fillAlpha);
        this.graphics.drawRect(x, y, width, height);
        if (fill) this.graphics.endFill();
    }

    public drawX(pos: Vector, size: number): void {
        this.drawLine(pos.x - size, pos.y - size, pos.x + size, pos.y + size);
        this.drawLine(pos.x - size, pos.y + size, pos.x + size, pos.y - size);
    }
}

export default new Graphics();
