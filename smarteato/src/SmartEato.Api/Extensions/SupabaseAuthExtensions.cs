using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace SmartEato.Api.Extensions;

public static class SupabaseAuthExtensions
{
    public static IServiceCollection AddSupabaseAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var jwtSecret = configuration["Supabase:JwtSecret"] 
            ?? throw new InvalidOperationException("Supabase JWT Secret is not configured");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateIssuer = false, // Supabase doesn't use issuer validation by default
                ValidateAudience = true, // Validate audience for security
                ValidAudience = "authenticated", // Supabase default audience
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                // Map the Supabase 'sub' claim to NameIdentifier
                NameClaimType = "sub"
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    logger.LogError("Authentication failed: {Error}", context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    var logger = context.HttpContext.RequestServices
                        .GetRequiredService<ILogger<Program>>();
                    
                    // Log all claims for debugging
                    var claims = context.Principal?.Claims.Select(c => $"{c.Type}={c.Value}");
                    logger.LogInformation("Token validated. Claims: {Claims}", string.Join(", ", claims ?? Array.Empty<string>()));
                    
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();

        return services;
    }
}
