const fs = require("fs").promises;

const MSG_FILE_PATH = "/mnt/msg/content";

exports.handler = async (event: any) => {
  console.log(event);
  const method = event.requestContext.http.method;

  if (method === "GET") {
    return sendRes(200, await getMessages());
  } else if (method === "POST") {
    await createMessage(event.body);
    return sendRes(200, await getMessages());
  } else if (method === "DELETE") {
    await deleteMessages();
    return sendRes(200, await getMessages());
  } else {
    return sendRes(200, "Method unsupported");
  }
};

const createMessage = async (message: string) => {
  try {
    await fs.appendFile(MSG_FILE_PATH, message + "\n");
  } catch (error) {
    console.log("error in creating msg", error);
  }
};
const getMessages = async () => {
  try {
    return await fs.readFile(MSG_FILE_PATH, "utf8");
  } catch (error) {
    console.log("error in getting messages", error);
  }
};

const deleteMessages = async () => {
  console.log("delete all messages");
  try {
    await fs.unlink(MSG_FILE_PATH);
  } catch (error) {
    console.log("error in deleting", error);
  }
};

const sendRes = (status: number, body: any) => {
  var response = {
    statusCode: status,
    body: body,
  };
  return response;
};
