import { JSONPath as jp } from '@astronautlabs/jsonpath';
export class JsonPathUtils {
    static matchAll = require('string.prototype.matchall');
    static REGEX_PATH = /@\w+/g;
    /**
     * @param obj: any object can be found in verifiablePresentation.verifiableCredential[i]
     * @param paths: paths that can be found in Field object
     * @return a result object containing value of the correct path in the verifiableCredential and the correct path
     * @example(success result): if you call this method with 1. verifiableCredential:
     *   {
          '@context': [''],
          age: 19,
          credentialSchema: [ { id: '' } ],
          id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
          issuer: '',
          type: 'VerifiableCredential'
        }
     and 2 paths: [ '$.age', '$.details.age ]
     you will get result: [ { value: 19, path: [ '$', 'age' ] } ]
  
     @example(fail result): if you call this method with 1. verifiableCredential:
     {
          '@context': [ '' ],
          credentialSchema: [ { id: '' } ],
          id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
          issuer: '',
          type: 'VerifiableCredential'
        }
     and 2. paths: [ '$.age' ],
     you will get result: result: []
     @example (array example):
     vc: {
          '@context': [''],
          "details": {
          "information":[
            {
              "age": 19
            }]
        },
          credentialSchema: [ { id: '' } ],
          id: '2dc74354-e965-4883-be5e-bfec48bf60c7',
          issuer: '',
          type: 'VerifiableCredential'
        }
     result: [ { value: 19, path: [ '$', 'details', 'information', 0, 'age' ] } ]
     */
    static extractInputField(obj, paths) {
        let result = [];
        if (paths) {
            for (const path of paths) {
                result = jp.nodes(obj, path);
                if (result.length) {
                    break;
                }
            }
        }
        return result;
    }
    static changePropertyNameRecursively(pd, currentPropertyName, newPropertyName) {
        const existingPaths = JsonPathUtils.extractInputField(pd, ['$..' + currentPropertyName]);
        for (const existingPath of existingPaths) {
            this.copyResultPathToDestinationDefinition(existingPath.path, pd, newPropertyName);
        }
    }
    static setValue(obj, path, newValue) {
        const stringPath = typeof path === 'string' ? path : jp.stringify(path);
        jp.value(obj, stringPath, newValue);
        return obj;
    }
    static copyResultPathToDestinationDefinition(pathDetails, pd, newPropertyName) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let objectCursor = pd;
        for (let i = 1; i < pathDetails.length; i++) {
            if (i + 1 < pathDetails.length) {
                objectCursor = objectCursor[pathDetails[i]];
            }
            if (pathDetails.length == i + 1) {
                objectCursor[newPropertyName] = objectCursor[pathDetails[i]];
                delete objectCursor[pathDetails[i]];
                break;
            }
        }
    }
    static changeSpecialPathsRecursively(pd) {
        const paths = JsonPathUtils.extractInputField(pd, ['$..path']);
        for (const path of paths) {
            this.modifyPathsWithSpecialCharacter(path.path, pd);
        }
    }
    static modifyPathsWithSpecialCharacter(pathDetails, pd) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let objectCursor = pd;
        for (let i = 1; i < pathDetails.length; i++) {
            if (i + 1 < pathDetails.length) {
                objectCursor = objectCursor[pathDetails[i]];
            }
            if (pathDetails.length == i + 1) {
                const paths = objectCursor[pathDetails[i]];
                const editedPaths = [];
                for (let j = 0; j < paths.length; j++) {
                    editedPaths.push(this.modifyPathWithSpecialCharacter(paths[j]));
                }
                objectCursor[pathDetails[i]] = editedPaths;
                break;
            }
        }
    }
    static modifyPathWithSpecialCharacter(path) {
        const matches = this.matchAll(path, this.REGEX_PATH);
        path = this.modifyPathRecursive(matches, path);
        return path;
    }
    static modifyPathRecursive(matches, path) {
        let next = matches.next();
        let indexChanged = false;
        while (next && !next.done && !indexChanged) {
            const atIdx = next.value.index;
            if (atIdx && atIdx == 1) {
                path = path.charAt(0) + "['" + next.value[0] + "']" + path.substring(atIdx + next.value[0].length);
                indexChanged = true;
                this.modifyPathRecursive(matches, path);
            }
            else if (atIdx && atIdx > 1 && path.substring(atIdx - 2, atIdx) !== "['" && path.substring(atIdx - 2, atIdx) !== '["') {
                if (path.substring(atIdx - 2, atIdx) === '..') {
                    path = path.substring(0, atIdx - 2) + "..['" + next.value[0] + "']" + path.substring(atIdx + next.value[0].length);
                    indexChanged = true;
                    const matches = this.matchAll(path, this.REGEX_PATH);
                    this.modifyPathRecursive(matches, path);
                }
                else if (path.charAt(atIdx - 1) === '.') {
                    path = path.substring(0, atIdx - 1) + "['" + next.value[0] + "']" + path.substring(atIdx + next.value[0].length);
                    indexChanged = true;
                    this.modifyPathRecursive(matches, path);
                }
            }
            next = matches.next();
        }
        return path;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvblBhdGhVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi91dGlscy9qc29uUGF0aFV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLElBQUksRUFBRSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFLekQsTUFBTSxPQUFPLGFBQWE7SUFDeEIsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUN2RCxNQUFNLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQztJQUM1Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7T0F5Q0c7SUFDSSxNQUFNLENBQUMsaUJBQWlCLENBQXNCLEdBQW1CLEVBQUUsS0FBZTtRQUN2RixJQUFJLE1BQU0sR0FBZ0QsRUFBRSxDQUFDO1FBQzdELElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN6QixNQUFNLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzdCLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDO29CQUNsQixNQUFNO2dCQUNSLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sTUFBdUQsQ0FBQztJQUNqRSxDQUFDO0lBRU0sTUFBTSxDQUFDLDZCQUE2QixDQUN6QyxFQUF1RCxFQUN2RCxtQkFBMkIsRUFDM0IsZUFBdUI7UUFFdkIsTUFBTSxhQUFhLEdBQW9ELGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEdBQUcsbUJBQW1CLENBQUMsQ0FBQyxDQUFDO1FBQzFJLEtBQUssTUFBTSxZQUFZLElBQUksYUFBYSxFQUFFLENBQUM7WUFDekMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUs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