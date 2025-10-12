namespace SmartEato.Api.Models;

public class DailySummary
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateOnly Date { get; set; }
    public decimal TotalCalories { get; set; }
    public decimal TotalProtein { get; set; }
    public decimal TotalCarbs { get; set; }
    public decimal TotalFats { get; set; }
    public decimal CalorieGoal { get; set; }
    public int MealsCount { get; set; }
    public DateTime UpdatedAt { get; set; }
}

