import { FileManager } from "managers";
import Entity, { EntitySaveData } from "entities/Entity";
import System, { SystemSaveData } from "entities/systems/System";
import { AnimatedRenderSystem, CameraFollowSystem, InputToPhysicsSystem, PathBlockSystem, PathFollowSystem, PhysicsSystem, RenderSystem, SYSTEM, WallAvoidanceSystem } from "entities/systems";
import { PhysicsSystemSaveData } from "entities/systems/PhysicsSystem";
import { ColliderType } from "managers";

import Game from "Game";
import { BiomeSaveData } from "world/BiomeGrid";
import { WallGridSaveData } from "world/WallGrid";
import { WorldSaveData } from "world/World";
import { ElevationSaveData } from "world/ElevationGrid";
import ZooScene from "scenes/ZooScene";
import { ActorInputSystem, AreaPathFollowSystem, ElevationSystem, FollowMouseSystem, SnapToGridSystem, TileObjectSystem } from "entities/systems";
import Vector from "vector";

const SAVE_GAME_LOCATION = "saves/";

interface SaveData {
    biomes: BiomeSaveData;
    walls: WallGridSaveData;
    areas: WorldSaveData;
    elevation: ElevationSaveData;
    entities: EntitySaveData[];
}

function createSystem(systemData: SystemSaveData): System {
    switch(systemData.id) {
        case SYSTEM.RENDER_SYSTEM: return new RenderSystem();
        case SYSTEM.ANIMATED_RENDER_SYSTEM: return new AnimatedRenderSystem();
        case SYSTEM.CAMERA_FOLLOW_SYSTEM: return new CameraFollowSystem();
        case SYSTEM.PATH_FOLLOW_SYSTEM: return new PathFollowSystem();
        case SYSTEM.PHYSICS_SYSTEM:
            const data = systemData as PhysicsSystemSaveData;
            return new PhysicsSystem({
                type: data.collider.type as ColliderType,
                height: data.collider.height,
                width: data.collider.width,
                radius: data.collider.radius,
            }, data.isDynamic, data.density, data.tag, Vector.Deserialize(data.pivot));
        case SYSTEM.WALL_AVOIDANCE_SYSTEM: return new WallAvoidanceSystem();
        case SYSTEM.INPUT_TO_PHYSICS_SYSTEM: return new InputToPhysicsSystem();
        case SYSTEM.PATH_BLOCK_SYSTEM: return new PathBlockSystem();

        case SYSTEM.ACTOR_INPUT_SYSTEM: return new ActorInputSystem();
        case SYSTEM.AREA_PATH_FOLLOW_SYSTEM: return new AreaPathFollowSystem();
        case SYSTEM.FOLLOW_MOUSE_SYSTEM: return new FollowMouseSystem();
        case SYSTEM.SNAP_TO_GRID_SYSTEM: return new SnapToGridSystem();
        case SYSTEM.ELEVATION_SYSTEM: return new ElevationSystem();
        case SYSTEM.TILE_OBJECT_SYSTEM: return new TileObjectSystem();
        default: return undefined;
    }
}

class SaveManager {

    public saveGame(): void {

        const entities = Game.getEntities();
        console.log(entities);
        // Get a bunch of save data
        const saveData: SaveData = {
            biomes: Game.world.biomeGrid.save(),
            walls: Game.world.wallGrid.save(),
            areas: Game.world.save(),
            elevation: Game.world.elevationGrid.save(),
            entities: entities?.length ? entities.filter(entity => entity.saveable).map(entity => entity.save()) : [],
        };

        FileManager.saveToFile(SAVE_GAME_LOCATION, "save.json", saveData);
    }

    public loadGame(): void {
        FileManager.loadFromFile(SAVE_GAME_LOCATION + "/save.json").then(data => {
            const saveData: SaveData = data as SaveData;
            console.log(saveData);

            // Load scene
            // This resets everything to base
            Game.sceneManager.loadScene(
                new ZooScene(),
                (progress: number) => {
                    console.log(`Map Load Progress: ${progress}%`);
                },
            );

            // Use save data to set game state
            Game.world.biomeGrid.load(saveData.biomes);
            Game.world.wallGrid.load(saveData.walls);
            Game.world.load(saveData.areas);
            Game.world.elevationGrid.load(saveData.elevation);

            saveData.entities.forEach(entityData => {
                const entity = new Entity(Vector.Deserialize(entityData.position), true);
                entity.id = entityData.id;

                entityData.systemData.forEach(systemData => {
                    const system = createSystem(systemData);
                    if (!system) return;

                    entity.addSystem(system);
                    system.load(systemData);
                });
            });
        });
    }
}

export default new SaveManager();
