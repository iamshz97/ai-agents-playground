using SmartEato.Api.Agents.Models;
using SmartEato.Api.Models;

namespace SmartEato.Api.Services;

public interface IMealAnalysisService
{
    /// <summary>
    /// Parse meal input and extract structured information
    /// </summary>
    Task<MealInputResult> ParseMealInputAsync(string userInput);

    /// <summary>
    /// Analyze food image and identify meal components
    /// </summary>
    Task<VisionMealResult> AnalyzeMealImageAsync(string imageBase64);

    /// <summary>
    /// Calculate detailed nutrition breakdown for a meal
    /// </summary>
    Task<NutrientBreakdown> AnalyzeNutritionAsync(string mealDescription, VisionMealResult? visionResult = null);

    /// <summary>
    /// Generate personalized recommendation based on daily intake
    /// </summary>
    Task<RecommendationResult> GenerateRecommendationAsync(Guid userId, DailySummary dailySummary, UserProfile userProfile);
}

