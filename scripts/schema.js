export function compare(a, b) {
    return a === b || (a && b && typeof a === 'object' && typeof b === 'object' &&
        Object.keys(a).length === Object.keys(b).length &&
        Object.keys(a).every(k => compare(a[k], b[k])));
}

const regexEmail = /^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+(\.[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+)*@[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+(\.[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+)*$/;
const regexDate = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

export function validateType(schema, value) {
    switch (schema.type) {
        case 'null': return value === null;
        case 'boolean': return typeof value === 'boolean';
        case 'string': return typeof value === 'string';
        case 'date': return typeof value === 'string' && regexDate.test(value);
        case 'email': return typeof value === 'string' && regexEmail.test(value);
        case 'number': return typeof value === 'number';
        case 'integer': return typeof value === 'number' && Number.isInteger(value);
        case 'array': return Array.isArray(value);
        case 'object': return value !== null && typeof value === 'object' && !Array.isArray(value);
        default: return false;
    }
}

export function validateConst(schema, value) {
    return compare(schema.const, value);
}

export function validateEnum(schema, value) {
    return schema.enum.some(expected => compare(expected, value));
}

export function validateMultipleOf(schema, value) {
    return value % schema.multipleOf === 0;
}

export function validateMinimum(schema, value) {
    return value >= schema.minimum;
}

export function validateMaximum(schema, value) {
    return value <= schema.maximum;
}

export function validateLength(schema, value) {
    return value.length === schema.length;
}

export function validateMinimumLength(schema, value) {
    return value.length >= schema.minimumLength;
}

export function validateMaximumLength(schema, value) {
    return value.length <= schema.maximumLength;
}

export function validatePattern(schema, value) {
    return new RegExp(schema.pattern).test(value);
}

export function validateContains(schema, value) {
    return value.some(item => validate(schema.contains, item));
}

export function validateItems(schema, value) {
    return value.every(item => validate(schema.items, item));
}

export function validatePrefixItems(schema, value) {
    if (value.length < schema.prefixItems.length) {
        return false;
    }
    for (let i = 0; i < schema.prefixItems.length; i++) {
        if (!validate(schema.prefixItems[i], value[i])) {
            return false;
        }
    }
    return true;
}

export function validateUnique(schema, value) {
    for (let i = 0; i < value.length; i++) {
        for (let j = i + 1; j < value.length; j++) {
            if (compare(value[i], value[j])) {
                return false;
            }
        }
    }
    return true;
}

export function validateProperties(schema, value) {
    for (const property in value) {
        if (schema.properties[property] !== undefined) {
            if (!validate(schema.properties[property], value[property])) {
                return false;
            }
        }
    }
    return true;
}

export function validateRequired(schema, value) {
    return schema.required.every(property => value[property] !== undefined);
}

export function validateDependentRequired(schema, value) {
    for (const property in value) {
        if (schema.dependentRequired[property]) {
            if (!schema.dependentRequired[property].every(dependency => value[dependency] !== undefined)) {
                return false;
            }
        }
    }
    return true;
}

export function validateDependentSchemas(schema, value) {
    for (const property in value) {
        if (schema.dependentSchemas[property]) {
            if (!validate(schema.dependentSchemas[property], value)) {
                return false;
            }
        }
    }
    return true;
}

export function validateAnyOf(schema, value) {
    return schema.anyOf.some(subschema => validate(subschema, value));
}

export function validateAllOf(schema, value) {
    return schema.allOf.every(subschema => validate(subschema, value));
}

export function validateOneOf(schema, value) {
    return schema.oneOf.filter(subschema => validate(subschema, value)).length === 1;
}

export function validateNot(schema, value) {
    return !validate(schema.not, value);
}

export function validateIfThenElse(schema, value) {
    if (validate(schema.if, value)) {
        return schema.then === undefined || validate(schema.then, value);
    } else {
        return schema.else === undefined || validate(schema.else, value);
    }
}

export function validate(schema, value) {
    return (
        // basic
        (schema.type === undefined || validateType(schema, value)) &&
        (schema.const === undefined || validateConst(schema, value)) &&
        (schema.enum === undefined || validateEnum(schema, value)) &&
        // numeric
        (schema.multipleOf === undefined || validateMultipleOf(schema, value)) &&
        (schema.minimum === undefined || validateMinimum(schema, value)) &&
        (schema.maximum === undefined || validateMaximum(schema, value)) &&
        // string
        (schema.length === undefined || validateLength(schema, value)) &&
        (schema.minimumLength === undefined || validateMinimumLength(schema, value)) &&
        (schema.maximumLength === undefined || validateMaximumLength(schema, value)) &&
        (schema.pattern === undefined || validatePattern(schema, value)) &&
        // array
        (schema.contains === undefined || validateContains(schema, value)) &&
        (schema.items === undefined || validateItems(schema, value)) &&
        (schema.prefixItems === undefined || validatePrefixItems(schema, value)) &&
        (schema.unique === undefined || validateUnique(schema, value)) &&
        // object
        (schema.properties === undefined || validateProperties(schema, value)) &&
        (schema.required === undefined || validateRequired(schema, value)) &&
        (schema.dependentRequired === undefined || validateDependentRequired(schema, value)) &&
        (schema.dependentSchemas === undefined || validateDependentSchemas(schema, value)) &&
        // combinations
        (schema.anyOf === undefined || validateAnyOf(schema, value)) &&
        (schema.allOf === undefined || validateAllOf(schema, value)) &&
        (schema.oneOf === undefined || validateOneOf(schema, value)) &&
        (schema.not === undefined || validateNot(schema, value)) &&
        (schema.if === undefined || validateIfThenElse(schema, value))
    );
}
