import {  SYSTEM, System } from "entities/systems";
import { TileObjectData } from "types/AssetTypes";
import { AssetManager } from "managers";
import { SystemSaveData } from "entities/systems/System";
import { Entity } from "entities";
import Game from "Game";
import Vector from "vector";

interface TileObjectSystemSaveData extends SystemSaveData {
    assetPath: string;
}

export default class TileObjectSystem extends System {
    public id = SYSTEM.TILE_OBJECT_SYSTEM;
    public type = SYSTEM.TILE_OBJECT_SYSTEM;

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

    public save(): TileObjectSystemSaveData {
        return Object.assign({
            assetPath: this.assetPath,
        }, super.save());
    }

    public load(data: TileObjectSystemSaveData): void {
        super.load(data);

        this.setAsset(data.assetPath);
    }
}
