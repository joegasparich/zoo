import { randomInt } from "engine/helpers/math";
import { AssetManager } from "engine/managers";
import { GroundTileData } from "types/AssetTypes";

export default class GroundTile {
    tileData: GroundTileData;

    texture: PIXI.Texture;

    constructor(tileDataPath?: string, tileData?: GroundTileData) {
        if (tileDataPath) {
            tileData = AssetManager.getJSON(tileDataPath) as GroundTileData;
        }
        if (!tileData) {
            console.error("Tried to create tile without data");
            return;
        }

        this.tileData = tileData;

        const variantIndex = this.tileData.variants[randomInt(0, this.tileData.variants.length)];
        this.texture = AssetManager.getTileset(tileData.tileset)?.getTextureById(variantIndex);
    }
}
