import Entity from "entities/Entity";
import Game from "Game";
import { randomItem } from "helpers/util";
import { COMPONENT, InputComponent, InteractableComponent, NeedsComponent, PathFollowComponent } from ".";
import { ComponentSaveData } from "./Component";

import { firstNames, lastNames } from "../../consts/names.json";
import { StateMachine } from "state";
import { Behaviour } from "entities/behaviours";
import { BehaviourData, createBehaviour, IdleBehaviour, LeaveBehaviour } from "entities/behaviours/guest";
import { randomInt } from "helpers/math";
import ViewBehaviour from "entities/behaviours/guest/ViewBehaviour";
import { InteractableEvents } from "./InteractableComponent";
import UIManager from "ui/UIManager";
import Vector from "vector";
import React from "react";
import GuestInfo from "ui/components/GuestInfo";
import { NeedType } from "types/AssetTypes";

const STATE_UPDATE_INTERVAL_RANGE: [number, number] = [1000, 5000];

interface GuestComponentSaveData extends ComponentSaveData {
    firstName: string;
    lastName: string;
    visitedExhibits: string[];
    behaviourData: BehaviourData;
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

    public stateMachine = new StateMachine<Behaviour>(new IdleBehaviour(this));
    private nextStateChange = 0;
    public visitedExhibits: string[] = [];
    // TODO: Should these reset periodically?
    public inaccessibleExhibits: string[] = [];

    private mouseDownHandle: string;

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

        this.mouseDownHandle = this.interactable.on(InteractableEvents.MouseDown, () => {
            UIManager.openWindow(
                `animal-${this.entity.id}`,
                `${this.firstName} ${this.lastName}`,
                new Vector(200, 200),
                React.createElement(GuestInfo, { guestId: this.entity.id }),
            );
        });
    }

    public update(delta: number): void {
        this.stateMachine.update(delta);

        if (Date.now() > this.nextStateChange) {
            this.checkForStateChange();
            this.nextStateChange = Date.now() + randomInt(...STATE_UPDATE_INTERVAL_RANGE);
        }
    }

    private checkForStateChange(): void {
        if (this.stateMachine.getState().id !== "IDLE") {
            // We only want to change state if idle
            return;
        }

        if (this.needs.getNeedByType(NeedType.Energy).value < 0.25) {
            this.stateMachine.setState(new LeaveBehaviour(this));
        }
        if (this.stateMachine.getState().id !== "VIEW") {
            if (Game.world.getExhibits().length > this.inaccessibleExhibits.length + this.visitedExhibits.length) {
                this.stateMachine.setState(new ViewBehaviour(this));
            }
        }
    }

    public end(): void {
        this.interactable?.unsubscribe(InteractableEvents.MouseDown, this.mouseDownHandle);
    }

    public save(): GuestComponentSaveData {
        return {
            ...super.save(),

            firstName: this.firstName,
            lastName: this.lastName,
            visitedExhibits: this.visitedExhibits,
            behaviourData: this.stateMachine.getState().save() as BehaviourData,
        };
    }

    public load(data: GuestComponentSaveData): void {
        super.load(data);

        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.visitedExhibits = data.visitedExhibits;

        const state = createBehaviour(data.behaviourData, this);
        state.load(data.behaviourData);

        this.stateMachine.setState(state);
    }

    public printDebug(): void {
        super.printDebug();

        console.log(`Name: ${this.firstName} ${this.lastName}`);
        console.log(`Current state: ${this.stateMachine.getState().id}`);
    }
}
