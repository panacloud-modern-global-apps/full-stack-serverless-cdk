import { FunctionalComponent } from '../../stencil-public-runtime';
/**
 * @slot amplify-form-section-header - Content for the header section
 * @slot subtitle - Content for the subtitle. This is inside of `amplify-form-section-header`.
 * @slot amplify-form-section-footer - Content for the footer section.
 */
export declare class AmplifyFormSection {
    /** (Required) Function called upon submission of form */
    handleSubmit: (event: Event) => void;
    /** (Optional) Used as a the default value within the default footer slot */
    submitButtonText?: string;
    /** Used for form section header */
    headerText: string;
    /** String prefix for the data-test attributes in this component primarily used for testing purposes */
    testDataPrefix?: string;
    /** Loading state for the form */
    loading?: boolean;
    /** Secondary footer component or text */
    secondaryFooterContent: string | FunctionalComponent | null;
    handleFormSubmit(ev: any): void;
    render(): any;
}
