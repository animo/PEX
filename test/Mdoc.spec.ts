import { PresentationDefinitionV2 } from '@sphereon/pex-models';

import { PEX, Status, Validated } from '../lib';
import { SubmissionRequirementMatchType } from '../lib/evaluation/core';

const mdocBase64UrlUniversityPresentation =
  'uQADZ3ZlcnNpb25jMS4waWRvY3VtZW50c4GjZ2RvY1R5cGVxb3JnLmV1LnVuaXZlcnNpdHlsaXNzdWVyU2lnbmVkuQACam5hbWVTcGFjZXOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xgtgYWGGkaGRpZ2VzdElEAnFlbGVtZW50SWRlbnRpZmllcmRuYW1lbGVsZW1lbnRWYWx1ZWhKb2huIERvZWZyYW5kb21YIIuEphk77s0bXihDeBaimLTkcvLiJqsCKSo3tEftHVki2BhYY6RoZGlnZXN0SUQBcWVsZW1lbnRJZGVudGlmaWVyZmRlZ3JlZWxlbGVtZW50VmFsdWVoYmFjaGVsb3JmcmFuZG9tWCBH98DJ4r94UG2yNbsLZ1B7NSYnIVYGuxpXEiwYdUhNgWppc3N1ZXJBdXRohEOhASaiBFgxekRuYWVzQjJnaG84SzI2NEhKR3pUNTE3ZkppODd3bXBFZUhSMWtZZEhkbWhDVU5LVBghWQEdMIIBGTCBwKADAgECAhBCZzpgLQsohwuPNrzSWLO-MAoGCCqGSM49BAMCMA0xCzAJBgNVBAYTAkRFMB4XDTI1MDMyMTE2NDQ1MVoXDTI2MDMyMTE2NDQ1MVowDTELMAkGA1UEBhMCREUwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASNV_Mf0FV0iC7SzNTA5zgXCfC_rq3gCs7rqKud79IkCvn6C1WhCLw5gPZjI2rc7mF46OwbqRp5koyf_3aHGEnrowIwADAKBggqhkjOPQQDAgNIADBFAiEA7bMlBEmIylfP12weYgnQqIHIiFBoDO3mMEnEel0-AygCICmIajWWkTN6UrluC3OfC62zayQDSQfX5s3jh-IW3S-fWQHy2BhZAe25AAZndmVyc2lvbmMxLjBvZGlnZXN0QWxnb3JpdGhtZ1NIQS0yNTZsdmFsdWVEaWdlc3RzoXdldS5ldXJvcGEuZWMuZXVkaS5waWQuMaQAWCDvsiNWXK-tHPGOTLDgR8afXfVCrQ95HOn7_uRx_FPGHwFYIOQE5rMTS9bo5wI3E1viym-_Y6ypH-QeYX1U42cTkQKuAlggNqV4dHdmepWi1wAP0my7LeY7op2S6G67m6K-a7BjHykDWCCIX4-GTHAUTuPS3nFe050ITFbQ0s3IgB6767uUwcrJsW1kZXZpY2VLZXlJbmZvuQABaWRldmljZUtleaQBAiABIVggavjAzu1bN-FTSAgMHL2qYoSS4ZAZoudgU-06exSzSqMiWCDS4n8la6wEhCYvo-g_2EDiqk9wZ8sJrQIUAyc8V8HMnmdkb2NUeXBlcW9yZy5ldS51bml2ZXJzaXR5bHZhbGlkaXR5SW5mb7kABGZzaWduZWTAdDIwMDAtMDEtMDFUMDA6MDA6MDBaaXZhbGlkRnJvbcB0MjAwMC0wMS0wMVQwMDowMDowMFpqdmFsaWRVbnRpbMB0MjEwMC0wMS0wMVQwMDowMDowMFpuZXhwZWN0ZWRVcGRhdGXAdDIwNTAtMDEtMDFUMDA6MDA6MDBaWEAmSMnzcF3mLVa4MOTgaKwKqatO071di7AmRPdmrJvRcfl-HsujBu607lydDRX3IrTXyhhW9_0lVMH0EtI2WvE4bGRldmljZVNpZ25lZLkAAmpuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRouQABb2RldmljZVNpZ25hdHVyZYRDoQEmoPZYQPyCA4CVeChNKgUQonPoBOXWKqPbRT0qf7yZnVuKd7QTw-L3QoJrfsjGO5xmX_3m5SkEpoI9d8RCf9_YYlPlyodmc3RhdHVzAA';

const mdocBase64UrlUniversity =
  'uQACam5hbWVTcGFjZXOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xhNgYWGikaGRpZ2VzdElEAHFlbGVtZW50SWRlbnRpZmllcmp1bml2ZXJzaXR5bGVsZW1lbnRWYWx1ZWlpbm5zYnJ1Y2tmcmFuZG9tWCB6lqhZEjJIUpNwJAF7A0Cb3lApuRkDnQoKnQMEuJBGftgYWGOkaGRpZ2VzdElEAXFlbGVtZW50SWRlbnRpZmllcmZkZWdyZWVsZWxlbWVudFZhbHVlaGJhY2hlbG9yZnJhbmRvbVggR_fAyeK_eFBtsjW7C2dQezUmJyFWBrsaVxIsGHVITYHYGFhhpGhkaWdlc3RJRAJxZWxlbWVudElkZW50aWZpZXJkbmFtZWxlbGVtZW50VmFsdWVoSm9obiBEb2VmcmFuZG9tWCCLhKYZO-7NG14oQ3gWopi05HLy4iarAikqN7RH7R1ZItgYWGGkaGRpZ2VzdElEA3FlbGVtZW50SWRlbnRpZmllcmNub3RsZWxlbWVudFZhbHVlaWRpc2Nsb3NlZGZyYW5kb21YIEkNDJs-PrkxQ63_EInTz0J0rkk4nBD30W36pGLGKdgPamlzc3VlckF1dGiEQ6EBJqIEWDF6RG5hZXNCMmdobzhLMjY0SEpHelQ1MTdmSmk4N3dtcEVlSFIxa1lkSGRtaENVTktUGCFZAR0wggEZMIHAoAMCAQICEEJnOmAtCyiHC482vNJYs74wCgYIKoZIzj0EAwIwDTELMAkGA1UEBhMCREUwHhcNMjUwMzIxMTY0NDUxWhcNMjYwMzIxMTY0NDUxWjANMQswCQYDVQQGEwJERTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABI1X8x_QVXSILtLM1MDnOBcJ8L-ureAKzuuoq53v0iQK-foLVaEIvDmA9mMjatzuYXjo7BupGnmSjJ__docYSeujAjAAMAoGCCqGSM49BAMCA0gAMEUCIQDtsyUESYjKV8_XbB5iCdCogciIUGgM7eYwScR6XT4DKAIgKYhqNZaRM3pSuW4Lc58LrbNrJANJB9fmzeOH4hbdL59ZAfLYGFkB7bkABmd2ZXJzaW9uYzEuMG9kaWdlc3RBbGdvcml0aG1nU0hBLTI1Nmx2YWx1ZURpZ2VzdHOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xpABYIO-yI1Zcr60c8Y5MsOBHxp9d9UKtD3kc6fv-5HH8U8YfAVgg5ATmsxNL1ujnAjcTW-LKb79jrKkf5B5hfVTjZxORAq4CWCA2pXh0d2Z6laLXAA_SbLst5juinZLobrubor5rsGMfKQNYIIhfj4ZMcBRO49LecV7TnQhMVtDSzciAHrvru5TBysmxbWRldmljZUtleUluZm-5AAFpZGV2aWNlS2V5pAECIAEhWCBq-MDO7Vs34VNICAwcvapihJLhkBmi52BT7Tp7FLNKoyJYINLifyVrrASEJi-j6D_YQOKqT3BnywmtAhQDJzxXwcyeZ2RvY1R5cGVxb3JnLmV1LnVuaXZlcnNpdHlsdmFsaWRpdHlJbmZvuQAEZnNpZ25lZMB0MjAwMC0wMS0wMVQwMDowMDowMFppdmFsaWRGcm9twHQyMDAwLTAxLTAxVDAwOjAwOjAwWmp2YWxpZFVudGlswHQyMTAwLTAxLTAxVDAwOjAwOjAwWm5leHBlY3RlZFVwZGF0ZcB0MjA1MC0wMS0wMVQwMDowMDowMFpYQCZIyfNwXeYtVrgw5OBorAqpq07TvV2LsCZE92asm9Fx-X4ey6MG7rTuXJ0NFfcitNfKGFb3_SVUwfQS0jZa8Tg';

const sdJwt =
  'eyJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFZERTQSIsImtpZCI6IiN6Nk1rcnpRUEJyNHB5cUM3NzZLS3RyejEzU2NoTTVlUFBic3N1UHVRWmI1dDR1S1EifQ.eyJ2Y3QiOiJPcGVuQmFkZ2VDcmVkZW50aWFsIiwiZGVncmVlIjoiYmFjaGVsb3IiLCJjbmYiOnsia2lkIjoiZGlkOmtleTp6Nk1rcEdSNGdzNFJjM1pwaDR2ajh3Um5qbkF4Z0FQU3hjUjhNQVZLdXRXc3BRemMjejZNa3BHUjRnczRSYzNacGg0dmo4d1Juam5BeGdBUFN4Y1I4TUFWS3V0V3NwUXpjIn0sImlzcyI6ImRpZDprZXk6ejZNa3J6UVBCcjRweXFDNzc2S0t0cnoxM1NjaE01ZVBQYnNzdVB1UVpiNXQ0dUtRIiwiaWF0IjoxNzMwMjkzMTIzLCJfc2QiOlsiVEtuSUJwVGp3ZmpVdFZra3ZBUWNrSDZxSEZFbmFsb1ZtZUF6UmlzZlNNNCIsInRLTFAxWFM3Vm55YkJET2ZWV3hTMVliNU5TTjhlMVBDMHFqRnBnbjd5XzgiXSwiX3NkX2FsZyI6InNoYS0yNTYifQ.GhgxbTA_cLZ6-enpOrTRqhIoZEzJoJMSQeutQdhcIayhiem9yd8i0x-h6NhQbN1NrNPwi-JQhy5lpNopVia_AA~WyI3NDU5ODc1MjgyODgyMTY5MjY3NTk1MTgiLCJ1bml2ZXJzaXR5IiwiaW5uc2JydWNrIl0~eyJ0eXAiOiJrYitqd3QiLCJhbGciOiJFZERTQSJ9.eyJpYXQiOjE3MzAyOTMxMjYsIm5vbmNlIjoiOTExNTE4Nzc5ODY4MjIzNzcxOTk1NTA1IiwiYXVkIjoibG9jYWxob3N0OjEyMzQiLCJzZF9oYXNoIjoiRmFlcWFCVFZ1TXhEVUJvVHlwUnhycE9wTkRZZUtDQjV0a1VsNEpWdjJ4dyJ9.mLFA6FA04KVQljy9i8OMuOsarWNOyGZYltkVIUMMWoXXKnbKT5eoPNCigVs0g5y9ucgdQBuMLKxCgQx4SRwsBQ';

