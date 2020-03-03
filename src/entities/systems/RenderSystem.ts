import AssetManager from "AssetManager";
import { SYSTEM, System } from '.';
import Entity from 'entities/Entity';
import LAYERS from 'constants/LAYERS'

export default class RenderSystem extends System {
    id = SYSTEM.RENDER_SYSTEM;

    spriteUrl: string;
    sprite: PIXI.Sprite;

    constructor(spriteUrl: string) {
        super();
        this.spriteUrl = spriteUrl;
    }

    start(entity: Entity) {
        super.start(entity);

        const app = entity.game.getApp();

        const texture = AssetManager.getTexture(this.spriteUrl);
        this.sprite = new PIXI.Sprite(texture);
        app.stage.addChild(this.sprite);
        this.sprite.parentGroup = LAYERS.ENTITIES;

        this.sprite.anchor.y = 0.5;
        this.sprite.anchor.x = 0.5;
    }

    postUpdate(delta: number) {
        super.postUpdate(delta);

        // Sync postition
        this.sprite.position = new PIXI.Point(this.entity.position.x, this.entity.position.y);
    }
}