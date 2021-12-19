/** @jsx jsx */
import * as React from "react";
import classNames from "classnames";
import { css, jsx, SerializedStyles } from "@emotion/core";
import { UIComponent, UIComponentProps } from ".";

interface ButtonProps extends UIComponentProps {
    image?: string;
    active?: boolean;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export default class Button extends UIComponent<ButtonProps, {}> {
    protected getContent(): JSX.Element {
        return (
            <div className={classNames("button", this.props.active && "active")} onClick={this.props.onClick}>
                {this.props.image && <img src={this.props.image} />}
                {this.props.children}
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
                background-color: #dddddd;
                width: 30px;
                height: 30px;
                cursor: pointer;
                margin: 2.5px;

                &.active {
                    background-color: #87bedc;
                }

                &:hover {
                    background-color: #ffffff;
                }

                img {
                    width: 80%;
                    height: 80%;
                }
            }
        `;
    }
}
