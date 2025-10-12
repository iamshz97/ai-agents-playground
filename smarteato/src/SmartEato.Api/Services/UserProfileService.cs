using SmartEato.Api.Models;
using SmartEato.Api.Models.DTOs;
using System.Text;
using System.Text.Json;

namespace SmartEato.Api.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<UserProfileService> _logger;

    public UserProfileService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<UserProfileService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    private HttpClient CreateSupabaseClient()
    {
        var client = _httpClientFactory.CreateClient();
        var baseUrl = _configuration["Supabase:Url"] ?? throw new InvalidOperationException("Supabase URL not configured");
        var serviceKey = _configuration["Supabase:Key"] ?? throw new InvalidOperationException("Supabase Key not configured");

        client.BaseAddress = new Uri($"{baseUrl}/rest/v1/");
        client.DefaultRequestHeaders.Add("apikey", serviceKey);
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {serviceKey}");
        client.DefaultRequestHeaders.Add("Prefer", "return=representation");

        return client;
    }

    public async Task<UserProfile> CreateProfileAsync(Guid userId, CreateProfileDto dto)
    {
        try
        {
            var client = CreateSupabaseClient();

            var profileData = new
            {
                user_id = userId,
                full_name = dto.FullName,
                birthdate = dto.Birthdate,
                gender = dto.Gender,
                current_weight = dto.CurrentWeight,
                height = dto.Height,
                goal_weight = dto.GoalWeight,
                activity_level = dto.ActivityLevel,
                dietary_preferences = dto.DietaryPreferences
            };

            var json = JsonSerializer.Serialize(profileData, new JsonSerializerOptions 
            { 
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower 
            });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PostAsync("user_profiles", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var profiles = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = profiles?.FirstOrDefault() 
                ?? throw new InvalidOperationException("Failed to create profile");

            return MapToUserProfile(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating profile for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserProfile> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        try
        {
            var client = CreateSupabaseClient();

            var updateData = new Dictionary<string, object> { { "updated_at", DateTime.UtcNow } };
            if (dto.FullName != null) updateData["full_name"] = dto.FullName;
            if (dto.Birthdate != null) updateData["birthdate"] = dto.Birthdate;
            if (dto.Gender != null) updateData["gender"] = dto.Gender;
            if (dto.CurrentWeight.HasValue) updateData["current_weight"] = dto.CurrentWeight.Value;
            if (dto.Height.HasValue) updateData["height"] = dto.Height.Value;
            if (dto.GoalWeight.HasValue) updateData["goal_weight"] = dto.GoalWeight.Value;
            if (dto.ActivityLevel != null) updateData["activity_level"] = dto.ActivityLevel;
            if (dto.DietaryPreferences != null) updateData["dietary_preferences"] = dto.DietaryPreferences;

            var json = JsonSerializer.Serialize(updateData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await client.PatchAsync($"user_profiles?user_id=eq.{userId}", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var profiles = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = profiles?.FirstOrDefault()
                ?? throw new InvalidOperationException("Profile not found");

            return MapToUserProfile(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserProfile?> GetProfileAsync(Guid userId)
    {
        try
        {
            var client = CreateSupabaseClient();

            var response = await client.GetAsync($"user_profiles?user_id=eq.{userId}&select=*");
            
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var profiles = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = profiles?.FirstOrDefault();
            return result != null ? MapToUserProfile(result) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting profile for user {UserId}", userId);
            return null;
        }
    }

    private UserProfile MapToUserProfile(Dictionary<string, JsonElement> data)
    {
        return new UserProfile
        {
            Id = Guid.Parse(data["id"].GetString()!),
            UserId = Guid.Parse(data["user_id"].GetString()!),
            FullName = data["full_name"].GetString()!,
            Birthdate = DateTime.Parse(data["birthdate"].GetString()!),
            Gender = data["gender"].GetString()!,
            CurrentWeight = data["current_weight"].GetDecimal(),
            Height = data["height"].GetDecimal(),
            GoalWeight = data.ContainsKey("goal_weight") && data["goal_weight"].ValueKind != JsonValueKind.Null
                ? data["goal_weight"].GetDecimal()
                : null,
            ActivityLevel = data["activity_level"].GetString()!,
            DietaryPreferences = data.ContainsKey("dietary_preferences") && data["dietary_preferences"].ValueKind != JsonValueKind.Null
                ? JsonSerializer.Deserialize<string[]>(data["dietary_preferences"].GetRawText())
                : null,
            CreatedAt = DateTime.Parse(data["created_at"].GetString()!),
            UpdatedAt = DateTime.Parse(data["updated_at"].GetString()!)
        };
    }
}
