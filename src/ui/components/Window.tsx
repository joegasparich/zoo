import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";

import { UIComponent, UIComponentProps, Draggable } from ".";
import Vector from "vector";

interface WindowProps extends UIComponentProps {
    handleClose: (key: string) => void;
    windowId: string;
    title: string;
    content: JSX.Element;
    position: Vector;
}

export default class Window extends UIComponent<WindowProps, {}> {

    protected draggableClassName = "header";

    protected getStyles(): SerializedStyles {
        return css`

            .window {
                position: absolute;
                border-radius: 5px;
                overflow: hidden;

                .header {
                    display: flex;
                    justify-content: flex-end;
                    cursor: pointer;
                    background: #AAAAAA;

                    .title {
                        width: 100%;
                        padding: 5px 10px;
                    }

                    .exit-button {
                        width: 10px;
                        padding: 5px 10px;
                        background: #888;

                        &:hover {
                            background: red;
                            color: white;
                        }
                    }
                }

                .content {

                }
            }
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <React.Fragment>
                <Draggable draggableClassName={this.draggableClassName} position={this.props.position}>
                    <div className="window">
                        <div className={this.draggableClassName}>
                            <div className="title">{this.props.title}</div>
                            <div className="exit-button" onClick={(): void => this.props.handleClose(this.props.windowId)}>X</div>
                        </div>
                        <div className="content">
                            {this.props.content}
                        </div>
                    </div>
                </Draggable>
            </React.Fragment>
        );
    }
}
