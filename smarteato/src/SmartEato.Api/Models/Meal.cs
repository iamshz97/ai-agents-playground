using System.Text.Json.Serialization;

namespace SmartEato.Api.Models;

public class Meal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string MealName { get; set; } = string.Empty;
    public DateTime MealTime { get; set; }
    public string? PhotoUrl { get; set; }
    public decimal TotalCalories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fats { get; set; }
    public List<Ingredient>? Ingredients { get; set; }
    public AiAnalysis? AiAnalysis { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Ingredient
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

public class AiAnalysis
{
    [JsonPropertyName("vision_output")]
    public string? VisionOutput { get; set; }
    
    [JsonPropertyName("confidence")]
    public decimal? Confidence { get; set; }
    
    [JsonPropertyName("identified_items")]
    public List<string>? IdentifiedItems { get; set; }
}

