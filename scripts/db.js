import { validate, compare } from './schema.js';

export class DB {

    constructor() {
        this.tables = {};
        this.schemas = {};
    }

    project(object, properties) {
        return Object.fromEntries(properties
            .filter(property => object.hasOwnProperty(property))
            .map(property => [property, object[property]]));
    }

    map(object, fn) {
        const result = {};
        for (const key in object) {
            result[key] = fn(object[key]);
        }
        return result;
    }

    createTable(tableName, schema) {
        if (tableName in this.tables) {
            throw new Error(`Table '${tableName}' already exists`);
        }

        this.tables[tableName] = [];
        this.schemas[tableName] = schema;
    }

    applyDefaults(tableName, data) {
        const table = this.tables[tableName];
        const schema = this.schemas[tableName];

        const defaults = structuredClone(schema.default) ?? {};

        const autoIncrement = {};
        if (schema.autoIncrement) {
            for (const field of schema.autoIncrement) {
                autoIncrement[field] = table.length + 1;
            }
        }

        return { ...autoIncrement, ...defaults, ...structuredClone(data) };
    }

    validatePrimaryKey(table, schema, data, excludeIndex = -1) {
        return !table.some((row, index) =>
            index !== excludeIndex &&
            schema.primaryKey.every(field => compare(data[field], row[field])));
    }

    validateForeignKeys(table, schema, data) {
        for (const { nativeKey, foreignKey, foreignTable } of schema.foreignKeys) {
            const table = this.tables[foreignTable];
            const jointKey = nativeKey.map((nativeKey, i) => [nativeKey, foreignKey[i]]);
            const foreignRow = table.find(foreignRow =>
                jointKey.every(([nativeKey, foreignKey]) =>
                    compare(data[nativeKey], foreignRow[foreignKey])));
            if (!foreignRow) {
                return false;
            }
        }

        return true;
    }

    validate(tableName, newRow, excludeIndex = -1) {
        const table = this.tables[tableName];
        const schema = this.schemas[tableName];

        return (
            validate(schema, newRow) &&
            (schema.primaryKey === undefined || this.validatePrimaryKey(table, schema, newRow, excludeIndex)) &&
            (schema.foreignKeys === undefined || this.validateForeignKeys(table, schema, newRow))
        );
    }

    link(tableName, data, foreignName) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        const schema = this.schemas[tableName];
        const fk = schema.foreignKeys.find(({ name }) => name === foreignName);
        if (!fk) {
            throw new Error(`Foreign key '${foreignName}' does not exists in table '${tableName}'`);
        }

        const { nativeKey, foreignKey, foreignTable } = fk;
        const table = this.tables[foreignTable];
        const jointKey = nativeKey.map((nativeKey, i) => [nativeKey, foreignKey[i]]);
        const foreignRow = table.find(foreignRow =>
            jointKey.every(([nativeKey, foreignKey]) =>
                compare(data[nativeKey], foreignRow[foreignKey])));
        return foreignRow;
    }

    find(tableName, condition = () => true) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        return structuredClone(this.tables[tableName].find(row => condition(row)));
    }

    select(tableName, condition = () => true) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        return this.tables[tableName]
            .filter(row => condition(row))
            .map(row => structuredClone(row));
    }

    insert(tableName, data) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        const table = this.tables[tableName];
        const schema = this.schemas[tableName];

        const newRow = this.applyDefaults(tableName, data);
        if (!this.validate(tableName, newRow)) {
            return null;
        }

        table.push(newRow);
        return newRow;
    }

    update(tableName, condition = () => true, update = {}) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        const table = this.tables[tableName];
        const schema = this.schemas[tableName];

        const groups = Object.groupBy(table, row => condition(row) ? 'update' : 'keep');
        const toUpdate = groups.update ?? [];
        const toKeep = groups.keep ?? [];

        for (const [index, row] of toUpdate.entries()) {
            const newRow = Object.assign(structuredClone(row), structuredClone(update));
            if (!this.validate(tableName, newRow, index)) {
                return -1;
            }
        }

        for (const row of toUpdate) {
            const newRow = Object.assign(structuredClone(row), structuredClone(update));
            Object.assign(row, structuredClone(update));
        }

        return toUpdate.length;
    }

    delete(tableName, condition) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        const table = this.tables[tableName];
        const schema = this.schemas[tableName];

        const groups = Object.groupBy(table, row => condition(row) ? 'delete' : 'keep');
        const toDelete = groups.delete ?? [];
        const toKeep = groups.keep ?? [];

        // Check foreign key violations
        for (const [otherTableName, otherTable] of this.tables) {
            const otherSchema = this.schemas[otherTableName];
            if (!otherSchema.foreignKeys) continue;
            for (const { nativeKey, foreignKey, foreignTable } of otherSchema.foreignKeys) {
                if (foreignTable !== tableName) continue;
                // Here we have another table (otherTable) that has a foreign key in this table (table)
                // Now we check if any rows from otherTable reference any rows marked for deletion in this table
                for (const otherRow of otherTable) {
                    const jointKey = nativeKey.map((nativeKey, i) => [nativeKey, foreignKey[i]]);
                    const deleteRow = toDelete.find(foreignRow =>
                        jointKey.every(([nativeKey, foreignKey]) =>
                            compare(otherRow[nativeKey], foreignRow[foreignKey])));
                    if (deleteRow) {
                        throw new Error(`Cannot delete: Row is referenced by table '${otherTableName}'`);
                    }
                }
            }
        }

        this.tables[tableName] = toKeep;
        return toDelete.length;
    }

    dropTable(tableName) {
        if (!(tableName in this.tables)) {
            throw new Error(`Table '${tableName}' does not exist`);
        }

        // Check if any other table has foreign keys referencing this table
        for (const [otherTableName, otherTable] of this.tables) {
            const otherSchema = this.schemas[otherTableName];
            if (!otherSchema.foreignKeys) continue;
            for (const { nativeKey, foreignKey, foreignTable } of otherSchema.foreignKeys) {
                if (foreignTable === tableName) {
                    throw new Error(`Cannot drop table '${tableName}': Referenced by foreign key in table '${otherTableName}'`);
                }
            }
        }

        this.tables.delete(tableName);
        this.schemas.delete(tableName);
    }

    toJSON() {
        return JSON.stringify({
            tables: this.tables,
            schemas: this.schemas,
        });
    }

    fromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.tables || !data.schemas) {
                throw new Error('Invalid database JSON format');
            }
            this.tables = data.tables;
            this.schemas = data.schemas;
        } catch (error) {
            throw new Error(`Failed to restore database from JSON: ${error.message}`);
        }
    }

}
