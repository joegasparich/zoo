import {  COMPONENT, Component } from "entities/components";
import { TileObjectData } from "types/AssetTypes";
import { AssetManager } from "managers";
import { ComponentSaveData } from "entities/components/Component";
import { Entity } from "entities";
import Game from "Game";
import Vector from "vector";

interface TileObjectComponentSaveData extends ComponentSaveData {
    assetPath: string;
}

export default class TileObjectComponent extends Component {
    public id: COMPONENT = "TILE_OBJECT_COMPONENT";
    public type: COMPONENT = "TILE_OBJECT_COMPONENT";

    public assetPath: string;
    public data: TileObjectData;

    public start(entity: Entity): void {
        super.start(entity);

        Game.world.registerTileObject(this.entity);
    }

    public end(): void {
        Game.world.unregisterTileObject(this.entity);
    }

    public getCorners(): Vector[] {
        const tile = this.entity.position.floor();

        return [
            tile,
            tile.add(new Vector(1, 0)),
            tile.add(new Vector(0, 1)),
            tile.add(new Vector(1, 1)),
        ];
    }

    public setAsset(assetPath: string): void {
        this.assetPath = assetPath;
        this.data = AssetManager.getJSON(assetPath) as TileObjectData;
    }

    public save(): TileObjectComponentSaveData {
        return {
            ...super.save(),
            assetPath: this.assetPath,
        };
    }

    public load(data: TileObjectComponentSaveData): void {
        super.load(data);

        this.setAsset(data.assetPath);
    }
}
