/* eslint-disable @typescript-eslint/no-explicit-any */
import { cborEncode, DateOnly, IssuerSignedDocument, MDoc, parseDeviceResponse, parseIssuerSigned, uint8ArrayToBase64Url } from '@animo-id/mdoc';
import {
  WrappedVerifiableCredential as _WrappedVerifiableCredential,
  WrappedVerifiablePresentation as _WrappedVerifiablePresentation,
  CredentialMapper,
  HasherSync,
  ICredential,
  IPresentation,
  IVerifiablePresentation,
  JwtDecodedVerifiableCredential,
  JwtDecodedVerifiablePresentation,
  OriginalType,
  SdJwtDecodedVerifiableCredential,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
  WrappedSdJwtVerifiableCredential,
  WrappedSdJwtVerifiablePresentation,
  WrappedW3CVerifiableCredential,
  WrappedW3CVerifiablePresentation,
} from '@sphereon/ssi-types';
import * as u8a from 'uint8arrays';

export interface WrappedMdocCredential {
  /**
   * Original IssuerSigned to Mdoc that we've received. Can be either the encoded or decoded variant.
   */
  original: IssuerSignedDocument | string;
  /**
   * Record where keys are the namespaces and the values are objects again with the namespace values
   * @todo which types can be there? (it doesn't matter for matching as mdoc only matches on path)
   */
  decoded: MdocDecodedPayload;
  /**
   * Type of this credential.
   */
  type: OriginalType.MSO_MDOC_DECODED | OriginalType.MSO_MDOC_ENCODED;
  /**
   * The claim format, typically used during exchange transport protocols
   */
  format: 'mso_mdoc';
  /**
   * Internal stable representation of a Credential
   */
  credential: IssuerSignedDocument;
}

export interface WrappedMdocPresentation {
  /**
   * Original VP that we've received. Can be either the encoded or decoded variant.
   */
  original: MDoc | string;
  /**
   * Decoded version of the mdoc payload. This is the decoded payload, rather than the whole mdoc
   */
  decoded: MDoc;
  /**
   * Type of this Presentation.
   */
  type: OriginalType.MSO_MDOC_ENCODED | OriginalType.MSO_MDOC_DECODED;
  /**
   * The claim format, typically used during exchange transport protocols
   */
  format: 'mso_mdoc';
  /**
   * Internal stable representation of a Presentation
   */
  presentation: MDoc;
  /**
   * Wrapped Mdocs belonging to the Presentation. There can be multiple
   * documents in a single device response
   */
  vcs: WrappedMdocCredential[];
}

export type OriginalVerifiablePresentation =
  | W3CVerifiablePresentation
  | JwtDecodedVerifiablePresentation
  | SdJwtDecodedVerifiableCredential
  | string
  | MDoc;

export type OriginalVerifiableCredential =
  | W3CVerifiableCredential
  | JwtDecodedVerifiableCredential
  | SdJwtDecodedVerifiableCredential
  | string
  | IssuerSignedDocument;

export type WrappedVerifiableCredential = Exclude<_WrappedVerifiableCredential, { format: 'mso_mdoc' }> | WrappedMdocCredential;
export type WrappedVerifiablePresentation = Exclude<_WrappedVerifiablePresentation, { format: 'mso_mdoc' }> | WrappedMdocPresentation;

// NOTE: this is partial reimplementation of CredentialMapper from ssi-types to overwrite the
// methods relying on Sphereon's mdoc implementation
export class PexCredentialMapper {
  public static isMsoMdocDecodedPresentation(original: OriginalVerifiablePresentation): original is MDoc {
    return original instanceof MDoc;
  }

  public static isMsoMdocDecodedCredential(
    original: OriginalVerifiableCredential | OriginalVerifiablePresentation | ICredential | IPresentation,
  ): original is IssuerSignedDocument {
    return original instanceof IssuerSignedDocument;
  }

