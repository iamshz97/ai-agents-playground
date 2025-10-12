using Azure.AI.OpenAI;
using Azure.Identity;
using OpenAI.Chat;
using SmartEato.Api.Agents.Models;
using SmartEato.Api.Models;
using System.ClientModel;
using System.Text.Json;

namespace SmartEato.Api.Services;

public class MealAnalysisService : IMealAnalysisService
{
    private readonly ChatClient _chatClient;
    private readonly ILogger<MealAnalysisService> _logger;

    public MealAnalysisService(IConfiguration configuration, ILogger<MealAnalysisService> logger)
    {
        var endpoint = configuration["AzureOpenAI:Endpoint"] 
            ?? throw new InvalidOperationException("Azure OpenAI Endpoint not configured");
        var apiKey = configuration["AzureOpenAI:ApiKey"]
            ?? throw new InvalidOperationException("Azure OpenAI ApiKey not configured");
        var deployment = configuration["AzureOpenAI:Deployment"]
            ?? throw new InvalidOperationException("Azure OpenAI Deployment not configured");

        var azureClient = new AzureOpenAIClient(new Uri(endpoint), new ApiKeyCredential(apiKey));
        _chatClient = azureClient.GetChatClient(deployment);
        _logger = logger;
    }

    public async Task<MealInputResult> ParseMealInputAsync(string userInput)
    {
        try
        {
            var messages = new List<OpenAI.Chat.ChatMessage>
            {
                new SystemChatMessage(@"You are a meal parsing assistant. Extract meal information from user input.
Return JSON with:
- meal_name: the name of the meal
- meal_time: ISO 8601 datetime string (use current time if not specified)
- description: detailed description of what the user ate
- has_image: false (will be set separately)"),
                new UserChatMessage(userInput)
            };

            var options = new ChatCompletionOptions
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "meal_input",
                    jsonSchema: BinaryData.FromString(GenerateJsonSchema(typeof(MealInputResult)))
                )
            };

            var response = await _chatClient.CompleteChatAsync(messages, options);
            var result = JsonSerializer.Deserialize<MealInputResult>(response.Value.Content[0].Text);
            return result ?? throw new InvalidOperationException("Failed to parse meal input");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing meal input");
            throw;
        }
    }

    public async Task<VisionMealResult> AnalyzeMealImageAsync(string imageBase64)
    {
        try
        {
            var imageBytes = Convert.FromBase64String(imageBase64);
            
            var messages = new List<OpenAI.Chat.ChatMessage>
            {
                new SystemChatMessage(@"You are a food vision analysis expert. Analyze the food image and return detailed information about what you see.
Return JSON with:
- meal_name: the main meal name
- identified_items: array of food items you can see
- estimated_portions: description of portion sizes
- confidence: your confidence level (0-1)
- description: detailed description of the meal"),
                new UserChatMessage(
                    ChatMessageContentPart.CreateTextPart("Analyze this food image and tell me what meal this is"),
                    ChatMessageContentPart.CreateImagePart(BinaryData.FromBytes(imageBytes), "image/jpeg")
                )
            };

            var options = new ChatCompletionOptions
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "vision_meal",
                    jsonSchema: BinaryData.FromString(GenerateJsonSchema(typeof(VisionMealResult)))
                )
            };

            var response = await _chatClient.CompleteChatAsync(messages, options);
            var result = JsonSerializer.Deserialize<VisionMealResult>(response.Value.Content[0].Text);
            return result ?? throw new InvalidOperationException("Failed to analyze meal image");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing meal image");
            throw;
        }
    }

    public async Task<NutrientBreakdown> AnalyzeNutritionAsync(string mealDescription, VisionMealResult? visionResult = null)
    {
        try
        {
            var contextInfo = visionResult != null
                ? $"\n\nAdditional context from image analysis:\nMeal: {visionResult.MealName}\nItems identified: {string.Join(", ", visionResult.IdentifiedItems)}\nPortions: {visionResult.EstimatedPortions}"
                : "";

            var messages = new List<OpenAI.Chat.ChatMessage>
            {
                new SystemChatMessage(@"You are a nutrition expert. Analyze the meal and provide detailed nutritional breakdown.
Return JSON with:
- meal_name: the meal name
- total_calories: total calories for the meal
- protein: total protein in grams
- carbs: total carbohydrates in grams
- fats: total fats in grams
- ingredients: array of ingredients with individual nutrition (name, calories, protein, carbs, fats)

Be as accurate as possible based on standard serving sizes."),
                new UserChatMessage($"{mealDescription}{contextInfo}")
            };

            var options = new ChatCompletionOptions
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "nutrient_breakdown",
                    jsonSchema: BinaryData.FromString(GenerateJsonSchema(typeof(NutrientBreakdown)))
                )
            };

            var response = await _chatClient.CompleteChatAsync(messages, options);
            var result = JsonSerializer.Deserialize<NutrientBreakdown>(response.Value.Content[0].Text);
            return result ?? throw new InvalidOperationException("Failed to analyze nutrition");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing nutrition");
            throw;
        }
    }

    public async Task<RecommendationResult> GenerateRecommendationAsync(
        Guid userId,
        DailySummary dailySummary,
        UserProfile userProfile)
    {
        try
        {
            var calorieRemaining = dailySummary.CalorieGoal - dailySummary.TotalCalories;
            var proteinPercentage = dailySummary.CalorieGoal > 0 ? (dailySummary.TotalProtein * 4 / dailySummary.CalorieGoal) * 100 : 0;
            var carbsPercentage = dailySummary.CalorieGoal > 0 ? (dailySummary.TotalCarbs * 4 / dailySummary.CalorieGoal) * 100 : 0;
            var fatsPercentage = dailySummary.CalorieGoal > 0 ? (dailySummary.TotalFats * 9 / dailySummary.CalorieGoal) * 100 : 0;

            var context = $@"User Profile:
- Activity Level: {userProfile.ActivityLevel}
- Current Weight: {userProfile.CurrentWeight} kg
- Goal Weight: {userProfile.GoalWeight ?? userProfile.CurrentWeight} kg
- Dietary Preferences: {string.Join(", ", userProfile.DietaryPreferences ?? Array.Empty<string>())}

Today's Intake:
- Calories: {dailySummary.TotalCalories} / {dailySummary.CalorieGoal} (Remaining: {calorieRemaining})
- Protein: {dailySummary.TotalProtein}g ({proteinPercentage:F1}% of calories)
- Carbs: {dailySummary.TotalCarbs}g ({carbsPercentage:F1}% of calories)
- Fats: {dailySummary.TotalFats}g ({fatsPercentage:F1}% of calories)
- Meals eaten: {dailySummary.MealsCount}

Generate a smart, actionable recommendation for what the user should eat next or how to adjust their intake.";

            var messages = new List<OpenAI.Chat.ChatMessage>
            {
                new SystemChatMessage(@"You are a nutrition coach providing personalized recommendations.
Return JSON with:
- recommendation: a friendly, actionable suggestion (1-2 sentences)
- reason: brief explanation why (1 sentence)
- priority: 1-5 (1=low, 5=critical)
- suggested_foods: array of 2-3 specific food suggestions

Be encouraging and specific!"),
                new UserChatMessage(context)
            };

            var options = new ChatCompletionOptions
            {
                ResponseFormat = ChatResponseFormat.CreateJsonSchemaFormat(
                    jsonSchemaFormatName: "recommendation",
                    jsonSchema: BinaryData.FromString(GenerateJsonSchema(typeof(RecommendationResult)))
                )
            };

            var response = await _chatClient.CompleteChatAsync(messages, options);
            var result = JsonSerializer.Deserialize<RecommendationResult>(response.Value.Content[0].Text);
            return result ?? throw new InvalidOperationException("Failed to generate recommendation");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendation");
            throw;
        }
    }

    private string GenerateJsonSchema(Type type)
    {
        // Simple JSON schema generation for the types we're using
        var schemas = new Dictionary<Type, string>
        {
            [typeof(MealInputResult)] = @"{
                ""type"": ""object"",
                ""properties"": {
                    ""meal_name"": { ""type"": ""string"" },
                    ""meal_time"": { ""type"": ""string"" },
                    ""description"": { ""type"": ""string"" },
                    ""has_image"": { ""type"": ""boolean"" }
                },
                ""required"": [""meal_name"", ""meal_time"", ""description"", ""has_image""],
                ""additionalProperties"": false
            }",
            [typeof(VisionMealResult)] = @"{
                ""type"": ""object"",
                ""properties"": {
                    ""meal_name"": { ""type"": ""string"" },
                    ""identified_items"": { ""type"": ""array"", ""items"": { ""type"": ""string"" } },
                    ""estimated_portions"": { ""type"": ""string"" },
                    ""confidence"": { ""type"": ""number"" },
                    ""description"": { ""type"": ""string"" }
                },
                ""required"": [""meal_name"", ""identified_items"", ""estimated_portions"", ""confidence"", ""description""],
                ""additionalProperties"": false
            }",
            [typeof(NutrientBreakdown)] = @"{
                ""type"": ""object"",
                ""properties"": {
                    ""meal_name"": { ""type"": ""string"" },
                    ""total_calories"": { ""type"": ""number"" },
                    ""protein"": { ""type"": ""number"" },
                    ""carbs"": { ""type"": ""number"" },
                    ""fats"": { ""type"": ""number"" },
                    ""ingredients"": {
                        ""type"": ""array"",
                        ""items"": {
                            ""type"": ""object"",
                            ""properties"": {
                                ""name"": { ""type"": ""string"" },
                                ""calories"": { ""type"": ""number"" },
                                ""protein"": { ""type"": ""number"" },
                                ""carbs"": { ""type"": ""number"" },
                                ""fats"": { ""type"": ""number"" }
                            },
                            ""required"": [""name"", ""calories"", ""protein"", ""carbs"", ""fats""],
                            ""additionalProperties"": false
                        }
                    }
                },
                ""required"": [""meal_name"", ""total_calories"", ""protein"", ""carbs"", ""fats"", ""ingredients""],
                ""additionalProperties"": false
            }",
            [typeof(RecommendationResult)] = @"{
                ""type"": ""object"",
                ""properties"": {
                    ""recommendation"": { ""type"": ""string"" },
                    ""reason"": { ""type"": ""string"" },
                    ""priority"": { ""type"": ""integer"" },
                    ""suggested_foods"": { ""type"": ""array"", ""items"": { ""type"": ""string"" } }
                },
                ""required"": [""recommendation"", ""reason"", ""priority"", ""suggested_foods""],
                ""additionalProperties"": false
            }"
        };

        return schemas.GetValueOrDefault(type, "{}");
    }
}
