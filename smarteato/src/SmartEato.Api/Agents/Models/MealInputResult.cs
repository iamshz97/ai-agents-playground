using System.Text.Json.Serialization;

namespace SmartEato.Api.Agents.Models;

/// <summary>
/// Structured output from Input Processing Agent
/// </summary>
public class MealInputResult
{
    [JsonPropertyName("meal_name")]
    public string MealName { get; set; } = string.Empty;

    [JsonPropertyName("meal_time")]
    public string MealTime { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("has_image")]
    public bool HasImage { get; set; }
}

