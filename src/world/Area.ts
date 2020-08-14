import { rgbToHex } from "engine/helpers/math";
import { removeItem } from "engine/helpers/util";
import { MapCell } from "engine/map";

import Wall from "./Wall";

export default class Area {
    public colour: number;
    public connectedAreas: Map<Area, Wall[]>;

    public constructor(public name: string, private cells?: MapCell[]) {
        this.colour = rgbToHex(Math.random() * 255, Math.random() * 255, Math.random() * 255);

        this.connectedAreas = new Map();
    }

    public addCell(cell: MapCell): void {
        if (!this.cells) this.cells = [];
        this.cells.push(cell);
    }

    public setCells(cells: MapCell[]): void {
        this.cells = cells;
    }

    public getCells(): MapCell[] {
        return this.cells;
    }

    public addAreaConnection(area: Area, door: Wall): void {
        if (!door.isDoor) return; // Wall isn't a door
        if (this.connectedAreas.get(area)?.includes(door)) return; // Duplicate door

        if (this.connectedAreas.has(area)) {
            this.connectedAreas.get(area).push(door);
        } else {
            this.connectedAreas.set(area, [door]);
        }
    }

    public removeAreaConnection(area: Area, door?: Wall): void {
        if (!this.connectedAreas.has(area)) return; // Area not a connection
        if (door && !this.connectedAreas.get(area).includes(door)) return; // Door not a connection

        if (door) {
            removeItem(this.connectedAreas.get(area), door);

            if (this.connectedAreas.get(area).length < 1){
                this.connectedAreas.delete(area);
            }
        } else {
            this.connectedAreas.delete(area);
        }
    }
}
