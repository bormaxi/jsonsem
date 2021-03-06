var Scope = require('./scope');
var BaseValidator = require('./types/base');
var DataWrapper = require('./dataWrapper');
var SchemaError = require('./schemaError');

var DSL = module.exports = function() {
    this.errors = [];
    this.rootScope = new Scope(this);
    BaseValidator.define(this.rootScope);

    this.rootValidator = this.rootScope.getValidator({type: 'base'})
    .include(require('./types/object'))
    .include(require('./types/array'))
    .include(require('./types/string'))
    .include(require('./types/boolean'))
    .include(require('./types/numbers'));
};

DSL.prototype.error = function(path, msg) {
    this.errors.push([path, msg]);
};

DSL.prototype.schema = function(props, schema) {
    if (schema === undefined) {
        schema = props;
        props = {type: 'object'};
    }
    this.schemaValidator = this.rootScope.getValidator(props, schema);
    return this;
};

DSL.prototype.extend = function(schema) {
    if (this.schemaValidator) {
        throw new SchemaError("Can't extend base validator, when schema is already defined");
    }
    this.rootValidator.include(schema);
    return this;
};

DSL.prototype.validate = function(json) {
    if (!this.schemaValidator) {
        throw new SchemaError("Define schema before validation");
    }
    this.errors = [];
    this.schemaValidator.validate(json, null, new DataWrapper(json));
    return (this.errors.length === 0);
};
