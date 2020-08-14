import { Assets, Config } from "consts";
import { Debug, Game, Vector } from "engine";
import { Side } from "engine/consts";
import { randomInt } from "engine/helpers/math";
import { AssetManager } from "engine/managers";
import { MapCell, MapGrid } from "engine/map";

import TileObject from "entities/TileObject";
import EmptyScene from "scenes/EmptyScene";
import { WallData } from "types/AssetTypes";
import uuid = require("uuid");
import Area from "./Area";
import BiomeGrid from "./BiomeGrid";
import Wall from "./Wall";
import WallGrid from "./WallGrid";

export default class World {
    public game: Game;
    public map: MapGrid;
    public biomeGrid: BiomeGrid;
    public wallGrid: WallGrid;
    private tileObjects: Map<string, TileObject>;
    private areas: Map<string, Area>;
    private tileAreaMap: Map<string, Area>;

    public constructor(game: Game) {
        this.game = game;
        this.map = game.map;
        this.tileObjects = new Map();
        this.areas = new Map();
        this.tileAreaMap = new Map();
    }

    public async setup(): Promise<void> {
        // TODO: Figure out how to load map info like biomes after biomeGrid.setup
        await this.loadMap();

        this.wallGrid = new WallGrid(this);
        this.biomeGrid = new BiomeGrid(this, this.map.cols * 2, this.map.rows * 2, Config.BIOME_SCALE);

        this.biomeGrid.setup();
        this.wallGrid.setup();

        // TODO: Store outer fence information in scene & then generate area based on that
        // TODO: Add unremovable fences
        this.generateFence();
    }

    private generateFence(): void {
        const ironFence = AssetManager.getJSON(Assets.WALLS.IRON_BAR) as WallData;
        for (let i = 0; i < this.map.cols; i++) {
            this.wallGrid.placeWallAtTile(ironFence, new Vector(i, 0), Side.North);
            this.wallGrid.placeWallAtTile(ironFence, new Vector(i, this.map.rows - 1), Side.South);
        }
        for (let i = 0; i < this.map.rows; i++) {
            this.wallGrid.placeWallAtTile(ironFence, new Vector(0, i), Side.West);
            this.wallGrid.placeWallAtTile(ironFence, new Vector(this.map.cols - 1, i), Side.East);
        }
        const zooArea = new Area("zoo");
        this.areas.set(zooArea.name, zooArea);
        const zooCells = this.floodFill(this.map.getCell(new Vector(1)));
        zooArea.setCells(zooCells);
        zooCells.forEach(cell => this.tileAreaMap.set(cell.position.toString(), zooArea));
    }

    public postUpdate(delta: number): void {
        this.biomeGrid.postUpdate();
        this.wallGrid.postUpdate();
    }

