import { Assets } from "consts";
import { SpriteSheet, Vector } from "engine";
import { TAG } from "engine/consts";
import { Entity } from "engine/entities";
import { CameraFollowSystem, InputToPhysicsSystem, PathBlockSystem, PhysicsSystem, RenderSystem, SYSTEM, WallAvoidanceSystem } from "engine/entities/systems";
import { AssetManager, ColliderType } from "engine/managers";
import { ActorInputSystem, AreaPathFollowSystem, ElevationSystem, TileObjectSystem } from "entities/systems";
import { TileObjectData } from "types/AssetTypes";
import ZooGame from "ZooGame";

export function createDude(): Entity {
    const spritesheet = new SpriteSheet({
        imageUrl: Assets.SPRITESHEETS.DUDE_RUN,
        cellHeight: 24,
        cellWidth: 24,
    });

    const dude = this.createActor(new Vector(4));

    dude.addSystem(new AreaPathFollowSystem());
    dude.addSystem(new CameraFollowSystem());
    dude.addSystem(new ActorInputSystem());

    const renderer = dude.getSystem(SYSTEM.RENDER_SYSTEM) as RenderSystem;
    renderer.setSpriteSheet(spritesheet, 0);
    renderer.scale = 0.5;

    return dude;
}

export function createActor(position: Vector): Entity {
    const actor = new Entity(
        ZooGame,
        position,
    );
    actor.addSystem(new RenderSystem());
    actor.addSystem(new PhysicsSystem({ type: ColliderType.Circle, radius: 0.15 }, true, 20));
    actor.addSystem(new ElevationSystem());
    actor.addSystem(new WallAvoidanceSystem());
    actor.addSystem(new InputToPhysicsSystem());

    return actor;
}

// This is how we do
export function createTileObject(assetPath: string, position: Vector): Entity {
    if (!ZooGame.map.isTileFree(position)) return;

    const data = AssetManager.getJSON(assetPath) as TileObjectData;

    const tileObject = new Entity(ZooGame, position.floor().add(new Vector(0.5)));
    tileObject.addSystem(new RenderSystem(data.sprite, undefined, data.pivot));
    tileObject.addSystem(new ElevationSystem());
    if (data.solid) {
        tileObject.addSystem(new PhysicsSystem(data.collider, false, 1, TAG.Solid, data.pivot));
        tileObject.addSystem(new PathBlockSystem());
    }
    tileObject.addSystem(new TileObjectSystem()).setAsset(assetPath);

    return tileObject;
}
