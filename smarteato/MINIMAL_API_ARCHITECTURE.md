# Minimal API Architecture

## Overview

The SmartEato backend uses **Minimal APIs** with automatic registration, following the vertical slice architecture pattern. This approach provides several benefits over traditional controllers:

- **Less boilerplate**: No need for controller classes
- **Vertical slices**: Each endpoint is a self-contained feature
- **Better organization**: Features are grouped by domain
- **Automatic discovery**: Endpoints register themselves via reflection

This implementation is based on [Milan Jovanovic's pattern for automatically registering Minimal APIs](https://www.milanjovanovic.tech/blog/automatically-register-minimal-apis-in-aspnetcore).

## Architecture Pattern

### IEndpoint Abstraction

Every API endpoint implements the `IEndpoint` interface:

```csharp
public interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}
```

### Automatic Registration

Endpoints are automatically discovered and registered using reflection:

```csharp
// In Program.cs
builder.Services.AddEndpoints(typeof(Program).Assembly);
app.MapEndpoints();
```

The `AddEndpoints` method scans the assembly for all `IEndpoint` implementations and registers them with dependency injection. The `MapEndpoints` method then calls `MapEndpoint` on each registered endpoint.

## Project Structure

```
SmartEato.Api/
├── Endpoints/
│   ├── IEndpoint.cs                    # Base interface
│   └── Profiles/
│       ├── CreateProfileEndpoint.cs    # POST /api/profile
│       ├── UpdateProfileEndpoint.cs    # PUT /api/profile
│       └── GetProfileEndpoint.cs       # GET /api/profile
├── Extensions/
│   ├── EndpointExtensions.cs           # Automatic registration
│   └── SupabaseAuthExtensions.cs       # JWT authentication
├── Services/
│   ├── IUserProfileService.cs
│   └── UserProfileService.cs
├── Models/
│   ├── UserProfile.cs
│   └── DTOs/
│       ├── CreateProfileDto.cs
│       └── UpdateProfileDto.cs
└── Program.cs                          # Application entry point
```

## Example Endpoint

Here's how a typical endpoint is structured:

```csharp
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
            // Endpoint logic here
            var userId = GetUserId(httpContext);
            var profile = await profileService.CreateProfileAsync(userId, dto);
            return Results.Created($"/api/profile", profile);
        })
        .RequireAuthorization()
        .WithName("CreateProfile")
        .WithTags("Profile")
        .WithOpenApi()
        .Produces(StatusCodes.Status201Created)
        .Produces(StatusCodes.Status401Unauthorized);
    }

    private static Guid GetUserId(HttpContext context)
    {
        var userIdString = context.Items["UserId"]?.ToString()
            ?? context.User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException("User ID not found");

        return Guid.Parse(userIdString);
    }
}
```

## Key Features

### 1. Dependency Injection

Endpoints automatically receive dependencies via parameter injection:

```csharp
app.MapPost("api/profile", async (
    IUserProfileService profileService,  // ✅ Injected
    ILogger<CreateProfileEndpoint> logger,  // ✅ Injected
    HttpContext httpContext) =>  // ✅ Injected
{
    // Use injected services
});
```

### 2. Authorization

Apply authorization per endpoint:

```csharp
app.MapPost("api/profile", handler)
    .RequireAuthorization();  // ✅ Requires JWT token
```

### 3. OpenAPI/Swagger

Endpoints automatically appear in Swagger with metadata:

```csharp
app.MapPost("api/profile", handler)
    .WithName("CreateProfile")
    .WithTags("Profile")
    .WithOpenApi(operation =>
    {
        operation.Summary = "Create a new user profile";
        return operation;
    })
    .Produces<UserProfile>(StatusCodes.Status201Created)
    .ProducesProblem(StatusCodes.Status400BadRequest);
```

### 4. Validation

Use DTOs with data annotations for automatic validation:

```csharp
public class CreateProfileDto
{
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;
    
    [Required]
    [Range(0.1, 500)]
    public decimal CurrentWeight { get; set; }
}
```

### 5. Type-Safe Responses

Use `Results` for consistent, type-safe responses:

```csharp
return Results.Ok(profile);           // 200
return Results.Created(uri, profile); // 201
return Results.NotFound();            // 404
return Results.BadRequest(error);     // 400
```

## Current Endpoints

### Profile Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/profile` | Create user profile | ✅ Required |
| PUT | `/api/profile` | Update user profile | ✅ Required |
| GET | `/api/profile` | Get user profile | ✅ Required |

All endpoints:
- Require JWT authentication
- Extract user ID from token
- Return appropriate status codes
- Include OpenAPI documentation
- Apply CORS policy for mobile app

## Adding New Endpoints

To add a new endpoint:

1. **Create endpoint class** in appropriate feature folder:
   ```csharp
   public class GetUserStatsEndpoint : IEndpoint
   {
       public void MapEndpoint(IEndpointRouteBuilder app)
       {
           app.MapGet("api/stats", handler)
               .RequireAuthorization()
               .WithTags("Stats");
       }
   }
   ```

2. **That's it!** The endpoint will be automatically:
   - Discovered via reflection
   - Registered with DI
   - Mapped to the application
   - Included in Swagger

No need to manually register in `Program.cs` or create a controller class.

## Benefits Over Controllers

### Traditional Controller Approach

```csharp
[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(...) { }
    
    [HttpPut]
    public async Task<IActionResult> Update(...) { }
    
    [HttpGet]
    public async Task<IActionResult> Get(...) { }
}
```

❌ All endpoints in one file  
❌ Harder to test individually  
❌ Controller base class overhead  
❌ Action methods conventions  

### Minimal API Approach

```csharp
public class CreateProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("api/profile", handler);
    }
}
```

✅ One endpoint per file  
✅ Easy to test in isolation  
✅ No base class needed  
✅ Functional programming style  
✅ Better performance  

## Performance

Minimal APIs in .NET are:
- **Faster** than controllers (no MVC pipeline overhead)
- **Less memory** usage (smaller request pipeline)
- **Cleaner** generated code (no attribute routing complexity)

However, the automatic registration uses reflection at startup, which has a **negligible** performance impact since it only runs once during application initialization.

## Testing

Endpoints can be tested using WebApplicationFactory:

```csharp
[Fact]
public async Task CreateProfile_ReturnsCreated()
{
    // Arrange
    var factory = new WebApplicationFactory<Program>();
    var client = factory.CreateClient();
    
    // Act
    var response = await client.PostAsJsonAsync("/api/profile", dto);
    
    // Assert
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
}
```

## Future Enhancements

Potential improvements:
1. **Source Generators**: Replace reflection with compile-time code generation
2. **Route Groups**: Add API versioning with `RouteGroupBuilder`
3. **Filters**: Create reusable endpoint filters for cross-cutting concerns
4. **Rate Limiting**: Add per-endpoint rate limiting
5. **Response Caching**: Cache GET endpoint responses

## Resources

- [Milan Jovanovic - Automatically Register Minimal APIs](https://www.milanjovanovic.tech/blog/automatically-register-minimal-apis-in-aspnetcore)
- [Microsoft Docs - Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis)
- [Vertical Slice Architecture](https://www.jimmybogard.com/vertical-slice-architecture/)

## Summary

The Minimal API architecture provides:
- 🚀 **Better performance** than controllers
- 📦 **Cleaner organization** with vertical slices
- 🔄 **Automatic discovery** of endpoints
- 🎯 **Single responsibility** - one endpoint, one file
- 🧪 **Easier testing** in isolation
- 📝 **Less boilerplate** code

This modern approach aligns perfectly with the vertical slice architecture and makes the codebase more maintainable as it grows.

