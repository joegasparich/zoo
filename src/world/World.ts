import Graph = require("node-dijkstra");
import uuid = require("uuid");

import { randomInt } from "helpers/math";
import Mediator from "Mediator";
import { Assets, Config, Side } from "consts";
import { WorldEvent } from "consts/events";
import Game from "Game";
import Area from "./Area";
import BiomeGrid, { BiomeSaveData } from "./BiomeGrid";
import Wall from "./Wall";
import WallGrid, { WallGridSaveData } from "./WallGrid";
import ElevationGrid, { ElevationSaveData } from "./ElevationGrid";
import WaterGrid from "./WaterGrid";
import { Entity } from "entities";
import Vector from "vector";
import { MapCell } from "./MapGrid";
import PathGrid, { PathGridSaveData } from "./PathGrid";
import Exhibit, { ExhibitSaveData } from "./Exhibit";

export const ZOO_AREA = "ZOO";

export interface WorldSaveData {
    biomes: BiomeSaveData;
    paths: PathGridSaveData;
    walls: WallGridSaveData;
    elevation: ElevationSaveData;
    areas: {
        id: string;
        name: string;
        colour: number;
        cells: number[][];
        connectedAreas: {
            areaId: string;
            doorGridPositions: number[][];
        }[];
    }[];
    exhibits: ExhibitSaveData[];
}

export default class World {
    public biomeGrid: BiomeGrid;
    public wallGrid: WallGrid;
    public elevationGrid: ElevationGrid;
    public waterGrid: WaterGrid;
    public pathGrid: PathGrid;

    private tileObjects: Map<string, Entity>;
    private tileObjectMap: Map<string, Entity>;

    private areas: Map<string, Area>; // Key is area ID
    private tileAreaMap: Map<string, Area>; // Key is stringified tile position
    private exhibits: Map<string, Exhibit>; // Key is area ID

    public constructor() {
        this.tileObjects = new Map();
        this.tileObjectMap = new Map();
        this.areas = new Map();
        this.tileAreaMap = new Map();
        this.exhibits = new Map();
    }

    public async setup(): Promise<void> {
        this.elevationGrid = new ElevationGrid();
        this.biomeGrid = new BiomeGrid(Game.map.cols * 2, Game.map.rows * 2, Config.BIOME_SCALE);
        this.wallGrid = new WallGrid();
        this.waterGrid = new WaterGrid();
        this.pathGrid = new PathGrid();

        this.elevationGrid.setup();
        this.biomeGrid.setup();
        this.wallGrid.setup();
        this.waterGrid.setup();
        this.pathGrid.setup();

        // TODO: Store outer fence information in scene & then generate area based on that
        this.generateFence();
    }

    public reset(): void {
        this.resetAreas();

        this.biomeGrid.reset();
        this.wallGrid.reset();
        this.elevationGrid.reset();
        this.waterGrid.reset();
        this.pathGrid.reset();

        this.tileObjectMap = new Map();
    }

    private resetAreas(): void {
        this.areas = new Map();
        this.tileAreaMap = new Map();
        this.exhibits = new Map();
    }

