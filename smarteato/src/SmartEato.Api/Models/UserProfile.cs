namespace SmartEato.Api.Models;

public class UserProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public DateTime Birthdate { get; set; }
    public string Gender { get; set; } = string.Empty;
    public decimal CurrentWeight { get; set; }
    public decimal Height { get; set; }
    public decimal? GoalWeight { get; set; }
    public string ActivityLevel { get; set; } = string.Empty;
    public string[]? DietaryPreferences { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

