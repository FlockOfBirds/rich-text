import { CSSProperties, Component, createElement } from "react";

import { CommonRichTextProps, RichText, TabOptions } from "./RichText";
import { ValidateConfigs } from "./ValidateConfigs";
// import { AttributeValue } from "typings/pluginWidget";

// import { getValue } from "../utils/ContainerUtils";
// import { getValue, parseStyle } from "../utils/ContainerUtils";
interface WrapperProps extends CommonRichTextProps {
    // "class": string;
    mxform: mxui.lib.form._FormBase;
    mxObject?: mendix.lib.MxObject;
    // style: string;
    // readOnly: boolean;
}

export interface RichTextContainerProps extends WrapperProps {
    class: string;
    style: CSSProperties;
    stringAttribute: PluginWidget.EditableValue<string>;
    sanitizeContent: boolean;
    editable: "default" | "never";
    onChangeAction?: PluginWidget.ActionValue;
    tabAction: TabOptions;
    customOptions: PluginWidget.DynamicValue<object[]>;
}

export type ReadOnlyStyle = "bordered" | "text" | "borderedToolbar";

export default class RichTextContainer extends Component<RichTextContainerProps> {
    private isEditing = false;

    componentWillMount() {
        this.handleOnChange = this.handleOnChange.bind(this);
        this.executeOnChangeAction = this.executeOnChangeAction.bind(this);
        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    // componentWillUpdate() {
    //     this.onFormSubmit();
    // }
    componentDidMount() {
        // tslint:disable-next-line:no-console
        console.log(this.props.mxform);
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
                readOnlyStyle: this.props.stringAttribute.status ? this.props.readOnlyStyle : "bordered",
                // readOnlyStyle: this.props.readOnlyStyle,
                className: this.props.class,
                style: this.props.style,
                sanitizeContent: this.props.sanitizeContent,
                value: this.props.stringAttribute.value || "",
                onChange: !readOnly ? this.handleOnChange : undefined,
                onBlur: !readOnly ? this.executeOnChangeAction : undefined,
                readOnly,
                alertMessage: this.props.stringAttribute.validation.join(", ")
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