  /**
   * Decodes a Verifiable Presentation to a uniform format.
   *
   * When decoding SD-JWT credentials, a hasher implementation must be provided. The hasher implementation must be sync. When using
   * an async hasher implementation, use the decodeSdJwtVcAsync method instead and you can provide the decoded payload to methods
   * instead of the compact SD-JWT.
   *
   * @param presentation
   * @param hasher Hasher implementation to use for SD-JWT decoding.
   */
  static decodeVerifiablePresentation(
    presentation: OriginalVerifiablePresentation,
    hasher?: HasherSync,
  ): JwtDecodedVerifiablePresentation | IVerifiablePresentation | SdJwtDecodedVerifiableCredential | string | MDoc {
    if (CredentialMapper.isMsoMdocOid4VPEncoded(presentation as any)) {
      return presentation as string;
    } else if (this.isMsoMdocDecodedPresentation(presentation)) {
      return presentation as MDoc;
    } else {
      return CredentialMapper.decodeVerifiablePresentation(presentation, hasher) as any;
    }
  }

  public static isW3cCredential(credential: ICredential | SdJwtDecodedVerifiableCredential | IssuerSignedDocument): credential is ICredential {
    return CredentialMapper.isW3cCredential(credential as any);
  }

  /**
   * Converts a presentation to a wrapped presentation.
   *
   * When decoding SD-JWT credentials, a hasher implementation must be provided. The hasher implementation must be sync. When using
   * an async hasher implementation, use the decodeSdJwtVcAsync method instead and you can provide the decoded payload to methods
   * instead of the compact SD-JWT.
   *
   * @param hasher Hasher implementation to use for SD-JWT decoding
   */
  static toWrappedVerifiablePresentation(
    originalPresentation: OriginalVerifiablePresentation,
    opts?: { maxTimeSkewInMS?: number; hasher?: HasherSync },
  ): WrappedVerifiablePresentation {
    // MSO_MDOC
    if (this.isMsoMdocDecodedPresentation(originalPresentation) || CredentialMapper.isMsoMdocOid4VPEncoded(originalPresentation)) {
      let deviceResponse: MDoc;
      let originalType: OriginalType;
      if (CredentialMapper.isMsoMdocOid4VPEncoded(originalPresentation as any)) {
        deviceResponse = parseDeviceResponse(convertBase64urlToBinary(originalPresentation as string));
        originalType = OriginalType.MSO_MDOC_ENCODED;
      } else {
        deviceResponse = originalPresentation as MDoc;
        originalType = OriginalType.MSO_MDOC_DECODED;
      }

      const mdocCredentials = deviceResponse.documents?.map(
        (doc) => PexCredentialMapper.toWrappedVerifiableCredential(doc, opts) as WrappedMdocCredential,
      );
      if (!mdocCredentials || mdocCredentials.length === 0) {
        throw new Error('could not extract any mdoc credentials from mdoc device response');
      }

      return {
        type: originalType,
        format: 'mso_mdoc',
        original: originalPresentation,
        presentation: deviceResponse,
        decoded: deviceResponse,
        vcs: mdocCredentials,
      };
    }
    return CredentialMapper.toWrappedVerifiablePresentation(originalPresentation, opts) as any;
  }
  /**
   * Converts a credential to a wrapped credential.
   *
   * When decoding SD-JWT credentials, a hasher implementation must be provided. The hasher implementation must be sync. When using
   * an async hasher implementation, use the decodeSdJwtVcAsync method instead and you can provide the decoded payload to methods
   * instead of the compact SD-JWT.
   *
   * @param hasher Hasher implementation to use for SD-JWT decoding
   */
  static toWrappedVerifiableCredential(
    verifiableCredential: OriginalVerifiableCredential,
    opts?: { maxTimeSkewInMS?: number; hasher?: HasherSync },
  ): WrappedVerifiableCredential {
    // MSO_MDOC
    if (this.isMsoMdocDecodedCredential(verifiableCredential) || CredentialMapper.isMsoMdocOid4VPEncoded(verifiableCredential)) {
      let mdoc: IssuerSignedDocument;
      if (CredentialMapper.isMsoMdocOid4VPEncoded(verifiableCredential as any)) {
        mdoc = parseIssuerSigned(convertBase64urlToBinary(verifiableCredential as string));
      } else {
        mdoc = verifiableCredential as IssuerSignedDocument;
      }

      return {
        type: CredentialMapper.isMsoMdocDecodedCredential(verifiableCredential as any)
          ? OriginalType.MSO_MDOC_DECODED
          : OriginalType.MSO_MDOC_ENCODED,
        format: 'mso_mdoc',
        original: verifiableCredential,
        credential: mdoc,
        decoded: getMdocDecodedPayload(mdoc),
      };
    }

    return CredentialMapper.toWrappedVerifiableCredential(verifiableCredential, opts) as any;
  }

