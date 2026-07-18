package com.spur.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Friendship entity representing connections between users
 */
@Entity
@Table(name = "friendships", indexes = {
    @Index(name = "idx_friendships_user_a", columnList = "user_id_a"),
    @Index(name = "idx_friendships_user_b", columnList = "user_id_b"),
    @Index(name = "idx_friendships_status", columnList = "status")
},
uniqueConstraints = @UniqueConstraint(columnNames = {"user_id_a", "user_id_b"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Friendship {

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FriendshipStatus status = FriendshipStatus.PENDING;

    @Column(name = "initiated_by", nullable = false)
    private UUID initiatedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    /**
     * Mark friendship as accepted
     */
    public void accept() {
        this.status = FriendshipStatus.ACCEPTED;
        this.acceptedAt = LocalDateTime.now();
    }

    public enum FriendshipStatus {
        PENDING,
        ACCEPTED,
        BLOCKED
    }
}
