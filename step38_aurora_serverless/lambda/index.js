"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const process_1 = require("process");
const value = process_1.env.INSTANCE_CREDENTIALS || "";
const envvalue = JSON.parse(value);
// Require and initialize outside of your main handler
const mysql = require("serverless-mysql")({
    config: {
        host: envvalue.host,
        database: envvalue.dbname,
        user: "admin",
        password: envvalue.password,
    },
});
async function handler(event, context) {
    // If you're using AWS Lambda with callbacks, be sure to set context.callbackWaitsForEmptyEventLoop = false; in your main handler. This will allow the freezing of connections and will prevent Lambda from hanging on open connections. See here for more information. If you are using async functions, this is no longer necessary.
    // context.callbackWaitsForEmptyEventLoop = false;
    try {
        // Connect to your MySQL instance first
        await mysql.connect();
        // Simple query
        let resultsa = await mysql.query("CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))");
        console.log(resultsa, "results from database");
        //  close the connection
        await mysql.end();
        // first query
        // "CREATE TABLE IF NOT EXISTS new (task_id INT AUTO_INCREMENT, description TEXT, PRIMARY KEY (task_id))"
        // second query
        // "insert into new (task_id, description) values(20,'complete the project')",
        // third query
        // "SELECT * FROM new"
        return {
            statusCode: 200,
            headers: { "Content-Type": "text/plain" },
            body: `Hello, CDK! You've created ${JSON.stringify(resultsa, null, 2)}\n`,
        };
    }
    catch (e) {
        console.log(e, "error from lambda");
        return {
            statusCode: 400,
            headers: { "Content-Type": "text/plain" },
            body: `Error creating table: ${JSON.stringify(e, null, 2)} \n`,
        };
    }
}
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxxQ0FBOEI7QUFFOUIsTUFBTSxLQUFLLEdBQUcsYUFBRyxDQUFDLG9CQUFvQixJQUFJLEVBQUUsQ0FBQztBQUM3QyxNQUFNLFFBQVEsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXhDLHNEQUFzRDtBQUN0RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN4QyxNQUFNLEVBQUU7UUFDTixJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7UUFDbkIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxNQUFNO1FBQ3pCLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO0tBQzVCO0NBQ0YsQ0FBQyxDQUFDO0FBRUksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkIsRUFDM0IsT0FBZ0I7SUFFaEIsc1VBQXNVO0lBQ3RVLGtEQUFrRDtJQUNsRCxJQUFJO1FBQ0YsdUNBQXVDO1FBQ3ZDLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXRCLGVBQWU7UUFDZixJQUFJLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxLQUFLLENBQzlCLHNHQUFzRyxDQUN2RyxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUUvQyx3QkFBd0I7UUFDeEIsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFbEIsY0FBYztRQUNkLHlHQUF5RztRQUV6RyxlQUFlO1FBQ2YsOEVBQThFO1FBRTlFLGNBQWM7UUFDZCxzQkFBc0I7UUFFdEIsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRTtZQUN6QyxJQUFJLEVBQUUsOEJBQThCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtTQUMxRSxDQUFDO0tBQ0g7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDcEMsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRTtZQUN6QyxJQUFJLEVBQUUseUJBQXlCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztTQUMvRCxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBMUNELDBCQTBDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFQSUdhdGV3YXlQcm94eUV2ZW50LFxuICBBUElHYXRld2F5UHJveHlSZXN1bHQsXG4gIENvbnRleHQsXG59IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5pbXBvcnQgeyBlbnYgfSBmcm9tIFwicHJvY2Vzc1wiO1xuXG5jb25zdCB2YWx1ZSA9IGVudi5JTlNUQU5DRV9DUkVERU5USUFMUyB8fCBcIlwiO1xuY29uc3QgZW52dmFsdWU6IGFueSA9IEpTT04ucGFyc2UodmFsdWUpO1xuXG4vLyBSZXF1aXJlIGFuZCBpbml0aWFsaXplIG91dHNpZGUgb2YgeW91ciBtYWluIGhhbmRsZXJcbmNvbnN0IG15c3FsID0gcmVxdWlyZShcInNlcnZlcmxlc3MtbXlzcWxcIikoe1xuICBjb25maWc6IHtcbiAgICBob3N0OiBlbnZ2YWx1ZS5ob3N0LFxuICAgIGRhdGFiYXNlOiBlbnZ2YWx1ZS5kYm5hbWUsXG4gICAgdXNlcjogXCJhZG1pblwiLFxuICAgIHBhc3N3b3JkOiBlbnZ2YWx1ZS5wYXNzd29yZCxcbiAgfSxcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50LFxuICBjb250ZXh0OiBDb250ZXh0XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAvLyBJZiB5b3UncmUgdXNpbmcgQVdTIExhbWJkYSB3aXRoIGNhbGxiYWNrcywgYmUgc3VyZSB0byBzZXQgY29udGV4dC5jYWxsYmFja1dhaXRzRm9yRW1wdHlFdmVudExvb3AgPSBmYWxzZTsgaW4geW91ciBtYWluIGhhbmRsZXIuIFRoaXMgd2lsbCBhbGxvdyB0aGUgZnJlZXppbmcgb2YgY29ubmVjdGlvbnMgYW5kIHdpbGwgcHJldmVudCBMYW1iZGEgZnJvbSBoYW5naW5nIG9uIG9wZW4gY29ubmVjdGlvbnMuIFNlZSBoZXJlIGZvciBtb3JlIGluZm9ybWF0aW9uLiBJZiB5b3UgYXJlIHVzaW5nIGFzeW5jIGZ1bmN0aW9ucywgdGhpcyBpcyBubyBsb25nZXIgbmVjZXNzYXJ5LlxuICAvLyBjb250ZXh0LmNhbGxiYWNrV2FpdHNGb3JFbXB0eUV2ZW50TG9vcCA9IGZhbHNlO1xuICB0cnkge1xuICAgIC8vIENvbm5lY3QgdG8geW91ciBNeVNRTCBpbnN0YW5jZSBmaXJzdFxuICAgIGF3YWl0IG15c3FsLmNvbm5lY3QoKTtcblxuICAgIC8vIFNpbXBsZSBxdWVyeVxuICAgIGxldCByZXN1bHRzYSA9IGF3YWl0IG15c3FsLnF1ZXJ5KFxuICAgICAgXCJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBuZXcgKHRhc2tfaWQgSU5UIEFVVE9fSU5DUkVNRU5ULCBkZXNjcmlwdGlvbiBURVhULCBQUklNQVJZIEtFWSAodGFza19pZCkpXCJcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2cocmVzdWx0c2EsIFwicmVzdWx0cyBmcm9tIGRhdGFiYXNlXCIpO1xuXG4gICAgLy8gIGNsb3NlIHRoZSBjb25uZWN0aW9uXG4gICAgYXdhaXQgbXlzcWwuZW5kKCk7XG5cbiAgICAvLyBmaXJzdCBxdWVyeVxuICAgIC8vIFwiQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgbmV3ICh0YXNrX2lkIElOVCBBVVRPX0lOQ1JFTUVOVCwgZGVzY3JpcHRpb24gVEVYVCwgUFJJTUFSWSBLRVkgKHRhc2tfaWQpKVwiXG5cbiAgICAvLyBzZWNvbmQgcXVlcnlcbiAgICAvLyBcImluc2VydCBpbnRvIG5ldyAodGFza19pZCwgZGVzY3JpcHRpb24pIHZhbHVlcygyMCwnY29tcGxldGUgdGhlIHByb2plY3QnKVwiLFxuXG4gICAgLy8gdGhpcmQgcXVlcnlcbiAgICAvLyBcIlNFTEVDVCAqIEZST00gbmV3XCJcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiIH0sXG4gICAgICBib2R5OiBgSGVsbG8sIENESyEgWW91J3ZlIGNyZWF0ZWQgJHtKU09OLnN0cmluZ2lmeShyZXN1bHRzYSwgbnVsbCwgMil9XFxuYCxcbiAgICB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5sb2coZSwgXCJlcnJvciBmcm9tIGxhbWJkYVwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIiB9LFxuICAgICAgYm9keTogYEVycm9yIGNyZWF0aW5nIHRhYmxlOiAke0pTT04uc3RyaW5naWZ5KGUsIG51bGwsIDIpfSBcXG5gLFxuICAgIH07XG4gIH1cbn1cbiJdfQ==