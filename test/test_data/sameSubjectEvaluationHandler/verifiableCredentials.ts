import {VerifiableCredential} from "../../../lib";

export class SameSubjectVerifiableCredential {

  public getVerifiableCredential(): VerifiableCredential[] {
    return [
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2020081200",
          field1Key: "field1Value"
        },
        id: "867bfe7a-5b91-46b2-aaaa-70028b8d9aaa",
        issuer: "VC1Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2020081200",
          field2Key: "field2Value"
        },
        id: "867bfe7a-5b91-46b2-bbbb-70028b8d9bbb",
        issuer: "VC2Issuer",
        issuanceDate: '',
        type: [
          "VerifiableCredential"
        ],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2020081205",
          field3Key: "field3Value"
        },
        id: "867bfe7a-5b91-46b2-cccc-70028b8d9ccc",
        issuer: "VC3Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2020081205",
          field4Key: "field4Value"
        },
        id: "867bfe7a-5b91-46b2-dddd-70028b8d9ddd",
        issuer: "VC4Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2021110800",
          field5Key: "field5Value"
        },
        id: "867bfe7a-5b91-46b2-aaaa-70028b8d9eee",
        issuer: "VC5Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2021110800",
          field6Key: "field6Value"
        },
        id: "867bfe7a-5b91-46b2-bbbb-70028b8d9fff",
        issuer: "VC6Issuer",
        issuanceDate: '',
        type: [
          "VerifiableCredential"
        ],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2021110801",
          field7Key: "field7Value"
        },
        id: "867bfe7a-5b91-46b2-cccc-70028b8d9ggg",
        issuer: "VC7Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2021110802",
          field8Key: "field8Value"
        },
        id: "867bfe7a-5b91-46b2-dddd-70028b8d9hhh",
        issuer: "VC8Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2021110803",
          field11Key: "field11Value"
        },
        id: "867bfe7a-5b91-46b2-cccc-70028b8d9iii",
        issuer: "VC11Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      },
      {
        "@context": [
          "https://www.w3.org/2018/credentials/v1"
        ],
        credentialSchema: [
          {
            id: "https://www.w3.org/TR/vc-data-model/#types"
          }
        ],
        credentialSubject: {
          id: "VCSubject2021110804",
          field12Key: "field12Value"
        },
        id: "867bfe7a-5b91-46b2-dddd-70028b8d9jjj",
        issuer: "VC12Issuer",
        issuanceDate: '',
        type: ["VerifiableCredential"],
        proof: {
          type: '',
          verificationMethod: '',
          proofPurpose: '',
          jws: '',
          created: ''
        }
      }
    ];
  }
}