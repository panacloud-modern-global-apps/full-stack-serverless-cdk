import Observable from 'zen-observable-ts';
import { PredicateAll } from '../predicates';
import { ConflictHandler, DataStoreConfig, ModelInit, ModelInstanceMetadata, NonModelTypeConstructor, ProducerPaginationInput, PersistentModel, PersistentModelConstructor, ProducerModelPredicate, Schema, SubscriptionMessage, ErrorHandler } from '../types';
declare const initSchema: (userSchema: Schema) => Record<string, PersistentModelConstructor<any> | NonModelTypeConstructor<any>>;
export declare type ModelInstanceCreator = typeof modelInstanceCreator;
declare function modelInstanceCreator<T extends PersistentModel = PersistentModel>(modelConstructor: PersistentModelConstructor<T>, init: ModelInit<T> & Partial<ModelInstanceMetadata>): T;
declare class DataStore {
    private amplifyConfig;
    private conflictHandler;
    private errorHandler;
    private fullSyncInterval;
    private initialized;
    private initReject;
    private initResolve;
    private maxRecordsToSync;
    private storage;
    private sync;
    private syncPageSize;
    private syncExpressions;
    private syncPredicates;
    private sessionId;
    getModuleName(): string;
    start: () => Promise<void>;
    query: {
        <T extends PersistentModel>(modelConstructor: PersistentModelConstructor<T>, id: string): Promise<T | undefined>;
        <T extends PersistentModel>(modelConstructor: PersistentModelConstructor<T>, criteria?: ProducerModelPredicate<T> | typeof PredicateAll, paginationProducer?: ProducerPaginationInput<T>): Promise<T[]>;
    };
    save: <T extends Readonly<{
        id: string;
    } & Record<string, any>>>(model: T, condition?: ProducerModelPredicate<T>) => Promise<T>;
    setConflictHandler: (config: DataStoreConfig) => ConflictHandler;
    setErrorHandler: (config: DataStoreConfig) => ErrorHandler;
    delete: {
        <T extends PersistentModel>(model: T, condition?: ProducerModelPredicate<T>): Promise<T>;
        <T extends PersistentModel>(modelConstructor: PersistentModelConstructor<T>, id: string): Promise<T>;
        <T extends PersistentModel>(modelConstructor: PersistentModelConstructor<T>, condition: ProducerModelPredicate<T> | typeof PredicateAll): Promise<T[]>;
    };
    observe: {
        (): Observable<SubscriptionMessage<PersistentModel>>;
        <T extends PersistentModel>(model: T): Observable<SubscriptionMessage<T>>;
        <T extends PersistentModel>(modelConstructor: PersistentModelConstructor<T>, criteria?: string | ProducerModelPredicate<T>): Observable<SubscriptionMessage<T>>;
    };
    configure: (config?: DataStoreConfig) => void;
    clear: () => Promise<void>;
    stop: () => Promise<void>;
    private processPagination;
    private processSyncExpressions;
    private createFromCondition;
    private unwrapPromise;
    private weakMapFromEntries;
    private retrieveSessionId;
}
declare const instance: DataStore;
export { DataStore as DataStoreClass, initSchema, instance as DataStore };
