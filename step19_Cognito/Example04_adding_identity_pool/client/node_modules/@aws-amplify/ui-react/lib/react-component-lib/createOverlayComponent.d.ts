import React from 'react';
interface LoadingElement {
    present: () => any;
    dismiss: () => any;
}
interface ReactOverlayProps<E> {
    children?: React.ReactNode;
    isOpen: boolean;
    onDidDismiss?: (event: CustomEvent<E>) => void;
}
export declare function createOverlayComponent<T extends object, LoadingElementType extends LoadingElement, OverlayEventDetail>(displayName: string, controller: {
    create: (options: any) => Promise<LoadingElementType>;
}): {
    new (props: T & ReactOverlayProps<OverlayEventDetail>): {
        controller?: LoadingElementType;
        el: HTMLDivElement;
        componentDidMount(): void;
        componentDidUpdate(prevProps: T & ReactOverlayProps<OverlayEventDetail>): Promise<void>;
        present(prevProps?: T & ReactOverlayProps<OverlayEventDetail>): Promise<void>;
        render(): React.ReactPortal;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<T & ReactOverlayProps<OverlayEventDetail>>) => {} | Pick<{}, K>) | Pick<{}, K>, callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        readonly props: Readonly<T & ReactOverlayProps<OverlayEventDetail>> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        shouldComponentUpdate?(nextProps: Readonly<T & ReactOverlayProps<OverlayEventDetail>>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<T & ReactOverlayProps<OverlayEventDetail>>, prevState: Readonly<{}>): any;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<T & ReactOverlayProps<OverlayEventDetail>>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<T & ReactOverlayProps<OverlayEventDetail>>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<T & ReactOverlayProps<OverlayEventDetail>>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<T & ReactOverlayProps<OverlayEventDetail>>, nextState: Readonly<{}>, nextContext: any): void;
    };
    readonly displayName: string;
    contextType?: React.Context<any>;
};
export {};
