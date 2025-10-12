using Microsoft.AspNetCore.Mvc;
using SmartEato.Api.Middleware;
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
                var userId = httpContext.GetUserId();
                var userEmail = httpContext.GetUserEmail();
                
                logger.LogInformation("Creating profile for user {UserId} ({Email})", userId, userEmail);

                var profile = await profileService.CreateProfileAsync(userId, dto);

                return Results.Created($"/api/profile", profile);
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogWarning(ex, "Unauthorized access attempt");
                return Results.Unauthorized();
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
}

