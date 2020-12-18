export interface Logger {
    debug(msg: string): void;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
}
/**
 * @deprecated use named import
 */
export default Logger;
