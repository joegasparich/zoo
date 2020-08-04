import * as React from "react";

import { Vector } from "engine";
import Mediator from "engine/Mediator";
import { UIEvent } from "engine/consts/events";

import { Inputs } from "consts";
import { PlacementGhost } from "ui";
import ZooGame from "ZooGame";
import { Toolbar } from "./components";
import TreeTool from "./tools/TreeTool";
import WallTool from "./tools/WallTool";
import BiomeTool from "./tools/BiomeTool";
import { NoTool, Tool, ToolType } from "./tools";

export default class ToolManager {
    public game: ZooGame;

    private activeTool: Tool;
    public radius: number;

    private ghost: PlacementGhost;

    private toolbarRef: React.RefObject<Toolbar>;

    public constructor(game: ZooGame) {
        this.game = game;

        this.ghost = new PlacementGhost(this.game);

        this.setTool(ToolType.None);

        this.toolbarRef = React.createRef();
        this.game.canvas.addChild(React.createElement(Toolbar, {
            key: "toolbar",
            toolManager: this,
            game,
            ref: this.toolbarRef,
        }));
    }

    public update(): void {
        if(this.game.input.isInputPressed(Inputs.RightMouse)) {
            this.setTool(ToolType.None);
            this.toolbarRef.current?.setState({activeTool: ToolType.None});
            Mediator.fire(UIEvent.UNFOCUS);
        }

        this.activeTool.update();
    }

    public postUpdate(): void {
        this.activeTool.postUpdate();
        this.ghost.postUpdate();
    }

    public setTool(tool: ToolType, data?: Record<string, any>): void {
        this.ghost.setVisible(true);
        this.ghost.setPivot(new Vector(0.5, 0.5));
        this.ghost.setOffset(new Vector(0, 0));

        switch(tool) {
            case ToolType.Tree: this.activeTool = new TreeTool(this); break;
            case ToolType.Wall: this.activeTool = new WallTool(this); break;
            case ToolType.Biome: this.activeTool = new BiomeTool(this); break;

            case ToolType.None:
            default:
                this.activeTool = new NoTool(this);
                break;
        }

        this.activeTool.set(this.ghost, data);
    }

    public setRadius(radius: number): void {
        this.radius = radius;
        this.toolbarRef.current?.setState({radius});
    }

    public hasFocus(): boolean {
        return this.activeTool.type !== ToolType.None;
    }
}
