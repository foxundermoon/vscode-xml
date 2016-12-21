'use strict';

import * as vsc from 'vscode';
import { RangeUtil } from './utils';
import { XmlFormatter } from './services';
import { XPathFeatureProvider, XQueryExecutionProvider, XmlTreeDocumentContentProvider } from './providers';

const CFG_SECTION: string = 'xmlTools';
const CFG_REMOVE_COMMENTS: string = 'removeCommentsOnMinify';

export class TextEditorCommands {
    static minifyXml(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        let removeComments: boolean = vsc.workspace.getConfiguration(CFG_SECTION).get<boolean>(CFG_REMOVE_COMMENTS, false);
        
        let range: vsc.Range = RangeUtil.getRangeForDocument(editor.document);
        
        let formatter: XmlFormatter = new XmlFormatter();
        let xml: string = formatter.minify(editor.document.getText());
        
        edit.replace(range, xml);
    }
    
    static evaluateXPath(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        XPathFeatureProvider.evaluateXPathAsync(editor, edit);
    }
    
    static executeXQuery(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): void {
        XQueryExecutionProvider.executeXQueryAsync(editor);
    }
    
    static async viewXmlTree(editor: vsc.TextEditor, edit: vsc.TextEditorEdit): Promise<void> {
        try {
            await vsc.commands.executeCommand(
                'vscode.previewHtml',
                XmlTreeDocumentContentProvider.buildUri(editor.document.uri),
                vsc.ViewColumn.Three);
        }
        
        catch (error) {
            vsc.window.showErrorMessage(`The XML Tree could not be created: ${error}`);
        }
    }
}