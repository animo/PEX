import { FieldV2 } from '@sphereon/pex-models';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV1, InternalPresentationDefinitionV2 } from '../../types';
import PexMessages from '../../types/Messages';
import { WrappedVerifiableCredential } from '../../types/PexCredentialMapper';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class FormatRestrictionEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'FormatRestrictionEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    const restrictToFormats = this.client.restrictToFormats ? Object.keys(this.client.restrictToFormats) : undefined;

    (pd as InternalPresentationDefinitionV1 | InternalPresentationDefinitionV2).input_descriptors.forEach((_inputDescriptor, index) => {
      wrappedVcs.forEach((wvc: WrappedVerifiableCredential, vcIndex: number) => {
        const formats = 'format' in _inputDescriptor && _inputDescriptor.format ? Object.keys(_inputDescriptor.format) : [wvc.format];
        let allowedFormats = restrictToFormats ?? formats;
        if ('format' in _inputDescriptor && _inputDescriptor.format && restrictToFormats !== undefined) {
          // Take the instersection, as an argument has been supplied for restrictions
          allowedFormats = Object.keys(_inputDescriptor.format).filter((k) => restrictToFormats.includes(k));
        }

        if (allowedFormats.includes(wvc.format)) {
          // According to 18013-7 the docType MUST match the input descriptor ID
          if (wvc.format === 'mso_mdoc') {
            if (wvc.credential.docType !== _inputDescriptor.id) {
              this.getResults().push(
                this.generateErrorResult(index, `$[${vcIndex}]`, wvc, PexMessages.INPUT_DESCRIPTOR_ID_MATCHES_MDOC_DOCTYPE_DIDNT_PASS),
              );
            }

            if (_inputDescriptor.constraints?.fields?.some((field) => field.filter !== undefined)) {
              this.getResults().push(
                this.generateErrorResult(index, `$[${vcIndex}]`, wvc, "Fields cannot have a 'filter' defined for mdoc credentials (ISO 18013-7)."),
              );
            }

            if (_inputDescriptor.constraints?.fields?.some((field: FieldV2) => field.intent_to_retain === undefined)) {
              this.getResults().push(
                this.generateErrorResult(
                  index,
                  `$[${vcIndex}]`,
                  wvc,
                  "Fields must have 'intent_to_retain' defined for mdoc credentials (ISO 18013-7).",
                ),
              );
            }
          }

          this.getResults().push(
            this.generateSuccessResult(index, `$[${vcIndex}]`, wvc, `${wvc.format} is allowed from ${JSON.stringify(allowedFormats)}`),
          );
        } else {
          this.getResults().push(this.generateErrorResult(index, `$[${vcIndex}]`, wvc));
        }
      });
    });

    this.updatePresentationSubmission(pd);
  }

  private generateErrorResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: message ?? PexMessages.FORMAT_RESTRICTION_DIDNT_PASS,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format,
      },
    };
  }

  private generateSuccessResult(idIdx: number, vcPath: string, wvc: WrappedVerifiableCredential, message?: string): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      evaluator: this.getName(),
      status: Status.INFO,
      message: message ?? PexMessages.FORMAT_RESTRICTION_PASSED,
      verifiable_credential_path: vcPath,
      payload: {
        format: wvc.format,
      },
    };
  }
}
