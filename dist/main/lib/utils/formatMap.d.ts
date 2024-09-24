export declare function getVpFormatForVcFormat(vcFormat: string): {
    vpFormat: "vc+sd-jwt" | "jwt_vp" | "ldp_vp" | "jwt_vp_json" | "di_vp";
    nestedCredentialPath: string | undefined;
};
