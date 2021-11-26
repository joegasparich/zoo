/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps, Button, FloatingPanel } from ".";
import { Assets } from "consts";
import Mediator from "Mediator";
import Game from "Game";
import { UIEvent } from "consts/events";

interface DebugState {
    panelOpen: boolean;
}
const defaultState: DebugState = {
    panelOpen: false,
};

export default class DebugControls extends UIComponent<UIComponentProps, DebugState> {

    public focusID = "DEBUG_CONTROLS";

    private focusListener: string;
    private unfocusListener: string;

    public constructor(props: UIComponentProps) {
        super(props);

        this.state = defaultState;

        this.focusListener = Mediator.on(UIEvent.FOCUS, ({id}: {id: string}) => {
            if (id !== this.focusID) {
                this.setState({panelOpen: false});
            }
        });
        this.unfocusListener = Mediator.on(UIEvent.UNFOCUS, () => this.setState({panelOpen: false}));
    }

    public componentWillUnmount(): void {
        Mediator.unsubscribe(UIEvent.FOCUS, this.focusListener);
        Mediator.unsubscribe(UIEvent.UNFOCUS, this.unfocusListener);
    }

    protected getStyles(): SerializedStyles {
        return css`
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <div className="panel-button">
                    <Button
                        id="debugButton"
                        key="debugButton"
                        image={Assets.UI.DEBUG_ICON}
                        onClick={this.handlePanelButtonClick.bind(this)}
                    />
                    <FloatingPanel
                        key="panel"
                        className="panel"
                        hidden={!this.state.panelOpen}
                        layout="vertical"
                        showTriangle={true}
                    >
                        <Button
                            key="mapGridButton"
                            image={Assets.UI.GRID_ICON}
                            onClick={(): void => { Game.debugSettings.showMapGrid = !Game.debugSettings.showMapGrid; }}
                        />
                        <Button
                            key="pathfindingButton"
                            image={Assets.UI.PATHFINDING_ICON}
                            onClick={(): void => { Game.debugSettings.showPathfinding = !Game.debugSettings.showPathfinding; }}
                        />
                        <Button
                            key="wallButton"
                            image={Assets.UI.IRON_BAR_FENCE}
                            onClick={(): void => { Game.debugSettings.showWallGrid = !Game.debugSettings.showWallGrid; }}
                        />
                        <Button
                            key="elevationButton"
                            image={Assets.UI.ELEVATION_ICON}
                            onClick={(): void => { Game.debugSettings.showElevation = !Game.debugSettings.showElevation; }}
                        />
                        <Button
                            key="waterButton"
                            image={Assets.UI.WATER_ICON}
                            onClick={(): void => { Game.debugSettings.showWater = !Game.debugSettings.showWater; }}
                        />
                        <Button
                            key="pathButton"
                            image={Assets.UI.PATH_ICON}
                            onClick={(): void => { Game.debugSettings.showPath = !Game.debugSettings.showPath; }}
                        />
                    </FloatingPanel>
                </div>
            </React.Fragment>
        );
    }

    private handlePanelButtonClick(): void {
        if (this.state.panelOpen) {
            Mediator.fire(UIEvent.UNFOCUS);
        } else {
            Mediator.fire(UIEvent.FOCUS, {id: this.focusID});
        }

        this.setState({panelOpen: !this.state.panelOpen});
    }
}
