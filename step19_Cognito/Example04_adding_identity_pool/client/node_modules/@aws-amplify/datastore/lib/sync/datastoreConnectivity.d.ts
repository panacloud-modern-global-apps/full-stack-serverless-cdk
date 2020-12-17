import Observable from 'zen-observable-ts';
declare type ConnectionStatus = {
    online: boolean;
};
export default class DataStoreConnectivity {
    private connectionStatus;
    private observer;
    private subscription;
    constructor();
    status(): Observable<ConnectionStatus>;
    unsubscribe(): void;
    socketDisconnected(): void;
}
export {};