const pex = new PEX({});

function getPresentationDefinitionV2(withSdJwtInputDescriptor = false): PresentationDefinitionV2 {
  const pd: PresentationDefinitionV2 = {
    id: 'mDL-sample-req',
    input_descriptors: [
      {
        id: 'org.eu.university',
        format: {
          mso_mdoc: {
            alg: ['ES256', 'ES384', 'ES512', 'EdDSA', 'ESB256', 'ESB320', 'ESB384', 'ESB512'],
          },
        },
        constraints: {
          fields: [
            {
              path: ["$['eu.europa.ec.eudi.pid.1']['name']"],
              intent_to_retain: false,
            },
            {
              path: ["$['eu.europa.ec.eudi.pid.1']['degree']"],
              intent_to_retain: false,
            },
          ],
          limit_disclosure: 'required',
        },
      },
    ],
  };

  if (withSdJwtInputDescriptor) {
    pd.input_descriptors.push({
      id: 'OpenBadgeCredentialDescriptor',
      format: {
        'vc+sd-jwt': {
          'sd-jwt_alg_values': ['EdDSA'],
        },
      },
      constraints: {
        limit_disclosure: 'required',
        fields: [
          {
            path: ['$.vct'],
            filter: {
              type: 'string',
              const: 'OpenBadgeCredential',
            },
          },
          {
            path: ['$.university'],
          },
        ],
      },
    });
  }

  return pd;
}

