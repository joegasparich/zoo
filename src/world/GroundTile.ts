import { randomInt } from "engine/helpers/math";
import { AssetManager } from "engine/managers";

export interface TileData {
    name: string;
    tileset: string;
    variants: number[];
}

export default class GroundTile {
    tileData: TileData;

    texture: PIXI.Texture;

    constructor(tileDataPath?: string, tileData?: TileData) {
        if (tileDataPath) {
            tileData = AssetManager.getJSON(tileDataPath) as TileData;
        }
        if (!tileData) {
            return;
        }

        this.tileData = tileData;

        const variantIndex = this.tileData.variants[randomInt(0, this.tileData.variants.length)];
        this.texture = AssetManager.getTileset(tileData.tileset)?.getTexture(variantIndex);
    }
}
