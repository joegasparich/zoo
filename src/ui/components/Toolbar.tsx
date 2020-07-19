/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { Debug, Vector } from "engine";
import { UIComponent, UIComponentProps } from "engine/ui";
import { AssetManager } from "engine/managers";

import { Button } from "ui/components";
import { OBJECTS, SPRITES, UI } from "constants/assets";
import { PlacementGhost } from "ui";
import ZooGame from "ZooGame";
import Inputs from "constants/inputs";
import { TileObjectData } from "types/AssetTypes";
import { Biome } from "world/BiomeGrid";
import FloatingPanel from "./FloatingPanel";

enum Tool {
    None,
    Tree,
    Biome,
}

interface ToolbarState {
    activeButton: string;
}

export default class Toolbar extends UIComponent<UIComponentProps, ToolbarState> {

    private game: ZooGame;

    private currentTool: Tool;
    private currentBiome: Biome;
    private ghost: PlacementGhost;

    private radius: number;

    protected getStyles(): SerializedStyles {
        return css`
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: 0;
            width: 100%;
            height: 40px;

            .panel-button {
                display: flex;
                justify-content: center;
            }
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <Button
                    key="treeButton"
                    image={SPRITES.TREE}
                    onClick={(): void => { this.setTool(Tool.Tree); }}
                />
                <div className="panel-button">
                    <Button
                        key="biomeButton"
                        image={UI.BIOME}
                        onClick={(): void => { this.setState({activeButton: "biome"}); }}
                    />
                    <FloatingPanel key="panel" hidden={this.state?.activeButton !== "biome"}>
                        <Button
                            key="grassButton"
                            image={UI.GRASS}
                            onClick={(): void => { this.setTool(Tool.Biome); this.currentBiome = Biome.Grass; }}
                        />
                        <Button
                            key="snowButton"
                            image={UI.SNOW}
                            onClick={(): void => { this.setTool(Tool.Biome); this.currentBiome = Biome.Snow; }}
                        />
                        <Button
                            key="sandButton"
                            image={UI.SAND}
                            onClick={(): void => { this.setTool(Tool.Biome); this.currentBiome = Biome.Sand; }}
                        />
                    </FloatingPanel>
                </div>
            </React.Fragment>
        );
    }

    public start(game: ZooGame): void {
        this.game = game;

        this.ghost = new PlacementGhost(this.game);
        this.radius = 1;

        this.setTool(Tool.None);
    }

    public setTool(tool: Tool): void {
        this.currentTool = tool;
        this.ghost.setVisible(true);

        switch(this.currentTool) {
        case Tool.Tree:
            this.ghost.setSprite(SPRITES.TREE);
            this.ghost.setSnap(true);
            this.setState({activeButton: "tree"});
            break;
        case Tool.Biome:
            this.ghost.setDrawFunction(pos => {
                Debug.setLineStyle(1, 0x88BBFF);
                Debug.drawCircle(pos.multiply(16), this.radius * 8, 0x88BBFF, 0.5);
            });
            this.ghost.setSnap(false);
            break;
        case Tool.None:
        default:
            this.ghost.setVisible(false);
            this.setState({activeButton: ""});
            break;
        }
    }

    public update(): void {
        const mouseWorldPos = this.game.camera.screenToWorldPosition(this.game.input.getMousePos());

        if(this.game.input.isInputPressed(Inputs.RightMouse)) {
            this.setTool(Tool.None);
        }

        switch(this.currentTool) {
        case Tool.Tree:
            if (this.game.input.isInputPressed(Inputs.LeftMouse)) {
                const placePos: Vector = mouseWorldPos.floor();

                this.game.placeTileObject(AssetManager.getJSON(OBJECTS.TREE) as TileObjectData, placePos);
            }
            break;
        case Tool.Biome:
            if (this.game.input.isInputHeld(Inputs.LeftMouse)) {
                this.game.biomeGrid.setBiome(mouseWorldPos.multiply(2), this.radius, this.currentBiome);
            }
            break;
        default:
            break;
        }
    }

    public postUpdate(): void {
        this.ghost.postUpdate();
    }

    private getQuadrant(pos: Vector): number {
        const xrel = (pos.x % 1) - 0.5;
        const yrel = (pos.y % 1) - 0.5;

        if (yrel < 0 && Math.abs(yrel) > Math.abs(xrel)) return 0; // North
        if (xrel < 0 && Math.abs(xrel) > Math.abs(yrel)) return 1; // West
        if (yrel > 0 && Math.abs(yrel) > Math.abs(xrel)) return 2; // South
        if (xrel > 0 && Math.abs(xrel) > Math.abs(yrel)) return 3; // East
    }

    public hasFocus(): boolean {
        return this.state.activeButton !== "";
    }
}
