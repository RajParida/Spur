package com.spur.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Chat entity representing 1-on-1 conversations
 */
@Entity
@Table(name = "chats", indexes = {
    @Index(name = "idx_chats_user_a", columnList = "user_id_a"),
    @Index(name = "idx_chats_user_b", columnList = "user_id_b"),
    @Index(name = "idx_chats_expires_at", columnList = "expires_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id_a", nullable = false)
    private UUID userIdA;

    @Column(name = "user_id_b", nullable = false)
    private UUID userIdB;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id_a", insertable = false, updatable = false)
    private User userA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id_b", insertable = false, updatable = false)
    private User userB;

    @Column(name = "triggered_by_status_id")
    private UUID triggeredByStatusId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by_status_id", insertable = false, updatable = false)
    private Status triggeredByStatus;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Get the other user's ID
     */
    public UUID getOtherUserId(UUID currentUserId) {
        return currentUserId.equals(userIdA) ? userIdB : userIdA;
    }

    /**
     * Check if chat has expired
     */
    public boolean hasExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
