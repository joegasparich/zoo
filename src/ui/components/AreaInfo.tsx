import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";
import Area from "world/Area";
import ZooGame from "ZooGame";

const AREA_UPDATE_INTERVAL = 1000;

interface AreaInfoProps extends UIComponentProps {
    areaId: string;
}

interface AreaInfoState {
    area: Area;
}
const defaultState: AreaInfoState = {
    area: undefined,
};

export default class AreaInfo extends UIComponent<AreaInfoProps, AreaInfoState> {

    private updateIntervalHandle: number;

    public constructor(props: AreaInfoProps) {
        super(props);

        this.state = defaultState;

        this.updateIntervalHandle = window.setInterval(this.updateArea.bind(this), AREA_UPDATE_INTERVAL);
    }

    public componentDidMount(): void {
        this.updateArea();
    }
    public componentWillUnmount(): void {
        window.clearInterval(this.updateIntervalHandle);
    }

    private updateArea(): void {
        this.setState({
            area: ZooGame.world.getAreaById(this.props.areaId),
        });
    }

    protected getStyles(): SerializedStyles {
        return css`
            min-width: 400px;
            background: #ddd;
            padding: 0 20px;
            overflow: auto;
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <div className="area">
                <p>Area Name: {this.state.area?.name ?? ""}</p>
                <p>Size: {this.state.area?.getCells().length ?? "???"} Tiles</p>
            </div>
        );
    }
}
