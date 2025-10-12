using System.Text.Json.Serialization;
using SmartEato.Api.Models;

namespace SmartEato.Api.Agents.Models;

/// <summary>
/// Structured output from Nutrient Analysis Agent
/// </summary>
public class NutrientBreakdown
{
    [JsonPropertyName("meal_name")]
    public string MealName { get; set; } = string.Empty;

    [JsonPropertyName("total_calories")]
    public decimal TotalCalories { get; set; }

    [JsonPropertyName("protein")]
    public decimal Protein { get; set; }

    [JsonPropertyName("carbs")]
    public decimal Carbs { get; set; }

    [JsonPropertyName("fats")]
    public decimal Fats { get; set; }

    [JsonPropertyName("ingredients")]
    public List<IngredientDetail> Ingredients { get; set; } = new();
}

public class IngredientDetail
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("calories")]
    public decimal Calories { get; set; }

    [JsonPropertyName("protein")]
    public decimal Protein { get; set; }

    [JsonPropertyName("carbs")]
    public decimal Carbs { get; set; }

    [JsonPropertyName("fats")]
    public decimal Fats { get; set; }
}

