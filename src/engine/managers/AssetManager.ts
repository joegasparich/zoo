import * as path from "path";

import { Tileset } from "engine";
import { TileSetData } from "engine/Tileset";
import { parseTiledSet } from "engine/helpers/parseTiled";
import { TiledSet } from "engine/map";

class AssetManager {
    private loader: PIXI.Loader;
    private preloadedAssets: string[];
    private tilesets: Map<string, Tileset>;

    constructor() {
        this.loader = new PIXI.Loader();
        this.tilesets = new Map();
    }

    public preLoadAssets(assets: string[]): void {
        if (!this.preloadedAssets) {
            this.preloadedAssets = [];
        }

        this.preloadedAssets.push(...assets);
    }

    public async doPreLoad(onProgress?: Function): Promise<PIXI.LoaderResource[]> {
        return this.loadResources(this.preloadedAssets, onProgress);
    }

    public async loadResource(asset: string, onProgress?: Function): Promise<PIXI.LoaderResource> {
        if (!asset) {
            return null;
        }

        const resources = await this.loadResources([asset], onProgress);

        return resources[0];
    }

    public loadResources(assets: string[], onProgress?: Function): Promise<PIXI.LoaderResource[]> {
        if (!assets || !assets.length) {
            return null;
        }
        const existingAssets = assets.filter(asset => this.loader.resources[asset]);
        assets = assets.filter(asset => !this.loader.resources[asset]);

        this.loader.add(assets);
        const progressListener: (loader: PIXI.Loader) => void = loader => onProgress && onProgress(loader.progress);
        this.loader.on("progress", progressListener);

        return new Promise((resolve) => {
            this.loader.load((loader, resources) => {
                this.loader.off("progress", progressListener);
                const res = assets.map(asset => resources[asset]).concat(existingAssets.map(asset => resources[asset]))
                resolve(res);
            });
        });
    }

    public getJSON(key: string): Object {
        if (!this.hasResource(key)) {
            console.error(`Tried to get unloaded texture: ${key}`);
            return undefined;
        }
        return this.loader.resources[key].data;
    }

    public getTexture(key: string): PIXI.Texture {
        if (!this.hasResource(key)) {
            console.error(`Tried to get unloaded texture: ${key}`);
            return undefined;
        }
        return this.loader.resources[key].texture;
    }

    public hasResource(key: string): boolean {
        return !!this.loader.resources[key];
    }

    public getTexturesByType(type: object): PIXI.Texture[] {
        return Object.values(type).map(asset => this.loader.resources[asset].texture);
    }

    public createTileset(data: TileSetData): Tileset {
        if (this.tilesets.has(data.path)) return this.tilesets.get(data.path);

        const tileset = new Tileset(data);
        this.tilesets.set(data.path, tileset);
        return tileset;
    }

    public getTileset(key: string): Tileset {
        if (!this.tilesets.has(key)) {
            console.error(`Tried to get unregistered tileset: ${key}`);
            return undefined;
        }

        return this.tilesets.get(key);
    }

    public async loadTileSetFile(location: string, onProgress?: Function): Promise<Tileset> {
        // Load
        const tilesetResource = await this.loadResource(location, (progress: number) => onProgress && onProgress(progress/2));
        const tiledSet = tilesetResource.data as TiledSet;

        // Load Tileset Image
        const imagePath = path.join(location, "..", tiledSet.image);
        const imageResource = await this.loadResource(imagePath, (progress: number) => onProgress && onProgress(progress/2 + 50));
        const tileSetData = parseTiledSet(tiledSet, imageResource.texture, imagePath);
        return this.createTileset(tileSetData);
    }
}

export default new AssetManager();
