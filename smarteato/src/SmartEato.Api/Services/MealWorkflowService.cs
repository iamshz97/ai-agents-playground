using SmartEato.Api.Agents.Models;
using SmartEato.Api.Models;
using SmartEato.Api.Models.DTOs;

namespace SmartEato.Api.Services;

public class MealWorkflowService : IMealWorkflowService
{
    private readonly IMealAnalysisService _analysisService;
    private readonly IMealService _mealService;
    private readonly IUserProfileService _profileService;
    private readonly ILogger<MealWorkflowService> _logger;

    public MealWorkflowService(
        IMealAnalysisService analysisService,
        IMealService mealService,
        IUserProfileService profileService,
        ILogger<MealWorkflowService> logger)
    {
        _analysisService = analysisService;
        _mealService = mealService;
        _profileService = profileService;
        _logger = logger;
    }

    public async Task<MealAnalysisResult> LogMealAsync(Guid userId, LogMealDto dto)
    {
        _logger.LogInformation("Starting meal logging workflow for user {UserId}", userId);

        try
        {
            // Step 1: Parse input to extract meal information
            var parsedInput = await _analysisService.ParseMealInputAsync(dto.Description);
            _logger.LogInformation("Parsed meal input: {MealName}", parsedInput.MealName);

            // Step 2: Analyze image if provided (Branching Logic)
            VisionMealResult? visionResult = null;
            if (!string.IsNullOrEmpty(dto.ImageBase64))
            {
                _logger.LogInformation("Image provided, running vision analysis");
                visionResult = await _analysisService.AnalyzeMealImageAsync(dto.ImageBase64);
                _logger.LogInformation("Vision analysis complete: {MealName} (Confidence: {Confidence})", 
                    visionResult.MealName, visionResult.Confidence);
            }

            // Step 3: Analyze nutrition (with vision context if available)
            var mealDescription = visionResult != null
                ? $"{parsedInput.Description}\n\nIdentified from image: {visionResult.Description}"
                : parsedInput.Description;

            var nutrientBreakdown = await _analysisService.AnalyzeNutritionAsync(mealDescription, visionResult);
            _logger.LogInformation("Nutrition analysis complete: {Calories} cal", nutrientBreakdown.TotalCalories);

            // Step 4: Save meal to database
            var meal = new Meal
            {
                UserId = userId,
                MealName = dto.MealName ?? nutrientBreakdown.MealName,
                MealTime = dto.MealTime ?? DateTime.UtcNow,
                PhotoUrl = null, // TODO: Upload image to storage
                TotalCalories = nutrientBreakdown.TotalCalories,
                Protein = nutrientBreakdown.Protein,
                Carbs = nutrientBreakdown.Carbs,
                Fats = nutrientBreakdown.Fats,
                Ingredients = nutrientBreakdown.Ingredients?.Select(i => new Ingredient
                {
                    Name = i.Name,
                    Calories = i.Calories,
                    Protein = i.Protein,
                    Carbs = i.Carbs,
                    Fats = i.Fats
                }).ToList(),
                AiAnalysis = visionResult != null ? new AiAnalysis
                {
                    VisionOutput = visionResult.Description,
                    Confidence = visionResult.Confidence,
                    IdentifiedItems = visionResult.IdentifiedItems
                } : null
            };

            var savedMeal = await _mealService.CreateMealAsync(meal);
            _logger.LogInformation("Meal saved with ID: {MealId}", savedMeal.Id);

            // Step 5: Update daily summary
            var today = DateOnly.FromDateTime(DateTime.Today);
            var dailySummary = await _mealService.UpdateDailySummaryAsync(userId, today);
            _logger.LogInformation("Daily summary updated: {TotalCalories} / {Goal} cal", 
                dailySummary.TotalCalories, dailySummary.CalorieGoal);

            // Step 6: Generate recommendation (Concurrent - fire and forget for now)
            _ = Task.Run(async () =>
            {
                try
                {
                    var profile = await _profileService.GetProfileAsync(userId);
                    if (profile != null)
                    {
                        var recResult = await _analysisService.GenerateRecommendationAsync(userId, dailySummary, profile);
                        await _mealService.CreateRecommendationAsync(new Recommendation
                        {
                            UserId = userId,
                            Date = today,
                            RecommendationText = recResult.RecommendationText,
                            Reason = recResult.Reason,
                            Priority = recResult.Priority
                        });
                        _logger.LogInformation("Recommendation generated");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error generating recommendation (non-critical)");
                }
            });

            // Save chat history
            await _mealService.SaveChatMessageAsync(new ChatThread
            {
                UserId = userId,
                Message = dto.Description,
                Role = "user",
                MealId = savedMeal.Id
            });

            await _mealService.SaveChatMessageAsync(new ChatThread
            {
                UserId = userId,
                Message = $"Logged {nutrientBreakdown.MealName}: {nutrientBreakdown.TotalCalories} calories",
                Role = "assistant",
                MealId = savedMeal.Id
            });

            // Return result
            return new MealAnalysisResult
            {
                MealId = savedMeal.Id,
                MealName = nutrientBreakdown.MealName,
                TotalCalories = nutrientBreakdown.TotalCalories,
                Protein = nutrientBreakdown.Protein,
                Carbs = nutrientBreakdown.Carbs,
                Fats = nutrientBreakdown.Fats,
                Ingredients = savedMeal.Ingredients,
                VisionAnalysis = visionResult?.Description,
                Timestamp = savedMeal.MealTime
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in meal logging workflow");
            throw;
        }
    }

    public async Task<object> GetDailySummaryWithRecommendationAsync(Guid userId, DateOnly date)
    {
        var summary = await _mealService.GetDailySummaryAsync(userId, date);
        var recommendation = await _mealService.GetTodaysRecommendationAsync(userId, date);
        var meals = await _mealService.GetTodaysMealsAsync(userId, date);

        return new
        {
            summary = summary ?? new DailySummary
            {
                UserId = userId,
                Date = date,
                TotalCalories = 0,
                TotalProtein = 0,
                TotalCarbs = 0,
                TotalFats = 0,
                CalorieGoal = 2000,
                MealsCount = 0
            },
            recommendation,
            meals
        };
    }
}

