import Graph = require("node-dijkstra");
import uuid = require("uuid");

import { Vector } from "engine";
import { Side } from "engine/consts";
import { randomInt } from "engine/helpers/math";
import { AssetManager } from "engine/managers";
import { MapCell, MapGrid } from "engine/map";
import Mediator from "engine/Mediator";

import { Assets, Config } from "consts";
import { WorldEvents } from "consts/events";
import TileObject from "entities/TileObject";
import EmptyScene from "scenes/EmptyScene";
import { WallData } from "types/AssetTypes";
import ZooGame from "ZooGame";
import Area from "./Area";
import BiomeGrid from "./BiomeGrid";
import Wall from "./Wall";
import WallGrid from "./WallGrid";
import ElevationGrid from "./ElevationGrid";

export default class World {
    public map: MapGrid;
    public biomeGrid: BiomeGrid;
    public wallGrid: WallGrid;
    public elevationGrid: ElevationGrid;
    private tileObjects: Map<string, TileObject>;
    private areas: Map<string, Area>;
    private tileAreaMap: Map<string, Area>;
    private tileObjectMap: Map<string, TileObject>;

    public constructor() {
        this.map = ZooGame.map;
        this.tileObjects = new Map();
        this.areas = new Map();
        this.tileAreaMap = new Map();
        this.tileObjectMap = new Map();
    }

    public async setup(): Promise<void> {
        // TODO: Figure out how to load map info like biomes after biomeGrid.setup
        await this.loadMap();

        this.elevationGrid = new ElevationGrid();
        this.biomeGrid = new BiomeGrid(this.map.cols * 2, this.map.rows * 2, Config.BIOME_SCALE);
        this.wallGrid = new WallGrid();

        this.elevationGrid.setup();
        this.biomeGrid.setup();
        this.wallGrid.setup();

        // TODO: Store outer fence information in scene & then generate area based on that
        // TODO: Add unremovable fences
        this.generateFence();
    }

    // TODO: Move to scene
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
        const zooArea = new Area("0", "zoo");
        this.areas.set(zooArea.id, zooArea);
        Mediator.fire(WorldEvents.AREAS_UPDATED);
        const zooCells = this.floodFill(this.map.getCell(new Vector(1)));
        zooArea.setCells(zooCells);
        zooCells.forEach(cell => this.tileAreaMap.set(cell.position.toString(), zooArea));
    }

    public postUpdate(delta: number): void {
        this.biomeGrid.postUpdate();
        this.wallGrid.postUpdate();

        this.areas.forEach(area => {
            area.postUpdate();
        });
    }

    private async loadMap(): Promise<void> {
        await ZooGame.sceneManager.loadScene(
            new EmptyScene(this),
            // new TestScene(),
            (progress: number) => {
                console.log(`Map Load Progress: ${progress}%`);
            },
        );
    }

    public registerTileObject(tileObject: TileObject): void {
        ZooGame.registerEntity(tileObject);
        this.tileObjects.set(tileObject.id, tileObject);
        this.tileObjectMap.set(tileObject.position.floor().toString(), tileObject);
        // This assumes that tile objects can't move, will need to be reconsidered if that changes
        if (tileObject.blocksPath) {
            this.map.setTileSolid(tileObject.position.floor(), true);
        }
    }

    public getTileObjectAtPos(pos: Vector): TileObject {
        if (!this.map.isPositionInMap(pos)) return undefined;

        return this.tileObjectMap.get(pos.floor().toString());
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
        const newArea = new Area(uuid(), "New Area");
        // TODO: Autogenerate a good name
        this.areas.set(newArea.id, newArea);

        tiles.forEach(tilePos =>{
            areasCells.push(this.floodFill(this.map.getCell(tilePos)));
        });

        const larger = areasCells[0].length >= areasCells[1].length ? areasCells[0] : areasCells[1];
        const smaller = areasCells[0].length < areasCells[1].length ? areasCells[0] : areasCells[1];

        oldArea.setCells(larger);
        larger.forEach(cell => this.tileAreaMap.set(cell.position.toString(), oldArea));
        newArea.setCells(smaller);
        smaller.forEach(cell => this.tileAreaMap.set(cell.position.toString(), newArea));

        Mediator.fire(WorldEvents.AREAS_UPDATED);

        return [oldArea, newArea];
    }

    public joinAreas(wall: Wall): Area {
        const [tile1, tile2] = this.wallGrid.getAdjacentTiles(wall);
        let area1 = this.getAreaAtPosition(tile1);
        let area2 = this.getAreaAtPosition(tile2);

        // If one of the areas is the main zoo area then ensure we keep it
        if (area2.id === "0") {
            const swap = area1;
            area1 = area2;
            area2 = swap;
        }

        // Delete area 2 and expand area 1
        area1.setCells([...area1.getCells(), ...area2.getCells()]);
        area2.getCells().forEach(cell => this.tileAreaMap.set(cell.position.toString(), area1));
        area2.connectedAreas.forEach((doors, area) => {
            doors.forEach(door => {
                area1.addAreaConnection(area, door);
                area.addAreaConnection(area1, door);
            });
        });

        this.areas.delete(area2.id);

        Mediator.fire(WorldEvents.AREAS_UPDATED);
        return area1;
    }

    public getAreas(): Area[] {
        return Array.from(this.areas.values());
    }

    public getAreaById(id: string): Area {
        return this.areas.get(id);
    }

    public placeDoor(wall: Wall): void {
        wall.setDoor(true);

        const [areaA, areaB] = this.wallGrid.getAdjacentTiles(wall).map(tile => this.tileAreaMap.get(tile.toString()));
        if (areaA && areaB) {
            areaA.addAreaConnection(areaB, wall);
            areaB.addAreaConnection(areaA, wall);
        }
    }

    public findAreaPath(startArea: Area, endArea: Area): Area[] {
        const areaGraph: any = {};
        this.areas.forEach(area => {
            const connections: any = {};
            area.connectedAreas.forEach((walls, area) => {
                connections[area.id] = 1;
            });
            areaGraph[area.id] = connections;
        });

        const graph = new Graph(areaGraph);
        const route = graph.path(startArea.id, endArea.id) as string[];

        return route.map(areaName => this.areas.get(areaName));
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

}
