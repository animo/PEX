"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PEX = void 0;
const ssi_types_1 = require("@sphereon/ssi-types");
const ConstraintUtils_1 = require("./ConstraintUtils");
const evaluation_1 = require("./evaluation");
const signing_1 = require("./signing");
const types_1 = require("./types");
const utils_1 = require("./utils");
const validation_1 = require("./validation");
/**
 * This is the main interfacing class to be used by developers using the PEX library.
 */
class PEX {
    constructor(options) {
        // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it elsewhere. We need to retrhink how to instantiate PEX
        this._evaluationClientWrapper = new evaluation_1.EvaluationClientWrapper();
        this.options = options;
    }
    /***
     * The evaluatePresentation compares what is expected from one or more presentations with a presentationDefinition.
     * presentationDefinition: It can be either v1 or v2 of presentationDefinition
     *
     * @param presentationDefinition the definition of what is expected in the presentation.
     * @param presentations the presentation(s) which have to be evaluated in comparison of the definition.
     * @param opts - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
     *
     * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
     * were not fulfilled by the presentation(s).
     */
    evaluatePresentation(presentationDefinition, presentations, opts) {
        var _a;
        // We map it to an array for now to make processing on the presentations easier, but before checking against the submission
        // we will transform it to the original structure (array vs single) so the references in the submission stay correct
        const presentationsArray = Array.isArray(presentations) ? presentations : [presentations];
        if (presentationsArray.length === 0) {
            throw new Error('At least one presentation must be provided');
        }
        const generatePresentationSubmission = (opts === null || opts === void 0 ? void 0 : opts.generatePresentationSubmission) !== undefined ? opts.generatePresentationSubmission : (opts === null || opts === void 0 ? void 0 : opts.presentationSubmission) === undefined;
        const pd = types_1.SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        const presentationsCopy = JSON.parse(JSON.stringify(presentationsArray));
        const wrappedPresentations = presentationsCopy.map((p) => { var _a; return types_1.SSITypesBuilder.mapExternalVerifiablePresentationToWrappedVP(p, (_a = this.options) === null || _a === void 0 ? void 0 : _a.hasher); });
        let presentationSubmission = opts === null || opts === void 0 ? void 0 : opts.presentationSubmission;
        let presentationSubmissionLocation = (_a = opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) !== null && _a !== void 0 ? _a : (Array.isArray(presentations) || !ssi_types_1.CredentialMapper.isW3cPresentation(wrappedPresentations[0].presentation)
            ? signing_1.PresentationSubmissionLocation.EXTERNAL
            : signing_1.PresentationSubmissionLocation.PRESENTATION);
        // When only one presentation, we also allow it to be present in the VP
        if (!presentationSubmission &&
            presentationsArray.length === 1 &&
            ssi_types_1.CredentialMapper.isW3cPresentation(wrappedPresentations[0].presentation) &&
            !generatePresentationSubmission) {
            const decoded = wrappedPresentations[0].decoded;
            if ('presentation_submission' in decoded) {
                presentationSubmission = decoded.presentation_submission;
            }
            if (!presentationSubmission) {
                throw Error(`Either a presentation submission as part of the VP or provided in options was expected`);
            }
            presentationSubmissionLocation = signing_1.PresentationSubmissionLocation.PRESENTATION;
            if ((opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) && opts.presentationSubmissionLocation !== signing_1.PresentationSubmissionLocation.PRESENTATION) {
                throw new Error(`unexpected presentationSubmissionLocation ${opts.presentationSubmissionLocation} was provided. Expected ${signing_1.PresentationSubmissionLocation.PRESENTATION} when no presentationSubmission passed and first verifiable presentation contains a presentation_submission and generatePresentationSubmission is false`);
            }
        }
        else if (!presentationSubmission && !generatePresentationSubmission) {
            throw new Error('Presentation submission in options was expected.');
        }
        // TODO: we should probably add support for holder dids in the kb-jwt of an SD-JWT. We can extract this from the
        // `wrappedPresentation.original.compactKbJwt`, but as HAIP doesn't use dids, we'll leave it for now.
        const holderDIDs = wrappedPresentations
            .map((p) => {
            return ssi_types_1.CredentialMapper.isW3cPresentation(p.presentation) && p.presentation.holder ? p.presentation.holder : undefined;
        })
            .filter((d) => d !== undefined);
        const updatedOpts = Object.assign(Object.assign({}, opts), { holderDIDs,
            presentationSubmission,
            presentationSubmissionLocation,
            generatePresentationSubmission });
        const allWvcs = wrappedPresentations.reduce((all, wvp) => [...all, ...wvp.vcs], []);
        const result = this._evaluationClientWrapper.evaluatePresentations(pd, Array.isArray(presentations) ? wrappedPresentations : wrappedPresentations[0], updatedOpts);
        if (result.areRequiredCredentialsPresent !== ConstraintUtils_1.Status.ERROR) {
            const selectFromClientWrapper = new evaluation_1.EvaluationClientWrapper();
            const selectResults = selectFromClientWrapper.selectFrom(pd, allWvcs, updatedOpts);
            if (selectResults.areRequiredCredentialsPresent !== ConstraintUtils_1.Status.ERROR) {
                result.errors = [];
            }
        }
        return result;
    }
    /***
     * The evaluate compares what is expected from a verifiableCredentials with the presentationDefinition.
     *
     * @param presentationDefinition the v1 or v2 definition of what is expected in the presentation.
     * @param verifiableCredentials the verifiable credentials which are candidates to fulfill requirements defined in the presentationDefinition param.
     * @param opts - holderDIDs the list of the DIDs that the wallet holders controls. Optional, but needed by some input requirements that do a holderDID check.
     * @           - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
     *
     * @return the evaluation results specify what was expected and was fulfilled and also specifies which requirements described in the input descriptors
     * were not fulfilled by the verifiable credentials.
     */
    evaluateCredentials(presentationDefinition, verifiableCredentials, opts) {
        var _a;
        const wrappedVerifiableCredentials = types_1.SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentials, (_a = this.options) === null || _a === void 0 ? void 0 : _a.hasher);
        // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
        this._evaluationClientWrapper = new evaluation_1.EvaluationClientWrapper();
        const pd = types_1.SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        const result = this._evaluationClientWrapper.evaluate(pd, wrappedVerifiableCredentials, opts);
        if (result.value && result.value.descriptor_map.length) {
            const selectFromClientWrapper = new evaluation_1.EvaluationClientWrapper();
            const selectResults = selectFromClientWrapper.selectFrom(pd, wrappedVerifiableCredentials, opts);
            result.areRequiredCredentialsPresent = selectResults.areRequiredCredentialsPresent;
            result.errors = selectResults.errors;
        }
        else {
            result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
        }
        return result;
    }
    /**
     * The selectFrom method is a helper function that helps filter out the verifiable credentials which can not be selected and returns
     * the selectable credentials.
     *
     * @param presentationDefinition the v1 or v2 definition of what is expected in the presentation.
     * @param verifiableCredentials verifiable credentials are the credentials from wallet provided to the library to find selectable credentials.
     * @param opts - holderDIDs the decentralized identifier(s) of the wallet holderDID. This is used to identify the credentials issued to the holderDID of wallet in certain scenario's.
     *             - limitDisclosureSignatureSuites the credential signature suites that support limit disclosure
     *
     * @return the selectable credentials.
     */
    selectFrom(presentationDefinition, verifiableCredentials, opts) {
        var _a;
        const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
        const pd = types_1.SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
        this._evaluationClientWrapper = new evaluation_1.EvaluationClientWrapper();
        return this._evaluationClientWrapper.selectFrom(pd, types_1.SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentialCopy, (_a = this.options) === null || _a === void 0 ? void 0 : _a.hasher), opts);
    }
    presentationSubmissionFrom(presentationDefinition, selectedCredentials, opts) {
        var _a;
        const pd = types_1.SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        return this._evaluationClientWrapper.submissionFrom(pd, types_1.SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(selectedCredentials, (_a = this.options) === null || _a === void 0 ? void 0 : _a.hasher), opts);
    }
    /**
     * This method helps create an Unsigned Presentation. An Unsigned Presentation after signing becomes a Presentation. And can be sent to
     * the verifier after signing it.
     *
     * @param presentationDefinition the v1 or v2 definition of what is expected in the presentation.
     * @param selectedCredentials the credentials which were declared selectable by getSelectableCredentials and then chosen by the intelligent-user
     * (e.g. human).
     * @param opts - holderDID optional; the decentralized identity of the wallet holderDID. This is used to identify the holderDID of the presentation.
     *
     * @return the presentation.
     */
    presentationFrom(presentationDefinition, selectedCredentials, opts) {
        var _a, _b;
        const presentationSubmission = this.presentationSubmissionFrom(presentationDefinition, selectedCredentials, opts);
        const hasSdJwtCredentials = selectedCredentials.some((c) => ssi_types_1.CredentialMapper.isSdJwtDecodedCredential(c) || ssi_types_1.CredentialMapper.isSdJwtEncoded(c));
        // We could include it in the KB-JWT? Not sure if we want that
        if ((opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) === signing_1.PresentationSubmissionLocation.PRESENTATION && hasSdJwtCredentials) {
            throw new Error('Presentation submission location cannot be set to presentation when creating a presentation with an SD-JWT VC');
        }
        const presentationSubmissionLocation = (_a = opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) !== null && _a !== void 0 ? _a : (hasSdJwtCredentials ? signing_1.PresentationSubmissionLocation.EXTERNAL : signing_1.PresentationSubmissionLocation.PRESENTATION);
        const presentation = PEX.constructPresentation(selectedCredentials, Object.assign(Object.assign({}, opts), { 
            // We only pass in the submission in case it needs to be included in the presentation
            presentationSubmission: presentationSubmissionLocation === signing_1.PresentationSubmissionLocation.PRESENTATION ? presentationSubmission : undefined, hasher: (_b = this.options) === null || _b === void 0 ? void 0 : _b.hasher }));
        return {
            presentation,
            presentationSubmissionLocation,
            presentationSubmission,
        };
    }
    static constructPresentation(selectedCredentials, opts) {
        var _a, _b, _c, _d;
        const credentials = Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials];
        // for SD-JWT we want to return the SD-JWT with only the needed disclosures (so filter disclosures array, and update the compactSdJwt)
        // in addition we want to create the KB-JWT payload as well.
        // FIXME: include the KB-JWT payload?
        if (credentials.some((c) => ssi_types_1.CredentialMapper.isSdJwtDecodedCredential(c) || ssi_types_1.CredentialMapper.isSdJwtEncoded(c))) {
            if (credentials.length > 1) {
                // Until there's some consensus around the following issue, we'll only support a single
                // SD-JWT credential in a presentation
                // https://github.com/decentralized-identity/presentation-exchange/issues/462
                throw new Error('Only a single credential is supported when creating a presentation with an SD-JWT VC');
            }
            if (opts === null || opts === void 0 ? void 0 : opts.presentationSubmission) {
                throw new Error('Presentation submission cannot be included in the presentation when creating a presentation with an SD-JWT VC');
            }
            if (opts === null || opts === void 0 ? void 0 : opts.basePresentationPayload) {
                throw new Error('Base presentation payload cannot be when creating a presentation from an SD-JWT VC');
            }
            // NOTE: we assume the credential already has selective disclosure applied, even if it is encoded. Is
            // that a valid assumption? It seems to be this way for BBS SD as well
            const decoded = (ssi_types_1.CredentialMapper.isSdJwtEncoded(credentials[0]) ? ssi_types_1.CredentialMapper.decodeVerifiableCredential(credentials[0], opts === null || opts === void 0 ? void 0 : opts.hasher) : credentials[0]);
            if (!(opts === null || opts === void 0 ? void 0 : opts.hasher)) {
                throw new Error('Hasher must be provided when creating a presentation with an SD-JWT VC');
            }
            // extract sd_alg or default to sha-256
            const hashAlg = (_a = decoded.signedPayload._sd_alg) !== null && _a !== void 0 ? _a : 'sha-256';
            const sdHash = (0, utils_1.calculateSdHash)(decoded.compactSdJwtVc, hashAlg, opts.hasher);
            const kbJwt = {
                // alg MUST be set by the signer
                header: {
                    typ: 'kb+jwt',
                    // aud MUST be set by the signer or provided by e.g. SIOP/OpenID4VP lib
                },
                payload: {
                    iat: new Date().getTime(),
                    sd_hash: sdHash,
                },
            };
            const sdJwtDecodedPresentation = Object.assign(Object.assign({}, decoded), { kbJwt });
            return sdJwtDecodedPresentation;
        }
        else {
            if (!selectedCredentials) {
                throw Error(`At least a verifiable credential needs to be passed in to create a presentation`);
            }
            const verifiableCredential = (Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials]);
            const wVCs = verifiableCredential.map((vc) => ssi_types_1.CredentialMapper.toWrappedVerifiableCredential(vc));
            const holders = Array.from(new Set(wVCs.flatMap((wvc) => (0, utils_1.getSubjectIdsAsString)(wvc.credential))));
            if (holders.length !== 1 && !(opts === null || opts === void 0 ? void 0 : opts.holderDID)) {
                console.log(`We deduced ${holders.length} subject from ${wVCs.length} Verifiable Credentials, and no holder property was given. This might lead to undesired results`);
            }
            const holder = (_b = opts === null || opts === void 0 ? void 0 : opts.holderDID) !== null && _b !== void 0 ? _b : (holders.length === 1 ? holders[0] : undefined);
            const type = ((_c = opts === null || opts === void 0 ? void 0 : opts.basePresentationPayload) === null || _c === void 0 ? void 0 : _c.type)
                ? Array.isArray(opts.basePresentationPayload.type)
                    ? opts.basePresentationPayload.type
                    : [opts.basePresentationPayload.type]
                : [];
            if (!type.includes('VerifiablePresentation')) {
                type.push('VerifiablePresentation');
            }
            const context = ((_d = opts === null || opts === void 0 ? void 0 : opts.basePresentationPayload) === null || _d === void 0 ? void 0 : _d['@context'])
                ? Array.isArray(opts.basePresentationPayload['@context'])
                    ? opts.basePresentationPayload['@context']
                    : [opts.basePresentationPayload['@context']]
                : [];
            if (!context.includes('https://www.w3.org/2018/credentials/v1')) {
                context.push('https://www.w3.org/2018/credentials/v1');
            }
            if (opts === null || opts === void 0 ? void 0 : opts.presentationSubmission) {
                if (!type.includes('PresentationSubmission')) {
                    type.push('PresentationSubmission');
                }
                if (!context.includes('https://identity.foundation/presentation-exchange/submission/v1')) {
                    context.push('https://identity.foundation/presentation-exchange/submission/v1');
                }
            }
            return Object.assign(Object.assign(Object.assign(Object.assign({}, opts === null || opts === void 0 ? void 0 : opts.basePresentationPayload), { '@context': context, type,
                holder }), (!!(opts === null || opts === void 0 ? void 0 : opts.presentationSubmission) && { presentation_submission: opts.presentationSubmission })), { verifiableCredential });
        }
    }
    /**
     * This method validates whether an object is usable as a presentation definition or not.
     *
     * @param presentationDefinition presentationDefinition of V1 or v2 to be validated.
     *
     * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation definition
     */
    static validateDefinition(presentationDefinition) {
        const result = (0, utils_1.definitionVersionDiscovery)(presentationDefinition);
        if (result.error) {
            throw new Error(result.error);
        }
        const validators = [];
        result.version === types_1.PEVersion.v1
            ? validators.push({
                bundler: new validation_1.PresentationDefinitionV1VB('root'),
                target: types_1.SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition),
            })
            : validators.push({
                bundler: new validation_1.PresentationDefinitionV2VB('root'),
                target: types_1.SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition),
            });
        return new validation_1.ValidationEngine().validate(validators);
    }
    /**
     * This method validates whether an object is usable as a presentation submission or not.
     *
     * @param presentationSubmission the object to be validated.
     *
     * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation submission
     */
    static validateSubmission(presentationSubmission) {
        return new validation_1.ValidationEngine().validate([
            {
                bundler: new validation_1.PresentationSubmissionVB('root'),
                target: presentationSubmission,
            },
        ]);
    }
    /**
     * This method can be used to combine a definition, selected Verifiable Credentials, together with
     * signing opts and a callback to sign a presentation, making it a Verifiable Presentation before sending.
     *
     * Please note that PEX has no signature support on purpose. We didn't want this library to depend on all kinds of signature suites.
     * The callback function next to the Signing Params also gets a Presentation which is evaluated against the definition.
     * It is up to you to decide whether you simply update the supplied partial proof and add it to the presentation in the callback,
     * or whether you will use the selected Credentials, Presentation definition, evaluation results and/or presentation submission together with the signature opts
     *
     * @param presentationDefinition the Presentation Definition V1 or V2
     * @param selectedCredentials the PEX and/or User selected/filtered credentials that will become part of the Verifiable Presentation
     * @param signingCallBack the function which will be provided as a parameter. And this will be the method that will be able to perform actual
     *        signing. One example of signing is available in the project named. pe-selective-disclosure.
     * @param opts Signing Params these are the signing params required to sign.
     *
     * @return the signed and thus Verifiable Presentation.
     */
    verifiablePresentationFrom(presentationDefinition, selectedCredentials, signingCallBack, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const { holderDID, signatureOptions, proofOptions } = opts;
            function limitedDisclosureSuites() {
                let limitDisclosureSignatureSuites = [];
                if (proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.typeSupportsSelectiveDisclosure) {
                    if (!(proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.type)) {
                        throw Error('Please provide a proof type if you enable selective disclosure');
                    }
                    limitDisclosureSignatureSuites = [proofOptions.type];
                }
                return limitDisclosureSignatureSuites;
            }
            const holderDIDs = holderDID ? [holderDID] : [];
            const limitDisclosureSignatureSuites = limitedDisclosureSuites();
            const evaluationResult = this.evaluateCredentials(presentationDefinition, selectedCredentials, {
                holderDIDs,
                limitDisclosureSignatureSuites,
            });
            const presentationResult = this.presentationFrom(presentationDefinition, evaluationResult.verifiableCredential, opts);
            const evaluationResults = this.evaluatePresentation(presentationDefinition, presentationResult.presentation, Object.assign({ limitDisclosureSignatureSuites }, (presentationResult.presentationSubmissionLocation === signing_1.PresentationSubmissionLocation.EXTERNAL && {
                presentationSubmission: presentationResult.presentationSubmission,
            })));
            if (!evaluationResults.value && selectedCredentials.length === 0) {
                evaluationResults.value = presentationResult.presentationSubmission;
            }
            if (!evaluationResults.value) {
                throw new Error('Could not get evaluation results from presentationResult');
            }
            const proof = {
                type: proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.type,
                verificationMethod: signatureOptions === null || signatureOptions === void 0 ? void 0 : signatureOptions.verificationMethod,
                created: (proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.created) ? proofOptions.created : new Date().toISOString(),
                proofPurpose: proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.proofPurpose,
                proofValue: signatureOptions === null || signatureOptions === void 0 ? void 0 : signatureOptions.proofValue,
                jws: signatureOptions === null || signatureOptions === void 0 ? void 0 : signatureOptions.jws,
                challenge: proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.challenge,
                nonce: proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.nonce,
                domain: proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.domain,
            };
            let presentation = presentationResult.presentation;
            // Select type without kbJwt as isSdJwtDecodedCredential and won't accept the partial sdvc type
            if (ssi_types_1.CredentialMapper.isSdJwtDecodedCredential(presentationResult.presentation)) {
                const sdJwtPresentation = presentation;
                if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.hasher)) {
                    throw new Error('Hasher must be provided when creating a presentation with an SD-JWT VC');
                }
                // extract sd_alg or default to sha-256
                const hashAlg = (_b = presentationResult.presentation.signedPayload._sd_alg) !== null && _b !== void 0 ? _b : 'sha-256';
                const sdHash = (0, utils_1.calculateSdHash)(presentationResult.presentation.compactSdJwtVc, hashAlg, this.options.hasher);
                const kbJwt = {
                    // alg MUST be set by the signer
                    header: {
                        typ: 'kb+jwt',
                    },
                    // aud MUST be set by the signer or provided by e.g. SIOP/OpenID4VP lib
                    payload: {
                        iat: new Date().getTime(),
                        nonce: proofOptions === null || proofOptions === void 0 ? void 0 : proofOptions.nonce,
                        sd_hash: sdHash,
                    },
                };
                presentation = Object.assign(Object.assign({}, sdJwtPresentation), { kbJwt });
            }
            const callBackParams = {
                options: Object.assign(Object.assign({}, opts), { presentationSubmissionLocation: presentationResult.presentationSubmissionLocation }),
                presentation,
                presentationDefinition,
                selectedCredentials,
                proof,
                presentationSubmission: evaluationResults.value,
                evaluationResults,
            };
            const verifiablePresentation = yield signingCallBack(callBackParams);
            return {
                verifiablePresentation,
                presentationSubmissionLocation: presentationResult.presentationSubmissionLocation,
                presentationSubmission: evaluationResults.value,
            };
        });
    }
    static definitionVersionDiscovery(presentationDefinition) {
        return (0, utils_1.definitionVersionDiscovery)(presentationDefinition);
    }
}
exports.PEX = PEX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUEVYLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL1BFWC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFDQSxtREFlNkI7QUFFN0IsdURBQTJDO0FBQzNDLDZDQUF5RjtBQUV6Rix1Q0FTbUI7QUFDbkIsbUNBQTJJO0FBQzNJLG1DQUE2RjtBQUM3Riw2Q0FBNkk7QUFjN0k7O0dBRUc7QUFDSCxNQUFhLEdBQUc7SUFJZCxZQUFZLE9BQW9CO1FBQzlCLHdLQUF3SztRQUN4SyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxvQ0FBdUIsRUFBRSxDQUFDO1FBRTlELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7Ozs7Ozs7OztPQVVHO0lBQ0ksb0JBQW9CLENBQ3pCLHNCQUErQyxFQUMvQyxhQUFnSCxFQUNoSCxJQVlDOztRQUVELDJIQUEySDtRQUMzSCxvSEFBb0g7UUFDcEgsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDcEMsTUFBTSxJQUFJLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7UUFFRCxNQUFNLDhCQUE4QixHQUNsQyxDQUFBLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSw4QkFBOEIsTUFBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsc0JBQXNCLE1BQUssU0FBUyxDQUFDO1FBQ3hJLE1BQU0sRUFBRSxHQUFvQyx1QkFBZSxDQUFDLGdDQUFnQyxDQUFDLHNCQUFzQixDQUFDLENB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