import { NeedType } from "types/AssetTypes";
import { COMPONENT, Component } from ".";
import { ComponentSaveData } from "./Component";

export class Need {
    public static MAX_NEED = 100;

    public value = Need.MAX_NEED;

    public constructor(
        public type: NeedType,
        public change: number,
        public happinessMod: number,
        public canDie: boolean,
    ) {}

    public update(): void {
        if (this.value > Need.MAX_NEED) {
            this.value = Need.MAX_NEED;
        }
        this.value -= this.change;
    }
}

interface NeedsComponentSaveData extends ComponentSaveData {
    needs: {
        type: string;
        value: number;
        change: number;
        happinessMod: number;
        canDie: boolean;
    }[];
}

export default class NeedsComponent extends Component {
    public id: COMPONENT = "NEEDS_COMPONENT";
    public type: COMPONENT = "NEEDS_COMPONENT";

    public constructor(public needs?: Need[]) {
        super();
    }

    public update(): void {
        this.needs.forEach(need => need.update());
    }

    public getNeedByType(type: NeedType): Need {
        return this.needs.find(need => need.type === type);
    }

    public getNeedsByPriority(): Need[] {
        // TODO: Certain needs have higher priority? e.g. thirst over sleep
        return this.needs.sort((a, b) => a.value - b.value);
    }

    public save(): NeedsComponentSaveData {
        return {
            ...super.save(),
            needs: this.needs,
        };
    }

    public load(data: NeedsComponentSaveData): void {
        super.load(data);

        this.needs = [];
        data.needs.forEach(needData => {
            const need = new Need(needData.type as NeedType, needData.change, needData.happinessMod, needData.canDie);
            need.value = needData.value;
            this.needs.push(need);
        });
    }

    public printDebug(): void {
        super.printDebug();

        console.group("Needs:");
        this.needs.forEach(need => {
            console.log(need);
        });
        console.groupEnd();
    }
}
