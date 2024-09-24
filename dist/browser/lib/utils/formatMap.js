"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVpFormatForVcFormat = void 0;
function getVpFormatForVcFormat(vcFormat) {
    if (vcFormat in vcVpFormatMap) {
        const vpFormat = vcVpFormatMap[vcFormat];
        let nestedCredentialPath = undefined;
        if (vpFormat === 'di_vp' || vpFormat === 'ldp_vp') {
            nestedCredentialPath = '$.verifiableCredential';
        }
        else if (vpFormat === 'jwt_vp' || vpFormat === 'jwt_vp_json') {
            nestedCredentialPath = '$.vp.verifiableCredential';
        }
        return {
            vpFormat,
            nestedCredentialPath,
        };
    }
    throw new Error(`Unrecognized vc format ${vcFormat}`);
}
exports.getVpFormatForVcFormat = getVpFormatForVcFormat;
const vcVpFormatMap = {
    di_vc: 'di_vp',
    jwt_vc_json: 'jwt_vp_json',
    ldp_vc: 'ldp_vp',
    jwt_vc: 'jwt_vp',
    'vc+sd-jwt': 'vc+sd-jwt',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0TWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGliL3V0aWxzL2Zvcm1hdE1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxTQUFnQixzQkFBc0IsQ0FBQyxRQUFnQjtJQUNyRCxJQUFJLFFBQVEsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUM5QixNQUFNLFFBQVEsR0FBRyxhQUFhLENBQUMsUUFBc0MsQ0FBQyxDQUFDO1FBRXZFLElBQUksb0JBQW9CLEdBQXVCLFNBQVMsQ0FBQztRQUN6RCxJQUFJLFFBQVEsS0FBSyxPQUFPLElBQUksUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ2xELG9CQUFvQixHQUFHLHdCQUF3QixDQUFDO1FBQ2xELENBQUM7YUFBTSxJQUFJLFFBQVEsS0FBSyxRQUFRLElBQUksUUFBUSxLQUFLLGFBQWEsRUFBRSxDQUFDO1lBQy9ELG9CQUFvQixHQUFHLDJCQUEyQixDQUFDO1FBQ3JELENBQUM7UUFFRCxPQUFPO1lBQ0wsUUFBUTtZQUNSLG9CQUFvQjtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQWxCRCx3REFrQkM7QUFFRCxNQUFNLGFBQWEsR0FBRztJQUNwQixLQUFLLEVBQUUsT0FBTztJQUNkLFdBQVcsRUFBRSxhQUFhO0lBQzFCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFdBQVcsRUFBRSxXQUFXO0NBQ2hCLENBQUMifQ==