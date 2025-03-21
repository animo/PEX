import { PresentationDefinitionV2 } from '@sphereon/pex-models';
import { SdJwtDecodedVerifiableCredential } from '@sphereon/ssi-types';

import { PEX, PresentationSubmissionLocation, Status, Validated } from '../lib';
import { SubmissionRequirementMatchType } from '../lib/evaluation/core';
import { calculateSdHash } from '../lib/utils';

const decodedSdJwtVc = {
  compactSdJwtVc:
    'eyJhbGciOiJFZERTQSIsInR5cCI6InZjK3NkLWp3dCJ9.eyJpYXQiOjE3MDA0NjQ3MzYwNzYsImlzcyI6ImRpZDprZXk6c29tZS1yYW5kb20tZGlkLWtleSIsIm5iZiI6MTcwMDQ2NDczNjE3NiwidmN0IjoiaHR0cHM6Ly9oaWdoLWFzc3VyYW5jZS5jb20vU3RhdGVCdXNpbmVzc0xpY2Vuc2UiLCJ1c2VyIjp7Il9zZCI6WyI5QmhOVDVsSG5QVmpqQUp3TnR0NDIzM216MFVVMUd3RmFmLWVNWkFQV0JNIiwiSVl5d1FQZl8tNE9hY2Z2S2l1cjRlSnFMa1ZleWRxcnQ1Y2UwMGJReWNNZyIsIlNoZWM2TUNLakIxeHlCVl91QUtvLURlS3ZvQllYbUdBd2VGTWFsd05xbUEiLCJXTXpiR3BZYmhZMkdoNU9pWTRHc2hRU1dQREtSeGVPZndaNEhaQW5YS1RZIiwiajZ6ZFg1OUJYZHlTNFFaTGJITWJ0MzJpenRzWXdkZzRjNkpzWUxNc3ZaMCIsInhKR3Radm41cFM4VEhqVFlJZ3MwS1N5VC1uR3BSR3hDVnp6c1ZEbmMyWkUiXX0sImxpY2Vuc2UiOnsibnVtYmVyIjoxMH0sImNuZiI6eyJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsIngiOiJUQ0FFUjE5WnZ1M09IRjRqNFc0dmZTVm9ISVAxSUxpbERsczd2Q2VHZW1jIiwieSI6Ilp4amlXV2JaTVFHSFZXS1ZRNGhiU0lpcnNWZnVlY0NFNnQ0alQ5RjJIWlEifX0sIl9zZF9hbGciOiJzaGEtMjU2IiwiX3NkIjpbIl90YnpMeHBaeDBQVHVzV2hPOHRUZlVYU2ZzQjVlLUtrbzl3dmZaaFJrYVkiLCJ1WmNQaHdUTmN4LXpNQU1zemlYMkFfOXlJTGpQSEhobDhEd2pvVXJLVVdZIl19.HAcudVInhNpXkTPQGNosjKTFRJWgKj90NpfloRaDQchGd4zxc1ChWTCCPXzUXTBypASKrzgjZCiXlTr0bzmLAg~WyJHeDZHRUZvR2t6WUpWLVNRMWlDREdBIiwiZGF0ZU9mQmlydGgiLCIyMDAwMDEwMSJd~WyJ1LUt3cmJvMkZfTExQekdSZE1XLUtBIiwibmFtZSIsIkpvaG4iXQ~WyJNV1ZieGJqVFZxUXdLS3h2UGVZdWlnIiwibGFzdE5hbWUiLCJEb2UiXQ~',
  signedPayload: {
    iat: 1700464736076,
    iss: 'did:key:some-random-did-key',
    nbf: 1700464736176,
    vct: 'https://high-assurance.com/StateBusinessLicense',
    user: {
      _sd: [
        '9BhNT5lHnPVjjAJwNtt4233mz0UU1GwFaf-eMZAPWBM',
        'IYywQPf_-4OacfvKiur4eJqLkVeydqrt5ce00bQycMg',
        'Shec6MCKjB1xyBV_uAKo-DeKvoBYXmGAweFMalwNqmA',
        'WMzbGpYbhY2Gh5OiY4GshQSWPDKRxeOfwZ4HZAnXKTY',
        'j6zdX59BXdyS4QZLbHMbt32iztsYwdg4c6JsYLMsvZ0',
        'xJGtZvn5pS8THjTYIgs0KSyT-nGpRGxCVzzsVDnc2ZE',
      ],
    },
    license: {
      number: 10,
    },
    cnf: {
      jwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'TCAER19Zvu3OHF4j4W4vfSVoHIP1ILilDls7vCeGemc',
        y: 'ZxjiWWbZMQGHVWKVQ4hbSIirsVfuecCE6t4jT9F2HZQ',
      },
    },
    _sd_alg: 'sha-256',
    _sd: ['_tbzLxpZx0PTusWhO8tTfUXSfsB5e-Kko9wvfZhRkaY', 'uZcPhwTNcx-zMAMsziX2A_9yILjPHHhl8DwjoUrKUWY'],
  },
  decodedPayload: {
    iat: 1700464736076,
    iss: 'did:key:some-random-did-key',
    nbf: 1700464736176,
    vct: 'https://high-assurance.com/StateBusinessLicense',
    user: {
      dateOfBirth: '20000101',
      name: 'John',
      lastName: 'Doe',
    },
    license: {
      number: 10,
    },
    cnf: {
      jwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'TCAER19Zvu3OHF4j4W4vfSVoHIP1ILilDls7vCeGemc',
        y: 'ZxjiWWbZMQGHVWKVQ4hbSIirsVfuecCE6t4jT9F2HZQ',
      },
    },
  },
  disclosures: [
    {
      encoded: 'WyJHeDZHRUZvR2t6WUpWLVNRMWlDREdBIiwiZGF0ZU9mQmlydGgiLCIyMDAwMDEwMSJd',
      decoded: ['Gx6GEFoGkzYJV-SQ1iCDGA', 'dateOfBirth', '20000101'],
      digest: 'IYywQPf_-4OacfvKiur4eJqLkVeydqrt5ce00bQycMg',
    },
    {
      encoded: 'WyJ1LUt3cmJvMkZfTExQekdSZE1XLUtBIiwibmFtZSIsIkpvaG4iXQ',
      decoded: ['u-Kwrbo2F_LLPzGRdMW-KA', 'name', 'John'],
      digest: 'xJGtZvn5pS8THjTYIgs0KSyT-nGpRGxCVzzsVDnc2ZE',
    },
    {
      encoded: 'WyJNV1ZieGJqVFZxUXdLS3h2UGVZdWlnIiwibGFzdE5hbWUiLCJEb2UiXQ',
      decoded: ['MWVbxbjTVqQwKKxvPeYuig', 'lastName', 'Doe'],
      digest: 'j6zdX59BXdyS4QZLbHMbt32iztsYwdg4c6JsYLMsvZ0',
    },
  ],
} satisfies SdJwtDecodedVerifiableCredential;

