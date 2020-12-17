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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import API from '@aws-amplify/api';
import { ConsoleLogger as Logger, jitteredExponentialRetry, NonRetryableError, } from '@aws-amplify/core';
import Observable from 'zen-observable-ts';
import { DISCARD, isModelFieldType, isTargetNameAssociation, OpType, } from '../../types';
import { exhaustiveCheck, USER } from '../../util';
import { buildGraphQLOperation, createMutationInstanceFromModelOperation, TransformerMutationType, } from '../utils';
var MAX_ATTEMPTS = 10;
var logger = new Logger('DataStore');
var MutationProcessor = /** @class */ (function () {
    function MutationProcessor(schema, storage, userClasses, outbox, modelInstanceCreator, MutationEvent, conflictHandler, errorHandler) {
        this.schema = schema;
        this.storage = storage;
        this.userClasses = userClasses;
        this.outbox = outbox;
        this.modelInstanceCreator = modelInstanceCreator;
        this.MutationEvent = MutationEvent;
        this.conflictHandler = conflictHandler;
        this.errorHandler = errorHandler;
        this.typeQuery = new WeakMap();
        this.processing = false;
        this.generateQueries();
    }
    MutationProcessor.prototype.generateQueries = function () {
        var _this = this;
        Object.values(this.schema.namespaces).forEach(function (namespace) {
            Object.values(namespace.models)
                .filter(function (_a) {
                var syncable = _a.syncable;
                return syncable;
            })
                .forEach(function (model) {
                var _a = __read(buildGraphQLOperation(namespace, model, 'CREATE'), 1), createMutation = _a[0];
                var _b = __read(buildGraphQLOperation(namespace, model, 'UPDATE'), 1), updateMutation = _b[0];
                var _c = __read(buildGraphQLOperation(namespace, model, 'DELETE'), 1), deleteMutation = _c[0];
                _this.typeQuery.set(model, [
                    createMutation,
                    updateMutation,
                    deleteMutation,
                ]);
            });
        });
    };
    MutationProcessor.prototype.isReady = function () {
        return this.observer !== undefined;
    };
    MutationProcessor.prototype.start = function () {
        var _this = this;
        var observable = new Observable(function (observer) {
            _this.observer = observer;
            _this.resume();
            return function () {
                _this.pause();
            };
        });
        return observable;
    };
    MutationProcessor.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
            var head, namespaceName, _a, model, operation, data, condition, modelConstructor, result, opName, modelDefinition, error_1, record, hasMore;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.processing || !this.isReady()) {
                            return [2 /*return*/];
                        }
                        this.processing = true;
                        namespaceName = USER;
                        _c.label = 1;
                    case 1:
                        _a = this.processing;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.outbox.peek(this.storage)];
                    case 2:
                        _a = (head = _c.sent()) !== undefined;
                        _c.label = 3;
                    case 3:
                        if (!_a) return [3 /*break*/, 12];
                        model = head.model, operation = head.operation, data = head.data, condition = head.condition;
                        modelConstructor = this.userClasses[model];
                        result = void 0;
                        opName = void 0;
                        modelDefinition = void 0;
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.jitteredRetry(namespaceName, model, operation, data, condition, modelConstructor, this.MutationEvent, head)];
                    case 5:
                        _b = __read.apply(void 0, [_c.sent(), 3]), result = _b[0], opName = _b[1], modelDefinition = _b[2];
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        if (error_1.message === 'Offline' || error_1.message === 'RetryMutation') {
                            return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 7];
                    case 7:
                        if (!(result === undefined)) return [3 /*break*/, 9];
                        logger.debug('done retrying');
                        return [4 /*yield*/, this.outbox.dequeue(this.storage)];
                    case 8:
                        _c.sent();
                        return [3 /*break*/, 1];
                    case 9:
                        record = result.data[opName];
                        return [4 /*yield*/, this.outbox.dequeue(this.storage)];
                    case 10:
                        _c.sent();
                        return [4 /*yield*/, this.outbox.peek(this.storage)];
                    case 11:
                        hasMore = (_c.sent()) !== undefined;
                        this.observer.next({
                            operation: operation,
                            modelDefinition: modelDefinition,
                            model: record,
                            hasMore: hasMore,
                        });
                        return [3 /*break*/, 1];
                    case 12:
                        // pauses itself
                        this.pause();
                        return [2 /*return*/];
                }
            });
        });
    };
    MutationProcessor.prototype.jitteredRetry = function (namespaceName, model, operation, data, condition, modelConstructor, MutationEvent, mutationEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, jitteredExponentialRetry(function (model, operation, data, condition, modelConstructor, MutationEvent, mutationEvent) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, query, variables, graphQLCondition, opName, modelDefinition, tryWith, attempt, opType, result, err_1, _b, error, retryWith, err_2, _c, _d, opName_1, query_1, serverData, namespace, updatedMutation;
                            var _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _a = __read(this.createQueryVariables(namespaceName, model, operation, data, condition), 5), query = _a[0], variables = _a[1], graphQLCondition = _a[2], opName = _a[3], modelDefinition = _a[4];
                                        tryWith = { query: query, variables: variables };
                                        attempt = 0;
                                        opType = this.opTypeFromTransformerOperation(operation);
                                        _f.label = 1;
                                    case 1:
                                        _f.trys.push([1, 3, , 13]);
                                        return [4 /*yield*/, API.graphql(tryWith)];
                                    case 2:
                                        result = (_f.sent());
                                        return [2 /*return*/, [result, opName, modelDefinition]];
                                    case 3:
                                        err_1 = _f.sent();
                                        if (!(err_1.errors && err_1.errors.length > 0)) return [3 /*break*/, 12];
                                        _b = __read(err_1.errors, 1), error = _b[0];
                                        if (error.message === 'Network Error') {
                                            if (!this.processing) {
                                                throw new NonRetryableError('Offline');
                                            }
                                            // TODO: Check errors on different env (react-native or other browsers)
                                            throw new Error('Network Error');
                                        }
                                        if (!(error.errorType === 'ConflictUnhandled')) return [3 /*break*/, 11];
                                        attempt++;
                                        retryWith = void 0;
                                        if (!(attempt > MAX_ATTEMPTS)) return [3 /*break*/, 4];
                                        retryWith = DISCARD;
                                        return [3 /*break*/, 7];
                                    case 4:
                                        _f.trys.push([4, 6, , 7]);
                                        return [4 /*yield*/, this.conflictHandler({
                                                modelConstructor: modelConstructor,
                                                localModel: this.modelInstanceCreator(modelConstructor, variables.input),
                                                remoteModel: this.modelInstanceCreator(modelConstructor, error.data),
                                                operation: opType,
                                                attempts: attempt,
                                            })];
                                    case 5:
                                        retryWith = _f.sent();
                                        return [3 /*break*/, 7];
                                    case 6:
                                        err_2 = _f.sent();
                                        logger.warn('conflict trycatch', err_2);
                                        return [3 /*break*/, 13];
                                    case 7:
                                        if (!(retryWith === DISCARD)) return [3 /*break*/, 9];
                                        _c = __read(buildGraphQLOperation(this.schema.namespaces[namespaceName], modelDefinition, 'GET'), 1), _d = __read(_c[0], 3), opName_1 = _d[1], query_1 = _d[2];
                                        return [4 /*yield*/, API.graphql({
                                                query: query_1,
                                                variables: { id: variables.input.id },
                                            })];
                                    case 8:
                                        serverData = _f.sent();
                                        return [2 /*return*/, [serverData, opName_1, modelDefinition]];
                                    case 9:
                                        namespace = this.schema.namespaces[namespaceName];
                                        updatedMutation = createMutationInstanceFromModelOperation(namespace.relationships, modelDefinition, opType, modelConstructor, retryWith, graphQLCondition, MutationEvent, this.modelInstanceCreator, mutationEvent.id);
                                        return [4 /*yield*/, this.storage.save(updatedMutation)];
                                    case 10:
                                        _f.sent();
                                        throw new NonRetryableError('RetryMutation');
                                    case 11:
                                        try {
                                            this.errorHandler({
                                                localModel: this.modelInstanceCreator(modelConstructor, variables.input),
                                                message: error.message,
                                                operation: operation,
                                                errorType: error.errorType,
                                                errorInfo: error.errorInfo,
                                                remoteModel: error.data
                                                    ? this.modelInstanceCreator(modelConstructor, error.data)
                                                    : null,
                                            });
                                        }
                                        catch (err) {
                                            logger.warn('failed to execute errorHandler', err);
                                        }
                                        finally {
                                            // Return empty tuple, dequeues the mutation
                                            return [2 /*return*/, error.data
                                                    ? [
                                                        { data: (_e = {}, _e[opName] = error.data, _e) },
                                                        opName,
                                                        modelDefinition,
                                                    ]
                                                    : []];
                                        }
                                        _f.label = 12;
                                    case 12: return [3 /*break*/, 13];
                                    case 13:
                                        if (tryWith) return [3 /*break*/, 1];
                                        _f.label = 14;
                                    case 14: return [2 /*return*/];
                                }
                            });
                        }); }, [
                            model,
                            operation,
                            data,
                            condition,
                            modelConstructor,
                            MutationEvent,
                            mutationEvent,
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    MutationProcessor.prototype.createQueryVariables = function (namespaceName, model, operation, data, condition) {
        var modelDefinition = this.schema.namespaces[namespaceName].models[model];
        var queriesTuples = this.typeQuery.get(modelDefinition);
        var _a = __read(queriesTuples.find(function (_a) {
            var _b = __read(_a, 1), transformerMutationType = _b[0];
            return transformerMutationType === operation;
        }), 3), opName = _a[1], query = _a[2];
        var _b = JSON.parse(data), _version = _b._version, parsedData = __rest(_b, ["_version"]);
        var filteredData = operation === TransformerMutationType.DELETE
            ? { id: parsedData.id } // For DELETE mutations, only ID is sent
            : Object.values(modelDefinition.fields)
                .filter(function (_a) {
                var type = _a.type, association = _a.association;
                // connections
                if (isModelFieldType(type)) {
                    // BELONGS_TO
                    if (isTargetNameAssociation(association) &&
                        association.connectionType === 'BELONGS_TO') {
                        return true;
                    }
                    // All other connections
                    return false;
                }
                // scalars and non-model types
                return true;
            })
                .map(function (_a) {
                var name = _a.name, type = _a.type, association = _a.association;
                var fieldName = name;
                var val = parsedData[name];
                if (isModelFieldType(type) &&
                    isTargetNameAssociation(association)) {
                    fieldName = association.targetName;
                    val = parsedData[fieldName];
                }
                return [fieldName, val];
            })
                .reduce(function (acc, _a) {
                var _b = __read(_a, 2), k = _b[0], v = _b[1];
                acc[k] = v;
                return acc;
            }, {});
        // Build mutation variables input object
        var input = __assign(__assign({}, filteredData), { _version: _version });
        var graphQLCondition = JSON.parse(condition);
        var variables = __assign({ input: input }, (operation === TransformerMutationType.CREATE
            ? {}
            : {
                condition: Object.keys(graphQLCondition).length > 0
                    ? graphQLCondition
                    : null,
            }));
        return [query, variables, graphQLCondition, opName, modelDefinition];
    };
    MutationProcessor.prototype.opTypeFromTransformerOperation = function (operation) {
        switch (operation) {
            case TransformerMutationType.CREATE:
                return OpType.INSERT;
            case TransformerMutationType.DELETE:
                return OpType.DELETE;
            case TransformerMutationType.UPDATE:
                return OpType.UPDATE;
            case TransformerMutationType.GET: // Intentionally blank
                break;
            default:
                exhaustiveCheck(operation);
        }
    };
    MutationProcessor.prototype.pause = function () {
        this.processing = false;
    };
    return MutationProcessor;
}());
export { MutationProcessor };
//# sourceMappingURL=mutation.js.map