using SmartEato.Api.Models.DTOs;

namespace SmartEato.Api.Services;

public interface IMealWorkflowService
{
    /// <summary>
    /// Complete meal logging workflow:
    /// 1. Parse input
    /// 2. Analyze image (if provided)
    /// 3. Calculate nutrition
    /// 4. Save meal
    /// 5. Update daily summary
    /// 6. Generate recommendation
    /// </summary>
    Task<MealAnalysisResult> LogMealAsync(Guid userId, LogMealDto dto);

    /// <summary>
    /// Get daily summary with recommendation
    /// </summary>
    Task<object> GetDailySummaryWithRecommendationAsync(Guid userId, DateOnly date);
}

