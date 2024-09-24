"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationClientWrapper = void 0;
const jsonpath_1 = require("@astronautlabs/jsonpath");
const pex_models_1 = require("@sphereon/pex-models");
const ssi_types_1 = require("@sphereon/ssi-types");
const ConstraintUtils_1 = require("../ConstraintUtils");
const signing_1 = require("../signing");
const types_1 = require("../types");
const utils_1 = require("../utils");
const formatMap_1 = require("../utils/formatMap");
const core_1 = require("./core");
const evaluationClient_1 = require("./evaluationClient");
class EvaluationClientWrapper {
    constructor() {
        this._client = new evaluationClient_1.EvaluationClient();
    }
    getEvaluationClient() {
        return this._client;
    }
    selectFrom(presentationDefinition, wrappedVerifiableCredentials, opts) {
        var _a;
        let selectResults;
        this._client.evaluate(presentationDefinition, wrappedVerifiableCredentials, opts);
        const warnings = [...this.formatNotInfo(ConstraintUtils_1.Status.WARN)];
        const errors = [...this.formatNotInfo(ConstraintUtils_1.Status.ERROR)];
        if (presentationDefinition.submission_requirements) {
            const info = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== ConstraintUtils_1.Status.ERROR);
            const marked = Array.from(new Set(info));
            let matchSubmissionRequirements;
            try {
                matchSubmissionRequirements = this.matchSubmissionRequirements(presentationDefinition, presentationDefinition.submission_requirements, marked);
            }
            catch (e) {
                const matchingError = { status: ConstraintUtils_1.Status.ERROR, message: JSON.stringify(e), tag: 'matchSubmissionRequirements' };
                return {
                    errors: errors ? [...errors, matchingError] : [matchingError],
                    warnings: warnings,
                    areRequiredCredentialsPresent: ConstraintUtils_1.Status.ERROR,
                };
            }
            const matches = this.extractMatches(matchSubmissionRequirements);
            const credentials = matches.map((e) => jsonpath_1.JSONPath.nodes(this._client.wrappedVcs.map((wrapped) => wrapped.original), e)[0].value);
            const areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(presentationDefinition, matchSubmissionRequirements);
            selectResults = {
                errors: areRequiredCredentialsPresent === ConstraintUtils_1.Status.INFO ? [] : errors,
                matches: [...matchSubmissionRequirements],
                areRequiredCredentialsPresent,
                verifiableCredential: credentials,
                warnings,
            };
        }
        else {
            const marked = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== ConstraintUtils_1.Status.ERROR);
            const checkWithoutSRResults = this.checkWithoutSubmissionRequirements(marked, presentationDefinition);
            if (!checkWithoutSRResults.length) {
                const matchSubmissionRequirements = this.matchWithoutSubmissionRequirements(marked, presentationDefinition);
                const matches = this.extractMatches(matchSubmissionRequirements);
                const credentials = matches.map((e) => jsonpath_1.JSONPath.nodes(this._client.wrappedVcs.map((wrapped) => wrapped.original), e)[0].value);
                selectResults = {
                    errors: [],
                    matches: [...matchSubmissionRequirements],
                    areRequiredCredentialsPresent: ConstraintUtils_1.Status.INFO,
                    verifiableCredential: credentials,
                    warnings,
                };
            }
            else {
                return {
                    errors: errors,
                    matches: [],
                    areRequiredCredentialsPresent: ConstraintUtils_1.Status.ERROR,
                    verifiableCredential: wrappedVerifiableCredentials.map((value) => value.original),
                    warnings: warnings,
                };
            }
        }
        this.fillSelectableCredentialsToVerifiableCredentialsMapping(selectResults, wrappedVerifiableCredentials);
        selectResults.areRequiredCredentialsPresent = this.determineAreRequiredCredentialsPresent(presentationDefinition, selectResults === null || selectResults === void 0 ? void 0 : selectResults.matches);
        this.remapMatches(wrappedVerifiableCredentials.map((wrapped) => wrapped.original), selectResults.matches, selectResults === null || selectResults === void 0 ? void 0 : selectResults.verifiableCredential);
        (_a = selectResults.matches) === null || _a === void 0 ? void 0 : _a.forEach((m) => {
            this.updateSubmissionRequirementMatchPathToAlias(m, 'verifiableCredential');
        });
        if (selectResults.areRequiredCredentialsPresent === ConstraintUtils_1.Status.INFO) {
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
        submissionRequirementMatches === null || submissionRequirementMatches === void 0 ? void 0 : submissionRequirementMatches.forEach((srm) => {
            if (srm.from_nested) {
                this.remapMatches(verifiableCredentials, srm.from_nested, vcsToSend);
            }
            else {
                srm.vc_path.forEach((match, index, matches) => {
                    const vc = jsonpath_1.JSONPath.query(verifiableCredentials, match)[0];
                    const newIndex = vcsToSend === null || vcsToSend === void 0 ? void 0 : vcsToSend.findIndex((svc) => JSON.stringify(svc) === JSON.stringify(vc));
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
                    status: ConstraintUtils_1.Status.ERROR,
                    payload: `Not all the InputDescriptors are addressed`,
                },
            ];
        }
        const inputDescriptors = pd.input_descriptors;
        const markedInputDescriptorPaths = utils_1.ObjectUtils.getDistinctFieldInObject(marked, 'input_descriptor_path');
        if (markedInputDescriptorPaths.length !== inputDescriptors.length) {
            const inputDescriptorsFromLogs = markedInputDescriptorPaths.map((value) => utils_1.JsonPathUtils.extractInputField(pd, [value])[0].value).map((value) => value.id);
            for (let i = 0; i < pd.input_descriptors.length; i++) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (inputDescriptorsFromLogs.indexOf(pd.input_descriptors[i].id) == -1) {
                    checkResult.push({
                        input_descriptor_path: `$.input_descriptors[${i}]`,
                        evaluator: 'checkWithoutSubmissionRequirement',
                        verifiable_credential_path: '',
                        status: ConstraintUtils_1.Status.ERROR,
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
                type: core_1.SubmissionRequirementMatchType.SubmissionRequirement,
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
                const inputDescriptorResults = utils_1.JsonPathUtils.extractInputField(pd, [idPath]);
                if (inputDescriptorResults.length) {
                    const inputDescriptor = inputDescriptorResults[0].value;
                    submissionRequirementMatches.push({
                        name: inputDescriptor.name || inputDescriptor.id,
                        rule: pex_models_1.Rules.All,
                        vc_path: [vcPath],
                        type: core_1.SubmissionRequirementMatchType.InputDescriptor,
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
            const inputDescriptor = jsonpath_1.JSONPath.query(pd, m.input_descriptor_path)[0];
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
        var _a, _b, _c;
        this._client.evaluate(pd, wvcs, opts);
        const result = {
            areRequiredCredentialsPresent: ConstraintUtils_1.Status.INFO,
            // TODO: we should handle the string case
            verifiableCredential: wvcs.map((wrapped) => wrapped.original),
        };
        result.warnings = this.formatNotInfo(ConstraintUtils_1.Status.WARN);
        result.errors = this.formatNotInfo(ConstraintUtils_1.Status.ERROR);
        this._client.assertPresentationSubmission();
        if ((_a = this._client.presentationSubmission) === null || _a === void 0 ? void 0 : _a.descriptor_map.length) {
            this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map.filter((v) => v !== undefined);
            result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
        }
        if (this._client.generatePresentationSubmission) {
            this.updatePresentationSubmissionPathToVpPath(result.value);
        }
        result.verifiableCredential = this._client.wrappedVcs.map((wrapped) => wrapped.original);
        result.areRequiredCredentialsPresent = ((_c = (_b = result.value) === null || _b === void 0 ? void 0 : _b.descriptor_map) === null || _c === void 0 ? void 0 : _c.length) ? ConstraintUtils_1.Status.INFO : ConstraintUtils_1.Status.ERROR;
        return result;
    }
    evaluatePresentations(pd, wvps, opts) {
        var _a, _b, _c;
        // If submission is provided as input, we match the presentations against the submission. In this case the submission MUST be valid
        if (opts === null || opts === void 0 ? void 0 : opts.presentationSubmission) {
            return this.evaluatePresentationsAgainstSubmission(pd, wvps, opts.presentationSubmission, opts);
        }
        const wrappedPresentations = Array.isArray(wvps) ? wvps : [wvps];
        const allWvcs = wrappedPresentations.reduce((all, wvp) => [...all, ...wvp.vcs], []);
        const result = {
            areRequiredCredentialsPresent: ConstraintUtils_1.Status.INFO,
            presentation: Array.isArray(wvps) ? wvps.map((wvp) => wvp.original) : wvps.original,
            errors: [],
            warnings: [],
        };
        this._client.evaluate(pd, allWvcs, opts);
        result.warnings = this.formatNotInfo(ConstraintUtils_1.Status.WARN);
        result.errors = this.formatNotInfo(ConstraintUtils_1.Status.ERROR);
        this._client.assertPresentationSubmission();
        if ((_a = this._client.presentationSubmission) === null || _a === void 0 ? void 0 : _a.descriptor_map.length) {
            this._client.presentationSubmission.descriptor_map = this._client.presentationSubmission.descriptor_map.filter((v) => v !== undefined);
            result.value = JSON.parse(JSON.stringify(this._client.presentationSubmission));
        }
        const useExternalSubmission = (opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) !== undefined
            ? opts.presentationSubmissionLocation === signing_1.PresentationSubmissionLocation.EXTERNAL
            : Array.isArray(wvps);
        if (this._client.generatePresentationSubmission && result.value && useExternalSubmission) {
            // we map the descriptors of the generated submisison to take into account the nexted values
            result.value.descriptor_map = result.value.descriptor_map.map((descriptor) => {
                const [wvcResult] = utils_1.JsonPathUtils.extractInputField(allWvcs, [descriptor.path]);
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
        result.areRequiredCredentialsPresent = ((_c = (_b = result.value) === null || _b === void 0 ? void 0 : _b.descriptor_map) === null || _c === void 0 ? void 0 : _c.length) ? ConstraintUtils_1.Status.INFO : ConstraintUtils_1.Status.ERROR;
        return result;
    }
    extractWrappedVcFromWrappedVp(descriptor, descriptorIndex, wvp) {
        // Decoded won't work for sd-jwt or jwt?!?!
        const [vcResult] = utils_1.JsonPathUtils.extractInputField(wvp.decoded, [descriptor.path]);
        if (!vcResult) {
            return {
                error: {
                    status: ConstraintUtils_1.Status.ERROR,
                    tag: 'SubmissionPathNotFound',
                    message: `Unable to extract path ${descriptor.path} for submission.descriptor_path[${descriptorIndex}] from verifiable presentation`,
                },
                wvc: undefined,
            };
        }
        // Find the wrapped VC based on the original VC
        const originalVc = vcResult.value;
        const wvc = wvp.vcs.find((wvc) => ssi_types_1.CredentialMapper.areOriginalVerifiableCredentialsEqual(wvc.original, originalVc));
        if (!wvc) {
            return {
                error: {
                    status: ConstraintUtils_1.Status.ERROR,
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const result = {
            areRequiredCredentialsPresent: ConstraintUtils_1.Status.INFO,
            presentation: Array.isArray(wvps) ? wvps.map((wvp) => wvp.original) : wvps.original,
            errors: [],
            warnings: [],
            value: submission,
        };
        // If only a single VP is passed that is not w3c and no presentationSubmissionLocation, we set the default location to presentation. Otherwise we assume it's external
        const presentationSubmissionLocation = (_a = opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) !== null && _a !== void 0 ? _a : (Array.isArray(wvps) || !ssi_types_1.CredentialMapper.isW3cPresentation(wvps.presentation)
            ? signing_1.PresentationSubmissionLocation.EXTERNAL
            : signing_1.PresentationSubmissionLocation.PRESENTATION);
        // We loop over all the descriptors in the submission
        for (const descriptorIndex in submission.descriptor_map) {
            const descriptor = submission.descriptor_map[descriptorIndex];
            let vp;
            let vc;
            let vcPath;
            if (presentationSubmissionLocation === signing_1.PresentationSubmissionLocation.EXTERNAL) {
                // Extract the VP from the wrapped VPs
                const [vpResult] = utils_1.JsonPathUtils.extractInputField(wvps, [descriptor.path]);
                if (!vpResult) {
                    result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
                    (_b = result.errors) === null || _b === void 0 ? void 0 : _b.push({
                        status: ConstraintUtils_1.Status.ERROR,
                        tag: 'SubmissionPathNotFound',
                        message: `Unable to extract path ${descriptor.path} for submission.descriptor_path[${descriptorIndex}] from presentation(s)`,
                    });
                    continue;
                }
                vp = vpResult.value;
                vcPath = `presentation ${descriptor.path}`;
                if (vp.format !== descriptor.format) {
                    result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
                    (_c = result.errors) === null || _c === void 0 ? void 0 : _c.push({
                        status: ConstraintUtils_1.Status.ERROR,
                        tag: 'SubmissionFormatNoMatch',
                        message: `VP at path ${descriptor.path} has format ${vp.format}, while submission.descriptor_path[${descriptorIndex}] has format ${descriptor.format}`,
                    });
                    continue;
                }
                if (descriptor.path_nested) {
                    const extractionResult = this.extractWrappedVcFromWrappedVp(descriptor.path_nested, descriptorIndex, vp);
                    if (extractionResult.error) {
                        result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
                        (_d = result.errors) === null || _d === void 0 ? void 0 : _d.push(extractionResult.error);
                        continue;
                    }
                    vc = extractionResult.wvc;
                    vcPath += ` with nested credential ${descriptor.path_nested.path}`;
                }
                else if (descriptor.format === 'vc+sd-jwt') {
                    vc = vp.vcs[0];
                }
                else {
                    result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
                    (_e = result.errors) === null || _e === void 0 ? void 0 : _e.push({
                        status: ConstraintUtils_1.Status.ERROR,
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
                    result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
                    (_f = result.errors) === null || _f === void 0 ? void 0 : _f.push(extractionResult.error);
                    continue;
                }
                vc = extractionResult.wvc;
            }
            // TODO: we should probably add support for holder dids in the kb-jwt of an SD-JWT. We can extract this from the
            // `wrappedPresentation.original.compactKbJwt`, but as HAIP doesn't use dids, we'll leave it for now.
            const holderDIDs = ssi_types_1.CredentialMapper.isW3cPresentation(vp.presentation) && vp.presentation.holder ? [vp.presentation.holder] : [];
            // Get the presentation definition only for this descriptor, so we can evaluate it separately
            const pdForDescriptor = this.internalPresentationDefinitionForDescriptor(pd, descriptor.id);
            // Reset the client on each iteration.
            this._client = new evaluationClient_1.EvaluationClient();
            this._client.evaluate(pdForDescriptor, [vc], Object.assign(Object.assign({}, opts), { holderDIDs, presentationSubmission: undefined, generatePresentationSubmission: undefined }));
            if (this._client.presentationSubmission.descriptor_map.length !== 1) {
                const submissionDescriptor = `submission.descriptor_map[${descriptorIndex}]`;
                result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
                (_g = result.errors) === null || _g === void 0 ? void 0 : _g.push(...this.formatNotInfo(ConstraintUtils_1.Status.ERROR, submissionDescriptor, vcPath));
                (_h = result.warnings) === null || _h === void 0 ? void 0 : _h.push(...this.formatNotInfo(ConstraintUtils_1.Status.WARN, submissionDescriptor, vcPath));
            }
        }
        // Output submission is same as input presentation submission, it's just that if it doesn't match, we return Error.
        const submissionAgainstDefinitionResult = this.validateIfSubmissionSatisfiesDefinition(pd, submission);
        if (!submissionAgainstDefinitionResult.doesSubmissionSatisfyDefinition) {
            (_j = result.errors) === null || _j === void 0 ? void 0 : _j.push({
                status: ConstraintUtils_1.Status.ERROR,
                tag: 'SubmissionDoesNotSatisfyDefinition',
                // TODO: it would be nice to add the nested errors here for beter understanding WHY the submission
                // does not satisfy the definition, as we have that info, but we can only include one message here
                message: submissionAgainstDefinitionResult.error,
            });
            result.areRequiredCredentialsPresent = ConstraintUtils_1.Status.ERROR;
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
            maxRequiredMatches: submissionRequirement.rule === pex_models_1.Rules.Pick ? submissionRequirement.max : undefined,
            minRequiredMatches: submissionRequirement.rule === pex_models_1.Rules.Pick ? submissionRequirement.min : undefined,
            errors: [],
        };
        // Populate from_nested requirements
        if (submissionRequirement.from_nested) {
            const nestedResults = submissionRequirement.from_nested.map((nestedSubmissionRequirement, index) => this.checkIfSubmissionSatisfiesSubmissionRequirement(pd, submission, nestedSubmissionRequirement, `${submissionRequirementName}.from_nested[${index}]`));
            result.totalRequiredMatches = submissionRequirement.rule === pex_models_1.Rules.All ? submissionRequirement.from_nested.length : submissionRequirement.count;
            result.totalMatches = nestedResults.filter((n) => n.isSubmissionRequirementSatisfied).length;
            result.nested = nestedResults;
        }
        // Populate from requirements
        if (submissionRequirement.from) {
            const inputDescriptorsForGroup = pd.input_descriptors.filter((descriptor) => { var _a; return (_a = descriptor.group) === null || _a === void 0 ? void 0 : _a.includes(submissionRequirement.from); });
            const descriptorIdsInSubmission = submission.descriptor_map.map((descriptor) => descriptor.id);
            const inputDescriptorsInSubmission = inputDescriptorsForGroup.filter((inputDescriptor) => descriptorIdsInSubmission.includes(inputDescriptor.id));
            result.totalMatches = inputDescriptorsInSubmission.length;
            result.totalRequiredMatches = submissionRequirement.rule === pex_models_1.Rules.All ? inputDescriptorsForGroup.length : submissionRequirement.count;
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
        if (pd instanceof types_1.InternalPresentationDefinitionV2) {
            const inputDescriptorIndex = pd.input_descriptors.findIndex((i) => i.id === descriptorId);
            return new types_1.InternalPresentationDefinitionV2(pd.id, [pd.input_descriptors[inputDescriptorIndex]], pd.format, pd.frame, pd.name, pd.purpose, 
            // we ignore submission requirements as we're verifying a single input descriptor here
            undefined);
        }
        else if (pd instanceof types_1.InternalPresentationDefinitionV1) {
            const inputDescriptorIndex = pd.input_descriptors.findIndex((i) => i.id === descriptorId);
            return new types_1.InternalPresentationDefinitionV1(pd.id, [pd.input_descriptors[inputDescriptorIndex]], pd.format, pd.name, pd.purpose, 
            // we ignore submission requirements as we're verifying a single input descriptor here
            undefined);
        }
        throw new Error('Unrecognized presentation definition instance');
    }
    formatNotInfo(status, descriptorPath, vcPath) {
        return this._client.results
            .filter((result) => result.status === status)
            .map((x) => {
            const _vcPath = vcPath !== null && vcPath !== void 0 ? vcPath : `$.verifiableCredential${x.verifiable_credential_path.substring(1)}`;
            const _descriptorPath = descriptorPath !== null && descriptorPath !== void 0 ? descriptorPath : x.input_descriptor_path;
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
            const marked = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.payload.group && result.status !== ConstraintUtils_1.Status.ERROR);
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
            if ((opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) === signing_1.PresentationSubmissionLocation.EXTERNAL) {
                this.updatePresentationSubmissionToExternal();
            }
            return this._client.presentationSubmission;
        }
        const marked = this._client.results.filter((result) => result.evaluator === 'MarkForSubmissionEvaluation' && result.status !== ConstraintUtils_1.Status.ERROR);
        const updatedIndexes = this.matchUserSelectedVcs(marked, vcs);
        this.updatePresentationSubmission(updatedIndexes[1]);
        this.updatePresentationSubmissionPathToVpPath();
        if ((opts === null || opts === void 0 ? void 0 : opts.presentationSubmissionLocation) === signing_1.PresentationSubmissionLocation.EXTERNAL) {
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
        var _a;
        const descriptors = (_a = presentationSubmission === null || presentationSubmission === void 0 ? void 0 : presentationSubmission.descriptor_map) !== null && _a !== void 0 ? _a : this._client.presentationSubmission.descriptor_map;
        const updatedDescriptors = descriptors.map((d) => this.updateDescriptorToExternal(d));
        if (presentationSubmission) {
            return Object.assign(Object.assign({}, presentationSubmission), { descriptor_map: updatedDescriptors });
        }
        this._client.presentationSubmission.descriptor_map = updatedDescriptors;
        return this._client.presentationSubmission;
    }
    updateDescriptorToExternal(descriptor, { vpIndex, vcIndex, } = {}) {
        if (descriptor.path_nested) {
            return descriptor;
        }
        const { nestedCredentialPath, vpFormat } = (0, formatMap_1.getVpFormatForVcFormat)(descriptor.format);
        const newDescriptor = Object.assign(Object.assign({}, descriptor), { format: vpFormat, path: vpIndex !== undefined ? `$[${vpIndex}]` : '$' });
        if (nestedCredentialPath) {
            newDescriptor.path_nested = Object.assign(Object.assign({}, descriptor), { path: vcIndex !== undefined
                    ? `${nestedCredentialPath}[${vcIndex}]`
                    : descriptor.path.replace('$.verifiableCredential', nestedCredentialPath).replace('$[', `${nestedCredentialPath}[`) });
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
                if (sr.rule === pex_models_1.Rules.All) {
                    const [count, matched] = this.countMatchingInputDescriptors(sr, marked);
                    if (count !== (groupCount.get(sr.from) || 0)) {
                        throw Error(`Not all input descriptors are members of group ${sr.from}`);
                    }
                    total++;
                    result.push(...matched);
                }
                else if (sr.rule === pex_models_1.Rules.Pick) {
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
        var _a;
        if (selectResults) {
            (_a = selectResults.verifiableCredential) === null || _a === void 0 ? void 0 : _a.forEach((selectableCredential) => {
                const foundIndex = wrappedVcs.findIndex((wrappedVc) => ssi_types_1.CredentialMapper.areOriginalVerifiableCredentialsEqual(wrappedVc.original, selectableCredential));
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
            return ConstraintUtils_1.Status.ERROR;
        }
        // collect child statuses
        const childStatuses = matchSubmissionRequirements.map((m) => this.determineSubmissionRequirementStatus(presentationDefinition, m));
        // decide status based on child statuses and parent's rule
        if (!parentMsr) {
            if (childStatuses.includes(ConstraintUtils_1.Status.ERROR)) {
                return ConstraintUtils_1.Status.ERROR;
            }
            else if (childStatuses.includes(ConstraintUtils_1.Status.WARN)) {
                return ConstraintUtils_1.Status.WARN;
            }
            else {
                return ConstraintUtils_1.Status.INFO;
            }
        }
        else {
            if (parentMsr.rule === pex_models_1.Rules.All && childStatuses.includes(ConstraintUtils_1.Status.ERROR)) {
                return ConstraintUtils_1.Status.ERROR;
            }
            const nonErrStatCount = childStatuses.filter((status) => status !== ConstraintUtils_1.Status.ERROR).length;
            if (parentMsr.count) {
                return parentMsr.count > nonErrStatCount ? ConstraintUtils_1.Status.ERROR : parentMsr.count < nonErrStatCount ? ConstraintUtils_1.Status.WARN : ConstraintUtils_1.Status.INFO;
            }
            else {
                if (parentMsr.min && parentMsr.min > nonErrStatCount) {
                    return ConstraintUtils_1.Status.ERROR;
                }
                else if (parentMsr.max && parentMsr.max < nonErrStatCount) {
                    return ConstraintUtils_1.Status.WARN;
                }
            }
        }
        return ConstraintUtils_1.Status.INFO;
    }
    determineSubmissionRequirementStatus(pd, m) {
        if (m.from && m.from_nested) {
            throw new Error('Invalid submission_requirement object: MUST contain either a from or from_nested property.');
        }
        if (!m.from && !m.from_nested && m.vc_path.length !== 1) {
            return ConstraintUtils_1.Status.ERROR;
        }
        if (m.from) {
            const groupCount = this.countGroupIDs(pd.input_descriptors, m.from);
            switch (m.rule) {
                case pex_models_1.Rules.All:
                    // Ensure that all descriptors associated with `m.from` are satisfied.
                    return m.vc_path.length === groupCount ? ConstraintUtils_1.Status.INFO : ConstraintUtils_1.Status.WARN;
                case pex_models_1.Rules.Pick:
                    return this.getPickRuleStatus(m);
                default:
                    return ConstraintUtils_1.Status.ERROR;
            }
        }
        else if (m.from_nested) {
            return this.determineAreRequiredCredentialsPresent(pd, m.from_nested, m);
        }
        return ConstraintUtils_1.Status.INFO;
    }
    getPickRuleStatus(m) {
        if (m.vc_path.length === 0) {
            return ConstraintUtils_1.Status.ERROR;
        }
        if (m.count && m.vc_path.length !== m.count) {
            return m.vc_path.length > m.count ? ConstraintUtils_1.Status.WARN : ConstraintUtils_1.Status.ERROR;
        }
        if (m.min && m.vc_path.length < m.min) {
            return ConstraintUtils_1.Status.ERROR;
        }
        if (m.max && m.vc_path.length > m.max) {
            return ConstraintUtils_1.Status.WARN;
        }
        return ConstraintUtils_1.Status.INFO;
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
        descriptorMap === null || descriptorMap === void 0 ? void 0 : descriptorMap.forEach((d) => {
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
exports.EvaluationClientWrapper = EvaluationClientWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZhbHVhdGlvbkNsaWVudFdyYXBwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9saWIvZXZhbHVhdGlvbi9ldmFsdWF0aW9uQ2xpZW50V3JhcHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxzREFBeUQ7QUFDekQscURBQStIO0FBRS9ILG1EQU82QjtBQUU3Qix3REFBcUQ7QUFDckQsd0NBQTREO0FBQzVELG9DQU1rQjtBQUNsQixvQ0FBc0Q7QUFDdEQsa0RBQTREO0FBRTVELGlDQU9nQjtBQUNoQix5REFBc0Q7QUEwQnRELE1BQWEsdUJBQXVCO0lBR2xDO1FBQ0UsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG1DQUFnQixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVNLG1CQUFtQjtRQUN4QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVNLFVBQVUsQ0FDZixzQkFBdUQsRUFDdkQsNEJBQTJELEVBQzNELElBS0M7O1FBRUQsSUFBSSxhQUE0QixDQUFDO1FBRWpDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLDRCQUE0QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xGLE1BQU0sUUFBUSxHQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNqRSxNQUFNLE1BQU0sR0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFaEUsSUFBSSxzQkFBc0IsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1lBQ25ELE1BQU0sSUFBSSxHQUF5QixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQzVELENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxLQUFLLDZCQUE2QixJQUFJLE1BQU0sQ0FB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