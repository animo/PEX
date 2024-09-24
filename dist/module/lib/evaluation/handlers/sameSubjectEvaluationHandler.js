import { JSONPath as jp } from '@astronautlabs/jsonpath';
import { Optionality } from '@sphereon/pex-models';
import { Status } from '../../ConstraintUtils';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
export class SameSubjectEvaluationHandler extends AbstractEvaluationHandler {
    fieldIds;
    sameSubject;
    messages;
    constructor(client) {
        super(client);
        this.fieldIds = [];
        this.sameSubject = [];
        this.messages = new Map();
        this.messages.set(Status.INFO, 'The field ids requiring the same subject to belong to same subject');
        this.messages.set(Status.WARN, 'The field ids preferring the same subject to belong to same subject');
        this.messages.set(Status.ERROR, 'The fields ids not belong to the same subject');
    }
    getName() {
        return 'SameSubjectEvaluation';
    }
    handle(pd, wrappedVcs) {
        const sameSubjectInDesc = this.mapSameSubjectFieldIdsToInputDescriptors(pd);
        const handlerCheckResults = this.mapCredentialsToResultObjecs(wrappedVcs, sameSubjectInDesc);
        const fieldIdOccurrencesCount = this.countSameSubjectOccurrences(sameSubjectInDesc, handlerCheckResults);
        this.generateErrorResults(fieldIdOccurrencesCount, handlerCheckResults);
        this.updatePresentationSubmission(pd);
    }
    mapSameSubjectFieldIdsToInputDescriptors(pd) {
        this.fieldIds.push(...jp.nodes(pd, '$..fields[*].id'));
        this.sameSubject.push(...jp.nodes(pd, '$..same_subject[*]'));
        const results = [];
        this.fieldIds.forEach((f) => {
            const sameSubject = this.sameSubject.find((ss) => ss.value.field_id.includes(f.value));
            if (sameSubject) {
                results.push([f, sameSubject]);
            }
        });
        return results;
    }
    generateErrorResults(fieldIdOccurrencesCount, handlerCheckResults) {
        fieldIdOccurrencesCount.forEach((v, k) => {
            const results = handlerCheckResults.filter((r) => k === r.payload.fieldIdSet).map((r) => r.payload.credentialSubject.id);
            if (results.length !== v || new Set(results).size !== 1) {
                handlerCheckResults.forEach((v, i, arr) => {
                    if (v.payload.fieldIdSet === k) {
                        v.status = Status.ERROR;
                        v.message = this.messages.get(Status.ERROR);
                        arr[i] = v;
                    }
                });
            }
        });
        this.client.results.push(...handlerCheckResults);
    }
    countSameSubjectOccurrences(sameSubjectInDesc, handlerCheckResults) {
        const fieldIdOccurrencesCount = new Map();
        sameSubjectInDesc.forEach((s) => {
            const result = handlerCheckResults.filter((c) => s[1].value.field_id === c.payload.fieldIdSet);
            if (result) {
                if (fieldIdOccurrencesCount.has(s[1].value.field_id) && fieldIdOccurrencesCount.get(s[1].value.field_id)) {
                    fieldIdOccurrencesCount.set(s[1].value.field_id, fieldIdOccurrencesCount.get(s[1].value.field_id) + 1);
                }
                else {
                    fieldIdOccurrencesCount.set(s[1].value.field_id, 1);
                }
            }
        });
        return fieldIdOccurrencesCount;
    }
    mapCredentialsToResultObjecs(wrappedVcs, results) {
        const subjects = [
            ...jp.nodes(wrappedVcs.map((wvc) => wvc.credential), '$..credentialSubject'),
        ];
        const handlerCheckResults = [];
        subjects.forEach((s) => {
            const result = results.find((id) => jp.query(s.value, `$..${id[0].value}`).length !== 0);
            if (result && result[1].value.directive === Optionality.Required) {
                handlerCheckResults.push({
                    input_descriptor_path: jp.stringify(result[0].path.slice(0, 3)),
                    status: Status.INFO,
                    evaluator: this.getName(),
                    payload: { fieldIdSet: result[1].value.field_id, credentialSubject: s.value },
                    message: this.messages.get(Status.INFO),
                    verifiable_credential_path: jp.stringify(s.path.slice(0, 2)),
                });
            }
            else if (result && result[1].value.directive === Optionality.Preferred) {
                handlerCheckResults.push({
                    input_descriptor_path: jp.stringify(result[0].path.slice(0, 3)),
                    status: Status.WARN,
                    evaluator: this.getName(),
                    payload: { fieldIdSet: result[1].value.field_id, credentialSubject: s.value },
                    message: this.messages.get(Status.WARN),
                    verifiable_credential_path: jp.stringify(s.path.slice(0, 2)),
                });
            }
        });
        return handlerCheckResults;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtZVN1YmplY3RFdmFsdWF0aW9uSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYi9ldmFsdWF0aW9uL2hhbmRsZXJzL3NhbWVTdWJqZWN0RXZhbHVhdGlvbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsSUFBSSxFQUFFLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLEVBQWlCLFdBQVcsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR2xFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUsvQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUV4RSxNQUFNLE9BQU8sNEJBQTZCLFNBQVEseUJBQXlCO0lBQ2pFLFFBQVEsQ0FBNkM7SUFDckQsV0FBVyxDQUFvRDtJQUUvRCxRQUFRLENBQXNCO0lBRXRDLFlBQVksTUFBd0I7UUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFFdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUMxQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLG9FQUFvRSxDQUFDLENBQUM7UUFDckcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxxRUFBcUUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsK0NBQStDLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU8sdUJBQXVCLENBQUM7SUFDakMsQ0FBQztJQUVNLE1BQU0sQ0FB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