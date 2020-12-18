import { __awaiter, __generator } from "tslib";
import { HttpRequest } from "@aws-sdk/protocol-http";
export function resolveHostHeaderConfig(input) {
    return input;
}
export var hostHeaderMiddleware = function (options) { return function (next) { return function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var request, _a, handlerProtocol;
    return __generator(this, function (_b) {
        if (!HttpRequest.isInstance(args.request))
            return [2 /*return*/, next(args)];
        request = args.request;
        _a = (options.requestHandler.metadata || {}).handlerProtocol, handlerProtocol = _a === void 0 ? "" : _a;
        //For H2 request, remove 'host' header and use ':authority' header instead
        //reference: https://nodejs.org/dist/latest-v13.x/docs/api/errors.html#ERR_HTTP2_INVALID_CONNECTION_HEADERS
        if (handlerProtocol.indexOf("h2") >= 0 && !request.headers[":authority"]) {
            delete request.headers["host"];
            request.headers[":authority"] = "";
            //non-H2 request and 'host' header is not set, set the 'host' header to request's hostname.
        }
        else if (!request.headers["host"]) {
            request.headers["host"] = request.hostname;
        }
        return [2 /*return*/, next(args)];
    });
}); }; }; };
export var hostHeaderMiddlewareOptions = {
    name: "hostHeaderMiddleware",
    step: "build",
    priority: "low",
    tags: ["HOST"],
};
export var getHostHeaderPlugin = function (options) { return ({
    applyToStack: function (clientStack) {
        clientStack.add(hostHeaderMiddleware(options), hostHeaderMiddlewareOptions);
    },
}); };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQVVyRCxNQUFNLFVBQVUsdUJBQXVCLENBQ3JDLEtBQXFEO0lBRXJELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLG9CQUFvQixHQUFHLFVBQ2xDLE9BQWlDLElBQ0UsT0FBQSxVQUFDLElBQUksSUFBSyxPQUFBLFVBQU8sSUFBSTs7O1FBQ3hELElBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7WUFBRSxzQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7UUFDckQsT0FBTyxHQUFLLElBQUksUUFBVCxDQUFVO1FBQ2pCLEtBQXlCLENBQUEsT0FBTyxDQUFDLGNBQWMsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFBLGdCQUExQyxFQUFwQixlQUFlLG1CQUFHLEVBQUUsS0FBQSxDQUEyQztRQUN2RSwwRUFBMEU7UUFDMUUsMkdBQTJHO1FBQzNHLElBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3hFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQixPQUFPLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNuQywyRkFBMkY7U0FDNUY7YUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNuQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7U0FDNUM7UUFDRCxzQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7O0tBQ25CLEVBZDhDLENBYzlDLEVBZG9DLENBY3BDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSwyQkFBMkIsR0FBMkM7SUFDakYsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QixJQUFJLEVBQUUsT0FBTztJQUNiLFFBQVEsRUFBRSxLQUFLO0lBQ2YsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ2YsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLFVBQUMsT0FBaUMsSUFBMEIsT0FBQSxDQUFDO0lBQzlGLFlBQVksRUFBRSxVQUFDLFdBQVc7UUFDeEIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO0lBQzlFLENBQUM7Q0FDRixDQUFDLEVBSjZGLENBSTdGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUmVxdWVzdCB9IGZyb20gXCJAYXdzLXNkay9wcm90b2NvbC1odHRwXCI7XG5pbXBvcnQgeyBBYnNvbHV0ZUxvY2F0aW9uLCBCdWlsZEhhbmRsZXJPcHRpb25zLCBCdWlsZE1pZGRsZXdhcmUsIFBsdWdnYWJsZSwgUmVxdWVzdEhhbmRsZXIgfSBmcm9tIFwiQGF3cy1zZGsvdHlwZXNcIjtcblxuZXhwb3J0IGludGVyZmFjZSBIb3N0SGVhZGVySW5wdXRDb25maWcge31cbmludGVyZmFjZSBQcmV2aW91c2x5UmVzb2x2ZWQge1xuICByZXF1ZXN0SGFuZGxlcjogUmVxdWVzdEhhbmRsZXI8YW55LCBhbnk+O1xufVxuZXhwb3J0IGludGVyZmFjZSBIb3N0SGVhZGVyUmVzb2x2ZWRDb25maWcge1xuICByZXF1ZXN0SGFuZGxlcjogUmVxdWVzdEhhbmRsZXI8YW55LCBhbnk+O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVIb3N0SGVhZGVyQ29uZmlnPFQ+KFxuICBpbnB1dDogVCAmIFByZXZpb3VzbHlSZXNvbHZlZCAmIEhvc3RIZWFkZXJJbnB1dENvbmZpZ1xuKTogVCAmIEhvc3RIZWFkZXJSZXNvbHZlZENvbmZpZyB7XG4gIHJldHVybiBpbnB1dDtcbn1cblxuZXhwb3J0IGNvbnN0IGhvc3RIZWFkZXJNaWRkbGV3YXJlID0gPElucHV0IGV4dGVuZHMgb2JqZWN0LCBPdXRwdXQgZXh0ZW5kcyBvYmplY3Q+KFxuICBvcHRpb25zOiBIb3N0SGVhZGVyUmVzb2x2ZWRDb25maWdcbik6IEJ1aWxkTWlkZGxld2FyZTxJbnB1dCwgT3V0cHV0PiA9PiAobmV4dCkgPT4gYXN5bmMgKGFyZ3MpID0+IHtcbiAgaWYgKCFIdHRwUmVxdWVzdC5pc0luc3RhbmNlKGFyZ3MucmVxdWVzdCkpIHJldHVybiBuZXh0KGFyZ3MpO1xuICBjb25zdCB7IHJlcXVlc3QgfSA9IGFyZ3M7XG4gIGNvbnN0IHsgaGFuZGxlclByb3RvY29sID0gXCJcIiB9ID0gb3B0aW9ucy5yZXF1ZXN0SGFuZGxlci5tZXRhZGF0YSB8fCB7fTtcbiAgLy9Gb3IgSDIgcmVxdWVzdCwgcmVtb3ZlICdob3N0JyBoZWFkZXIgYW5kIHVzZSAnOmF1dGhvcml0eScgaGVhZGVyIGluc3RlYWRcbiAgLy9yZWZlcmVuY2U6IGh0dHBzOi8vbm9kZWpzLm9yZy9kaXN0L2xhdGVzdC12MTMueC9kb2NzL2FwaS9lcnJvcnMuaHRtbCNFUlJfSFRUUDJfSU5WQUxJRF9DT05ORUNUSU9OX0hFQURFUlNcbiAgaWYgKGhhbmRsZXJQcm90b2NvbC5pbmRleE9mKFwiaDJcIikgPj0gMCAmJiAhcmVxdWVzdC5oZWFkZXJzW1wiOmF1dGhvcml0eVwiXSkge1xuICAgIGRlbGV0ZSByZXF1ZXN0LmhlYWRlcnNbXCJob3N0XCJdO1xuICAgIHJlcXVlc3QuaGVhZGVyc1tcIjphdXRob3JpdHlcIl0gPSBcIlwiO1xuICAgIC8vbm9uLUgyIHJlcXVlc3QgYW5kICdob3N0JyBoZWFkZXIgaXMgbm90IHNldCwgc2V0IHRoZSAnaG9zdCcgaGVhZGVyIHRvIHJlcXVlc3QncyBob3N0bmFtZS5cbiAgfSBlbHNlIGlmICghcmVxdWVzdC5oZWFkZXJzW1wiaG9zdFwiXSkge1xuICAgIHJlcXVlc3QuaGVhZGVyc1tcImhvc3RcIl0gPSByZXF1ZXN0Lmhvc3RuYW1lO1xuICB9XG4gIHJldHVybiBuZXh0KGFyZ3MpO1xufTtcblxuZXhwb3J0IGNvbnN0IGhvc3RIZWFkZXJNaWRkbGV3YXJlT3B0aW9uczogQnVpbGRIYW5kbGVyT3B0aW9ucyAmIEFic29sdXRlTG9jYXRpb24gPSB7XG4gIG5hbWU6IFwiaG9zdEhlYWRlck1pZGRsZXdhcmVcIixcbiAgc3RlcDogXCJidWlsZFwiLFxuICBwcmlvcml0eTogXCJsb3dcIixcbiAgdGFnczogW1wiSE9TVFwiXSxcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRIb3N0SGVhZGVyUGx1Z2luID0gKG9wdGlvbnM6IEhvc3RIZWFkZXJSZXNvbHZlZENvbmZpZyk6IFBsdWdnYWJsZTxhbnksIGFueT4gPT4gKHtcbiAgYXBwbHlUb1N0YWNrOiAoY2xpZW50U3RhY2spID0+IHtcbiAgICBjbGllbnRTdGFjay5hZGQoaG9zdEhlYWRlck1pZGRsZXdhcmUob3B0aW9ucyksIGhvc3RIZWFkZXJNaWRkbGV3YXJlT3B0aW9ucyk7XG4gIH0sXG59KTtcbiJdfQ==