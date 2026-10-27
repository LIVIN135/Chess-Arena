package com.chessarena.repository;

import com.chessarena.entity.Friendship;
import com.chessarena.entity.FriendshipStatus;
import com.chessarena.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    @Query("SELECT f FROM Friendship f WHERE (f.requester = :user OR f.addressee = :user) AND f.status = :status")
    List<Friendship> findAllFriendsForUser(@Param("user") User user, @Param("status") FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE f.addressee = :user AND f.status = 'PENDING'")
    List<Friendship> findPendingIncomingRequests(@Param("user") User user);

    @Query("SELECT f FROM Friendship f WHERE f.requester = :user AND f.status = 'PENDING'")
    List<Friendship> findPendingOutgoingRequests(@Param("user") User user);

    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requester = :u1 AND f.addressee = :u2) OR " +
           "(f.requester = :u2 AND f.addressee = :u1)")
    Optional<Friendship> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);
}
