import { CredentialMapper, } from '@sphereon/ssi-types';
import { Status } from './ConstraintUtils';
import { EvaluationClientWrapper } from './evaluation';
import { PresentationSubmissionLocation, } from './signing';
import { PEVersion, SSITypesBuilder } from './types';
import { calculateSdHash, definitionVersionDiscovery, getSubjectIdsAsString } from './utils';
import { PresentationDefinitionV1VB, PresentationDefinitionV2VB, PresentationSubmissionVB, ValidationEngine } from './validation';
/**
 * This is the main interfacing class to be used by developers using the PEX library.
 */
export class PEX {
    _evaluationClientWrapper;
    options;
    constructor(options) {
        // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it elsewhere. We need to retrhink how to instantiate PEX
        this._evaluationClientWrapper = new EvaluationClientWrapper();
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
        // We map it to an array for now to make processing on the presentations easier, but before checking against the submission
        // we will transform it to the original structure (array vs single) so the references in the submission stay correct
        const presentationsArray = Array.isArray(presentations) ? presentations : [presentations];
        if (presentationsArray.length === 0) {
            throw new Error('At least one presentation must be provided');
        }
        const generatePresentationSubmission = opts?.generatePresentationSubmission !== undefined ? opts.generatePresentationSubmission : opts?.presentationSubmission === undefined;
        const pd = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        const presentationsCopy = JSON.parse(JSON.stringify(presentationsArray));
        const wrappedPresentations = presentationsCopy.map((p) => SSITypesBuilder.mapExternalVerifiablePresentationToWrappedVP(p, this.options?.hasher));
        let presentationSubmission = opts?.presentationSubmission;
        let presentationSubmissionLocation = opts?.presentationSubmissionLocation ??
            (Array.isArray(presentations) || !CredentialMapper.isW3cPresentation(wrappedPresentations[0].presentation)
                ? PresentationSubmissionLocation.EXTERNAL
                : PresentationSubmissionLocation.PRESENTATION);
        // When only one presentation, we also allow it to be present in the VP
        if (!presentationSubmission &&
            presentationsArray.length === 1 &&
            CredentialMapper.isW3cPresentation(wrappedPresentations[0].presentation) &&
            !generatePresentationSubmission) {
            const decoded = wrappedPresentations[0].decoded;
            if ('presentation_submission' in decoded) {
                presentationSubmission = decoded.presentation_submission;
            }
            if (!presentationSubmission) {
                throw Error(`Either a presentation submission as part of the VP or provided in options was expected`);
            }
            presentationSubmissionLocation = PresentationSubmissionLocation.PRESENTATION;
            if (opts?.presentationSubmissionLocation && opts.presentationSubmissionLocation !== PresentationSubmissionLocation.PRESENTATION) {
                throw new Error(`unexpected presentationSubmissionLocation ${opts.presentationSubmissionLocation} was provided. Expected ${PresentationSubmissionLocation.PRESENTATION} when no presentationSubmission passed and first verifiable presentation contains a presentation_submission and generatePresentationSubmission is false`);
            }
        }
        else if (!presentationSubmission && !generatePresentationSubmission) {
            throw new Error('Presentation submission in options was expected.');
        }
        // TODO: we should probably add support for holder dids in the kb-jwt of an SD-JWT. We can extract this from the
        // `wrappedPresentation.original.compactKbJwt`, but as HAIP doesn't use dids, we'll leave it for now.
        const holderDIDs = wrappedPresentations
            .map((p) => {
            return CredentialMapper.isW3cPresentation(p.presentation) && p.presentation.holder ? p.presentation.holder : undefined;
        })
            .filter((d) => d !== undefined);
        const updatedOpts = {
            ...opts,
            holderDIDs,
            presentationSubmission,
            presentationSubmissionLocation,
            generatePresentationSubmission,
        };
        const allWvcs = wrappedPresentations.reduce((all, wvp) => [...all, ...wvp.vcs], []);
        const result = this._evaluationClientWrapper.evaluatePresentations(pd, Array.isArray(presentations) ? wrappedPresentations : wrappedPresentations[0], updatedOpts);
        if (result.areRequiredCredentialsPresent !== Status.ERROR) {
            const selectFromClientWrapper = new EvaluationClientWrapper();
            const selectResults = selectFromClientWrapper.selectFrom(pd, allWvcs, updatedOpts);
            if (selectResults.areRequiredCredentialsPresent !== Status.ERROR) {
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
        const wrappedVerifiableCredentials = SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentials, this.options?.hasher);
        // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
        this._evaluationClientWrapper = new EvaluationClientWrapper();
        const pd = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        const result = this._evaluationClientWrapper.evaluate(pd, wrappedVerifiableCredentials, opts);
        if (result.value && result.value.descriptor_map.length) {
            const selectFromClientWrapper = new EvaluationClientWrapper();
            const selectResults = selectFromClientWrapper.selectFrom(pd, wrappedVerifiableCredentials, opts);
            result.areRequiredCredentialsPresent = selectResults.areRequiredCredentialsPresent;
            result.errors = selectResults.errors;
        }
        else {
            result.areRequiredCredentialsPresent = Status.ERROR;
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
        const verifiableCredentialCopy = JSON.parse(JSON.stringify(verifiableCredentials));
        const pd = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        // TODO:  So we have state in the form of this property which is set in the constructor, but we are overwriting it here. We need to retrhink how to instantiate PEX
        this._evaluationClientWrapper = new EvaluationClientWrapper();
        return this._evaluationClientWrapper.selectFrom(pd, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(verifiableCredentialCopy, this.options?.hasher), opts);
    }
    presentationSubmissionFrom(presentationDefinition, selectedCredentials, opts) {
        const pd = SSITypesBuilder.toInternalPresentationDefinition(presentationDefinition);
        return this._evaluationClientWrapper.submissionFrom(pd, SSITypesBuilder.mapExternalVerifiableCredentialsToWrappedVcs(selectedCredentials, this.options?.hasher), opts);
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
        const presentationSubmission = this.presentationSubmissionFrom(presentationDefinition, selectedCredentials, opts);
        const hasSdJwtCredentials = selectedCredentials.some((c) => CredentialMapper.isSdJwtDecodedCredential(c) || CredentialMapper.isSdJwtEncoded(c));
        // We could include it in the KB-JWT? Not sure if we want that
        if (opts?.presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION && hasSdJwtCredentials) {
            throw new Error('Presentation submission location cannot be set to presentation when creating a presentation with an SD-JWT VC');
        }
        const presentationSubmissionLocation = opts?.presentationSubmissionLocation ??
            (hasSdJwtCredentials ? PresentationSubmissionLocation.EXTERNAL : PresentationSubmissionLocation.PRESENTATION);
        const presentation = PEX.constructPresentation(selectedCredentials, {
            ...opts,
            // We only pass in the submission in case it needs to be included in the presentation
            presentationSubmission: presentationSubmissionLocation === PresentationSubmissionLocation.PRESENTATION ? presentationSubmission : undefined,
            hasher: this.options?.hasher,
        });
        return {
            presentation,
            presentationSubmissionLocation,
            presentationSubmission,
        };
    }
    static constructPresentation(selectedCredentials, opts) {
        const credentials = Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials];
        // for SD-JWT we want to return the SD-JWT with only the needed disclosures (so filter disclosures array, and update the compactSdJwt)
        // in addition we want to create the KB-JWT payload as well.
        // FIXME: include the KB-JWT payload?
        if (credentials.some((c) => CredentialMapper.isSdJwtDecodedCredential(c) || CredentialMapper.isSdJwtEncoded(c))) {
            if (credentials.length > 1) {
                // Until there's some consensus around the following issue, we'll only support a single
                // SD-JWT credential in a presentation
                // https://github.com/decentralized-identity/presentation-exchange/issues/462
                throw new Error('Only a single credential is supported when creating a presentation with an SD-JWT VC');
            }
            if (opts?.presentationSubmission) {
                throw new Error('Presentation submission cannot be included in the presentation when creating a presentation with an SD-JWT VC');
            }
            if (opts?.basePresentationPayload) {
                throw new Error('Base presentation payload cannot be when creating a presentation from an SD-JWT VC');
            }
            // NOTE: we assume the credential already has selective disclosure applied, even if it is encoded. Is
            // that a valid assumption? It seems to be this way for BBS SD as well
            const decoded = (CredentialMapper.isSdJwtEncoded(credentials[0]) ? CredentialMapper.decodeVerifiableCredential(credentials[0], opts?.hasher) : credentials[0]);
            if (!opts?.hasher) {
                throw new Error('Hasher must be provided when creating a presentation with an SD-JWT VC');
            }
            // extract sd_alg or default to sha-256
            const hashAlg = decoded.signedPayload._sd_alg ?? 'sha-256';
            const sdHash = calculateSdHash(decoded.compactSdJwtVc, hashAlg, opts.hasher);
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
            const sdJwtDecodedPresentation = {
                ...decoded,
                kbJwt,
            };
            return sdJwtDecodedPresentation;
        }
        else {
            if (!selectedCredentials) {
                throw Error(`At least a verifiable credential needs to be passed in to create a presentation`);
            }
            const verifiableCredential = (Array.isArray(selectedCredentials) ? selectedCredentials : [selectedCredentials]);
            const wVCs = verifiableCredential.map((vc) => CredentialMapper.toWrappedVerifiableCredential(vc));
            const holders = Array.from(new Set(wVCs.flatMap((wvc) => getSubjectIdsAsString(wvc.credential))));
            if (holders.length !== 1 && !opts?.holderDID) {
                console.log(`We deduced ${holders.length} subject from ${wVCs.length} Verifiable Credentials, and no holder property was given. This might lead to undesired results`);
            }
            const holder = opts?.holderDID ?? (holders.length === 1 ? holders[0] : undefined);
            const type = opts?.basePresentationPayload?.type
                ? Array.isArray(opts.basePresentationPayload.type)
                    ? opts.basePresentationPayload.type
                    : [opts.basePresentationPayload.type]
                : [];
            if (!type.includes('VerifiablePresentation')) {
                type.push('VerifiablePresentation');
            }
            const context = opts?.basePresentationPayload?.['@context']
                ? Array.isArray(opts.basePresentationPayload['@context'])
                    ? opts.basePresentationPayload['@context']
                    : [opts.basePresentationPayload['@context']]
                : [];
            if (!context.includes('https://www.w3.org/2018/credentials/v1')) {
                context.push('https://www.w3.org/2018/credentials/v1');
            }
            if (opts?.presentationSubmission) {
                if (!type.includes('PresentationSubmission')) {
                    type.push('PresentationSubmission');
                }
                if (!context.includes('https://identity.foundation/presentation-exchange/submission/v1')) {
                    context.push('https://identity.foundation/presentation-exchange/submission/v1');
                }
            }
            return {
                ...opts?.basePresentationPayload,
                '@context': context,
                type,
                holder,
                ...(!!opts?.presentationSubmission && { presentation_submission: opts.presentationSubmission }),
                verifiableCredential,
            };
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
        const result = definitionVersionDiscovery(presentationDefinition);
        if (result.error) {
            throw new Error(result.error);
        }
        const validators = [];
        result.version === PEVersion.v1
            ? validators.push({
                bundler: new PresentationDefinitionV1VB('root'),
                target: SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinition),
            })
            : validators.push({
                bundler: new PresentationDefinitionV2VB('root'),
                target: SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinition),
            });
        return new ValidationEngine().validate(validators);
    }
    /**
     * This method validates whether an object is usable as a presentation submission or not.
     *
     * @param presentationSubmission the object to be validated.
     *
     * @return the validation results to reveal what is acceptable/unacceptable about the passed object to be considered a valid presentation submission
     */
    static validateSubmission(presentationSubmission) {
        return new ValidationEngine().validate([
            {
                bundler: new PresentationSubmissionVB('root'),
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
    async verifiablePresentationFrom(presentationDefinition, selectedCredentials, signingCallBack, opts) {
        const { holderDID, signatureOptions, proofOptions } = opts;
        function limitedDisclosureSuites() {
            let limitDisclosureSignatureSuites = [];
            if (proofOptions?.typeSupportsSelectiveDisclosure) {
                if (!proofOptions?.type) {
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
        const evaluationResults = this.evaluatePresentation(presentationDefinition, presentationResult.presentation, {
            limitDisclosureSignatureSuites,
            ...(presentationResult.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL && {
                presentationSubmission: presentationResult.presentationSubmission,
            }),
        });
        if (!evaluationResults.value && selectedCredentials.length === 0) {
            evaluationResults.value = presentationResult.presentationSubmission;
        }
        if (!evaluationResults.value) {
            throw new Error('Could not get evaluation results from presentationResult');
        }
        const proof = {
            type: proofOptions?.type,
            verificationMethod: signatureOptions?.verificationMethod,
            created: proofOptions?.created ? proofOptions.created : new Date().toISOString(),
            proofPurpose: proofOptions?.proofPurpose,
            proofValue: signatureOptions?.proofValue,
            jws: signatureOptions?.jws,
            challenge: proofOptions?.challenge,
            nonce: proofOptions?.nonce,
            domain: proofOptions?.domain,
        };
        let presentation = presentationResult.presentation;
        // Select type without kbJwt as isSdJwtDecodedCredential and won't accept the partial sdvc type
        if (CredentialMapper.isSdJwtDecodedCredential(presentationResult.presentation)) {
            const sdJwtPresentation = presentation;
            if (!this.options?.hasher) {
                throw new Error('Hasher must be provided when creating a presentation with an SD-JWT VC');
            }
            // extract sd_alg or default to sha-256
            const hashAlg = presentationResult.presentation.signedPayload._sd_alg ?? 'sha-256';
            const sdHash = calculateSdHash(presentationResult.presentation.compactSdJwtVc, hashAlg, this.options.hasher);
            const kbJwt = {
                // alg MUST be set by the signer
                header: {
                    typ: 'kb+jwt',
                },
                // aud MUST be set by the signer or provided by e.g. SIOP/OpenID4VP lib
                payload: {
                    iat: new Date().getTime(),
                    nonce: proofOptions?.nonce,
                    sd_hash: sdHash,
                },
            };
            presentation = {
                ...sdJwtPresentation,
                kbJwt,
            };
        }
        const callBackParams = {
            options: {
                ...opts,
                presentationSubmissionLocation: presentationResult.presentationSubmissionLocation,
            },
            presentation,
            presentationDefinition,
            selectedCredentials,
            proof,
            presentationSubmission: evaluationResults.value,
            evaluationResults,
        };
        const verifiablePresentation = await signingCallBack(callBackParams);
        return {
            verifiablePresentation,
            presentationSubmissionLocation: presentationResult.presentationSubmissionLocation,
            presentationSubmission: evaluationResults.value,
        };
    }
    static definitionVersionDiscovery(presentationDefinition) {
        return definitionVersionDiscovery(presentationDefinition);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUEVYLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbGliL1BFWC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBRUwsZ0JBQWdCLEdBYWpCLE1BQU0scUJBQXFCLENBQUM7QUFFN0IsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSx1QkFBdUIsRUFBb0MsTUFBTSxjQUFjLENBQUM7QUFFekYsT0FBTyxFQU1MLDhCQUE4QixHQUcvQixNQUFNLFdBQVcsQ0FBQztBQUNuQixPQUFPLEVBQXdGLFNBQVMsRUFBRSxlQUFlLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDM0ksT0FBTyxFQUFFLGVBQWUsRUFBRSwwQkFBMEIsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUM3RixPQUFPLEVBQUUsMEJBQTBCLEVBQUUsMEJBQTBCLEVBQUUsd0JBQXdCLEVBQWEsZ0JBQWdCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFjN0k7O0dBRUc7QUFDSCxNQUFNLE9BQU8sR0FBRztJQUNKLHdCQUF3QixDQUEwQjtJQUNsRCxPQUFPLENBQWM7SUFFL0IsWUFBWSxPQUFvQjtRQUM5Qix3S0FBd0s7UUFDeEssSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQztRQUU5RCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNJLG9CQUFvQixDQUN6QixzQkFBK0MsRUFDL0MsYUFBZ0gsRUFDaEgsSUFZQztRQUVELDJIQUEySDtRQUMzSCxvSEFBb0g7UUFDcEgsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDMUYsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUss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