using SmartEato.Api.Models;
using System.Text.Json;

namespace SmartEato.Api.Services;

public class MealService : IMealService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MealService> _logger;

    public MealService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<MealService> logger)
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

    public async Task<Meal> CreateMealAsync(Meal meal)
    {
        try
        {
            var client = CreateSupabaseClient();

            // Don't serialize JSONB fields - let them be serialized as objects by JsonSerializer
            var mealData = new
            {
                user_id = meal.UserId,
                meal_name = meal.MealName,
                meal_time = meal.MealTime,
                photo_url = meal.PhotoUrl,
                total_calories = meal.TotalCalories,
                protein = meal.Protein,
                carbs = meal.Carbs,
                fats = meal.Fats,
                ingredients = meal.Ingredients, // Will be serialized as JSON array
                ai_analysis = meal.AiAnalysis    // Will be serialized as JSON object
            };

            var json = JsonSerializer.Serialize(mealData);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await client.PostAsync("meals", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var meals = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = meals?.FirstOrDefault() ?? throw new InvalidOperationException("Failed to create meal");
            return MapToMeal(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating meal");
            throw;
        }
    }

    public async Task<List<Meal>> GetTodaysMealsAsync(Guid userId, DateOnly date)
    {
        try
        {
            var client = CreateSupabaseClient();
            var startOfDay = date.ToDateTime(TimeOnly.MinValue);
            var endOfDay = date.ToDateTime(TimeOnly.MaxValue);

            var response = await client.GetAsync(
                $"meals?user_id=eq.{userId}&meal_time=gte.{startOfDay:O}&meal_time=lte.{endOfDay:O}&select=*&order=meal_time.desc");

            if (!response.IsSuccessStatusCode)
            {
                return new List<Meal>();
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var meals = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            return meals?.Select(MapToMeal).ToList() ?? new List<Meal>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting today's meals");
            return new List<Meal>();
        }
    }

    public async Task<DailySummary?> GetDailySummaryAsync(Guid userId, DateOnly date)
    {
        try
        {
            var client = CreateSupabaseClient();
            var response = await client.GetAsync($"daily_summaries?user_id=eq.{userId}&date=eq.{date:yyyy-MM-dd}&select=*");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var summaries = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = summaries?.FirstOrDefault();
            return result != null ? MapToDailySummary(result) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting daily summary");
            return null;
        }
    }

    public async Task<DailySummary> UpdateDailySummaryAsync(Guid userId, DateOnly date)
    {
        try
        {
            // Get all meals for the day
            var meals = await GetTodaysMealsAsync(userId, date);

            // Calculate totals
            var totalCalories = meals.Sum(m => m.TotalCalories);
            var totalProtein = meals.Sum(m => m.Protein);
            var totalCarbs = meals.Sum(m => m.Carbs);
            var totalFats = meals.Sum(m => m.Fats);

            // Get user profile for calorie goal
            var profileService = new UserProfileService(_httpClientFactory, _configuration, new Logger<UserProfileService>(new LoggerFactory()));
            var profile = await profileService.GetProfileAsync(userId);
            var calorieGoal = CalculateCalorieGoal(profile);

            var client = CreateSupabaseClient();
            var existing = await GetDailySummaryAsync(userId, date);

            if (existing != null)
            {
                // Update existing
                var updateData = new
                {
                    total_calories = totalCalories,
                    total_protein = totalProtein,
                    total_carbs = totalCarbs,
                    total_fats = totalFats,
                    meals_count = meals.Count,
                    updated_at = DateTime.UtcNow
                };

                var json = JsonSerializer.Serialize(updateData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await client.PatchAsync($"daily_summaries?user_id=eq.{userId}&date=eq.{date:yyyy-MM-dd}", content);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var summaries = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);
                var result = summaries?.FirstOrDefault() ?? throw new InvalidOperationException("Failed to update daily summary");

                return MapToDailySummary(result);
            }
            else
            {
                // Create new
                var summaryData = new
                {
                    user_id = userId,
                    date = date.ToString("yyyy-MM-dd"),
                    total_calories = totalCalories,
                    total_protein = totalProtein,
                    total_carbs = totalCarbs,
                    total_fats = totalFats,
                    calorie_goal = calorieGoal,
                    meals_count = meals.Count
                };

                var json = JsonSerializer.Serialize(summaryData);
                var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                var response = await client.PostAsync("daily_summaries", content);
                response.EnsureSuccessStatusCode();

                var responseBody = await response.Content.ReadAsStringAsync();
                var summaries = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);
                var result = summaries?.FirstOrDefault() ?? throw new InvalidOperationException("Failed to create daily summary");

                return MapToDailySummary(result);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating daily summary");
            throw;
        }
    }

    public async Task<Recommendation> CreateRecommendationAsync(Recommendation recommendation)
    {
        try
        {
            var client = CreateSupabaseClient();

            var recData = new
            {
                user_id = recommendation.UserId,
                date = recommendation.Date.ToString("yyyy-MM-dd"),
                recommendation_text = recommendation.RecommendationText,
                reason = recommendation.Reason,
                priority = recommendation.Priority
            };

            var json = JsonSerializer.Serialize(recData);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await client.PostAsync("recommendations", content);
            response.EnsureSuccessStatusCode();

            var responseBody = await response.Content.ReadAsStringAsync();
            var recs = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = recs?.FirstOrDefault() ?? throw new InvalidOperationException("Failed to create recommendation");
            return MapToRecommendation(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating recommendation");
            throw;
        }
    }

    public async Task<Recommendation?> GetTodaysRecommendationAsync(Guid userId, DateOnly date)
    {
        try
        {
            var client = CreateSupabaseClient();
            var response = await client.GetAsync(
                $"recommendations?user_id=eq.{userId}&date=eq.{date:yyyy-MM-dd}&select=*&order=created_at.desc&limit=1");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var recs = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(responseBody);

            var result = recs?.FirstOrDefault();
            return result != null ? MapToRecommendation(result) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting recommendation");
            return null;
        }
    }

    public async Task SaveChatMessageAsync(ChatThread chatMessage)
    {
        try
        {
            var client = CreateSupabaseClient();

            var messageData = new
            {
                user_id = chatMessage.UserId,
                message = chatMessage.Message,
                role = chatMessage.Role,
                meal_id = chatMessage.MealId
            };

            var json = JsonSerializer.Serialize(messageData);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await client.PostAsync("chat_threads", content);
            response.EnsureSuccessStatusCode();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving chat message");
            // Don't throw - chat history is not critical
        }
    }

    private decimal CalculateCalorieGoal(UserProfile? profile)
    {
        if (profile == null) return 2000; // Default

        // Simple BMR calculation (Mifflin-St Jeor)
        var weight = (double)profile.CurrentWeight;
        var height = (double)profile.Height;
        var age = DateTime.Today.Year - profile.Birthdate.Year;

        double bmr = profile.Gender.ToLower() switch
        {
            "male" => (10 * weight) + (6.25 * height) - (5 * age) + 5,
            "female" => (10 * weight) + (6.25 * height) - (5 * age) - 161,
            _ => (10 * weight) + (6.25 * height) - (5 * age) - 78 // Average
        };

        var multiplier = profile.ActivityLevel switch
        {
            "Sedentary" => 1.2,
            "Lightly Active" => 1.375,
            "Active" => 1.55,
            "Very Active" => 1.725,
            _ => 1.2
        };

        return (decimal)(bmr * multiplier);
    }

    private Meal MapToMeal(Dictionary<string, JsonElement> data)
    {
        return new Meal
        {
            Id = Guid.Parse(data["id"].GetString()!),
            UserId = Guid.Parse(data["user_id"].GetString()!),
            MealName = data["meal_name"].GetString()!,
            MealTime = DateTime.Parse(data["meal_time"].GetString()!),
            PhotoUrl = data.ContainsKey("photo_url") && data["photo_url"].ValueKind != JsonValueKind.Null
                ? data["photo_url"].GetString()
                : null,
            TotalCalories = data["total_calories"].GetDecimal(),
            Protein = data["protein"].GetDecimal(),
            Carbs = data["carbs"].GetDecimal(),
            Fats = data["fats"].GetDecimal(),
            Ingredients = data.ContainsKey("ingredients") && data["ingredients"].ValueKind != JsonValueKind.Null
                ? ParseIngredients(data["ingredients"])
                : null,
            AiAnalysis = data.ContainsKey("ai_analysis") && data["ai_analysis"].ValueKind != JsonValueKind.Null
                ? ParseAiAnalysis(data["ai_analysis"])
                : null,
            CreatedAt = DateTime.Parse(data["created_at"].GetString()!)
        };
    }

    private List<Ingredient>? ParseIngredients(JsonElement element)
    {
        try
        {
            // If it's a string (double-serialized), parse the string first
            if (element.ValueKind == JsonValueKind.String)
            {
                var jsonString = element.GetString();
                return string.IsNullOrEmpty(jsonString) 
                    ? null 
                    : JsonSerializer.Deserialize<List<Ingredient>>(jsonString);
            }
            
            // If it's already an array, deserialize directly
            if (element.ValueKind == JsonValueKind.Array)
            {
                return JsonSerializer.Deserialize<List<Ingredient>>(element.GetRawText());
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse ingredients");
            return null;
        }
    }

    private AiAnalysis? ParseAiAnalysis(JsonElement element)
    {
        try
        {
            // If it's a string (double-serialized), parse the string first
            if (element.ValueKind == JsonValueKind.String)
            {
                var jsonString = element.GetString();
                return string.IsNullOrEmpty(jsonString)
                    ? null
                    : JsonSerializer.Deserialize<AiAnalysis>(jsonString);
            }

            // If it's already an object, deserialize directly
            if (element.ValueKind == JsonValueKind.Object)
            {
                return JsonSerializer.Deserialize<AiAnalysis>(element.GetRawText());
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse AI analysis");
            return null;
        }
    }

    private DailySummary MapToDailySummary(Dictionary<string, JsonElement> data)
    {
        return new DailySummary
        {
            Id = Guid.Parse(data["id"].GetString()!),
            UserId = Guid.Parse(data["user_id"].GetString()!),
            Date = DateOnly.Parse(data["date"].GetString()!),
            TotalCalories = data["total_calories"].GetDecimal(),
            TotalProtein = data["total_protein"].GetDecimal(),
            TotalCarbs = data["total_carbs"].GetDecimal(),
            TotalFats = data["total_fats"].GetDecimal(),
            CalorieGoal = data["calorie_goal"].GetDecimal(),
            MealsCount = data["meals_count"].GetInt32(),
            UpdatedAt = DateTime.Parse(data["updated_at"].GetString()!)
        };
    }

    private Recommendation MapToRecommendation(Dictionary<string, JsonElement> data)
    {
        return new Recommendation
        {
            Id = Guid.Parse(data["id"].GetString()!),
            UserId = Guid.Parse(data["user_id"].GetString()!),
            Date = DateOnly.Parse(data["date"].GetString()!),
            RecommendationText = data["recommendation_text"].GetString()!,
            Reason = data["reason"].GetString()!,
            Priority = data["priority"].GetInt32(),
            CreatedAt = DateTime.Parse(data["created_at"].GetString()!)
        };
    }
}

