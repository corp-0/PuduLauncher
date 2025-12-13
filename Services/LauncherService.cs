using Grpc.Core;
using PuduLauncher.Grpc;

namespace PuduLauncher.Services;

/// <summary>
/// Example gRPC service exposing simple commands and a server-streaming progress feed.
/// Replace the stubbed logic with real backend operations.
/// </summary>
public class LauncherService : Launcher.LauncherBase
{
    public override Task<StatusReply> SingleResponse(StatusRequest request, ServerCallContext context)
    {
        return Task.FromResult(new StatusReply { State = "Pong", Version = "1.0.0" });
    }

    public override Task<LaunchReply> LaunchJob(LaunchRequest request, ServerCallContext context)
    {
        var jobId = string.IsNullOrWhiteSpace(request.JobId) ? "demo-job" : request.JobId;
        return Task.FromResult(new LaunchReply
        {
            Started = true,
            Message = $"Job '{jobId}' queued"
        });
    }
    
    public override async Task StreamProgress(ProgressRequest request, IServerStreamWriter<ProgressUpdate> responseStream, ServerCallContext context)
    {
        // Stubbed progress that counts to 100.
        var jobId = string.IsNullOrWhiteSpace(request.JobId) ? "demo-job" : request.JobId;
        for (var pct = 0; pct <= 100 && !context.CancellationToken.IsCancellationRequested; pct += 10)
        {
            await responseStream.WriteAsync(new ProgressUpdate
            {
                JobId = jobId,
                Percent = pct,
                Status = pct == 100 ? "done" : "working"
            });

            await Task.Delay(400, context.CancellationToken);
        }
    }
}
