type AppSyncEvent = {
    info: {
        fieldName: string
    }
    arguments: {
        id: string
    }
}

exports.handler = async (event: AppSyncEvent) => {
    switch(event.info.fieldName){
        case "notes":
            return "Hello World";
        case "notesByID":
            return JSON.stringify(event.arguments.id);
        default:
            return null;
    }
}