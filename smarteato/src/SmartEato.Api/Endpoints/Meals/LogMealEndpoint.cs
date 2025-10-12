using Microsoft.AspNetCore.Mvc;
using SmartEato.Api.Middleware;
using SmartEato.Api.Models.DTOs;
using SmartEato.Api.Services;

namespace SmartEato.Api.Endpoints.Meals;

public class LogMealEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/meals", async (
            [FromBody] LogMealDto dto,
            IMealWorkflowService workflowService,
            HttpContext httpContext,
            ILogger<LogMealEndpoint> logger) =>
        {
            try
            {
                var userId = httpContext.GetUserId();
                var userEmail = httpContext.GetUserEmail();

                logger.LogInformation("User {UserId} ({Email}) logging meal", userId, userEmail);

                var result = await workflowService.LogMealAsync(userId, dto);

                return Results.Created($"/api/meals/{result.MealId}", result);
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogWarning(ex, "Unauthorized access attempt");
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error logging meal");
                return Results.BadRequest(new
                {
                    message = "Failed to log meal",
                    error = ex.Message
                });
            }
        })
        .RequireAuthorization()
        .WithName("LogMeal")
        .WithTags("Meals")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Log a new meal";
            operation.Description = "Logs a meal with AI-powered nutrition analysis";
            return operation;
        })
        .Produces<MealAnalysisResult>(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);
    }
}

