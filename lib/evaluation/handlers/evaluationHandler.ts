import { IInternalPresentationDefinition } from '../../types/Internal.types';
import { WrappedVerifiableCredential } from '../../types/PexCredentialMapper';
import { EvaluationClient } from '../evaluationClient';

export interface EvaluationHandler {
  client: EvaluationClient;
  setNext(handler: EvaluationHandler): EvaluationHandler;
  getNext(): EvaluationHandler | undefined;
  hasNext(): boolean;
  getName(): string;
  handle(pd: IInternalPresentationDefinition, wvc: WrappedVerifiableCredential[]): void;
}
