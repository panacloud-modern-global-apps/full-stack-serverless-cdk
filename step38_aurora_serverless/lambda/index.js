"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const process_1 = require("process");
const value = process_1.env.val || "ll";
const envvalue2 = JSON.parse(value);
// Require and initialize outside of your main handler
const mysql = require("serverless-mysql")({
    config: {
        host: envvalue2.host,
        database: envvalue2.dbname,
        user: "admin",
        password: envvalue2.password,
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
        // "insert into new (task_id, description) values(20,'humddda')",
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
            statusCode: 200,
            headers: { "Content-Type": "text/plain" },
            body: `Hello, CDK! You've created${JSON.stringify(e, null, 2)} \n`,
        };
    }
}
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxxQ0FBOEI7QUFFOUIsTUFBTSxLQUFLLEdBQUcsYUFBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUM7QUFDOUIsTUFBTSxTQUFTLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUV6QyxzREFBc0Q7QUFDdEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDeEMsTUFBTSxFQUFFO1FBQ04sSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO1FBQ3BCLFFBQVEsRUFBRSxTQUFTLENBQUMsTUFBTTtRQUMxQixJQUFJLEVBQUUsT0FBTztRQUNiLFFBQVEsRUFBRSxTQUFTLENBQUMsUUFBUTtLQUM3QjtDQUNGLENBQUMsQ0FBQztBQUVJLEtBQUssVUFBVSxPQUFPLENBQzNCLEtBQTJCLEVBQzNCLE9BQWdCO0lBRWhCLHNVQUFzVTtJQUN0VSxrREFBa0Q7SUFDbEQsSUFBSTtRQUNGLHVDQUF1QztRQUN2QyxNQUFNLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV0QixlQUFlO1FBQ2YsSUFBSSxRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsS0FBSyxDQUM5QixzR0FBc0csQ0FDdkcsQ0FBQztRQUVGLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHVCQUF1QixDQUFDLENBQUM7UUFFL0Msd0JBQXdCO1FBQ3hCLE1BQU0sS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRWxCLGNBQWM7UUFDZCx5R0FBeUc7UUFFekcsZUFBZTtRQUNmLGlFQUFpRTtRQUVqRSxjQUFjO1FBQ2Qsc0JBQXNCO1FBRXRCLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUU7WUFDekMsSUFBSSxFQUFFLDhCQUE4QixJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUk7U0FDMUUsQ0FBQztLQUNIO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3BDLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUU7WUFDekMsSUFBSSxFQUFFLDZCQUE2QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUs7U0FDbkUsQ0FBQztLQUNIO0FBQ0gsQ0FBQztBQTFDRCwwQkEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBUElHYXRld2F5UHJveHlFdmVudCxcbiAgQVBJR2F0ZXdheVByb3h5UmVzdWx0LFxuICBDb250ZXh0LFxufSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHsgZW52IH0gZnJvbSBcInByb2Nlc3NcIjtcblxuY29uc3QgdmFsdWUgPSBlbnYudmFsIHx8IFwibGxcIjtcbmNvbnN0IGVudnZhbHVlMjogYW55ID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG5cbi8vIFJlcXVpcmUgYW5kIGluaXRpYWxpemUgb3V0c2lkZSBvZiB5b3VyIG1haW4gaGFuZGxlclxuY29uc3QgbXlzcWwgPSByZXF1aXJlKFwic2VydmVybGVzcy1teXNxbFwiKSh7XG4gIGNvbmZpZzoge1xuICAgIGhvc3Q6IGVudnZhbHVlMi5ob3N0LFxuICAgIGRhdGFiYXNlOiBlbnZ2YWx1ZTIuZGJuYW1lLFxuICAgIHVzZXI6IFwiYWRtaW5cIixcbiAgICBwYXNzd29yZDogZW52dmFsdWUyLnBhc3N3b3JkLFxuICB9LFxufSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQsXG4gIGNvbnRleHQ6IENvbnRleHRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIC8vIElmIHlvdSdyZSB1c2luZyBBV1MgTGFtYmRhIHdpdGggY2FsbGJhY2tzLCBiZSBzdXJlIHRvIHNldCBjb250ZXh0LmNhbGxiYWNrV2FpdHNGb3JFbXB0eUV2ZW50TG9vcCA9IGZhbHNlOyBpbiB5b3VyIG1haW4gaGFuZGxlci4gVGhpcyB3aWxsIGFsbG93IHRoZSBmcmVlemluZyBvZiBjb25uZWN0aW9ucyBhbmQgd2lsbCBwcmV2ZW50IExhbWJkYSBmcm9tIGhhbmdpbmcgb24gb3BlbiBjb25uZWN0aW9ucy4gU2VlIGhlcmUgZm9yIG1vcmUgaW5mb3JtYXRpb24uIElmIHlvdSBhcmUgdXNpbmcgYXN5bmMgZnVuY3Rpb25zLCB0aGlzIGlzIG5vIGxvbmdlciBuZWNlc3NhcnkuXG4gIC8vIGNvbnRleHQuY2FsbGJhY2tXYWl0c0ZvckVtcHR5RXZlbnRMb29wID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgLy8gQ29ubmVjdCB0byB5b3VyIE15U1FMIGluc3RhbmNlIGZpcnN0XG4gICAgYXdhaXQgbXlzcWwuY29ubmVjdCgpO1xuXG4gICAgLy8gU2ltcGxlIHF1ZXJ5XG4gICAgbGV0IHJlc3VsdHNhID0gYXdhaXQgbXlzcWwucXVlcnkoXG4gICAgICBcIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG5ldyAodGFza19pZCBJTlQgQVVUT19JTkNSRU1FTlQsIGRlc2NyaXB0aW9uIFRFWFQsIFBSSU1BUlkgS0VZICh0YXNrX2lkKSlcIlxuICAgICk7XG5cbiAgICBjb25zb2xlLmxvZyhyZXN1bHRzYSwgXCJyZXN1bHRzIGZyb20gZGF0YWJhc2VcIik7XG5cbiAgICAvLyAgY2xvc2UgdGhlIGNvbm5lY3Rpb25cbiAgICBhd2FpdCBteXNxbC5lbmQoKTtcblxuICAgIC8vIGZpcnN0IHF1ZXJ5XG4gICAgLy8gXCJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBuZXcgKHRhc2tfaWQgSU5UIEFVVE9fSU5DUkVNRU5ULCBkZXNjcmlwdGlvbiBURVhULCBQUklNQVJZIEtFWSAodGFza19pZCkpXCJcblxuICAgIC8vIHNlY29uZCBxdWVyeVxuICAgIC8vIFwiaW5zZXJ0IGludG8gbmV3ICh0YXNrX2lkLCBkZXNjcmlwdGlvbikgdmFsdWVzKDIwLCdodW1kZGRhJylcIixcblxuICAgIC8vIHRoaXJkIHF1ZXJ5XG4gICAgLy8gXCJTRUxFQ1QgKiBGUk9NIG5ld1wiXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIiB9LFxuICAgICAgYm9keTogYEhlbGxvLCBDREshIFlvdSd2ZSBjcmVhdGVkICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0c2EsIG51bGwsIDIpfVxcbmAsXG4gICAgfTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKGUsIFwiZXJyb3IgZnJvbSBsYW1iZGFcIik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJ0ZXh0L3BsYWluXCIgfSxcbiAgICAgIGJvZHk6IGBIZWxsbywgQ0RLISBZb3UndmUgY3JlYXRlZCR7SlNPTi5zdHJpbmdpZnkoZSwgbnVsbCwgMil9IFxcbmAsXG4gICAgfTtcbiAgfVxufVxuIl19