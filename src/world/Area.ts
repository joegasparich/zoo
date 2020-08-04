import { MapCell } from "engine/map";

export default class Area {
    public constructor(public name: string, private cells?: MapCell[]) {}

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
