using System.Text.Json.Serialization;

namespace SmartEato.Api.Agents.Models;

/// <summary>
/// Structured output from Vision Analysis Agent
/// </summary>
public class VisionMealResult
{
    [JsonPropertyName("meal_name")]
    public string MealName { get; set; } = string.Empty;

    [JsonPropertyName("identified_items")]
    public List<string> IdentifiedItems { get; set; } = new();

    [JsonPropertyName("estimated_portions")]
    public string EstimatedPortions { get; set; } = string.Empty;

    [JsonPropertyName("confidence")]
    public decimal Confidence { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
}

