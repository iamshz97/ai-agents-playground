using SmartEato.Api.Middleware;
using SmartEato.Api.Services;

namespace SmartEato.Api.Endpoints.Meals;

public class GetDailySummaryEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/meals/daily-summary", async (
            string? date,
            IMealWorkflowService workflowService,
            HttpContext httpContext,
            ILogger<GetDailySummaryEndpoint> logger) =>
        {
            try
            {
                var userId = httpContext.GetUserId();
                var targetDate = string.IsNullOrEmpty(date)
                    ? DateOnly.FromDateTime(DateTime.Today)
                    : DateOnly.Parse(date);

                logger.LogInformation("User {UserId} requesting daily summary for {Date}", userId, targetDate);

                var result = await workflowService.GetDailySummaryWithRecommendationAsync(userId, targetDate);

                return Results.Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogWarning(ex, "Unauthorized access attempt");
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting daily summary");
                return Results.BadRequest(new
                {
                    message = "Failed to get daily summary",
                    error = ex.Message
                });
            }
        })
        .RequireAuthorization()
        .WithName("GetDailySummary")
        .WithTags("Meals")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Get daily nutrition summary";
            operation.Description = "Returns daily totals, meals, and AI recommendation";
            return operation;
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);
    }
}

