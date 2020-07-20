import { Vector } from "engine";

export interface SpriteSheetData {
    cellWidth: number;
    cellHeight: number;
    pivot?: Vector;
    image: PIXI.Texture;
}

export default class SpriteSheet {
    private texture: PIXI.Texture;
    private rows: number;
    private cols: number;
    private data: SpriteSheetData;

    public constructor(data: SpriteSheetData) {
        if (!data.image) {
            console.error("Tried to create sprite sheet with no texture");
            return null;
        }

        this.texture = data.image;
        this.rows = Math.floor(data.image.height / data.cellWidth);
        this.cols = Math.floor(data.image.width / data.cellWidth);
        this.data = data;
    }

    protected getRectFromIndex(index: number): PIXI.Rectangle {
        const row = Math.min(index % this.cols, this.cols - 1);
        const col = Math.min(Math.floor(index / this.cols), this.rows - 1);

        return new PIXI.Rectangle(
            row * this.data.cellWidth,
            col * this.data.cellHeight,
            this.data.cellWidth,
            this.data.cellHeight,
        );
    }

    public getTexture(): PIXI.Texture {
        return this.texture;
    }

    public getTextureById(id: number): PIXI.Texture {
        return new PIXI.Texture(this.texture.baseTexture, this.getRectFromIndex(id));
    }

    public getTexturesById(ids: number[]): PIXI.Texture[] {
        return ids.map(id => this.getTextureById(id));
    }
}
