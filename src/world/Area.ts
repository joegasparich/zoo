import { rgbToHex } from "engine/helpers/math";
import { MapCell } from "engine/map";

export default class Area {
    public colour: number;

    public constructor(public name: string, private cells?: MapCell[]) {
        this.colour = rgbToHex(Math.random() * 255, Math.random() * 255, Math.random() * 255);
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
}
