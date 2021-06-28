import { AssetManager } from "managers";
import SpriteSheet from "SpriteSheet";
import { PathData } from "types/AssetTypes";
import Vector from "vector";

export default class Path {

    public static pathSprites = new Map<string, SpriteSheet>();

    public static async loadPathData(path: string): Promise<PathData> {
        const resource = await AssetManager.loadResource(path);
        const data = resource.data as PathData;
        await AssetManager.loadResource(data.spriteSheet);

        const spritesheet = new SpriteSheet({
            imageUrl: data.spriteSheet,
            cellHeight: data.cellHeight,
            cellWidth: data.cellWidth,
        });
        Path.pathSprites.set(data.spriteSheet, spritesheet);

        return data;
    }

    public data: PathData | undefined;

    public constructor(public position: Vector, public assetPath?: string) {}
}
