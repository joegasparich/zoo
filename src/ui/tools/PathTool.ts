import { Inputs } from "consts";
import { PathData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import Game from "Game";
import { AssetManager } from "managers";
import Vector from "vector";
import Path from "world/Path";

export default class PathTool extends Tool {
    public type = ToolType.Path;

    private assetPath: string;
    private pathData: PathData;

    private dragStartPos: Vector;
    private ghost: PlacementGhost;
    private pathGhosts: PlacementGhost[];
    private isDragging: boolean;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.ghost = ghost;
        this.assetPath = data.assetPath;
        this.pathData = AssetManager.getJSON(this.assetPath) as PathData;
        const spriteSheet = Path.pathSprites.get(this.pathData.spriteSheet);

        this.ghost.setSpriteSheet(spriteSheet, 0);
        this.ghost.setPivot(new Vector(0.5, 0.75));
        this.ghost.setSnap(true);
        this.ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        const xDif = mouseWorldPos.floor().x - this.dragStartPos?.floor().x;
        const yDif = mouseWorldPos.floor().y - this.dragStartPos?.floor().y;
        const horizontal = Math.abs(xDif) > Math.abs(yDif);
        const length = (horizontal ? Math.abs(xDif) : Math.abs(yDif)) + 1;

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            this.dragStartPos = mouseWorldPos;

            this.pathGhosts = [];
        }
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            this.isDragging = true;

            this.ghost.setSpriteVisible(false);

            let i = Math.floor(this.dragStartPos.x);
            let j = Math.floor(this.dragStartPos.y);
            for (let p = 0; p < this.pathGhosts.length; p++) {
                const ghost = this.pathGhosts[p];
                ghost.setPosition(new Vector(i, j));
                this.setSprite(ghost, new Vector(-0.5, -0.5));

                if (horizontal) {
                    i += Math.sign(mouseWorldPos.floor().x - i);
                } else {
                    j += Math.sign(mouseWorldPos.floor().y - j);
                }
            }

            // Generate the ghost entities after so that they have a chance to initialise
            while (this.pathGhosts.length < length) {
                const ghost = new PlacementGhost();
                ghost.setFollow(false);
                ghost.setPivot(new Vector(0.5, 0.75));
                ghost.canPlaceFunction = this.canPlace.bind(this);
                this.pathGhosts.push(ghost);
            }
            while (this.pathGhosts.length > length) {
                this.pathGhosts.pop().destroy();
            }
        }
        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            this.ghost.setSpriteVisible(true);

            if (!this.pathGhosts) return;

            const paths: Vector[] = [];
            this.pathGhosts.forEach(ghost => {
                const tilePos = ghost.getPosition().floor();

                if (this.canPlace(tilePos)) {
                    Game.world.pathGrid.placePathAtTile(this.assetPath, tilePos);
                    paths.push(tilePos);
                }

                ghost.destroy();
            });

            // TODO: Handle path replacement

            this.toolManager.pushAction({
                name: "Place paths",
                data: { paths },
                undo: (data: any): void => {
                    data.paths.forEach((pos: Vector) => Game.world.pathGrid.deletePathAtPosition(pos));
                },
            });

            this.pathGhosts = [];
            this.isDragging = false;
        }
    }

    public postUpdate(): void {
        this.pathGhosts?.forEach(ghost => ghost.postUpdate());

        this.setSprite(this.ghost, Vector.Zero());
    }

    private setSprite(ghost: PlacementGhost, offset: Vector): void {
        const spriteSheet = Path.pathSprites.get(this.pathData.spriteSheet);
        const [spriteIndex, elevation] = Path.getSpriteIndex(ghost.getPosition()) ?? [];

        ghost.setSpriteSheet(spriteSheet, spriteIndex);
        ghost.setOffset(new Vector(0, -elevation).subtract(offset));
    }

    private canPlace(position: Vector): boolean {
        if (!Game.map.isPositionInMap(position)) return false;
        if (!Game.map.isTileFree(position)) return false;

        if (Game.world.elevationGrid.isPositionSlopeCorner(position)) return false;
        if (Game.world.waterGrid.isPositionWater(position)) return false;
        if (Game.world.pathGrid.getPathAtTile(position)) return false;

        return true;
    }
}
