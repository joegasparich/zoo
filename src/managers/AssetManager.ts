import { LoaderResource, Loader, Texture } from "pixi.js";
import SpriteSheet, { SpriteSheetData } from "SpriteSheet";

import TileSet, { TileSetData } from "TileSet";

class AssetManager {
    private loader: Loader;
    private preloadedAssets: string[];
    private spriteSheets: Map<string, SpriteSheet>;

    public constructor() {
        this.loader = new Loader();
        this.spriteSheets = new Map();
    }

    public preLoadAssets(assets: string[]): void {
        if (!this.preloadedAssets) {
            this.preloadedAssets = [];
        }

        this.preloadedAssets.push(...assets);
    }

    public async doPreLoad(onProgress?: (progress: number) => void): Promise<LoaderResource[]> {
        return this.loadResources(this.preloadedAssets, onProgress);
    }

    public async loadResource(asset: string, onProgress?: (progress: number) => void): Promise<LoaderResource> {
        if (!asset) {
            return null;
        }

        const resources = await this.loadResources([asset], onProgress);

        return resources[0];
    }

    public loadResources(assets: string[], onProgress?: (progress: number) => void): Promise<LoaderResource[]> {
        if (!assets || !assets.length) {
            return null;
        }
        const existingAssets = assets.filter(asset => this.loader.resources[asset]);
        const newAssets = assets.filter(asset => !this.loader.resources[asset]);

        if (!newAssets.length) {
            return Promise.resolve(existingAssets.map(asset => this.loader.resources[asset]));
        }

        this.loader.add(newAssets);
        const progressListener: (loader: Loader) => void = loader => onProgress && onProgress(loader.progress);
        const progressListenerRef = this.loader.onProgress.add(progressListener);

        return new Promise(resolve => {
            this.loader.load((loader, resources) => {
                this.loader.onProgress.detach(progressListenerRef);
                const res = newAssets
                    .map(asset => resources[asset])
                    .concat(existingAssets.map(asset => resources[asset]));
                resolve(res);
            });
        });
    }

    public getJSON(key: string): Object {
        if (!this.hasResource(key)) {
            console.error(`Tried to get unloaded JSON: ${key}`);
            return undefined;
        }
        return this.loader.resources[key].data;
    }

    public getTexture(key: string): Texture {
        if (!this.hasResource(key)) {
            console.error(`Tried to get unloaded texture: ${key}`);
            return undefined;
        }
        return this.loader.resources[key].texture;
    }

    public hasResource(key: string): boolean {
        return !!this.loader.resources[key];
    }

    public getTexturesByType(type: object): Texture[] {
        return Object.values(type).map(asset => this.loader.resources[asset].texture);
    }

    public createSpriteSheet(data: SpriteSheetData): SpriteSheet {
        if (this.spriteSheets.has(data.imageUrl)) return this.spriteSheets.get(data.imageUrl);

        const spriteSheet = new SpriteSheet(data);
        this.spriteSheets.set(data.imageUrl, spriteSheet);
        return spriteSheet;
    }

    public getSpriteSheet(key: string): SpriteSheet {
        if (!this.spriteSheets.has(key)) {
            console.error(`Tried to get unregistered spritesheet: ${key}`);
            return undefined;
        }

        return this.spriteSheets.get(key);
    }
}

export default new AssetManager();
