import FileManager from "engine/managers/FileManager";

const SAVE_GAME_LOCATION = "/saves/save.json";

class SaveManager {

    public async saveGame(): Promise<void> {
        // Get a bunch of save data
        const saveData = {
            didItWork: "yes",
        };

        FileManager.saveToFile(SAVE_GAME_LOCATION, saveData);
    }
}

export default new SaveManager();
