using System.Text.Json.Serialization;

namespace SmartEato.Api.Agents.Models;

/// <summary>
/// Structured output from Recommendation Agent
/// </summary>
public class RecommendationResult
{
    [JsonPropertyName("recommendation")]
    public string RecommendationText { get; set; } = string.Empty;

    [JsonPropertyName("reason")]
    public string Reason { get; set; } = string.Empty;

    [JsonPropertyName("priority")]
    public int Priority { get; set; }

    [JsonPropertyName("suggested_foods")]
    public List<string> SuggestedFoods { get; set; } = new();
}

