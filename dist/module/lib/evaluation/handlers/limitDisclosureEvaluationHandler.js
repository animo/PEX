import { Optionality } from '@sphereon/pex-models';
import { CredentialMapper, } from '@sphereon/ssi-types';
import { Status } from '../../ConstraintUtils';
import PexMessages from '../../types/Messages';
import { applySdJwtLimitDisclosure, JsonPathUtils } from '../../utils';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
import { elligibleInputDescriptorsForWrappedVc } from './markForSubmissionEvaluationHandler';
export class LimitDisclosureEvaluationHandler extends AbstractEvaluationHandler {
    constructor(client) {
        super(client);
    }
    getName() {
        return 'LimitDisclosureEvaluation';
    }
    handle(pd, wrappedVcs) {
        this.evaluateLimitDisclosure(pd.input_descriptors, wrappedVcs);
    }
    isLimitDisclosureSupported(elligibleInputDescriptors, wvc, vcIndex) {
        if (wvc.format === 'vc+sd-jwt')
            return true;
        const limitDisclosureSignatures = this.client.limitDisclosureSignatureSuites;
        const decoded = wvc.decoded;
        const proofs = Array.isArray(decoded.proof) ? decoded.proof : decoded.proof ? [decoded.proof] : undefined;
        const requiredLimitDisclosureInputDescriptorIds = elligibleInputDescriptors
            .map(({ inputDescriptor: { constraints }, inputDescriptorIndex }) => constraints?.limit_disclosure === Optionality.Required ? inputDescriptorIndex : undefined)
            .filter((id) => id !== undefined);
        if (!proofs || proofs.length === 0 || proofs.length > 1 || !proofs[0].type) {
            // todo: Support/inspect array based proofs
            if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
                this.createLimitDisclosureNotSupportedResult(elligibleInputDescriptors.map((i) => i.inputDescriptorIndex), vcIndex, 'Multiple proofs on verifiable credential not supported for limit disclosure');
            }
            return false;
        }
        const proof = proofs[0];
        const signatureSuite = proof.cryptosuite ? `${proof.type}.${proof.cryptosuite}` : proof.type;
        if (!limitDisclosureSignatures?.includes(signatureSuite)) {
            if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
                this.createLimitDisclosureNotSupportedResult(requiredLimitDisclosureInputDescriptorIds, vcIndex, `Signature suite '${signatureSuite}' is not present in limitDisclosureSignatureSuites [${limitDisclosureSignatures.join(',')}]`);
            }
            return false;
        }
        return true;
    }
    evaluateLimitDisclosure(inputDescriptors, wrappedVcs) {
        wrappedVcs.forEach((wvc, vcIndex) => {
            const elligibleInputDescriptors = elligibleInputDescriptorsForWrappedVc(inputDescriptors, vcIndex, this.getResults());
            const includeLimitDisclosure = elligibleInputDescriptors.some(({ inputDescriptor: { constraints } }) => constraints?.limit_disclosure === Optionality.Preferred || constraints?.limit_disclosure === Optionality.Required);
            if (elligibleInputDescriptors.length > 0 &&
                includeLimitDisclosure &&
                this.isLimitDisclosureSupported(elligibleInputDescriptors, wvc, vcIndex)) {
                this.enforceLimitDisclosure(wrappedVcs, elligibleInputDescriptors, vcIndex);
            }
        });
    }
    enforceLimitDisclosure(wrappedVcs, elligibleInputDescriptors, vcIndex) {
        const wvc = wrappedVcs[vcIndex];
        if (CredentialMapper.isWrappedSdJwtVerifiableCredential(wvc)) {
            const presentationFrame = this.createSdJwtPresentationFrame(elligibleInputDescriptors, wvc.credential, vcIndex);
            // We update the SD-JWT to it's presentation format (remove disclosures, update pretty payload, etc..), except
            // we don't create or include the (optional) KB-JWT yet, this is done when we create the presentation
            if (presentationFrame) {
                applySdJwtLimitDisclosure(wvc.credential, presentationFrame);
                wvc.decoded = wvc.credential.decodedPayload;
                // We need to overwrite the original, as that is returned in the selectFrom method
                // But we also want to keep the format of the original credential.
                wvc.original = CredentialMapper.isSdJwtDecodedCredential(wvc.original) ? wvc.credential : wvc.credential.compactSdJwtVc;
                for (const { inputDescriptorIndex, inputDescriptor } of elligibleInputDescriptors) {
                    this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
                }
            }
        }
        else if (CredentialMapper.isW3cCredential(wvc.credential)) {
            const internalCredentialToSend = this.createVcWithRequiredFields(elligibleInputDescriptors, wvc.credential, vcIndex);
            /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
             * remain untouched and the verifiable credential won't be submitted.
             */
            if (internalCredentialToSend) {
                wvc.credential = internalCredentialToSend;
                for (const { inputDescriptorIndex, inputDescriptor } of elligibleInputDescriptors) {
                    this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, inputDescriptor.constraints?.limit_disclosure);
                }
            }
        }
        else {
            throw new Error(`Unsupported format for selective disclosure ${wvc.format}`);
        }
    }
    createSdJwtPresentationFrame(inputDescriptors, vc, vcIndex) {
        // Mapping of key -> true to indicate which values should be disclosed in an SD-JWT
        // Can be nested array / object
        const presentationFrame = {};
        for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
            for (const field of inputDescriptor.constraints?.fields ?? []) {
                if (field.path) {
                    const inputField = JsonPathUtils.extractInputField(vc.decodedPayload, field.path);
                    // We set the value to true at the path in the presentation frame,
                    if (inputField.length > 0) {
                        const selectedField = inputField[0];
                        JsonPathUtils.setValue(presentationFrame, selectedField.path, true);
                    }
                    else {
                        this.createMandatoryFieldNotFoundResult(inputDescriptorIndex, vcIndex, field.path);
                        return undefined;
                    }
                }
            }
        }
        return presentationFrame;
    }
    createVcWithRequiredFields(inputDescriptors, vc, vcIndex) {
        let credentialToSend = {};
        credentialToSend = Object.assign(credentialToSend, vc);
        credentialToSend.credentialSubject = {};
        for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
            for (const field of inputDescriptor.constraints?.fields ?? []) {
                if (field.path) {
                    const inputField = JsonPathUtils.extractInputField(vc, field.path);
                    if (inputField.length > 0) {
                        credentialToSend = this.copyResultPathToDestinationCredential(inputField[0], vc, credentialToSend);
                    }
                    else {
                        this.createMandatoryFieldNotFoundResult(inputDescriptorIndex, vcIndex, field.path);
                        return undefined;
                    }
                }
            }
        }
        return credentialToSend;
    }
    copyResultPathToDestinationCredential(requiredField, internalCredential, internalCredentialToSend) {
        //TODO: ESSIFI-186
        let credentialSubject = { ...internalCredential.credentialSubject };
        requiredField.path.forEach((e) => {
            if (credentialSubject[e]) {
                credentialSubject = { [e]: credentialSubject[e] };
            }
        });
        internalCredentialToSend.credentialSubject = {
            ...internalCredentialToSend.credentialSubject,
            ...credentialSubject,
        };
        return internalCredentialToSend;
    }
    createSuccessResult(idIdx, path, limitDisclosure) {
        return this.getResults().push({
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            verifiable_credential_path: `${path}`,
            evaluator: this.getName(),
            status: limitDisclosure === Optionality.Required ? Status.INFO : Status.WARN,
            message: PexMessages.LIMIT_DISCLOSURE_APPLIED,
            payload: undefined,
        });
    }
    createMandatoryFieldNotFoundResult(idIdx, vcIdx, path) {
        return this.getResults().push({
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            verifiable_credential_path: `$[${vcIdx}]`,
            evaluator: this.getName(),
            status: Status.ERROR,
            message: PexMessages.VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT,
            payload: path,
        });
    }
    createLimitDisclosureNotSupportedResult(idIdxs, vcIdx, reason) {
        return this.getResults().push(...idIdxs.map((idIdx) => ({
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            verifiable_credential_path: `$[${vcIdx}]`,
            evaluator: this.getName(),
            status: Status.ERROR,
            message: reason ? `${PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED}. ${reason}` : PexMessages.LIMIT_DISCLOSURE_NOT_SUPPORTED,
        })));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXREaXNjbG9zdXJlRXZhbHVhdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWIvZXZhbHVhdGlvbi9oYW5kbGVycy9saW1pdERpc2Nsb3N1cmVFdmFsdWF0aW9uSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQXdDLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3pGLE9BQU8sRUFFTCxnQkFBZ0IsR0FPakIsTUFBTSxxQkFBcUIsQ0FBQztBQUU3QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFL0MsT0FBTyxXQUFXLE1BQU0sc0JBQXNCLENBQUM7QUFDL0MsT0FBTyxFQUFFLHlCQUF5QixFQUFFLGFBQWEsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUd2RSxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RSxPQUFPLEVBQUUscUNBQXFDLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUU3RixNQUFNLE9BQU8sZ0NBQWlDLFNBQVEseUJBQXlCO0lBQzdFLFlBQVksTUFBd0I7UUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFFTSxPQUFPO1FBQ1osT0FBTywyQkFBMkIsQ0FBQztJQUNyQyxDQUFDO0lBRU0sTUFBTSxDQUFDLEVBQW1DLEVBQUUsVUFBeUM7UUFDMUYsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEVBQUUsQ0FBQyxpQkFBd0MsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRU8sMEJBQTBCLENBQ2hDLHlCQUFxRCxFQUNyRCxHQUFnQyxFQUNoQyxPQUFlO1FBRWYsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLFdBQVc7WUFBRSxPQUFPLElBQUksQ0FBQztRQUU1QyxNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUM7UUFD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