// This is the expected output SD-JWT based on the presentation definition defined below
const decodedSdJwtVcWithDisclosuresRemoved = {
  // 3 disclosures not included
  compactSdJwtVc:
    'eyJhbGciOiJFZERTQSIsInR5cCI6InZjK3NkLWp3dCJ9.eyJpYXQiOjE3MDA0NjQ3MzYwNzYsImlzcyI6ImRpZDprZXk6c29tZS1yYW5kb20tZGlkLWtleSIsIm5iZiI6MTcwMDQ2NDczNjE3NiwidmN0IjoiaHR0cHM6Ly9oaWdoLWFzc3VyYW5jZS5jb20vU3RhdGVCdXNpbmVzc0xpY2Vuc2UiLCJ1c2VyIjp7Il9zZCI6WyI5QmhOVDVsSG5QVmpqQUp3TnR0NDIzM216MFVVMUd3RmFmLWVNWkFQV0JNIiwiSVl5d1FQZl8tNE9hY2Z2S2l1cjRlSnFMa1ZleWRxcnQ1Y2UwMGJReWNNZyIsIlNoZWM2TUNLakIxeHlCVl91QUtvLURlS3ZvQllYbUdBd2VGTWFsd05xbUEiLCJXTXpiR3BZYmhZMkdoNU9pWTRHc2hRU1dQREtSeGVPZndaNEhaQW5YS1RZIiwiajZ6ZFg1OUJYZHlTNFFaTGJITWJ0MzJpenRzWXdkZzRjNkpzWUxNc3ZaMCIsInhKR3Radm41cFM4VEhqVFlJZ3MwS1N5VC1uR3BSR3hDVnp6c1ZEbmMyWkUiXX0sImxpY2Vuc2UiOnsibnVtYmVyIjoxMH0sImNuZiI6eyJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJQLTI1NiIsIngiOiJUQ0FFUjE5WnZ1M09IRjRqNFc0dmZTVm9ISVAxSUxpbERsczd2Q2VHZW1jIiwieSI6Ilp4amlXV2JaTVFHSFZXS1ZRNGhiU0lpcnNWZnVlY0NFNnQ0alQ5RjJIWlEifX0sIl9zZF9hbGciOiJzaGEtMjU2IiwiX3NkIjpbIl90YnpMeHBaeDBQVHVzV2hPOHRUZlVYU2ZzQjVlLUtrbzl3dmZaaFJrYVkiLCJ1WmNQaHdUTmN4LXpNQU1zemlYMkFfOXlJTGpQSEhobDhEd2pvVXJLVVdZIl19.HAcudVInhNpXkTPQGNosjKTFRJWgKj90NpfloRaDQchGd4zxc1ChWTCCPXzUXTBypASKrzgjZCiXlTr0bzmLAg~WyJ1LUt3cmJvMkZfTExQekdSZE1XLUtBIiwibmFtZSIsIkpvaG4iXQ~',
  decodedPayload: {
    iat: 1700464736076,
    iss: 'did:key:some-random-did-key',
    nbf: 1700464736176,
    vct: 'https://high-assurance.com/StateBusinessLicense',
    // Some fields from user not disclosed
    user: {
      name: 'John',
    },
    license: {
      number: 10,
    },
    cnf: {
      jwk: {
        kty: 'EC',
        crv: 'P-256',
        x: 'TCAER19Zvu3OHF4j4W4vfSVoHIP1ILilDls7vCeGemc',
        y: 'ZxjiWWbZMQGHVWKVQ4hbSIirsVfuecCE6t4jT9F2HZQ',
      },
    },
  },
  // Only first disclosure included (user.name)
  disclosures: [decodedSdJwtVc.disclosures[1]],
  signedPayload: decodedSdJwtVc.signedPayload,
} satisfies SdJwtDecodedVerifiableCredential;

