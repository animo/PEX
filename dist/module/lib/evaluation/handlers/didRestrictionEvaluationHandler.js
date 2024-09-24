import { CredentialMapper } from '@sphereon/ssi-types';
import { Status } from '../../ConstraintUtils';
import PexMessages from '../../types/Messages';
import { isRestrictedDID } from '../../utils';
import { AbstractEvaluationHandler } from './abstractEvaluationHandler';
export class DIDRestrictionEvaluationHandler extends AbstractEvaluationHandler {
    constructor(client) {
        super(client);
    }
    getName() {
        return 'DIDRestrictionEvaluation';
    }
    handle(pd, wrappedVcs) {
        pd.input_descriptors.forEach((_inputDescriptor, index) => {
            wrappedVcs.forEach((wvc, vcIndex) => {
                const issuerId = this.getIssuerIdFromWrappedVerifiableCredential(wvc);
                if (!this.client.hasRestrictToDIDMethods() ||
                    !issuerId ||
                    isRestrictedDID(issuerId, this.client.restrictToDIDMethods) ||
                    !issuerId.toLowerCase().startsWith('did:')) {
                    this.getResults().push(this.generateSuccessResult(index, `$[${vcIndex}]`, wvc, `${issuerId} is allowed`));
                }
                else {
                    this.getResults().push(this.generateErrorResult(index, `$[${vcIndex}]`, wvc));
                }
            });
        });
        this.updatePresentationSubmission(pd);
    }
    getIssuerIdFromWrappedVerifiableCredential(wrappedVc) {
        if (CredentialMapper.isW3cCredential(wrappedVc.credential)) {
            return typeof wrappedVc.credential.issuer === 'object' ? wrappedVc.credential.issuer.id : wrappedVc.credential.issuer;
        }
        else if (CredentialMapper.isSdJwtDecodedCredential(wrappedVc.credential)) {
            return wrappedVc.credential.decodedPayload.iss;
        }
        else if (CredentialMapper.isWrappedMdocCredential(wrappedVc)) {
            if (typeof wrappedVc.decoded === 'object' && wrappedVc.decoded.iss !== undefined) {
                return wrappedVc.decoded.iss;
            }
            throw new Error('cannot get issuer from the supplied mdoc credential');
        }
        throw new Error('Unsupported credential type');
    }
    generateErrorResult(idIdx, vcPath, wvc) {
        return {
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            evaluator: this.getName(),
            status: Status.ERROR,
            message: PexMessages.FORMAT_RESTRICTION_DIDNT_PASS,
            verifiable_credential_path: vcPath,
            payload: {
                format: wvc.format,
            },
        };
    }
    generateSuccessResult(idIdx, vcPath, wvc, message) {
        return {
            input_descriptor_path: `$.input_descriptors[${idIdx}]`,
            evaluator: this.getName(),
            status: Status.INFO,
            message: message ?? PexMessages.FORMAT_RESTRICTION_PASSED,
            verifiable_credential_path: vcPath,
            payload: {
                format: wvc.format,
            },
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlkUmVzdHJpY3Rpb25FdmFsdWF0aW9uSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2xpYi9ldmFsdWF0aW9uL2hhbmRsZXJzL2RpZFJlc3RyaWN0aW9uRXZhbHVhdGlvbkhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUErQixNQUFNLHFCQUFxQixDQUFDO0FBRXBGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUUvQyxPQUFPLFdBQVcsTUFBTSxzQkFBc0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSTlDLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRXhFLE1BQU0sT0FBTywrQkFBZ0MsU0FBUSx5QkFBeUI7SUFDNUUsWUFBWSxNQUF3QjtRQUNsQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEIsQ0FBQztJQUVNLE9BQU87UUFDWixPQUFPLDBCQUEwQixDQUFDO0lBQ3BDLENBQUM7SUFFTSxNQUFNLENBQUMsRUFBbUMsRUFBRSxVQUF5QztRQUN6RixFQUEwRSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDLGdCQUFnQixFQUFFLEtBQUssRUFBRSxFQUFFO1lBQ2hJLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFnQyxFQUFFLE9BQWUsRUFBRSxFQUFFO2dCQUN2RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsMENBQTBDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3RFLElBQ0UsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFO29CQUN0QyxDQUFDLFFBQVE7b0JBQ1QsZUFBZSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO29CQUMzRCxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVB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