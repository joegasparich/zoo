import { SpriteSheet } from "engine";
import { AssetManager } from "engine/managers";

import { WallData } from "types/AssetTypes";

export default class Wall {
    public static wallSprites = new Map<string, SpriteSheet>();

    public orientation: number; //0 = vertical, 1 = horizontal
    public data: WallData | undefined;
    public sprite: PIXI.Sprite;

    public constructor(orientation: number, data?: WallData) {
        this.orientation = orientation;
        this.data = data;
    }

    public static async loadWallData(path: string): Promise<WallData> {
        const resource = await AssetManager.loadResource(path);
        const data = resource.data as WallData;
        await AssetManager.loadResource(data.spriteSheet);

        const spritesheet = new SpriteSheet({
            image: AssetManager.getTexture(data.spriteSheet),
            cellHeight: 32,
            cellWidth: 16,
        });
        Wall.wallSprites.set(data.spriteSheet, spritesheet);

        return data;
    }
}
