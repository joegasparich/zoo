import { Assets } from "consts";
import { Entity } from "entities";
import { InputToPhysicsComponent, SolidComponent, RenderComponent, SimplePhysicsComponent, NeedsComponent, PathFollowComponent } from "entities/components";
import { AssetManager } from "managers";
import { ActorInputComponent, AreaPathFollowComponent, ElevationComponent, TileObjectComponent } from "entities/components";
import { AnimalData, TileObjectData } from "types/AssetTypes";
import Game from "Game";
import SpriteSheet from "SpriteSheet";
import Vector from "vector";
import { Need, NeedType } from "entities/components/NeedsComponent";
import AnimalBehaviourComponent from "entities/components/AnimalBehaviourComponent";

export function createDude(): Entity {
    const spritesheet = new SpriteSheet({
        imageUrl: Assets.SPRITESHEETS.DUDE_RUN,
        cellHeight: 24,
        cellWidth: 24,
    });

    const dude = this.createActor(new Vector(4));

    dude.addComponent(new AreaPathFollowComponent());
    dude.addComponent(new ActorInputComponent());
    dude.addComponent(new InputToPhysicsComponent());

    const renderer = dude.getComponent("RENDER_COMPONENT");
    renderer.setSpriteSheet(spritesheet, 0);
    renderer.scale = 0.5;

    return dude;
}

export function createAnimal(assetPath: string, position: Vector): Entity {
    const data = AssetManager.getJSON(assetPath) as AnimalData;

    const animal = createActor(position);

    animal.addComponent(new PathFollowComponent());
    animal.addComponent(new NeedsComponent([
        new Need(NeedType.Hunger, 0.004, 1, true),
        new Need(NeedType.Thirst, 0.005, 1, true),
        new Need(NeedType.Hunger, 0.0025, 0.5, true),
    ]));
    animal.addComponent(new AnimalBehaviourComponent());
    animal.addComponent(new InputToPhysicsComponent());

    const renderer = animal.getComponent("RENDER_COMPONENT");
    renderer.setSprite(data.sprite);
    renderer.scale = 0.5;

    return animal;
}

export function createActor(position: Vector): Entity {
    const actor = new Entity(position);

    actor.addComponent(new RenderComponent());
    actor.addComponent(new SimplePhysicsComponent());
    actor.addComponent(new ElevationComponent());

    return actor;
}

export function createTileObject(assetPath: string, position: Vector, size = new Vector(1, 1)): Entity {
    if (!Game.map.isTileFree(position)) return;

    const data = AssetManager.getJSON(assetPath) as TileObjectData;

    const tileObject = new Entity(position.floor().add(new Vector(0.5)));
    tileObject.addComponent(new RenderComponent(data.sprite, undefined,
        new Vector(
            1/size.x * data.pivot.x,
            1/size.y * data.pivot.y,
        ),
    ));
    tileObject.addComponent(new ElevationComponent());
    if (data.solid) {
        tileObject.addComponent(new SolidComponent(size));
    }
    tileObject.addComponent(new TileObjectComponent()).setAsset(assetPath);

    return tileObject;
}
