import { Camera, Debug, Game, Layers, Vector } from "engine";
import { AssetManager } from "engine/managers";
import { MapGrid } from "engine/map";

import World from "./World";
import Wall from "./Wall";
import { WallData } from "types/AssetTypes";
import { Assets, Config, Side } from "consts";

export default class WallGrid {
    private game: Game;
    private world: World;
    private map: MapGrid;
    private camera: Camera;

    private wallGrid: Wall[][];
    // private wallTileMap: PIXI.tilemap.CompositeRectTileLayer;

    public constructor(world: World) {
        this.game = world.game;
        this.world = world;
        this.map = world.map;
        this.camera = this.game.camera;
    }

    public setup(): void {
        this.wallGrid = [];

        for (let col = 0; col < (this.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            this.wallGrid[col] = [];
            for (let row = 0; row < this.map.rows + orientation; row++) {
                this.wallGrid[col][row] = new Wall(orientation);
            }
        }

        // Test
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(2, 2), Side.North);
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(3, 3), Side.East);
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(3, 3), Side.North);
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(2, 5), Side.West);
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(4, 4), Side.South);
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(4, 4), Side.West);
        this.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(4, 4), Side.East);

        // const wallTextures: PIXI.Texture[] = [];
        // Wall.wallSprites.forEach(spriteSheet => wallTextures.push(spriteSheet.getTexture()));
        // this.wallTileMap = new PIXI.tilemap.CompositeRectTileLayer(0, wallTextures);
        // this.wallTileMap.parentGroup = Layers.GROUND;
        // this.game.stage.addChild(this.wallTileMap);
    }

    public postUpdate(): void {
        this.drawWalls();

        // this.drawDebug();
    }

    /**
     * Update the position and scale of the tile grid
     */
    private drawWalls(): void {
        // const scale = (this.game.opts.worldScale/this.cellSize); // Ideally this is 1 (16/16)

        for (let col = 0; col < (this.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < this.map.rows + orientation; row++) {
                const wall = this.wallGrid[col][row];
                if (!wall.data) { continue; }

                // Texture
                let wallPos;
                if (orientation === 0) {
                    // Vertical
                    wallPos = new Vector((col/2), row+1);
                } else {
                    wallPos = new Vector((col/2), row);
                }
                wall.sprite.position = this.camera.worldToScreenPosition(wallPos).toPoint();
                wall.sprite.scale.set(this.camera.scale);
            }
        }
    }

    public getWallAtTile(tilePos: Vector, side: Side): Wall {
        switch(side) {
            case Side.North: return this.wallGrid[(tilePos.x * 2) + 1][tilePos.y];
            case Side.East: return this.wallGrid[(tilePos.x * 2) + 2][tilePos.y];
            case Side.South: return this.wallGrid[(tilePos.x * 2) + 1][tilePos.y + 1];
            case Side.West: return this.wallGrid[tilePos.x * 2][tilePos.y];
        }
    }

    public getWallsAtTile(tilePos: Vector): Wall[] {
        return [
            this.wallGrid[(tilePos.x * 2) + 1][tilePos.y],
            this.wallGrid[(tilePos.x * 2) + 2][tilePos.y],
            this.wallGrid[(tilePos.x * 2) + 1][tilePos.y + 1],
            this.wallGrid[tilePos.x * 2][tilePos.y],
        ];
    }

    public placeWallAtTile(wallData: (WallData | string), tilePos: Vector, side: Side): Wall {
        if (typeof wallData === "string") {
            wallData = AssetManager.getJSON(wallData) as WallData;
        }

        let x: number, y: number, orientation: number;
        switch(side) {
            case Side.North:
                x = (tilePos.x * 2) + 1;
                y = tilePos.y;
                orientation = 1;
                break;
            case Side.East:
                x = (tilePos.x * 2) + 2;
                y = tilePos.y;
                orientation = 0;
                break;
            case Side.South:
                x = (tilePos.x * 2) + 1;
                y = tilePos.y + 1;
                orientation = 1;
                break;
            case Side.West:
                x = tilePos.x * 2;
                y = tilePos.y;
                orientation = 0;
                break;
        }

        const wall = new Wall(orientation, wallData);
        this.wallGrid[x][y] = wall;

        const texture = Wall.wallSprites.get(wall.data.spriteSheet).getTextureById(orientation ? 0 : 1);
        wall.sprite = new PIXI.Sprite(texture);

        // Add new sprite
        this.game.app.stage.addChild(wall.sprite);
        wall.sprite.parentGroup = Layers.ENTITIES;
        wall.sprite.anchor.set(0.5, 1);

        return wall;
    }

    private drawDebug(): void {
        const xOffset =  this.map.position.x;
        const yOffset = this.map.position.y;

        for (let col = 0; col < (this.map.cols * 2) + 1; col++) {
            const orientation = col % 2;
            for (let row = 0; row < this.map.rows + orientation; row++) {
                Debug.setLineStyle(1, 0x00FF00);
                if (!this.wallGrid[col][row].data) {
                    Debug.setLineStyle(1, 0xFF0000);
                }
                if (orientation === 0) {
                    // Vertical
                    Debug.drawLine(
                        (col / 2) * Config.WORLD_SCALE + xOffset,
                        row * Config.WORLD_SCALE + yOffset,
                        (col / 2) * Config.WORLD_SCALE + xOffset,
                        (row + 1) * Config.WORLD_SCALE + yOffset,
                    );
                } else {
                    // Horizontal
                    Debug.drawLine(
                        ((col - 1) / 2) * Config.WORLD_SCALE + xOffset,
                        row  * Config.WORLD_SCALE + yOffset,
                        (((col - 1) / 2)  + 1) * Config.WORLD_SCALE + xOffset,
                        row  * Config.WORLD_SCALE + yOffset,
                    );
                }
            }
        }
    }
}
