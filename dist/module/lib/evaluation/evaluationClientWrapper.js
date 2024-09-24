import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { Rules } from '@sphereon/pex-models';
import { CredentialMapper, } from '@sphereon/ssi-types';
import { Status } from '../ConstraintUtils';
import { PresentationSubmissionLocation } from '../signing';
import { InternalPresentationDefinitionV1, InternalPresentationDefinitionV2, } from '../types';
import { JsonPathUtils, ObjectUtils } from '../utils';
import { getVpFormatForVcFormat } from '../utils/formatMap';
import { SubmissionRequirementMatchType, } from './core';
import { EvaluationClient } from './evaluationClient';
export class EvaluationClientWrapper {
    _client;
    constructor() {
        this._client = new EvaluationClient();
    }
    getEvaluationClient() {
        return this._client;
    }
    selectFrom(presentationDefinition, wrappedVerifiableCredentials, opts) {
        let selectResults;
        this._client.evaluate(presentationDefinition, wrappedVerifiableCredentials, opts);
        const warnings = [...this.formatNotInfo(Status.WARN)];
        const errors = [...this.formatNotInfo(Status.ERROR)];
        if (presentationDefinition.submission_requirements) {
            const info = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR);
            const marked = Array.from(new Set(info));
            let matchSubmissionRequirements;
            try {
                matchSubmissionRequirements = this.matchSubmissionRequirements(presentationDefinition, presentationDefinition.submission_requirements, marked);
            }
            catch (e) {
                const matchingError = { status: Status.ERROR, message: JSON.stringify(e), tag: 'matchSubmissionRequirements' };
                return {
                    errors: errors ? [...errors, matchingError] : [matchingError],
                    warnings: warnings,
                    areRequiredCredentialsPresent: Status.ERROR,
                };
            }
            const matches = this.extractMatches(matchSubmissionRequirements);
            const credentials = matches.map((e) => jp.nodes(this._client.wrappedVcs.map((wrapped) => wrapped.original), e)[0].value);
            const areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(presentationDefinition, matchSubmissionRequirements);
            selectResults = {
                errors: areRequiredCredentialsPresent === Status.INFO ? [] : errors,
                matches: [...matchSubmissionRequirements],
                areRequiredCredentialsPresent,
                verifiableCredential: credentials,
                warnings,
            };
        }
        else {
            const marked = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR);
            const checkWithoutSRResults = this.checkWithoutSubmissionRequirements(marked, presentationDefinition);
            if (!checkWithoutSRResults.length) {
                const matchSubmissionRequirements = this.matchWithoutSubmissionRequirements(marked, presentationDefinition);
                const matches = this.extractMatches(matchSubmissionRequirements);
                const credentials = matches.map((e) => jp.nodes(this._client.wrappedVcs.map((wrapped) => wrapped.original), e)[0].value);
                selectResults = {
                    errors: [],
                    matches: [...matchSubmissionRequirements],
                    areRequiredCredentialsPresent: Status.INFO,
                    verifiableCredential: credentials,
                    warnings,
                };
            }
            else {
                return {
                    errors: errors,
                    matches: [],
                    areRequiredCredentialsPresent: Status.ERROR,
                    verifiableCredential: wrappedVerifiableCredentials.map((value) => value.original),
                    warnings: warnings,
                };
            }
        }
        this.fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, wrappedVerifiableCredentials);
        selectResults.areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(presentationDefinition, selectResults?.matches);
        this.remapMatches(wrappedVerifiableCredentials.map((wrapped) => wrapped.original), selectResults.matches, selectResults?.verifiableCredential);
        selectResults.matches?.forEach((m) => {
            this.updateSubmissionRequirementMatchPathToAlias(m, 'verifiableCredential');
        });
        if (selectResults.areRequiredCredentialsPresent === Status.INFO) {
            selectResults.errors = [];
        }
        else {
            selectResults.errors = errors;
            selectResults.warnings = warnings;
            selectResults.verifiableCredential = wrappedVerifiableCredentials.map((value) => value.original);
        }
        return selectResults;
    }
    remapMatches(verifiableCredentials, submissionRequirementMatches, vcsToSend) {
        submissionRequirementMatches?.forEach((srm) => {
            if (srm.from_nested) {
                this.remapMatches(verifiableCredentials, srm.from_nested, vcsToSend);
            }
            else {
                srm.vc_path.forEach((match, index, matches) => {
                    const vc = jp.query(verifiableCredentials, match)[0];
                    const newIndex = vcsToSend?.findIndex((svc) => JSON.stringify(svc) === JSON.stringify(vc));
                    if (newIndex === -1) {
                        throw new Error(`The index of the VerifiableCredential in your current call can't be found in your previously submitted credentials. Are you trying to send a new Credential?\nverifiableCredential: ${vc}`);
                    }
                    matches[index] = `$[${newIndex}]`;
                });
                srm.name;
            }
        });
    }
    extractMatches(matchSubmissionRequirements) {
        const matches = [];
        matchSubmissionRequirements.forEach((e) => {
            matches.push(...e.vc_path);
            if (e.from_nested) {
                matches.push(...this.extractMatches(e.from_nested));
            }
        });
        return Array.from(new Set(matches));
    }
    /**
     * Since this is without SubmissionRequirements object, each InputDescriptor has to have at least one corresponding VerifiableCredential
     * @param marked: info logs for `MarkForSubmissionEvaluation` handler
     * @param pd
     * @private
     */
    checkWithoutSubmissionRequirements(marked, pd) {
        const checkResult = [];
        if (!pd.input_descriptors) {
            return [];
        }
        if (!marked.length) {
            return [
                {
                    input_descriptor_path: '',
                    evaluator: 'checkWithoutSubmissionRequirement',
                    verifiable_credential_path: '',
                    status: Status.ERROR,
                    payload: `Not all the InputDescriptors are addressed`,
                },
            ];
        }
        const inputDescriptors = pd.input_descriptors;
        const markedInputDescriptorPaths = ObjectUtils.getDistinctFieldInObject(marked, 'input_descriptor_path');
        if (markedInputDescriptorPaths.length !== inputDescriptors.length) {
            const inputDescriptorsFromLogs = markedInputDescriptorPaths.map((value) => JsonPathUtils.extractInputField(pd, [value])[0].value).map((value) => value.id);
            for (let i = 0; i < pd.input_descriptors.length; i++) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (inputDescriptorsFromLogs.indexOf(pd.input_descriptors[i].id) == -1) {
                    checkResult.push({
                        input_descriptor_path: `$.input_descriptors[${i}]`,
                        evaluator: 'checkWithoutSubmissionRequirement',
                        verifiable_credential_path: '',
                        status: Status.ERROR,
                        payload: `Not all the InputDescriptors are addressed`,
                    });
                }
            }
        }
        return checkResult;
    }
    matchSubmissionRequirements(pd, submissionRequirements, marked) {
        const submissionRequirementMatches = [];
        for (const [srIndex, sr] of Object.entries(submissionRequirements)) {
            // Create a default SubmissionRequirementMatch object
            const srm = {
                rule: sr.rule,
                vc_path: [],
                name: sr.name,
                type: SubmissionRequirementMatchType.SubmissionRequirement,
                id: Number(srIndex),
            };
            if (sr.from) {
                srm.from = sr.from;
            }
            // Assign min, max, and count regardless of 'from' or 'from_nested'
            sr.min ? (srm.min = sr.min) : undefined;
            sr.max ? (srm.max = sr.max) : undefined;
            sr.count ? (srm.count = sr.count) : undefined;
            if (sr.from) {
                const matchingVcPaths = this.getMatchingVcPathsForSubmissionRequirement(pd, sr, marked);
                srm.vc_path.push(...matchingVcPaths);
                submissionRequirementMatches.push(srm);
            }
            else if (sr.from_nested) {
                // Recursive call to matchSubmissionRequirements for nested requirements
                try {
                    srm.from_nested = this.matchSubmissionRequirements(pd, sr.from_nested, marked);
                    submissionRequirementMatches.push(srm);
                }
                catch (err) {
                    throw new Error(`Error in handling value of from_nested: ${sr.from_nested}: err: ${err}`);
                }
            }
            else {
                // Throw an error if neither 'from' nor 'from_nested' is found
                throw new Error("Invalid SubmissionRequirement object: Must contain either 'from' or 'from_nested'");
            }
        }
        return submissionRequirementMatches;
    }
    matchWithoutSubmissionRequirements(marked, pd) {
        const submissionRequirementMatches = [];
        const partitionedIdToVcMap = this.createIdToVcMap(marked);
        for (const [idPath, sameIdVcs] of partitionedIdToVcMap.entries()) {
            if (!sameIdVcs || !sameIdVcs.length) {
                continue;
            }
            for (const vcPath of sameIdVcs) {
                const inputDescriptorResults = JsonPathUtils.extractInputField(pd, [idPath]);
                if (inputDescriptorResults.length) {
                    const inputDescriptor = inputDescriptorResults[0].value;
                    submissionRequirementMatches.push({
                        name: inputDescriptor.name || inputDescriptor.id,
                        rule: Rules.All,
                        vc_path: [vcPath],
                        type: SubmissionRequirementMatchType.InputDescriptor,
                        id: inputDescriptor.id,
                    });
                }
            }
        }
        return this.removeDuplicateSubmissionRequirementMatches(submissionRequirementMatches);
    }
    getMatchingVcPathsForSubmissionRequirement(pd, sr, marked) {
        const vcPaths = new Set();
        if (!sr.from)
            return Array.from(vcPaths);
        for (const m of marked) {
            const inputDescriptor = jp.query(pd, m.input_descriptor_path)[0];
            if (inputDescriptor.group && inputDescriptor.group.indexOf(sr.from) === -1) {
                continue;
            }
            if (m.payload.group.includes(sr.from)) {
                vcPaths.add(m.verifiable_credential_path);
            }
        }
        return Array.from(vcPaths);
    }
    evaluate(pd, wvcs, opts) {
        this._client.evaluate(pd, wvcs, opts);
        const result = {
            areRequiredCredentialsPresent: Status.INFO,
            // TODO: we should handle the string case
            verifiableCredential: wvcs.map((wrapped) => wrapped.original),
        };
        result.warnings = this.formatNotInfo(Status.WARN);
        result.errors = this.formatNotInfo(Status.ERROR);
        this._client.assertPresentationSubmission();
        if (this._client.presentationSubmission?.descriptor_map.length) {
            this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map.filter((v) => v !== undefined);
            result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
        }
        if (this._client.generatePresentationSubmission) {
            this.updatePresentationSubmissionPathToVpPath(result.value);
        }
        result.verifiableCredential = this._client.wrappedVcs.map((wrapped) => wrapped.original);
        result.areRequiredCredentialsPresent = result.value?.descriptor_map?.length ? Status.INFO : Status.ERROR;
        return result;
    }
    evaluatePresentations(pd, wvps, opts) {
        // If submission is provided as input, we match the presentations against the submission. In this case the submission MUST be valid
        if (opts?.presentationSubmission) {
            return this.evaluatePresentationsAgainstSubmission(pd, wvps, opts.presentationSubmission, opts);
        }
        const wrappedPresentations = Array.isArray(wvps) ? wvps : [wvps];
        const allWvcs = wrappedPresentations.reduce((all, wvp) => [...all, ...wvp.vcs], []);
        const result = {
            areRequiredCredentialsPresent: Status.INFO,
            presentation: Array.isArray(wvps) ? wvps.map((wvp) => wvp.original) : wvps.original,
            errors: [],
            warnings: [],
        };
        this._client.evaluate(pd, allWvcs, opts);
        result.warnings = this.formatNotInfo(Status.WARN);
        result.errors = this.formatNotInfo(Status.ERROR);
        this._client.assertPresentationSubmission();
        if (this._client.presentationSubmission?.descriptor_map.length) {
            this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map.filter((v) => v !== undefined);
            result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
        }
        const useExternalSubmission = opts?.presentationSubmissionLocation !== undefined
            ? opts.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL
            : Array.isArray(wvps);
        if (this._client.generatePresentationSubmission && result.value && useExternalSubmission) {
            // we map the descriptors of the generated submisison to take into account the nexted values
            result.value.descriptor_map = result.value.descriptor_map.map((descriptor) => {
                const [wvcResult] = JsonPathUtils.extractInputField(allWvcs, [descriptor.path]);
                if (!wvcResult) {
                    throw new Error(`Could not find descriptor path ${descriptor.path} in wrapped verifiable credentials`);
                }
                const matchingWvc = wvcResult.value;
                const matchingVpIndex = wrappedPresentations.findIndex((wvp) => wvp.vcs.includes(matchingWvc));
                const matchingVp = wrappedPresentations[matchingVpIndex];
                const matcingWvcIndexInVp = matchingVp.vcs.findIndex((wvc) => wvc === matchingWvc);
                return this.updateDescriptorToExternal(descriptor, {
                    // We don't want to add vp index if the input to evaluate was a single presentation
                    vpIndex: Array.isArray(wvps) ? matchingVpIndex : undefined,
                    vcIndex: matcingWvcIndexInVp,
                });
            });
        }
        else if (this._client.generatePresentationSubmission && result.value) {
            this.updatePresentationSubmissionPathToVpPath(result.value);
        }
        result.areRequiredCredentialsPresent = result.value?.descriptor_map?.length ? Status.INFO : Status.ERROR;
        return result;
    }
    extractWrappedVcFromWrappedVp(descriptor, descriptorIndex, wvp) {
        // Decoded won't work for sd-jwt or jwt?!?!
        const [vcResult] = JsonPathUtils.extractInputField(wvp.decoded, [descriptor.path]);
        if (!vcResult) {
            return {
                error: {
                    status: Status.ERROR,
                    tag: 'SubmissionPathNotFound',
                    message: `Unable to extract path ${descriptor.path} for submission.descriptor_path[${descriptorIndex}] from verifiable presentation`,
                },
                wvc: undefined,
            };
        }
        // Find the wrapped VC based on the original VC
        const originalVc = vcResult.value;
        const wvc = wvp.vcs.find((wvc) => CredentialMapper.areOriginalVerifiableCredentialsEqual(wvc.original, originalVc));
        if (!wvc) {
            return {
                error: {
                    status: Status.ERROR,
                    tag: 'SubmissionPathNotFound',
                    message: `Unable to find wrapped vc`,
                },
                wvc: undefined,
            };
        }
        return {
            wvc,
            error: undefined,
        };
    }
    evaluatePresentationsAgainstSubmission(pd, wvps, submission, opts) {
        const result = {
            areRequiredCredentialsPresent: Status.INFO,
            presentation: Array.isArray(wvps) ? wvps.map((wvp) => wvp.original) : wvps.original,
            errors: [],
            warnings: [],
            value: submission,
        };
        // If only a single VP is passed that is not w3c and no presentationSubmissionLocation, we set the default location to presentation. Otherwise we assume it's external
        const presentationSubmissionLocation = opts?.presentationSubmissionLocation ??
            (Array.isArray(wvps) || !CredentialMapper.isW3cPresentation(wvps.presentation)
                ? PresentationSubmissionLocation.EXTERNAL
                : PresentationSubmissionLocation.PRESENTATION);
        // We loop over all the descriptors in the submission
        for (const descriptorIndex in submission.descriptor_map) {
            const descriptor = submission.descriptor_map[descriptorIndex];
            let vp;
            let vc;
            let vcPath;
            if (presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
                // Extract the VP from the wrapped VPs
                const [vpResult] = JsonPathUtils.extractInputField(wvps, [descriptor.path]);
                if (!vpResult) {
                    result.areRequiredCredentialsPresent = Status.ERROR;
                    result.errors?.push({
                        status: Status.ERROR,
                        tag: 'SubmissionPathNotFound',
                        message: `Unable to extract path ${descriptor.path} for submission.descriptor_path[${descriptorIndex}] from presentation(s)`,
                    });
                    continue;
                }
                vp = vpResult.value;
                vcPath = `presentation ${descriptor.path}`;
                if (vp.format !== descriptor.format) {
                    result.areRequiredCredentialsPresent = Status.ERROR;
                    result.errors?.push({
                        status: Status.ERROR,
                        tag: 'SubmissionFormatNoMatch',
                        message: `VP at path ${descriptor.path} has format ${vp.format}, while submission.descriptor_path[${descriptorIndex}] has format ${descriptor.format}`,
                    });
                    continue;
                }
                if (descriptor.path_nested) {
                    const extractionResult = this.extractWrappedVcFromWrappedVp(descriptor.path_nested, descriptorIndex, vp);
                    if (extractionResult.error) {
                        result.areRequiredCredentialsPresent = Status.ERROR;
                        result.errors?.push(extractionResult.error);
                        continue;
                    }
                    vc = extractionResult.wvc;
                    vcPath += ` with nested credential ${descriptor.path_nested.path}`;
                }
                else if (descriptor.format === 'vc+sd-jwt') {
                    vc = vp.vcs[0];
                }
                else {
                    result.areRequiredCredentialsPresent = Status.ERROR;
                    result.errors?.push({
                        status: Status.ERROR,
                        tag: 'UnsupportedFormat',
                        message: `VP format ${vp.format} is not supported`,
                    });
                    continue;
                }
            }
            else {
                // TODO: check that not longer than 0
                vp = Array.isArray(wvps) ? wvps[0] : wvps;
                vcPath = `credential ${descriptor.path}`;
                const extractionResult = this.extractWrappedVcFromWrappedVp(descriptor, descriptorIndex, vp);
                if (extractionResult.error) {
                    result.areRequiredCredentialsPresent = Status.ERROR;
                    result.errors?.push(extractionResult.error);
                    continue;
                }
                vc = extractionResult.wvc;
            }
            // TODO: we should probably add support for holder dids in the kb-jwt of an SD-JWT. We can extract this from the
            // `wrappedPresentation.original.compactKbJwt`, but as HAIP doesn't use dids, we'll leave it for now.
            const holderDIDs = CredentialMapper.isW3cPresentation(vp.presentation) && vp.presentation.holder ? [vp.presentation.holder] : [];
            // Get the presentation definition only for this descriptor, so we can evaluate it separately
            const pdForDescriptor = this.internalPresentationDefinitionForDescriptor(pd, descriptor.id);
            // Reset the client on each iteration.
            this._client = new EvaluationClient();
            this._client.evaluate(pdForDescriptor, [vc], {
                ...opts,
                holderDIDs,
                presentationSubmission: undefined,
                generatePresentationSubmission: undefined,
            });
            if (this._client.presentationSubmission.descriptor_map.length !== 1) {
                const submissionDescriptor = `submission.descriptor_map[${descriptorIndex}]`;
                result.areRequiredCredentialsPresent = Status.ERROR;
                result.errors?.push(...this.formatNotInfo(Status.ERROR, submissionDescriptor, vcPath));
                result.warnings?.push(...this.formatNotInfo(Status.WARN, submissionDescriptor, vcPath));
            }
        }
        // Output submission is same as input presentation submission, it's just that if it doesn't match, we return Error.
        const submissionAgainstDefinitionResult = this.validateIfSubmissionSatisfiesDefinition(pd, submission);
        if (!submissionAgainstDefinitionResult.doesSubmissionSatisfyDefinition) {
            result.errors?.push({
                status: Status.ERROR,
                tag: 'SubmissionDoesNotSatisfyDefinition',
                // TODO: it would be nice to add the nested errors here for beter understanding WHY the submission
                // does not satisfy the definition, as we have that info, but we can only include one message here
                message: submissionAgainstDefinitionResult.error,
            });
            result.areRequiredCredentialsPresent = Status.ERROR;
        }
        return result;
    }
    checkIfSubmissionSatisfiesSubmissionRequirement(pd, submission, submissionRequirement, submissionRequirementName) {
        if ((submissionRequirement.from && submissionRequirement.from_nested) || (!submissionRequirement.from && !submissionRequirement.from_nested)) {
            return {
                isSubmissionRequirementSatisfied: false,
                totalMatches: 0,
                errors: [
                    `Either 'from' OR 'from_nested' MUST be present on submission requirement ${submissionRequirementName}, but not neither and not both`,
                ],
            };
        }
        const result = {
            isSubmissionRequirementSatisfied: false,
            totalMatches: 0,
            maxRequiredMatches: submissionRequirement.rule === Rules.Pick ? submissionRequirement.max : undefined,
            minRequiredMatches: submissionRequirement.rule === Rules.Pick ? submissionRequirement.min : undefined,
            errors: [],
        };
        // Populate from_nested requirements
        if (submissionRequirement.from_nested) {
            const nestedResults = submissionRequirement.from_nested.map((nestedSubmissionRequirement, index) => this.checkIfSubmissionSatisfiesSubmissionRequirement(pd, submission, nestedSubmissionRequirement, `${submissionRequirementName}.from_nested[${index}]`));
            result.totalRequiredMatches = submissionRequirement.rule === Rules.All ? submissionRequirement.from_nested.length : submissionRequirement.count;
            result.totalMatches = nestedResults.filter((n) => n.isSubmissionRequirementSatisfied).length;
            result.nested = nestedResults;
        }
        // Populate from requirements
        if (submissionRequirement.from) {
            const inputDescriptorsForGroup = pd.input_descriptors.filter((descriptor) => descriptor.group?.includes(submissionRequirement.from));
            const descriptorIdsInSubmission = submission.descriptor_map.map((descriptor) => descriptor.id);
            const inputDescriptorsInSubmission = inputDescriptorsForGroup.filter((inputDescriptor) => descriptorIdsInSubmission.includes(inputDescriptor.id));
            result.totalMatches = inputDescriptorsInSubmission.length;
            result.totalRequiredMatches = submissionRequirement.rule === Rules.All ? inputDescriptorsForGroup.length : submissionRequirement.count;
        }
        // Validate if the min/max/count requirements are satisfied
        if (result.totalRequiredMatches !== undefined && result.totalMatches !== result.totalRequiredMatches) {
            result.errors.push(`Expected ${result.totalRequiredMatches} requirements to be satisfied for submission requirement ${submissionRequirementName}, but found ${result.totalMatches}`);
        }
        if (result.minRequiredMatches !== undefined && result.totalMatches < result.minRequiredMatches) {
            result.errors.push(`Expected at least ${result.minRequiredMatches} requirements to be satisfied from submission requirement ${submissionRequirementName}, but found ${result.totalMatches}`);
        }
        if (result.maxRequiredMatches !== undefined && result.totalMatches > result.maxRequiredMatches) {
            result.errors.push(`Expected at most ${result.maxRequiredMatches} requirements to be satisfied from submission requirement ${submissionRequirementName}, but found ${result.totalMatches}`);
        }
        result.isSubmissionRequirementSatisfied = result.errors.length === 0;
        return result;
    }
    /**
     * Checks whether a submission satisfies the requirements of a presentation definition
     */
    validateIfSubmissionSatisfiesDefinition(pd, submission) {
        const submissionDescriptorIds = submission.descriptor_map.map((descriptor) => descriptor.id);
        const result = {
            doesSubmissionSatisfyDefinition: false,
            totalMatches: 0,
            totalRequiredMatches: 0,
        };
        // All MUST match
        if (pd.submission_requirements) {
            const submissionRequirementResults = pd.submission_requirements.map((submissionRequirement, index) => this.checkIfSubmissionSatisfiesSubmissionRequirement(pd, submission, submissionRequirement, `$.submission_requirements[${index}]`));
            result.totalRequiredMatches = pd.submission_requirements.length;
            result.totalMatches = submissionRequirementResults.filter((r) => r.isSubmissionRequirementSatisfied).length;
            result.submisisonRequirementResults = submissionRequirementResults;
            if (result.totalMatches !== result.totalRequiredMatches) {
                result.error = `Expected all submission requirements (${result.totalRequiredMatches}) to be satisfifed in submission, but found ${result.totalMatches}.`;
            }
        }
        else {
            result.totalRequiredMatches = pd.input_descriptors.length;
            result.totalMatches = submissionDescriptorIds.length;
            const notInSubmission = pd.input_descriptors.filter((inputDescriptor) => !submissionDescriptorIds.includes(inputDescriptor.id));
            if (notInSubmission.length > 0) {
                result.error = `Expected all input descriptors (${pd.input_descriptors.length}) to be satisfifed in submission, but found ${submissionDescriptorIds.length}. Missing ${notInSubmission.map((d) => d.id).join(', ')}`;
            }
        }
        result.doesSubmissionSatisfyDefinition = result.error === undefined;
        return result;
    }
    internalPresentationDefinitionForDescriptor(pd, descriptorId) {
        if (pd instanceof InternalPresentationDefinitionV2) {
            const inputDescriptorIndex = pd.input_descriptors.findIndex((i) => i.id === descriptorId);
            return new InternalPresentationDefinitionV2(pd.id, [pd.input_descriptors[inputDescriptorIndex]], pd.format, pd.frame, pd.name, pd.purpose, 
            // we ignore submission requirements as we're verifying a single input descriptor here
            undefined);
        }
        else if (pd instanceof InternalPresentationDefinitionV1) {
            const inputDescriptorIndex = pd.input_descriptors.findIndex((i) => i.id === descriptorId);
            return new InternalPresentationDefinitionV1(pd.id, [pd.input_descriptors[inputDescriptorIndex]], pd.format, pd.name, pd.purpose, 
            // we ignore submission requirements as we're verifying a single input descriptor here
            undefined);
        }
        throw new Error('Unrecognized presentation definition instance');
    }
    formatNotInfo(status, descriptorPath, vcPath) {
        return this._client.results
            .filter((result) => result.status === status)
            .map((x) => {
            const _vcPath = vcPath ?? `$.verifiableCredential${x.verifiable_credential_path.substring(1)}`;
            const _descriptorPath = descriptorPath ?? x.input_descriptor_path;
            return {
                tag: x.evaluator,
                status: x.status,
                message: `${x.message}: ${_descriptorPath}: ${_vcPath}`,
            };
        });
    }
    submissionFrom(pd, vcs, opts) {
        if (!this._client.results) {
            throw Error('You need to call evaluate() before pex.presentationFrom()');
        }
        if (!this._client.generatePresentationSubmission) {
            return this._client.presentationSubmission;
        }
        if (pd.submission_requirements) {
            const marked = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== Status.ERROR);
            const [updatedMarked, upIdx] = this.matchUserSelectedVcs(marked, vcs);
            const groupCount = new Map();
            //TODO instanceof fails in some cases, need to check how to fix it
            if ('input_descriptors' in pd) {
                pd.input_descriptors.forEach((e) => {
                    if (e.group) {
                        e.group.forEach((key) => {
                            if (groupCount.has(key)) {
                                groupCount.set(key, groupCount.get(key) + 1);
                            }
                            else {
                                groupCount.set(key, 1);
                            }
                        });
                    }
                });
            }
            const result = this.evaluateRequirements(pd.submission_requirements, updatedMarked, groupCount, 0);
            const finalIdx = upIdx.filter((ui) => result[1].find((r) => r.verifiable_credential_path === ui[1]));
            this.updatePresentationSubmission(finalIdx);
            this.updatePresentationSubmissionPathToVpPath();
            if (opts?.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
                this.updatePresentationSubmissionToExternal();
            }
            return this._client.presentationSubmission;
        }
        const marked = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== Status.ERROR);
        const updatedIndexes = this.matchUserSelectedVcs(marked, vcs);
        this.updatePresentationSubmission(updatedIndexes[1]);
        this.updatePresentationSubmissionPathToVpPath();
        if (opts?.presentationSubmissionLocation === PresentationSubmissionLocation.EXTERNAL) {
            this.updatePresentationSubmissionToExternal();
        }
        return this._client.presentationSubmission;
    }
    updatePresentationSubmission(updatedIndexes) {
        if (!this._client.generatePresentationSubmission) {
            return; // never update a supplied submission
        }
        this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map
            .filter((descriptor) => updatedIndexes.find((ui) => ui[0] === descriptor.path))
            .map((descriptor) => {
            const result = updatedIndexes.find((ui) => ui[0] === descriptor.path);
            if (result) {
                descriptor.path = result[1];
            }
            return descriptor;
        });
    }
    updatePresentationSubmissionToExternal(presentationSubmission) {
        const descriptors = presentationSubmission?.descriptor_map ?? this._client.presentationSubmission.descriptor_map;
        const updatedDescriptors = descriptors.map((d) => this.updateDescriptorToExternal(d));
        if (presentationSubmission) {
            return {
                ...presentationSubmission,
                descriptor_map: updatedDescriptors,
            };
        }
        this._client.presentationSubmission.descriptor_map = updatedDescriptors;
        return this._client.presentationSubmission;
    }
    updateDescriptorToExternal(descriptor, { vpIndex, vcIndex, } = {}) {
        if (descriptor.path_nested) {
            return descriptor;
        }
        const { nestedCredentialPath, vpFormat } = getVpFormatForVcFormat(descriptor.format);
        const newDescriptor = {
            ...descriptor,
            format: vpFormat,
            path: vpIndex !== undefined ? `$[${vpIndex}]` : '$',
        };
        if (nestedCredentialPath) {
            newDescriptor.path_nested = {
                ...descriptor,
                path: vcIndex !== undefined
                    ? `${nestedCredentialPath}[${vcIndex}]`
                    : descriptor.path.replace('$.verifiableCredential', nestedCredentialPath).replace('$[', `${nestedCredentialPath}[`),
            };
        }
        return newDescriptor;
    }
    matchUserSelectedVcs(marked, vcs) {
        const userSelected = vcs.map((vc, index) => [index, JSON.stringify(vc.original)]);
        const allCredentials = this._client.wrappedVcs.map((vc, index) => [index, JSON.stringify(vc.original)]);
        const updatedIndexes = [];
        userSelected.forEach((us, i) => {
            allCredentials.forEach((ac, j) => {
                if (ac[1] === us[1]) {
                    updatedIndexes.push([`$[${j}]`, `$[${i}]`]);
                }
            });
        });
        marked = marked
            .filter((m) => updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path))
            .map((m) => {
            const index = updatedIndexes.find((ui) => ui[0] === m.verifiable_credential_path);
            if (index) {
                m.verifiable_credential_path = index[1];
            }
            return m;
        });
        return [marked, updatedIndexes];
    }
    evaluateRequirements(submissionRequirement, marked, groupCount, level) {
        let total = 0;
        const result = [];
        for (const sr of submissionRequirement) {
            if (sr.from) {
                if (sr.rule === Rules.All) {
                    const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
                    if (count !== (groupCount.get(sr.from) || 0)) {
                        throw Error(`Not all input descriptors are members of group ${sr.from}`);
                    }
                    total++;
                    result.push(...matched);
                }
                else if (sr.rule === Rules.Pick) {
                    const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
                    try {
                        this.handleCount(sr, count, level);
                        total++;
                    }
                    catch (error) {
                        if (level === 0)
                            throw error;
                    }
                    result.push(...matched);
                }
            }
            else if (sr.from_nested) {
                const [count, matched] = this.evaluateRequirements(sr.from_nested, marked, groupCount, ++level);
                total += count;
                result.push(...matched);
                this.handleCount(sr, count, level);
            }
        }
        return [total, result];
    }
    countMatchingInputDescriptors(submissionRequirement, marked) {
        let count = 0;
        const matched = [];
        for (const m of marked) {
            if (m.payload.group.includes(submissionRequirement.from)) {
                matched.push(m);
                count++;
            }
        }
        return [count, matched];
    }
    handleCount(submissionRequirement, count, level) {
        if (submissionRequirement.count) {
            if (count !== submissionRequirement.count) {
                throw Error(`Count: expected: ${submissionRequirement.count} actual: ${count} at level: ${level}`);
            }
        }
        if (submissionRequirement.min) {
            if (count < submissionRequirement.min) {
                throw Error(`Min: expected: ${submissionRequirement.min} actual: ${count} at level: ${level}`);
            }
        }
        if (submissionRequirement.max) {
            if (count > submissionRequirement.max) {
                throw Error(`Max: expected: ${submissionRequirement.max} actual: ${count} at level: ${level}`);
            }
        }
    }
    removeDuplicateSubmissionRequirementMatches(matches) {
        return matches.filter((match, index) => {
            const _match = JSON.stringify(match);
            return (index ===
                matches.findIndex((obj) => {
                    return JSON.stringify(obj) === _match;
                }));
        });
    }
    fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, wrappedVcs) {
        if (selectResults) {
            selectResults.verifiableCredential?.forEach((selectableCredential) => {
                const foundIndex = wrappedVcs.findIndex((wrappedVc) => CredentialMapper.areOriginalVerifiableCredentialsEqual(wrappedVc.original, selectableCredential));
                if (foundIndex === -1) {
                    throw new Error('index is not right');
                }
                selectResults.vcIndexes
                    ? !selectResults.vcIndexes.includes(foundIndex) && selectResults.vcIndexes.push(foundIndex)
                    : (selectResults.vcIndexes = [foundIndex]);
            });
        }
    }
    determineAreRequiredCredentialsPresent(presentationDefinition, matchSubmissionRequirements, parentMsr) {
        if (!matchSubmissionRequirements || !matchSubmissionRequirements.length) {
            return Status.ERROR;
        }
        // collect child statuses
        const childStatuses = matchSubmissionRequirements.map((m) => this.determineSubmissionRequirementStatus(presentationDefinition, m));
        // decide status based on child statuses and parent's rule
        if (!parentMsr) {
            if (childStatuses.includes(Status.ERROR)) {
                return Status.ERROR;
            }
            else if (childStatuses.includes(Status.WARN)) {
                return Status.WARN;
            }
            else {
                return Status.INFO;
            }
        }
        else {
            if (parentMsr.rule === Rules.All && childStatuses.includes(Status.ERROR)) {
                return Status.ERROR;
            }
            const nonErrStatCount = childStatuses.filter((status) => status !== Status.ERROR).length;
            if (parentMsr.count) {
                return parentMsr.count > nonErrStatCount ? Status.ERROR : parentMsr.count < nonErrStatCount ? Status.WARN : Status.INFO;
            }
            else {
                if (parentMsr.min && parentMsr.min > nonErrStatCount) {
                    return Status.ERROR;
                }
                else if (parentMsr.max && parentMsr.max < nonErrStatCount) {
                    return Status.WARN;
                }
            }
        }
        return Status.INFO;
    }
    determineSubmissionRequirementStatus(pd, m) {
        if (m.from && m.from_nested) {
            throw new Error('Invalid submission_requirement object: MUST contain either a from or from_nested property.');
        }
        if (!m.from && !m.from_nested && m.vc_path.length !== 1) {
            return Status.ERROR;
        }
        if (m.from) {
            const groupCount = this.countGroupIDs(pd.input_descriptors, m.from);
            switch (m.rule) {
                case Rules.All:
                    // Ensure that all descriptors associated with `m.from` are satisfied.
                    return m.vc_path.length === groupCount ? Status.INFO : Status.WARN;
                case Rules.Pick:
                    return this.getPickRuleStatus(m);
                default:
                    return Status.ERROR;
            }
        }
        else if (m.from_nested) {
            return this.determineAreRequiredCredentialsPresent(pd, m.from_nested, m);
        }
        return Status.INFO;
    }
    getPickRuleStatus(m) {
        if (m.vc_path.length === 0) {
            return Status.ERROR;
        }
        if (m.count && m.vc_path.length !== m.count) {
            return m.vc_path.length > m.count ? Status.WARN : Status.ERROR;
        }
        if (m.min && m.vc_path.length < m.min) {
            return Status.ERROR;
        }
        if (m.max && m.vc_path.length > m.max) {
            return Status.WARN;
        }
        return Status.INFO;
    }
    updateSubmissionRequirementMatchPathToAlias(submissionRequirementMatch, alias) {
        const vc_path = [];
        submissionRequirementMatch.vc_path.forEach((m) => {
            if (m.startsWith(`$.${alias}`)) {
                vc_path.push(m);
            }
            else {
                vc_path.push(m.replace('$', `$.${alias}`));
            }
        });
        submissionRequirementMatch.vc_path = vc_path;
        if (submissionRequirementMatch.from_nested) {
            submissionRequirementMatch.from_nested.forEach((f) => {
                this.updateSubmissionRequirementMatchPathToAlias(f, alias);
            });
        }
    }
    updatePresentationSubmissionPathToVpPath(presentationSubmission) {
        const descriptorMap = presentationSubmission
            ? presentationSubmission.descriptor_map
            : this._client.generatePresentationSubmission
                ? this._client.presentationSubmission.descriptor_map
                : undefined;
        descriptorMap?.forEach((d) => {
            // NOTE: currently we only support a single VP for a single PD, so that means an SD-JWT will always have the path '$'.
            // If there is more consensus on whether a PD can result in one submission with multiple VPs, we could tweak this logic
            // to keep supporting arrays (so it will just stay as the input format) if there's multiple SD-JWTs that are included
            // in the presentation submission (we would allow the presentationFrom and verifiablePresentationFrom to just return
            // an array of VPs, while still one submission is returned. This will also help with creating multiple VPs for JWT credentials)
            // See https://github.com/decentralized-identity/presentation-exchange/issues/462
            // Also see: https://github.com/openid/OpenID4VP/issues/69
            if (d.format === 'vc+sd-jwt') {
                d.path = '$';
            }
            else {
                this.replacePathWithAlias(d, 'verifiableCredential');
            }
        });
    }
    replacePathWithAlias(descriptor, alias) {
        descriptor.path = descriptor.path.replace(`$[`, `$.${alias}[`);
        if (descriptor.path_nested) {
            this.replacePathWithAlias(descriptor.path_nested, alias);
        }
    }
    createIdToVcMap(marked) {
        const partitionedResults = new Map();
        const partitionedBasedOnId = new Map();
        for (let i = 0; i < marked.length; i++) {
            const currentIdPath = marked[i].input_descriptor_path;
            if (partitionedBasedOnId.has(currentIdPath)) {
                const partBasedOnId = partitionedBasedOnId.get(currentIdPath);
                if (partBasedOnId) {
                    partBasedOnId.push(marked[i]);
                }
            }
            else {
                partitionedBasedOnId.set(currentIdPath, [marked[i]]);
            }
        }
        for (const [idPath, sameVcCheckResults] of partitionedBasedOnId.entries()) {
            const vcPaths = [];
            for (let i = 0; i < sameVcCheckResults.length; i++) {
                if (vcPaths.indexOf(sameVcCheckResults[i].verifiable_credential_path) === -1) {
                    vcPaths.push(sameVcCheckResults[i].verifiable_credential_path);
                }
            }
            partitionedResults.set(idPath, vcPaths);
        }
        return partitionedResults;
    }
    countGroupIDs(input_descriptors, from) {
        let count = 0;
        for (const descriptor of input_descriptors) {
            if (descriptor.group && descriptor.group.includes(from)) {
                count++;
            }
        }
        return count;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdGlvbkNsaWVudFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvZXZhbHVhdGlvbi9ldmFsdWF0aW9uQ2xpZW50V3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxJQUFJLEVBQUUsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sRUFBb0YsS0FBSyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFL0gsT0FBTyxFQUNMLGdCQUFnQixHQU1qQixNQUFNLHFCQUFxQixDQUFDO0FBRTdCLE9BQU8sRUFBVyxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUQsT0FBTyxFQUVMLGdDQUFnQyxFQUNoQyxnQ0FBZ0MsR0FHakMsTUFBTSxVQUFVLENBQUM7QUFDbEIsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDdEQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFNUQsT0FBTyxFQU1MLDhCQUE4QixHQUMvQixNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQTBCdEQsTUFBTSxPQUFPLHVCQUF1QjtJQUMxQixPQUFPLENBQW1CO0lBRWxDO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVNLG1CQUFtQjtRQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVNLFVBQVUsQ0FDZixzQkFBdUQsRUFDdkQsNEJBQTJELEVBQzNELElBS0M7UUFFRCxJQUFJLGFBQTRCLENBQUM7UUFFakMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsc0JBQXNCLEVBQUUs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