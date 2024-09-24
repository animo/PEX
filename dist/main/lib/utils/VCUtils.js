"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterToRestrictedDIDs = exports.isRestrictedDID = exports.uniformDIDMethods = exports.definitionVersionDiscovery = exports.getIssuerString = exports.getSubjectIdsAsString = void 0;
const ssi_types_1 = require("@sphereon/ssi-types");
const types_1 = require("../types");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const validatePDv1_js_1 = __importDefault(require("../validation/validatePDv1.js"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const validatePDv2_js_1 = __importDefault(require("../validation/validatePDv2.js"));
const ObjectUtils_1 = require("./ObjectUtils");
const jsonPathUtils_1 = require("./jsonPathUtils");
function getSubjectIdsAsString(vc) {
    if (ssi_types_1.CredentialMapper.isSdJwtDecodedCredential(vc)) {
        // TODO: should we also handle `cnf` claim?
        return vc.signedPayload.sub ? [vc.signedPayload.sub] : [];
    }
    const subjects = Array.isArray(vc.credentialSubject) ? vc.credentialSubject : [vc.credentialSubject];
    return subjects.filter((s) => !!s.id).map((value) => value.id);
}
exports.getSubjectIdsAsString = getSubjectIdsAsString;
function getIssuerString(vc) {
    if (ssi_types_1.CredentialMapper.isSdJwtDecodedCredential(vc)) {
        return vc.signedPayload.iss;
    }
    return ObjectUtils_1.ObjectUtils.isString(vc.issuer) ? vc.issuer : vc.issuer.id;
}
exports.getIssuerString = getIssuerString;
function definitionVersionDiscovery(presentationDefinition) {
    const presentationDefinitionCopy = JSON.parse(JSON.stringify(presentationDefinition));
    jsonPathUtils_1.JsonPathUtils.changePropertyNameRecursively(presentationDefinitionCopy, '_const', 'const');
    jsonPathUtils_1.JsonPathUtils.changePropertyNameRecursively(presentationDefinitionCopy, '_enum', 'enum');
    const data = { presentation_definition: presentationDefinitionCopy };
    let result = (0, validatePDv2_js_1.default)(data);
    if (result) {
        return { version: types_1.PEVersion.v2 };
    }
    result = (0, validatePDv1_js_1.default)(data);
    if (result) {
        return { version: types_1.PEVersion.v1 };
    }
    return { error: 'This is not a valid PresentationDefinition' };
}
exports.definitionVersionDiscovery = definitionVersionDiscovery;
function uniformDIDMethods(dids, opts) {
    var _a;
    let result = (_a = dids === null || dids === void 0 ? void 0 : dids.map((did) => did.toLowerCase()).map((did) => (did.startsWith('did:') ? did : `did:${did}`))) !== null && _a !== void 0 ? _a : [];
    if (opts === null || opts === void 0 ? void 0 : opts.removePrefix) {
        const length = opts.removePrefix.endsWith(':') ? opts.removePrefix.length : opts.removePrefix.length + 1;
        result = result.map((did) => (did.startsWith(opts.removePrefix) ? did.substring(length) : did));
    }
    if (result.includes('did')) {
        // The string did denotes every DID method, hence we return an empty array, indicating all methods are supported
        return [];
    }
    return result;
}
exports.uniformDIDMethods = uniformDIDMethods;
function isRestrictedDID(DID, restrictToDIDMethods) {
    const methods = uniformDIDMethods(restrictToDIDMethods);
    return methods.length === 0 || methods.some((method) => DID.toLowerCase().startsWith(method));
}
exports.isRestrictedDID = isRestrictedDID;
function filterToRestrictedDIDs(DIDs, restrictToDIDMethods) {
    const methods = uniformDIDMethods(restrictToDIDMethods);
    if (methods.length === 0) {
        return DIDs;
    }
    return methods.flatMap((method) => DIDs.filter((DID) => DID.toLowerCase().startsWith(method)));
}
exports.filterToRestrictedDIDs = filterToRestrictedDIDs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVkNVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi91dGlscy9WQ1V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG1EQUFxSjtBQUVySixvQ0FBaUY7QUFDakYsNkRBQTZEO0FBQzdELGFBQWE7QUFDYixvRkFBeUQ7QUFDekQsNkRBQTZEO0FBQzdELGFBQWE7QUFDYixvRkFBeUQ7QUFFekQsK0NBQTRDO0FBQzVDLG1EQUFnRDtBQUVoRCxTQUFnQixxQkFBcUIsQ0FBQyxFQUFrRDtJQUN0RixJQUFJLDRCQUFnQixDQUFDLHdCQUF3QixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDbEQsMkNBQTJDO1FBQzNDLE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzVELENBQUM7SUFFRCxNQUFNLFFBQVEsR0FBOEMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ2hKLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQWEsQ0FBQztBQUM3RSxDQUFDO0FBUkQsc0RBUUM7QUFFRCxTQUFnQixlQUFlLENBQUMsRUFBa0Q7SUFDaEYsSUFBSSw0QkFBZ0IsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFH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