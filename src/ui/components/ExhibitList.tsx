import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { hexToString } from "helpers/util";
import ExhibitInfo from "./ExhibitInfo";
import Mediator from "Mediator";
import { WorldEvent } from "consts/events";
import Game from "Game";
import UIManager from "ui/UIManager";
import Vector from "vector";
import { UIComponent, UIComponentProps } from ".";
import Exhibit from "world/Exhibit";

interface ExhibitListState {
    exhibits: Exhibit[];
}
const defaultState: ExhibitListState = {
    exhibits: [],
};

export default class ExhibitList extends UIComponent<UIComponentProps, ExhibitListState> {

    private exhibitUpdateListener: string;

    public constructor(props: UIComponentProps) {
        super(props);

        this.state = defaultState;

        this.exhibitUpdateListener = Mediator.on(WorldEvent.EXHIBITS_UPDATED, () => {
            this.updateExhibits();
        });
    }

    public componentDidMount(): void {
        this.updateExhibits();
    }
    public componentWillUnmount(): void {
        Mediator.unsubscribe(WorldEvent.EXHIBITS_UPDATED, this.exhibitUpdateListener);
    }

    private updateExhibits(): void {
        this.setState({
            exhibits: Game.world.getExhibits(),
        });
    }

    protected getStyles(): SerializedStyles {
        return css`
            min-width: 200px;
            background: #ddd;

            .exhibit {
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
        const exhibitList = this.state.exhibits.map(exhibit => {
            return (
                <div
                    className="exhibit"
                    key={exhibit.area.id}
                    onMouseEnter={(): void => this.handleMouseEnter(exhibit)}
                    onMouseLeave={(): void => this.handleMouseLeave(exhibit)}
                    onClick={(): void => this.handleClick(exhibit)}
                >
                    <span className="square" style={{background: hexToString(exhibit.area.colour)}} />
                    {exhibit.area.name}
                </div>
            );
        });

        return (
            <div className="exhibit-list">
                {exhibitList}
            </div>
        );
    }

    private handleMouseEnter(exhibit: Exhibit): void {
        exhibit.area.highlighted = true;
    }
    private handleMouseLeave(exhibit: Exhibit): void {
        exhibit.area.highlighted = false;
    }
    private handleClick(exhibit: Exhibit): void {
        UIManager.openWindow(`exhibit-${exhibit.area.id}`, exhibit.area.name, new Vector(200, 200), <ExhibitInfo areaId={exhibit.area.id} />);
    }
}
