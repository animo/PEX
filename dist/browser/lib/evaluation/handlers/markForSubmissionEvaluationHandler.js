"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkForSubmissionEvaluationHandler = exports.elligibleInputDescriptorsForWrappedVc = void 0;
const jsonpath_1 = require("@astronautlabs/jsonpath");
const ConstraintUtils_1 = require("../../ConstraintUtils");
const Messages_1 = __importDefault(require("../../types/Messages"));
const abstractEvaluationHandler_1 = require("./abstractEvaluationHandler");
function elligibleInputDescriptorsForWrappedVc(inputDescriptors, vcIndex, results) {
    return inputDescriptors
        .map((inputDescriptor, inputDescriptorIndex) => {
        const matchingResults = results.filter(({ verifiable_credential_path, input_descriptor_path }) => verifiable_credential_path === `$[${vcIndex}]` && input_descriptor_path === `$.input_descriptors[${inputDescriptorIndex}]`);
        const hasError = matchingResults.some((result) => result.status === ConstraintUtils_1.Status.ERROR);
        const hasInfo = matchingResults.some((result) => result.status === ConstraintUtils_1.Status.INFO);
        if (hasInfo && !hasError) {
            return {
                inputDescriptor,
                inputDescriptorIndex,
            };
        }
        return undefined;
    })
        .filter((value) => value !== undefined);
}
exports.elligibleInputDescriptorsForWrappedVc = elligibleInputDescriptorsForWrappedVc;
class MarkForSubmissionEvaluationHandler extends abstractEvaluationHandler_1.AbstractEvaluationHandler {
    constructor(client) {
        super(client);
    }
    getName() {
        return 'MarkForSubmissionEvaluation';
    }
    handle(pd, wrappedVcs) {
        const results = [...this.getResults()];
        const errors = results.filter((result) => result.status === ConstraintUtils_1.Status.ERROR);
        const infos = this.retrieveNoErrorStatus(results, errors);
        this.client.wrappedVcs = wrappedVcs;
        this.produceErrorResults(errors);
        this.produceSuccessResults(infos, pd);
    }
    retrieveNoErrorStatus(results, errors) {
        const info = results.filter((e) => e.status !== ConstraintUtils_1.Status.ERROR);
        return info.filter((a) => !errors.find((b) => a.input_descriptor_path === b.input_descriptor_path && a.verifiable_credential_path === b.verifiable_credential_path));
    }
    produceSuccessResults(infos, pd) {
        this.removeDuplicate(infos).forEach((info) => {
            const parsedPath = jsonpath_1.JSONPath.nodes(pd, info.input_descriptor_path);
            const group = parsedPath[0].value.group;
            this.getResults().push({
                input_descriptor_path: info.input_descriptor_path,
                verifiable_credential_path: info.verifiable_credential_path,
                evaluator: this.getName(),
                status: ConstraintUtils_1.Status.INFO,
                payload: { group },
                message: Messages_1.default.INPUT_CANDIDATE_IS_ELIGIBLE_FOR_PRESENTATION_SUBMISSION,
            });
        });
    }
    produceErrorResults(errors) {
        this.removeDuplicate(errors).forEach((error) => {
            const payload = Object.assign({}, error.payload);
            payload.evaluator = error.evaluator;
            this.getResults().push(Object.assign(Object.assign({}, error), { evaluator: this.getName(), message: Messages_1.default.INPUT_CANDIDATE_IS_NOT_ELIGIBLE_FOR_PRESENTATION_SUBMISSION, payload: payload }));
        });
    }
}
exports.MarkForSubmissionEvaluationHandler = MarkForSubmissionEvaluationHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya0ZvclN1Ym1pc3Npb25FdmFsdWF0aW9uSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYi9ldmFsdWF0aW9uL2hhbmRsZXJzL21hcmtGb3JTdWJtaXNzaW9uRXZhbHVhdGlvbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQXlEO0FBSXpELDJEQUErQztBQUUvQyxvRUFBK0M7QUFJL0MsMkVBQXdFO0FBRXhFLFNBQWdCLHFDQUFxQyxDQUNuRCxnQkFBOEQsRUFDOUQsT0FBZSxFQUNmLE9BQTZCO0lBRTdCLE9BQU8sZ0JBQWdCO1NBQ3BCLEdBQUcsQ0FBQyxDQUFDLGVBQWUsRUFBRSxvQkFBb0IsRUFBRSxFQUFFO1FBQzdDLE1BQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQ3BDLENBQUMsRUFBRSwwQkFBMEIsRUFBRSxxQkFBcUIsRUFBRSxFQUFFLEVBQUUsQ0FDeEQsMEJBQTBCLEtBQUssS0FBSyxPQUFPLEdBQUcsSUFBSSxxQkFBcUIsS0FBSyx1QkFBdUIsb0JBQW9CLEdBQUcsQ0FDN0gsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssd0JBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsRixNQUFNLE9BQU8sR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLHdCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFaEYsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN6QixPQUFPO2dCQUNMLGVBQWU7Z0JBQ2Ysb0JBQW9CO2FBQ3JCLENBQUM7UUFDSixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQyxDQUFDO1NBQ0QsTUFBTSxD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