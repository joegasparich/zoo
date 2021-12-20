import Entity from "entities/Entity";
import Game from "Game";
import { randomItem } from "helpers/util";
import { COMPONENT, InputComponent, InteractableComponent, NeedsComponent, PathFollowComponent } from ".";
import { ComponentSaveData } from "./Component";

import { firstNames, lastNames } from "../../consts/names.json";
import Exhibit from "world/Exhibit";
import Vector from "vector";
import { StateMachine } from "state";
import { Behaviour } from "entities/behaviours";
import { IdleBehaviour } from "entities/behaviours/guest";
import { randomInt } from "helpers/math";
import ViewBehaviour from "entities/behaviours/guest/ViewBehaviour";

const STATE_UPDATE_INTERVAL_RANGE: [number, number] = [1000, 5000];

interface GuestComponentSaveData extends ComponentSaveData {
    firstName: string;
    lastName: string;
    visitedExhibits: string[];
}

export default class GuestComponent extends InputComponent {
    public id: COMPONENT = "GUEST_COMPONENT";
    public type: COMPONENT = "INPUT_COMPONENT";

    public requires: COMPONENT[] = ["NEEDS_COMPONENT", "PATH_FOLLOW_COMPONENT", "INTERACTABLE_COMPONENT"];

    public pathfinder: PathFollowComponent;
    public needs: NeedsComponent;
    public interactable: InteractableComponent;

    public firstName: string;
    public lastName: string;

    public stateMachine = new StateMachine<Behaviour>(new IdleBehaviour());
    private nextStateChange = 0;
    public visitedExhibits: string[] = [];
    // TODO: Should these reset periodically?
    public inaccessibleExhibits: string[] = [];

    public start(entity: Entity): void {
        super.start(entity);

        this.pathfinder = entity.getComponent("PATH_FOLLOW_COMPONENT");
        this.needs = entity.getComponent("NEEDS_COMPONENT");
        this.interactable = entity.getComponent("INTERACTABLE_COMPONENT");

        if (!this.firstName) {
            this.firstName = randomItem(firstNames);
        }
        if (!this.lastName) {
            this.lastName = randomItem(lastNames);
        }
    }

    public update(delta: number): void {
        this.stateMachine.update(delta, this);

        if (Date.now() > this.nextStateChange) {
            this.checkForStateChange();
            this.nextStateChange = Date.now() + randomInt(...STATE_UPDATE_INTERVAL_RANGE);
        }
    }

    private checkForStateChange(): void {
        if (this.stateMachine.getState().id !== "VIEW") {
            if (Game.world.getExhibits().length > this.inaccessibleExhibits.length + this.visitedExhibits.length) {
                this.stateMachine.setState(new ViewBehaviour());
            }
        }
    }

    public save(): GuestComponentSaveData {
        return {
            ...super.save(),

            firstName: this.firstName,
            lastName: this.lastName,
            visitedExhibits: this.visitedExhibits,
        };
    }

    public load(data: GuestComponentSaveData): void {
        super.load(data);

        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.visitedExhibits = data.visitedExhibits;
    }

    public printDebug(): void {
        super.printDebug();

        // console.log(`Current state: ${this.stateMachine.getState().id}`);
        console.log(`Name: ${this.firstName} ${this.lastName}`);
        console.log(`Current state: ${this.stateMachine.getState().id}`);
    }
}
