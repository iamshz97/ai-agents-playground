namespace SmartEato.Api.Models;

public class ChatThread
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    public Guid? MealId { get; set; }
    public DateTime CreatedAt { get; set; }
}

