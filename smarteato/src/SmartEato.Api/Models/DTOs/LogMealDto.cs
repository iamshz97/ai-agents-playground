using System.ComponentModel.DataAnnotations;

namespace SmartEato.Api.Models.DTOs;

public class LogMealDto
{
    [StringLength(200)]
    public string? MealName { get; set; }

    public DateTime? MealTime { get; set; }

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    public string? ImageBase64 { get; set; }
}

