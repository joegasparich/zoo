import {  System } from "engine/entities/systems";
import { ZOO_SYSTEM } from ".";
import { TileObjectData } from "types/AssetTypes";
import { AssetManager } from "engine/managers";
import { SystemSaveData } from "engine/entities/systems/System";
import { Entity } from "engine/entities";
import ZooGame from "ZooGame";

interface TileObjectSystemSaveData extends SystemSaveData {
    assetPath: string;
}

export default class TileObjectSystem extends System {
    public id = ZOO_SYSTEM.TILE_OBJECT_SYSTEM;
    public type = ZOO_SYSTEM.TILE_OBJECT_SYSTEM;

    public assetPath: string;
    public data: TileObjectData;

    public start(entity: Entity): void {
        super.start(entity);

        ZooGame.world.registerTileObject(this.entity);
    }

    public end(): void {
        ZooGame.world.unregisterTileObject(this.entity);
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
