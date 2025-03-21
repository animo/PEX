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
});
