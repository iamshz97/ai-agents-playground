using System.ComponentModel.DataAnnotations;

namespace SmartEato.Api.Models.DTOs;

public class CreateProfileDto
{
    [Required]
    [StringLength(100, MinimumLength = 1)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string Birthdate { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Gender { get; set; } = string.Empty;

    [Required]
    [Range(0.1, 500)]
    public decimal CurrentWeight { get; set; }

    [Required]
    [Range(0.1, 300)]
    public decimal Height { get; set; }

    [Range(0.1, 500)]
    public decimal? GoalWeight { get; set; }

    [Required]
    [StringLength(50)]
    public string ActivityLevel { get; set; } = string.Empty;

    public string[]? DietaryPreferences { get; set; }
}

