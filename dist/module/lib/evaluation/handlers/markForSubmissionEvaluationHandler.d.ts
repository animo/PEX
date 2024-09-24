import { InputDescriptorV1, InputDescriptorV2 } from '@sphereon/pex-models';
import { WrappedVerifiableCredential } from '@sphereon/ssi-types';
import { IInternalPresentationDefinition } from '../../types/Internal.types';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
export declare function elligibleInputDescriptorsForWrappedVc(inputDescriptors: Array<InputDescriptorV2 | InputDescriptorV1>, vcIndex: number, results: HandlerCheckResult[]): {
    inputDescriptor: InputDescriptorV2 | InputDescriptorV1;
    inputDescriptorIndex: number;
}[];
export declare class MarkForSubmissionEvaluationHandler extends AbstractEvaluationHandler {
    constructor(client: EvaluationClient);
    getName(): string;
    handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void;
    private retrieveNoErrorStatus;
    private produceSuccessResults;
    private produceErrorResults;
}
