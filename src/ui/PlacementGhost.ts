import { Layers, Vector } from "engine";
import { Entity } from "engine/entities";
import { RenderSystem } from "engine/entities/systems";
import { FollowMouseSystem, SnapToGridSystem, ZOO_SYSTEM } from "entities/systems";

import { Assets } from "consts";
import World from "world/World";
import ZooGame from "ZooGame";

// Should never be seen
const DEFAULT_SPRITE = Assets.SPRITES.TREE;

enum Mode {
    Sprite,
    Draw
}

export default class PlacementGhost {
    private game: ZooGame;
    private world: World;

    private ghost: Entity;
    private ghostRenderer: RenderSystem;
    private drawFunction: Function;

    private visible: boolean;
    private mode: Mode;
    private snap: boolean;
    private follow: boolean;

    public canPlaceFunction = this.canPlace;

    public constructor(game: ZooGame, shouldFollowMouse = true) {
        this.game = game;
        this.world = game.world;

        this.ghost = new Entity(this.game, this.game.input.getMousePos());
        if (shouldFollowMouse) this.ghost.addSystem(new FollowMouseSystem());
        this.ghost.addSystem(new SnapToGridSystem());
        this.ghostRenderer = this.ghost.addSystem(new RenderSystem(DEFAULT_SPRITE, Layers.UI));
        this.ghostRenderer.alpha = 0.6;

        this.visible = true;
    }

    public postUpdate(): void {
        if (!this.visible) return;

        if (this.mode === Mode.Sprite) {
            if (this.canPlaceFunction(this.ghost.position)) {
                this.ghostRenderer.colour = 0x0088DD;
            } else {
                this.ghostRenderer.colour = 0xFF0000;
            }
        }
        if (this.mode === Mode.Draw) {
            this.drawFunction(this.game.camera.screenToWorldPosition(this.game.input.getMousePos()));
        }
    }

    private canPlace(position: Vector): boolean {
        return this.world.isTileFree(position);
    }

    public setSprite(sprite: string | PIXI.Sprite | PIXI.Texture): void {
        this.mode = Mode.Sprite;
        this.ghostRenderer.setSprite(sprite);
        this.ghostRenderer.visible = this.visible;
    }

    public setDrawFunction(fn: (pos: Vector) => void): void {
        this.mode = Mode.Draw;
        this.ghostRenderer.visible = false;
        this.drawFunction = fn;
    }

    public setVisible(visible: boolean): void {
        if (this.visible === visible) return;
        this.visible = visible;

        this.ghostRenderer.visible = this.visible;
    }

    public isVisible(): boolean {
        return this.visible;
    }

    public setSnap(snap: boolean, gridSize?: number): void {
        const system = this.ghost.getSystem(ZOO_SYSTEM.SNAP_TO_GRID_SYSTEM) as SnapToGridSystem;
        if (system) {
            system.gridSize = gridSize ?? 1;
        }

        if (this.snap === snap) return;
        this.snap = snap;

        system.disabled = !snap;
    }

    public setFollow(follow: boolean): void {
        const system = this.ghost.getSystem(ZOO_SYSTEM.FOLLOW_MOUSE_SYSTEM) as FollowMouseSystem;

        if (this.follow === follow) return;
        this.follow = follow;

        system.disabled = !follow;
    }

    public getPosition(): Vector {
        return this.ghost.position;
    }
    public setPosition(position: Vector): void {
        this.ghost.position = position;
    }

    // Based on sprite size
    public setPivot(pivot: Vector): void {
        this.ghostRenderer.pivot = pivot;
    }

    // Based on world scale
    public setOffset(offset: Vector): void {
        this.ghostRenderer.offset = offset;
    }

    public destroy(): void {
        this.ghost.remove();
    }
}
