using PuduLauncher.Abstractions.Interfaces;
using PuduLauncher.Models.Events;

namespace PuduLauncher.Services;

/// <summary>
/// Background service that publishes elapsed time every second.
/// Demonstrates how hosted services can publish events to the frontend.
/// </summary>
public sealed class ClockService : BackgroundService
{
    private readonly IEventPublisher _eventPublisher;
    private readonly ILogger<ClockService> _logger;
    private readonly DateTime _startTime;

    public ClockService(IEventPublisher eventPublisher, ILogger<ClockService> logger)
    {
        _eventPublisher = eventPublisher;
        _logger = logger;
        _startTime = DateTime.UtcNow;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ClockService started at {StartTime}", _startTime);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(1000, stoppingToken);

                var elapsed = DateTime.UtcNow - _startTime;
                var formattedTime = $"{elapsed.Minutes:D2}:{elapsed.Seconds:D2}";

                await _eventPublisher.PublishAsync(new TimerEvent
                {
                    ElapsedTime = formattedTime
                }, stoppingToken);

                _logger.LogDebug("Published timer event: {ElapsedTime}", formattedTime);
            }
            catch (OperationCanceledException)
            {
                // Cancellation during delay/publish is normal during host shutdown.
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ClockService");
            }
        }

        _logger.LogInformation("ClockService stopped");
    }
}
