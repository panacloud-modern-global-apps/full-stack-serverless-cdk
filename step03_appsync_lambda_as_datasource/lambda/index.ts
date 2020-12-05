type AppSyncEvent = {
    info: {
        fieldName: string
    }
    arguments: {
        id: string
    }
}


exports.handler = async (event: AppSyncEvent) => {

const notesArray = ["note1", "note2", "note3"]

    switch(event.info.fieldName){
        case "notes":
            return notesArray;
        case "notesByID":
            return event.arguments.id;
        default:
            return null;
    }
}