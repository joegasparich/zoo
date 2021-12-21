import React from "react";
import { css, jsx, SerializedStyles } from "@emotion/core";
import { Need } from "entities/components/NeedsComponent";
import { NeedType } from "types/AssetTypes";
import UIComponent, { UIComponentProps } from "./UIComponent";
import ProgressBar from "./ProgressBar";

const NeedColours: Record<NeedType, string> = {
    hunger: "#e09646",
    thirst: "#4c9aed",
    energy: "#e6d930",
};

interface NeedsProps extends UIComponentProps {
    needs: Need[];
}

export default class Needs extends UIComponent<NeedsProps, undefined> {
    protected getStyles(): SerializedStyles {
        return css`
            .need {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 5px 0 5px 24px; // TODO: Indent component?

                .need-label {
                    text-transform: capitalize;
                    margin-right: 5px;
                }
                .need-bar {
                    width: 75%;
                }
            }
        `;
    }

    protected getContent(): JSX.Element {
        return (
            <div className="needs">
                {this.props.needs.map(need => (
                    <div key={need.type} className="need">
                        <span className="need-label">{need.type}:</span>
                        <ProgressBar
                            percentage={need.value / Need.MAX_NEED}
                            colour={NeedColours[need.type]}
                            className="need-bar"
                        />
                    </div>
                ))}
            </div>
        );
    }
}
