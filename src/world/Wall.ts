import { Game, SpriteSheet, Vector } from "engine";
import { TAG } from "engine/consts";
import { AssetManager, ColliderType } from "engine/managers";

import { WallData } from "types/AssetTypes";

export default class Wall {
    public static wallSprites = new Map<string, SpriteSheet>();

    public data: WallData | undefined;
    public spriteSheet: SpriteSheet;
    public sprite: PIXI.Sprite;
    public exists: boolean;

    public constructor(public game: Game, public orientation: number, public position: Vector, public gridPos: Vector, data?: WallData) {
        this.exists = false;
        if (data) {
            this.data = data;
            this.spriteSheet = Wall.wallSprites.get(this.data.spriteSheet);
            this.exists = true;

            if (data.solid) {
                game.physicsManager.createPhysicsObject({
                    collider: {
                        type: ColliderType.Rect,
                        height: orientation ? 0.2 : 1,
                        width: orientation ? 1 : 0.2,
                    },
                    position: position,
                    tag: TAG.Solid,
                    pivot: orientation ? new Vector(0.5, 0.5) : new Vector(0.5, 1),
                    isDynamic: false,
                });
            }
        }

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

    public static wallToWorldPos(wallPos: Vector, orientation: number): Vector {
        if (orientation) {
            // Horizontal
            return new Vector(wallPos.x / 2, wallPos.y);
        } else {
            // Vertical
            return new Vector(wallPos.x / 2, wallPos.y + 0.5);
        }
    }
}
