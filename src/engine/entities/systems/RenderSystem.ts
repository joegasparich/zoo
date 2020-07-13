import { System, SYSTEM } from ".";
import { AssetManager } from "engine/managers";
import { Entity } from "engine/entities";
import { Camera, Layers } from "engine";
import { Point } from "pixi.js";

export default class RenderSystem extends System {
    public id = SYSTEM.RENDER_SYSTEM;

    protected spriteUrl: string;
    public sprite: PIXI.Sprite;

    public flipX: boolean;
    public flipY: boolean;
    public scale = 1;

    protected camera: Camera;

    constructor(spriteUrl: string) {
        super();
        this.spriteUrl = spriteUrl ?? "";
    }

    public start(entity: Entity): void {
        super.start(entity);

        this.camera = entity.game.camera;

        if (this.spriteUrl) {
            this.setSprite(this.spriteUrl);
        }
    }

    public setSprite(newSprite: string | PIXI.Texture | PIXI.Sprite): void {
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
        const app = this.entity.game.app;
        app.stage.removeChild(this.sprite);

        // Add new sprite
        app.stage.addChild(newSprite);
        this.sprite = newSprite;
        this.sprite.parentGroup = Layers.ENTITIES;
        this.sprite.anchor.set(0.5);
        this.syncPosition();
    }

    public postUpdate(delta: number): void {
        super.postUpdate(delta);

        this.syncPosition();
    }

    protected syncPosition(): void {
        if (!this.sprite) return;

        this.sprite.scale = new Point(this.camera.scale * this.scale, this.camera.scale * this.scale);
        this.sprite.texture.rotate = this.getRotation();

        // Sync postition
        this.sprite.position = this.camera.worldToScreenPosition(this.entity.position).toPoint();
    }

    private getRotation(): number {
        if (!this.flipX && !this.flipY) return 0;
        if (this.flipX && !this.flipY) return 12;
        if (!this.flipX && this.flipY) return 8;
        if (this.flipX && this.flipY) return 4;
    }
}
