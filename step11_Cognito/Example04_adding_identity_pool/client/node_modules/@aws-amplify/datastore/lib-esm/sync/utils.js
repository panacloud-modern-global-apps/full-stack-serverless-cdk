var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { isEnumFieldType, isGraphQLScalarType, isPredicateObj, isSchemaModel, isTargetNameAssociation, isNonModelFieldType, OpType, } from '../types';
import { exhaustiveCheck } from '../util';
var GraphQLOperationType;
(function (GraphQLOperationType) {
    GraphQLOperationType["LIST"] = "query";
    GraphQLOperationType["CREATE"] = "mutation";
    GraphQLOperationType["UPDATE"] = "mutation";
    GraphQLOperationType["DELETE"] = "mutation";
    GraphQLOperationType["GET"] = "query";
})(GraphQLOperationType || (GraphQLOperationType = {}));
export var TransformerMutationType;
(function (TransformerMutationType) {
    TransformerMutationType["CREATE"] = "Create";
    TransformerMutationType["UPDATE"] = "Update";
    TransformerMutationType["DELETE"] = "Delete";
    TransformerMutationType["GET"] = "Get";
})(TransformerMutationType || (TransformerMutationType = {}));
var dummyMetadata = {
    _version: undefined,
    _lastChangedAt: undefined,
    _deleted: undefined,
};
var metadataFields = (Object.keys(dummyMetadata));
export function getMetadataFields() {
    return metadataFields;
}
export function generateSelectionSet(namespace, modelDefinition) {
    var scalarFields = getScalarFields(modelDefinition);
    var nonModelFields = getNonModelFields(namespace, modelDefinition);
    var implicitOwnerField = getImplicitOwnerField(modelDefinition, scalarFields);
    var scalarAndMetadataFields = Object.values(scalarFields)
        .map(function (_a) {
        var name = _a.name;
        return name;
    })
        .concat(implicitOwnerField)
        .concat(nonModelFields);
    if (isSchemaModel(modelDefinition)) {
        scalarAndMetadataFields = scalarAndMetadataFields
            .concat(getMetadataFields())
            .concat(getConnectionFields(modelDefinition));
    }
    var result = scalarAndMetadataFields.join('\n');
    return result;
}
function getImplicitOwnerField(modelDefinition, scalarFields) {
    var ownerFields = getOwnerFields(modelDefinition);
    if (!scalarFields.owner && ownerFields.includes('owner')) {
        return ['owner'];
    }
    return [];
}
function getOwnerFields(modelDefinition) {
    var ownerFields = [];
    if (isSchemaModel(modelDefinition) && modelDefinition.attributes) {
        modelDefinition.attributes.forEach(function (attr) {
            if (attr.properties && attr.properties.rules) {
                var rule = attr.properties.rules.find(function (rule) { return rule.allow === 'owner'; });
                if (rule && rule.ownerField) {
                    ownerFields.push(rule.ownerField);
                }
            }
        });
    }
    return ownerFields;
}
function getScalarFields(modelDefinition) {
    var fields = modelDefinition.fields;
    var result = Object.values(fields)
        .filter(function (field) {
        if (isGraphQLScalarType(field.type) || isEnumFieldType(field.type)) {
            return true;
        }
        return false;
    })
        .reduce(function (acc, field) {
        acc[field.name] = field;
        return acc;
    }, {});
    return result;
}
function getConnectionFields(modelDefinition) {
    var result = [];
    Object.values(modelDefinition.fields)
        .filter(function (_a) {
        var association = _a.association;
        return association && Object.keys(association).length;
    })
        .forEach(function (_a) {
        var name = _a.name, association = _a.association;
        var connectionType = association.connectionType;
        switch (connectionType) {
            case 'HAS_ONE':
            case 'HAS_MANY':
                // Intentionally blank
                break;
            case 'BELONGS_TO':
                if (isTargetNameAssociation(association)) {
                    result.push(name + " { id _deleted }");
                }
                break;
            default:
                exhaustiveCheck(connectionType);
        }
    });
    return result;
}
function getNonModelFields(namespace, modelDefinition) {
    var result = [];
    Object.values(modelDefinition.fields).forEach(function (_a) {
        var name = _a.name, type = _a.type;
        if (isNonModelFieldType(type)) {
            var typeDefinition = namespace.nonModels[type.nonModel];
            var scalarFields = Object.values(getScalarFields(typeDefinition)).map(function (_a) {
                var name = _a.name;
                return name;
            });
            var nested_1 = [];
            Object.values(typeDefinition.fields).forEach(function (field) {
                var type = field.type, name = field.name;
                if (isNonModelFieldType(type)) {
                    var typeDefinition_1 = namespace.nonModels[type.nonModel];
                    nested_1.push(name + " { " + generateSelectionSet(namespace, typeDefinition_1) + " }");
                }
            });
            result.push(name + " { " + scalarFields.join(' ') + " " + nested_1.join(' ') + " }");
        }
    });
    return result;
}
export function getAuthorizationRules(modelDefinition) {
    // Searching for owner authorization on attributes
    var authConfig = []
        .concat(modelDefinition.attributes)
        .find(function (attr) { return attr && attr.type === 'auth'; });
    var _a = (authConfig || {}).properties, _b = (_a === void 0 ? {} : _a).rules, rules = _b === void 0 ? [] : _b;
    var resultRules = [];
    // Multiple rules can be declared for allow: owner
    rules.forEach(function (rule) {
        // setting defaults for backwards compatibility with old cli
        var _a = rule.identityClaim, identityClaim = _a === void 0 ? 'cognito:username' : _a, _b = rule.ownerField, ownerField = _b === void 0 ? 'owner' : _b, _c = rule.operations, operations = _c === void 0 ? ['create', 'update', 'delete', 'read'] : _c, _d = rule.provider, provider = _d === void 0 ? 'userPools' : _d, _e = rule.groupClaim, groupClaim = _e === void 0 ? 'cognito:groups' : _e, _f = rule.allow, authStrategy = _f === void 0 ? 'iam' : _f, _g = rule.groups, groups = _g === void 0 ? [] : _g;
        var isReadAuthorized = operations.includes('read');
        var isOwnerAuth = authStrategy === 'owner';
        if (!isReadAuthorized && !isOwnerAuth) {
            return;
        }
        var authRule = {
            identityClaim: identityClaim,
            ownerField: ownerField,
            provider: provider,
            groupClaim: groupClaim,
            authStrategy: authStrategy,
            groups: groups,
            areSubscriptionsPublic: false,
        };
        if (isOwnerAuth) {
            // look for the subscription level override
            // only pay attention to the public level
            var modelConfig = []
                .concat(modelDefinition.attributes)
                .find(function (attr) { return attr && attr.type === 'model'; });
            // find the subscriptions level. ON is default
            var _h = (modelConfig || {}).properties, _j = (_h === void 0 ? {} : _h).subscriptions, _k = (_j === void 0 ? {} : _j).level, level = _k === void 0 ? 'on' : _k;
            // treat subscriptions as public for owner auth with unprotected reads
            // when `read` is omitted from `operations`
            authRule.areSubscriptionsPublic =
                !operations.includes('read') || level === 'public';
        }
        if (isOwnerAuth) {
            // owner rules has least priority
            resultRules.push(authRule);
            return;
        }
        resultRules.unshift(authRule);
    });
    return resultRules;
}
export function buildSubscriptionGraphQLOperation(namespace, modelDefinition, transformerMutationType, isOwnerAuthorization, ownerField) {
    var selectionSet = generateSelectionSet(namespace, modelDefinition);
    var typeName = modelDefinition.name, pluralTypeName = modelDefinition.pluralName;
    var opName = "on" + transformerMutationType + typeName;
    var docArgs = '';
    var opArgs = '';
    if (isOwnerAuthorization) {
        docArgs = "($" + ownerField + ": String!)";
        opArgs = "(" + ownerField + ": $" + ownerField + ")";
    }
    return [
        transformerMutationType,
        opName,
        "subscription operation" + docArgs + "{\n\t\t\t" + opName + opArgs + "{\n\t\t\t\t" + selectionSet + "\n\t\t\t}\n\t\t}",
    ];
}
export function buildGraphQLOperation(namespace, modelDefinition, graphQLOpType) {
    var selectionSet = generateSelectionSet(namespace, modelDefinition);
    var typeName = modelDefinition.name, pluralTypeName = modelDefinition.pluralName;
    var operation;
    var documentArgs = ' ';
    var operationArgs = ' ';
    var transformerMutationType;
    switch (graphQLOpType) {
        case 'LIST':
            operation = "sync" + pluralTypeName;
            documentArgs = "($limit: Int, $nextToken: String, $lastSync: AWSTimestamp, $filter: Model" + typeName + "FilterInput)";
            operationArgs =
                '(limit: $limit, nextToken: $nextToken, lastSync: $lastSync, filter: $filter)';
            selectionSet = "items {\n\t\t\t\t\t\t\t" + selectionSet + "\n\t\t\t\t\t\t}\n\t\t\t\t\t\tnextToken\n\t\t\t\t\t\tstartedAt";
            break;
        case 'CREATE':
            operation = "create" + typeName;
            documentArgs = "($input: Create" + typeName + "Input!)";
            operationArgs = '(input: $input)';
            transformerMutationType = TransformerMutationType.CREATE;
            break;
        case 'UPDATE':
            operation = "update" + typeName;
            documentArgs = "($input: Update" + typeName + "Input!, $condition: Model" + typeName + "ConditionInput)";
            operationArgs = '(input: $input, condition: $condition)';
            transformerMutationType = TransformerMutationType.UPDATE;
            break;
        case 'DELETE':
            operation = "delete" + typeName;
            documentArgs = "($input: Delete" + typeName + "Input!, $condition: Model" + typeName + "ConditionInput)";
            operationArgs = '(input: $input, condition: $condition)';
            transformerMutationType = TransformerMutationType.DELETE;
            break;
        case 'GET':
            operation = "get" + typeName;
            documentArgs = "($id: ID!)";
            operationArgs = '(id: $id)';
            transformerMutationType = TransformerMutationType.GET;
            break;
        default:
            exhaustiveCheck(graphQLOpType);
    }
    return [
        [
            transformerMutationType,
            operation,
            GraphQLOperationType[graphQLOpType] + " operation" + documentArgs + "{\n\t\t" + operation + operationArgs + "{\n\t\t\t" + selectionSet + "\n\t\t}\n\t}",
        ],
    ];
}
export function createMutationInstanceFromModelOperation(relationships, modelDefinition, opType, model, element, condition, MutationEventConstructor, modelInstanceCreator, id) {
    var operation;
    switch (opType) {
        case OpType.INSERT:
            operation = TransformerMutationType.CREATE;
            break;
        case OpType.UPDATE:
            operation = TransformerMutationType.UPDATE;
            break;
        case OpType.DELETE:
            operation = TransformerMutationType.DELETE;
            break;
        default:
            exhaustiveCheck(opType);
    }
    var mutationEvent = modelInstanceCreator(MutationEventConstructor, __assign(__assign({}, (id ? { id: id } : {})), { data: JSON.stringify(element), modelId: element.id, model: model.name, operation: operation, condition: JSON.stringify(condition) }));
    return mutationEvent;
}
export function predicateToGraphQLCondition(predicate) {
    var result = {};
    if (!predicate || !Array.isArray(predicate.predicates)) {
        return result;
    }
    predicate.predicates.forEach(function (p) {
        var _a;
        if (isPredicateObj(p)) {
            var field = p.field, operator = p.operator, operand = p.operand;
            if (field === 'id') {
                return;
            }
            result[field] = (_a = {}, _a[operator] = operand, _a);
        }
        else {
            result[p.type] = predicateToGraphQLCondition(p);
        }
    });
    return result;
}
export function predicateToGraphQLFilter(predicatesGroup) {
    var result = {};
    if (!predicatesGroup || !Array.isArray(predicatesGroup.predicates)) {
        return result;
    }
    var type = predicatesGroup.type, predicates = predicatesGroup.predicates;
    var isList = type === 'and' || type === 'or';
    result[type] = isList ? [] : {};
    var appendToFilter = function (value) {
        return isList ? result[type].push(value) : (result[type] = value);
    };
    predicates.forEach(function (predicate) {
        var _a, _b;
        if (isPredicateObj(predicate)) {
            var field = predicate.field, operator = predicate.operator, operand = predicate.operand;
            var gqlField = (_a = {},
                _a[field] = (_b = {}, _b[operator] = operand, _b),
                _a);
            appendToFilter(gqlField);
            return;
        }
        appendToFilter(predicateToGraphQLFilter(predicate));
    });
    return result;
}
export function getUserGroupsFromToken(token, rule) {
    // validate token against groupClaim
    var userGroups = token[rule.groupClaim] || [];
    if (typeof userGroups === 'string') {
        var parsedGroups = void 0;
        try {
            parsedGroups = JSON.parse(userGroups);
        }
        catch (e) {
            parsedGroups = userGroups;
        }
        userGroups = [].concat(parsedGroups);
    }
    return userGroups;
}
//# sourceMappingURL=utils.js.map