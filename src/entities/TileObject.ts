import { Entity } from "engine/entities";
import { RenderSystem, PhysicsSystem } from "engine/entities/systems";
import { Vector } from "engine";
import { AssetManager } from "engine/managers";
import { TileObjectData } from "types/AssetTypes";
import { TAG } from "engine/consts";
import ZooGame from "ZooGame";
import ElevationSystem from "./systems/ElevationSystem";
import { basename } from "path";

export default class TileObject extends Entity {
    private render: RenderSystem;
    private physics: PhysicsSystem;

    public constructor(pos: Vector, public data: TileObjectData, public blocksPath = false) {
        super(ZooGame, pos);

        const sprite = this.data.sprite;

        this.render = this.addSystem(new RenderSystem(sprite, undefined, this.data.pivot));
        this.physics = this.addSystem(new PhysicsSystem(this.data.collider, false, 1, TAG.Solid, this.data.pivot));
        this.addSystem(new ElevationSystem());
    }

    public start(): void {
        // Centre in tile
        this.position = this.position.floor().add(new Vector(0.5, 0.5));

        super.start();
    }

    public static async loadTileObjectData(path: string): Promise<TileObjectData> {
        const resource = await AssetManager.loadResource(path);
        const data = resource.data as TileObjectData;

        data.pivot = new Vector(data.pivot.x, data.pivot.y); // Ensure data from json is a vector

        await AssetManager.loadResource(data.sprite);
        return data;
    }
}
