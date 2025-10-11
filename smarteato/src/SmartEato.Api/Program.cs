using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Add service defaults (includes OpenTelemetry, health checks, service discovery)
builder.AddServiceDefaults();

// Add services to the container
builder.Services.AddControllers();

// Configure Supabase
builder.Services.AddScoped<Supabase.Client>(_ =>
{
    var url = builder.Configuration["Supabase:Url"] 
        ?? throw new InvalidOperationException("Supabase URL is not configured");
    var key = builder.Configuration["Supabase:Key"] 
        ?? throw new InvalidOperationException("Supabase Key is not configured");

    var options = new SupabaseOptions
    {
        AutoRefreshToken = true,
        AutoConnectRealtime = true
    };

    return new Supabase.Client(url, key, options);
});

// Configure CORS for React Native
builder.Services.AddCors(options =>
{
    options.AddPolicy("MobileAppPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:8081",  // Expo default
                "exp://localhost:8081",    // Expo scheme
                "http://localhost:19000",  // Expo alternative port
                "http://localhost:19006"   // Expo web
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "SmartEato API",
        Version = "v1",
        Description = "AI-powered calorie tracking application API with Supabase backend"
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SmartEato API v1");
        c.RoutePrefix = string.Empty; // Serve Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseCors("MobileAppPolicy");

app.UseAuthorization();

app.MapControllers();

// Map default endpoints (health checks)
app.MapDefaultEndpoints();

// Placeholder API endpoint
app.MapGet("/api/info", () => new
{
    Name = "SmartEato API",
    Version = "1.0.0",
    Description = "Calorie tracking AI agentic app",
    Status = "Running"
})
.WithName("GetApiInfo")
.WithTags("Info");

app.Run();
