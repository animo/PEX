export function getVpFormatForVcFormat(vcFormat) {
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
const vcVpFormatMap = {
    di_vc: 'di_vp',
    jwt_vc_json: 'jwt_vp_json',
    ldp_vc: 'ldp_vp',
    jwt_vc: 'jwt_vp',
    'vc+sd-jwt': 'vc+sd-jwt',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0TWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vbGliL3V0aWxzL2Zvcm1hdE1hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFVBQVUsc0JBQXNCLENBQUMsUUFBZ0I7SUFDckQsSUFBSSxRQUFRLElBQUksYUFBYSxFQUFFLENBQUM7UUFDOUIsTUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQXNDLENBQUMsQ0FBQztRQUV2RSxJQUFJLG9CQUFvQixHQUF1QixTQUFTLENBQUM7UUFDekQsSUFBSSxRQUFRLEtBQUssT0FBTyxJQUFJLFFBQVEsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUNsRCxvQkFBb0IsR0FBRyx3QkFBd0IsQ0FBQztRQUNsRCxDQUFDO2FBQU0sSUFBSSxRQUFRLEtBQUssUUFBUSxJQUFJLFFBQVEsS0FBSyxhQUFhLEVBQUUsQ0FBQztZQUMvRCxvQkFBb0IsR0FBRywyQkFBMkIsQ0FBQztRQUNyRCxDQUFDO1FBRUQsT0FBTztZQUNMLFFBQVE7WUFDUixvQkFBb0I7U0FDckIsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRCxNQUFNLGFBQWEsR0FBRztJQUNwQixLQUFLLEVBQUUsT0FBTztJQUNkLFdBQVcsRUFBRSxhQUFhO0lBQzFCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLFdBQVcsRUFBRSxXQUFXO0NBQ2hCLENBQUMifQ==