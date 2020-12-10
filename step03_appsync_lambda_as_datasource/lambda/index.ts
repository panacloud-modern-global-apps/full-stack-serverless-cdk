type AppSyncEvent = {
    info: {
        fieldName: string
    }
    arguments: {
        title: string
    }
}


exports.handler = async (event: AppSyncEvent) => {

const notesArray = ["note1", "note2", "note3"]

    switch(event.info.fieldName){
        case "notes":
            return notesArray;
        case "customNote":
            return event.arguments.title;
        default:
            return null;
    }
}