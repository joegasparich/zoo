/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";

import { Button, FloatingPanel } from "ui/components";
import { Assets } from "consts";
import Mediator from "engine/Mediator";
import { UIEvent } from "engine/consts/events";
import ZooGame from "ZooGame";

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
                        image={Assets.UI.BIOME}
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
                            image={Assets.UI.GRASS}
                            onClick={(): void => { ZooGame.debugSettings.showMapGrid = !ZooGame.debugSettings.showMapGrid; }}
                        />
                        <Button
                            key="pathfindingButton"
                            image={Assets.UI.SNOW}
                            onClick={(): void => { ZooGame.debugSettings.showPathfinding = !ZooGame.debugSettings.showPathfinding; }}
                        />
                        <Button
                            key="physicsButton"
                            image={Assets.UI.SAND}
                            onClick={(): void => { ZooGame.debugSettings.showPhysics = !ZooGame.debugSettings.showPhysics; }}
                        />
                        <Button
                            key="wallButton"
                            image={Assets.UI.SAND}
                            onClick={(): void => { ZooGame.debugSettings.showWallGrid = !ZooGame.debugSettings.showWallGrid; }}
                        />
                        <Button
                            key="areaButton"
                            image={Assets.UI.SNOW}
                            onClick={(): void => { ZooGame.debugSettings.showAreas = !ZooGame.debugSettings.showAreas; }}
                        />
                    </FloatingPanel>
                </div>
            </React.Fragment>
        );
    }

    private handlePanelButtonClick(): void {
        this.setState({panelOpen: !this.state.panelOpen});
        Mediator.fire(UIEvent.FOCUS, {id: this.focusID});
    }
}
