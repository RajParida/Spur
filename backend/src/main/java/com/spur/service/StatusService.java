package com.spur.service;

import com.spur.entity.Status;
import com.spur.repository.FriendshipRepository;
import com.spur.repository.StatusRepository;
import com.spur.dto.CreateStatusRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing user statuses
 * Handles creation, retrieval, expiration, and double-blind feed logic
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository statusRepository;
    private final FriendshipRepository friendshipRepository;

    /**
     * Create a new status for a user
     */
    @Transactional
    public Status createStatus(UUID userId, CreateStatusRequest request) {
        log.info("Creating status for user: {} with type: {}", userId, request.getType());

        // Expire any existing active status for this user
        Optional<Status> existingStatus = statusRepository.findActiveStatusByUserId(userId);
        if (existingStatus.isPresent()) {
            expireStatus(existingStatus.get().getId());
        }

        // Calculate expiration time
        LocalDateTime expiresAt = LocalDateTime.now()
            .plusMinutes(request.getDurationMinutes());

        // Create new status
        Status status = Status.builder()
            .userId(userId)
            .type(request.getType())
            .energyLevel(request.getEnergyLevel() != null ? request.getEnergyLevel() : Status.EnergyLevel.HIGH)
            .durationMinutes(request.getDurationMinutes())
            .expiresAt(expiresAt)
            .locationText(request.getLocation())
            .emoji(request.getEmoji())
            .contextText(request.getContextText())
            .isActive(true)
            .build();

        Status savedStatus = statusRepository.save(status);
        log.info("Status created: {} for user: {}", savedStatus.getId(), userId);

        return savedStatus;
    }

    /**
     * Get current active status for a user
     */
    public Optional<Status> getActiveStatus(UUID userId) {
        return statusRepository.findActiveStatusByUserId(userId);
    }

    /**
     * Get the double-blind feed for a user
     * Only returns statuses from accepted friends
     * Only visible if user has active status themselves
     */
    public List<Status> getVisibleFeed(UUID userId) {
        log.debug("Fetching visible feed for user: {}", userId);

        // Check if user has active status
        Optional<Status> userStatus = statusRepository.findActiveStatusByUserId(userId);
        if (userStatus.isEmpty()) {
            log.debug("User {} has no active status, returning empty feed", userId);
            return List.of();
        }

        // Get statuses from accepted friends
        List<Status> visibleStatuses = statusRepository.findVisibleStatusesForUser(
            userId,
            LocalDateTime.now()
        );

        log.debug("Found {} visible statuses for user: {}", visibleStatuses.size(), userId);
        return visibleStatuses;
    }

    /**
     * Expire a status
     */
    @Transactional
    public void expireStatus(UUID statusId) {
        Optional<Status> status = statusRepository.findById(statusId);
        if (status.isPresent()) {
            Status s = status.get();
            s.expire();
            statusRepository.save(s);
            log.info("Status expired: {}", statusId);
        }
    }

    /**
     * Scheduled task to auto-expire statuses
     * Runs every minute
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    @Transactional
    public void autoExpireStatuses() {
        log.debug("Auto-expiring statuses...");
        LocalDateTime now = LocalDateTime.now();
        List<Status> expiredStatuses = statusRepository.findExpiredStatuses(now);

        for (Status status : expiredStatuses) {
            status.expire();
            statusRepository.save(status);
            log.info("Auto-expired status: {}", status.getId());
        }

        if (!expiredStatuses.isEmpty()) {
            log.info("Auto-expired {} statuses", expiredStatuses.size());
        }
    }

    /**
     * Get all statuses for a user (including expired)
     */
    public List<Status> getStatusesByUser(UUID userId) {
        return statusRepository.findByUserId(userId);
    }

    /**
     * Get status by ID
     */
    public Optional<Status> getStatusById(UUID statusId) {
        return statusRepository.findById(statusId);
    }

    /**
     * Check if user can see feed
     */
    public boolean canSeeFeed(UUID userId) {
        return statusRepository.findActiveStatusByUserId(userId).isPresent();
    }
}
