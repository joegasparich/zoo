import { Assets } from "consts";
import { SpriteSheet, Vector } from "engine";
import { Entity } from "engine/entities";
import { CameraFollowSystem, InputToPhysicsSystem, PhysicsSystem, RenderSystem, SYSTEM, WallAvoidanceSystem } from "engine/entities/systems";
import { ColliderType } from "engine/managers";
import { ActorInputSystem, AreaPathFollowSystem, ElevationSystem } from "entities/systems";
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