const pidSdJwt =
  'eyJ4NWMiOlsiTUlJQ2REQ0NBaHVnQXdJQkFnSUJBakFLQmdncWhrak9QUVFEQWpDQmlERUxNQWtHQTFVRUJoTUNSRVV4RHpBTkJnTlZCQWNNQmtKbGNteHBiakVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneEVUQVBCZ05WQkFzTUNGUWdRMU1nU1VSRk1UWXdOQVlEVlFRRERDMVRVRkpKVGtRZ1JuVnVhMlVnUlZWRVNTQlhZV3hzWlhRZ1VISnZkRzkwZVhCbElFbHpjM1ZwYm1jZ1EwRXdIaGNOTWpRd05UTXhNRGd4TXpFM1doY05NalV3TnpBMU1EZ3hNekUzV2pCc01Rc3dDUVlEVlFRR0V3SkVSVEVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneENqQUlCZ05WQkFzTUFVa3hNakF3QmdOVkJBTU1LVk5RVWtsT1JDQkdkVzVyWlNCRlZVUkpJRmRoYkd4bGRDQlFjbTkwYjNSNWNHVWdTWE56ZFdWeU1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRU9GQnE0WU1LZzR3NWZUaWZzeXR3QnVKZi83RTdWaFJQWGlObTUyUzNxMUVUSWdCZFh5REsza1Z4R3hnZUhQaXZMUDN1dU12UzZpREVjN3FNeG12ZHVLT0JrRENCalRBZEJnTlZIUTRFRmdRVWlQaENrTEVyRFhQTFcyL0owV1ZlZ2h5dyttSXdEQVlEVlIwVEFRSC9CQUl3QURBT0JnTlZIUThCQWY4RUJBTUNCNEF3TFFZRFZSMFJCQ1l3SklJaVpHVnRieTV3YVdRdGFYTnpkV1Z5TG1KMWJtUmxjMlJ5ZFdOclpYSmxhUzVrWlRBZkJnTlZIU01FR0RBV2dCVFVWaGpBaVRqb0RsaUVHTWwyWXIrcnU4V1F2akFLQmdncWhrak9QUVFEQWdOSEFEQkVBaUFiZjVUemtjUXpoZldvSW95aTFWTjdkOEk5QnNGS20xTVdsdVJwaDJieUdRSWdLWWtkck5mMnhYUGpWU2JqVy9VLzVTNXZBRUM1WHhjT2FudXNPQnJvQmJVPSIsIk1JSUNlVENDQWlDZ0F3SUJBZ0lVQjVFOVFWWnRtVVljRHRDaktCL0gzVlF2NzJnd0NnWUlLb1pJemowRUF3SXdnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUI0WERUSTBNRFV6TVRBMk5EZ3dPVm9YRFRNME1EVXlPVEEyTkRnd09Wb3dnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFWUd6ZHdGRG5jNytLbjVpYkF2Q09NOGtlNzdWUXhxZk1jd1pMOElhSUErV0NST2NDZm1ZL2dpSDkycU1ydTVwL2t5T2l2RTBSQy9JYmRNT052RG9VeWFObU1HUXdIUVlEVlIwT0JCWUVGTlJXR01DSk9PZ09XSVFZeVhaaXY2dTd4WkMrTUI4R0ExVWRJd1FZTUJhQUZOUldHTUNKT09nT1dJUVl5WFppdjZ1N3haQytNQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUF3RGdZRFZSMFBBUUgvQkFRREFnR0dNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJR0VtN3drWktIdC9hdGI0TWRGblhXNnlybndNVVQydTEzNmdkdGwxMFk2aEFpQnVURnF2Vll0aDFyYnh6Q1AweFdaSG1RSzlrVnl4bjhHUGZYMjdFSXp6c3c9PSJdLCJraWQiOiJNSUdVTUlHT3BJR0xNSUdJTVFzd0NRWURWUVFHRXdKRVJURVBNQTBHQTFVRUJ3d0dRbVZ5YkdsdU1SMHdHd1lEVlFRS0RCUkNkVzVrWlhOa2NuVmphMlZ5WldrZ1IyMWlTREVSTUE4R0ExVUVDd3dJVkNCRFV5QkpSRVV4TmpBMEJnTlZCQU1NTFZOUVVrbE9SQ0JHZFc1clpTQkZWVVJKSUZkaGJHeGxkQ0JRY205MGIzUjVjR1VnU1hOemRXbHVaeUJEUVFJQkFnPT0iLCJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJwbGFjZV9vZl9iaXJ0aCI6eyJfc2QiOlsiVS01ZlVXLU5EM1laajZTcUdyQXV4NXJWYWZOalhqZ2hvMmRUUmpQX3hOTSJdfSwiX3NkIjpbIjlFaUpQNEw2NDI0bEtTVGs5NHpIOWhaWVc5UjNuS1R3V0V5TVBJN2dvWHciLCJHVlhRWEtFMmpWR1d0VEF6T1d5ck85TTZySW1qYkZJWGFnRkMyWElMbGhJIiwiUUV2bHpNd0ozZS1tOEtpWEk5bGx2bnVQblh5UHRXN2VCSF9GcXFVTnk3WSIsImljWkpTRkFqLVg3T29Sam5vRFRReXFwU1dNQUVuaTcydWZDZmFFWC1uQkUiLCJsUHJqb3BqbEN5bFdHWVo0cmh4S1RUTUsxS3p1Sm5ISUtybzNwUUhlUXF3IiwicjJORHZtRFY3QmU3TlptVFR0VE9fekdZX3RTdWdYVXoxeDJBXzZuOFhvdyIsInJPbjFJUkpUQWtEV1pSTGc3MUYzaDVsbFpPc1ZPMl9aemlOUy1majNEUFUiXSwiYWRkcmVzcyI6eyJfc2QiOlsiQnI1aVZtZnZlaTloQ01mMktVOGRFVjFER2hrdUtsQ1pUeGFEQ0FMb3NJbyIsIkx6czJpR09SNHF0clhhYmdwMzFfcjFFUFNmazlaUDJQRElJUTRQaHlPT00iLCJadUV5cG41Y0s0WVpWdHdkeGFoWXJqMjZ1MFI2UmxpOVVJWlNjUGhoWTB3Iiwidi1rMzl2VGI5NFI5a25VWTZtbzlXUVdEQkNJS3lya0J4bExTQVl3T2MyNCJdfSwiaXNzdWluZ19jb3VudHJ5IjoiREUiLCJ2Y3QiOiJodHRwczovL2V4YW1wbGUuYm1pLmJ1bmQuZGUvY3JlZGVudGlhbC9waWQvMS4wIiwiaXNzdWluZ19hdXRob3JpdHkiOiJERSIsIl9zZF9hbGciOiJzaGEtMjU2IiwiaXNzIjoiaHR0cHM6Ly9kZW1vLnBpZC1pc3N1ZXIuYnVuZGVzZHJ1Y2tlcmVpLmRlL2MxIiwiY25mIjp7Imp3ayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6IkhzS194Tl95SVU4eWlqdW9BWlhsbndFRU00ZlhZenVNRmd5TTE5SmRYMUkiLCJ5IjoiQUR2NnplVDl3YmgxU0ZxMG14TkcxMUZueC05eFdSRFcwR18xN1dSRXpRSSJ9fSwiZXhwIjoxNzMzNTcxMzI3LCJpYXQiOjE3MzIzNjE3MjcsImFnZV9lcXVhbF9vcl9vdmVyIjp7Il9zZCI6WyJLRDF0U0hnYWotZi1qbkZURkRDMW1sZ0RwNzhMZE1KcHlqWnRRU0k4a1ZnIiwiTDRjTTMtZU1mRHg0Znc2UEw3OVRTVFBnM042VXdzOGNPc3JOYmNqaEEtYyIsImRYUFBQX2lmNFM3XzBzcXZXNTBwZEdlMWszbS1wMnM3M1JicDlncThGaDAiLCJtYnllcU05YUkzRkVvWmFoODA5eTN0dlRCV1NvZTBMSlRUYTlONGNjdmlZIiwicm1zd0dEZnhvS0ZFYlFsNzZ4S1ZVT0hrX0MyQlVpVnQ5RDlvMTFrMmZNSSIsInZsY2Y4WTNhQnNTeEZBeVZfYk9NTndvX3FTT1pHc3ViSVZiY0FVSWVBSGMiXX19.gruqjNOuJBgHXEnG9e60wOoqiyEaL1K9pdL215a0ffZCjtIZ_kICDrO5vBiTrEmvjjd6w_N_thEYLhzob77Epg~WyJWRXlWQWF0LXoyNU8tbkQ0MVBaOGdnIiwiZmFtaWx5X25hbWUiLCJNVVNURVJNQU5OIl0~WyJLcnRPei1lRk9hMU9JYmpmUHUxcHRBIiwiZ2l2ZW5fbmFtZSIsIkVSSUtBIl0~WyJQQUVjSHp0NWk5bFFzNUZlRmFGUS1RIiwiYmlydGhkYXRlIiwiMTk2NC0wOC0xMiJd~';

const pex = new PEX({});

function getPresentationDefinitionV2PidAndMdl(): PresentationDefinitionV2 {
  return {
    id: '1ad8ea6e-ec51-4e14-b316-dd76a6275480',
    name: 'PID and MDL - Rent a Car (vc+sd-jwt)',
    purpose: 'To secure your car reservations and finalize the transaction, we require the following attributes',
    input_descriptors: [
      {
        id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
        format: {
          'vc+sd-jwt': {
            'sd-jwt_alg_values': ['ES256'],
            'kb-jwt_alg_values': ['ES256'],
          },
        },
        group: ['A'],
        constraints: {
          limit_disclosure: 'required',
          fields: [
            { path: ['$.document_number'] },
            { path: ['$.portrait'] },
            { path: ['$.issue_date'] },
            { path: ['$.expiry_date'] },
            { path: ['$.issuing_country'] },
            { path: ['$.issuing_authority'] },
            { path: ['$.driving_priviliges'] },
            {
              path: ['$.vct'],
              filter: {
                type: 'string',
                enum: ['https://example.eudi.ec.europa.eu/mdl/1'],
              },
            },
          ],
        },
      },
      {
        id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
        format: {
          'vc+sd-jwt': {
            'sd-jwt_alg_values': ['ES256'],
            'kb-jwt_alg_values': ['ES256'],
          },
        },
        group: ['B'],
        constraints: {
          limit_disclosure: 'required',
          fields: [
            { path: ['$.given_name'] },
            { path: ['$.family_name'] },
            { path: ['$.birthdate'] },
            {
              path: ['$.vct'],
              filter: {
                type: 'string',
                enum: ['https://example.bmi.bund.de/credential/pid/1.0', 'urn:eu.europa.ec.eudi:pid:1'],
              },
            },
            {
              path: ['$.iss'],
              filter: {
                type: 'string',
                enum: [
                  'https://demo.pid-issuer.bundesdruckerei.de/c',
                  'https://demo.pid-issuer.bundesdruckerei.de/c1',
                  'https://demo.pid-issuer.bundesdruckerei.de/b1',
                ],
              },
            },
          ],
        },
      },
    ],
  };
}