  public static isW3cPresentation(presentation: unknown): presentation is IPresentation {
    return CredentialMapper.isW3cPresentation(presentation as any);
  }

  public static isWrappedSdJwtVerifiableCredential = (vc: unknown): vc is WrappedSdJwtVerifiableCredential =>
    CredentialMapper.isWrappedSdJwtVerifiableCredential(vc as any);

  public static isWrappedSdJwtVerifiablePresentation = (vc: unknown): vc is WrappedSdJwtVerifiablePresentation =>
    CredentialMapper.isWrappedSdJwtVerifiablePresentation(vc as any);
  public static isWrappedW3CVerifiableCredential = (vc: unknown): vc is WrappedW3CVerifiableCredential =>
    CredentialMapper.isWrappedW3CVerifiableCredential(vc as any);
  public static isWrappedW3CVerifiablePresentation = (vc: unknown): vc is WrappedW3CVerifiablePresentation =>
    CredentialMapper.isWrappedW3CVerifiablePresentation(vc as any);
  public static isWrappedMdocCredential = (vc: unknown): vc is WrappedMdocCredential => CredentialMapper.isWrappedMdocCredential(vc as any);
  public static isWrappedMdocPresentation = (vc: unknown): vc is WrappedMdocPresentation => CredentialMapper.isWrappedMdocPresentation(vc as any);

  public static isSdJwtDecodedCredential(original: unknown): original is SdJwtDecodedVerifiableCredential {
    return CredentialMapper.isSdJwtDecodedCredential(original as any);
  }
  public static isJwtDecodedCredential(original: unknown): original is JwtDecodedVerifiableCredential {
    return CredentialMapper.isJwtDecodedCredential(original as any);
  }

  public static isSdJwtEncoded(original: unknown): original is string {
    return CredentialMapper.isSdJwtEncoded(original as any);
  }

  public static isJwtEncoded(original: unknown): original is string {
    return CredentialMapper.isJwtEncoded(original as any);
  }

  public static decodeVerifiableCredential(credential: OriginalVerifiableCredential, hasher?: HasherSync) {
    return CredentialMapper.decodeVerifiableCredential(credential as any, hasher);
  }

  public static isCredential(original: OriginalVerifiableCredential | OriginalVerifiablePresentation): original is OriginalVerifiableCredential {
    return CredentialMapper.isCredential(original as any);
  }

  public static areOriginalVerifiableCredentialsEqual(firstOriginal: OriginalVerifiableCredential, secondOriginal: OriginalVerifiableCredential) {
    if (this.isMsoMdocDecodedCredential(firstOriginal) || this.isMsoMdocDecodedCredential(secondOriginal)) {
      return uint8ArrayToBase64Url(cborEncode(firstOriginal)) === uint8ArrayToBase64Url(cborEncode(secondOriginal));
    }

    return CredentialMapper.areOriginalVerifiableCredentialsEqual(firstOriginal, secondOriginal);
  }
}

/**
 * Record where keys are the namespaces and the values are objects again with the namespace values
 */
export type MdocDecodedPayload = Record<string, Record<string, string | number | boolean>>;
export function getMdocDecodedPayload(mdoc: IssuerSignedDocument): MdocDecodedPayload {
  const namespaces = mdoc.issuerSigned.nameSpaces;

  const decodedPayload: MdocDecodedPayload = {};
  for (const [namespace, items] of Array.from(namespaces.entries())) {
    decodedPayload[namespace] = items.reduce(
      (acc, item) => ({
        ...acc,
        [item.elementIdentifier]: encodeMdocValue(item.elementValue),
      }),
      {},
    );
  }

  return decodedPayload;
}

function encodeMdocValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'undefined' || value === null) return value;
  if (value instanceof Date || value instanceof DateOnly) return value.toISOString();

  // TODO: we don't want undefined, but empty object might also not work?
  return {};
}

function convertBase64urlToBinary(data: string) {
  return u8a.fromString(data, 'base64url');
}
