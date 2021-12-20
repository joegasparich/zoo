import { AnimalBehaviourComponent, GuestComponent } from "entities/components";
import Game from "Game";
import { randomBool } from "helpers/math";
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

    public async update(delta: number, guest: GuestComponent): Promise<void> {
        // Look for nearby exhibit and choose viewing tile, then path to it
        // if no path found then set exhibit inaccessible and return to idle
        if (!this.viewingTile) {
            const nearestExhibit = this.findExhibit(guest);
            if (nearestExhibit) {
                const pathedTiles = nearestExhibit.viewingArea.filter(pos => !!Game.world.pathGrid.getPathAtTile(pos));
                // Prefer pathed tiles
                const randomViewingTile = randomItem(pathedTiles.length ? pathedTiles : nearestExhibit.viewingArea);
                const path = await guest.pathfinder.pathTo(randomViewingTile);
                if (path) {
                    this.viewingTile = randomViewingTile;
                    this.exhibitId = nearestExhibit.area.id;
                } else {
                    // TODO: Can we assume that if the random tile is inaccessible then they all are?
                    guest.inaccessibleExhibits.push(nearestExhibit.area.id);
                    guest.stateMachine.setState(new IdleBehaviour());
                    guest.inputVector = Vector.Zero();
                    return;
                }
            }
        }

        // If we've lost the path then reset to idle
        if (!guest.pathfinder.hasPath()) {
            guest.stateMachine.setState(new IdleBehaviour());
            guest.inputVector = Vector.Zero();
            return;
        } else {
            // Go to viewing tile then set exhibit visited
            if (guest.pathfinder.followPath()) {
                // TODO: Hang around for a bit
                guest.visitedExhibits.push(this.exhibitId);
                guest.stateMachine.setState(new IdleBehaviour());
                guest.inputVector = Vector.Zero();
            }
            guest.inputVector =
                guest.pathfinder.currentTarget?.subtract(guest.entity.position).normalize() ?? Vector.Zero();
        }
    }

    public findExhibit(guest: GuestComponent): Exhibit {
        // TODO: Pick random of known ones rather than closest
        // Maybe favour closer ones out of known ones?
        return Game.world
            .getExhibits()
            .filter(
                exhibit =>
                    !guest.inaccessibleExhibits.includes(exhibit.area.id) &&
                    !guest.visitedExhibits.includes(exhibit.area.id),
            )
            .reduce(
                (prev, current) =>
                    !prev ||
                    Vector.Distance(current.centre, guest.entity.position) <
                        Vector.Distance(prev.centre, guest.entity.position)
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
