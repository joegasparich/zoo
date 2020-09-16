import FileManager from "engine/managers/FileManager";
import Entity, { EntitySaveData } from "engine/entities/Entity";
import System, { SystemSaveData } from "engine/entities/systems/System";
import { AnimatedRenderSystem, CameraFollowSystem, InputToPhysicsSystem, PathFollowSystem, PhysicsSystem, RenderSystem, SYSTEM, WallAvoidanceSystem } from "engine/entities/systems";
import { PhysicsSystemSaveData } from "engine/entities/systems/PhysicsSystem";
import { ColliderType } from "engine/managers";
import { Vector } from "engine";

import ZooGame from "ZooGame";
import { BiomeSaveData } from "world/BiomeGrid";
import { WallGridSaveData } from "world/WallGrid";
import { AreaSaveData } from "world/World";
import { ElevationSaveData } from "world/ElevationGrid";
import ZooScene from "scenes/ZooScene";
import { ActorInputSystem, AreaPathFollowSystem, ElevationSystem, FollowMouseSystem, SnapToGridSystem, ZOO_SYSTEM } from "entities/systems";

const SAVE_GAME_LOCATION = "saves/";

interface SaveData {
    biomes: BiomeSaveData;
    walls: WallGridSaveData;
    areas: AreaSaveData;
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
        case ZOO_SYSTEM.ACTOR_INPUT_SYSTEM: return new ActorInputSystem();
        case ZOO_SYSTEM.AREA_PATH_FOLLOW_SYSTEM: return new AreaPathFollowSystem();
        case ZOO_SYSTEM.FOLLOW_MOUSE_SYSTEM: return new FollowMouseSystem();
        case ZOO_SYSTEM.SNAP_TO_GRID_SYSTEM: return new SnapToGridSystem();
        case ZOO_SYSTEM.ELEVATION_SYSTEM: return new ElevationSystem();
        default: return undefined;
    }
}

class SaveManager {

    public saveGame(): void {

        const entities = ZooGame.getEntities();
        console.log(entities);
        // Get a bunch of save data
        const saveData: SaveData = {
            biomes: ZooGame.world.biomeGrid.save(),
            walls: ZooGame.world.wallGrid.save(),
            areas: ZooGame.world.saveAreas(),
            elevation: ZooGame.world.elevationGrid.save(),
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
            ZooGame.sceneManager.loadScene(
                new ZooScene(),
                (progress: number) => {
                    console.log(`Map Load Progress: ${progress}%`);
                },
            );

            // Use save data to set game state
            ZooGame.world.biomeGrid.load(saveData.biomes);
            ZooGame.world.wallGrid.load(saveData.walls);
            ZooGame.world.loadAreas(saveData.areas);
            ZooGame.world.elevationGrid.load(saveData.elevation);

            saveData.entities.forEach(entityData => {
                const entity = new Entity(ZooGame, Vector.Deserialize(entityData.position), true);
                entity.id = entityData.id;

                entityData.systemData.forEach(systemData => {
                    const system = createSystem(systemData);
                    if (!system) return;

                    entity.addSystem(system);
                    system.load(systemData);
                });

                ZooGame.registerEntity(entity);
            });
        });
    }
}

export default new SaveManager();
