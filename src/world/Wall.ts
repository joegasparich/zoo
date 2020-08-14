import * as Planck from "planck-js";

import { Game, SpriteSheet, Vector } from "engine";
import { TAG } from "engine/consts";
import { AssetManager, ColliderType } from "engine/managers";

import { WallData } from "types/AssetTypes";

export enum WallSpriteIndex {
    Horizontal = 0,
    Vertical = 1,
    DoorHorizontal = 2,
    DoorVertical = 3,
}

export default class Wall {

    public static wallSprites = new Map<string, SpriteSheet>();

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

    // Class //

    public data: WallData | undefined;
    public spriteSheet: SpriteSheet;
    public sprite: PIXI.Sprite;
    private body: Planck.Body;

    public exists: boolean;
    public isDoor: boolean;

    public constructor(public game: Game, public orientation: number, public position: Vector, public gridPos: Vector, data?: WallData) {
        this.exists = false;
        if (data) {
            this.data = data;
            this.spriteSheet = Wall.wallSprites.get(this.data.spriteSheet);
            this.exists = true;

            if (data.solid) {
                this.body = game.physicsManager.createPhysicsObject({
                    collider: {
                        type: ColliderType.Rect,
                        height: orientation ? 0.2 : 1,
                        width: orientation ? 1 : 0.2,
                    },
                    position: position,
                    tag: TAG.Solid,
                    pivot: new Vector(0.5, 0.5),
                    // pivot: orientation ? new Vector(0.5, 0.5) : new Vector(0.5, 1),
                    isDynamic: false,
                });
            }
        }
    }

    /**
     * Sets the wall to or from a door
     * @param isDoor State to set the wall to
     */
    public setDoor(isDoor: boolean): void {
        if (this.isDoor === isDoor) return;

        this.isDoor = isDoor;

        if (isDoor) {
            this.sprite.texture = this.spriteSheet.getTextureById(this.orientation ? WallSpriteIndex.DoorHorizontal : WallSpriteIndex.DoorVertical);
            this.body.setActive(false);
        } else {
            this.sprite.texture = this.spriteSheet.getTextureById(this.orientation ? WallSpriteIndex.Horizontal : WallSpriteIndex.Vertical);
            this.body.setActive(true);
        }
    }
}
