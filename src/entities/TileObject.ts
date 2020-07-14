import { Entity } from "engine/entities";
import { RenderSystem, PhysicsSystem } from "engine/entities/systems";
import { Game, Vector } from "engine";
import { AssetManager } from "engine/managers";
import { TileObjectData } from "types/AssetTypes";

export default class TileObject extends Entity {
    render: RenderSystem;
    physics: PhysicsSystem;
    blocksPath: boolean;

    constructor(game: Game, pos: Vector, data: TileObjectData, blocksPath = false) {
        super(game, pos);

        const sprite = data.sprite;

        this.render = this.addSystem(new RenderSystem(sprite));
        this.physics = this.addSystem(new PhysicsSystem(data.collider, false, 1));
        this.blocksPath = blocksPath;
    }

    public start(): void {
        // Centre in tile
        this.position = this.position.floor().add(new Vector(0.5, 0.5));

        super.start();
    }

    public static async loadTileObjectData(path: string): Promise<TileObjectData> {
        const resource = await AssetManager.loadResource(path);
        const data = resource.data as TileObjectData;
        await AssetManager.loadResource(data.sprite);
        return data;
    }
}
