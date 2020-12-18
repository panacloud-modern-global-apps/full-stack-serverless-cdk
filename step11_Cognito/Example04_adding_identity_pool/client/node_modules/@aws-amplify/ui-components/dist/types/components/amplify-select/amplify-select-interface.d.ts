interface SelectOption<T> {
    label: string;
    value: T;
}
interface SelectOptions<T extends string | number> extends Array<SelectOption<T>> {
}
export declare type SelectOptionsString = SelectOptions<string>;
export declare type SelectOptionsNumber = SelectOptions<number>;
export declare type SelectOptionString = SelectOption<string>;
export declare type SelectOptionNumber = SelectOption<number>;
export {};
