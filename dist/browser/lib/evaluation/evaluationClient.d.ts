import { Format, PresentationSubmission } from '@sphereon/pex-models';
import { WrappedVerifiableCredential } from '@sphereon/ssi-types';
import { IInternalPresentationDefinition } from '../types';
import { HandlerCheckResult } from './core';
export declare class EvaluationClient {
    constructor();
    private failed_catched;
    private _results;
    private _wrappedVcs;
    private _presentationSubmission;
    private _dids;
    private _limitDisclosureSignatureSuites;
    private _restrictToFormats;
    private _restrictToDIDMethods;
    private _generatePresentationSubmission;
    evaluate(pd: IInternalPresentationDefinition, wvcs: WrappedVerifiableCredential[], opts?: {
        holderDIDs?: string[];
        limitDisclosureSignatureSuites?: string[];
        restrictToFormats?: Format;
        restrictToDIDMethods?: string[];
        presentationSubmission?: PresentationSubmission;
        generatePresentationSubmission?: boolean;
    }): void;
    get results(): HandlerCheckResult[];
    get dids(): string[];
    set dids(dids: string[]);
    assertPresentationSubmission(): void;
    get generatePresentationSubmission(): boolean;
    set generatePresentationSubmission(value: boolean);
    get presentationSubmission(): PresentationSubmission;
    set presentationSubmission(presentationSubmission: Partial<PresentationSubmission>);
    get wrappedVcs(): WrappedVerifiableCredential[];
    set wrappedVcs(wrappedVcs: WrappedVerifiableCredential[]);
    get limitDisclosureSignatureSuites(): string[];
    set limitDisclosureSignatureSuites(limitDisclosureSignatureSuites: string[]);
    get restrictToDIDMethods(): string[];
    set restrictToDIDMethods(value: string[]);
    hasRestrictToDIDMethods(): boolean;
    get restrictToFormats(): Format | undefined;
    set restrictToFormats(value: Format | undefined);
    private initEvaluationHandlers;
}
