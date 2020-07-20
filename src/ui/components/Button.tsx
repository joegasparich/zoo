/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";
import { UIComponent, UIComponentProps } from "engine/ui";

interface ButtonProps extends UIComponentProps {
    image?: string;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default class Button extends UIComponent<ButtonProps, {}> {
    protected getContent(): JSX.Element {
        return (
            <div className="button" onClick={this.props.onClick}>
                { this.props.image && <img src={this.props.image} /> }
                { this.props.children }
            </div>
        );
    }

    protected getStyles(): SerializedStyles {
        return css`
            display: inline-block;

            .button {
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #DDDDDD;
                width: 30px;
                height: 30px;
                cursor: pointer;
                margin: 2.5px;

                &:hover {
                    background-color: #FFFFFF;
                }

                img {
                    width: 80%;
                    height: 80%;
                }
            }
        `;
    }
}
