"use strict";
module.exports = validate42;
module.exports.default = validate42;
const schema12 = { "$ref": "#/definitions/FilterV2", "$schema": "http://json-schema.org/draft-07/schema#", "definitions": { "FilterV2": { "additionalProperties": false, "properties": { "const": { "$ref": "#/definitions/OneOfNumberStringBoolean" }, "contains": { "$ref": "#/definitions/FilterV2" }, "enum": { "items": { "$ref": "#/definitions/OneOfNumberString" }, "type": "array" }, "exclusiveMaximum": { "$ref": "#/definitions/OneOfNumberString" }, "exclusiveMinimum": { "$ref": "#/definitions/OneOfNumberString" }, "format": { "type": "string" }, "formatExclusiveMaximum": { "type": "string" }, "formatExclusiveMinimum": { "type": "string" }, "formatMaximum": { "type": "string" }, "formatMinimum": { "type": "string" }, "items": { "anyOf": [{ "$ref": "#/definitions/FilterV2" }, { "items": { "$ref": "#/definitions/FilterV2" }, "minItems": 1, "type": "array" }] }, "maxLength": { "type": "number" }, "maximum": { "$ref": "#/definitions/OneOfNumberString" }, "minLength": { "type": "number" }, "minimum": { "$ref": "#/definitions/OneOfNumberString" }, "not": { "type": "object" }, "pattern": { "type": "string" }, "type": { "type": "string" } }, "type": "object" }, "OneOfNumberString": { "type": ["number", "string"] }, "OneOfNumberStringBoolean": { "type": ["number", "string", "boolean"] } } };
const schema13 = { "additionalProperties": false, "properties": { "const": { "$ref": "#/definitions/OneOfNumberStringBoolean" }, "contains": { "$ref": "#/definitions/FilterV2" }, "enum": { "items": { "$ref": "#/definitions/OneOfNumberString" }, "type": "array" }, "exclusiveMaximum": { "$ref": "#/definitions/OneOfNumberString" }, "exclusiveMinimum": { "$ref": "#/definitions/OneOfNumberString" }, "format": { "type": "string" }, "formatExclusiveMaximum": { "type": "string" }, "formatExclusiveMinimum": { "type": "string" }, "formatMaximum": { "type": "string" }, "formatMinimum": { "type": "string" }, "items": { "anyOf": [{ "$ref": "#/definitions/FilterV2" }, { "items": { "$ref": "#/definitions/FilterV2" }, "minItems": 1, "type": "array" }] }, "maxLength": { "type": "number" }, "maximum": { "$ref": "#/definitions/OneOfNumberString" }, "minLength": { "type": "number" }, "minimum": { "$ref": "#/definitions/OneOfNumberString" }, "not": { "type": "object" }, "pattern": { "type": "string" }, "type": { "type": "string" } }, "type": "object" };
const func4 = Object.prototype.hasOwnProperty;
const schema14 = { "type": ["number", "string", "boolean"] };
function validate44(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (((!(typeof data == "number")) && (typeof data !== "string")) && (typeof data !== "boolean")) {
    const err0 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: schema14.type }, message: "must be number,string,boolean", schema: schema14.type, parentSchema: schema14, data };
    if (vErrors === null) {
        vErrors = [err0];
    }
    else {
        vErrors.push(err0);
    }
    errors++;
} validate44.errors = vErrors; return errors === 0; }
const schema15 = { "type": ["number", "string"] };
function validate46(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if ((!(typeof data == "number")) && (typeof data !== "string")) {
    const err0 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: schema15.type }, message: "must be number,string", schema: schema15.type, parentSchema: schema15, data };
    if (vErrors === null) {
        vErrors = [err0];
    }
    else {
        vErrors.push(err0);
    }
    errors++;
} validate46.errors = vErrors; return errors === 0; }
const wrapper0 = { validate: validate43 };
function validate43(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!(func4.call(schema13.properties, key0))) {
            const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties", schema: false, parentSchema: schema13, data };
            if (vErrors === null) {
                vErrors = [err0];
            }
            else {
                vErrors.push(err0);
            }
            errors++;
        }
    }
    if (data.const !== undefined) {
        if (!(validate44(data.const, { instancePath: instancePath + "/const", parentData: data, parentDataProperty: "const", rootData }))) {
            vErrors = vErrors === null ? validate44.errors : vErrors.concat(validate44.errors);
            errors = vErrors.length;
        }
    }
    if (data.contains !== undefined) {
        if (!(wrapper0.validate(data.contains, { instancePath: instancePath + "/contains", parentData: data, parentDataProperty: "contains", rootData }))) {
            vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);
            errors = vErrors.length;
        }
    }
    if (data.enum !== undefined) {
        let data2 = data.enum;
        if (Array.isArray(data2)) {
            const len0 = data2.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate46(data2[i0], { instancePath: instancePath + "/enum/" + i0, parentData: data2, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err1 = { instancePath: instancePath + "/enum", schemaPath: "#/properties/enum/type", keyword: "type", params: { type: "array" }, message: "must be array", schema: schema13.properties.enum.type, parentSchema: schema13.properties.enum, data: data2 };
            if (vErrors === null) {
                vErrors = [err1];
            }
            else {
                vErrors.push(err1);
            }
            errors++;
        }
    }
    if (data.exclusiveMaximum !== undefined) {
        if (!(validate46(data.exclusiveMaximum, { instancePath: instancePath + "/exclusiveMaximum", parentData: data, parentDataProperty: "exclusiveMaximum", rootData }))) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
        }
    }
    if (data.exclusiveMinimum !== undefined) {
        if (!(validate46(data.exclusiveMinimum, { instancePath: instancePath + "/exclusiveMinimum", parentData: data, parentDataProperty: "exclusiveMinimum", rootData }))) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
        }
    }
    if (data.format !== undefined) {
        let data6 = data.format;
        if (typeof data6 !== "string") {
            const err2 = { instancePath: instancePath + "/format", schemaPath: "#/properties/format/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.format.type, parentSchema: schema13.properties.format, data: data6 };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.formatExclusiveMaximum !== undefined) {
        let data7 = data.formatExclusiveMaximum;
        if (typeof data7 !== "string") {
            const err3 = { instancePath: instancePath + "/formatExclusiveMaximum", schemaPath: "#/properties/formatExclusiveMaximum/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.formatExclusiveMaximum.type, parentSchema: schema13.properties.formatExclusiveMaximum, data: data7 };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.formatExclusiveMinimum !== undefined) {
        let data8 = data.formatExclusiveMinimum;
        if (typeof data8 !== "string") {
            const err4 = { instancePath: instancePath + "/formatExclusiveMinimum", schemaPath: "#/properties/formatExclusiveMinimum/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.formatExclusiveMinimum.type, parentSchema: schema13.properties.formatExclusiveMinimum, data: data8 };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.formatMaximum !== undefined) {
        let data9 = data.formatMaximum;
        if (typeof data9 !== "string") {
            const err5 = { instancePath: instancePath + "/formatMaximum", schemaPath: "#/properties/formatMaximum/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.formatMaximum.type, parentSchema: schema13.properties.formatMaximum, data: data9 };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.formatMinimum !== undefined) {
        let data10 = data.formatMinimum;
        if (typeof data10 !== "string") {
            const err6 = { instancePath: instancePath + "/formatMinimum", schemaPath: "#/properties/formatMinimum/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.formatMinimum.type, parentSchema: schema13.properties.formatMinimum, data: data10 };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
    if (data.items !== undefined) {
        let data11 = data.items;
        const _errs20 = errors;
        let valid3 = false;
        const _errs21 = errors;
        if (!(wrapper0.validate(data11, { instancePath: instancePath + "/items", parentData: data, parentDataProperty: "items", rootData }))) {
            vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);
            errors = vErrors.length;
        }
        var _valid0 = _errs21 === errors;
        valid3 = valid3 || _valid0;
        if (!valid3) {
            const _errs22 = errors;
            if (Array.isArray(data11)) {
                if (data11.length < 1) {
                    const err7 = { instancePath: instancePath + "/items", schemaPath: "#/properties/items/anyOf/1/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items", schema: 1, parentSchema: schema13.properties.items.anyOf[1], data: data11 };
                    if (vErrors === null) {
                        vErrors = [err7];
                    }
                    else {
                        vErrors.push(err7);
                    }
                    errors++;
                }
                const len1 = data11.length;
                for (let i1 = 0; i1 < len1; i1++) {
                    if (!(wrapper0.validate(data11[i1], { instancePath: instancePath + "/items/" + i1, parentData: data11, parentDataProperty: i1, rootData }))) {
                        vErrors = vErrors === null ? wrapper0.validate.errors : vErrors.concat(wrapper0.validate.errors);
                        errors = vErrors.length;
                    }
                }
            }
            else {
                const err8 = { instancePath: instancePath + "/items", schemaPath: "#/properties/items/anyOf/1/type", keyword: "type", params: { type: "array" }, message: "must be array", schema: schema13.properties.items.anyOf[1].type, parentSchema: schema13.properties.items.anyOf[1], data: data11 };
                if (vErrors === null) {
                    vErrors = [err8];
                }
                else {
                    vErrors.push(err8);
                }
                errors++;
            }
            var _valid0 = _errs22 === errors;
            valid3 = valid3 || _valid0;
        }
        if (!valid3) {
            const err9 = { instancePath: instancePath + "/items", schemaPath: "#/properties/items/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf", schema: schema13.properties.items.anyOf, parentSchema: schema13.properties.items, data: data11 };
            if (vErrors === null) {
                vErrors = [err9];
            }
            else {
                vErrors.push(err9);
            }
            errors++;
        }
        else {
            errors = _errs20;
            if (vErrors !== null) {
                if (_errs20) {
                    vErrors.length = _errs20;
                }
                else {
                    vErrors = null;
                }
            }
        }
    }
    if (data.maxLength !== undefined) {
        let data13 = data.maxLength;
        if (!(typeof data13 == "number")) {
            const err10 = { instancePath: instancePath + "/maxLength", schemaPath: "#/properties/maxLength/type", keyword: "type", params: { type: "number" }, message: "must be number", schema: schema13.properties.maxLength.type, parentSchema: schema13.properties.maxLength, data: data13 };
            if (vErrors === null) {
                vErrors = [err10];
            }
            else {
                vErrors.push(err10);
            }
            errors++;
        }
    }
    if (data.maximum !== undefined) {
        if (!(validate46(data.maximum, { instancePath: instancePath + "/maximum", parentData: data, parentDataProperty: "maximum", rootData }))) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
        }
    }
    if (data.minLength !== undefined) {
        let data15 = data.minLength;
        if (!(typeof data15 == "number")) {
            const err11 = { instancePath: instancePath + "/minLength", schemaPath: "#/properties/minLength/type", keyword: "type", params: { type: "number" }, message: "must be number", schema: schema13.properties.minLength.type, parentSchema: schema13.properties.minLength, data: data15 };
            if (vErrors === null) {
                vErrors = [err11];
            }
            else {
                vErrors.push(err11);
            }
            errors++;
        }
    }
    if (data.minimum !== undefined) {
        if (!(validate46(data.minimum, { instancePath: instancePath + "/minimum", parentData: data, parentDataProperty: "minimum", rootData }))) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
        }
    }
    if (data.not !== undefined) {
        let data17 = data.not;
        if (!(data17 && typeof data17 == "object" && !Array.isArray(data17))) {
            const err12 = { instancePath: instancePath + "/not", schemaPath: "#/properties/not/type", keyword: "type", params: { type: "object" }, message: "must be object", schema: schema13.properties.not.type, parentSchema: schema13.properties.not, data: data17 };
            if (vErrors === null) {
                vErrors = [err12];
            }
            else {
                vErrors.push(err12);
            }
            errors++;
        }
    }
    if (data.pattern !== undefined) {
        let data18 = data.pattern;
        if (typeof data18 !== "string") {
            const err13 = { instancePath: instancePath + "/pattern", schemaPath: "#/properties/pattern/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.pattern.type, parentSchema: schema13.properties.pattern, data: data18 };
            if (vErrors === null) {
                vErrors = [err13];
            }
            else {
                vErrors.push(err13);
            }
            errors++;
        }
    }
    if (data.type !== undefined) {
        let data19 = data.type;
        if (typeof data19 !== "string") {
            const err14 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string", schema: schema13.properties.type.type, parentSchema: schema13.properties.type, data: data19 };
            if (vErrors === null) {
                vErrors = [err14];
            }
            else {
                vErrors.push(err14);
            }
            errors++;
        }
    }
}
else {
    const err15 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object", schema: schema13.type, parentSchema: schema13, data };
    if (vErrors === null) {
        vErrors = [err15];
    }
    else {
        vErrors.push(err15);
    }
    errors++;
} validate43.errors = vErrors; return errors === 0; }
function validate42(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (!(validate43(data, { instancePath, parentData, parentDataProperty, rootData }))) {
    vErrors = vErrors === null ? validate43.errors : vErrors.concat(validate43.errors);
    errors = vErrors.length;
} validate42.errors = vErrors; return errors === 0; }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGVGaWx0ZXJ2Mi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2xpYi92YWxpZGF0aW9uL3ZhbGlkYXRlRmlsdGVydjIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDO0FBQUEsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFBQSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFBQSxNQUFNLFFBQVEsR0FBRyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxTQUFTLEVBQUMseUNBQXlDLEVBQUMsYUFBYSxFQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUMsc0JBQXNCLEVBQUMsS0FBSyxFQUFDLFlBQVksRUFBQyxFQUFDLE9BQU8sRUFBQyxFQUFDLE1BQU0sRUFBQyx3Q0FBd0MsRUFBQyxFQUFDLFVBQVUsRUFBQyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxFQUFDLE1BQU0sRUFBQyxFQUFDLE9BQU8sRUFBQyxFQUFDLE1BQU0sRUFBQyxpQ0FBaUMsRUFBQyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsRUFBQyxrQkFBa0IsRUFBQyxFQUFDLE1BQU0sRUFBQyxpQ0FBaUMsRUFBQyxFQUFDLGtCQUFrQixFQUFDLEVBQUMsTUFBTSxFQUFDLGlDQUFpQyxFQUFDLEVBQUMsUUFBUSxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLHdCQUF3QixFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLHdCQUF3QixFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLGVBQWUsRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsRUFBQyxlQUFlLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsT0FBTyxFQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsd0JBQXdCLEVBQUMsRUFBQyxFQUFDLE9BQU8sRUFBQyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxFQUFDLFVBQVUsRUFBQyxDQUFDLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxDQUFDLEVBQUMsRUFBQyxXQUFXLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsU0FBUyxFQUFDLEVBQUMsTUFBTSxFQUFDLGlDQUFpQyxFQUFDLEVBQUMsV0FBVyxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLFNBQVMsRUFBQyxFQUFDLE1BQU0sRUFBQyxpQ0FBaUMsRUFBQyxFQUFDLEtBQUssRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsRUFBQyxTQUFTLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsTUFBTSxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLG1CQUFtQixFQUFDLEVBQUMsTUFBTSxFQUFDLENBQUMsUUFBUSxFQUFDLFFBQVEsQ0FBQyxFQUFDLEVBQUMsMEJBQTBCLEVBQUMsRUFBQyxNQUFNLEVBQUMsQ0FBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLFNBQVMsQ0FBQyxFQUFDLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBTSxRQUFRLEdBQUcsRUFBQyxzQkFBc0IsRUFBQyxLQUFLLEVBQUMsWUFBWSxFQUFDLEVBQUMsT0FBTyxFQUFDLEVBQUMsTUFBTSxFQUFDLHdDQUF3QyxFQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUMsTUFBTSxFQUFDLHdCQUF3QixFQUFDLEVBQUMsTUFBTSxFQUFDLEVBQUMsT0FBTyxFQUFDLEVBQUMsTUFBTSxFQUFDLGlDQUFpQyxFQUFDLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxFQUFDLGtCQUFrQixFQUFDLEVBQUMsTUFBTSxFQUFDLGlDQUFpQyxFQUFDLEVBQUMsa0JBQWtCLEVBQUMsRUFBQyxNQUFNLEVBQUMsaUNBQWlDLEVBQUMsRUFBQyxRQUFRLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsd0JBQXdCLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsd0JBQXdCLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsZUFBZSxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLGVBQWUsRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsRUFBQyxPQUFPLEVBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLE1BQU0sRUFBQyx3QkFBd0IsRUFBQyxFQUFDLEVBQUMsT0FBTyxFQUFDLEVBQUMsTUFBTSxFQUFDLHdCQUF3QixFQUFDLEVBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxFQUFDLFdBQVcsRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsRUFBQyxTQUFTLEVBQUMsRUFBQyxNQUFNLEVBQUMsaUNBQWlDLEVBQUMsRUFBQyxXQUFXLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsU0FBUyxFQUFDLEVBQUMsTUFBTSxFQUFDLGlDQUFpQyxFQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxFQUFDLFNBQVMsRUFBQyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsRUFBQyxNQUFNLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLEVBQUMsRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLENBQUM7QUFBQSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztBQUFBLE1BQU0sUUFBUSxHQUFHLEVBQUMsTUFBTSxFQUFDLENBQUMsUUFBUSxFQUFDLFFBQVEsRUFBQyxTQUFTLENBQUMsRUFBQyxDQUFDO0FBQUEsU0FBUyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUMsWUFBWSxHQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsa0JBQWtCLEVBQUUsUUFBUSxHQUFDLElBQUksRUFBQyxHQUFDLEVBQUUsSUFBRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQSxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQSxJQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxTQUFTLENBQUMsRUFBQyxDQUFDO0lBQUEsTUFBTSxJQUFJLEdBQUcsRUFBQyxZQUFZLEVBQUMsVUFBVSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxFQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFDLEVBQUMsT0FBTyxFQUFDLCtCQUErQixFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLENBQUM7SUFBQSxJQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUMsQ0FBQztRQUFBLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQUEsQ0FBQztTQUFLLENBQUM7UUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQUEsQ0FBQztJQUFBLE1BQU0sRUFBRSxDQUFDO0FBQUEsQ0FBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUEsT0FBTyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBQztBQUFBLE1BQU0sUUFBUSxHQUFHLEVBQUMsTUFBTSxFQUFDLENBQUMsUUFBUSxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUM7QUFBQSxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBQyxZQUFZLEdBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEdBQUMsSUFBSSxFQUFDLEdBQUMsRUFBRSxJQUFFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFBLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLElBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxFQUFDLENBQUM7SUFBQSxNQUFNLElBQUksR0FBRyxFQUFDLFlBQVksRUFBQyxVQUFVLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUMsRUFBQyxPQUFPLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxFQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUMsWUFBWSxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsQ0FBQztJQUFBLElBQUcsT0FBTyxLQUFLLElBQUksRUFBQyxDQUFDO1FBQUEsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFBQSxDQUFDO1NBQUssQ0FBQztRQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFBQSxDQUFDO0lBQUEsTUFBTSxFQUFFLENBQUM7QUFBQSxDQUFDLENBQUEsVUFBVSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsQ0FBQSxPQUFPLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQSxDQUFDO0FBQUEsTUFBTSxRQUFRLEdBQUcsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFDLENBQUM7QUFBQSxTQUFTLFVBQVUsQ0FBQyxJQUFJLEVBQUUsRUFBQyxZQUFZLEdBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxRQUFRLEdBQUMsSUFBSSxFQUFDLEdBQUMsRUFBRSxJQUFFLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFBLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBLElBQUcsSUFBSSxJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQztJQUFBLEtBQUksTUFBTSxJQUFJLElBQUksSUFBSSxFQUFDLENBQUM7UUFBQSxJQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDO1lBQUEsTUFBTSxJQUFJLEdBQUcsRUFBQyxZQUFZLEVBQUMsVUFBVSxFQUFDLHdCQUF3QixFQUFDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLEVBQUMsRUFBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUMsRUFBQyxPQUFPLEVBQUMscUNBQXFDLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxZQUFZLEVBQUMsUUFBUSxFQUFDLElBQUksRUFBQyxDQUFDO1lBQUEsSUFBRyxPQUFPLEtBQUssSUFBSSxFQUFDLENBQUM7Z0JBQUEsT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQSxDQUFDO2lCQUFLLENBQUM7Z0JBQUEsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUFBLENBQUM7WUFBQSxNQUFNLEVBQUUsQ0FBQztRQUFBLENBQUM7SUFBQSxDQUFDO0lBQUEsSUFBRyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsRUFBQyxDQUFDO1FBQUEsSUFBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBQyxZQUFZLEVBQUMsWUFBWSxHQUFDLFFBQVEsRUFBQyxVQUFVLEVBQUMsSUFBSSxFQUFDLGtCQUFrQixFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUFBLE9BQU8sR0FBRyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUFBLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQUEsQ0FBQztJQUFBLENBQUM7SUFBQSxJQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFDLENBQUM7UUFBQSxJQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBQyxZQUFZLEVBQUMsWUFBWSxHQUFDLFdBQVcsRUFBQyxVQUFVLEVBQUMsSUFBSSxFQUFDLGtCQUFrQixFQUFDLFVBQVUsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUFBLE9BQU8sR0FBRyxPQUFPLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFBQSxDQUFDO0lBQUEsQ0FBQztJQUFBLElBQUcsSUFBSSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUMsQ0FBQztRQUFBLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFBQSxJQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQztZQUFBLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7WUFBQSxLQUFJLElBQUksRUFBRSxHQUFDLENBQUMsRUFBRSxFQUFFLEdBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFDLENBQUM7Z0JBQUEsSUFBRyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFDLFlBQVksRUFBQyxZQUFZLEdBQUMsUUFBUSxHQUFHLEVBQUUsRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFDLGtCQUFrQixFQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztvQkFBQSxPQUFPLEdBQUcsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQUEsTUFBTSxHQUFH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SUFBQSxJQUFHLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFDLENBQUM7UUFBQSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQUEsSUFBRyxDQUFDLENBQUMsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLEVBQUMsQ0FBQztZQUFBLE1BQU0sS0FBSyxHQUFHLEVBQUMsWUFBWSxFQUFDLFlBQVksR0FBQyxZQUFZLEVBQUMsVUFBVSxFQUFDLDZCQUE2QixFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLEVBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLENBQUM7WUFBQSxJQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUMsQ0FBQztnQkFBQSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFBLENBQUM7aUJBQUssQ0FBQztnQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUEsQ0FBQztZQUFBLE1BQU0sRUFBRSxDQUFDO1FBQUEsQ0FBQztJQUFBLENBQUM7SUFBQSxJQUFHLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFDLENBQUM7UUFBQSxJQUFHLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFDLFlBQVksRUFBQyxZQUFZLEdBQUMsVUFBVSxFQUFDLFVBQVUsRUFBQyxJQUFJLEVBQUMsa0JBQWtCLEVBQUMsU0FBUyxFQUFDLFFBQVEsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDO1lBQUEsT0FBTyxHQUFHLE9BQU8sS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFBQSxDQUFDO0lBQUEsQ0FBQztJQUFBLElBQUcsSUFBSSxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUMsQ0FBQztRQUFBLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFBQSxJQUFHLENBQUMsQ0FBQyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsRUFBQyxDQUFDO1lBQUEsTUFBTSxLQUFLLEdBQUcsRUFBQyxZQUFZLEVBQUMsWUFBWSxHQUFDLFlBQVksRUFBQyxVQUFVLEVBQUMsNkJBQTZCLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUMsWUFBWSxFQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUMsQ0FBQztZQUFBLElBQUcsT0FBTyxLQUFLLElBQUksRUFBQyxDQUFDO2dCQUFBLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUEsQ0FBQztpQkFBSyxDQUFDO2dCQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQSxDQUFDO1lBQUEsTUFBTSxFQUFFLENBQUM7UUFBQSxDQUFDO0lBQUEsQ0FBQztJQUFBLElBQUcsSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLEVBQUMsQ0FBQztRQUFBLElBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUMsWUFBWSxFQUFDLFlBQVksR0FBQyxVQUFVLEVBQUMsVUFBVSxFQUFDLElBQUksRUFBQyxrQkFBa0IsRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7WUFBQSxPQUFPLEdBQUcsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7WUFBQSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUFBLENBQUM7SUFBQSxDQUFDO0lBQUEsSUFBRyxJQUFJLENBQUMsR0FBRyxLQUFLLFNBQVMsRUFBQyxDQUFDO1FBQUEsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUFBLElBQUcsQ0FBQyxDQUFDLE1BQU0sSUFBSSxPQUFPLE1BQU0sSUFBSSxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQztZQUFBLE1BQU0sS0FBSyxHQUFHLEVBQUMsWUFBWSxFQUFDLFlBQVksR0FBQyxNQUFNLEVBQUMsVUFBVSxFQUFDLHVCQUF1QixFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLEVBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLENBQUM7WUFBQSxJQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUMsQ0FBQztnQkFBQSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFBLENBQUM7aUJBQUssQ0FBQztnQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUEsQ0FBQztZQUFBLE1BQU0sRUFBRSxDQUFDO1FBQUEsQ0FBQztJQUFBLENBQUM7SUFBQSxJQUFHLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFDLENBQUM7UUFBQSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQUEsSUFBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUMsQ0FBQztZQUFBLE1BQU0sS0FBSyxHQUFHLEVBQUMsWUFBWSxFQUFDLFlBQVksR0FBQyxVQUFVLEVBQUMsVUFBVSxFQUFDLDJCQUEyQixFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLEVBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLENBQUM7WUFBQSxJQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUMsQ0FBQztnQkFBQSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFBLENBQUM7aUJBQUssQ0FBQztnQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUEsQ0FBQztZQUFBLE1BQU0sRUFBRSxDQUFDO1FBQUEsQ0FBQztJQUFBLENBQUM7SUFBQSxJQUFHLElBQUksQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFDLENBQUM7UUFBQSxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQUEsSUFBRyxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUMsQ0FBQztZQUFBLE1BQU0sS0FBSyxHQUFHLEVBQUMsWUFBWSxFQUFDLFlBQVksR0FBQyxPQUFPLEVBQUMsVUFBVSxFQUFDLHdCQUF3QixFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxFQUFDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLEVBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsTUFBTSxFQUFDLENBQUM7WUFBQSxJQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUMsQ0FBQztnQkFBQSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUFBLENBQUM7aUJBQUssQ0FBQztnQkFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQUEsQ0FBQztZQUFBLE1BQU0sRUFBRSxDQUFDO1FBQUEsQ0FBQztJQUFBLENBQUM7QUFBQSxDQUFDO0tBQUssQ0FBQztJQUFBLE1BQU0sS0FBSyxHQUFHLEVBQUMsWUFBWSxFQUFDLFVBQVUsRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLEVBQUMsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sRUFBQyxRQUFRLENBQUMsSUFBSSxFQUFDLFlBQVksRUFBQyxRQUFRLEVBQUMsSUFBSSxFQUFDLENBQUM7SUFBQSxJQUFHLE9BQU8sS0FBSyxJQUFJLEVBQUMsQ0FBQztRQUFBLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQUEsQ0FBQztTQUFLLENBQUM7UUFBQSxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQUEsQ0FBQztJQUFBLE1BQU0sRUFBRSxDQUFDO0FBQUEsQ0FBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUEsT0FBTyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUEsQ0FBQztBQUFBLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFDLFlBQVksR0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFFBQVEsR0FBQyxJQUFJLEVBQUMsR0FBQyxFQUFFLElBQUUsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUEsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUEsSUFBRyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFDLFlBQVksRUFBQyxVQUFVLEVBQUMsa0JBQWtCLEVBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7SUFBQSxPQUFPLEdBQUcsT0FBTyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7SUFBQSxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUFBLENBQUMsQ0FBQSxVQUFVLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFBLE9BQU8sTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFBLENBQUMifQ==