import { System, SYSTEM } from ".";
import { AssetManager } from "engine/managers";
import { Entity } from "engine/entities";
import { WORLD_SCALE } from "engine/constants";
import { Layers } from "engine";

export default class RenderSystem extends System {
    public id = SYSTEM.RENDER_SYSTEM;

    protected spriteUrl: string;
    public sprite: PIXI.Sprite;

    public flipX: boolean;
    public flipY: boolean;

    constructor(spriteUrl: string) {
        super();
        this.spriteUrl = spriteUrl ?? "";
    }

    public start(entity: Entity): void {
        super.start(entity);

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

        this.sprite.pivot = this.entity.game.camera.screenPosition.toPoint();
        this.sprite.texture.rotate = this.getRotation();

        // Sync postition
        this.sprite.position.set(this.entity.position.x * WORLD_SCALE, this.entity.position.y * WORLD_SCALE);
    }

    private getRotation(): number {
        if (!this.flipX && !this.flipY) return 0;
        if (this.flipX && !this.flipY) return 12;
        if (!this.flipX && this.flipY) return 8;
        if (this.flipX && this.flipY) return 4;
    }
}
