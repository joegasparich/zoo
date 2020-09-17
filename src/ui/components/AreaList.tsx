import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import Area from "world/Area";
import { hexToString } from "helpers/util";
import AreaInfo from "./AreaInfo";
import Mediator from "Mediator";
import { WorldEvents } from "consts/events";
import Game from "Game";
import UIManager from "ui/UIManager";
import Vector from "vector";
import { UIComponent, UIComponentProps } from ".";

interface AreaListState {
    areas: Area[];
}
const defaultState: AreaListState = {
    areas: [],
};

export default class AreaList extends UIComponent<UIComponentProps, AreaListState> {

    private areasUpdateListener: string;

    public constructor(props: UIComponentProps) {
        super(props);

        this.state = defaultState;

        this.areasUpdateListener = Mediator.on(WorldEvents.AREAS_UPDATED, () => {
            this.updateAreas();
        });
    }

    public componentDidMount(): void {
        this.updateAreas();
    }
    public componentWillUnmount(): void {
        Mediator.unsubscribe(WorldEvents.AREAS_UPDATED, this.areasUpdateListener);
    }

    private updateAreas(): void {
        this.setState({
            areas: Game.world.getAreas(),
        });
    }

    protected getStyles(): SerializedStyles {
        return css`
            min-width: 200px;
            background: #ddd;

            .area {
                padding: 5px 10px;

                &:hover {
                    background: #eee;
                }

                .square {
                    width: 10px;
                    height: 10px;
                    display: inline-block;
                    margin-right: 5px;
                    border: 1px solid black;
                }
            }
        `;
    }

    protected getContent(): JSX.Element {
        const areaList = this.state.areas.map(area => {
            return (
                <div
                    className="area"
                    key={area.id}
                    onMouseEnter={(): void => this.handleMouseEnter(area)}
                    onMouseLeave={(): void => this.handleMouseLeave(area)}
                    onClick={(): void => this.handleClick(area)}
                >
                    <span className="square" style={{background: hexToString(area.colour)}} />
                    {area.name}
                </div>
            );
        });

        return (
            <div className="area-list">
                {areaList}
            </div>
        );
    }

    private handleMouseEnter(area: Area): void {
        area.highlighted = true;
    }
    private handleMouseLeave(area: Area): void {
        area.highlighted = false;
    }
    private handleClick(area: Area): void {
        UIManager.openWindow(`area-${area.id}`, area.name, new Vector(200, 200), <AreaInfo areaId={area.id} />);
    }
}
