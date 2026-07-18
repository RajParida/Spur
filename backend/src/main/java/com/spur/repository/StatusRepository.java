package com.spur.repository;

import com.spur.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Status entity
 */
@Repository
public interface StatusRepository extends JpaRepository<Status, UUID> {

    /**
     * Find active status for a user
     */
    @Query("SELECT s FROM Status s WHERE s.userId = :userId AND s.isActive = true")
    Optional<Status> findActiveStatusByUserId(@Param("userId") UUID userId);

    /**
     * Find all active statuses
     */
    @Query("SELECT s FROM Status s WHERE s.isActive = true ORDER BY s.createdAt DESC")
    List<Status> findAllActive();

    /**
     * Find expired statuses (double-blind feed logic)
     * Returns statuses where current time is after expires_at
     */
    @Query("SELECT s FROM Status s WHERE s.expiresAt <= :now AND s.isActive = true")
    List<Status> findExpiredStatuses(@Param("now") LocalDateTime now);

    /**
     * Find visible statuses for a user (double-blind feed)
     * Only shows statuses from accepted friends
     */
    @Query("""
        SELECT s FROM Status s
        WHERE s.userId IN (
            SELECT CASE 
                WHEN f.userIdA = :userId THEN f.userIdB
                ELSE f.userIdA
            END
            FROM Friendship f
            WHERE (f.userIdA = :userId OR f.userIdB = :userId)
            AND f.status = 'ACCEPTED'
        )
        AND s.isActive = true
        AND s.expiresAt > :now
        ORDER BY s.createdAt DESC
        """)
    List<Status> findVisibleStatusesForUser(
        @Param("userId") UUID userId,
        @Param("now") LocalDateTime now
    );

    /**
     * Find statuses by user ID
     */
    List<Status> findByUserId(UUID userId);

    /**
     * Count active statuses for a user
     */
    @Query("SELECT COUNT(s) FROM Status s WHERE s.userId = :userId AND s.isActive = true")
    long countActiveByUserId(@Param("userId") UUID userId);
}
