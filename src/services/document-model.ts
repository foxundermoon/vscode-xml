'use strict';

import { TextDocument, TextDocumentChangeEvent, workspace } from 'vscode';
import { DOMParser } from 'xmldom';

export class DocumentModel {
    private _isXmlDocument: boolean;
    private _xmlDocument: XMLDocument;

    constructor(private _document: TextDocument) {
        workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
            if (e.document === this._document) {
                this._refreshXmlDocument();
            }
        });
    }

    get isXmlDocument(): boolean {
        return this._isXmlDocument;
    }

    get xmlDocument(): XMLDocument {
        return this._xmlDocument;
    }

    private _refreshXmlDocument(): void {
        try {
            // TODO: figure out a way to throttle this so we aren't parsing a bunch of invalid XML strings
            this._xmlDocument = new DOMParser().parseFromString(this._document.getText());
            this._isXmlDocument = true;
        }

        catch (error) {
            this._isXmlDocument = false;
        }
    }
}