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

            saveData.entities.forEach(entityData => Entity.loadEntity(entityData));
        });
    }
}

export default new SaveManager();
