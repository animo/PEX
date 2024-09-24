"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitDisclosureEvaluationHandler = void 0;
const pex_models_1 = require("@sphereon/pex-models");
const ssi_types_1 = require("@sphereon/ssi-types");
const ConstraintUtils_1 = require("../../ConstraintUtils");
const Messages_1 = __importDefault(require("../../types/Messages"));
const utils_1 = require("../../utils");
const abstractEvaluationHandler_1 = require("./abstractEvaluationHandler");
const markForSubmissionEvaluationHandler_1 = require("./markForSubmissionEvaluationHandler");
class LimitDisclosureEvaluationHandler extends abstractEvaluationHandler_1.AbstractEvaluationHandler {
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
            .map(({ inputDescriptor: { constraints }, inputDescriptorIndex }) => (constraints === null || constraints === void 0 ? void 0 : constraints.limit_disclosure) === pex_models_1.Optionality.Required ? inputDescriptorIndex : undefined)
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
        if (!(limitDisclosureSignatures === null || limitDisclosureSignatures === void 0 ? void 0 : limitDisclosureSignatures.includes(signatureSuite))) {
            if (requiredLimitDisclosureInputDescriptorIds.length > 0) {
                this.createLimitDisclosureNotSupportedResult(requiredLimitDisclosureInputDescriptorIds, vcIndex, `Signature suite '${signatureSuite}' is not present in limitDisclosureSignatureSuites [${limitDisclosureSignatures.join(',')}]`);
            }
            return false;
        }
        return true;
    }
    evaluateLimitDisclosure(inputDescriptors, wrappedVcs) {
        wrappedVcs.forEach((wvc, vcIndex) => {
            const elligibleInputDescriptors = (0, markForSubmissionEvaluationHandler_1.elligibleInputDescriptorsForWrappedVc)(inputDescriptors, vcIndex, this.getResults());
            const includeLimitDisclosure = elligibleInputDescriptors.some(({ inputDescriptor: { constraints } }) => (constraints === null || constraints === void 0 ? void 0 : constraints.limit_disclosure) === pex_models_1.Optionality.Preferred || (constraints === null || constraints === void 0 ? void 0 : constraints.limit_disclosure) === pex_models_1.Optionality.Required);
            if (elligibleInputDescriptors.length > 0 &&
                includeLimitDisclosure &&
                this.isLimitDisclosureSupported(elligibleInputDescriptors, wvc, vcIndex)) {
                this.enforceLimitDisclosure(wrappedVcs, elligibleInputDescriptors, vcIndex);
            }
        });
    }
    enforceLimitDisclosure(wrappedVcs, elligibleInputDescriptors, vcIndex) {
        var _a, _b;
        const wvc = wrappedVcs[vcIndex];
        if (ssi_types_1.CredentialMapper.isWrappedSdJwtVerifiableCredential(wvc)) {
            const presentationFrame = this.createSdJwtPresentationFrame(elligibleInputDescriptors, wvc.credential, vcIndex);
            // We update the SD-JWT to it's presentation format (remove disclosures, update pretty payload, etc..), except
            // we don't create or include the (optional) KB-JWT yet, this is done when we create the presentation
            if (presentationFrame) {
                (0, utils_1.applySdJwtLimitDisclosure)(wvc.credential, presentationFrame);
                wvc.decoded = wvc.credential.decodedPayload;
                // We need to overwrite the original, as that is returned in the selectFrom method
                // But we also want to keep the format of the original credential.
                wvc.original = ssi_types_1.CredentialMapper.isSdJwtDecodedCredential(wvc.original) ? wvc.credential : wvc.credential.compactSdJwtVc;
                for (const { inputDescriptorIndex, inputDescriptor } of elligibleInputDescriptors) {
                    this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, (_a = inputDescriptor.constraints) === null || _a === void 0 ? void 0 : _a.limit_disclosure);
                }
            }
        }
        else if (ssi_types_1.CredentialMapper.isW3cCredential(wvc.credential)) {
            const internalCredentialToSend = this.createVcWithRequiredFields(elligibleInputDescriptors, wvc.credential, vcIndex);
            /* When verifiableCredentialToSend is null/undefined an error is raised, the credential will
             * remain untouched and the verifiable credential won't be submitted.
             */
            if (internalCredentialToSend) {
                wvc.credential = internalCredentialToSend;
                for (const { inputDescriptorIndex, inputDescriptor } of elligibleInputDescriptors) {
                    this.createSuccessResult(inputDescriptorIndex, `$[${vcIndex}]`, (_b = inputDescriptor.constraints) === null || _b === void 0 ? void 0 : _b.limit_disclosure);
                }
            }
        }
        else {
            throw new Error(`Unsupported format for selective disclosure ${wvc.format}`);
        }
    }
    createSdJwtPresentationFrame(inputDescriptors, vc, vcIndex) {
        var _a, _b;
        // Mapping of key -> true to indicate which values should be disclosed in an SD-JWT
        // Can be nested array / object
        const presentationFrame = {};
        for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
            for (const field of (_b = (_a = inputDescriptor.constraints) === null || _a === void 0 ? void 0 : _a.fields) !== null && _b !== void 0 ? _b : []) {
                if (field.path) {
                    const inputField = utils_1.JsonPathUtils.extractInputField(vc.decodedPayload, field.path);
                    // We set the value to true at the path in the presentation frame,
                    if (inputField.length > 0) {
                        const selectedField = inputField[0];
                        utils_1.JsonPathUtils.setValue(presentationFrame, selectedField.path, true);
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
        var _a, _b;
        let credentialToSend = {};
        credentialToSend = Object.assign(credentialToSend, vc);
        credentialToSend.credentialSubject = {};
        for (const { inputDescriptor, inputDescriptorIndex } of inputDescriptors) {
            for (const field of (_b = (_a = inputDescriptor.constraints) === null || _a === void 0 ? void 0 : _a.fields) !== null && _b !== void 0 ? _b : []) {
                if (field.path) {
                    const inputField = utils_1.JsonPathUtils.extractInputField(vc, field.path);
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
        let credentialSubject = Object.assign({}, internalCredential.credentialSubject);
        requiredField.path.forEach((e) => {
            if (credentialSubject[e]) {
                credentialSubject = { [e]: credentialSubject[e] };
            }
        });
        internalCredentialToSend.credentialSubject = Object.assign(Object.assign({}, internalCredentialToSend.credentialSubject), credentialSubject);
        return internalCredentialToSend;
    }
    createSuccessResult(idIdx, path, limitDisclosure) {
        return this.getResults().push({
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            verifiable_credential_path: `${path}`,
            evaluator: this.getName(),
            status: limitDisclosure === pex_models_1.Optionality.Required ? ConstraintUtils_1.Status.INFO : ConstraintUtils_1.Status.WARN,
            message: Messages_1.default.LIMIT_DISCLOSURE_APPLIED,
            payload: undefined,
        });
    }
    createMandatoryFieldNotFoundResult(idIdx, vcIdx, path) {
        return this.getResults().push({
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            verifiable_credential_path: `$[${vcIdx}]`,
            evaluator: this.getName(),
            status: ConstraintUtils_1.Status.ERROR,
            message: Messages_1.default.VERIFIABLE_CREDENTIAL_MANDATORY_FIELD_NOT_PRESENT,
            payload: path,
        });
    }
    createLimitDisclosureNotSupportedResult(idIdxs, vcIdx, reason) {
        return this.getResults().push(...idIdxs.map((idIdx) => ({
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            verifiable_credential_path: `$[${vcIdx}]`,
            evaluator: this.getName(),
            status: ConstraintUtils_1.Status.ERROR,
            message: reason ? `${Messages_1.default.LIMIT_DISCLOSURE_NOT_SUPPORTED}. ${reason}` : Messages_1.default.LIMIT_DISCLOSURE_NOT_SUPPORTED,
        })));
    }
}
exports.LimitDisclosureEvaluationHandler = LimitDisclosureEvaluationHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGltaXREaXNjbG9zdXJlRXZhbHVhdGlvbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9saWIvZXZhbHVhdGlvbi9oYW5kbGVycy9saW1pdERpc2Nsb3N1cmVFdmFsdWF0aW9uSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxxREFBeUY7QUFDekYsbURBUzZCO0FBRTdCLDJEQUErQztBQUUvQyxvRUFBK0M7QUFDL0MsdUNBQXVFO0FBR3ZFLDJFQUF3RTtBQUN4RSw2RkFBNkY7QUFFN0YsTUFBYSxnQ0FBaUMsU0FBUSxxREFBeUI7SUFDN0UsWUFBWSxNQUF3QjtRQUNsQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLDJCQUEyQixDQUFDO0lBQ3JDLENBQUM7SUFFTSxNQUFNLENBQUMsRUFBbUMsRUFBRSxVQUF5QztRQUMxRixJQUFJLENBQUMsdUJBQXVCLENBQUMsRUFBRSxDQUFDLGlCQUF3QyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFTywwQkFBMEIsQ0FDaEMseUJBQXFELEVBQ3JELEdBQWdDLEVBQ2hDLE9BQWU7UUFFZixJQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssV0FBVztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRTVDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQztRQUM3RSxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsT0FBZ0MsQ0FBQztRQUNyRCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNB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