using SmartEato.Api.Middleware;
using SmartEato.Api.Services;

namespace SmartEato.Api.Endpoints.Meals;

public class DeleteMealEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("api/meals/{mealId:guid}", async (
            Guid mealId,
            IMealService mealService,
            HttpContext httpContext,
            ILogger<DeleteMealEndpoint> logger) =>
        {
            try
            {
                var userId = httpContext.GetUserId();
                var userEmail = httpContext.GetUserEmail();

                logger.LogInformation("User {UserId} ({Email}) deleting meal {MealId}", userId, userEmail, mealId);

                var deleted = await mealService.DeleteMealAsync(userId, mealId);

                if (!deleted)
                {
                    return Results.NotFound(new { message = "Meal not found or already deleted" });
                }

                // Update daily summary after deletion
                var today = DateOnly.FromDateTime(DateTime.Today);
                await mealService.UpdateDailySummaryAsync(userId, today);

                return Results.NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogWarning(ex, "Unauthorized access attempt");
                return Results.Unauthorized();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error deleting meal");
                return Results.BadRequest(new
                {
                    message = "Failed to delete meal",
                    error = ex.Message
                });
            }
        })
        .RequireAuthorization()
        .WithName("DeleteMeal")
        .WithTags("Meals")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Delete a meal";
            operation.Description = "Deletes a meal and updates daily summary";
            return operation;
        })
        .Produces(StatusCodes.Status204NoContent)
        .Produces(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);
    }
}

