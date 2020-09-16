import FileManager from "engine/managers/FileManager";

import ZooGame from "ZooGame";
import { BiomeSaveData } from "world/BiomeGrid";
import { WallGridSaveData } from "world/WallGrid";
import { AreaSaveData } from "world/World";
import { ElevationSaveData } from "world/ElevationGrid";
import ZooScene from "scenes/ZooScene";

const SAVE_GAME_LOCATION = "saves/";

interface SaveData {
    biomes: BiomeSaveData;
    walls: WallGridSaveData;
    areas: AreaSaveData;
    elevation: ElevationSaveData;
}

class SaveManager {

    public async saveGame(): Promise<void> {
        // Get a bunch of save data
        const saveData: SaveData = {
            biomes: ZooGame.world.biomeGrid.save(),
            walls: ZooGame.world.wallGrid.save(),
            areas: ZooGame.world.saveAreas(),
            elevation: ZooGame.world.elevationGrid.save(),
        };

        FileManager.saveToFile(SAVE_GAME_LOCATION, "save.json", saveData);
    }

    public async loadGame(): Promise<void> {
        const saveData: SaveData = await FileManager.loadFromFile(SAVE_GAME_LOCATION + "/save.json") as SaveData;
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

        //for each entity {
        // Create entity
        // for each system {
        //  create system by id
        //  load system
        // }
        // register entity (starts entity and all systems)
    }
}

export default new SaveManager();
