using SmartEato.Api.Models;
using SmartEato.Api.Models.DTOs;

namespace SmartEato.Api.Services;

public interface IUserProfileService
{
    Task<UserProfile> CreateProfileAsync(Guid userId, CreateProfileDto dto);
    Task<UserProfile> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<UserProfile?> GetProfileAsync(Guid userId);
}

