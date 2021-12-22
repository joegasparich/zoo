import { Assets, Config, Inputs } from "consts";
import { Tool, ToolType } from ".";
import PlacementGhost from "ui/PlacementGhost";
import Game from "Game";
import Vector from "vector";
import Graphics from "Graphics";
import { WallGridSaveData } from "world/WallGrid";
import Entity, { EntitySaveData } from "entities/Entity";
import { PathGridSaveData } from "world/PathGrid";

const UI_COLOUR = 0xff0000;

export default class DeleteTool extends Tool {
    public type = ToolType.Delete;

    private startPos: Vector;

    public set(ghost: PlacementGhost): void {
        ghost.setSprite(Assets.UI.BIN_ICON);
        ghost.setPivot(new Vector(0.5, 0.5));
        ghost.changeColour = false;
        ghost.setAlpha(1);
        ghost.setScale(0.5);
        ghost.drawFunction = (pos: Vector): void => {
            if (Game.input.isInputHeld(Inputs.LeftMouse)) return;

            const worldCellPos = pos.floor().multiply(Config.WORLD_SCALE);
            Graphics.setLineStyle(1, UI_COLOUR);
            Graphics.drawRect(worldCellPos.x, worldCellPos.y, Config.WORLD_SCALE, Config.WORLD_SCALE);
        };
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            this.startPos = mouseWorldPos;
        }

        // Dragging
        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            if (this.startPos) {
                const xSign = Math.sign(mouseWorldPos.x - this.startPos.x) || 1; // Ensure never 0 so that we get at least one square
                const ySign = Math.sign(mouseWorldPos.y - this.startPos.y) || 1;
                const width = mouseWorldPos.floor().x - this.startPos.floor().x + xSign;
                const height = mouseWorldPos.floor().y - this.startPos.floor().y + ySign;

                if (height === 0 || width === 0) return;
                Graphics.setLineStyle(1, UI_COLOUR);
                Graphics.drawRect(
                    (this.startPos.floor().x + Math.max(-xSign, 0)) * Config.WORLD_SCALE,
                    (this.startPos.floor().y + Math.max(-ySign, 0)) * Config.WORLD_SCALE,
                    width * Config.WORLD_SCALE,
                    height * Config.WORLD_SCALE,
                );
            }
        }

        // Do deletion
        if (Game.input.isInputReleased(Inputs.LeftMouse)) {
            if (this.startPos) {
                let pos;

                this.toolManager.pushAction({
                    name: "Delete",
                    data: {
                        paths: Game.world.pathGrid.save(),
                        walls: Game.world.wallGrid.save(),
                        tileObjects: Game.world.getTileObjects().map(obj => obj.save()),
                    },
                    undo: (data: any): void => {
                        const paths = data.paths as PathGridSaveData;
                        const walls = data.walls as WallGridSaveData;
                        const tileObjects = data.tileObjects as EntitySaveData[];

                        Game.world.pathGrid.load(paths);
                        Game.world.wallGrid.load(walls);
                        tileObjects.forEach(data => Entity.loadEntity(data));
                    },
                });

                for (
                    let i = Math.min(this.startPos.floor().x, mouseWorldPos.floor().x);
                    i <= Math.max(this.startPos.floor().x, mouseWorldPos.floor().x);
                    i++
                ) {
                    for (
                        let j = Math.min(this.startPos.floor().y, mouseWorldPos.floor().y);
                        j <= Math.max(this.startPos.floor().y, mouseWorldPos.floor().y);
                        j++
                    ) {
                        pos = new Vector(i, j);
                        // Delete paths
                        Game.world.pathGrid.deletePathAtPosition(pos);
                        // Delete tile objects
                        Game.world.getTileObjectAtPos(pos)?.remove();
                    }
                }
                Game.world.wallGrid
                    .getWallsInArea(
                        new Vector(
                            Math.min(this.startPos.floor().x, mouseWorldPos.floor().x),
                            Math.min(this.startPos.floor().y, mouseWorldPos.floor().y),
                        ),
                        new Vector(
                            Math.max(this.startPos.floor().x, mouseWorldPos.floor().x) -
                                Math.min(this.startPos.floor().x, mouseWorldPos.floor().x) +
                                1,
                            Math.max(this.startPos.floor().y, mouseWorldPos.floor().y) -
                                Math.min(this.startPos.floor().y, mouseWorldPos.floor().y) +
                                1,
                        ),
                    )
                    .forEach(wall => {
                        Game.world.wallGrid.deleteWall(wall);
                    });

                this.startPos = undefined;
            }
        }
    }

    public postUpdate(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        if (Game.input.isInputHeld(Inputs.LeftMouse)) {
            this.highlightObjectsToDelete(this.startPos.floor(), mouseWorldPos.floor());
        } else {
            this.highlightObjectsToDelete(mouseWorldPos.floor(), mouseWorldPos.floor());
        }
    }

    private highlightObjectsToDelete(start: Vector, end: Vector) {
        for (let i = Math.min(start.floor().x, end.floor().x); i <= Math.max(start.floor().x, end.floor().x); i++) {
            for (let j = Math.min(start.floor().y, end.floor().y); j <= Math.max(start.floor().y, end.floor().y); j++) {
                const pos = new Vector(i, j);

                Game.world.pathGrid.getPathAtTile(pos)?.overrideColourForFrame(UI_COLOUR);
                Game.world.getTileObjectAtPos(pos)?.getComponent("RENDER_COMPONENT")?.overrideColourForFrame(UI_COLOUR);
            }
        }
        Game.world.wallGrid
            .getWallsInArea(
                new Vector(Math.min(start.floor().x, end.floor().x), Math.min(start.floor().y, end.floor().y)),
                new Vector(
                    Math.max(start.floor().x, end.floor().x) - Math.min(start.floor().x, end.floor().x) + 1,
                    Math.max(start.floor().y, end.floor().y) - Math.min(start.floor().y, end.floor().y) + 1,
                ),
            )
            .forEach(wall => {
                wall.overrideColourForFrame(UI_COLOUR);
            });
    }
}
