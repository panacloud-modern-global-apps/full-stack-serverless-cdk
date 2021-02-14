"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const process_1 = require("process");
const value = process_1.env.INSTANCE_CREDENTIALS || "";
const envvalue = JSON.parse(value);
// Require and initialize outside of your main handler
const mysql = require("serverless-mysql")({
    config: {
        host: process_1.env.HOST,
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
        // Get the connection object
        // let connection = mysql.getClient()
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
            body: `Error creating table${JSON.stringify(e, null, 2)} \n`,
        };
    }
}
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxxQ0FBOEI7QUFFOUIsTUFBTSxLQUFLLEdBQUcsYUFBRyxDQUFDLG9CQUFvQixJQUFJLEVBQUUsQ0FBQztBQUM3QyxNQUFNLFFBQVEsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXhDLHNEQUFzRDtBQUN0RCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUN4QyxNQUFNLEVBQUU7UUFDTixJQUFJLEVBQUUsYUFBRyxDQUFDLElBQUk7UUFDZCxRQUFRLEVBQUUsUUFBUSxDQUFDLE1BQU07UUFDekIsSUFBSSxFQUFFLE9BQU87UUFDYixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7S0FDNUI7Q0FDRixDQUFDLENBQUM7QUFFSSxLQUFLLFVBQVUsT0FBTyxDQUMzQixLQUEyQixFQUMzQixPQUFnQjtJQUVoQixzVUFBc1U7SUFDdFUsa0RBQWtEO0lBQ2xELElBQUk7UUFDRix1Q0FBdUM7UUFDdkMsTUFBTSxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDdEIsNEJBQTRCO1FBQzVCLHFDQUFxQztRQUVyQyxlQUFlO1FBQ2YsSUFBSSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUM5QixzR0FBc0csQ0FDdkcsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFFL0Msd0JBQXdCO1FBQ3hCLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRWxCLGNBQWM7UUFDZCx5R0FBeUc7UUFDekcsZUFBZTtRQUNmLDhFQUE4RTtRQUM5RSxjQUFjO1FBQ2Qsc0JBQXNCO1FBRXRCLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUU7WUFDekMsSUFBSSxFQUFFLDhCQUE4QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7U0FDMUUsQ0FBQztLQUNIO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3BDLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUU7WUFDekMsSUFBSSxFQUFFLHVCQUF1QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUs7U0FDN0QsQ0FBQztLQUNIO0FBQ0gsQ0FBQztBQTFDRCwwQkEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBUElHYXRld2F5UHJveHlFdmVudCxcbiAgQVBJR2F0ZXdheVByb3h5UmVzdWx0LFxuICBDb250ZXh0LFxufSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHsgZW52IH0gZnJvbSBcInByb2Nlc3NcIjtcblxuY29uc3QgdmFsdWUgPSBlbnYuSU5TVEFOQ0VfQ1JFREVOVElBTFMgfHwgXCJcIjtcbmNvbnN0IGVudnZhbHVlOiBhbnkgPSBKU09OLnBhcnNlKHZhbHVlKTtcblxuLy8gUmVxdWlyZSBhbmQgaW5pdGlhbGl6ZSBvdXRzaWRlIG9mIHlvdXIgbWFpbiBoYW5kbGVyXG5jb25zdCBteXNxbCA9IHJlcXVpcmUoXCJzZXJ2ZXJsZXNzLW15c3FsXCIpKHtcbiAgY29uZmlnOiB7XG4gICAgaG9zdDogZW52LkhPU1QsXG4gICAgZGF0YWJhc2U6IGVudnZhbHVlLmRibmFtZSxcbiAgICB1c2VyOiBcImFkbWluXCIsXG4gICAgcGFzc3dvcmQ6IGVudnZhbHVlLnBhc3N3b3JkLFxuICB9LFxufSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQsXG4gIGNvbnRleHQ6IENvbnRleHRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIC8vIElmIHlvdSdyZSB1c2luZyBBV1MgTGFtYmRhIHdpdGggY2FsbGJhY2tzLCBiZSBzdXJlIHRvIHNldCBjb250ZXh0LmNhbGxiYWNrV2FpdHNGb3JFbXB0eUV2ZW50TG9vcCA9IGZhbHNlOyBpbiB5b3VyIG1haW4gaGFuZGxlci4gVGhpcyB3aWxsIGFsbG93IHRoZSBmcmVlemluZyBvZiBjb25uZWN0aW9ucyBhbmQgd2lsbCBwcmV2ZW50IExhbWJkYSBmcm9tIGhhbmdpbmcgb24gb3BlbiBjb25uZWN0aW9ucy4gU2VlIGhlcmUgZm9yIG1vcmUgaW5mb3JtYXRpb24uIElmIHlvdSBhcmUgdXNpbmcgYXN5bmMgZnVuY3Rpb25zLCB0aGlzIGlzIG5vIGxvbmdlciBuZWNlc3NhcnkuXG4gIC8vIGNvbnRleHQuY2FsbGJhY2tXYWl0c0ZvckVtcHR5RXZlbnRMb29wID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgLy8gQ29ubmVjdCB0byB5b3VyIE15U1FMIGluc3RhbmNlIGZpcnN0XG4gICAgYXdhaXQgbXlzcWwuY29ubmVjdCgpO1xuICAgIC8vIEdldCB0aGUgY29ubmVjdGlvbiBvYmplY3RcbiAgICAvLyBsZXQgY29ubmVjdGlvbiA9IG15c3FsLmdldENsaWVudCgpXG5cbiAgICAvLyBTaW1wbGUgcXVlcnlcbiAgICBsZXQgcmVzdWx0c2EgPSBhd2FpdCBteXNxbC5xdWVyeShcbiAgICAgIFwiQ1JFQVRFIFRBQkxFIElGIE5PVCBFWElTVFMgbmV3ICh0YXNrX2lkIElOVCBBVVRPX0lOQ1JFTUVOVCwgZGVzY3JpcHRpb24gVEVYVCwgUFJJTUFSWSBLRVkgKHRhc2tfaWQpKVwiXG4gICAgKTtcblxuICAgIGNvbnNvbGUubG9nKHJlc3VsdHNhLCBcInJlc3VsdHMgZnJvbSBkYXRhYmFzZVwiKTtcblxuICAgIC8vICBjbG9zZSB0aGUgY29ubmVjdGlvblxuICAgIGF3YWl0IG15c3FsLmVuZCgpO1xuXG4gICAgLy8gZmlyc3QgcXVlcnlcbiAgICAvLyBcIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG5ldyAodGFza19pZCBJTlQgQVVUT19JTkNSRU1FTlQsIGRlc2NyaXB0aW9uIFRFWFQsIFBSSU1BUlkgS0VZICh0YXNrX2lkKSlcIlxuICAgIC8vIHNlY29uZCBxdWVyeVxuICAgIC8vIFwiaW5zZXJ0IGludG8gbmV3ICh0YXNrX2lkLCBkZXNjcmlwdGlvbikgdmFsdWVzKDIwLCdjb21wbGV0ZSB0aGUgcHJvamVjdCcpXCIsXG4gICAgLy8gdGhpcmQgcXVlcnlcbiAgICAvLyBcIlNFTEVDVCAqIEZST00gbmV3XCJcblxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwidGV4dC9wbGFpblwiIH0sXG4gICAgICBib2R5OiBgSGVsbG8sIENESyEgWW91J3ZlIGNyZWF0ZWQgJHtKU09OLnN0cmluZ2lmeShyZXN1bHRzYSwgbnVsbCwgMil9XFxuYCxcbiAgICB9O1xuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5sb2coZSwgXCJlcnJvciBmcm9tIGxhbWJkYVwiKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIiB9LFxuICAgICAgYm9keTogYEVycm9yIGNyZWF0aW5nIHRhYmxlJHtKU09OLnN0cmluZ2lmeShlLCBudWxsLCAyKX0gXFxuYCxcbiAgICB9O1xuICB9XG59XG4iXX0=