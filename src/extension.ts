'use strict';

import * as vsc from 'vscode';
import { TextEditorCommands } from './commands';
import { XmlFormattingEditProvider, XQueryCompletionItemProvider, XQueryLintingFeatureProvider, XmlTreeDocumentContentProvider } from './providers';

export var GlobalState: vsc.Memento;
export var WorkspaceState: vsc.Memento;

const LANG_XML: string = 'xml';
const LANG_XSL: string = 'xsl';
const LANG_XQUERY: string = 'xquery;'
const MEM_QUERY_HISTORY: string = 'xpathQueryHistory';

export function activate(ctx: vsc.ExtensionContext) {
    console.log('activate extension');
    // expose global and workspace state to the entire extension
    GlobalState = ctx.globalState;
    WorkspaceState = ctx.workspaceState;
    
    // register palette commands
    ctx.subscriptions.push(
        vsc.commands.registerTextEditorCommand('xmlTools.minifyXml', TextEditorCommands.minifyXml),
        vsc.commands.registerTextEditorCommand('xmlTools.evaluateXPath', TextEditorCommands.evaluateXPath),
        vsc.commands.registerTextEditorCommand('xmlTools.executeXQuery', TextEditorCommands.executeXQuery),
        vsc.commands.registerTextEditorCommand('xmlTools.viewXmlTree', TextEditorCommands.viewXmlTree)
    );
    
    // register language feature providers
    ctx.subscriptions.push(
        vsc.languages.registerDocumentFormattingEditProvider([LANG_XML, LANG_XSL], new XmlFormattingEditProvider()),
        vsc.languages.registerDocumentRangeFormattingEditProvider([LANG_XML, LANG_XSL], new XmlFormattingEditProvider()),
        
        vsc.languages.registerCompletionItemProvider(LANG_XQUERY, new XQueryCompletionItemProvider(), ':', '$')
    );
    
    // register workspace feature providers
    ctx.subscriptions.push(
        vsc.workspace.registerTextDocumentContentProvider(XmlTreeDocumentContentProvider.SCHEME, new XmlTreeDocumentContentProvider())
    );
    
    // listen to editor events (for linting)
    ctx.subscriptions.push(
        vsc.window.onDidChangeActiveTextEditor(_handleChangeActiveTextEditor),
        vsc.window.onDidChangeTextEditorSelection(_handleChangeTextEditorSelection)
    );
}

export function deactivate() {
    // clean up xpath history
    let memento: vsc.Memento = WorkspaceState || GlobalState;
    let history = memento.get<any[]>(MEM_QUERY_HISTORY, []);
    history.splice(0);
    memento.update(MEM_QUERY_HISTORY, history);
}

function _handleContextChange(editor: vsc.TextEditor): void {
    if (!editor || !editor.document) {
        return;
    }
    
    switch (editor.document.languageId) {
        case 'xquery':
            XQueryLintingFeatureProvider.provideXQueryDiagnostics(editor);
            break;
    }
}

function _handleChangeActiveTextEditor(editor: vsc.TextEditor): void {
    _handleContextChange(editor);
}

function _handleChangeTextEditorSelection(e: vsc.TextEditorSelectionChangeEvent): void {
    _handleContextChange(e.textEditor);
}