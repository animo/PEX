import { InputDescriptorV1, InputDescriptorV2, Optionality } from '@sphereon/pex-models';
import {
  AdditionalClaims,
  ICredential,
  ICredentialSubject,
  IVerifiableCredential,
  SdJwtDecodedVerifiableCredential,
  SdJwtPresentationFrame,
} from '@sphereon/ssi-types';

import { ClaimValue } from '../../../test/types';
import { Status } from '../../ConstraintUtils';
import { IInternalPresentationDefinition, InputDescriptorWithIndex, PathComponent } from '../../types';
import PexMessages from '../../types/Messages';
import { PexCredentialMapper, WrappedVerifiableCredential } from '../../types/PexCredentialMapper';
import { applySdJwtLimitDisclosure, JsonPathUtils } from '../../utils';
import { EvaluationClient } from '../evaluationClient';

import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { eligibleInputDescriptorsForWrappedVc } from './markForSubmissionEvaluationHandler';

export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
  constructor(client: EvaluationClient) {
    super(client);
  }

  public getName(): string {
    return 'LimitDisclosureEvaluation';
  }

  public handle(pd: IInternalPresentationDefinition, wrappedVcs: WrappedVerifiableCredential[]): void {
    this.evaluateLimitDisclosure(pd.input_descriptors as InputDescriptorV2[], wrappedVcs);
  }

  private isLimitDisclosureSupported(
    eligibleInputDescriptors: InputDescriptorWithIndex[],
    wvc: WrappedVerifiableCredential,
    vcIndex: number,
  ): boolean {
    if (wvc.format === 'vc+sd-jwt' || wvc.format === 'mso_mdoc') return true;
    if (wvc.format === 'ldp' || wvc.format === 'jwt') return false;

    const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
    const decoded = wvc.decoded as IVerifiableCredential;
    const proofs = Array.isArray(decoded.proof) ? decoded.proof : decoded.proof ? [decoded.proof] : undefined;
    const requiredLimitDisclosureInputDescriptorIds = eligibleInputDescriptors
      .map(({ inputDescriptor: { constraints }, inputDescriptorIndex }) =>
        constraints?.limit_disclosure === Optionality.Required ? inputDescriptorIndex : undefined,
      )
      .filter((id): id is number => id !== undefined);

    if (!proofs || proofs.length === 0 || proofs.length > 1 || !proofs[0].type) {
      // todo: Support/inspect array based proofs
      if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
        this.createLimitDisclosureNotSupportedResult(
          eligibleInputDescriptors.map((i) => i.inputDescriptorIndex),
          vcIndex,
          'Multiple proofs on verifiable credential not supported for limit disclosure',
        );
      }
      return false;
    }

    const proof = proofs[0];
    const signatureSuite = proof.cryptosuite ? `${proof.type}.${proof.cryptosuite}` : proof.type;
    if (!limitDisclosureSignatures?.includes(signatureSuite)) {
      if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
        this.createLimitDisclosureNotSupportedResult(
          requiredLimitDisclosureInputDescriptorIds,
          vcIndex,
          `Signature suite '${signatureSuite}' is not present in limitDisclosureSignatureSuites [${limitDisclosureSignatures.join(',')}]`,
        );
      }
      return false;
    }

    return true;
  }

  private evaluateLimitDisclosure(inputDescriptors: Array<InputDescriptorV2 | InputDescriptorV1>, wrappedVcs: WrappedVerifiableCredential[]): void {
    wrappedVcs.forEach((wvc, vcIndex) => {
      const eligibleInputDescriptors = eligibleInputDescriptorsForWrappedVc(inputDescriptors, vcIndex, this.getResults());

      if (eligibleInputDescriptors.length > 0 && this.isLimitDisclosureSupported(eligibleInputDescriptors, wvc, vcIndex)) {
        this.enforceLimitDisclosure(wrappedVcs, eligibleInputDescriptors, vcIndex);
      }
    });
  }

  private enforceLimitDisclosure(wrappedVcs: WrappedVerifiableCredential[], eligibleInputDescriptors: InputDescriptorWithIndex[], vcIndex: number) {
    const wvc = wrappedVcs[vcIndex];

    if (PexCredentialMapper.isWrappedSdJwtVerifiableCredential(wvc)) {
      const presentationFrame = this.createSdJwtPresentationFrame(eligibleInputDescriptors, wvc.credential, vcIndex);

      // We update the SD-JWT to it's presentation format (remove disclosures, update pretty payload, etc..), except
      // we don't create or include the (optional) KB-JWT yet, this is done when we create the presentation
      if (presentationFrame) {
        applySdJwtLimitDisclosure(wvc.credential, presentationFrame);
        wvc.decoded = wvc.credential.decodedPayload;
        // We need to overwrite the original, as that is returned in the selectFrom method
        // But we also want to keep the format of the original credential.
        wvc.original = PexCredentialMapper.isSdJwtDecodedCredential(wvc.original) ? wvc.credential : wvc.credential.compactSdJwtVc;

        for (const { inputDescriptorIndex, inputDescriptor } of eligibleInputDescriptors) {
          this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
        }
      }
    } else if (PexCredentialMapper.isWrappedMdocCredential(wvc)) {
      for (const { inputDescriptorIndex, inputDescriptor } of eligibleInputDescriptors) {
        this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
      }
    } else if (PexCredentialMapper.isWrappedW3CVerifiableCredential(wvc)) {
      const internalCredentialToSend = this.createVcWithRequiredFields(eligibleInputDescriptors, wvc.credential, vcIndex);
      /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
       * remain untouched and the verifiable credential won't be submitted.
       */
      if (internalCredentialToSend) {
        wvc.credential = internalCredentialToSend;
        for (const { inputDescriptorIndex, inputDescriptor } of eligibleInputDescriptors) {
          this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
        }
      }
    } else {
      throw new Error('Unsupported format for selective disclosure');
    }
  }

  private createSdJwtPresentationFrame(
    inputDescriptors: InputDescriptorWithIndex[],
    vc: SdJwtDecodedVerifiableCredential,
    vcIndex: number,
  ): SdJwtPresentationFrame | undefined {
    // Mapping of key -> true to indicate which values should be disclosed in an SD-JWT
    // Can be nested array / object
    const presentationFrame: SdJwtPresentationFrame = {};

    const processNestedObject = (obj: ClaimValue, currentPath: PathComponent[], basePath: PathComponent[]) => {
      if (obj === null || typeof obj !== 'object') {
        // For literal values, set the path to true in the presentation frame
        JsonPathUtils.setValue(presentationFrame, currentPath, true);
        return;
      }

      // For arrays, process each element
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          processNestedObject(item, [...currentPath, index], basePath);
        });
        return;
      }

      // For objects, process each child property
      Object.entries(obj).forEach(([key, value]) => {
        processNestedObject(value, [...currentPath, key], basePath);
      });
    };

    for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
      for (const field of inputDescriptor.constraints?.fields ?? []) {
        if (field.path) {
          const inputField = JsonPathUtils.extractInputField(vc.decodedPayload, field.path);

          if (inputField.length > 0) {
            const selectedField = inputField[0];
            const fieldValue = JsonPathUtils.getValue<ClaimValue>(vc.decodedPayload, selectedField.path);

            if (fieldValue !== null && typeof fieldValue === 'object') {
              // For objects, recursively process all nested fields
              processNestedObject(fieldValue, selectedField.path, selectedField.path);
            } else {
              // For literal values, just set the path to true
              JsonPathUtils.setValue(presentationFrame, selectedField.path, true);
            }
          } else if (!('optional' in field && field.optional)) {
            this.createMandatoryFieldNotFoundResult(inputDescriptorIndex, vcIndex, field.path);
            return undefined;
          }
        }
      }
    }

    return presentationFrame;
  }

  private createVcWithRequiredFields(
    inputDescriptors: InputDescriptorWithIndex[],
    vc: IVerifiableCredential,
    vcIndex: number,
  ): IVerifiableCredential | undefined {
    let credentialToSend: IVerifiableCredential = {} as IVerifiableCredential;
    credentialToSend = Object.assign(credentialToSend, vc);
    credentialToSend.credentialSubject = {};

    for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
      for (const field of inputDescriptor.constraints?.fields ?? []) {
        if (field.path) {
          const inputField = JsonPathUtils.extractInputField(vc, field.path);
          if (inputField.length > 0) {
            credentialToSend = this.copyResultPathToDestinationCredential(inputField[0], vc, credentialToSend);
          } else if (!('optional' in field && field.optional)) {
            this.createMandatoryFieldNotFoundResult(inputDescriptorIndex, vcIndex, field.path);
            return undefined;
          }
        }
      }
    }
    return credentialToSend;
  }

  private copyResultPathToDestinationCredential(
    requiredField: { path: PathComponent[]; value: unknown },
    internalCredential: ICredential,
    internalCredentialToSend: IVerifiableCredential,
  ): IVerifiableCredential {
    //TODO: ESSIFI-186
    let credentialSubject: ICredentialSubject & AdditionalClaims = { ...internalCredential.credentialSubject };
    requiredField.path.forEach((e) => {
      if (credentialSubject[e as keyof ICredentialSubject]) {
        credentialSubject = { [e]: credentialSubject[e as keyof ICredentialSubject] } as { [x: string]: unknown };
      }
    });
    internalCredentialToSend.credentialSubject = {
      ...internalCredentialToSend.credentialSubject,
      ...credentialSubject,
    };
    return internalCredentialToSend;
  }

  private createSuccessResult(idIdx: number, path: string, limitDisclosure?: Optionality) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `${path}`,
      evaluator: this.getName(),
      status: limitDisclosure === Optionality.Required || limitDisclosure === Optionality.Preferred ? Status.INFO : Status.WARN,
      message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
      payload: undefined,
    });
  }

  private createMandatoryFieldNotFoundResult(idIdx: number, vcIdx: number, path: string[]) {
    return this.getResults().push({
      input_descriptor_path: `$.input_descriptors[${idIdx}]`,
      verifiable_credential_path: `$[${vcIdx}]`,
      evaluator: this.getName(),
      status: Status.ERROR,
      message: PexMessages.VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT,
      payload: path,
    });
  }

  private createLimitDisclosureNotSupportedResult(idIdxs: number[], vcIdx: number, reason?: string) {
    return this.getResults().push(
      ...idIdxs.map((idIdx) => ({
        input_descriptor_path: `$.input_descriptors[${idIdx}]`,
        verifiable_credential_path: `$[${vcIdx}]`,
        evaluator: this.getName(),
        status: Status.ERROR,
        message: reason ? `${PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED}. ${reason}` : PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
      })),
    );
  }
}
