import * as path from "path";

import { Tileset } from "engine";
import { MapData, TiledMap, TiledSet } from "engine/map";

import { parseTiledMap, parseTiledSet } from "../helpers/parseTiled";

class AssetManager {
    private loader: PIXI.Loader;
    private tilesets: Map<string, Tileset>;

    constructor() {
        this.loader = new PIXI.Loader();

        this.tilesets = new Map<string, Tileset>();
    }

    loadAssets(assets: string[]): void {
        this.loader.add(assets);
    }

    doLoad(callback: Function): void {
        this.loader.load((loader, resources) => {
            callback();
        });
    }

    getTexture(key: string): PIXI.Texture {
        return this.loader.resources[key].texture;
    }

    getTexturesByType(type: object): PIXI.Texture[] {
        return Object.values(type).map(asset => this.loader.resources[asset].texture);
    }

    loadMap(location: string): Promise<MapData> {
        return new Promise((resolve) => {
            this.loader.add(location);
            this.loader.load((loader, resources) => {
                const tiledMap = parseTiledMap(resources[location].data as TiledMap);

                //Load Tile Sets
                tiledMap.tileSetPath = path.join(location, "..", tiledMap.tileSetPath);
                this.loader.add(tiledMap.tileSetPath);
                this.loader.load((loader, resources) => {
                    // Load Images
                    const tiledSet = resources[tiledMap.tileSetPath].data as TiledSet;
                    const imagePath = path.join(tiledMap.tileSetPath, "..", tiledSet.image);

                    this.loader.add(imagePath);
                    this.loader.load((loader, resources) => {
                        const tileSetData = parseTiledSet(tiledMap.tileSetPath, tiledSet, resources[imagePath].texture);

                        tiledMap.tileSet = new Tileset(tileSetData);

                        resolve(tiledMap);
                    });
                });
            });
        });
    }
}

export default new AssetManager();