    private async loadMap(): Promise<void> {
        await this.game.sceneManager.loadScene(
            new EmptyScene(this),
            // new TestScene(),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );
    }

    public registerTileObject(tileObject: TileObject): void {
        this.game.registerEntity(tileObject);
        this.tileObjects.set(tileObject.id, tileObject);
        // This assumes that tile objects can't move, will need to be reconsidered if that changes
        if (tileObject.blocksPath) {
            this.map.setTileSolid(tileObject.position.floor(), true);
        }
    }

    public getRandomCell(): Vector {
        return new Vector(randomInt(0, this.map.cols), randomInt(0, this.map.rows));
    }

    public isTileFree(position: Vector): boolean {
        return this.map.isTileFree(position);
    }

    public isSideAccessible(tilePos: Vector, side: Side): boolean {
        const cell = this.map.getCellInDirection(tilePos, side);
        const wall = this.wallGrid.getWallAtTile(tilePos, side);
        if (!cell) return false;
        if (cell.isSolid) return false;
        if (wall.exists && wall.data.solid) return false;
        return true;
    }

    //*-- Areas --*//

    public formAreas(wall: Wall): Area[] {
        const areasCells: MapCell[][] = [];
        const tiles = this.wallGrid.getAdjacentTiles(wall);

        // ! Does not handle situations where final wall is placed on the edge of the map
        // Current solution is to ensure that the map is already surrounded by walls
        if (tiles.length < 2) return;

        const oldArea = this.tileAreaMap.get(tiles[0].toString());
        const newArea = new Area(uuid());
        // TODO: Autogenerate a good name
        this.areas.set(newArea.name, newArea);

        tiles.forEach(tilePos =>{
            areasCells.push(this.floodFill(this.map.getCell(tilePos)));
        });

        const larger = areasCells[0].length >= areasCells[1].length ? areasCells[0] : areasCells[1];
        const smaller = areasCells[0].length < areasCells[1].length ? areasCells[0] : areasCells[1];

        oldArea.setCells(larger);
        larger.forEach(cell => this.tileAreaMap.set(cell.position.toString(), oldArea));
        newArea.setCells(smaller);
        smaller.forEach(cell => this.tileAreaMap.set(cell.position.toString(), newArea));

        return [oldArea, newArea];
    }

    public joinAreas(wall: Wall): Area {
        // TODO: Implement;

        return undefined;
    }

    private deleteArea(area: Area): void {
        this.areas.delete(area.name);
        area.getCells().forEach(cell => this.tileAreaMap.set(cell.position.toString(), this.areas.get("zoo")));
    }

    public placeDoor(wall: Wall): void {
        wall.setDoor(true);

        const [areaA, areaB] = this.wallGrid.getAdjacentTiles(wall).map(tile => this.tileAreaMap.get(tile.toString()));
        if (areaA && areaB) {
            areaA.addAreaConnection(areaB, wall);
            areaB.addAreaConnection(areaA, wall);
        }
    }

    /**
     * Finds all cells within an area
     * @param startCell The cell to expand
     * @param area The area to flood fill
     */
    private floodFill(startCell: MapCell, cells?: MapCell[]): MapCell[] {
        cells = cells ?? [];

        const openTiles = [];

        //Set area
        openTiles.push(startCell);
        cells.push(startCell);

        while (openTiles.length) {
            const currentCell = openTiles.pop();
            const neighbours = this.getAccessibleAdjacentCells(currentCell);

            neighbours.forEach(neighbour => {
                if (!cells.includes(neighbour)) {
                    cells.push(neighbour);
                    openTiles.push(neighbour);
                }
            });
        }

        return cells;
    }

    /**
     * Returns an array of cells around the cell that aren't blocked by a wall or solid tile
     * @param cell The cell to search around
     */
    private getAccessibleAdjacentCells(cell: MapCell): MapCell[] {
        if (!this.map.isPositionInMap(cell.position)) return;

        const allSides: Side[] = [ Side.East, Side.North, Side.South, Side.West ];

        return allSides
            .filter(side => !this.wallGrid.getWallAtTile(cell.position, side).exists)
            .filter(side => this.map.isPositionInMap(this.map.getCellInDirection(cell.position, side)?.position))
            .map(side => this.map.getCellInDirection(cell.position, side));
    }

    public getAreaAtPosition(position: Vector): Area {
        if (!this.map.isPositionInMap(position)) return undefined;

        return this.tileAreaMap.get(position.floor().toString());
    }

    //*-- Debug --*//

    public drawDebugAreas(): void {
        this.areas.forEach(area => {
            area.getCells().forEach(cell => {
                const vertices = [
                    cell.position.multiply(Config.WORLD_SCALE),
                    cell.position.add(new Vector(0, 1)).multiply(Config.WORLD_SCALE),
                    cell.position.add(new Vector(1, 1)).multiply(Config.WORLD_SCALE),
                    cell.position.add(new Vector(1, 0)).multiply(Config.WORLD_SCALE),
                ];
                Debug.drawPolygon(vertices, area.colour, 0.5);
            });
        });
    }

    public drawDebugAreaGraph(): void {
        // TODO: Implement
    }
}
