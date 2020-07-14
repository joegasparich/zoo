import { Layers } from "engine";
import { GameEvent } from "engine/constants/events";
import { Entity } from "engine/entities";
import { RenderSystem, SYSTEM } from "engine/entities/systems";
import Mediator from "engine/Mediator";
import { FollowMouseSystem, SnapToGridSystem } from "entities/systems";

import { SPRITES } from "constants/assets";
import World from "world/World";
import ZooGame from "ZooGame";

// Should never be seen
const DEFAULT_SPRITE = SPRITES.TREE;

export default class PlacementGhost {
    private game: ZooGame;
    private world: World;

    private ghost: Entity;
    private ghostRenderer: RenderSystem;
    private visible: boolean;

    public constructor(game: ZooGame) {
        this.game = game;
        this.world = game.world;

        this.ghost = new Entity(this.game, this.game.input.getMousePos());
        this.ghost.addSystem(new FollowMouseSystem());
        this.ghost.addSystem(new SnapToGridSystem());
        this.ghostRenderer = this.ghost.addSystem(new RenderSystem(DEFAULT_SPRITE, Layers.UI));
        this.ghostRenderer.blendMode = PIXI.BLEND_MODES.ADD;

        Mediator.on(GameEvent.POST_UPDATE, this.postUpdate.bind(this));
    }

    public postUpdate(): void {
        const renderer = this.ghost.getSystem(SYSTEM.RENDER_SYSTEM) as RenderSystem;
        if (this.world.isTileFree(this.ghost.position)) {
            renderer.colour = 0x0088DD;
        } else {
            renderer.colour = 0xFF0000;
        }
    }

    public setSprite(sprite: string | PIXI.Sprite | PIXI.Texture): void {
        this.ghostRenderer.setSprite(sprite);
    }

    public setVisible(visible: boolean): void {
        if (this.visible === visible) return;
        this.visible = visible;

        this.ghostRenderer.visible = this.visible;
    }
}
