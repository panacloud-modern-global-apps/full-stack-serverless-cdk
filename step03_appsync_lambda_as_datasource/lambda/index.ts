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
            return "Test Note";
        case "notesByID":
            return event.arguments.id;
        default:
            return null;
    }
}