declare const fs: any;
declare const MSG_FILE_PATH = "/mnt/msg/content";
declare const createMessage: (message: string) => Promise<void>;
declare const getMessages: () => Promise<any>;
declare const deleteMessages: () => Promise<void>;
declare const sendRes: (status: number, body: any) => {
    statusCode: number;
    body: any;
};
