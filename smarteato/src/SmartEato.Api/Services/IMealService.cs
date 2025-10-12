using SmartEato.Api.Models;
using SmartEato.Api.Models.DTOs;

namespace SmartEato.Api.Services;

public interface IMealService
{
    Task<Meal> CreateMealAsync(Meal meal);
    Task<bool> DeleteMealAsync(Guid userId, Guid mealId);
    Task<List<Meal>> GetTodaysMealsAsync(Guid userId, DateOnly date);
    Task<DailySummary?> GetDailySummaryAsync(Guid userId, DateOnly date);
    Task<DailySummary> UpdateDailySummaryAsync(Guid userId, DateOnly date);
    Task<Recommendation> CreateRecommendationAsync(Recommendation recommendation);
    Task<Recommendation?> GetTodaysRecommendationAsync(Guid userId, DateOnly date);
    Task SaveChatMessageAsync(ChatThread chatMessage);
}

