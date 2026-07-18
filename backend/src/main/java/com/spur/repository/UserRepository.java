package com.spur.repository;

import com.spur.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User entity
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);

    /**
     * Find user by Google ID
     */
    Optional<User> findByGoogleId(String googleId);

    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);

    /**
     * Check if Google ID exists
     */
    boolean existsByGoogleId(String googleId);

    /**
     * Find user excluding soft-deleted
     */
    @Query("SELECT u FROM User u WHERE u.id = :id AND u.deletedAt IS NULL")
    Optional<User> findActiveById(@Param("id") UUID id);
}
