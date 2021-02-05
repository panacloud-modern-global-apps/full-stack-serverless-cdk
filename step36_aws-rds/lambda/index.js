"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const process_1 = require("process");
const value = process_1.env.vala || "ll";
const envvalue2 = JSON.parse(value);
// Require and initialize outside of your main handler
const mysql = require("serverless-mysql")({
    config: {
        host: process_1.env.HOST,
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
        // let resultsb = await mysql.query(
        //   "insert into new (task_id, description) values(20,'important')"
        // );
        // Query with advanced options
        // let resultsc= await connect.query({
        //   sql: 'SELECT * FROM table WHERE name = ?',
        //   timeout: 10000,
        //   values: ['serverless']
        // })
        // let results = await mysql.query("SELECT * FROM new");
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
// ***************************************************************************************************************
// Transaction support in serverless-mysql has been dramatically simplified. Start a new transaction using the transaction() method, and then chain queries using the query() method. The query() method supports all standard query options. Alternatively, you can specify a function as the only argument in a query() method call and return the arguments as an array of values. The function receives two arguments, the result of the last query executed and an array containing all the previous query results. This is useful if you need values from a previous query as part of your transaction.
// You can specify an optional rollback() method in the chain. This will receive the error object, allowing you to add additional logging or perform some other action. Call the commit() method when you are ready to execute the queries.
// let results = await mysql.transaction()
//   .query('INSERT INTO table (x) VALUES(?)', [1])
//   .query('UPDATE table SET x = 1')
//   .rollback(e => { /* do something with the error */ }) // optional
//   .commit() // execute the queries
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxxQ0FBOEI7QUFFOUIsTUFBTSxLQUFLLEdBQUcsYUFBRyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7QUFDL0IsTUFBTSxTQUFTLEdBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUV6QyxzREFBc0Q7QUFDdEQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDeEMsTUFBTSxFQUFFO1FBQ04sSUFBSSxFQUFFLGFBQUcsQ0FBQyxJQUFJO1FBQ2QsUUFBUSxFQUFFLFNBQVMsQ0FBQyxNQUFNO1FBQzFCLElBQUksRUFBRSxPQUFPO1FBQ2IsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO0tBQzdCO0NBQ0YsQ0FBQyxDQUFDO0FBRUksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkIsRUFDM0IsT0FBZ0I7SUFFaEIsc1VBQXNVO0lBQ3RVLGtEQUFrRDtJQUNsRCxJQUFJO1FBQ0YsdUNBQXVDO1FBQ3ZDLE1BQU0sS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3RCLDRCQUE0QjtRQUM1QixxQ0FBcUM7UUFFckMsZUFBZTtRQUNmLElBQUksUUFBUSxHQUFHLE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FDOUIsc0dBQXNHLENBQ3ZHLENBQUM7UUFFRixvQ0FBb0M7UUFDcEMsb0VBQW9FO1FBQ3BFLEtBQUs7UUFFTCw4QkFBOEI7UUFDOUIsc0NBQXNDO1FBQ3RDLCtDQUErQztRQUMvQyxvQkFBb0I7UUFDcEIsMkJBQTJCO1FBQzNCLEtBQUs7UUFFTCx3REFBd0Q7UUFFeEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsdUJBQXVCLENBQUMsQ0FBQztRQUUvQyx3QkFBd0I7UUFDeEIsTUFBTSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFbEIsY0FBYztRQUNkLHlHQUF5RztRQUV6RyxlQUFlO1FBQ2YsaUVBQWlFO1FBRWpFLGNBQWM7UUFDZCxzQkFBc0I7UUFFdEIsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRTtZQUN6QyxJQUFJLEVBQUUsOEJBQThCLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtTQUMxRSxDQUFDO0tBQ0g7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLG1CQUFtQixDQUFDLENBQUM7UUFDcEMsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRTtZQUN6QyxJQUFJLEVBQUUsNkJBQTZCLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSztTQUNuRSxDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBekRELDBCQXlEQztBQUNELGtIQUFrSDtBQUVsSCw2a0JBQTZrQjtBQUU3a0IsMk9BQTJPO0FBQzNPLDBDQUEwQztBQUMxQyxtREFBbUQ7QUFDbkQscUNBQXFDO0FBQ3JDLHNFQUFzRTtBQUN0RSxxQ0FBcUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBUElHYXRld2F5UHJveHlFdmVudCxcbiAgQVBJR2F0ZXdheVByb3h5UmVzdWx0LFxuICBDb250ZXh0LFxufSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHsgZW52IH0gZnJvbSBcInByb2Nlc3NcIjtcblxuY29uc3QgdmFsdWUgPSBlbnYudmFsYSB8fCBcImxsXCI7XG5jb25zdCBlbnZ2YWx1ZTI6IGFueSA9IEpTT04ucGFyc2UodmFsdWUpO1xuXG4vLyBSZXF1aXJlIGFuZCBpbml0aWFsaXplIG91dHNpZGUgb2YgeW91ciBtYWluIGhhbmRsZXJcbmNvbnN0IG15c3FsID0gcmVxdWlyZShcInNlcnZlcmxlc3MtbXlzcWxcIikoe1xuICBjb25maWc6IHtcbiAgICBob3N0OiBlbnYuSE9TVCxcbiAgICBkYXRhYmFzZTogZW52dmFsdWUyLmRibmFtZSxcbiAgICB1c2VyOiBcImFkbWluXCIsXG4gICAgcGFzc3dvcmQ6IGVudnZhbHVlMi5wYXNzd29yZCxcbiAgfSxcbn0pO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50LFxuICBjb250ZXh0OiBDb250ZXh0XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAvLyBJZiB5b3UncmUgdXNpbmcgQVdTIExhbWJkYSB3aXRoIGNhbGxiYWNrcywgYmUgc3VyZSB0byBzZXQgY29udGV4dC5jYWxsYmFja1dhaXRzRm9yRW1wdHlFdmVudExvb3AgPSBmYWxzZTsgaW4geW91ciBtYWluIGhhbmRsZXIuIFRoaXMgd2lsbCBhbGxvdyB0aGUgZnJlZXppbmcgb2YgY29ubmVjdGlvbnMgYW5kIHdpbGwgcHJldmVudCBMYW1iZGEgZnJvbSBoYW5naW5nIG9uIG9wZW4gY29ubmVjdGlvbnMuIFNlZSBoZXJlIGZvciBtb3JlIGluZm9ybWF0aW9uLiBJZiB5b3UgYXJlIHVzaW5nIGFzeW5jIGZ1bmN0aW9ucywgdGhpcyBpcyBubyBsb25nZXIgbmVjZXNzYXJ5LlxuICAvLyBjb250ZXh0LmNhbGxiYWNrV2FpdHNGb3JFbXB0eUV2ZW50TG9vcCA9IGZhbHNlO1xuICB0cnkge1xuICAgIC8vIENvbm5lY3QgdG8geW91ciBNeVNRTCBpbnN0YW5jZSBmaXJzdFxuICAgIGF3YWl0IG15c3FsLmNvbm5lY3QoKTtcbiAgICAvLyBHZXQgdGhlIGNvbm5lY3Rpb24gb2JqZWN0XG4gICAgLy8gbGV0IGNvbm5lY3Rpb24gPSBteXNxbC5nZXRDbGllbnQoKVxuXG4gICAgLy8gU2ltcGxlIHF1ZXJ5XG4gICAgbGV0IHJlc3VsdHNhID0gYXdhaXQgbXlzcWwucXVlcnkoXG4gICAgICBcIkNSRUFURSBUQUJMRSBJRiBOT1QgRVhJU1RTIG5ldyAodGFza19pZCBJTlQgQVVUT19JTkNSRU1FTlQsIGRlc2NyaXB0aW9uIFRFWFQsIFBSSU1BUlkgS0VZICh0YXNrX2lkKSlcIlxuICAgICk7XG5cbiAgICAvLyBsZXQgcmVzdWx0c2IgPSBhd2FpdCBteXNxbC5xdWVyeShcbiAgICAvLyAgIFwiaW5zZXJ0IGludG8gbmV3ICh0YXNrX2lkLCBkZXNjcmlwdGlvbikgdmFsdWVzKDIwLCdpbXBvcnRhbnQnKVwiXG4gICAgLy8gKTtcblxuICAgIC8vIFF1ZXJ5IHdpdGggYWR2YW5jZWQgb3B0aW9uc1xuICAgIC8vIGxldCByZXN1bHRzYz0gYXdhaXQgY29ubmVjdC5xdWVyeSh7XG4gICAgLy8gICBzcWw6ICdTRUxFQ1QgKiBGUk9NIHRhYmxlIFdIRVJFIG5hbWUgPSA/JyxcbiAgICAvLyAgIHRpbWVvdXQ6IDEwMDAwLFxuICAgIC8vICAgdmFsdWVzOiBbJ3NlcnZlcmxlc3MnXVxuICAgIC8vIH0pXG5cbiAgICAvLyBsZXQgcmVzdWx0cyA9IGF3YWl0IG15c3FsLnF1ZXJ5KFwiU0VMRUNUICogRlJPTSBuZXdcIik7XG5cbiAgICBjb25zb2xlLmxvZyhyZXN1bHRzYSwgXCJyZXN1bHRzIGZyb20gZGF0YWJhc2VcIik7XG5cbiAgICAvLyAgY2xvc2UgdGhlIGNvbm5lY3Rpb25cbiAgICBhd2FpdCBteXNxbC5lbmQoKTtcblxuICAgIC8vIGZpcnN0IHF1ZXJ5XG4gICAgLy8gXCJDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBuZXcgKHRhc2tfaWQgSU5UIEFVVE9fSU5DUkVNRU5ULCBkZXNjcmlwdGlvbiBURVhULCBQUklNQVJZIEtFWSAodGFza19pZCkpXCJcblxuICAgIC8vIHNlY29uZCBxdWVyeVxuICAgIC8vIFwiaW5zZXJ0IGludG8gbmV3ICh0YXNrX2lkLCBkZXNjcmlwdGlvbikgdmFsdWVzKDIwLCdodW1kZGRhJylcIixcblxuICAgIC8vIHRoaXJkIHF1ZXJ5XG4gICAgLy8gXCJTRUxFQ1QgKiBGUk9NIG5ld1wiXG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcInRleHQvcGxhaW5cIiB9LFxuICAgICAgYm9keTogYEhlbGxvLCBDREshIFlvdSd2ZSBjcmVhdGVkICR7SlNPTi5zdHJpbmdpZnkocmVzdWx0c2EsIG51bGwsIDIpfVxcbmAsXG4gICAgfTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUubG9nKGUsIFwiZXJyb3IgZnJvbSBsYW1iZGFcIik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJ0ZXh0L3BsYWluXCIgfSxcbiAgICAgIGJvZHk6IGBIZWxsbywgQ0RLISBZb3UndmUgY3JlYXRlZCR7SlNPTi5zdHJpbmdpZnkoZSwgbnVsbCwgMil9IFxcbmAsXG4gICAgfTtcbiAgfVxufVxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8vIFRyYW5zYWN0aW9uIHN1cHBvcnQgaW4gc2VydmVybGVzcy1teXNxbCBoYXMgYmVlbiBkcmFtYXRpY2FsbHkgc2ltcGxpZmllZC4gU3RhcnQgYSBuZXcgdHJhbnNhY3Rpb24gdXNpbmcgdGhlIHRyYW5zYWN0aW9uKCkgbWV0aG9kLCBhbmQgdGhlbiBjaGFpbiBxdWVyaWVzIHVzaW5nIHRoZSBxdWVyeSgpIG1ldGhvZC4gVGhlIHF1ZXJ5KCkgbWV0aG9kIHN1cHBvcnRzIGFsbCBzdGFuZGFyZCBxdWVyeSBvcHRpb25zLiBBbHRlcm5hdGl2ZWx5LCB5b3UgY2FuIHNwZWNpZnkgYSBmdW5jdGlvbiBhcyB0aGUgb25seSBhcmd1bWVudCBpbiBhIHF1ZXJ5KCkgbWV0aG9kIGNhbGwgYW5kIHJldHVybiB0aGUgYXJndW1lbnRzIGFzIGFuIGFycmF5IG9mIHZhbHVlcy4gVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIHR3byBhcmd1bWVudHMsIHRoZSByZXN1bHQgb2YgdGhlIGxhc3QgcXVlcnkgZXhlY3V0ZWQgYW5kIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIHRoZSBwcmV2aW91cyBxdWVyeSByZXN1bHRzLiBUaGlzIGlzIHVzZWZ1bCBpZiB5b3UgbmVlZCB2YWx1ZXMgZnJvbSBhIHByZXZpb3VzIHF1ZXJ5IGFzIHBhcnQgb2YgeW91ciB0cmFuc2FjdGlvbi5cblxuLy8gWW91IGNhbiBzcGVjaWZ5IGFuIG9wdGlvbmFsIHJvbGxiYWNrKCkgbWV0aG9kIGluIHRoZSBjaGFpbi4gVGhpcyB3aWxsIHJlY2VpdmUgdGhlIGVycm9yIG9iamVjdCwgYWxsb3dpbmcgeW91IHRvIGFkZCBhZGRpdGlvbmFsIGxvZ2dpbmcgb3IgcGVyZm9ybSBzb21lIG90aGVyIGFjdGlvbi4gQ2FsbCB0aGUgY29tbWl0KCkgbWV0aG9kIHdoZW4geW91IGFyZSByZWFkeSB0byBleGVjdXRlIHRoZSBxdWVyaWVzLlxuLy8gbGV0IHJlc3VsdHMgPSBhd2FpdCBteXNxbC50cmFuc2FjdGlvbigpXG4vLyAgIC5xdWVyeSgnSU5TRVJUIElOVE8gdGFibGUgKHgpIFZBTFVFUyg/KScsIFsxXSlcbi8vICAgLnF1ZXJ5KCdVUERBVEUgdGFibGUgU0VUIHggPSAxJylcbi8vICAgLnJvbGxiYWNrKGUgPT4geyAvKiBkbyBzb21ldGhpbmcgd2l0aCB0aGUgZXJyb3IgKi8gfSkgLy8gb3B0aW9uYWxcbi8vICAgLmNvbW1pdCgpIC8vIGV4ZWN1dGUgdGhlIHF1ZXJpZXNcbiJdfQ==