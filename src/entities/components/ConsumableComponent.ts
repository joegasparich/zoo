import { COMPONENT } from "entities/components";
import { ConsumableData } from "types/AssetTypes";
import { Entity } from "entities";
import TileObjectComponent, { TileObjectComponentSaveData } from "./TileObjectComponent";

interface ConsumableComponentSaveData extends TileObjectComponentSaveData {
    quantity: number;
}

export default class ConsumableComponent extends TileObjectComponent {
    public id: COMPONENT = "CONSUMABLE_COMPONENT";
    public type: COMPONENT = "TILE_OBJECT_COMPONENT";

    public assetPath: string;
    public data: ConsumableData;

    private quantity: number;

    public start(entity: Entity): void {
        super.start(entity);

        // Set quantity to max if it's not already set
        if (!this.quantity) {
            this.quantity = this.data.quantity;
        }
    }

    public consume(amount: number): number {
        const removed = Math.min(amount, this.quantity);
        this.quantity -= removed;

        if (this.quantity <= 0) {
            this.entity.remove();
        }

        return removed;
    }

    public save(): ConsumableComponentSaveData {
        return {
            ...super.save(),
            quantity: this.quantity,
        };
    }

    public load(data: ConsumableComponentSaveData): void {
        super.load(data);

        this.quantity = data.quantity;
    }

    public printDebug(): void {
        super.printDebug();

        console.log(`Remaining quantity: ${this.quantity}`);
    }
}
