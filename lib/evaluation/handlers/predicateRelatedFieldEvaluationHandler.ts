import { ConstraintsV1, ConstraintsV2, InputDescriptorV2, Optionality } from '@sphereon/pex-models';

import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InternalPresentationDefinitionV2 } from '../../types/Internal.types';
import PexMessages from '../../types/Messages';
import { HandlerCheckResult } from '../core';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';

export class PredicateRelatedFieldEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'PredicateRelatedFieldEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition): void {
    // PresentationDefinitionV2 is the common denominator
    (pd as InternalPresentationDefinitionV2).input_descriptors.forEach((inDesc: InputDescriptorV2, index: number) => {
      if (inDesc.constraints) {
        this.examinePredicateRelatedField(index, inDesc.constraints);
      }
    });
    this.updatePresentationSubmission(pd);
  }

  private examinePredicateRelatedField(input_descriptor_idx: number, constraints: ConstraintsV1 | ConstraintsV2): void {
    if (constraints?.fields) {
      for (let i = 0; i < constraints.fields.length; i++) {
        for (let j = 0; j < this.getResults().length; j++) {
          this.examinePredicateForFilterEvaluationResult(this.getResults(), j, input_descriptor_idx, constraints, i);
        }
      }
    }
  }

  private examinePredicateForFilterEvaluationResult(
    results: HandlerCheckResult[],
    resultIdx: number,
    input_descriptor_idx: number,
    constraints: ConstraintsV1 | ConstraintsV2,
    fieldIdx: number,
  ) {
    const resultInputDescriptorIdx = this.retrieveResultInputDescriptorIdx(results[resultIdx].input_descriptor_path);
    if (
      results[resultIdx].payload &&
      results[resultIdx].payload.result &&
      results[resultIdx].payload.result.path &&
      results[resultIdx].evaluator === 'FilterEvaluation' &&
      input_descriptor_idx === resultInputDescriptorIdx &&
      constraints &&
      constraints.fields &&
      constraints.fields[fieldIdx] &&
      constraints.fields[fieldIdx].predicate &&
      constraints.fields[fieldIdx].path &&
      constraints.fields[fieldIdx].path?.includes(this.concatenatePath(results[resultIdx].payload.result.path))
    ) {
      const field = constraints.fields[fieldIdx];
      const evaluationResult = { ...results[resultIdx].payload.result };

      // We only support number with minimum/maximum for predicate type
      if (
        (field.filter?.type !== 'number' && field.filter?.type !== 'integer') ||
        (!field.filter.minimum && !field.filter.exclusiveMinimum && !field.filter.maximum && !field.filter.exclusiveMaximum)
      ) {
        results.push(
          this.createErrorResultObject(
            input_descriptor_idx,
            resultIdx,
            evaluationResult,
            results,
            "Only 'number' and 'integer' predicate with 'minimum', 'exclusiveMinimum', 'maximum', or 'exclusiveMaximum' supported.",
          ),
        );
        return;
      }

      if (evaluationResult.value === true) {
        const resultObject = this.createResultObject(input_descriptor_idx, resultIdx, evaluationResult, results);
        results.push(resultObject);
      } else if (field.predicate === Optionality.Required) {
        const resultObject = this.createWarnResultObject(
          input_descriptor_idx,
          resultIdx,
          evaluationResult,
          results,
          'Predicate is required but not applied',
        );
        results.push(resultObject);
      }
    }
  }

  private retrieveResultInputDescriptorIdx(input_descriptor_path: string): number {
    const inputDescriptorText = '$.input_descriptors[';
    const startIdx = input_descriptor_path.indexOf(inputDescriptorText);
    const startWithIdx = input_descriptor_path.substring(startIdx + inputDescriptorText.length);
    const endIdx = startWithIdx.indexOf(']');
    const idx = startWithIdx.substring(0, endIdx);
    return parseInt(idx);
  }

  private concatenatePath(path: string): string {
    let completePath = '';
    for (let i = 0; i < path.length; i++) {
      if (typeof path[i] === 'number') {
        completePath = completePath.substring(0, completePath.length - 1);
        completePath += '[*].';
      } else {
        completePath += path[i] + '.';
      }
    }
    return completePath.substring(0, completePath.length - 1);
  }

  private createResultObject(
    input_descriptor_idx: number,
    resultIdx: number,
    evaluationResult: unknown,
    results: HandlerCheckResult[],
  ): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${input_descriptor_idx}]`,
      verifiable_credential_path: results[resultIdx].verifiable_credential_path,
      evaluator: this.getName(),
      status: Status.INFO,
      message: PexMessages.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
      payload: evaluationResult,
    };
  }

  private createWarnResultObject(
    input_descriptor_idx: number,
    resultIdx: number,
    evaluationResult: unknown,
    results: HandlerCheckResult[],
    message: string,
  ): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${input_descriptor_idx}]`,
      verifiable_credential_path: results[resultIdx].verifiable_credential_path,
      evaluator: this.getName(),
      status: Status.WARN,
      message,
      payload: evaluationResult,
    };
  }

  private createErrorResultObject(
    input_descriptor_idx: number,
    resultIdx: number,
    evaluationResult: unknown,
    results: HandlerCheckResult[],
    message: string,
  ): HandlerCheckResult {
    return {
      input_descriptor_path: `$.input_descriptors[${input_descriptor_idx}]`,
      verifiable_credential_path: results[resultIdx].verifiable_credential_path,
      evaluator: this.getName(),
      status: Status.ERROR,
      message,
      payload: evaluationResult,
    };
  }
}
