import { FormFieldType, PhoneFormFieldType } from './amplify-auth-fields-interface';
declare const componentFieldMapping: {
    username: (ff: FormFieldType) => any;
    password: (ff: FormFieldType) => any;
    email: (ff: FormFieldType) => any;
    code: (ff: FormFieldType) => any;
    phone_number: (ff: PhoneFormFieldType) => any;
    default: (ff: FormFieldType) => any;
};
export default componentFieldMapping;
