import { COMPONENT, Component } from "entities/components";
import { TileObjectData } from "types/AssetTypes";
import { AssetManager } from "managers";
import { ComponentSaveData } from "entities/components/Component";
import { Entity } from "entities";
import Game from "Game";
import Vector from "vector";
import RenderComponent from "./RenderComponent";

export interface TileObjectComponentSaveData extends ComponentSaveData {
    assetPath: string;
    rotation: number;
}

export default class TileObjectComponent extends Component {
    public id: COMPONENT = "TILE_OBJECT_COMPONENT";
    public type: COMPONENT = "TILE_OBJECT_COMPONENT";

    public requires: COMPONENT[] = ["RENDER_COMPONENT"];

    private renderer: RenderComponent;

    public assetPath: string;
    public data: TileObjectData;

    public rotation = 0;

    public start(entity: Entity): void {
        super.start(entity);

        Game.world.registerTileObject(this.entity);

        this.renderer = entity.getComponent("RENDER_COMPONENT");
        this.setRotation(this.rotation);
    }

    public end(): void {
        Game.world.unregisterTileObject(this.entity);
    }

    public getCorners(): Vector[] {
        const tile = this.entity.position.floor();

        return [
            tile,
            tile.add(new Vector(this.data.size.x, 0)),
            tile.add(new Vector(0, this.data.size.y)),
            tile.add(new Vector(this.data.size.x, this.data.size.y)),
        ];
    }

    public setAsset(assetPath: string): void {
        this.assetPath = assetPath;
        this.data = AssetManager.getJSON(assetPath) as TileObjectData;
    }

    public setRotation(rotation: number): void {
        if (this.data.rotations && rotation < this.data.rotations) {
            this.renderer.setSpriteSheetIndex(rotation);
            this.rotation = rotation;
        }
    }

    public save(): TileObjectComponentSaveData {
        return {
            ...super.save(),
            assetPath: this.assetPath,
            rotation: this.rotation,
        };
    }

    public load(data: TileObjectComponentSaveData): void {
        super.load(data);

        this.setAsset(data.assetPath);
        this.rotation = data.rotation;
    }

    public printDebug(): void {
        super.printDebug();

        console.log("Tile Object Data:");
        console.log(this.data);
    }
}
