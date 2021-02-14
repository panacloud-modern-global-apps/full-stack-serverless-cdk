"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rest_1 = require("@octokit/rest");
const semver = require("semver");
module.exports.fetchPreviousVersion = async function (base) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        throw new Error('GITHUB_TOKEN must be set');
    }
    const github = new rest_1.Octokit({ auth: token });
    const releases = await github.repos.listReleases({
        owner: 'aws',
        repo: 'aws-cdk',
    });
    // this returns a list in decsending order, newest releases first
    for (const release of releases.data) {
        const version = release.name.replace('v', '');
        if (semver.lt(version, base)) {
            return version;
        }
    }
    throw new Error(`Unable to find previous version of ${base}`);
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('make-runnable/custom')({
    printOutputFrame: false,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLWhlbHBlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnaXRodWItaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdDQUF3QztBQUN4QyxpQ0FBaUM7QUFFakMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLFdBQVUsSUFBWTtJQUMvRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQztJQUN2QyxJQUFJLENBQUMsS0FBSyxFQUFFO1FBQ1YsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0tBQzdDO0lBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxjQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDO1FBQy9DLEtBQUssRUFBRSxLQUFLO1FBQ1osSUFBSSxFQUFFLFNBQVM7S0FDaEIsQ0FBQyxDQUFDO0lBRUgsaUVBQWlFO0lBQ2pFLEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtRQUNuQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUMsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM1QixPQUFPLE9BQU8sQ0FBQztTQUNoQjtLQUNGO0lBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUVoRSxDQUFDLENBQUM7QUFFRixpRUFBaUU7QUFDakUsT0FBTyxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDOUIsZ0JBQWdCLEVBQUUsS0FBSztDQUN4QixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPY3Rva2l0IH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxubW9kdWxlLmV4cG9ydHMuZmV0Y2hQcmV2aW91c1ZlcnNpb24gPSBhc3luYyBmdW5jdGlvbihiYXNlOiBzdHJpbmcpIHtcbiAgY29uc3QgdG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU47XG4gIGlmICghdG9rZW4pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0dJVEhVQl9UT0tFTiBtdXN0IGJlIHNldCcpO1xuICB9XG5cbiAgY29uc3QgZ2l0aHViID0gbmV3IE9jdG9raXQoeyBhdXRoOiB0b2tlbiB9KTtcbiAgY29uc3QgcmVsZWFzZXMgPSBhd2FpdCBnaXRodWIucmVwb3MubGlzdFJlbGVhc2VzKHtcbiAgICBvd25lcjogJ2F3cycsXG4gICAgcmVwbzogJ2F3cy1jZGsnLFxuICB9KTtcblxuICAvLyB0aGlzIHJldHVybnMgYSBsaXN0IGluIGRlY3NlbmRpbmcgb3JkZXIsIG5ld2VzdCByZWxlYXNlcyBmaXJzdFxuICBmb3IgKGNvbnN0IHJlbGVhc2Ugb2YgcmVsZWFzZXMuZGF0YSkge1xuICAgIGNvbnN0IHZlcnNpb24gPSByZWxlYXNlLm5hbWUucmVwbGFjZSgndicsICcnKTtcbiAgICBpZiAoc2VtdmVyLmx0KHZlcnNpb24sIGJhc2UpKSB7XG4gICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICB9XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gZmluZCBwcmV2aW91cyB2ZXJzaW9uIG9mICR7YmFzZX1gKTtcblxufTtcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHNcbnJlcXVpcmUoJ21ha2UtcnVubmFibGUvY3VzdG9tJykoe1xuICBwcmludE91dHB1dEZyYW1lOiBmYWxzZSxcbn0pOyJdfQ==