describe('evaluate mdoc', () => {
  it('Evaluate presentationDefinition with mso_mdoc format', () => {
    const pd = getPresentationDefinitionV2();
    const result: Validated = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('selectFrom with mso_mdoc format encoded', () => {
    const result = pex.selectFrom(getPresentationDefinitionV2(), [mdocBase64UrlUniversity]);
    expect(result.errors?.length).toEqual(0);
    expect(result.matches).toEqual([
      {
        areRequiredCredentialsPresent: 'info',
        vc_path: ['$.verifiableCredential[0]'],
        type: SubmissionRequirementMatchType.InputDescriptor,
        id: 'org.eu.university',
      },
    ]);
    expect(result.verifiableCredential).toEqual([mdocBase64UrlUniversity]);
    expect(result.areRequiredCredentialsPresent).toBe('info');
  });

  it('selectFrom with mso_mdoc format where input descriptor id does not match doctype', () => {
    const pd = getPresentationDefinitionV2();
    pd.input_descriptors[0].id = 'random';
    const result = pex.selectFrom(pd, [mdocBase64UrlUniversity]);
    expect(result.errors?.length).toEqual(2);
    expect(result.errors).toEqual([
      {
        message:
          "the doctype of the mdoc credential didn't match the input descriptor id (ISO 18013-7).: $.input_descriptors[0]: $.verifiableCredential[0]",
        status: 'error',
        tag: 'FormatRestrictionEvaluation',
      },
      {
        message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]',
        status: 'error',
        tag: 'MarkForSubmissionEvaluation',
      },
    ]);
    expect(result.areRequiredCredentialsPresent).toBe('error');
  });

  it('selectFrom with both mso_mdoc and vc+sd-jwt format encoded', () => {
    const result = pex.selectFrom(getPresentationDefinitionV2(true), [sdJwt, mdocBase64UrlUniversity]);
    expect(result.errors?.length).toEqual(0);
    expect(result.matches).toEqual([
      {
        areRequiredCredentialsPresent: 'info',
        vc_path: ['$.verifiableCredential[0]'],
        type: SubmissionRequirementMatchType.InputDescriptor,
        id: 'org.eu.university',
      },
      {
        id: 'OpenBadgeCredentialDescriptor',
        areRequiredCredentialsPresent: 'info',
        type: SubmissionRequirementMatchType.InputDescriptor,
        vc_path: ['$.verifiableCredential[1]'],
      },
    ]);
    expect(result.verifiableCredential).toEqual([mdocBase64UrlUniversity, sdJwt]);
    expect(result.areRequiredCredentialsPresent).toBe('info');
  });

  it('evaluatePresentation with mso_mdoc format', async () => {
    const presentationDefinition = getPresentationDefinitionV2();
    const submission = {
      definition_id: presentationDefinition.id,
      descriptor_map: [
        {
          format: 'mso_mdoc',
          id: 'org.eu.university',
          path: '$[0]',
        },
      ],
      id: '2d0b0be7-9d91-4760-ad58-f204f9f39de7',
    };
    const evaluateResults = pex.evaluatePresentation(presentationDefinition, [mdocBase64UrlUniversityPresentation], {
      presentationSubmission: submission,
    });

    expect(evaluateResults).toEqual({
      presentations: [mdocBase64UrlUniversityPresentation],
      areRequiredCredentialsPresent: Status.INFO,
      warnings: [],
      errors: [],
      value: submission,
    });
  });

  it('evaluatePresentation with mso_mdoc format generating a submission', async () => {
    const presentationDefinition = getPresentationDefinitionV2();
    const evaluateResults = pex.evaluatePresentation(presentationDefinition, [mdocBase64UrlUniversityPresentation], {
      generatePresentationSubmission: true,
    });

    expect(evaluateResults).toEqual({
      presentations: [mdocBase64UrlUniversityPresentation],
      areRequiredCredentialsPresent: Status.INFO,
      warnings: [],
      errors: [],
      value: {
        definition_id: presentationDefinition.id,
        descriptor_map: [
          {
            format: 'mso_mdoc',
            id: 'org.eu.university',
            path: '$[0]',
          },
        ],
        id: expect.any(String),
      },
    });
  });

  it('evaluatePresentation with both mso_mdoc and vc+sd-jwt format', async () => {
    const presentationDefinition = getPresentationDefinitionV2(true);
    const submission = {
      definition_id: presentationDefinition.id,
      descriptor_map: [
        {
          format: 'mso_mdoc',
          id: 'org.eu.university',
          path: '$[0]',
        },
        {
          format: 'vc+sd-jwt',
          id: 'OpenBadgeCredentialDescriptor',
          path: '$[1]',
        },
      ],
      id: '2d0b0be7-9d91-4760-ad58-f204f9f39de7',
    };
    const evaluateResults = pex.evaluatePresentation(presentationDefinition, [mdocBase64UrlUniversityPresentation, sdJwt], {
      presentationSubmission: submission,
    });

    expect(evaluateResults).toEqual({
      presentations: [mdocBase64UrlUniversityPresentation, sdJwt],
      areRequiredCredentialsPresent: Status.INFO,
      warnings: [],
      errors: [],
      value: submission,
    });
  });

  test('handles response with multiple mdocs in a single device response with submission', async () => {
    const result = pex.evaluatePresentation(
      {
        id: 'random',
        input_descriptors: [
          {
            id: 'org.iso.18013.5.1.mDL',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['org.iso.18013.5.1']['given_name']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
          {
            id: 'eu.europa.ec.eudi.pid.1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['family_name']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
        ],
      },
      'o2d2ZXJzaW9uYzEuMGlkb2N1bWVudHOCo2dkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiam5hbWVTcGFjZXOhcW9yZy5pc28uMTgwMTMuNS4xgtgYWFOkaGRpZ2VzdElEE2ZyYW5kb21Q4UfVHznACC2C95ORlY-G23FlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYdgYWFqkaGRpZ2VzdElEGCdmcmFuZG9tUJWFQuwvUIV2n8J8njlewT9xZWxlbWVudElkZW50aWZpZXJrZmFtaWx5X25hbWVsZWxlbWVudFZhbHVlak11c3Rlcm1hbm5qaXNzdWVyQXV0aIRDoQEmoRghWQJDMIICPzCCAcSgAwIBAgIUDFLxB8mHnMFjy_IGSQH-yXzZ8UUwCgYIKoZIzj0EAwMwJjEXMBUGA1UEAwwOUGFuYXNvbmljIElBQ0ExCzAJBgNVBAYTAkpQMB4XDTI1MDIxNTAyMzgzOVoXDTI1MDYxNzAyMzgzOFowJDEVMBMGA1UEAwwMUGFuYXNvbmljIERTMQswCQYDVQQGEwJKUDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABIKTkv6Cg6Z8WkEnBx3o6tcMaW7Tr9KHEfwclneUKT7pqCcEu4PjGaB8nvEp8SbbEgXLq4FWdFbpbQoSvT3d3mqjgdEwgc4wHwYDVR0jBBgwFoAUhfPpHuV4jk-ko8iG6U03USkGLzAwFQYDVR0lAQH_BAswCQYHKIGMXQUBAjA5BgNVHR8EMjAwMC6gLKAqhihodHRwczovL21kb2MucGFuYXNvbmljLmdvdi9DUkxzL21kb2MuY3JsMB0GA1UdDgQWBBSGkfSUDkZ4U4BjZUYX1S9SrxmBnTAOBgNVHQ8BAf8EBAMCB4AwKgYDVR0SBCMwIYYfaHR0cHM6Ly9tZG9jLnBhbmFzb25pYy5nb3YvbWRvYzAKBggqhkjOPQQDAwNpADBmAjEArspBUJqejhoIVYZu-H8XaVpkiXXlVjlefLBnzLgZm6-4Pb8yCCFt-l0sCjvHO0UUAjEAvvK76jTWNZYX_p1smPXtGeGVt5oRiZ3f-S2wvEDQpSGzjaZX4zI9Etq2FbFLvHuZWQzU2BhZDM-nZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2Z2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbHZhbHVlRGlnZXN0c6Jxb3JnLmlzby4xODAxMy41LjG4LBgnWCB6saB7hlK2EeykYwjZGmyZsbdi5El6gh0gHL2YDezDAxNYIIKn9I9zTq9V8BOGb9N7DscNj534Gd8qseZVYLVYz4drGCxYINVQxuaQuzPN-DYGnb8v4a-4YXU3CcPZ-sgZYj2PxfHhDVgg9AxPlVfbmoeQXJOpU4SmVc1w27XMxborcpsHohpDslwAWCBwK_m_a0mIG8x8efhS3UNmWFG7gKDeyy-SlK_PA5CUVRJYIDpsOCtM-lP72Bbz19ERDqibf356ftB5jAKmFiCd4vrPGC5YIPF4uWsnZwRYzGsPn2oUZLsVraecQSPbpSWzx5JdVxz1GDtYIJs610ro1jUN5X5TZHI1PwGo050OFmw-x4eGfJxeo-WAD1gg31NhmF3nyWGnoW3hSOTCrLh1bfjirYyAlhCxTz5HbrgYG1gg6SzB16Th8-rRgaM5jArWOFDB_eVvC3v6Bh5mEJZeC-kYH1ggXypmMFtYpjKCnA5OVRztyxfQV1Nz7T9kvSugBY-KR44OWCBhi3ZNcZF2Q-hWIYismtEu-j-KrywqXeLe5n-l4mOlvRgqWCBAxW0XyWXAg5v6N7ZVYWsQPFwGMhD6kLRGO93K6tpOKhVYICazH32afpmDNGDNQH5iJes0gN67mQqVP7Ko5j1ehvTeGC9YIL7CuUPZt71T0JZnALPLrzdRSzKNrierzBEGJgGCm64XDFgga8iElmC8dqeucT0FIVFCuS4eGMAtwCMUWGsWfgN8KpIYHFggX4EYOnP28xJtaJCz5qcEfZhcMx3WpKpVnuhCnxtWVNoIWCC-plqpjzCq-71Ovy3BpqdqQ6GwJNXHg8iB0rolKOuEbRgdWCC8baoAP7csHk3222_PlURDDK6L7GAWOcDXB1fqz0z2cQpYILX_GTVUyeVgcAerf7CsWvSPjkXzibmyXVHBi1Ovyva7EVggYcDim6qvlq_g7073r_UsN0SYLJLjSiro0K4qBZik0WYYMlggOEylD7okqt6RTW8JT0-oSF6DhWj_X1Rrpl4VJfhagPUYNlgg_MEm1PVnYAINigvP6t9-IW-D8p0tzJNd4tAg-gXvHVwYJlgg17sc9ZGMsizR8m-r9eie0th_59WvSpDRZs4Xd3wv-yoYLVggKtrNGpXZ3lZ2f5TbUKsg_I6UcKFVu_LPUmI0oAsaaN4YGVggTK0MC7h3_ks2gde6ZCo31rFXLY8syyhEZ3giaWm3qMILWCBduv8FuJVrwYyS3tnYybqQOt3p-vNjE4oroL--qMGzeBdYIAbOjSU-LslPy0L2QEXT2CmxLcL8vU9wJeIBolgtcKoPGB5YIDGsgmliLTlkl0IZyLMMk8siFr1oVxw6ztmOT1EhisGTGDNYIClO5x0QDZ99Ss9ZNVQd4EueLQEc8g4rXLJ0ZNdsd9lhGCRYIDk4GaNf8EiZrTxN5sfJll-EV8I-8Iios3rqH96cXXe9FFgg6rD_L4VPk-LsZBFAHgxgiawN9LQ-A1jUckYvi5jATKoYPVggOW7Xmsv8rhNOVS9wmCKp2-KOI0W39LTU1OQshcBBaq0YMFggCN-g2RcrlHkbbX9cJO5ivkc2Odyd7gPp3pDOSp3QKD8YK1gg8lX4aTc65OpTceQvZjOLcqGK1-FCp2KA4r8MQ9AQDgwYI1ggpGXcJLMh4PZD7x6dHxXEvYU8xWdYSIE4TMu8qxWHfOsYMVggxuqRPatXWacS3z-I0A-0mM2t7MYmEae7vnrhqOY6Lw4YGlggtfi_zYUi3IpP-UliESnUn99W724Dd1GKDWm8o-98ND0HWCAmbtsNzfSant4AC6TCBtS1kz3pFsCArSAcd7PJiRZUIRgiWCBE-bAQ357qRW5gLX96wzXPfB7edhPZIz-O18753o_p5gFYIA2mZSXR2tIrIaQCMN3x7kQL41aad93gmXQW8k3B26a3GDVYILDSmFT55xF5295NSoJ0eLp6CQvsLtL2oM3ccno4a7riGD5YIHdPsX_8oWkA99oyXmVeE8ZLIVZ1YQQwjWPyhS3TgpLVGBhYIDE5202b_1yOSBvKt06nsXaDCKsz6c2M2CAYa_W3CeGxd29yZy5pc28uMTgwMTMuNS4xLmFhbXZhswVYIA6cntt603dG-w91OSsv-j7z_Y4-JQANB85np9qAJdOPGClYIB5HnT6GvzsIotPPovUGEG48Zap4C1ecEGoTr6FLqmcCGDhYIEbEwf07GrRyd_a6Uph3rICMwoYqTchSlTcBcaoNy8uSGDxYIEl_56EYAUKgKd4RV8let7P5MQwDQ09KNAdkhJbIpfCQCVggsKK_ysVODzOyrUwRF15OenIFt622oUieCuDbXeeCJ3EWWCDrf_oKvuXuzJ8jcZo_67rZW2fphfpKAc9Tfzu2xwxdeBggWCBaTwR_K3vLUwezXWi54xNVAEbuUpmEo3-BE3gf6Y6wwBg3WCBkqBFWNStfElNNkscqIcc11lABlutHWNgwfF8dCixDJQZYINeqesfYofU5NHBqgL8b92dY4BxX1IAcKboJUQLDgjqlGChYILwZn-_93OybOROl2V2ArfcwERaSVQXju_Rl2Wps-qOBA1gg4ehfNKqnuRYJ1gW-1D5gOF9rYLlPR1kGpBRhH4tZQacYIVggL2xWR964Dyp1rgYSVhb8XPeH9V41T3DcG8vFj8mpyMUEWCC1H53yNkBNRujdChlNvcdGarPFIa9TkeFadwyO3wYRsBg6WCCe9XbS07jad-QnUx4ET_z2afSIPPycJ4qhQUn28Q3izBg0WCCWOiwEyVYTMe6quGkTBNv1ULfh3Ymkq2fUKwtdrKvWVgJYIMzirj9xLIzRVBBd6m2S_D4djAOJvfgEkbGuT3a5Vy7lGCVYIA7NpE_RLoHArQEgS10Oxyb66q6fVYzCfnaK8hq4_XROGDlYINjnDBwlHFpd2jUQcN9gvF1x7wUTJ6o0sV6zSIPNMR99EFgg7gPO4i3qK_6Knqk8pGunyK9peWZ8dWoy3RAW5I_VNoltZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCD3Po2C1fy6lR42h5pgc3fpLkQ_0SjE3ut-Bf1HDA9hvSJYIFqsA8JUONmJo81dBTBq4YiEqw9yz_-ayiW9GUazOePLbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjE0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MTRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MTRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQPjIJvRz-3lsEeqyVAh_05W7H7ovOSAcusDIQcuQq0wO11KEU7Cz_6pQ49hKiZOmpU38Mfk3ee6EbwI1WAvU4lVsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WECIQA1r9B6cqQOVnDl9fVJwk5oRIZ62p7EoLWoKlyJDlZEDwjBt10y95K2OkW3mzNF2KLpBknRyX0KwZNRW_x_Go2dkb2NUeXBld2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xbGlzc3VlclNpZ25lZKJqbmFtZVNwYWNlc6F3ZXUuZXVyb3BhLmVjLmV1ZGkucGlkLjGC2BhYWqRoZGlnZXN0SUQYGmZyYW5kb21Q1YSWDmsS79W2Wc4yJWlZ3HFlbGVtZW50SWRlbnRpZmllcmtmYW1pbHlfbmFtZWxlbGVtZW50VmFsdWVqTXVzdGVybWFubtgYWFOkaGRpZ2VzdElECmZyYW5kb21QsrbGD64sRwj7_g_2g6fGVnFlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYWppc3N1ZXJBdXRohEOhASahGCFZAkMwggI_MIIBxKADAgECAhQMUvEHyYecwWPL8gZJAf7JfNnxRTAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIzODM5WhcNMjUwNjE3MDIzODM4WjAkMRUwEwYDVQQDDAxQYW5hc29uaWMgRFMxCzAJBgNVBAYTAkpQMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEgpOS_oKDpnxaQScHHejq1wxpbtOv0ocR_ByWd5QpPumoJwS7g-MZoHye8SnxJtsSBcurgVZ0VultChK9Pd3eaqOB0TCBzjAfBgNVHSMEGDAWgBSF8-ke5XiOT6SjyIbpTTdRKQYvMDAVBgNVHSUBAf8ECzAJBgcogYxdBQECMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIaR9JQORnhTgGNlRhfVL1KvGYGdMA4GA1UdDwEB_wQEAwIHgDAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMAoGCCqGSM49BAMDA2kAMGYCMQCuykFQmp6OGghVhm74fxdpWmSJdeVWOV58sGfMuBmbr7g9vzIIIW36XSwKO8c7RRQCMQC-8rvqNNY1lhf-nWyY9e0Z4ZW3mhGJnd_5LbC8QNClIbONplfjMj0S2rYVsUu8e5lZB7PYGFkHrqdndmVyc2lvbmMxLjBvZGlnZXN0QWxnb3JpdGhtZ1NIQS0yNTZnZG9jVHlwZXdldS5ldXJvcGEuZWMuZXVkaS5waWQuMWx2YWx1ZURpZ2VzdHOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xuBsYGlggpMCxCPLrqGLVEOvYM0IQHu6-rNwHfZwXGNLOIT0hlasKWCBaqh4DdCQ6qxSRZG79jmsheukZ77t-5hd9q7om6lZvqBgYWCDlbxr826w78LujTnFHCv-6B7OsOpPzvH-L--f3z81oRhFYIFqvcccf8kDiuByS0vvvuAj5Nsf7Zs-EOiUjjSWE9rp9GBlYIOYMba1OBnqKF8YALj3fnfKTP1qPt7lYPi1luwD-MquRFVggswNmRoOVnAoKBv6J2vLk27PYFIM3FzkRXHJJ2AUOjqIFWCBuaMIWwBqUJfCTsJce4rIYwRwozqrYXTI3jLkD-47itQFYIGKi0ZtMLhiUFfghwO8V4Z9UpaNFLpbmIzT4WQtPNuzRFlggesM-LYdOipSWHOjF13XhJums8c8McPZNf_xd8TJSUj8TWCBLIl1Ym8OAD_BLZKerpFwow391z-v75m7yfj2j5TUvRAdYILjg_INbPVxje4ZxeRFjROaIb_SJZDN44z4DQFZ5vB-9CFggo4SZsazSEAYGV6qvdjyCHyIrwo6EvSSdjPDeg3PCyWYOWCC723cUlQkKRgnEtGPqtLpQvWc9Latbn-DI77vblmIvRBdYIFUBLC0JDTbhcNzZgufFkKKwxSkib2z1spSbwPp5lCsqC1ggbg4a-ENrKt1_OCH8b49Bbu6Bk873VxD4G9Ct7dZI5HEPWCDvH91FS5Ue2V5b8N4w6-D1XV5WkbshtW_oCOckj5YwDAZYIPgG6o78Fg6_g3BuLoDA32yM1Z6lgVzOWZB1xuX3mv4SDVggnRpMJNGRuHAIDJMBgQCPoHON3ZTwtYy9zhbvDZ2bdvIMWCA32wgoYuiv6lSmWQFGBmF2UcgXusJCtZDMYxoEdbtVdgJYIFcRIfPZ5lyBAwpV5I6FOoTbQlatHgvYMGOaKMPyiSlAA1gg29GgABR8vXwjp6Z1EJaGUH5pQNOkVJXGdTGXJJLfEx8QWCCitLkmm1zVOL4dRKmZGZMcCemj8t-pP5jpiJ_g2XLdtglYIIUHgvXvZkGSn6cRxJbVAF4UlXO_lzD3DMtNwlBSuBWpBFggGSB9uF6Jd41SQtBb2N0AOwjKNqkelh8dmjX5--7X3f0AWCC2JfDKnjCG4kV7HYlKIfa1dsV65bZ7C8qEWl_jw13jXhJYIEVymRECA89Vrp1RDz8B2LtL__733vK7_TFlxy_pkZ2gFFggaV5smOmzn8nxXKdOJOZ_vDlnelzIA30TDyjsc7GcC4ttZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCBsGaolq6lxU1spYc6-9GuI-QxxTk8p0Y0kAPhxSKMF7iJYIBZ4LDxFG1GK1vI4DN8Or0wVOv--v3hvgJeWvXglS3fvbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjI0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MjRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MjRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQAD9O_jyPB16JTnfHzmcL9avHP2SE3aiZXNLhkMAtxtwsNhrewkLPyz7hxWpbdW8KmbUI19Z_K8bRbQRanxYzaRsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WEAbIUKrOTg0hHon6NklvLaIKeEZfCLf5NfGBeyPE4CTXbqxvUL4iPjCbdWWXli-QrKaTjiJgQLb-TlNuf-YVVTmZnN0YXR1cwA',
      {
        presentationSubmission: {
          definition_id: 'random',
          descriptor_map: [
            {
              format: 'mso_mdoc',
              id: 'eu.europa.ec.eudi.pid.1',
              path: '$',
            },
            {
              format: 'mso_mdoc',
              id: 'org.iso.18013.5.1.mDL',
              path: '$',
            },
          ],
          id: 'something',
        },
      },
    );

    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  test('handles invalid response with multiple mdocs in a single device response with submission', async () => {
    const result = pex.evaluatePresentation(
      {
        id: 'random',
        input_descriptors: [
          {
            id: 'org.iso.18013.5.1.mDL',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['org.iso.18013.5.1']['given_name']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
          {
            id: 'eu.europa.ec.eudi.pid.1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['family_name2222']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
        ],
      },
      'o2d2ZXJzaW9uYzEuMGlkb2N1bWVudHOCo2dkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiam5hbWVTcGFjZXOhcW9yZy5pc28uMTgwMTMuNS4xgtgYWFOkaGRpZ2VzdElEE2ZyYW5kb21Q4UfVHznACC2C95ORlY-G23FlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYdgYWFqkaGRpZ2VzdElEGCdmcmFuZG9tUJWFQuwvUIV2n8J8njlewT9xZWxlbWVudElkZW50aWZpZXJrZmFtaWx5X25hbWVsZWxlbWVudFZhbHVlak11c3Rlcm1hbm5qaXNzdWVyQXV0aIRDoQEmoRghWQJDMIICPzCCAcSgAwIBAgIUDFLxB8mHnMFjy_IGSQH-yXzZ8UUwCgYIKoZIzj0EAwMwJjEXMBUGA1UEAwwOUGFuYXNvbmljIElBQ0ExCzAJBgNVBAYTAkpQMB4XDTI1MDIxNTAyMzgzOVoXDTI1MDYxNzAyMzgzOFowJDEVMBMGA1UEAwwMUGFuYXNvbmljIERTMQswCQYDVQQGEwJKUDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABIKTkv6Cg6Z8WkEnBx3o6tcMaW7Tr9KHEfwclneUKT7pqCcEu4PjGaB8nvEp8SbbEgXLq4FWdFbpbQoSvT3d3mqjgdEwgc4wHwYDVR0jBBgwFoAUhfPpHuV4jk-ko8iG6U03USkGLzAwFQYDVR0lAQH_BAswCQYHKIGMXQUBAjA5BgNVHR8EMjAwMC6gLKAqhihodHRwczovL21kb2MucGFuYXNvbmljLmdvdi9DUkxzL21kb2MuY3JsMB0GA1UdDgQWBBSGkfSUDkZ4U4BjZUYX1S9SrxmBnTAOBgNVHQ8BAf8EBAMCB4AwKgYDVR0SBCMwIYYfaHR0cHM6Ly9tZG9jLnBhbmFzb25pYy5nb3YvbWRvYzAKBggqhkjOPQQDAwNpADBmAjEArspBUJqejhoIVYZu-H8XaVpkiXXlVjlefLBnzLgZm6-4Pb8yCCFt-l0sCjvHO0UUAjEAvvK76jTWNZYX_p1smPXtGeGVt5oRiZ3f-S2wvEDQpSGzjaZX4zI9Etq2FbFLvHuZWQzU2BhZDM-nZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2Z2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbHZhbHVlRGlnZXN0c6Jxb3JnLmlzby4xODAxMy41LjG4LBgnWCB6saB7hlK2EeykYwjZGmyZsbdi5El6gh0gHL2YDezDAxNYIIKn9I9zTq9V8BOGb9N7DscNj534Gd8qseZVYLVYz4drGCxYINVQxuaQuzPN-DYGnb8v4a-4YXU3CcPZ-sgZYj2PxfHhDVgg9AxPlVfbmoeQXJOpU4SmVc1w27XMxborcpsHohpDslwAWCBwK_m_a0mIG8x8efhS3UNmWFG7gKDeyy-SlK_PA5CUVRJYIDpsOCtM-lP72Bbz19ERDqibf356ftB5jAKmFiCd4vrPGC5YIPF4uWsnZwRYzGsPn2oUZLsVraecQSPbpSWzx5JdVxz1GDtYIJs610ro1jUN5X5TZHI1PwGo050OFmw-x4eGfJxeo-WAD1gg31NhmF3nyWGnoW3hSOTCrLh1bfjirYyAlhCxTz5HbrgYG1gg6SzB16Th8-rRgaM5jArWOFDB_eVvC3v6Bh5mEJZeC-kYH1ggXypmMFtYpjKCnA5OVRztyxfQV1Nz7T9kvSugBY-KR44OWCBhi3ZNcZF2Q-hWIYismtEu-j-KrywqXeLe5n-l4mOlvRgqWCBAxW0XyWXAg5v6N7ZVYWsQPFwGMhD6kLRGO93K6tpOKhVYICazH32afpmDNGDNQH5iJes0gN67mQqVP7Ko5j1ehvTeGC9YIL7CuUPZt71T0JZnALPLrzdRSzKNrierzBEGJgGCm64XDFgga8iElmC8dqeucT0FIVFCuS4eGMAtwCMUWGsWfgN8KpIYHFggX4EYOnP28xJtaJCz5qcEfZhcMx3WpKpVnuhCnxtWVNoIWCC-plqpjzCq-71Ovy3BpqdqQ6GwJNXHg8iB0rolKOuEbRgdWCC8baoAP7csHk3222_PlURDDK6L7GAWOcDXB1fqz0z2cQpYILX_GTVUyeVgcAerf7CsWvSPjkXzibmyXVHBi1Ovyva7EVggYcDim6qvlq_g7073r_UsN0SYLJLjSiro0K4qBZik0WYYMlggOEylD7okqt6RTW8JT0-oSF6DhWj_X1Rrpl4VJfhagPUYNlgg_MEm1PVnYAINigvP6t9-IW-D8p0tzJNd4tAg-gXvHVwYJlgg17sc9ZGMsizR8m-r9eie0th_59WvSpDRZs4Xd3wv-yoYLVggKtrNGpXZ3lZ2f5TbUKsg_I6UcKFVu_LPUmI0oAsaaN4YGVggTK0MC7h3_ks2gde6ZCo31rFXLY8syyhEZ3giaWm3qMILWCBduv8FuJVrwYyS3tnYybqQOt3p-vNjE4oroL--qMGzeBdYIAbOjSU-LslPy0L2QEXT2CmxLcL8vU9wJeIBolgtcKoPGB5YIDGsgmliLTlkl0IZyLMMk8siFr1oVxw6ztmOT1EhisGTGDNYIClO5x0QDZ99Ss9ZNVQd4EueLQEc8g4rXLJ0ZNdsd9lhGCRYIDk4GaNf8EiZrTxN5sfJll-EV8I-8Iios3rqH96cXXe9FFgg6rD_L4VPk-LsZBFAHgxgiawN9LQ-A1jUckYvi5jATKoYPVggOW7Xmsv8rhNOVS9wmCKp2-KOI0W39LTU1OQshcBBaq0YMFggCN-g2RcrlHkbbX9cJO5ivkc2Odyd7gPp3pDOSp3QKD8YK1gg8lX4aTc65OpTceQvZjOLcqGK1-FCp2KA4r8MQ9AQDgwYI1ggpGXcJLMh4PZD7x6dHxXEvYU8xWdYSIE4TMu8qxWHfOsYMVggxuqRPatXWacS3z-I0A-0mM2t7MYmEae7vnrhqOY6Lw4YGlggtfi_zYUi3IpP-UliESnUn99W724Dd1GKDWm8o-98ND0HWCAmbtsNzfSant4AC6TCBtS1kz3pFsCArSAcd7PJiRZUIRgiWCBE-bAQ357qRW5gLX96wzXPfB7edhPZIz-O18753o_p5gFYIA2mZSXR2tIrIaQCMN3x7kQL41aad93gmXQW8k3B26a3GDVYILDSmFT55xF5295NSoJ0eLp6CQvsLtL2oM3ccno4a7riGD5YIHdPsX_8oWkA99oyXmVeE8ZLIVZ1YQQwjWPyhS3TgpLVGBhYIDE5202b_1yOSBvKt06nsXaDCKsz6c2M2CAYa_W3CeGxd29yZy5pc28uMTgwMTMuNS4xLmFhbXZhswVYIA6cntt603dG-w91OSsv-j7z_Y4-JQANB85np9qAJdOPGClYIB5HnT6GvzsIotPPovUGEG48Zap4C1ecEGoTr6FLqmcCGDhYIEbEwf07GrRyd_a6Uph3rICMwoYqTchSlTcBcaoNy8uSGDxYIEl_56EYAUKgKd4RV8let7P5MQwDQ09KNAdkhJbIpfCQCVggsKK_ysVODzOyrUwRF15OenIFt622oUieCuDbXeeCJ3EWWCDrf_oKvuXuzJ8jcZo_67rZW2fphfpKAc9Tfzu2xwxdeBggWCBaTwR_K3vLUwezXWi54xNVAEbuUpmEo3-BE3gf6Y6wwBg3WCBkqBFWNStfElNNkscqIcc11lABlutHWNgwfF8dCixDJQZYINeqesfYofU5NHBqgL8b92dY4BxX1IAcKboJUQLDgjqlGChYILwZn-_93OybOROl2V2ArfcwERaSVQXju_Rl2Wps-qOBA1gg4ehfNKqnuRYJ1gW-1D5gOF9rYLlPR1kGpBRhH4tZQacYIVggL2xWR964Dyp1rgYSVhb8XPeH9V41T3DcG8vFj8mpyMUEWCC1H53yNkBNRujdChlNvcdGarPFIa9TkeFadwyO3wYRsBg6WCCe9XbS07jad-QnUx4ET_z2afSIPPycJ4qhQUn28Q3izBg0WCCWOiwEyVYTMe6quGkTBNv1ULfh3Ymkq2fUKwtdrKvWVgJYIMzirj9xLIzRVBBd6m2S_D4djAOJvfgEkbGuT3a5Vy7lGCVYIA7NpE_RLoHArQEgS10Oxyb66q6fVYzCfnaK8hq4_XROGDlYINjnDBwlHFpd2jUQcN9gvF1x7wUTJ6o0sV6zSIPNMR99EFgg7gPO4i3qK_6Knqk8pGunyK9peWZ8dWoy3RAW5I_VNoltZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCD3Po2C1fy6lR42h5pgc3fpLkQ_0SjE3ut-Bf1HDA9hvSJYIFqsA8JUONmJo81dBTBq4YiEqw9yz_-ayiW9GUazOePLbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjE0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MTRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MTRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQPjIJvRz-3lsEeqyVAh_05W7H7ovOSAcusDIQcuQq0wO11KEU7Cz_6pQ49hKiZOmpU38Mfk3ee6EbwI1WAvU4lVsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WECIQA1r9B6cqQOVnDl9fVJwk5oRIZ62p7EoLWoKlyJDlZEDwjBt10y95K2OkW3mzNF2KLpBknRyX0KwZNRW_x_Go2dkb2NUeXBld2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xbGlzc3VlclNpZ25lZKJqbmFtZVNwYWNlc6F3ZXUuZXVyb3BhLmVjLmV1ZGkucGlkLjGC2BhYWqRoZGlnZXN0SUQYGmZyYW5kb21Q1YSWDmsS79W2Wc4yJWlZ3HFlbGVtZW50SWRlbnRpZmllcmtmYW1pbHlfbmFtZWxlbGVtZW50VmFsdWVqTXVzdGVybWFubtgYWFOkaGRpZ2VzdElECmZyYW5kb21QsrbGD64sRwj7_g_2g6fGVnFlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYWppc3N1ZXJBdXRohEOhASahGCFZAkMwggI_MIIBxKADAgECAhQMUvEHyYecwWPL8gZJAf7JfNnxRTAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIzODM5WhcNMjUwNjE3MDIzODM4WjAkMRUwEwYDVQQDDAxQYW5hc29uaWMgRFMxCzAJBgNVBAYTAkpQMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEgpOS_oKDpnxaQScHHejq1wxpbtOv0ocR_ByWd5QpPumoJwS7g-MZoHye8SnxJtsSBcurgVZ0VultChK9Pd3eaqOB0TCBzjAfBgNVHSMEGDAWgBSF8-ke5XiOT6SjyIbpTTdRKQYvMDAVBgNVHSUBAf8ECzAJBgcogYxdBQECMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIaR9JQORnhTgGNlRhfVL1KvGYGdMA4GA1UdDwEB_wQEAwIHgDAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMAoGCCqGSM49BAMDA2kAMGYCMQCuykFQmp6OGghVhm74fxdpWmSJdeVWOV58sGfMuBmbr7g9vzIIIW36XSwKO8c7RRQCMQC-8rvqNNY1lhf-nWyY9e0Z4ZW3mhGJnd_5LbC8QNClIbONplfjMj0S2rYVsUu8e5lZB7PYGFkHrqdndmVyc2lvbmMxLjBvZGlnZXN0QWxnb3JpdGhtZ1NIQS0yNTZnZG9jVHlwZXdldS5ldXJvcGEuZWMuZXVkaS5waWQuMWx2YWx1ZURpZ2VzdHOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xuBsYGlggpMCxCPLrqGLVEOvYM0IQHu6-rNwHfZwXGNLOIT0hlasKWCBaqh4DdCQ6qxSRZG79jmsheukZ77t-5hd9q7om6lZvqBgYWCDlbxr826w78LujTnFHCv-6B7OsOpPzvH-L--f3z81oRhFYIFqvcccf8kDiuByS0vvvuAj5Nsf7Zs-EOiUjjSWE9rp9GBlYIOYMba1OBnqKF8YALj3fnfKTP1qPt7lYPi1luwD-MquRFVggswNmRoOVnAoKBv6J2vLk27PYFIM3FzkRXHJJ2AUOjqIFWCBuaMIWwBqUJfCTsJce4rIYwRwozqrYXTI3jLkD-47itQFYIGKi0ZtMLhiUFfghwO8V4Z9UpaNFLpbmIzT4WQtPNuzRFlggesM-LYdOipSWHOjF13XhJums8c8McPZNf_xd8TJSUj8TWCBLIl1Ym8OAD_BLZKerpFwow391z-v75m7yfj2j5TUvRAdYILjg_INbPVxje4ZxeRFjROaIb_SJZDN44z4DQFZ5vB-9CFggo4SZsazSEAYGV6qvdjyCHyIrwo6EvSSdjPDeg3PCyWYOWCC723cUlQkKRgnEtGPqtLpQvWc9Latbn-DI77vblmIvRBdYIFUBLC0JDTbhcNzZgufFkKKwxSkib2z1spSbwPp5lCsqC1ggbg4a-ENrKt1_OCH8b49Bbu6Bk873VxD4G9Ct7dZI5HEPWCDvH91FS5Ue2V5b8N4w6-D1XV5WkbshtW_oCOckj5YwDAZYIPgG6o78Fg6_g3BuLoDA32yM1Z6lgVzOWZB1xuX3mv4SDVggnRpMJNGRuHAIDJMBgQCPoHON3ZTwtYy9zhbvDZ2bdvIMWCA32wgoYuiv6lSmWQFGBmF2UcgXusJCtZDMYxoEdbtVdgJYIFcRIfPZ5lyBAwpV5I6FOoTbQlatHgvYMGOaKMPyiSlAA1gg29GgABR8vXwjp6Z1EJaGUH5pQNOkVJXGdTGXJJLfEx8QWCCitLkmm1zVOL4dRKmZGZMcCemj8t-pP5jpiJ_g2XLdtglYIIUHgvXvZkGSn6cRxJbVAF4UlXO_lzD3DMtNwlBSuBWpBFggGSB9uF6Jd41SQtBb2N0AOwjKNqkelh8dmjX5--7X3f0AWCC2JfDKnjCG4kV7HYlKIfa1dsV65bZ7C8qEWl_jw13jXhJYIEVymRECA89Vrp1RDz8B2LtL__733vK7_TFlxy_pkZ2gFFggaV5smOmzn8nxXKdOJOZ_vDlnelzIA30TDyjsc7GcC4ttZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCBsGaolq6lxU1spYc6-9GuI-QxxTk8p0Y0kAPhxSKMF7iJYIBZ4LDxFG1GK1vI4DN8Or0wVOv--v3hvgJeWvXglS3fvbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjI0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MjRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MjRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQAD9O_jyPB16JTnfHzmcL9avHP2SE3aiZXNLhkMAtxtwsNhrewkLPyz7hxWpbdW8KmbUI19Z_K8bRbQRanxYzaRsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WEAbIUKrOTg0hHon6NklvLaIKeEZfCLf5NfGBeyPE4CTXbqxvUL4iPjCbdWWXli-QrKaTjiJgQLb-TlNuf-YVVTmZnN0YXR1cwA',
      {
        presentationSubmission: {
          definition_id: 'random',
          descriptor_map: [
            {
              format: 'mso_mdoc',
              id: 'eu.europa.ec.eudi.pid.1',
              path: '$',
            },
            {
              format: 'mso_mdoc',
              id: 'org.iso.18013.5.1.mDL',
              path: '$',
            },
          ],
          id: 'something',
        },
      },
    );
    expect(result.areRequiredCredentialsPresent).toEqual(Status.ERROR);
  });

  test('handles response with multiple mdocs in a single device response without submission', async () => {
    const result = pex.evaluatePresentation(
      {
        id: 'random',
        input_descriptors: [
          {
            id: 'org.iso.18013.5.1.mDL',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['org.iso.18013.5.1']['given_name']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
          {
            id: 'eu.europa.ec.eudi.pid.1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['family_name']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
        ],
      },
      'o2d2ZXJzaW9uYzEuMGlkb2N1bWVudHOCo2dkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiam5hbWVTcGFjZXOhcW9yZy5pc28uMTgwMTMuNS4xgtgYWFOkaGRpZ2VzdElEE2ZyYW5kb21Q4UfVHznACC2C95ORlY-G23FlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYdgYWFqkaGRpZ2VzdElEGCdmcmFuZG9tUJWFQuwvUIV2n8J8njlewT9xZWxlbWVudElkZW50aWZpZXJrZmFtaWx5X25hbWVsZWxlbWVudFZhbHVlak11c3Rlcm1hbm5qaXNzdWVyQXV0aIRDoQEmoRghWQJDMIICPzCCAcSgAwIBAgIUDFLxB8mHnMFjy_IGSQH-yXzZ8UUwCgYIKoZIzj0EAwMwJjEXMBUGA1UEAwwOUGFuYXNvbmljIElBQ0ExCzAJBgNVBAYTAkpQMB4XDTI1MDIxNTAyMzgzOVoXDTI1MDYxNzAyMzgzOFowJDEVMBMGA1UEAwwMUGFuYXNvbmljIERTMQswCQYDVQQGEwJKUDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABIKTkv6Cg6Z8WkEnBx3o6tcMaW7Tr9KHEfwclneUKT7pqCcEu4PjGaB8nvEp8SbbEgXLq4FWdFbpbQoSvT3d3mqjgdEwgc4wHwYDVR0jBBgwFoAUhfPpHuV4jk-ko8iG6U03USkGLzAwFQYDVR0lAQH_BAswCQYHKIGMXQUBAjA5BgNVHR8EMjAwMC6gLKAqhihodHRwczovL21kb2MucGFuYXNvbmljLmdvdi9DUkxzL21kb2MuY3JsMB0GA1UdDgQWBBSGkfSUDkZ4U4BjZUYX1S9SrxmBnTAOBgNVHQ8BAf8EBAMCB4AwKgYDVR0SBCMwIYYfaHR0cHM6Ly9tZG9jLnBhbmFzb25pYy5nb3YvbWRvYzAKBggqhkjOPQQDAwNpADBmAjEArspBUJqejhoIVYZu-H8XaVpkiXXlVjlefLBnzLgZm6-4Pb8yCCFt-l0sCjvHO0UUAjEAvvK76jTWNZYX_p1smPXtGeGVt5oRiZ3f-S2wvEDQpSGzjaZX4zI9Etq2FbFLvHuZWQzU2BhZDM-nZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2Z2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbHZhbHVlRGlnZXN0c6Jxb3JnLmlzby4xODAxMy41LjG4LBgnWCB6saB7hlK2EeykYwjZGmyZsbdi5El6gh0gHL2YDezDAxNYIIKn9I9zTq9V8BOGb9N7DscNj534Gd8qseZVYLVYz4drGCxYINVQxuaQuzPN-DYGnb8v4a-4YXU3CcPZ-sgZYj2PxfHhDVgg9AxPlVfbmoeQXJOpU4SmVc1w27XMxborcpsHohpDslwAWCBwK_m_a0mIG8x8efhS3UNmWFG7gKDeyy-SlK_PA5CUVRJYIDpsOCtM-lP72Bbz19ERDqibf356ftB5jAKmFiCd4vrPGC5YIPF4uWsnZwRYzGsPn2oUZLsVraecQSPbpSWzx5JdVxz1GDtYIJs610ro1jUN5X5TZHI1PwGo050OFmw-x4eGfJxeo-WAD1gg31NhmF3nyWGnoW3hSOTCrLh1bfjirYyAlhCxTz5HbrgYG1gg6SzB16Th8-rRgaM5jArWOFDB_eVvC3v6Bh5mEJZeC-kYH1ggXypmMFtYpjKCnA5OVRztyxfQV1Nz7T9kvSugBY-KR44OWCBhi3ZNcZF2Q-hWIYismtEu-j-KrywqXeLe5n-l4mOlvRgqWCBAxW0XyWXAg5v6N7ZVYWsQPFwGMhD6kLRGO93K6tpOKhVYICazH32afpmDNGDNQH5iJes0gN67mQqVP7Ko5j1ehvTeGC9YIL7CuUPZt71T0JZnALPLrzdRSzKNrierzBEGJgGCm64XDFgga8iElmC8dqeucT0FIVFCuS4eGMAtwCMUWGsWfgN8KpIYHFggX4EYOnP28xJtaJCz5qcEfZhcMx3WpKpVnuhCnxtWVNoIWCC-plqpjzCq-71Ovy3BpqdqQ6GwJNXHg8iB0rolKOuEbRgdWCC8baoAP7csHk3222_PlURDDK6L7GAWOcDXB1fqz0z2cQpYILX_GTVUyeVgcAerf7CsWvSPjkXzibmyXVHBi1Ovyva7EVggYcDim6qvlq_g7073r_UsN0SYLJLjSiro0K4qBZik0WYYMlggOEylD7okqt6RTW8JT0-oSF6DhWj_X1Rrpl4VJfhagPUYNlgg_MEm1PVnYAINigvP6t9-IW-D8p0tzJNd4tAg-gXvHVwYJlgg17sc9ZGMsizR8m-r9eie0th_59WvSpDRZs4Xd3wv-yoYLVggKtrNGpXZ3lZ2f5TbUKsg_I6UcKFVu_LPUmI0oAsaaN4YGVggTK0MC7h3_ks2gde6ZCo31rFXLY8syyhEZ3giaWm3qMILWCBduv8FuJVrwYyS3tnYybqQOt3p-vNjE4oroL--qMGzeBdYIAbOjSU-LslPy0L2QEXT2CmxLcL8vU9wJeIBolgtcKoPGB5YIDGsgmliLTlkl0IZyLMMk8siFr1oVxw6ztmOT1EhisGTGDNYIClO5x0QDZ99Ss9ZNVQd4EueLQEc8g4rXLJ0ZNdsd9lhGCRYIDk4GaNf8EiZrTxN5sfJll-EV8I-8Iios3rqH96cXXe9FFgg6rD_L4VPk-LsZBFAHgxgiawN9LQ-A1jUckYvi5jATKoYPVggOW7Xmsv8rhNOVS9wmCKp2-KOI0W39LTU1OQshcBBaq0YMFggCN-g2RcrlHkbbX9cJO5ivkc2Odyd7gPp3pDOSp3QKD8YK1gg8lX4aTc65OpTceQvZjOLcqGK1-FCp2KA4r8MQ9AQDgwYI1ggpGXcJLMh4PZD7x6dHxXEvYU8xWdYSIE4TMu8qxWHfOsYMVggxuqRPatXWacS3z-I0A-0mM2t7MYmEae7vnrhqOY6Lw4YGlggtfi_zYUi3IpP-UliESnUn99W724Dd1GKDWm8o-98ND0HWCAmbtsNzfSant4AC6TCBtS1kz3pFsCArSAcd7PJiRZUIRgiWCBE-bAQ357qRW5gLX96wzXPfB7edhPZIz-O18753o_p5gFYIA2mZSXR2tIrIaQCMN3x7kQL41aad93gmXQW8k3B26a3GDVYILDSmFT55xF5295NSoJ0eLp6CQvsLtL2oM3ccno4a7riGD5YIHdPsX_8oWkA99oyXmVeE8ZLIVZ1YQQwjWPyhS3TgpLVGBhYIDE5202b_1yOSBvKt06nsXaDCKsz6c2M2CAYa_W3CeGxd29yZy5pc28uMTgwMTMuNS4xLmFhbXZhswVYIA6cntt603dG-w91OSsv-j7z_Y4-JQANB85np9qAJdOPGClYIB5HnT6GvzsIotPPovUGEG48Zap4C1ecEGoTr6FLqmcCGDhYIEbEwf07GrRyd_a6Uph3rICMwoYqTchSlTcBcaoNy8uSGDxYIEl_56EYAUKgKd4RV8let7P5MQwDQ09KNAdkhJbIpfCQCVggsKK_ysVODzOyrUwRF15OenIFt622oUieCuDbXeeCJ3EWWCDrf_oKvuXuzJ8jcZo_67rZW2fphfpKAc9Tfzu2xwxdeBggWCBaTwR_K3vLUwezXWi54xNVAEbuUpmEo3-BE3gf6Y6wwBg3WCBkqBFWNStfElNNkscqIcc11lABlutHWNgwfF8dCixDJQZYINeqesfYofU5NHBqgL8b92dY4BxX1IAcKboJUQLDgjqlGChYILwZn-_93OybOROl2V2ArfcwERaSVQXju_Rl2Wps-qOBA1gg4ehfNKqnuRYJ1gW-1D5gOF9rYLlPR1kGpBRhH4tZQacYIVggL2xWR964Dyp1rgYSVhb8XPeH9V41T3DcG8vFj8mpyMUEWCC1H53yNkBNRujdChlNvcdGarPFIa9TkeFadwyO3wYRsBg6WCCe9XbS07jad-QnUx4ET_z2afSIPPycJ4qhQUn28Q3izBg0WCCWOiwEyVYTMe6quGkTBNv1ULfh3Ymkq2fUKwtdrKvWVgJYIMzirj9xLIzRVBBd6m2S_D4djAOJvfgEkbGuT3a5Vy7lGCVYIA7NpE_RLoHArQEgS10Oxyb66q6fVYzCfnaK8hq4_XROGDlYINjnDBwlHFpd2jUQcN9gvF1x7wUTJ6o0sV6zSIPNMR99EFgg7gPO4i3qK_6Knqk8pGunyK9peWZ8dWoy3RAW5I_VNoltZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCD3Po2C1fy6lR42h5pgc3fpLkQ_0SjE3ut-Bf1HDA9hvSJYIFqsA8JUONmJo81dBTBq4YiEqw9yz_-ayiW9GUazOePLbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjE0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MTRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MTRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQPjIJvRz-3lsEeqyVAh_05W7H7ovOSAcusDIQcuQq0wO11KEU7Cz_6pQ49hKiZOmpU38Mfk3ee6EbwI1WAvU4lVsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WECIQA1r9B6cqQOVnDl9fVJwk5oRIZ62p7EoLWoKlyJDlZEDwjBt10y95K2OkW3mzNF2KLpBknRyX0KwZNRW_x_Go2dkb2NUeXBld2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xbGlzc3VlclNpZ25lZKJqbmFtZVNwYWNlc6F3ZXUuZXVyb3BhLmVjLmV1ZGkucGlkLjGC2BhYWqRoZGlnZXN0SUQYGmZyYW5kb21Q1YSWDmsS79W2Wc4yJWlZ3HFlbGVtZW50SWRlbnRpZmllcmtmYW1pbHlfbmFtZWxlbGVtZW50VmFsdWVqTXVzdGVybWFubtgYWFOkaGRpZ2VzdElECmZyYW5kb21QsrbGD64sRwj7_g_2g6fGVnFlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYWppc3N1ZXJBdXRohEOhASahGCFZAkMwggI_MIIBxKADAgECAhQMUvEHyYecwWPL8gZJAf7JfNnxRTAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIzODM5WhcNMjUwNjE3MDIzODM4WjAkMRUwEwYDVQQDDAxQYW5hc29uaWMgRFMxCzAJBgNVBAYTAkpQMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEgpOS_oKDpnxaQScHHejq1wxpbtOv0ocR_ByWd5QpPumoJwS7g-MZoHye8SnxJtsSBcurgVZ0VultChK9Pd3eaqOB0TCBzjAfBgNVHSMEGDAWgBSF8-ke5XiOT6SjyIbpTTdRKQYvMDAVBgNVHSUBAf8ECzAJBgcogYxdBQECMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIaR9JQORnhTgGNlRhfVL1KvGYGdMA4GA1UdDwEB_wQEAwIHgDAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMAoGCCqGSM49BAMDA2kAMGYCMQCuykFQmp6OGghVhm74fxdpWmSJdeVWOV58sGfMuBmbr7g9vzIIIW36XSwKO8c7RRQCMQC-8rvqNNY1lhf-nWyY9e0Z4ZW3mhGJnd_5LbC8QNClIbONplfjMj0S2rYVsUu8e5lZB7PYGFkHrqdndmVyc2lvbmMxLjBvZGlnZXN0QWxnb3JpdGhtZ1NIQS0yNTZnZG9jVHlwZXdldS5ldXJvcGEuZWMuZXVkaS5waWQuMWx2YWx1ZURpZ2VzdHOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xuBsYGlggpMCxCPLrqGLVEOvYM0IQHu6-rNwHfZwXGNLOIT0hlasKWCBaqh4DdCQ6qxSRZG79jmsheukZ77t-5hd9q7om6lZvqBgYWCDlbxr826w78LujTnFHCv-6B7OsOpPzvH-L--f3z81oRhFYIFqvcccf8kDiuByS0vvvuAj5Nsf7Zs-EOiUjjSWE9rp9GBlYIOYMba1OBnqKF8YALj3fnfKTP1qPt7lYPi1luwD-MquRFVggswNmRoOVnAoKBv6J2vLk27PYFIM3FzkRXHJJ2AUOjqIFWCBuaMIWwBqUJfCTsJce4rIYwRwozqrYXTI3jLkD-47itQFYIGKi0ZtMLhiUFfghwO8V4Z9UpaNFLpbmIzT4WQtPNuzRFlggesM-LYdOipSWHOjF13XhJums8c8McPZNf_xd8TJSUj8TWCBLIl1Ym8OAD_BLZKerpFwow391z-v75m7yfj2j5TUvRAdYILjg_INbPVxje4ZxeRFjROaIb_SJZDN44z4DQFZ5vB-9CFggo4SZsazSEAYGV6qvdjyCHyIrwo6EvSSdjPDeg3PCyWYOWCC723cUlQkKRgnEtGPqtLpQvWc9Latbn-DI77vblmIvRBdYIFUBLC0JDTbhcNzZgufFkKKwxSkib2z1spSbwPp5lCsqC1ggbg4a-ENrKt1_OCH8b49Bbu6Bk873VxD4G9Ct7dZI5HEPWCDvH91FS5Ue2V5b8N4w6-D1XV5WkbshtW_oCOckj5YwDAZYIPgG6o78Fg6_g3BuLoDA32yM1Z6lgVzOWZB1xuX3mv4SDVggnRpMJNGRuHAIDJMBgQCPoHON3ZTwtYy9zhbvDZ2bdvIMWCA32wgoYuiv6lSmWQFGBmF2UcgXusJCtZDMYxoEdbtVdgJYIFcRIfPZ5lyBAwpV5I6FOoTbQlatHgvYMGOaKMPyiSlAA1gg29GgABR8vXwjp6Z1EJaGUH5pQNOkVJXGdTGXJJLfEx8QWCCitLkmm1zVOL4dRKmZGZMcCemj8t-pP5jpiJ_g2XLdtglYIIUHgvXvZkGSn6cRxJbVAF4UlXO_lzD3DMtNwlBSuBWpBFggGSB9uF6Jd41SQtBb2N0AOwjKNqkelh8dmjX5--7X3f0AWCC2JfDKnjCG4kV7HYlKIfa1dsV65bZ7C8qEWl_jw13jXhJYIEVymRECA89Vrp1RDz8B2LtL__733vK7_TFlxy_pkZ2gFFggaV5smOmzn8nxXKdOJOZ_vDlnelzIA30TDyjsc7GcC4ttZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCBsGaolq6lxU1spYc6-9GuI-QxxTk8p0Y0kAPhxSKMF7iJYIBZ4LDxFG1GK1vI4DN8Or0wVOv--v3hvgJeWvXglS3fvbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjI0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MjRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MjRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQAD9O_jyPB16JTnfHzmcL9avHP2SE3aiZXNLhkMAtxtwsNhrewkLPyz7hxWpbdW8KmbUI19Z_K8bRbQRanxYzaRsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WEAbIUKrOTg0hHon6NklvLaIKeEZfCLf5NfGBeyPE4CTXbqxvUL4iPjCbdWWXli-QrKaTjiJgQLb-TlNuf-YVVTmZnN0YXR1cwA',
    );

    expect(result.areRequiredCredentialsPresent).toEqual(Status.INFO);
  });

  test('handles invalid response with multiple mdocs in a single device response without submission', async () => {
    const result = pex.evaluatePresentation(
      {
        id: 'random',
        input_descriptors: [
          {
            id: 'org.iso.18013.5.1.mDL',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['org.iso.18013.5.1']['given_name']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
          {
            id: 'eu.europa.ec.eudi.pid.1',
            format: {
              mso_mdoc: {
                alg: ['ES256'],
              },
            },
            constraints: {
              fields: [
                {
                  path: ["$['eu.europa.ec.eudi.pid.1']['family_name2222']"],
                  intent_to_retain: false,
                },
              ],
              limit_disclosure: 'required',
            },
          },
        ],
      },
      'o2d2ZXJzaW9uYzEuMGlkb2N1bWVudHOCo2dkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiam5hbWVTcGFjZXOhcW9yZy5pc28uMTgwMTMuNS4xgtgYWFOkaGRpZ2VzdElEE2ZyYW5kb21Q4UfVHznACC2C95ORlY-G23FlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYdgYWFqkaGRpZ2VzdElEGCdmcmFuZG9tUJWFQuwvUIV2n8J8njlewT9xZWxlbWVudElkZW50aWZpZXJrZmFtaWx5X25hbWVsZWxlbWVudFZhbHVlak11c3Rlcm1hbm5qaXNzdWVyQXV0aIRDoQEmoRghWQJDMIICPzCCAcSgAwIBAgIUDFLxB8mHnMFjy_IGSQH-yXzZ8UUwCgYIKoZIzj0EAwMwJjEXMBUGA1UEAwwOUGFuYXNvbmljIElBQ0ExCzAJBgNVBAYTAkpQMB4XDTI1MDIxNTAyMzgzOVoXDTI1MDYxNzAyMzgzOFowJDEVMBMGA1UEAwwMUGFuYXNvbmljIERTMQswCQYDVQQGEwJKUDBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABIKTkv6Cg6Z8WkEnBx3o6tcMaW7Tr9KHEfwclneUKT7pqCcEu4PjGaB8nvEp8SbbEgXLq4FWdFbpbQoSvT3d3mqjgdEwgc4wHwYDVR0jBBgwFoAUhfPpHuV4jk-ko8iG6U03USkGLzAwFQYDVR0lAQH_BAswCQYHKIGMXQUBAjA5BgNVHR8EMjAwMC6gLKAqhihodHRwczovL21kb2MucGFuYXNvbmljLmdvdi9DUkxzL21kb2MuY3JsMB0GA1UdDgQWBBSGkfSUDkZ4U4BjZUYX1S9SrxmBnTAOBgNVHQ8BAf8EBAMCB4AwKgYDVR0SBCMwIYYfaHR0cHM6Ly9tZG9jLnBhbmFzb25pYy5nb3YvbWRvYzAKBggqhkjOPQQDAwNpADBmAjEArspBUJqejhoIVYZu-H8XaVpkiXXlVjlefLBnzLgZm6-4Pb8yCCFt-l0sCjvHO0UUAjEAvvK76jTWNZYX_p1smPXtGeGVt5oRiZ3f-S2wvEDQpSGzjaZX4zI9Etq2FbFLvHuZWQzU2BhZDM-nZ3ZlcnNpb25jMS4wb2RpZ2VzdEFsZ29yaXRobWdTSEEtMjU2Z2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbHZhbHVlRGlnZXN0c6Jxb3JnLmlzby4xODAxMy41LjG4LBgnWCB6saB7hlK2EeykYwjZGmyZsbdi5El6gh0gHL2YDezDAxNYIIKn9I9zTq9V8BOGb9N7DscNj534Gd8qseZVYLVYz4drGCxYINVQxuaQuzPN-DYGnb8v4a-4YXU3CcPZ-sgZYj2PxfHhDVgg9AxPlVfbmoeQXJOpU4SmVc1w27XMxborcpsHohpDslwAWCBwK_m_a0mIG8x8efhS3UNmWFG7gKDeyy-SlK_PA5CUVRJYIDpsOCtM-lP72Bbz19ERDqibf356ftB5jAKmFiCd4vrPGC5YIPF4uWsnZwRYzGsPn2oUZLsVraecQSPbpSWzx5JdVxz1GDtYIJs610ro1jUN5X5TZHI1PwGo050OFmw-x4eGfJxeo-WAD1gg31NhmF3nyWGnoW3hSOTCrLh1bfjirYyAlhCxTz5HbrgYG1gg6SzB16Th8-rRgaM5jArWOFDB_eVvC3v6Bh5mEJZeC-kYH1ggXypmMFtYpjKCnA5OVRztyxfQV1Nz7T9kvSugBY-KR44OWCBhi3ZNcZF2Q-hWIYismtEu-j-KrywqXeLe5n-l4mOlvRgqWCBAxW0XyWXAg5v6N7ZVYWsQPFwGMhD6kLRGO93K6tpOKhVYICazH32afpmDNGDNQH5iJes0gN67mQqVP7Ko5j1ehvTeGC9YIL7CuUPZt71T0JZnALPLrzdRSzKNrierzBEGJgGCm64XDFgga8iElmC8dqeucT0FIVFCuS4eGMAtwCMUWGsWfgN8KpIYHFggX4EYOnP28xJtaJCz5qcEfZhcMx3WpKpVnuhCnxtWVNoIWCC-plqpjzCq-71Ovy3BpqdqQ6GwJNXHg8iB0rolKOuEbRgdWCC8baoAP7csHk3222_PlURDDK6L7GAWOcDXB1fqz0z2cQpYILX_GTVUyeVgcAerf7CsWvSPjkXzibmyXVHBi1Ovyva7EVggYcDim6qvlq_g7073r_UsN0SYLJLjSiro0K4qBZik0WYYMlggOEylD7okqt6RTW8JT0-oSF6DhWj_X1Rrpl4VJfhagPUYNlgg_MEm1PVnYAINigvP6t9-IW-D8p0tzJNd4tAg-gXvHVwYJlgg17sc9ZGMsizR8m-r9eie0th_59WvSpDRZs4Xd3wv-yoYLVggKtrNGpXZ3lZ2f5TbUKsg_I6UcKFVu_LPUmI0oAsaaN4YGVggTK0MC7h3_ks2gde6ZCo31rFXLY8syyhEZ3giaWm3qMILWCBduv8FuJVrwYyS3tnYybqQOt3p-vNjE4oroL--qMGzeBdYIAbOjSU-LslPy0L2QEXT2CmxLcL8vU9wJeIBolgtcKoPGB5YIDGsgmliLTlkl0IZyLMMk8siFr1oVxw6ztmOT1EhisGTGDNYIClO5x0QDZ99Ss9ZNVQd4EueLQEc8g4rXLJ0ZNdsd9lhGCRYIDk4GaNf8EiZrTxN5sfJll-EV8I-8Iios3rqH96cXXe9FFgg6rD_L4VPk-LsZBFAHgxgiawN9LQ-A1jUckYvi5jATKoYPVggOW7Xmsv8rhNOVS9wmCKp2-KOI0W39LTU1OQshcBBaq0YMFggCN-g2RcrlHkbbX9cJO5ivkc2Odyd7gPp3pDOSp3QKD8YK1gg8lX4aTc65OpTceQvZjOLcqGK1-FCp2KA4r8MQ9AQDgwYI1ggpGXcJLMh4PZD7x6dHxXEvYU8xWdYSIE4TMu8qxWHfOsYMVggxuqRPatXWacS3z-I0A-0mM2t7MYmEae7vnrhqOY6Lw4YGlggtfi_zYUi3IpP-UliESnUn99W724Dd1GKDWm8o-98ND0HWCAmbtsNzfSant4AC6TCBtS1kz3pFsCArSAcd7PJiRZUIRgiWCBE-bAQ357qRW5gLX96wzXPfB7edhPZIz-O18753o_p5gFYIA2mZSXR2tIrIaQCMN3x7kQL41aad93gmXQW8k3B26a3GDVYILDSmFT55xF5295NSoJ0eLp6CQvsLtL2oM3ccno4a7riGD5YIHdPsX_8oWkA99oyXmVeE8ZLIVZ1YQQwjWPyhS3TgpLVGBhYIDE5202b_1yOSBvKt06nsXaDCKsz6c2M2CAYa_W3CeGxd29yZy5pc28uMTgwMTMuNS4xLmFhbXZhswVYIA6cntt603dG-w91OSsv-j7z_Y4-JQANB85np9qAJdOPGClYIB5HnT6GvzsIotPPovUGEG48Zap4C1ecEGoTr6FLqmcCGDhYIEbEwf07GrRyd_a6Uph3rICMwoYqTchSlTcBcaoNy8uSGDxYIEl_56EYAUKgKd4RV8let7P5MQwDQ09KNAdkhJbIpfCQCVggsKK_ysVODzOyrUwRF15OenIFt622oUieCuDbXeeCJ3EWWCDrf_oKvuXuzJ8jcZo_67rZW2fphfpKAc9Tfzu2xwxdeBggWCBaTwR_K3vLUwezXWi54xNVAEbuUpmEo3-BE3gf6Y6wwBg3WCBkqBFWNStfElNNkscqIcc11lABlutHWNgwfF8dCixDJQZYINeqesfYofU5NHBqgL8b92dY4BxX1IAcKboJUQLDgjqlGChYILwZn-_93OybOROl2V2ArfcwERaSVQXju_Rl2Wps-qOBA1gg4ehfNKqnuRYJ1gW-1D5gOF9rYLlPR1kGpBRhH4tZQacYIVggL2xWR964Dyp1rgYSVhb8XPeH9V41T3DcG8vFj8mpyMUEWCC1H53yNkBNRujdChlNvcdGarPFIa9TkeFadwyO3wYRsBg6WCCe9XbS07jad-QnUx4ET_z2afSIPPycJ4qhQUn28Q3izBg0WCCWOiwEyVYTMe6quGkTBNv1ULfh3Ymkq2fUKwtdrKvWVgJYIMzirj9xLIzRVBBd6m2S_D4djAOJvfgEkbGuT3a5Vy7lGCVYIA7NpE_RLoHArQEgS10Oxyb66q6fVYzCfnaK8hq4_XROGDlYINjnDBwlHFpd2jUQcN9gvF1x7wUTJ6o0sV6zSIPNMR99EFgg7gPO4i3qK_6Knqk8pGunyK9peWZ8dWoy3RAW5I_VNoltZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCD3Po2C1fy6lR42h5pgc3fpLkQ_0SjE3ut-Bf1HDA9hvSJYIFqsA8JUONmJo81dBTBq4YiEqw9yz_-ayiW9GUazOePLbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjE0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MTRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MTRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQPjIJvRz-3lsEeqyVAh_05W7H7ovOSAcusDIQcuQq0wO11KEU7Cz_6pQ49hKiZOmpU38Mfk3ee6EbwI1WAvU4lVsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WECIQA1r9B6cqQOVnDl9fVJwk5oRIZ62p7EoLWoKlyJDlZEDwjBt10y95K2OkW3mzNF2KLpBknRyX0KwZNRW_x_Go2dkb2NUeXBld2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xbGlzc3VlclNpZ25lZKJqbmFtZVNwYWNlc6F3ZXUuZXVyb3BhLmVjLmV1ZGkucGlkLjGC2BhYWqRoZGlnZXN0SUQYGmZyYW5kb21Q1YSWDmsS79W2Wc4yJWlZ3HFlbGVtZW50SWRlbnRpZmllcmtmYW1pbHlfbmFtZWxlbGVtZW50VmFsdWVqTXVzdGVybWFubtgYWFOkaGRpZ2VzdElECmZyYW5kb21QsrbGD64sRwj7_g_2g6fGVnFlbGVtZW50SWRlbnRpZmllcmpnaXZlbl9uYW1lbGVsZW1lbnRWYWx1ZWVFcmlrYWppc3N1ZXJBdXRohEOhASahGCFZAkMwggI_MIIBxKADAgECAhQMUvEHyYecwWPL8gZJAf7JfNnxRTAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIzODM5WhcNMjUwNjE3MDIzODM4WjAkMRUwEwYDVQQDDAxQYW5hc29uaWMgRFMxCzAJBgNVBAYTAkpQMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEgpOS_oKDpnxaQScHHejq1wxpbtOv0ocR_ByWd5QpPumoJwS7g-MZoHye8SnxJtsSBcurgVZ0VultChK9Pd3eaqOB0TCBzjAfBgNVHSMEGDAWgBSF8-ke5XiOT6SjyIbpTTdRKQYvMDAVBgNVHSUBAf8ECzAJBgcogYxdBQECMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIaR9JQORnhTgGNlRhfVL1KvGYGdMA4GA1UdDwEB_wQEAwIHgDAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMAoGCCqGSM49BAMDA2kAMGYCMQCuykFQmp6OGghVhm74fxdpWmSJdeVWOV58sGfMuBmbr7g9vzIIIW36XSwKO8c7RRQCMQC-8rvqNNY1lhf-nWyY9e0Z4ZW3mhGJnd_5LbC8QNClIbONplfjMj0S2rYVsUu8e5lZB7PYGFkHrqdndmVyc2lvbmMxLjBvZGlnZXN0QWxnb3JpdGhtZ1NIQS0yNTZnZG9jVHlwZXdldS5ldXJvcGEuZWMuZXVkaS5waWQuMWx2YWx1ZURpZ2VzdHOhd2V1LmV1cm9wYS5lYy5ldWRpLnBpZC4xuBsYGlggpMCxCPLrqGLVEOvYM0IQHu6-rNwHfZwXGNLOIT0hlasKWCBaqh4DdCQ6qxSRZG79jmsheukZ77t-5hd9q7om6lZvqBgYWCDlbxr826w78LujTnFHCv-6B7OsOpPzvH-L--f3z81oRhFYIFqvcccf8kDiuByS0vvvuAj5Nsf7Zs-EOiUjjSWE9rp9GBlYIOYMba1OBnqKF8YALj3fnfKTP1qPt7lYPi1luwD-MquRFVggswNmRoOVnAoKBv6J2vLk27PYFIM3FzkRXHJJ2AUOjqIFWCBuaMIWwBqUJfCTsJce4rIYwRwozqrYXTI3jLkD-47itQFYIGKi0ZtMLhiUFfghwO8V4Z9UpaNFLpbmIzT4WQtPNuzRFlggesM-LYdOipSWHOjF13XhJums8c8McPZNf_xd8TJSUj8TWCBLIl1Ym8OAD_BLZKerpFwow391z-v75m7yfj2j5TUvRAdYILjg_INbPVxje4ZxeRFjROaIb_SJZDN44z4DQFZ5vB-9CFggo4SZsazSEAYGV6qvdjyCHyIrwo6EvSSdjPDeg3PCyWYOWCC723cUlQkKRgnEtGPqtLpQvWc9Latbn-DI77vblmIvRBdYIFUBLC0JDTbhcNzZgufFkKKwxSkib2z1spSbwPp5lCsqC1ggbg4a-ENrKt1_OCH8b49Bbu6Bk873VxD4G9Ct7dZI5HEPWCDvH91FS5Ue2V5b8N4w6-D1XV5WkbshtW_oCOckj5YwDAZYIPgG6o78Fg6_g3BuLoDA32yM1Z6lgVzOWZB1xuX3mv4SDVggnRpMJNGRuHAIDJMBgQCPoHON3ZTwtYy9zhbvDZ2bdvIMWCA32wgoYuiv6lSmWQFGBmF2UcgXusJCtZDMYxoEdbtVdgJYIFcRIfPZ5lyBAwpV5I6FOoTbQlatHgvYMGOaKMPyiSlAA1gg29GgABR8vXwjp6Z1EJaGUH5pQNOkVJXGdTGXJJLfEx8QWCCitLkmm1zVOL4dRKmZGZMcCemj8t-pP5jpiJ_g2XLdtglYIIUHgvXvZkGSn6cRxJbVAF4UlXO_lzD3DMtNwlBSuBWpBFggGSB9uF6Jd41SQtBb2N0AOwjKNqkelh8dmjX5--7X3f0AWCC2JfDKnjCG4kV7HYlKIfa1dsV65bZ7C8qEWl_jw13jXhJYIEVymRECA89Vrp1RDz8B2LtL__733vK7_TFlxy_pkZ2gFFggaV5smOmzn8nxXKdOJOZ_vDlnelzIA30TDyjsc7GcC4ttZGV2aWNlS2V5SW5mb6FpZGV2aWNlS2V5pAECIAEhWCBsGaolq6lxU1spYc6-9GuI-QxxTk8p0Y0kAPhxSKMF7iJYIBZ4LDxFG1GK1vI4DN8Or0wVOv--v3hvgJeWvXglS3fvbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI1LTA0LTA5VDA5OjE2OjI0Wml2YWxpZEZyb23AdDIwMjUtMDQtMDlUMDk6MTY6MjRaanZhbGlkVW50aWzAdDIwMjUtMDUtMDlUMDk6MTY6MjRaZnN0YXR1c6Frc3RhdHVzX2xpc3SjY2lkeAxjdXJpeFFodHRwczovL3ByZGN2LW1zb3Jldm9jYXRpb24tc3RhdHVzbGlzdHMuczMuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb20vc3RhdHVzMS5jd3RrY2VydGlmaWNhdGVZAj0wggI5MIIBv6ADAgECAhQSZemtJ-Kjc9gCk9N25XcHI1xnpDAKBggqhkjOPQQDAzAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwHhcNMjUwMjE1MDIwOTQyWhcNMzAwNjE4MDIwOTQxWjAmMRcwFQYDVQQDDA5QYW5hc29uaWMgSUFDQTELMAkGA1UEBhMCSlAwdjAQBgcqhkjOPQIBBgUrgQQAIgNiAAQ6ImCd4mrop3EHskDxaOTID5OZkUv3Kv3EbCyfVrhudJ7GA0HB-J2qNbjvoZSWbiKF992WzLwmSvB2U0fEonIvTPQi2aN-FT74QscslWGaBeeIjtPG1dh4BNjXSjLAKiCjga0wgaowEgYDVR0TAQH_BAgwBgEB_wIBADAqBgNVHRIEIzAhhh9odHRwczovL21kb2MucGFuYXNvbmljLmdvdi9tZG9jMDkGA1UdHwQyMDAwLqAsoCqGKGh0dHBzOi8vbWRvYy5wYW5hc29uaWMuZ292L0NSTHMvbWRvYy5jcmwwHQYDVR0OBBYEFIXz6R7leI5PpKPIhulNN1EpBi8wMA4GA1UdDwEB_wQEAwIBBjAKBggqhkjOPQQDAwNoADBlAjAMZzPMrON0hPLnL_LsLdSgUiF8swVgg_8iOvs6YD01sSqK9dtxuHruAItpxk_F828CMQCJ2uzzf0M3Qmj-lQJ_4W8IiqBTud2jYr6uUEB81s5xXXUKSDVGhJv89-1_DTicByJYQAD9O_jyPB16JTnfHzmcL9avHP2SE3aiZXNLhkMAtxtwsNhrewkLPyz7hxWpbdW8KmbUI19Z_K8bRbQRanxYzaRsZGV2aWNlU2lnbmVkompuYW1lU3BhY2Vz2BhBoGpkZXZpY2VBdXRooW9kZXZpY2VTaWduYXR1cmWEQ6EBJqD2WEAbIUKrOTg0hHon6NklvLaIKeEZfCLf5NfGBeyPE4CTXbqxvUL4iPjCbdWWXli-QrKaTjiJgQLb-TlNuf-YVVTmZnN0YXR1cwA',
    );

    expect(result.areRequiredCredentialsPresent).toEqual(Status.ERROR);
  });
});