function getPresentationDefinitionV2(): PresentationDefinitionV2 {
  return {
    id: '32f54163-7166-48f1-93d8-ff217bdb0653',
    name: 'Conference Entry Requirements',
    purpose: 'We can only allow people associated with Washington State business representatives into conference areas',
    format: {
      'vc+sd-jwt': {},
    },
    input_descriptors: [
      {
        id: 'wa_driver_license',
        name: 'Washington State Business License',
        purpose: 'We can only allow licensed Washington State business representatives into the WA Business Conference',
        constraints: {
          limit_disclosure: 'required',
          fields: [
            {
              path: ['$.vct'],
              filter: {
                type: 'string',
                const: 'https://high-assurance.com/StateBusinessLicense',
              },
            },
            {
              path: ['$.license.number'],
              filter: {
                type: 'number',
              },
            },
            {
              path: ['$.user.name'],
              filter: {
                type: 'string',
              },
            },
          ],
        },
      },
    ],
  };
}

// TODO:
//  - evaluateSubmission / submissionFrom
//  - correctly set up KB-JWT payload and sign this in the presentation callback

describe('evaluate', () => {
  it('Evaluate presentationDefinition with vc+sd-jwt format', () => {
    const pd: PresentationDefinitionV2 = getPresentationDefinitionV2();
    const result: Validated = PEX.validateDefinition(pd);
    expect(result).toEqual([{ message: 'ok', status: 'info', tag: 'root' }]);
  });

  it('selectFrom with vc+sd-jwt format compact', () => {
    const result = pex.selectFrom(getPresentationDefinitionV2(), [decodedSdJwtVc.compactSdJwtVc]);
    expect(result.errors?.length).toEqual(0);
    expect(result.matches).toEqual([
      {
        name: 'Washington State Business License',
        areRequiredCredentialsPresent: Status.INFO,
        vc_path: ['$.verifiableCredential[0]'],
        type: SubmissionRequirementMatchType.InputDescriptor,
        id: 'wa_driver_license',
      },
    ]);
    expect(result.areRequiredCredentialsPresent).toBe('info');

    // Should have already applied selective disclosure on the SD-JWT
    expect(result.verifiableCredential).toEqual([decodedSdJwtVcWithDisclosuresRemoved.compactSdJwtVc]);
  });

  it('selectFrom with vc+sd-jwt format already decoded', () => {
    const result = pex.selectFrom(getPresentationDefinitionV2(), [decodedSdJwtVc]);
    expect(result.errors?.length).toEqual(0);
    expect(result.matches).toEqual([
      {
        name: 'Washington State Business License',
        areRequiredCredentialsPresent: Status.INFO,
        vc_path: ['$.verifiableCredential[0]'],
        type: SubmissionRequirementMatchType.InputDescriptor,
        id: 'wa_driver_license',
      },
    ]);
    expect(result.areRequiredCredentialsPresent).toBe('info');

    // Should have already applied selective disclosure on the SD-JWT
    expect(result.verifiableCredential).toEqual([decodedSdJwtVcWithDisclosuresRemoved]);
  });

  it('presentationFrom vc+sd-jwt format', () => {
    const presentationDefinition = getPresentationDefinitionV2();
    const selectResults = pex.selectFrom(presentationDefinition, [decodedSdJwtVc]);
    const presentationResult = pex.presentationFrom(presentationDefinition, selectResults.verifiableCredential!);

    expect(presentationResult.presentationSubmission).toEqual({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          format: 'vc+sd-jwt',
          id: 'wa_driver_license',
          path: '$',
        },
      ],
      id: expect.any(String),
    });

    // Must be external for SD-JWT
    expect(presentationResult.presentationSubmissionLocation).toEqual(PresentationSubmissionLocation.EXTERNAL);
    expect(presentationResult.presentations[0]).toEqual({
      ...decodedSdJwtVcWithDisclosuresRemoved,
      kbJwt: {
        header: {
          typ: 'kb+jwt',
        },
        payload: {
          iat: expect.any(Number),
          nonce: undefined,
          sd_hash: calculateSdHash(decodedSdJwtVcWithDisclosuresRemoved.compactSdJwtVc, 'sha-256'),
        },
      },
    });
  });

  it('verifiablePresentationFrom and evaluatePresentation with vc+sd-jwt format', async () => {
    const presentationDefinition = getPresentationDefinitionV2();
    const selectResults = pex.selectFrom(presentationDefinition, [decodedSdJwtVc]);
    let kbJwt: string | undefined = undefined;
    selectResults.verifiableCredential;
    const presentationResult = await pex.verifiablePresentationFrom(
      presentationDefinition,
      selectResults.verifiableCredential!,
      async (options) => {
        const sdJwtCredential = options.presentation as SdJwtDecodedVerifiableCredential;

        kbJwt = `${Buffer.from(
          JSON.stringify({
            ...sdJwtCredential.kbJwt?.header,
            alg: 'EdDSA',
          }),
        ).toString('base64url')}.${Buffer.from(
          JSON.stringify({
            ...sdJwtCredential.kbJwt?.payload,
            nonce: 'nonce-from-request',
            // verifier identifier url (not clear yet in HAIP what this should be, but it MUST be present)
            aud: 'did:web:something',
          }),
        ).toString('base64url')}.signature`;
        return `${sdJwtCredential.compactSdJwtVc}${kbJwt}`;
      },
      {
        presentationSubmissionLocation: PresentationSubmissionLocation.EXTERNAL,
      },
    );

    // path_nested should not be used for sd-jwt
    expect(presentationResult.presentationSubmission.descriptor_map[0].path_nested).toBeUndefined();
    expect(presentationResult.presentationSubmission).toEqual({
      definition_id: '32f54163-7166-48f1-93d8-ff217bdb0653',
      descriptor_map: [
        {
          format: 'vc+sd-jwt',
          id: 'wa_driver_license',
          path: '$',
        },
      ],
      id: expect.any(String),
    });

    // Must be external for SD-JWT
    expect(presentationResult.presentationSubmissionLocation).toEqual(PresentationSubmissionLocation.EXTERNAL);
    // Expect the KB-JWT to be appended
    expect(presentationResult.verifiablePresentations[0]).toEqual(decodedSdJwtVcWithDisclosuresRemoved.compactSdJwtVc + kbJwt);

    const evaluateResults = pex.evaluatePresentation(presentationDefinition, presentationResult.verifiablePresentations[0], {
      presentationSubmission: presentationResult.presentationSubmission,
    });

    expect(evaluateResults).toEqual({
      // Do we want to return the compact variant here? Or the decoded/pretty variant?
      presentations: [decodedSdJwtVcWithDisclosuresRemoved.compactSdJwtVc + kbJwt],
      areRequiredCredentialsPresent: Status.INFO,
      warnings: [],
      errors: [],
      value: presentationResult.presentationSubmission,
    });
  });

  it('select where only one of requested credentials is present', async () => {
    const presentationDefinition = getPresentationDefinitionV2PidAndMdl();
    const selectResults = pex.selectFrom(presentationDefinition, [pidSdJwt]);

    expect(selectResults).toEqual({
      errors: [
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
      ],
      matches: [
        {
          areRequiredCredentialsPresent: 'error',
          id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
          type: SubmissionRequirementMatchType.InputDescriptor,
          vc_path: [],
        },
        {
          areRequiredCredentialsPresent: Status.INFO,
          id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
          type: SubmissionRequirementMatchType.InputDescriptor,
          vc_path: ['$.verifiableCredential[0]'],
        },
      ],
      areRequiredCredentialsPresent: 'error',
      verifiableCredential: [
        'eyJ4NWMiOlsiTUlJQ2REQ0NBaHVnQXdJQkFnSUJBakFLQmdncWhrak9QUVFEQWpDQmlERUxNQWtHQTFVRUJoTUNSRVV4RHpBTkJnTlZCQWNNQmtKbGNteHBiakVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneEVUQVBCZ05WQkFzTUNGUWdRMU1nU1VSRk1UWXdOQVlEVlFRRERDMVRVRkpKVGtRZ1JuVnVhMlVnUlZWRVNTQlhZV3hzWlhRZ1VISnZkRzkwZVhCbElFbHpjM1ZwYm1jZ1EwRXdIaGNOTWpRd05UTXhNRGd4TXpFM1doY05NalV3TnpBMU1EZ3hNekUzV2pCc01Rc3dDUVlEVlFRR0V3SkVSVEVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneENqQUlCZ05WQkFzTUFVa3hNakF3QmdOVkJBTU1LVk5RVWtsT1JDQkdkVzVyWlNCRlZVUkpJRmRoYkd4bGRDQlFjbTkwYjNSNWNHVWdTWE56ZFdWeU1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRU9GQnE0WU1LZzR3NWZUaWZzeXR3QnVKZi83RTdWaFJQWGlObTUyUzNxMUVUSWdCZFh5REsza1Z4R3hnZUhQaXZMUDN1dU12UzZpREVjN3FNeG12ZHVLT0JrRENCalRBZEJnTlZIUTRFRmdRVWlQaENrTEVyRFhQTFcyL0owV1ZlZ2h5dyttSXdEQVlEVlIwVEFRSC9CQUl3QURBT0JnTlZIUThCQWY4RUJBTUNCNEF3TFFZRFZSMFJCQ1l3SklJaVpHVnRieTV3YVdRdGFYTnpkV1Z5TG1KMWJtUmxjMlJ5ZFdOclpYSmxhUzVrWlRBZkJnTlZIU01FR0RBV2dCVFVWaGpBaVRqb0RsaUVHTWwyWXIrcnU4V1F2akFLQmdncWhrak9QUVFEQWdOSEFEQkVBaUFiZjVUemtjUXpoZldvSW95aTFWTjdkOEk5QnNGS20xTVdsdVJwaDJieUdRSWdLWWtkck5mMnhYUGpWU2JqVy9VLzVTNXZBRUM1WHhjT2FudXNPQnJvQmJVPSIsIk1JSUNlVENDQWlDZ0F3SUJBZ0lVQjVFOVFWWnRtVVljRHRDaktCL0gzVlF2NzJnd0NnWUlLb1pJemowRUF3SXdnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUI0WERUSTBNRFV6TVRBMk5EZ3dPVm9YRFRNME1EVXlPVEEyTkRnd09Wb3dnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFWUd6ZHdGRG5jNytLbjVpYkF2Q09NOGtlNzdWUXhxZk1jd1pMOElhSUErV0NST2NDZm1ZL2dpSDkycU1ydTVwL2t5T2l2RTBSQy9JYmRNT052RG9VeWFObU1HUXdIUVlEVlIwT0JCWUVGTlJXR01DSk9PZ09XSVFZeVhaaXY2dTd4WkMrTUI4R0ExVWRJd1FZTUJhQUZOUldHTUNKT09nT1dJUVl5WFppdjZ1N3haQytNQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUF3RGdZRFZSMFBBUUgvQkFRREFnR0dNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJR0VtN3drWktIdC9hdGI0TWRGblhXNnlybndNVVQydTEzNmdkdGwxMFk2aEFpQnVURnF2Vll0aDFyYnh6Q1AweFdaSG1RSzlrVnl4bjhHUGZYMjdFSXp6c3c9PSJdLCJraWQiOiJNSUdVTUlHT3BJR0xNSUdJTVFzd0NRWURWUVFHRXdKRVJURVBNQTBHQTFVRUJ3d0dRbVZ5YkdsdU1SMHdHd1lEVlFRS0RCUkNkVzVrWlhOa2NuVmphMlZ5WldrZ1IyMWlTREVSTUE4R0ExVUVDd3dJVkNCRFV5QkpSRVV4TmpBMEJnTlZCQU1NTFZOUVVrbE9SQ0JHZFc1clpTQkZWVVJKSUZkaGJHeGxkQ0JRY205MGIzUjVjR1VnU1hOemRXbHVaeUJEUVFJQkFnPT0iLCJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJwbGFjZV9vZl9iaXJ0aCI6eyJfc2QiOlsiVS01ZlVXLU5EM1laajZTcUdyQXV4NXJWYWZOalhqZ2hvMmRUUmpQX3hOTSJdfSwiX3NkIjpbIjlFaUpQNEw2NDI0bEtTVGs5NHpIOWhaWVc5UjNuS1R3V0V5TVBJN2dvWHciLCJHVlhRWEtFMmpWR1d0VEF6T1d5ck85TTZySW1qYkZJWGFnRkMyWElMbGhJIiwiUUV2bHpNd0ozZS1tOEtpWEk5bGx2bnVQblh5UHRXN2VCSF9GcXFVTnk3WSIsImljWkpTRkFqLVg3T29Sam5vRFRReXFwU1dNQUVuaTcydWZDZmFFWC1uQkUiLCJsUHJqb3BqbEN5bFdHWVo0cmh4S1RUTUsxS3p1Sm5ISUtybzNwUUhlUXF3IiwicjJORHZtRFY3QmU3TlptVFR0VE9fekdZX3RTdWdYVXoxeDJBXzZuOFhvdyIsInJPbjFJUkpUQWtEV1pSTGc3MUYzaDVsbFpPc1ZPMl9aemlOUy1majNEUFUiXSwiYWRkcmVzcyI6eyJfc2QiOlsiQnI1aVZtZnZlaTloQ01mMktVOGRFVjFER2hrdUtsQ1pUeGFEQ0FMb3NJbyIsIkx6czJpR09SNHF0clhhYmdwMzFfcjFFUFNmazlaUDJQRElJUTRQaHlPT00iLCJadUV5cG41Y0s0WVpWdHdkeGFoWXJqMjZ1MFI2UmxpOVVJWlNjUGhoWTB3Iiwidi1rMzl2VGI5NFI5a25VWTZtbzlXUVdEQkNJS3lya0J4bExTQVl3T2MyNCJdfSwiaXNzdWluZ19jb3VudHJ5IjoiREUiLCJ2Y3QiOiJodHRwczovL2V4YW1wbGUuYm1pLmJ1bmQuZGUvY3JlZGVudGlhbC9waWQvMS4wIiwiaXNzdWluZ19hdXRob3JpdHkiOiJERSIsIl9zZF9hbGciOiJzaGEtMjU2IiwiaXNzIjoiaHR0cHM6Ly9kZW1vLnBpZC1pc3N1ZXIuYnVuZGVzZHJ1Y2tlcmVpLmRlL2MxIiwiY25mIjp7Imp3ayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6IkhzS194Tl95SVU4eWlqdW9BWlhsbndFRU00ZlhZenVNRmd5TTE5SmRYMUkiLCJ5IjoiQUR2NnplVDl3YmgxU0ZxMG14TkcxMUZueC05eFdSRFcwR18xN1dSRXpRSSJ9fSwiZXhwIjoxNzMzNTcxMzI3LCJpYXQiOjE3MzIzNjE3MjcsImFnZV9lcXVhbF9vcl9vdmVyIjp7Il9zZCI6WyJLRDF0U0hnYWotZi1qbkZURkRDMW1sZ0RwNzhMZE1KcHlqWnRRU0k4a1ZnIiwiTDRjTTMtZU1mRHg0Znc2UEw3OVRTVFBnM042VXdzOGNPc3JOYmNqaEEtYyIsImRYUFBQX2lmNFM3XzBzcXZXNTBwZEdlMWszbS1wMnM3M1JicDlncThGaDAiLCJtYnllcU05YUkzRkVvWmFoODA5eTN0dlRCV1NvZTBMSlRUYTlONGNjdmlZIiwicm1zd0dEZnhvS0ZFYlFsNzZ4S1ZVT0hrX0MyQlVpVnQ5RDlvMTFrMmZNSSIsInZsY2Y4WTNhQnNTeEZBeVZfYk9NTndvX3FTT1pHc3ViSVZiY0FVSWVBSGMiXX19.gruqjNOuJBgHXEnG9e60wOoqiyEaL1K9pdL215a0ffZCjtIZ_kICDrO5vBiTrEmvjjd6w_N_thEYLhzob77Epg~WyJWRXlWQWF0LXoyNU8tbkQ0MVBaOGdnIiwiZmFtaWx5X25hbWUiLCJNVVNURVJNQU5OIl0~WyJLcnRPei1lRk9hMU9JYmpmUHUxcHRBIiwiZ2l2ZW5fbmFtZSIsIkVSSUtBIl0~WyJQQUVjSHp0NWk5bFFzNUZlRmFGUS1RIiwiYmlydGhkYXRlIiwiMTk2NC0wOC0xMiJd~',
      ],
      warnings: [],
      vcIndexes: [0],
    });
  });

  it('select where only one of requested credentials is present with submission requirements', async () => {
    const presentationDefinition = getPresentationDefinitionV2PidAndMdl();
    presentationDefinition.submission_requirements = [
      {
        rule: 'all',
        from: 'A',
      },
      {
        rule: 'pick',
        count: 1,
        from: 'B',
      },
    ];
    const selectResults = pex.selectFrom(presentationDefinition, [pidSdJwt]);
    expect(selectResults).toEqual({
      errors: [
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
      ],
      matches: [
        {
          id: 0,
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from: 'A',
          areRequiredCredentialsPresent: 'error',
          rule: {
            type: 'all',
            count: 1,
          },
          input_descriptors: [
            {
              id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
              type: SubmissionRequirementMatchType.InputDescriptor,
              vc_path: [],
              areRequiredCredentialsPresent: 'error',
            },
          ],
        },
        {
          id: 1,
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from: 'B',
          areRequiredCredentialsPresent: Status.INFO,
          rule: {
            type: 'pick',
            count: 1,
          },
          input_descriptors: [
            {
              id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
              type: SubmissionRequirementMatchType.InputDescriptor,
              vc_path: ['$.verifiableCredential[0]'],
              areRequiredCredentialsPresent: Status.INFO,
            },
          ],
        },
      ],
      areRequiredCredentialsPresent: 'error',
      verifiableCredential: [pidSdJwt],
      warnings: [],
      vcIndexes: [0],
    });
  });

  it('select where only one of requested credentials is present with nested submission requirements', async () => {
    const presentationDefinition = getPresentationDefinitionV2PidAndMdl();
    presentationDefinition.submission_requirements = [
      {
        rule: 'pick',
        count: 2,
        from_nested: [
          {
            from: 'A',
            rule: 'all',
          },
          {
            rule: 'all',
            from: 'B',
          },
        ],
      },
      {
        rule: 'pick',
        count: 1,
        from_nested: [
          {
            from: 'A',
            rule: 'all',
          },
          {
            rule: 'all',
            from: 'B',
          },
        ],
      },
      {
        rule: 'all',
        from_nested: [
          {
            from: 'A',
            rule: 'pick',
            count: 1,
          },
          {
            rule: 'pick',
            from: 'B',
            count: 1,
          },
        ],
      },
      {
        rule: 'all',
        from: 'B',
      },
      {
        rule: 'all',
        from: 'A',
      },
    ];
    const selectResults = pex.selectFrom(presentationDefinition, [pidSdJwt]);
    expect(selectResults).toEqual({
      errors: [
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate does not contain property: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'FilterEvaluation',
          status: 'error',
          message: 'Input candidate failed filter evaluation: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
        {
          tag: 'MarkForSubmissionEvaluation',
          status: 'error',
          message: 'The input candidate is not eligible for submission: $.input_descriptors[0]: $.verifiableCredential[0]',
        },
      ],
      matches: [
        {
          id: 0,
          areRequiredCredentialsPresent: 'error',
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from_nested: [
            {
              id: 0,
              type: SubmissionRequirementMatchType.SubmissionRequirement,
              from: 'A',
              areRequiredCredentialsPresent: 'error',
              rule: {
                type: 'all',
                count: 1,
              },
              input_descriptors: [
                {
                  id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
                  type: SubmissionRequirementMatchType.InputDescriptor,
                  vc_path: [],
                  areRequiredCredentialsPresent: 'error',
                },
              ],
            },
            {
              id: 1,
              type: SubmissionRequirementMatchType.SubmissionRequirement,
              from: 'B',
              areRequiredCredentialsPresent: Status.INFO,
              rule: {
                type: 'all',
                count: 1,
              },
              input_descriptors: [
                {
                  id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
                  type: SubmissionRequirementMatchType.InputDescriptor,
                  vc_path: ['$.verifiableCredential[0]'],
                  areRequiredCredentialsPresent: Status.INFO,
                },
              ],
            },
          ],
          rule: {
            type: 'pick',
            count: 2,
          },
        },
        {
          id: 1,
          areRequiredCredentialsPresent: Status.INFO,
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from_nested: [
            {
              id: 0,
              type: SubmissionRequirementMatchType.SubmissionRequirement,
              from: 'A',
              areRequiredCredentialsPresent: 'error',
              rule: {
                type: 'all',
                count: 1,
              },
              input_descriptors: [
                {
                  id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
                  type: SubmissionRequirementMatchType.InputDescriptor,
                  vc_path: [],
                  areRequiredCredentialsPresent: 'error',
                },
              ],
            },
            {
              id: 1,
              type: SubmissionRequirementMatchType.SubmissionRequirement,
              from: 'B',
              areRequiredCredentialsPresent: Status.INFO,
              rule: {
                type: 'all',
                count: 1,
              },
              input_descriptors: [
                {
                  id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
                  type: SubmissionRequirementMatchType.InputDescriptor,
                  vc_path: ['$.verifiableCredential[0]'],
                  areRequiredCredentialsPresent: Status.INFO,
                },
              ],
            },
          ],
          rule: {
            type: 'pick',
            count: 1,
          },
        },
        {
          id: 2,
          areRequiredCredentialsPresent: 'error',
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from_nested: [
            {
              id: 0,
              type: SubmissionRequirementMatchType.SubmissionRequirement,
              from: 'A',
              areRequiredCredentialsPresent: 'error',
              rule: {
                type: 'pick',
                count: 1,
              },
              input_descriptors: [
                {
                  id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
                  type: SubmissionRequirementMatchType.InputDescriptor,
                  vc_path: [],
                  areRequiredCredentialsPresent: 'error',
                },
              ],
            },
            {
              id: 1,
              type: SubmissionRequirementMatchType.SubmissionRequirement,
              from: 'B',
              areRequiredCredentialsPresent: Status.INFO,
              rule: {
                type: 'pick',
                count: 1,
              },
              input_descriptors: [
                {
                  id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
                  type: SubmissionRequirementMatchType.InputDescriptor,
                  vc_path: ['$.verifiableCredential[0]'],
                  areRequiredCredentialsPresent: Status.INFO,
                },
              ],
            },
          ],
          rule: {
            type: 'all',
            count: 2,
          },
        },
        {
          id: 3,
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from: 'B',
          areRequiredCredentialsPresent: Status.INFO,
          rule: {
            type: 'all',
            count: 1,
          },
          input_descriptors: [
            {
              id: '99fce09b-a0d3-415b-b8a7-3eab8829babc',
              type: SubmissionRequirementMatchType.InputDescriptor,
              vc_path: ['$.verifiableCredential[0]'],
              areRequiredCredentialsPresent: Status.INFO,
            },
          ],
        },
        {
          id: 4,
          type: SubmissionRequirementMatchType.SubmissionRequirement,
          from: 'A',
          areRequiredCredentialsPresent: 'error',
          rule: {
            type: 'all',
            count: 1,
          },
          input_descriptors: [
            {
              id: 'bf8669f4-0cf3-4d16-b72b-b47eb702a7cd',
              type: SubmissionRequirementMatchType.InputDescriptor,
              vc_path: [],
              areRequiredCredentialsPresent: 'error',
            },
          ],
        },
      ],
      areRequiredCredentialsPresent: 'error',
      verifiableCredential: [
        'eyJ4NWMiOlsiTUlJQ2REQ0NBaHVnQXdJQkFnSUJBakFLQmdncWhrak9QUVFEQWpDQmlERUxNQWtHQTFVRUJoTUNSRVV4RHpBTkJnTlZCQWNNQmtKbGNteHBiakVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneEVUQVBCZ05WQkFzTUNGUWdRMU1nU1VSRk1UWXdOQVlEVlFRRERDMVRVRkpKVGtRZ1JuVnVhMlVnUlZWRVNTQlhZV3hzWlhRZ1VISnZkRzkwZVhCbElFbHpjM1ZwYm1jZ1EwRXdIaGNOTWpRd05UTXhNRGd4TXpFM1doY05NalV3TnpBMU1EZ3hNekUzV2pCc01Rc3dDUVlEVlFRR0V3SkVSVEVkTUJzR0ExVUVDZ3dVUW5WdVpHVnpaSEoxWTJ0bGNtVnBJRWR0WWtneENqQUlCZ05WQkFzTUFVa3hNakF3QmdOVkJBTU1LVk5RVWtsT1JDQkdkVzVyWlNCRlZVUkpJRmRoYkd4bGRDQlFjbTkwYjNSNWNHVWdTWE56ZFdWeU1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRU9GQnE0WU1LZzR3NWZUaWZzeXR3QnVKZi83RTdWaFJQWGlObTUyUzNxMUVUSWdCZFh5REsza1Z4R3hnZUhQaXZMUDN1dU12UzZpREVjN3FNeG12ZHVLT0JrRENCalRBZEJnTlZIUTRFRmdRVWlQaENrTEVyRFhQTFcyL0owV1ZlZ2h5dyttSXdEQVlEVlIwVEFRSC9CQUl3QURBT0JnTlZIUThCQWY4RUJBTUNCNEF3TFFZRFZSMFJCQ1l3SklJaVpHVnRieTV3YVdRdGFYTnpkV1Z5TG1KMWJtUmxjMlJ5ZFdOclpYSmxhUzVrWlRBZkJnTlZIU01FR0RBV2dCVFVWaGpBaVRqb0RsaUVHTWwyWXIrcnU4V1F2akFLQmdncWhrak9QUVFEQWdOSEFEQkVBaUFiZjVUemtjUXpoZldvSW95aTFWTjdkOEk5QnNGS20xTVdsdVJwaDJieUdRSWdLWWtkck5mMnhYUGpWU2JqVy9VLzVTNXZBRUM1WHhjT2FudXNPQnJvQmJVPSIsIk1JSUNlVENDQWlDZ0F3SUJBZ0lVQjVFOVFWWnRtVVljRHRDaktCL0gzVlF2NzJnd0NnWUlLb1pJemowRUF3SXdnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUI0WERUSTBNRFV6TVRBMk5EZ3dPVm9YRFRNME1EVXlPVEEyTkRnd09Wb3dnWWd4Q3pBSkJnTlZCQVlUQWtSRk1ROHdEUVlEVlFRSERBWkNaWEpzYVc0eEhUQWJCZ05WQkFvTUZFSjFibVJsYzJSeWRXTnJaWEpsYVNCSGJXSklNUkV3RHdZRFZRUUxEQWhVSUVOVElFbEVSVEUyTURRR0ExVUVBd3d0VTFCU1NVNUVJRVoxYm10bElFVlZSRWtnVjJGc2JHVjBJRkJ5YjNSdmRIbHdaU0JKYzNOMWFXNW5JRU5CTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFWUd6ZHdGRG5jNytLbjVpYkF2Q09NOGtlNzdWUXhxZk1jd1pMOElhSUErV0NST2NDZm1ZL2dpSDkycU1ydTVwL2t5T2l2RTBSQy9JYmRNT052RG9VeWFObU1HUXdIUVlEVlIwT0JCWUVGTlJXR01DSk9PZ09XSVFZeVhaaXY2dTd4WkMrTUI4R0ExVWRJd1FZTUJhQUZOUldHTUNKT09nT1dJUVl5WFppdjZ1N3haQytNQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUF3RGdZRFZSMFBBUUgvQkFRREFnR0dNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJR0VtN3drWktIdC9hdGI0TWRGblhXNnlybndNVVQydTEzNmdkdGwxMFk2aEFpQnVURnF2Vll0aDFyYnh6Q1AweFdaSG1RSzlrVnl4bjhHUGZYMjdFSXp6c3c9PSJdLCJraWQiOiJNSUdVTUlHT3BJR0xNSUdJTVFzd0NRWURWUVFHRXdKRVJURVBNQTBHQTFVRUJ3d0dRbVZ5YkdsdU1SMHdHd1lEVlFRS0RCUkNkVzVrWlhOa2NuVmphMlZ5WldrZ1IyMWlTREVSTUE4R0ExVUVDd3dJVkNCRFV5QkpSRVV4TmpBMEJnTlZCQU1NTFZOUVVrbE9SQ0JHZFc1clpTQkZWVVJKSUZkaGJHeGxkQ0JRY205MGIzUjVjR1VnU1hOemRXbHVaeUJEUVFJQkFnPT0iLCJ0eXAiOiJ2YytzZC1qd3QiLCJhbGciOiJFUzI1NiJ9.eyJwbGFjZV9vZl9iaXJ0aCI6eyJfc2QiOlsiVS01ZlVXLU5EM1laajZTcUdyQXV4NXJWYWZOalhqZ2hvMmRUUmpQX3hOTSJdfSwiX3NkIjpbIjlFaUpQNEw2NDI0bEtTVGs5NHpIOWhaWVc5UjNuS1R3V0V5TVBJN2dvWHciLCJHVlhRWEtFMmpWR1d0VEF6T1d5ck85TTZySW1qYkZJWGFnRkMyWElMbGhJIiwiUUV2bHpNd0ozZS1tOEtpWEk5bGx2bnVQblh5UHRXN2VCSF9GcXFVTnk3WSIsImljWkpTRkFqLVg3T29Sam5vRFRReXFwU1dNQUVuaTcydWZDZmFFWC1uQkUiLCJsUHJqb3BqbEN5bFdHWVo0cmh4S1RUTUsxS3p1Sm5ISUtybzNwUUhlUXF3IiwicjJORHZtRFY3QmU3TlptVFR0VE9fekdZX3RTdWdYVXoxeDJBXzZuOFhvdyIsInJPbjFJUkpUQWtEV1pSTGc3MUYzaDVsbFpPc1ZPMl9aemlOUy1majNEUFUiXSwiYWRkcmVzcyI6eyJfc2QiOlsiQnI1aVZtZnZlaTloQ01mMktVOGRFVjFER2hrdUtsQ1pUeGFEQ0FMb3NJbyIsIkx6czJpR09SNHF0clhhYmdwMzFfcjFFUFNmazlaUDJQRElJUTRQaHlPT00iLCJadUV5cG41Y0s0WVpWdHdkeGFoWXJqMjZ1MFI2UmxpOVVJWlNjUGhoWTB3Iiwidi1rMzl2VGI5NFI5a25VWTZtbzlXUVdEQkNJS3lya0J4bExTQVl3T2MyNCJdfSwiaXNzdWluZ19jb3VudHJ5IjoiREUiLCJ2Y3QiOiJodHRwczovL2V4YW1wbGUuYm1pLmJ1bmQuZGUvY3JlZGVudGlhbC9waWQvMS4wIiwiaXNzdWluZ19hdXRob3JpdHkiOiJERSIsIl9zZF9hbGciOiJzaGEtMjU2IiwiaXNzIjoiaHR0cHM6Ly9kZW1vLnBpZC1pc3N1ZXIuYnVuZGVzZHJ1Y2tlcmVpLmRlL2MxIiwiY25mIjp7Imp3ayI6eyJrdHkiOiJFQyIsImNydiI6IlAtMjU2IiwieCI6IkhzS194Tl95SVU4eWlqdW9BWlhsbndFRU00ZlhZenVNRmd5TTE5SmRYMUkiLCJ5IjoiQUR2NnplVDl3YmgxU0ZxMG14TkcxMUZueC05eFdSRFcwR18xN1dSRXpRSSJ9fSwiZXhwIjoxNzMzNTcxMzI3LCJpYXQiOjE3MzIzNjE3MjcsImFnZV9lcXVhbF9vcl9vdmVyIjp7Il9zZCI6WyJLRDF0U0hnYWotZi1qbkZURkRDMW1sZ0RwNzhMZE1KcHlqWnRRU0k4a1ZnIiwiTDRjTTMtZU1mRHg0Znc2UEw3OVRTVFBnM042VXdzOGNPc3JOYmNqaEEtYyIsImRYUFBQX2lmNFM3XzBzcXZXNTBwZEdlMWszbS1wMnM3M1JicDlncThGaDAiLCJtYnllcU05YUkzRkVvWmFoODA5eTN0dlRCV1NvZTBMSlRUYTlONGNjdmlZIiwicm1zd0dEZnhvS0ZFYlFsNzZ4S1ZVT0hrX0MyQlVpVnQ5RDlvMTFrMmZNSSIsInZsY2Y4WTNhQnNTeEZBeVZfYk9NTndvX3FTT1pHc3ViSVZiY0FVSWVBSGMiXX19.gruqjNOuJBgHXEnG9e60wOoqiyEaL1K9pdL215a0ffZCjtIZ_kICDrO5vBiTrEmvjjd6w_N_thEYLhzob77Epg~WyJWRXlWQWF0LXoyNU8tbkQ0MVBaOGdnIiwiZmFtaWx5X25hbWUiLCJNVVNURVJNQU5OIl0~WyJLcnRPei1lRk9hMU9JYmpmUHUxcHRBIiwiZ2l2ZW5fbmFtZSIsIkVSSUtBIl0~WyJQQUVjSHp0NWk5bFFzNUZlRmFGUS1RIiwiYmlydGhkYXRlIiwiMTk2NC0wOC0xMiJd~',
      ],
      warnings: [],
      vcIndexes: [0],
    });
  });
});
