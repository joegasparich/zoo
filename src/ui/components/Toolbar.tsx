/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { Vector } from "engine";
import { UIComponent } from "engine/ui";

import { Button } from "ui/components";
import { SPRITES } from "constants/assets";
import { PlacementGhost } from "ui";
import ZooGame from "ZooGame";

enum Tool {
    Snow,
    Tree
}

export default class Toolbar extends UIComponent {

    private game: ZooGame;

    private currentTool: Tool;
    private ghost: PlacementGhost;

    protected getStyles(): SerializedStyles {
        return css`
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            top: 0;
            width: 100%;
            height: 40px;
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <Button
                    image={SPRITES.TREE}
                    onClick={(): void => { this.setTool(Tool.Tree); }}
                />
                <Button
                    image={SPRITES.TREE}
                    onClick={(): void => { this.setTool(Tool.Snow); }}
                />
            </React.Fragment>
        );
    }

    public start(game: ZooGame): void {
        this.game = game;

        this.ghost = new PlacementGhost(this.game);
    }

    public setTool(tool: Tool): void {
        this.ghost.setVisible(false);
        this.currentTool = tool;

        switch(this.currentTool) {
        case Tool.Tree:
            this.ghost.setSprite(SPRITES.TREE);
            this.ghost.setVisible(true);
            break;
        default:
            break;
        }
    }

    public preUpdate(): void {
        switch(this.currentTool) {
        case Tool.Tree:
            break;
        default:
            break;
        }
    }

    public postUpdate(): void {
        switch(this.currentTool) {
        case Tool.Tree:
            this.ghost.postUpdate();
            break;
        default:
            break;
        }
    }

    private getQuadrant(pos: Vector): number {
        const xrel = (pos.x % 1) - 0.5;
        const yrel = (pos.y % 1) - 0.5;

        if (yrel < 0 && Math.abs(yrel) > Math.abs(xrel)) return 0; // North
        if (xrel < 0 && Math.abs(xrel) > Math.abs(yrel)) return 1; // West
        if (yrel > 0 && Math.abs(yrel) > Math.abs(xrel)) return 2; // South
        if (xrel > 0 && Math.abs(xrel) > Math.abs(yrel)) return 3; // East
    }
}
