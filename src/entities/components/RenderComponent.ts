import { Sprite } from "pixi.js";

import { Component, COMPONENT } from ".";
import { AssetManager } from "managers";
import { Entity } from "entities";
import { ComponentSaveData } from "./Component";
import SpriteSheet from "SpriteSheet";
import Vector from "vector";
import Camera from "Camera";
import Game from "Game";
import { toObservablePoint } from "helpers/vectorHelper";
import { RenderLayers } from "consts";

const DEFAULT_LAYER = RenderLayers.ENTITIES;

interface RenderComponentSaveData extends ComponentSaveData {
    spriteUrl: string;
    spriteSheet?: {
        cellWidth: number;
        cellHeight: number;
        pivot?: number[];
        index: number;
    };
    flipX: boolean;
    flipY: boolean;
    scale: number;
    pivot: number[];
    offset: number[];
    colour: number;
    alpha: number;
    visible: boolean;
}

export default class RenderComponent extends Component {
    public id: COMPONENT = "RENDER_COMPONENT";
    public type: COMPONENT = "RENDER_COMPONENT";

    private spriteUrl: string;
    private spriteSheet: SpriteSheet;
    private spriteIndex: number;
    private layer: number;
    protected sprite: Sprite;

    public flipX: boolean;
    public flipY: boolean;
    public scale = 1;
    public pivot: Vector; // Relative to sprite size
    public offset: Vector; // Relative to world

    protected camera: Camera;

    public colour = 0xFFFFFF;
    public alpha = 1;
    public visible = true;

    public constructor(spriteUrl?: string, layer?: number, pivot?: Vector) {
        super();
        this.spriteUrl = spriteUrl ?? "";
        this.layer = layer ?? DEFAULT_LAYER;
        this.pivot = pivot ?? new Vector(0.5);
        this.offset = Vector.Zero();
    }

    public start(entity: Entity): void {
        super.start(entity);

        this.camera = Game.camera;

        // Set cached sprites if they exist
        if (this.spriteSheet) {
            this.setSpriteSheet(this.spriteSheet, this.spriteIndex);
        } else if (this.spriteUrl) {
            this.setSprite(this.spriteUrl);
        }
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        if (!this.sprite) return;

        this.syncPosition();
        this.setColour();

        this.sprite.zIndex = this.entity.position.y;
    }

    public end(): void {
        Game.removeFromStage(this.sprite, this.layer);
    }

    public setSprite(spriteUrl: string): void {
        this.spriteUrl = spriteUrl;
        this.spriteSheet = undefined;

        if (this.hasStarted) {
            const sprite = new Sprite(AssetManager.getTexture(spriteUrl));
            this.updateSprite(sprite);
        }
    }

    public setSpriteSheet(spriteSheet: SpriteSheet, index: number): void {
        this.spriteUrl = spriteSheet.data.imageUrl;
        this.spriteSheet = spriteSheet;
        this.spriteIndex = index;

        if (this.hasStarted) {
            const sprite = new Sprite(spriteSheet.getTextureByIndex(index));
            this.updateSprite(sprite);
        }
    }

    protected updateSprite(sprite: Sprite): void {
        if (!sprite) {
            console.error("Failed to update sprite");
            return;
        }

        // Remove old sprite
        Game.removeFromStage(this.sprite, this.layer);

        // Add new sprite
        this.sprite = sprite;
        Game.addToStage(this.sprite, this.layer);
        this.sprite.anchor.set(0.5);
        this.syncPosition();
    }

    protected setColour(): void {
        this.sprite.tint = this.colour;
        this.sprite.alpha = this.alpha;
        this.sprite.visible = this.visible;
    }

    protected syncPosition(): void {
        if (!this.sprite) return;

        this.sprite.scale = toObservablePoint(new Vector(this.scale, this.scale));
        this.sprite.texture.rotate = this.getRotation();
        if (this.pivot) this.sprite.anchor.copyFrom(toObservablePoint(this.pivot));

        // Sync postition
        this.sprite.position = toObservablePoint(this.entity.position.add(this.offset).multiply(Game.opts.worldScale));
    }

    private getRotation(): number {
        if (!this.flipX && !this.flipY) return 0;
        if (this.flipX && !this.flipY) return 12;
        if (!this.flipX && this.flipY) return 8;
        if (this.flipX && this.flipY) return 4;
    }

    public save(): RenderComponentSaveData {
        return {
            ...super.save(),
            spriteUrl: this.spriteUrl,
            spriteSheet: this.spriteSheet && {
                cellWidth: this.spriteSheet.data.cellWidth,
                cellHeight: this.spriteSheet.data.cellHeight,
                pivot: this.spriteSheet.data.pivot && Vector.Serialize(this.spriteSheet.data.pivot),
                index: this.spriteIndex,
            },
            flipX: this.flipX,
            flipY: this.flipY,
            scale: this.scale,
            pivot: Vector.Serialize(this.pivot),
            offset: Vector.Serialize(this.offset),
            colour: this.colour,
            alpha: this.alpha,
            visible: this.visible,
        };
    }

    public load(data: RenderComponentSaveData): void {
        super.load(data);

        this.spriteUrl = data.spriteUrl;
        this.flipX = data.flipX;
        this.flipY = data.flipY;
        this.scale = data.scale;
        this.pivot = Vector.Deserialize(data.pivot);
        this.offset = Vector.Deserialize(data.offset);
        this.colour = data.colour;
        this.alpha = data.alpha;
        this.visible = data.visible;

        if (data.spriteSheet) {
            this.spriteSheet = new SpriteSheet({
                imageUrl: data.spriteUrl,
                cellHeight: data.spriteSheet.cellHeight,
                cellWidth: data.spriteSheet.cellWidth,
                pivot: data.spriteSheet.pivot && Vector.Deserialize(data.spriteSheet.pivot),
            });
            this.spriteIndex = data.spriteSheet.index;

            this.setSpriteSheet(this.spriteSheet, this.spriteIndex);
        } else {
            this.setSprite(this.spriteUrl);
        }
    }
}
