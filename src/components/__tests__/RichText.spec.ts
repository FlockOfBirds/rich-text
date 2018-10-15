import { ShallowWrapper, mount, shallow } from "enzyme";
import { createElement } from "react";

// import * as classNames from "classnames";

import { RichText, RichTextProps } from "../RichText";
import { Alert } from "../Alert";

describe("RichText", () => {

    const shallowRenderTextEditor = (props: RichTextProps) => shallow(createElement(RichText, props));
    const fullRenderTextEditor = (props: RichTextProps) => mount(createElement(RichText, props));
    let textEditor: ShallowWrapper<RichTextProps, any>;

    const defaultProps: RichTextProps = {
        customOptions: [],
        editorOption: "basic",
        maxNumberOfLines: 10,
        minNumberOfLines: 10,
        sanitizeContent: false,
        onChange: jasmine.any(Function),
        onBlur: jasmine.any(Function),
        readOnly: false,
        readOnlyStyle: "bordered",
        theme: "snow",
        value: "<p>Rich Text</p>"
    };

    beforeEach(() => {
        textEditor = shallow(createElement(RichText, {
            ...defaultProps })
        );
    });

    describe("that is not read-only", () => {
        it("renders the structure correctly", () => {
            textEditor.setProps({ readOnly: false });

            expect(textEditor).toBeElement(
                createElement("div", { className: "widget-rich-text" },
                    createElement("div", { style: { whiteSpace: "pre-wrap" } },
                        createElement("div", { className: "widget-rich-text-quill" })
                    ),
                    createElement(Alert, {})
                )
            );
        });

        it("renders a quill editor", () => {
            const textEditorInstance = textEditor.instance() as any;
            textEditorInstance.quillNode = document.createElement("div");
            document.createElement("div").appendChild(textEditorInstance.quillNode);

            const editorSpy = spyOn(textEditorInstance, "setUpEditor").and.callThrough();
            textEditorInstance.componentDidMount();

            expect(editorSpy).toHaveBeenCalled();
        });

        it("updates when the editor value changes", () => {
            const richText = fullRenderTextEditor(defaultProps);
            const textEditorInstance = richText.instance() as any;
            textEditorInstance.quillNode = document.createElement("div");
            document.createElement("div").appendChild(textEditorInstance.quillNode);

            const editorSpy = spyOn(textEditorInstance, "updateEditor").and.callThrough();
            textEditorInstance.componentDidUpdate(defaultProps);
            textEditorInstance.componentDidMount();
            richText.setProps({ value: "New value" });

            expect(editorSpy).toHaveBeenCalledTimes(1);
        });

        it("renders a quill editor with an alert message", () => {
            const extendedProps = {
                ...defaultProps,
                alertMessage: "Error message"
            };
            const shallowTextEditor = shallowRenderTextEditor(extendedProps);
            shallowTextEditor.setProps({ readOnly: false });

            expect(shallowTextEditor).toBeElement(
                createElement("div", { className: "widget-rich-text has-error" },
                    createElement("div", {
                            style: { whiteSpace: "pre-wrap" },
                            dangerouslySetInnerHTML: undefined
                        },
                        createElement("div", { className: "widget-rich-text-quill" })
                    ),
                    createElement(Alert, { message: extendedProps.alertMessage })
                )
            );
        });
    });

    describe("with editor mode set to", () => {
        const getToolBar: any = (props: RichTextProps) => {
            const fullTextEditor = fullRenderTextEditor(props);
            const textEditorInstance = fullTextEditor.instance() as any;
            const quillNode = textEditorInstance.quillNode = document.createElement("div");
            document.createElement("div").appendChild(quillNode);

            return textEditorInstance.quill.getModule("toolbar");
        };

        it("basic renders a basic text editor", () => {
            const toolbar = getToolBar(defaultProps);

            expect(toolbar.options.container.length).toBe(2);
        });

        it("extended renders an extended text editor", () => {
            const extendedProps = {
                ...defaultProps,
                editorOption: "extended"
            };
            const toolbar = getToolBar(extendedProps);

            expect(toolbar.options.container.length).toBe(6);
        });

        it("custom renders a custom toolbar", () => {
            const customOptions = [ { option: "bold" }, { option: "spacer" }, { option: "underline" } ];
            const extendedProps = {
                ...defaultProps,
                editorOption: "custom",
                customOptions
            };
            const toolbar = getToolBar(extendedProps);

            expect(toolbar.options.container.length).toBe(2);
        });
    });

    describe("that is read-only", () => {
        beforeEach(() => {
            textEditor.setProps({ readOnly: true });
        });

        it("with read-only style text renders the structure correctly", () => {
            textEditor.setProps({ readOnlyStyle: "text" });

            expect(textEditor).toBeElement(
                createElement("div", { className: "widget-rich-text disabled-text ql-snow" },
                    createElement("div", {
                        className: "ql-editor",
                        style: { whiteSpace: "pre-wrap" },
                        dangerouslySetInnerHTML: { __html: defaultProps.value }
                    })
                )
            );
        });

        it("with read-only style bordered has the disabled-bordered class", () => {
            textEditor.setProps({ readOnlyStyle: "bordered" });

            expect(textEditor).toHaveClass("disabled-bordered");
        });

        it("with read-only style borderedToolbar has the disabled-bordered-toolbar class", () => {
            textEditor.setProps({ readOnlyStyle: "borderedToolbar" });

            expect(textEditor).toHaveClass("disabled-bordered-toolbar");
        });
    });

    it("destroys and recreates the editor on update when configured to recreate", () => {
        const richText = fullRenderTextEditor(defaultProps);
        richText.setProps({ recreate: true });
        const richTextInstance = richText.instance() as any;
        const editorSpy = spyOn(richTextInstance, "setUpEditor").and.callThrough();

        richTextInstance.componentDidUpdate();
        expect(editorSpy).toHaveBeenCalled();
    });

    it("cleans and removes unwanted tags when configured to sanitize", () => {
        const customProps = {
            ...defaultProps,
            sanitizeContent: true,
            value: "<script>Header</script>",
            readOnly: true
        };
        const richText = fullRenderTextEditor(customProps);

        const richTextInstance = richText.instance() as any;
        const editorSpy = spyOn(richTextInstance, "sanitize").and.callThrough();
        richTextInstance.componentDidUpdate(customProps);
        richTextInstance.componentDidMount();

        expect(richTextInstance.quill.container.firstChild.innerHTML).toBe("<p><br></p>");
        expect(editorSpy).toHaveBeenCalled();
    });

    it("does not sanitize content when configured to not to", () => {
        const customProps = {
            ...defaultProps,
            sanitizeContent: false,
            value: "<script>Header</script>",
            readOnly: true
        };
        const richText = fullRenderTextEditor(customProps);

        const richTextInstance = richText.instance() as any;
        const editorSpy = spyOn(richTextInstance, "sanitize").and.callThrough();
        richTextInstance.componentDidUpdate(customProps);
        richTextInstance.componentDidMount();

        expect(richTextInstance.quill.container.firstChild.innerHTML).toBe("<p>Header</p>");
        expect(editorSpy).toHaveBeenCalled();
    });

    describe("whose read-only status changes from true to false", () => {
        it("and read-only style is not text sets up the editor afresh", () => {
            defaultProps.readOnly = true;
            const richText = fullRenderTextEditor(defaultProps);
            const editorSpy = spyOn(richText.instance() as any, "setUpEditor").and.callThrough();

            richText.setProps({ readOnly: false });
            expect(editorSpy).toHaveBeenCalled();
        });
    });
});
