import { FunctionalComponent } from '../../stencil-public-runtime';
import { AuthStateHandler } from '../../common/types/auth-types';
/**
 * @slot logo - Left-justified content placed at the start of the greetings bar
 * @slot nav - Right-justified content placed at the end of the greetings bar
 * @slot greetings-message - Content placed in the greetings text
 */
export declare class AmplifyGreetings {
    /** Username displayed in the greetings */
    username: string;
    /** Logo displayed inside of the header */
    logo: FunctionalComponent | null;
    /** Auth state change handler for this component */
    handleAuthStateChange: AuthStateHandler;
    render(): any;
}
