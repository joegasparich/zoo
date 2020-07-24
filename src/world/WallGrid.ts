import { Camera, Debug, Game, Layers, Vector } from "engine";
import { AssetManager } from "engine/managers";
import { MapGrid } from "engine/map";
import { Side } from "engine/consts";

import World from "./World";
import Wall from "./Wall";
import { WallData } from "types/AssetTypes";
import { Config } from "consts";

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
    }

    public postUpdate(): void {
        this.drawWalls();

        // this.drawDebug();
    }

    /**
     * Update the position and scale of the tile grid
     */
    private drawWalls(): void {
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

    public isWallInMap(tilePos: Vector, side: Side): boolean {
        return this.map.isPositionInMap(tilePos.floor()) ||
               tilePos.floor().y === -1 && side === Side.South ||
               tilePos.floor().y === this.map.rows && side === Side.North ||
               tilePos.floor().x === -1 && side === Side.East ||
               tilePos.floor().x === this.map.cols && side === Side.West;
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

    public getWalledSides(tilePos: Vector): Side[] {
        const edges: Side[] = [];

        if (this.wallGrid[(tilePos.x * 2) + 1][tilePos.y].data?.solid) edges.push(Side.North);
        if (this.wallGrid[(tilePos.x * 2) + 2][tilePos.y].data?.solid) edges.push(Side.East);
        if (this.wallGrid[(tilePos.x * 2) + 1][tilePos.y + 1].data?.solid) edges.push(Side.South);
        if (this.wallGrid[tilePos.x * 2][tilePos.y].data?.solid) edges.push(Side.West);

        return edges;
    }

    public placeWallAtTile(wallData: (WallData | string), tilePos: Vector, side: Side): Wall {
        if (!this.isWallInMap(tilePos, side)) return;
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

        const texture = wall.spriteSheet.getTextureById(orientation ? 0 : 1);
        wall.sprite = new PIXI.Sprite(texture);

        if (side === Side.North && tilePos.y > 0) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y - 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y - 1)));
        }
        if (side === Side.South && tilePos.y < this.map.rows - 1) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y + 1), this.getWalledSides(new Vector(tilePos.x, tilePos.y + 1)));
        }
        if (side === Side.West && tilePos.x > 0) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x - 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x - 1, tilePos.y)));
        }
        if (side === Side.East && tilePos.x < this.map.cols - 1) {
            this.map.setTileAccess(new Vector(tilePos.x, tilePos.y), this.getWalledSides(new Vector(tilePos.x, tilePos.y)));
            this.map.setTileAccess(new Vector(tilePos.x + 1, tilePos.y), this.getWalledSides(new Vector(tilePos.x + 1, tilePos.y)));
        }

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
