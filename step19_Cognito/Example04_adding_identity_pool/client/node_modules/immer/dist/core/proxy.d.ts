import { ImmerBaseState, ImmerState, Drafted, AnyObject, AnyArray, Objectish, ProxyTypeProxyObject, ProxyTypeProxyArray } from "../internal";
interface ProxyBaseState extends ImmerBaseState {
    assigned_: {
        [property: string]: boolean;
    };
    parent_?: ImmerState;
    drafts_?: {
        [property: string]: Drafted<any, any>;
    };
    revoke_(): void;
}
export interface ProxyObjectState extends ProxyBaseState {
    type_: typeof ProxyTypeProxyObject;
    base_: AnyObject;
    copy_: AnyObject | null;
    draft_: Drafted<AnyObject, ProxyObjectState>;
}
export interface ProxyArrayState extends ProxyBaseState {
    type_: typeof ProxyTypeProxyArray;
    base_: AnyArray;
    copy_: AnyArray | null;
    draft_: Drafted<AnyArray, ProxyArrayState>;
}
declare type ProxyState = ProxyObjectState | ProxyArrayState;
/**
 * Returns a new draft of the `base` object.
 *
 * The second argument is the parent draft-state (used internally).
 */
export declare function createProxyProxy<T extends Objectish>(base: T, parent?: ImmerState): Drafted<T, ProxyState>;
export declare function markChangedProxy(state: ImmerState): void;
export {};
//# sourceMappingURL=proxy.d.ts.map