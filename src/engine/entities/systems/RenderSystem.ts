import { System } from ".";
import { AssetManager } from "engine/managers";
import { Entity } from "engine/entities";
import { LAYERS, WORLD_SCALE } from "engine/constants";

export default class RenderSystem extends System {
    id = "RENDER_SYSTEM";

    spriteUrl: string;
    sprite: PIXI.Sprite;

    constructor(spriteUrl: string) {
        super();
        this.spriteUrl = spriteUrl;
    }

    start(entity: Entity): void {
        super.start(entity);

        const app = entity.game.app;

        const texture = AssetManager.getTexture(this.spriteUrl);
        this.sprite = new PIXI.Sprite(texture);
        app.stage.addChild(this.sprite);
        this.sprite.parentGroup = LAYERS.ENTITIES;

        this.sprite.anchor.y = 0.5;
        this.sprite.anchor.x = 0.5;
    }

    postUpdate(delta: number): void {
        this.sprite.pivot = this.entity.game.camera.screenPosition.toPoint();
        super.postUpdate(delta);

        // Sync postition
        this.sprite.position = new PIXI.Point(this.entity.position.x * WORLD_SCALE, this.entity.position.y * WORLD_SCALE);
    }
}
