import {
  PresentationDefinitionV1 as PdV1,
  PresentationDefinitionV2 as PdV2,
  PresentationDefinitionV1,
  PresentationDefinitionV2,
} from '@sphereon/pex-models';
import { JwtDecodedVerifiablePresentation } from '@sphereon/ssi-types';

import { definitionVersionDiscovery, JsonPathUtils } from '../utils';

import {
  DiscoveredVersion,
  IInternalPresentationDefinition,
  InternalPresentationDefinitionV1,
  InternalPresentationDefinitionV2,
  IPresentationDefinition,
  PEVersion,
} from './Internal.types';
import {
  OriginalVerifiableCredential,
  OriginalVerifiablePresentation,
  PexCredentialMapper,
  WrappedVerifiableCredential,
  WrappedVerifiablePresentation,
} from './PexCredentialMapper';

export class SSITypesBuilder {
  public static modelEntityToInternalPresentationDefinitionV1(p: PdV1): InternalPresentationDefinitionV1 {
    const pd: PdV1 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p) as PdV1;
    return new InternalPresentationDefinitionV1(pd.id, pd.input_descriptors, pd.format, pd.name, pd.purpose, pd.submission_requirements);
  }

  public static modelEntityInternalPresentationDefinitionV2(p: PdV2): InternalPresentationDefinitionV2 {
    const pd: PdV2 = SSITypesBuilder.createCopyAndModifyPresentationDefinition(p) as PresentationDefinitionV2;
    return new InternalPresentationDefinitionV2(pd.id, pd.input_descriptors, pd.format, pd.frame, pd.name, pd.purpose, pd.submission_requirements);
  }

  static createCopyAndModifyPresentationDefinition(p: IPresentationDefinition): IPresentationDefinition {
    const pd: IPresentationDefinition = JSON.parse(JSON.stringify(p));
    JsonPathUtils.changePropertyNameRecursively(pd, '_const', 'const');
    JsonPathUtils.changePropertyNameRecursively(pd, '_enum', 'enum');
    JsonPathUtils.changeSpecialPathsRecursively(pd);
    return pd;
  }

  static mapExternalVerifiablePresentationToWrappedVP(
    presentation: OriginalVerifiablePresentation | JwtDecodedVerifiablePresentation,
  ): WrappedVerifiablePresentation {
    return PexCredentialMapper.toWrappedVerifiablePresentation(presentation);
  }

  static mapExternalVerifiableCredentialsToWrappedVcs(
    verifiableCredentials: OriginalVerifiableCredential | OriginalVerifiableCredential[],
  ): WrappedVerifiableCredential[] {
    const array = Array.isArray(verifiableCredentials) ? verifiableCredentials : [verifiableCredentials];

    return array.map((c) => PexCredentialMapper.toWrappedVerifiableCredential(c));
  }

  static toInternalPresentationDefinition(presentationDefinition: IPresentationDefinition): IInternalPresentationDefinition {
    const presentationDefinitionCopy: IPresentationDefinition = JSON.parse(JSON.stringify(presentationDefinition));
    const versionResult: DiscoveredVersion = definitionVersionDiscovery(presentationDefinitionCopy);
    if (versionResult.error) {
      throw new Error(
        `${versionResult.error} \nv1 errors:\n${JSON.stringify(versionResult.v1Errors, null, 2)} \n\nv2 errors:\n${JSON.stringify(versionResult.v2Errors, null, 2)}`,
      );
    }
    if (versionResult.version == PEVersion.v1) {
      return SSITypesBuilder.modelEntityToInternalPresentationDefinitionV1(presentationDefinitionCopy as PresentationDefinitionV1);
    }
    return SSITypesBuilder.modelEntityInternalPresentationDefinitionV2(presentationDefinitionCopy as PresentationDefinitionV2);
  }
}
