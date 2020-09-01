/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps } from "engine/ui";

import { Assets } from "consts";
import { Button, DebugControls, FloatingPanel, BiomeControls } from "ui/components";
import ToolManager from "ui/ToolManager";
import { ToolType } from "ui/tools";
import UIManager from "ui/UIManager";
import { Vector } from "engine";
import AreaList from "./AreaList";

interface ToolbarProps extends UIComponentProps {
    toolManager: ToolManager;
}

interface ToolbarState {
    activeTool: ToolType;
    radius: number;
}
const defaultState: ToolbarState = {
    activeTool: 0,
    radius: 2.5,
};

export default class Toolbar extends UIComponent<ToolbarProps, ToolbarState> {

    public constructor(props: ToolbarProps) {
        super(props);

        this.state = defaultState;

        props.toolManager.radius = this.state.radius;
    }

    protected getStyles(): SerializedStyles {
        return css`
            pointer-events: none;
            width: 100%;
            height: 100%;
            background-color: transparent;
            position: absolute;

            .bar {
                pointer-events: all;
                background-color: #AAAAAA;
                top: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                position: absolute;
                width: 100%;
                height: 40px;
            }

            .panel-button {
                display: flex;
                justify-content: center;
            }

            .resize-panel {
                pointer-events: all;
                top: auto;
                bottom: 5px;
                right: 5px;

                .radius {
                    line-height: 30px;
                    width: 30px;
                    text-align: center;
                }
            }
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <div className="bar">
                    <Button
                        key="treeButton"
                        image={Assets.SPRITES.TREE}
                        onClick={(): void => {
                            this.setTool(ToolType.Tree);
                        }}
                    />
                    <Button
                        key="wallButton"
                        image={Assets.UI.IRON_BAR_FENCE}
                        onClick={(): void => {
                            this.setTool(ToolType.Wall);
                        }}
                    />
                    <Button
                        key="gateButton"
                        image={Assets.UI.IRON_BAR_GATE}
                        onClick={(): void => {
                            this.setTool(ToolType.Door);
                        }}
                    />
                    <Button
                        key="areasButton"
                        image={Assets.UI.IRON_BAR_GATE}
                        onClick={(): void => {
                            UIManager.openWindow("areaList", "Areas", new Vector(0, 400), <AreaList />);
                        }}
                    />
                    <BiomeControls
                        setTool={this.setTool.bind(this)}
                    />
                    <DebugControls />
                </div>
                <FloatingPanel
                    key="brushSize"
                    className="resize-panel"
                    hidden={this.state?.activeTool !== ToolType.Biome}
                    layout="horizontal"
                    showTriangle={false}
                >
                    <Button
                        key="decreaseButton"
                        onClick={(): void => {
                            const radius = Math.max(this.state.radius - 0.25, 0.5);
                            this.setState({radius: radius});
                            this.props.toolManager.radius = radius;
                        }}
                    >-</Button>
                    <span className="radius">{this.state.radius}</span>
                    <Button
                        key="increaseButton"
                        onClick={(): void => {
                            const radius = Math.min(this.state.radius + 0.25, 5);
                            this.setState({radius: radius});
                            this.props.toolManager.radius = radius;
                        }}
                    >+</Button>
                </FloatingPanel>
            </React.Fragment>
        );
    }

    private setTool(tool: ToolType, data?: Record<string, any>): void {
        this.setState({activeTool: tool});
        this.props.toolManager.setTool(tool, data);
    }
}
