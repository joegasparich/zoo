import { GuestComponent } from "entities/components";
import Game from "Game";
import { randomInt } from "helpers/math";
import { randomItem } from "helpers/util";
import Vector from "vector";
import Exhibit from "world/Exhibit";
import { GUEST_BEHAVIOUR_STATE, BehaviourData } from ".";
import { Behaviour } from "..";
import IdleBehaviour from "./IdleBehaviour";

interface ViewData extends BehaviourData {
    viewingTile: number[];
    exhibitId: string;
}

export default class ViewBehaviour implements Behaviour {
    public id: GUEST_BEHAVIOUR_STATE = "VIEW";

    private viewingTile: Vector;
    private exhibitId: string;
    private isViewing: boolean;

    public constructor(private guest: GuestComponent) {}

    public exit(): void {
        this.guest.pathfinder?.clearPath();
        this.guest.inputVector = Vector.Zero();
    }

    public async update(delta: number): Promise<void> {
        if (this.isViewing) {
            // TODO: Admire the animals
            // TODO: Use a better method than random int
            if (randomInt(0, 1000) === 0) {
                this.guest.visitedExhibits.push(this.exhibitId);
                this.guest.stateMachine.setState(new IdleBehaviour(this.guest));
                this.isViewing = false;
            }
            return;
        }
        // Look for nearby exhibit and choose viewing tile, then path to it
        // if no path found then set exhibit inaccessible and return to idle
        if (!this.viewingTile) {
            const nearestExhibit = this.findExhibit();
            if (nearestExhibit) {
                const pathedTiles = nearestExhibit.viewingArea.filter(pos => !!Game.world.pathGrid.getPathAtTile(pos));
                // Prefer pathed tiles
                const randomViewingTile = randomItem(pathedTiles.length ? pathedTiles : nearestExhibit.viewingArea);
                const path = await this.guest.pathfinder.pathTo(randomViewingTile);
                if (path) {
                    this.viewingTile = randomViewingTile;
                    this.exhibitId = nearestExhibit.area.id;
                } else {
                    // TODO: Can we assume that if the random tile is inaccessible then they all are?
                    this.guest.inaccessibleExhibits.push(nearestExhibit.area.id);
                    this.guest.stateMachine.setState(new IdleBehaviour(this.guest));
                    return;
                }
            }
        }

        // If we've lost the path then reset to idle
        if (!this.guest.pathfinder.hasPath()) {
            this.guest.stateMachine.setState(new IdleBehaviour(this.guest));
            return;
        } else {
            // Go to viewing tile then set exhibit visited
            if (this.guest.pathfinder.followPath()) {
                this.isViewing = true;
            }
            this.guest.inputVector =
                this.guest.pathfinder.currentTarget?.subtract(this.guest.entity.position).normalize() ?? Vector.Zero();
        }
    }

    public findExhibit(): Exhibit {
        // TODO: Pick random of known ones rather than closest
        // Maybe favour closer ones out of known ones?
        return Game.world
            .getExhibits()
            .filter(
                exhibit =>
                    !this.guest.inaccessibleExhibits.includes(exhibit.area.id) &&
                    !this.guest.visitedExhibits.includes(exhibit.area.id),
            )
            .reduce(
                (prev, current) =>
                    !prev ||
                    Vector.Distance(current.centre, this.guest.entity.position) <
                        Vector.Distance(prev.centre, this.guest.entity.position)
                        ? current
                        : prev,
                undefined,
            );
    }

    public save(): ViewData {
        return {
            id: this.id,
            viewingTile: Vector.Serialize(this.viewingTile),
            exhibitId: this.exhibitId,
        };
    }

    public load(data: ViewData): void {
        this.viewingTile = Vector.Deserialize(data.viewingTile);
        this.exhibitId = data.exhibitId;
    }
}
