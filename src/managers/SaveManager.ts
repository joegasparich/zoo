import { FileManager } from "managers";
import Entity, { EntitySaveData } from "entities/Entity";

import Game from "Game";
import { WorldSaveData } from "world/World";
import ZooScene from "scenes/ZooScene";

const SAVE_GAME_LOCATION = "saves/";

interface SaveData {
    world: WorldSaveData;
    entities: EntitySaveData[];
}

class SaveManager {

    public saveGame(): void {

        const entities = Game.getEntities();
        // Get a bunch of save data
        const saveData: SaveData = {
            world: Game.world.save(),
            entities: entities?.length ? entities.filter(entity => entity.saveable).map(entity => entity.save()) : [],
        };

        FileManager.saveToFile(SAVE_GAME_LOCATION, "save.json", saveData);
    }

    public loadGame(): void {
        FileManager.loadFromFile(SAVE_GAME_LOCATION + "/save.json").then(data => {
            const saveData: SaveData = data as SaveData;
            console.log("Loading from Save:");
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
            Game.world.load(saveData.world);

            saveData.entities.forEach(entityData => Entity.loadEntity(entityData));

            Game.world.postLoad(saveData.world);
        });
    }
}

export default new SaveManager();
