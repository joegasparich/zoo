import { Entity } from "entities";
import Game from "Game";
import { createGuest } from "helpers/entityGenerators";

const GUEST_SPAWN_INTERVAL = 30 * 1000;

interface ZooData {
    entranceId: string;
}

/**
 * Controls the zoo and zoo simulation related code
 */
export default class Zoo {
    public entrance: Entity;
    private nextGuestSpawn: number;

    public start(): void {
        if (!this.entrance) {
            console.warn("Invalid zoo, entrance could not be found");
            return;
        }

        this.nextGuestSpawn = Date.now();
        console.log("Zoo created");
    }

    public update(): void {
        if (Date.now() > this.nextGuestSpawn) {
            createGuest(this.entrance.position);
            this.nextGuestSpawn = Date.now() + GUEST_SPAWN_INTERVAL;
        }
    }

    public save(): ZooData {
        return {
            entranceId: this.entrance.id,
        };
    }

    public load(data: ZooData): void {
        this.entrance = Game.getEntityById(data.entranceId);
    }
}
