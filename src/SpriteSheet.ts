import { Rectangle, Texture } from "pixi.js";

import { AssetManager } from "managers";
import Vector from "vector";

export interface SpriteSheetData {
    cellWidth: number;
    cellHeight: number;
    pivot?: Vector;
    imageUrl: string;
}

export default class SpriteSheet {
    protected texture: Texture;
    protected rows: number;
    protected cols: number;
    public data: SpriteSheetData;

    public constructor(data: SpriteSheetData) {
        if (!data.imageUrl) {
            console.error("Tried to create sprite sheet with no texture");
            return null;
        }

        this.texture = AssetManager.getTexture(data.imageUrl);
        this.rows = Math.floor(this.texture.height / data.cellHeight);
        this.cols = Math.floor(this.texture.width / data.cellWidth);
        this.data = data;
    }

    protected getRectFromIndex(index: number): Rectangle {
        const col = Math.min(index % this.cols, this.cols - 1);
        const row = Math.min(Math.floor(index / this.cols), this.rows - 1);

        return new Rectangle(
            col * this.data.cellWidth,
            row * this.data.cellHeight,
            this.data.cellWidth,
            this.data.cellHeight,
        );
    }

    public getTexture(): Texture {
        return this.texture;
    }

    public getTextureByIndex(id: number): Texture {
        return new Texture(this.texture.baseTexture, this.getRectFromIndex(id));
    }

    public getTexturesById(ids: number[]): Texture[] {
        return ids.map(id => this.getTextureByIndex(id));
    }
}
