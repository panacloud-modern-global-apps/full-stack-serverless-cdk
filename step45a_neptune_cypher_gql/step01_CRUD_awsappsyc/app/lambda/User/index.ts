import createUser from './createUser';
import deleteUser from './deleteUser';
import allUsers from './allUsers';
import getUser from './getUser';
import User from './type';


type AppSyncEvent = {
    info: {
        fieldName: string
    },
    arguments: {
        user: User,
        id: string
    }
}


exports.handler = async(event: AppSyncEvent) => {
    switch(event.info.fieldName) {
        case "createUser":
            return await createUser(event.arguments.user);

        case "deleteUser":
            return await deleteUser(event.arguments.id);

        case "allUsers":
            return await allUsers();

        case "getUser":
            return await getUser(event.arguments.id);

        default:
            return null;
    }
}