import { RenderLayers } from "consts";
import Game from "Game";
import { toObservablePoint } from "helpers/vectorHelper";
import { AssetManager } from "managers";
import { Sprite } from "pixi.js";
import SpriteSheet from "SpriteSheet";
import { PathData } from "types/AssetTypes";
import Vector from "vector";
import { SlopeVariant } from "./ElevationGrid";

export enum PathSpriteIndex {
    Flat = 0,
    W = 1,
    E = 2,
    S = 3,
    N = 4,
}

export default class Path {
    public static pathSprites = new Map<string, SpriteSheet>();

    public static getSpriteIndex(pos: Vector): [index: PathSpriteIndex, elevation: number] {
        pos = pos.floor();
        switch (Game.world.elevationGrid.getSlopeVariant(pos)) {
            case SlopeVariant.N:
                return [PathSpriteIndex.N, Game.world.elevationGrid.getBaseElevation(pos)];
            case SlopeVariant.W:
                return [PathSpriteIndex.W, Game.world.elevationGrid.getBaseElevation(pos)];
            case SlopeVariant.E:
                return [PathSpriteIndex.E, Game.world.elevationGrid.getBaseElevation(pos)];
            case SlopeVariant.S:
                return [PathSpriteIndex.S, Game.world.elevationGrid.getBaseElevation(pos)];
            case SlopeVariant.Flat:
            default:
                return [PathSpriteIndex.Flat, Game.world.elevationGrid.getBaseElevation(pos)];
        }
    }

    public data: PathData | undefined;
    public spriteSheet: SpriteSheet;
    public sprite: Sprite;

    private currentSpriteIndex: PathSpriteIndex;
    private currentElevation: number;

    public constructor(public position: Vector, public assetPath?: string) {
        if (assetPath) {
            const data = AssetManager.getJSON(assetPath) as PathData;

            this.data = data;
            this.spriteSheet = Path.pathSprites.get(this.data.spriteSheet);

            this.updateSprite();
        }
    }

    public remove(): void {
        Game.removeFromStage(this.sprite, RenderLayers.GROUND);
        this.data = undefined;
        this.spriteSheet = undefined;
    }

    public updateSprite(): void {
        const [spriteIndex, elevation] = Path.getSpriteIndex(this.position);
        if (this.currentSpriteIndex === spriteIndex && this.currentElevation === elevation) return;

        if (this.sprite) {
            // Remove old sprite
            Game.removeFromStage(this.sprite, RenderLayers.GROUND);
        }

        // Add new sprite
        this.currentSpriteIndex = spriteIndex;
        this.currentElevation = elevation;
        const texture = this.spriteSheet.getTextureByIndex(spriteIndex);
        this.sprite = new Sprite(texture);
        Game.addToStage(this.sprite, RenderLayers.GROUND);
        this.sprite.anchor.set(0, 0.5 + elevation * 0.5);

        this.sprite.position = toObservablePoint(this.position.multiply(Game.opts.worldScale));
    }
}
