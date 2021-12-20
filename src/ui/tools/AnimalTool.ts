import { Inputs } from "consts";
import { AnimalData } from "types/AssetTypes";
import PlacementGhost from "ui/PlacementGhost";
import { Tool, ToolType } from ".";
import Game from "Game";
import { AssetManager } from "managers";
import { createAnimal } from "helpers/entityGenerators";
import Vector from "vector";

export default class AnimalTool extends Tool {
    public type = ToolType.TileObject;

    private assetPath: string;
    private currentAnimal: AnimalData;

    public set(ghost: PlacementGhost, data?: Record<string, any>): void {
        this.assetPath = data.assetPath;
        this.currentAnimal = AssetManager.getJSON(this.assetPath) as AnimalData;

        ghost.setSprite(this.currentAnimal.sprite);
        ghost.setScale(0.5);
        ghost.setSnap(false);
        ghost.applyElevation();
        ghost.canPlaceFunction = this.canPlace.bind(this);
    }

    public update(): void {
        const mouseWorldPos = Game.camera.screenToWorldPosition(Game.input.getMousePos());

        if (Game.input.isInputPressed(Inputs.LeftMouse)) {
            if (this.canPlace(mouseWorldPos)) {
                const placePos: Vector = mouseWorldPos;

                const animal = createAnimal(this.assetPath, placePos);

                this.toolManager.pushAction({
                    name: `Place ${this.currentAnimal.name}`,
                    data: { animal },
                    undo: (data: any): void => {
                        data.animal.remove();
                    },
                });
            }
        }
    }

    public postUpdate(): void {}

    private canPlace(position: Vector): boolean {
        if (!Game.map.isTileFree(position)) return false;
        if (!Game.map.isPositionInMap(position)) return false;

        return true;
    }
}
