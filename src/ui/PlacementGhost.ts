import { Layers, Vector } from "engine";
import { GameEvent } from "engine/consts";
import { Entity } from "engine/entities";
import { RenderSystem, SYSTEM } from "engine/entities/systems";
import Mediator from "engine/Mediator";
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
    private offset: Vector;

    public constructor(game: ZooGame) {
        this.game = game;
        this.world = game.world;

        this.ghost = new Entity(this.game, this.game.input.getMousePos());
        this.ghost.addSystem(new FollowMouseSystem());
        this.ghost.addSystem(new SnapToGridSystem());
        this.ghostRenderer = this.ghost.addSystem(new RenderSystem(DEFAULT_SPRITE, Layers.UI));
        this.ghostRenderer.alpha = 0.6;

        this.offset = new Vector(0, 0);
    }

    public postUpdate(): void {
        if (!this.visible) return;

        if (this.mode === Mode.Sprite) {
            const renderer = this.ghost.getSystem(SYSTEM.RENDER_SYSTEM) as RenderSystem;
            if (this.world.isTileFree(this.ghost.position)) {
                renderer.colour = 0x0088DD;
            } else {
                renderer.colour = 0xFF0000;
            }
            this.ghost.position = this.ghost.position.add(this.offset);
        }
        if (this.mode === Mode.Draw) {
            this.drawFunction(this.game.camera.screenToWorldPosition(this.game.input.getMousePos()));
        }
    }

    public setSprite(sprite: string | PIXI.Sprite | PIXI.Texture): void {
        this.mode = Mode.Sprite;
        this.ghostRenderer.setSprite(sprite);
        this.ghostRenderer.visible = true;
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

    public setSnap(snap: boolean, gridSize?: number): void {
        const system = this.ghost.getSystem(ZOO_SYSTEM.SNAP_TO_GRID_SYSTEM) as SnapToGridSystem;
        if (system) {
            system.gridSize = gridSize ?? 1;
        }

        if (this.snap === snap) return;
        this.snap = snap;

        if (snap) {
            this.ghost.addSystem(new SnapToGridSystem(gridSize));
        } else {
            this.ghost.removeSystem(ZOO_SYSTEM.SNAP_TO_GRID_SYSTEM);
        }
    }

    public setPivot(pivot: Vector): void {
        this.ghostRenderer.pivot = pivot;
    }

    public setOffset(offset: Vector): void {
        this.offset = offset;
    }
}
