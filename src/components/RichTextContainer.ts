import { CSSProperties, Component, createElement } from "react";

import { CommonRichTextProps, RichText, TabOptions } from "./RichText";
import { ValidateConfigs } from "./ValidateConfigs";

// import { getValue } from "../utils/ContainerUtils";
// import { getValue, parseStyle } from "../utils/ContainerUtils";
// interface WrapperProps {
//     "class": string;
//     mxform: mxui.lib.form._FormBase;
//     mxObject?: mendix.lib.MxObject;
//     style: string;
//     readOnly: boolean;
// }

export interface RichTextContainerProps extends CommonRichTextProps {
    class: string;
    style: CSSProperties;
    stringAttribute: PluginWidget.EditableValue<string>;
    sanitizeContent: boolean;
    editable: "default" | "never";
    onChangeAction?: PluginWidget.ActionValue;
    tabAction: TabOptions;
}

interface RichTextContainerState {
    alertMessage: string;
    value: string;
}

export type ReadOnlyStyle = "bordered" | "text" | "borderedToolbar";
// type Handler = () => void;

export default class RichTextContainer extends Component<RichTextContainerProps, RichTextContainerState> {
    // private defaultValue: string | null | undefined = undefined;
    private isEditing = false;

    readonly state: RichTextContainerState = {
        alertMessage: "",
        value: this.props.stringAttribute.value || ""
    };

    componentWillMount() {
        this.handleOnChange = this.handleOnChange.bind(this);
        this.executeOnChangeAction = this.executeOnChangeAction.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    render() {
        const readOnly = this.isReadOnly();
        return createElement(ValidateConfigs, { ...this.props as RichTextContainerProps, showOnError: false },
            createElement(RichText, {
                editorOption: this.props.editorOption,
                tabAction: this.props.tabAction,
                theme: this.props.theme,
                customOptions: this.props.customOptions,
                minNumberOfLines: this.props.minNumberOfLines,
                maxNumberOfLines: this.props.maxNumberOfLines,
                // readOnlyStyle: this.props.mxObject ? this.props.readOnlyStyle : "bordered",
                readOnlyStyle: this.props.readOnlyStyle,
                className: this.props.class,
                style: this.props.style,
                sanitizeContent: this.props.sanitizeContent,
                value: this.state.value,
                onChange: !readOnly ? this.handleOnChange : undefined,
                onBlur: !readOnly ? this.executeOnChangeAction : undefined,
                readOnly,
                alertMessage: this.state.alertMessage
            })
        );
    }

    private isReadOnly(): boolean {
        const { stringAttribute, editable } = this.props;
        return editable === "default" ? stringAttribute.readOnly : true;
    }

    private handleOnChange(value: string) {
        const { stringAttribute } = this.props;

        if (!stringAttribute.readOnly) {
            stringAttribute.setValue(value);
            this.executeOnChangeAction();
        }
        this.isEditing = true;
    }

    private executeOnChangeAction() {
        if (this.props.onChangeAction) {
            this.props.onChangeAction.execute();
            // this.defaultValue = this.state.value;
        }
        if (this.isEditing) {
            this.isEditing = false;
        }
    }

    private onFormSubmit(onSuccess: () => void) {
        if (this.isEditing) {
            this.executeOnChangeAction();
        }
        onSuccess();
    }
}
