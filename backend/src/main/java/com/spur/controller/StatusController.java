package com.spur.controller;

import com.spur.dto.CreateStatusRequest;
import com.spur.entity.Status;
import com.spur.service.StatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API endpoints for status management
 */
@Slf4j
@RestController
@RequestMapping("/statuses")
@RequiredArgsConstructor
@Tag(name = "Status Management", description = "APIs for managing user availability statuses")
@SecurityRequirement(name = "bearerAuth")
public class StatusController {

    private final StatusService statusService;

    /**
     * Create a new status
     */
    @PostMapping
    @Operation(summary = "Create a new status")
    public ResponseEntity<Status> createStatus(
        @RequestBody CreateStatusRequest request,
        @RequestHeader("X-User-Id") UUID userId
    ) {
        log.info("Creating status for user: {}", userId);
        Status status = statusService.createStatus(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    /**
     * Get current user's active status
     */
    @GetMapping("/me")
    @Operation(summary = "Get current user's active status")
    public ResponseEntity<?> getActiveStatus(
        @RequestHeader("X-User-Id") UUID userId
    ) {
        log.info("Fetching active status for user: {}", userId);
        return statusService.getActiveStatus(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get visible feed (double-blind)
     */
    @GetMapping("/feed")
    @Operation(summary = "Get visible friend statuses (double-blind feed)")
    public ResponseEntity<List<Status>> getFeed(
        @RequestHeader("X-User-Id") UUID userId
    ) {
        log.info("Fetching feed for user: {}", userId);
        
        // Check if user can see feed
        if (!statusService.canSeeFeed(userId)) {
            log.warn("User {} has no active status, returning empty feed", userId);
            return ResponseEntity.ok(List.of());
        }

        List<Status> feed = statusService.getVisibleFeed(userId);
        return ResponseEntity.ok(feed);
    }

    /**
     * Get statuses for a specific user
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all statuses for a user")
    public ResponseEntity<List<Status>> getStatusesByUser(
        @PathVariable UUID userId
    ) {
        log.info("Fetching statuses for user: {}", userId);
        List<Status> statuses = statusService.getStatusesByUser(userId);
        return ResponseEntity.ok(statuses);
    }

    /**
     * Get status by ID
     */
    @GetMapping("/{statusId}")
    @Operation(summary = "Get status by ID")
    public ResponseEntity<?> getStatus(
        @PathVariable UUID statusId
    ) {
        log.info("Fetching status: {}", statusId);
        return statusService.getStatusById(statusId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Expire a status early
     */
    @DeleteMapping("/{statusId}")
    @Operation(summary = "Expire a status")
    public ResponseEntity<?> expireStatus(
        @PathVariable UUID statusId,
        @RequestHeader("X-User-Id") UUID userId
    ) {
        log.info("Expiring status: {} for user: {}", statusId, userId);
        
        // Verify ownership
        Status status = statusService.getStatusById(statusId)
            .orElse(null);
        
        if (status == null) {
            return ResponseEntity.notFound().build();
        }

        if (!status.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Cannot expire other user's status");
        }

        statusService.expireStatus(statusId);
        return ResponseEntity.ok().build();
    }

    /**
     * Check if user can see feed
     */
    @GetMapping("/feed/can-see")
    @Operation(summary = "Check if user can see the feed")
    public ResponseEntity<Boolean> canSeeFeed(
        @RequestHeader("X-User-Id") UUID userId
    ) {
        boolean canSee = statusService.canSeeFeed(userId);
        return ResponseEntity.ok(canSee);
    }
}
