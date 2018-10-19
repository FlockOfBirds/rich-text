import { CSSProperties, Component, createElement } from "react";

import { CommonRichTextProps, RichText, TabOptions } from "./RichText";
import { ValidateConfigs } from "./ValidateConfigs";

export interface RichTextContainerProps extends CommonRichTextProps {
    class: string;
    style: CSSProperties;
    stringAttribute: PluginWidget.EditableValue<string>;
    sanitizeContent: boolean;
    editable: "default" | "never";
    onChangeAction?: PluginWidget.ActionValue;
    tabAction: TabOptions;
}

export type ReadOnlyStyle = "bordered" | "text" | "borderedToolbar";

export default class RichTextContainer extends Component<RichTextContainerProps> {
    private isEditing = false;
    private formHandle?: number;
    private readonly handleOnChangeAction = this.handleOnChange.bind(this);
    private readonly executeOnChange = this.executeOnChangeAction.bind(this);

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
                readOnlyStyle: this.props.stringAttribute.status === PluginWidget.ValueStatus.Available ? this.props.readOnlyStyle : "bordered",
                className: this.props.class,
                style: this.props.style,
                sanitizeContent: this.props.sanitizeContent,
                value: this.props.stringAttribute.value || "",
                onChange: !readOnly ? this.handleOnChangeAction : undefined,
                onBlur: !readOnly ? this.executeOnChange : undefined,
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
        }
        this.isEditing = true;
    }

    componentDidMount() {
        this.onFormSubmit = this.onFormSubmit.bind(this);
        const mxform = (mx.ui as any).getContentForm() as mxui.lib.form._FormBase;
        this.formHandle = mxform.listen("submit", this.onFormSubmit);
    }

    componentWillUnmount() {
        if (this.formHandle) {
            const mxform = (mx.ui as any).getContentForm() as mxui.lib.form._FormBase;
            mxform.unlisten(this.formHandle);
        }
    }

    private executeOnChangeAction() {
        if (this.props.onChangeAction) {
            this.props.onChangeAction.execute();
        }
        if (this.isEditing) {
            this.isEditing = false;
        }
    }

    // Use for exceptional case where/when user has focus inside the widget and clicks a button
    private onFormSubmit(onSuccess: () => void) {
        if (this.isEditing) {
            this.executeOnChangeAction();
        }
        onSuccess();
    }
}
