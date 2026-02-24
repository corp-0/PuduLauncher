using System.Collections.Concurrent;
using System.IO.Pipes;
using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Enums;
using PuduLauncher.Models.Events;
using PuduLauncher.Services.Interfaces;

namespace PuduLauncher.Services;

public class IpcService(
    IEventPublisher eventPublisher,
    ILogger<IpcService> logger) : IIpcService, IDisposable
{
    private const string PIPE_NAME = "Unitystation_Hub_Build_Communication";

    private readonly ConcurrentDictionary<Guid, TaskCompletionSource<bool>> _pendingRequests = new();
    private readonly CancellationTokenSource _cts = new();

    public void Start()
    {
        _ = RunPipeServerAsync(_cts.Token);
    }

    public void RespondToRequest(Guid requestId, bool allowed)
    {
        if (_pendingRequests.TryRemove(requestId, out var tcs))
        {
            tcs.TrySetResult(allowed);
        }
        else
        {
            logger.LogWarning("IPC response for unknown request {RequestId}", requestId);
        }
    }

    private async Task RunPipeServerAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try
            {
                await using var pipe = new NamedPipeServerStream(
                    PIPE_NAME, PipeDirection.InOut, 1,
                    PipeTransmissionMode.Byte, PipeOptions.Asynchronous);

                logger.LogInformation("IPC pipe server waiting for connection");
                await pipe.WaitForConnectionAsync(ct);
                logger.LogInformation("IPC pipe client connected");

                await HandleClientAsync(pipe, ct);
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "IPC pipe server error, restarting");
                await Task.Delay(500, ct);
            }
        }
    }

    private async Task HandleClientAsync(NamedPipeServerStream pipe, CancellationToken ct)
    {
        using var reader = new StreamReader(pipe, leaveOpen: true);
        await using var writer = new StreamWriter(pipe, leaveOpen: true);
        writer.AutoFlush = true;

        while (pipe.IsConnected && !ct.IsCancellationRequested)
        {
            string? line = await reader.ReadLineAsync(ct);
            if (line == null)
            {
                break;
            }

            logger.LogInformation("IPC received: {Message}", line);

            try
            {
                bool allowed = await ProcessRequestAsync(line, ct);
                await writer.WriteLineAsync(allowed.ToString());
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing IPC request: {Message}", line);
                await writer.WriteLineAsync(false.ToString());
            }
        }
    }

    private async Task<bool> ProcessRequestAsync(string rawMessage, CancellationToken ct)
    {
        // Protocol: "requestTypeValue,arg1,arg2" split only on first commas to preserve justification text.
        string[] parts = rawMessage.Split(',', 3);

        if (!IpcRequestTypeExtensions.TryParseWireName(parts[0], out var requestType))
        {
            logger.LogWarning("Unknown IPC request type: {Raw}", parts[0]);
            return false;
        }

        string domain = parts.Length > 1 ? parts[1] : string.Empty;
        string justification = parts.Length > 2 ? parts[2] : string.Empty;

        var requestId = Guid.NewGuid();
        var tcs = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
        _pendingRequests[requestId] = tcs;

        try
        {
            await eventPublisher.PublishAsync(new IpcPermissionRequestEvent
            {
                RequestId = requestId,
                RequestType = requestType,
                Domain = domain,
                Justification = justification,
            }, ct);

            // Wait for frontend response or cancellation.
            await using CancellationTokenRegistration registration = ct.Register(() => tcs.TrySetCanceled(ct));
            return await tcs.Task;
        }
        catch
        {
            _pendingRequests.TryRemove(requestId, out _);
            throw;
        }
    }

    public void Dispose()
    {
        _cts.Cancel();
        _cts.Dispose();

        foreach (var tcs in _pendingRequests.Values)
        {
            tcs.TrySetCanceled();
        }
        _pendingRequests.Clear();

        GC.SuppressFinalize(this);
    }
}
