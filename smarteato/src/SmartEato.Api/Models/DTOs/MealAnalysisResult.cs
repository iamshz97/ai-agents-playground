namespace SmartEato.Api.Models.DTOs;

public class MealAnalysisResult
{
    public Guid MealId { get; set; }
    public string MealName { get; set; } = string.Empty;
    public decimal TotalCalories { get; set; }
    public decimal Protein { get; set; }
    public decimal Carbs { get; set; }
    public decimal Fats { get; set; }
    public List<Ingredient>? Ingredients { get; set; }
    public string? VisionAnalysis { get; set; }
    public DateTime Timestamp { get; set; }
}

