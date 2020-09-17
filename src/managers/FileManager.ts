import { promises as fs } from "fs";

function isErrorNotFound(err: any): boolean {
    return err.code === "ENOENT";
}

export function isFolder(path: string): Promise<boolean> {
    return fs
        .stat(path)
        .then(fsStat => {
            return fsStat.isDirectory();
        })
        .catch(err => {
            if (isErrorNotFound(err)) {
                return false;
            }
            throw err;
        });
}

class FileManager {
    public async saveToFile(path: string, fileName: string, data: any): Promise<void> {
        const json = JSON.stringify(data);

        if (!await isFolder(path)) {
            await fs.mkdir(path);
        }
        await fs.writeFile(path + fileName, json);
    }

    public async loadFromFile(path: string): Promise<any> {
        const file = await fs.readFile(path);

        const data = JSON.parse(file.toString());

        return data;
    }
}

export default new FileManager();
