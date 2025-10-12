using System.Security.Claims;
using System.Text.Json;

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
        // Extract user ID from JWT claims added by JWT Bearer authentication
        var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier) 
                          ?? context.User.FindFirst("sub");

        if (userIdClaim != null)
        {
            context.Items["UserId"] = userIdClaim.Value;
            _logger.LogInformation("User ID extracted from JWT: {UserId}", userIdClaim.Value);
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

