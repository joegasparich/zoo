import { Entity } from "entities";
import { RenderSystem, SYSTEM } from "entities/systems";
import { FollowMouseSystem, SnapToGridSystem } from "entities/systems";

import { Assets } from "consts";
import World from "world/World";
import Game from "Game";
import ElevationSystem from "entities/systems/ElevationSystem";
import Vector from "vector";
import SpriteSheet from "SpriteSheet";

// Should never be seen
const DEFAULT_SPRITE = Assets.SPRITES.TREE;

export default class PlacementGhost {
    private world: World;

    private ghost: Entity;
    private ghostRenderer: RenderSystem;

    public drawFunction: Function;
    private spriteVisible: boolean;
    private snap: boolean;
    private follow: boolean;
    private elevation: boolean;

    public changeColour: boolean;
    public canPlaceFunction = this.canPlace;

    public constructor() {
        this.world = Game.world;

        this.ghost = new Entity(Game.input.getMousePos(), false);
        this.ghost.addSystem(new FollowMouseSystem());
        this.ghost.addSystem(new SnapToGridSystem());
        this.ghostRenderer = this.ghost.addSystem(new RenderSystem(DEFAULT_SPRITE));

        this.reset();
    }

    public postUpdate(): void {
        if (this.spriteVisible && this.changeColour) {
            if (this.canPlaceFunction(this.ghost.position)) {
                this.ghostRenderer.colour = 0x0088DD;
            } else {
                this.ghostRenderer.colour = 0xFF0000;
            }
        }

        this.drawFunction(Game.camera.screenToWorldPosition(Game.input.getMousePos()));
    }

    private canPlace(position: Vector): boolean {
        return this.world.isTileFree(position);
    }

    public setSprite(spriteUrl: string): void {
        this.ghostRenderer.setSprite(spriteUrl);
        this.ghostRenderer.visible = this.spriteVisible;
    }
    public setSpriteSheet(spriteSheet: SpriteSheet, index: number): void {
        this.ghostRenderer.setSpriteSheet(spriteSheet, index);
        this.ghostRenderer.visible = this.spriteVisible;
    }

    public setAlpha(alpha: number): void {
        this.ghostRenderer.alpha = alpha;
    }

    public setScale(scale: number): void {
        this.ghostRenderer.scale = scale;
    }

    public setSpriteVisible(visible: boolean): void {
        if (this.spriteVisible === visible) return;
        this.spriteVisible = visible;

        this.ghostRenderer.visible = this.spriteVisible;
    }

    public isVisible(): boolean {
        return this.spriteVisible;
    }

    public setSnap(snap: boolean, gridSize?: number): void {
        const system = this.ghost.getSystem(SYSTEM.SNAP_TO_GRID_SYSTEM) as SnapToGridSystem;
        if (!system) return;

        system.gridSize = gridSize ?? 1;

        if (this.snap === snap) return;
        this.snap = snap;

        system.disabled = !snap;
    }

    public setFollow(follow: boolean): void {
        const system = this.ghost.getSystem(SYSTEM.FOLLOW_MOUSE_SYSTEM) as FollowMouseSystem;
        if (!system) return;

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

    public applyElevation(): void {
        if (this.elevation) return;
        this.elevation = true;

        this.ghost.addSystem(new ElevationSystem());
    }
    public disableElevation(): void {
        if (!this.elevation) return;
        this.elevation = false;

        this.ghost.removeSystem("ELEVATION_SYSTEM");
    }

    // Based on sprite size
    public setPivot(pivot: Vector): void {
        this.ghostRenderer.pivot = pivot;
    }

    // Based on world scale
    public setOffset(offset: Vector): void {
        this.ghostRenderer.offset = offset;
    }

    public reset(): void {
        this.ghostRenderer.colour = 0xFFFFFF;

        this.setSprite(DEFAULT_SPRITE);
        this.setAlpha(0.6);
        this.setScale(1);
        this.setSpriteVisible(true);
        this.drawFunction = () => {};
        this.setPivot(new Vector(0.5));
        this.setOffset(Vector.Zero());
        this.setSnap(false);
        this.setFollow(true);
        this.disableElevation();
        this.canPlaceFunction = this.canPlace;
        this.changeColour = true;
    }

    public destroy(): void {
        this.ghost.remove();
    }
}
