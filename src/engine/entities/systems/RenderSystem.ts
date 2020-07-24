import { System, SYSTEM } from ".";
import { AssetManager } from "engine/managers";
import { Entity } from "engine/entities";
import { Camera, Layers, Vector } from "engine";

const DEFAULT_LAYER = Layers.ENTITIES;

export default class RenderSystem extends System {
    public id = SYSTEM.RENDER_SYSTEM;

    private spriteUrl: string;
    protected sprite: PIXI.Sprite;
    private layer: PIXI.display.Group;

    public flipX: boolean;
    public flipY: boolean;
    public scale = 1;
    public pivot: Vector; // Relative to sprite size
    public offset: Vector; // Relative to world

    protected camera: Camera;

    public colour = 0xFFFFFF;
    public alpha = 1;
    public visible = true;

    public constructor(spriteUrl: string, layer?: PIXI.display.Group, pivot?: Vector) {
        super();
        this.spriteUrl = spriteUrl ?? "";
        this.layer = layer ?? DEFAULT_LAYER;
        this.pivot = pivot ?? new Vector(0.5, 0.5);
        this.offset = new Vector(0, 0);
    }

    public start(entity: Entity): void {
        super.start(entity);

        this.camera = this.game.camera;

        if (this.spriteUrl) {
            this.setSprite(this.spriteUrl);
        }
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        if (!this.sprite) return;

        this.syncPosition();
        this.setColour();
    }

    public end(): void {
        this.game.app.stage.removeChild(this.sprite);
    }

    public setSprite(newSprite: string | PIXI.Texture | PIXI.Sprite): void {
        if (!this.hasStarted) {
            console.error("System hasn't been started yet");
            return;
        }

        if (typeof newSprite === "string") {
            newSprite = AssetManager.getTexture(newSprite);
        }
        if (newSprite instanceof PIXI.Texture) {
            newSprite = new PIXI.Sprite(newSprite);
        }

        if (!newSprite) {
            console.error("Failed to set sprite");
            return;
        }

        // Remove old sprite
        const app = this.game.app;
        app.stage.removeChild(this.sprite);

        // Add new sprite
        app.stage.addChild(newSprite);
        this.sprite = newSprite;
        this.sprite.parentGroup = this.layer;
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

        this.sprite.scale = new PIXI.Point(this.camera.scale * this.scale, this.camera.scale * this.scale);
        this.sprite.texture.rotate = this.getRotation();
        if (this.pivot) this.sprite.anchor.copyFrom(this.pivot.toPoint());

        // Sync postition
        this.sprite.position = this.camera.worldToScreenPosition(this.entity.position.add(this.offset)).toPoint();
    }

    private getRotation(): number {
        if (!this.flipX && !this.flipY) return 0;
        if (this.flipX && !this.flipY) return 12;
        if (!this.flipX && this.flipY) return 8;
        if (this.flipX && this.flipY) return 4;
    }
}
