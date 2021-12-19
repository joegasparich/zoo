/** @jsx jsx */
import * as React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";
import { UIComponent, UIComponentProps } from ".";

interface ProgressBarProps extends UIComponentProps {
    percentage: number;
    colour?: string;
}

export default class ProgressBar extends UIComponent<ProgressBarProps, {}> {
    protected getContent(): JSX.Element {
        return (
            <div className="back">
                <div
                    className="front"
                    style={{
                        width: `${this.props.percentage * 100}%`,
                    }}
                />
            </div>
        );
    }

    protected getStyles(): SerializedStyles {
        return css`
            .back {
                position: relative;
                width: 100%;
                height: 10px;
                background-color: grey;
                border-radius: 5px;

                .front {
                    position: absolute;
                    background-color: ${this.props.colour ?? "red"};
                    height: 100%;
                    border-radius: 5px;
                }
            }
        `;
    }
}