    // TODO: Move to scene
    private generateFence(): void {
        for (let i = 0; i < Game.map.cols; i++) {
            this.wallGrid.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(i, 0), Side.North, true);
            this.wallGrid.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(i, Game.map.rows - 1), Side.South, true);
        }
        for (let i = 0; i < Game.map.rows; i++) {
            this.wallGrid.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(0, i), Side.West, true);
            this.wallGrid.placeWallAtTile(Assets.WALLS.IRON_BAR, new Vector(Game.map.cols - 1, i), Side.East, true);
        }
        const zooArea = new Area(ZOO_AREA, "zoo");
        this.areas.set(zooArea.id, zooArea);
        Mediator.fire(WorldEvent.AREAS_UPDATED);
        const zooCells = this.floodFill(Game.map.getCell(new Vector(1)));
        zooArea.setCells(zooCells);
        zooCells.forEach(cell => this.tileAreaMap.set(cell.position.toString(), zooArea));
    }

    public postUpdate(delta: number): void {
        this.biomeGrid.postUpdate();
        // this.pathGrid.postUpdate();

        this.exhibits.forEach(exhibit => {
            exhibit.postUpdate();
        });
        this.areas.forEach(area => {
            area.postUpdate();
        });
    }

    public registerTileObject(tileObject: Entity): void {
        if (!tileObject) return;
        const component = tileObject.getComponent("TILE_OBJECT_COMPONENT");

        this.tileObjects.set(tileObject.id, tileObject);
        for (let i = 0; i < component.data.size.x; i++) {
            for (let j = 0; j < component.data.size.y; j++) {
                this.tileObjectMap.set(tileObject.position.floor().add(new Vector(i, j)).toString(), tileObject);
            }
        }

        Mediator.fire(WorldEvent.PLACE_TILE_OBJECT, tileObject);
    }

    public unregisterTileObject(tileObject: Entity): void {
        if (!tileObject) return;

        this.tileObjects.delete(tileObject.id);
        this.tileObjectMap.delete(tileObject.position.floor().toString());

        Mediator.fire(WorldEvent.DELETE_TILE_OBJECT, tileObject);
    }

    public getTileObjectAtPos(pos: Vector): Entity | undefined {
        if (!Game.map.isPositionInMap(pos)) return undefined;

        return this.tileObjectMap.get(pos.floor().toString());
    }

    // TODO: Might be better to store array rather than convert it every time
    public getTileObjects(): Entity[] {
        return Array.from(this.tileObjects.values());
    }

    public getRandomCell(): Vector {
        return new Vector(randomInt(0, Game.map.cols), randomInt(0, Game.map.rows));
    }

    public isTileFree(position: Vector): boolean {
        return Game.map.isTileFree(position);
    }

    public isSideAccessible(tilePos: Vector, side: Side): boolean {
        const cell = Game.map.getCellInDirection(tilePos, side);
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

        tiles.forEach(tilePos => {
            areasCells.push(this.floodFill(Game.map.getCell(tilePos)));
        });

        const oldArea = this.tileAreaMap.get(tiles[0].toString());

        // Return if areas weren't formed properly (false positive in loop check)
        if (areasCells[0].length + areasCells[1].length > oldArea.getCells().length) return;

        const newArea = new Area(uuid(), "New Area");
        // TODO: Autogenerate a good name (ADJECTIVE + LOCATION) - Smelly glade
        this.areas.set(newArea.id, newArea);

        const larger = areasCells[0].length >= areasCells[1].length ? areasCells[0] : areasCells[1];
        const smaller = areasCells[0].length < areasCells[1].length ? areasCells[0] : areasCells[1];

        oldArea.setCells(larger);
        larger.forEach(cell => this.tileAreaMap.set(cell.position.toString(), oldArea));
        newArea.setCells(smaller);
        smaller.forEach(cell => this.tileAreaMap.set(cell.position.toString(), newArea));

        Mediator.fire(WorldEvent.AREAS_UPDATED);

        return [oldArea, newArea];
    }

    public joinAreas(wall: Wall): Area {
        const [tile1, tile2] = this.wallGrid.getAdjacentTiles(wall);
        let area1 = this.getAreaAtPosition(tile1);
        let area2 = this.getAreaAtPosition(tile2);

        // If one of the areas is the main zoo area then ensure we keep it
        if (area2.id === ZOO_AREA) {
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

        this.getExhibitByAreaId(area2.id)?.delete();
        this.areas.delete(area2.id);

        Mediator.fire(WorldEvent.AREAS_UPDATED);
        return area1;
    }

    public getAreas(): Area[] {
        return Array.from(this.areas.values());
    }

    public getAreaById(id: string): Area {
        return this.areas.get(id);
    }

    public createExhibit(areaId: string): Exhibit {
        if (this.getExhibitByAreaId(areaId)) {
            return this.getExhibitByAreaId(areaId);
        }

        const exhibit = new Exhibit(this.getAreaById(areaId));
        this.exhibits.set(areaId, exhibit);

        exhibit.recalculate();

        Mediator.fire(WorldEvent.EXHIBITS_UPDATED);

        return exhibit;
    }

    public deleteExhibitByAreaId(areaId: string): void {
        this.exhibits.delete(areaId);

        Mediator.fire(WorldEvent.EXHIBITS_UPDATED);
    }

    public getExhibits(): Exhibit[] {
        return Array.from(this.exhibits.values());
    }

    public getExhibitByAreaId(areaId: string): Exhibit {
        return this.exhibits.get(areaId);
    }

    public placeDoor(wall: Wall): void {
        wall.setDoor(true);

        const [areaA, areaB] = this.wallGrid.getAdjacentTiles(wall).map(tile => this.tileAreaMap.get(tile.toString()));
        if (areaA && areaB) {
            areaA.addAreaConnection(areaB, wall);
            areaB.addAreaConnection(areaA, wall);
        }
    }

    public removeDoor(wall: Wall): void {
        wall.setDoor(false);

        const [areaA, areaB] = this.wallGrid.getAdjacentTiles(wall).map(tile => this.tileAreaMap.get(tile.toString()));
        if (areaA && areaB) {
            areaA.removeAreaConnection(areaB, wall);
            areaB.removeAreaConnection(areaA, wall);
        }
    }

    public findAreaPath(startArea: Area, endArea: Area): Area[] {
        if (!startArea || !endArea) {
            console.warn("Could not find area path, one or more areas didn't exist");
            return undefined;
        }

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

        return route?.map(areaName => this.areas.get(areaName));
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

    public save(): WorldSaveData {
        return {
            biomes: Game.world.biomeGrid.save(),
            paths: Game.world.pathGrid.save(),
            walls: Game.world.wallGrid.save(),
            elevation: Game.world.elevationGrid.save(),
            areas: Array.from(this.areas.values()).map(area => ({
                id: area.id,
                name: area.name,
                colour: area.colour,
                cells: area.getCells().map(cell => Vector.Serialize(cell.position)),
                connectedAreas: Array.from(area.connectedAreas.entries()).map(([area, doors]) => ({
                    areaId: area.id,
                    doorGridPositions: doors.map(door => Vector.Serialize(door.gridPos)),
                })),
            })),
            exhibits: Array.from(this.exhibits.values()).map(exhibit => exhibit.save()),
        };
    }

    public load(data: WorldSaveData): void {
        Game.world.elevationGrid.load(data.elevation);
        Game.world.biomeGrid.load(data.biomes);
        Game.world.pathGrid.load(data.paths);
        Game.world.wallGrid.load(data.walls);

        // Create areas
        data.areas.forEach(area => {
            const newArea = new Area(area.id, area.name);
            newArea.colour = area.colour;
            newArea.setCells(area.cells.map(pos => Game.map.getCell(Vector.Deserialize(pos))));
            newArea.getCells().forEach(cell => this.tileAreaMap.set(cell.position.toString(), newArea));

            this.areas.set(newArea.id, newArea);
        });

        // Add connections once all areas have been created
        data.areas.forEach(areaData => {
            const area = this.getAreaById(areaData.id);
            areaData.connectedAreas.forEach(connection => {
                const connectedArea = this.getAreaById(connection.areaId);
                connection.doorGridPositions.forEach(([x, y]) => {
                    const door = this.wallGrid.getWallByGridPos(x, y);
                    area.addAreaConnection(connectedArea, door);
                });
            });
        });

        Mediator.fire(WorldEvent.AREAS_UPDATED);
    }

    public postLoad(data: WorldSaveData): void {
        data.exhibits.forEach(exhibitData => {
            const exhibit = new Exhibit();
            exhibit.load(exhibitData);
            this.exhibits.set(exhibitData.areaId, exhibit);
        });
    }

    /**
     * Returns an array of cells around the cell that aren't blocked by a wall or solid tile
     * @param cell The cell to search around
     */
    private getAccessibleAdjacentCells(cell: MapCell): MapCell[] {
        if (!Game.map.isPositionInMap(cell.position)) return;

        const allSides: Side[] = [Side.East, Side.North, Side.South, Side.West];

        return allSides
            .filter(side => !this.wallGrid.getWallAtTile(cell.position, side).exists)
            .filter(side => Game.map.isPositionInMap(Game.map.getCellInDirection(cell.position, side)?.position))
            .map(side => Game.map.getCellInDirection(cell.position, side));
    }

    public getAreaAtPosition(position: Vector): Area {
        if (!Game.map.isPositionInMap(position)) return undefined;

        return this.tileAreaMap.get(position.floor().toString());
    }
}
