using System.Security.Claims;

namespace SmartEato.Api.Middleware;

public class SupabaseAuthMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<SupabaseAuthMiddleware> _logger;

    public SupabaseAuthMiddleware(RequestDelegate next, ILogger<SupabaseAuthMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Extract user ID from 'sub' claim (Supabase user ID)
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier) 
                              ?? context.User.FindFirst("sub");

            // Extract email from 'email' claim
            var emailClaim = context.User.FindFirst(ClaimTypes.Email)
                            ?? context.User.FindFirst("email");

            // Extract role from 'role' claim
            var roleClaim = context.User.FindFirst(ClaimTypes.Role)
                           ?? context.User.FindFirst("role");

            if (userIdClaim != null)
            {
                context.Items["UserId"] = userIdClaim.Value;
                _logger.LogInformation("User authenticated - ID: {UserId}", userIdClaim.Value);
            }

            if (emailClaim != null)
            {
                context.Items["UserEmail"] = emailClaim.Value;
                _logger.LogInformation("User email: {Email}", emailClaim.Value);
            }

            if (roleClaim != null)
            {
                context.Items["UserRole"] = roleClaim.Value;
            }
        }

        await _next(context);
    }
}

public static class SupabaseAuthMiddlewareExtensions
{
    public static IApplicationBuilder UseSupabaseAuth(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<SupabaseAuthMiddleware>();
    }
}

/// <summary>
/// Extension methods to easily access authenticated user information
/// </summary>
public static class HttpContextExtensions
{
    public static Guid GetUserId(this HttpContext context)
    {
        var userIdString = context.Items["UserId"]?.ToString()
            ?? context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? context.User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdString);
    }

    public static string GetUserEmail(this HttpContext context)
    {
        return context.Items["UserEmail"]?.ToString()
            ?? context.User.FindFirst(ClaimTypes.Email)?.Value
            ?? context.User.FindFirst("email")?.Value
            ?? throw new UnauthorizedAccessException("User email not found in token");
    }

    public static string? GetUserRole(this HttpContext context)
    {
        return context.Items["UserRole"]?.ToString()
            ?? context.User.FindFirst(ClaimTypes.Role)?.Value
            ?? context.User.FindFirst("role")?.Value;
    }
}
