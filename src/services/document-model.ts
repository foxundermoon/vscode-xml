'use strict';

import { Disposable, TextDocument, TextDocumentChangeEvent, workspace } from 'vscode';
import { DOMParser } from 'xmldom';

/**
 * Represents an abstract object model for a given TextDocument.
 * Any number of object models can be associated with the raw text, and they will be made available on the DocumentModel.
 * 
 * @export
 * @class DocumentModel
 * @implements {Disposable}
 */
export class DocumentModel implements Disposable {
    private _documentChangeHandle: Disposable;
    private _isXmlDocument: boolean;
    private _xmlDocument: XMLDocument;

    constructor(private _baseDocument: TextDocument) {
        this._documentChangeHandle = workspace.onDidChangeTextDocument((e: TextDocumentChangeEvent) => {
            // TODO: create a service that checks the language ID as we could have xml, xsd, xslt, etc...
            if (e.document.languageId.toLowerCase() === 'xml' && e.document === this._baseDocument) {
                this._refreshXmlDocument();
            }
        });
    }

    /**
     * Gets the underlying TextDocument for this model.
     * 
     * @readonly
     * @type {TextDocument}
     * @memberOf DocumentModel
     */
    get baseDocument(): TextDocument {
        return this._baseDocument;
    }

    /**
     * Gets a value indicating whether or not the underlying TextDocument is a valid XML document.
     * 
     * @readonly
     * @type {boolean}
     * @memberOf DocumentModel
     */
    get isXmlDocument(): boolean {
        return this._isXmlDocument;
    }

    /**
     * Gets the XMLDocument associated with the underlying TextDocument.
     * Check the isXmlDocument property first to ensure this property will return a valid XMLDocument.
     * 
     * @readonly
     * @type {XMLDocument}
     * @memberOf DocumentModel
     */
    get xmlDocument(): XMLDocument {
        return this._xmlDocument;
    }

    /**
     * Unsubscribes from VS Code events and essentially "detaches" the model from the underlying TextDocument.
     * To "re-attach", a new DocumentModel should be constructed.
     * 
     * @memberOf DocumentModel
     */
    dispose(): void {
        this._documentChangeHandle.dispose();
    }

    private _refreshXmlDocument(): void {
        try {
            // TODO: figure out a way to throttle this so we aren't parsing a bunch of invalid XML strings
            this._xmlDocument = new DOMParser().parseFromString(this._baseDocument.getText());
            this._isXmlDocument = true;
        }

        catch (error) {
            this._isXmlDocument = false;
        }
    }
}