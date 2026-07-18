package com.spur.service;

import com.spur.entity.Friendship;
import com.spur.entity.User;
import com.spur.repository.FriendshipRepository;
import com.spur.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing friendships and user connections
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    /**
     * Send a friend request
     */
    @Transactional
    public Friendship sendFriendRequest(UUID initiatorId, UUID targetUserId) {
        log.info("Friend request from {} to {}", initiatorId, targetUserId);

        if (initiatorId.equals(targetUserId)) {
            throw new IllegalArgumentException("Cannot friend yourself");
        }

        // Check if friendship already exists
        Optional<Friendship> existing = friendshipRepository.findBetweenUsers(initiatorId, targetUserId);
        if (existing.isPresent()) {
            log.warn("Friendship already exists between {} and {}", initiatorId, targetUserId);
            return existing.get();
        }

        // Create friendship with ordered IDs
        UUID userIdA = initiatorId.compareTo(targetUserId) < 0 ? initiatorId : targetUserId;
        UUID userIdB = initiatorId.compareTo(targetUserId) < 0 ? targetUserId : initiatorId;

        Friendship friendship = Friendship.builder()
            .userIdA(userIdA)
            .userIdB(userIdB)
            .initiatedBy(initiatorId)
            .status(Friendship.FriendshipStatus.PENDING)
            .build();

        return friendshipRepository.save(friendship);
    }

    /**
     * Accept a friend request
     */
    @Transactional
    public Friendship acceptFriendRequest(UUID userId, UUID requesterId) {
        log.info("Accepting friend request from {} to {}", requesterId, userId);

        Optional<Friendship> friendship = friendshipRepository.findBetweenUsers(userId, requesterId);
        if (friendship.isEmpty()) {
            throw new RuntimeException("Friendship not found");
        }

        Friendship f = friendship.get();
        f.accept();
        return friendshipRepository.save(f);
    }

    /**
     * Get accepted friends for a user (enforces max 20 limit)
     */
    public List<User> getAcceptedFriends(UUID userId) {
        List<UUID> friendIds = friendshipRepository.findAcceptedFriendIds(userId);
        return friendIds.stream()
            .limit(20) // Enforce limit
            .map(friendId -> userRepository.findById(friendId).orElse(null))
            .filter(user -> user != null && !user.isDeleted())
            .collect(Collectors.toList());
    }

    /**
     * Get count of accepted friends
     */
    public long countAcceptedFriends(UUID userId) {
        return friendshipRepository.countAcceptedFriends(userId);
    }

    /**
     * Check if users are friends
     */
    public boolean areFriends(UUID userId1, UUID userId2) {
        Optional<Friendship> friendship = friendshipRepository.findBetweenUsers(userId1, userId2);
        return friendship.isPresent() &&
            friendship.get().getStatus() == Friendship.FriendshipStatus.ACCEPTED;
    }

    /**
     * Remove a friend
     */
    @Transactional
    public void removeFriend(UUID userId, UUID friendId) {
        Optional<Friendship> friendship = friendshipRepository.findBetweenUsers(userId, friendId);
        if (friendship.isPresent()) {
            friendshipRepository.delete(friendship.get());
            log.info("Removed friendship between {} and {}", userId, friendId);
        }
    }

    /**
     * Block a user
     */
    @Transactional
    public Friendship blockUser(UUID userId, UUID blockedUserId) {
        UUID userIdA = userId.compareTo(blockedUserId) < 0 ? userId : blockedUserId;
        UUID userIdB = userId.compareTo(blockedUserId) < 0 ? blockedUserId : userId;

        Optional<Friendship> existing = friendshipRepository.findBetweenUsers(userId, blockedUserId);
        
        Friendship friendship = existing.orElseGet(() -> Friendship.builder()
            .userIdA(userIdA)
            .userIdB(userIdB)
            .initiatedBy(userId)
            .build());

        friendship.setStatus(Friendship.FriendshipStatus.BLOCKED);
        return friendshipRepository.save(friendship);
    }
}
