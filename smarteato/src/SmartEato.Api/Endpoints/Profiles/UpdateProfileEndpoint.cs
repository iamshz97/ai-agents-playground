using Microsoft.AspNetCore.Mvc;
using SmartEato.Api.Middleware;
using SmartEato.Api.Models.DTOs;
using SmartEato.Api.Services;

namespace SmartEato.Api.Endpoints.Profiles;

public class UpdateProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("api/profile", async (
            [FromBody] UpdateProfileDto dto,
            IUserProfileService profileService,
            HttpContext httpContext,
            ILogger<UpdateProfileEndpoint> logger) =>
        {
            try
            {
                var userId = httpContext.GetUserId();
                var userEmail = httpContext.GetUserEmail();
                
                logger.LogInformation("Updating profile for user {UserId} ({Email})", userId, userEmail);

                var profile = await profileService.UpdateProfileAsync(userId, dto);

                return Results.Ok(profile);
            }
            catch (UnauthorizedAccessException ex)
            {
                logger.LogWarning(ex, "Unauthorized access attempt");
                return Results.Unauthorized();
            }
            catch (InvalidOperationException ex)
            {
                logger.LogWarning(ex, "Profile not found");
                return Results.NotFound(new { message = "Profile not found" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating profile");
                return Results.BadRequest(new 
                { 
                    message = "Failed to update profile", 
                    error = ex.Message 
                });
            }
        })
        .RequireAuthorization()
        .WithName("UpdateProfile")
        .WithTags("Profile")
        .WithOpenApi(operation =>
        {
            operation.Summary = "Update user profile";
            operation.Description = "Updates the profile of the authenticated user";
            return operation;
        })
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound);
    }
}

