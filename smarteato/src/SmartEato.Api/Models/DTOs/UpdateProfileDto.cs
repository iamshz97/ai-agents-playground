using System.ComponentModel.DataAnnotations;

namespace SmartEato.Api.Models.DTOs;

public class UpdateProfileDto
{
    [StringLength(100, MinimumLength = 1)]
    public string? FullName { get; set; }

    public string? Birthdate { get; set; }

    [StringLength(50)]
    public string? Gender { get; set; }

    [Range(0.1, 500)]
    public decimal? CurrentWeight { get; set; }

    [Range(0.1, 300)]
    public decimal? Height { get; set; }

    [Range(0.1, 500)]
    public decimal? GoalWeight { get; set; }

    [StringLength(50)]
    public string? ActivityLevel { get; set; }

    public string[]? DietaryPreferences { get; set; }
}

