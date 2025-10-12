using Microsoft.AspNetCore.Mvc;
using SmartEato.Api.Models.DTOs;
using SmartEato.Api.Services;

namespace SmartEato.Api.Endpoints.Profiles;

public class CreateProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/profile", async (
            [FromBody] CreateProfileDto dto,
            IUserProfileService profileService,
            HttpContext httpContext,
            ILogger<CreateProfileEndpoint> logger) =>
        {
            try
            {
                var userId = GetUserId(httpContext);
                logger.LogInformation("Creating profile for user {UserId}", userId);

                var profile = await profileService.CreateProfileAsync(userId, dto);

                return Results.Created($"/api/profile", profile);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating profile");
                return Results.BadRequest(new 
                { 
                    message = "Failed to create profile", 
                    error = ex.Message 
                });
            }
        })
        .RequireAuthorization()
        .WithName("CreateProfile")
        .WithTags("Profile")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Create a new user profile";
            operation.Description = "Creates a new profile for the authenticated user";
            return operation;
        })
        .Produces(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);
    }

    private static Guid GetUserId(HttpContext context)
    {
        var userIdString = context.Items["UserId"]?.ToString()
            ?? context.User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdString);
    }
}

