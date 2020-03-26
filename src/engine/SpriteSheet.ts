export interface SpriteSheetData {
    cellWidth: number;
    cellHeight: number;
    image: PIXI.Texture;
}

export default class SpriteSheet {
    texture: PIXI.Texture;
    rows: number;
    cols: number;
    cellWidth: number;
    cellHeight: number;

    constructor(data: SpriteSheetData) {
        if (!data.image) {
            console.error("Tried to create sprite sheet with no texture");
            return null;
        }

        this.texture = data.image;
        this.rows = Math.floor(data.image.height / data.cellWidth);
        this.cols = Math.floor(data.image.width / data.cellWidth);
        this.cellWidth = data.cellWidth;
        this.cellHeight = data.cellHeight;
    }

    protected getRectFromIndex(index: number): PIXI.Rectangle {
        const row = Math.min(index % this.cols, this.cols - 1);
        const col = Math.min(Math.floor(index / this.cols), this.rows - 1);

        return new PIXI.Rectangle(
            row * this.cellWidth,
            col * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
        );
    }

    getTexture(id: number): PIXI.Texture {
        return new PIXI.Texture(this.texture.baseTexture, this.getRectFromIndex(id));
    }

    getTextures(ids: number[]): PIXI.Texture[] {
        return ids.map(id => this.getTexture(id));
    }
}
