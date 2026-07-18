package com.spur.dto;

import com.spur.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for Status creation requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateStatusRequest {
    
    private Status.StatusType type; // FREE_NOW, FREE_TONIGHT, ALREADY_HERE
    private Status.EnergyLevel energyLevel; // LOW, HIGH
    private Integer durationMinutes; // 60, 180, 720
    private String location;
    private String emoji;
    private String contextText;
}

/**
 * DTO for Status response
 */
@Data
class StatusResponse {
    private UUID id;
    private UUID userId;
    private Status.StatusType type;
    private Status.EnergyLevel energyLevel;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isActive;
    private String location;
    private String emoji;
    private String contextText;

    public static StatusResponse fromEntity(Status status) {
        StatusResponse response = new StatusResponse();
        response.id = status.getId();
        response.userId = status.getUserId();
        response.type = status.getType();
        response.energyLevel = status.getEnergyLevel();
        response.createdAt = status.getCreatedAt();
        response.expiresAt = status.getExpiresAt();
        response.isActive = status.getIsActive();
        response.location = status.getLocationText();
        response.emoji = status.getEmoji();
        response.contextText = status.getContextText();
        return response;
    }
}
