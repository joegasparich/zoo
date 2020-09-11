import * as Planck from "planck-js";

import { SpriteSheet, Vector } from "engine";
import { Layers, TAG } from "engine/consts";
import { AssetManager, ColliderType } from "engine/managers";

import { WallData } from "types/AssetTypes";
import ZooGame from "ZooGame";

export enum WallSpriteIndex {
    Horizontal = 0,
    Vertical = 1,
    DoorHorizontal = 2,
    DoorVertical = 3,
    HillEast = 4,
    HillWest = 5,
    HillNorth = 6,
    HillSouth = 7,
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

    public constructor(public orientation: number, public position: Vector, public gridPos: Vector, data?: WallData) {
        this.exists = false;
        if (data) {
            this.data = data;
            this.spriteSheet = Wall.wallSprites.get(this.data.spriteSheet);
            this.exists = true;

            if (data.solid) {
                this.body = ZooGame.physicsManager.createPhysicsObject({
                    collider: {
                        type: ColliderType.Rect,
                        height: orientation ? 0.2 : 1,
                        width: orientation ? 1 : 0.2,
                    },
                    position: position,
                    tag: TAG.Solid,
                    pivot: new Vector(0.5, 0.5),
                    isDynamic: false,
                });
            }

            this.updateSprite();
        }
    }

    public remove(): void {
        this.data = undefined;
        this.spriteSheet = undefined;
        this.exists = false;
        ZooGame.app.stage.removeChild(this.sprite);
        ZooGame.physicsManager.removeBody(this.body);
    }

    public updateSprite(): void {
        if (!this.exists) return;

        if (this.sprite) {
            // Remove old sprite
            ZooGame.app.stage.removeChild(this.sprite);
        }

        // Add new sprite
        const [spriteIndex, elevation] = this.getSpriteIndex();
        const texture = this.spriteSheet.getTextureById(spriteIndex);
        this.sprite = new PIXI.Sprite(texture);
        ZooGame.app.stage.addChild(this.sprite);
        this.sprite.parentGroup = Layers.ENTITIES;
        this.sprite.anchor.set(0.5, 1 + elevation * 0.25);
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

    public isSloped(): boolean {
        if (this.orientation) {
            const left = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x - 0.5, this.position.y));
            const right = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x + 0.5, this.position.y));

            return left !== right
        } else {
            const up = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x, this.position.y - 0.5));
            const down = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x, this.position.y + 0.5));

            return up !== down
        }
    }

    public getSpriteIndex(isDoor = this.isDoor): [WallSpriteIndex, number] {
        if (this.orientation) {
            const left = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x - 0.5, this.position.y));
            const right = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x + 0.5, this.position.y));

            if (!left && !right) return [isDoor ? WallSpriteIndex.DoorHorizontal : WallSpriteIndex.Horizontal, 0];
            if (left && !right) return [isDoor ? WallSpriteIndex.DoorHorizontal : WallSpriteIndex.HillWest, 0];
            if (!left && right) return [isDoor ? WallSpriteIndex.DoorHorizontal : WallSpriteIndex.HillEast, 0];
            if (left && right) return [isDoor ? WallSpriteIndex.DoorHorizontal : WallSpriteIndex.Horizontal, 1];
        } else {
            const up = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x, this.position.y - 0.5));
            const down = !!ZooGame.world.elevationGrid.getElevationAtPoint(new Vector(this.position.x, this.position.y + 0.5));

            if (!up && !down) return [isDoor ? WallSpriteIndex.DoorVertical : WallSpriteIndex.Vertical, 0];
            if (up && !down) return [isDoor ? WallSpriteIndex.DoorVertical : WallSpriteIndex.HillNorth, 0];
            if (!up && down) return [isDoor ? WallSpriteIndex.DoorVertical : WallSpriteIndex.HillSouth, 1];
            if (up && down) return [isDoor ? WallSpriteIndex.DoorVertical : WallSpriteIndex.Vertical, 1];
        }
    }
}
