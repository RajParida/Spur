package com.spur.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Status entity representing user availability status
 * Types: free_now, free_tonight, already_here
 */
@Entity
@Table(name = "statuses", indexes = {
    @Index(name = "idx_statuses_user_id", columnList = "user_id"),
    @Index(name = "idx_statuses_is_active", columnList = "is_active"),
    @Index(name = "idx_statuses_expires_at", columnList = "expires_at"),
    @Index(name = "idx_statuses_created_at", columnList = "created_at DESC"),
    @Index(name = "idx_statuses_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Status {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusType type; // free_now, free_tonight, already_here

    @Enumerated(EnumType.STRING)
    @Column(name = "energy_level", nullable = false)
    @Builder.Default
    private EnergyLevel energyLevel = EnergyLevel.HIGH;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes; // 60, 180, 720

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "location_text", length = 255)
    private String locationText;

    @Column(name = "emoji", length = 10)
    private String emoji;

    @Column(name = "context_text", length = 255)
    private String contextText;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    /**
     * Check if status has expired
     */
    public boolean hasExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Mark status as expired
     */
    public void expire() {
        this.isActive = false;
        this.expiredAt = LocalDateTime.now();
    }

    public enum StatusType {
        FREE_NOW,
        FREE_TONIGHT,
        ALREADY_HERE
    }

    public enum EnergyLevel {
        LOW,
        HIGH
    }
}
