package com.spur.repository;

import com.spur.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Chat entity
 */
@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {

    /**
     * Find chat between two users (bidirectional)
     */
    @Query("""
        SELECT c FROM Chat c
        WHERE (c.userIdA = :userId1 AND c.userIdB = :userId2)
        OR (c.userIdA = :userId2 AND c.userIdB = :userId1)
        AND c.deletedAt IS NULL
        """)
    Optional<Chat> findBetweenUsers(
        @Param("userId1") UUID userId1,
        @Param("userId2") UUID userId2
    );

    /**
     * Find all chats for a user
     */
    @Query("""
        SELECT c FROM Chat c
        WHERE (c.userIdA = :userId OR c.userIdB = :userId)
        AND c.deletedAt IS NULL
        ORDER BY c.lastMessageAt DESC
        """)
    List<Chat> findAllForUser(@Param("userId") UUID userId);

    /**
     * Find expired chats that need to be cleaned up
     */
    @Query("""
        SELECT c FROM Chat c
        WHERE c.expiresAt <= :now
        AND c.deletedAt IS NULL
        """)
    List<Chat> findExpiredChats(@Param("now") java.time.LocalDateTime now);
}
