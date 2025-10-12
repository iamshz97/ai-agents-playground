using SmartEato.Api.Services;

namespace SmartEato.Api.Endpoints.Profiles;

public class GetProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("api/profile", async (
            IUserProfileService profileService,
            HttpContext httpContext,
            ILogger<GetProfileEndpoint> logger) =>
        {
            try
            {
                var userId = GetUserId(httpContext);
                logger.LogInformation("Getting profile for user {UserId}", userId);

                var profile = await profileService.GetProfileAsync(userId);

                if (profile == null)
                {
                    return Results.NotFound(new { message = "Profile not found" });
                }

                return Results.Ok(profile);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting profile");
                return Results.BadRequest(new 
                { 
                    message = "Failed to get profile", 
                    error = ex.Message 
                });
            }
        })
        .RequireAuthorization()
        .WithName("GetProfile")
        .WithTags("Profile")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Get user profile";
            operation.Description = "Retrieves the profile of the authenticated user";
            return operation;
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound);
    }

    private static Guid GetUserId(HttpContext context)
    {
        var userIdString = context.Items["UserId"]?.ToString()
            ?? context.User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdString);
    }
}

