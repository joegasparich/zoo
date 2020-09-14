import { promises as fs } from "fs";

class FileManager {

    public async saveToFile(path: string, data: Object): Promise<void> {
        const json = JSON.stringify(data);

        await fs.writeFile(path, json);
    }
}

export default new FileManager();
