package com.spur.repository;

import com.spur.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Friendship entity
 */
@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    /**
     * Find friendship between two users (bidirectional)
     */
    @Query("""
        SELECT f FROM Friendship f
        WHERE (f.userIdA = :userId1 AND f.userIdB = :userId2)
        OR (f.userIdA = :userId2 AND f.userIdB = :userId1)
        """)
    Optional<Friendship> findBetweenUsers(
        @Param("userId1") UUID userId1,
        @Param("userId2") UUID userId2
    );

    /**
     * Count accepted friends for a user
     */
    @Query("""
        SELECT COUNT(f) FROM Friendship f
        WHERE (f.userIdA = :userId OR f.userIdB = :userId)
        AND f.status = 'ACCEPTED'
        """)
    long countAcceptedFriends(@Param("userId") UUID userId);

    /**
     * Find accepted friends (bidirectional)
     */
    @Query("""
        SELECT CASE
            WHEN f.userIdA = :userId THEN f.userIdB
            ELSE f.userIdA
        END
        FROM Friendship f
        WHERE (f.userIdA = :userId OR f.userIdB = :userId)
        AND f.status = 'ACCEPTED'
        """)
    List<UUID> findAcceptedFriendIds(@Param("userId") UUID userId);

    /**
     * Find pending friend requests for a user
     */
    @Query("""
        SELECT f FROM Friendship f
        WHERE (f.userIdA = :userId OR f.userIdB = :userId)
        AND f.status = 'PENDING'
        AND f.initiatedBy != :userId
        """)
    List<Friendship> findPendingRequests(@Param("userId") UUID userId);

    /**
     * Find all friendships for a user
     */
    @Query("""
        SELECT f FROM Friendship f
        WHERE f.userIdA = :userId OR f.userIdB = :userId
        """)
    List<Friendship> findAllForUser(@Param("userId") UUID userId);
}
