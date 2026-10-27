package com.chessarena.repository;

import com.chessarena.entity.ChallengeStatus;
import com.chessarena.entity.FriendChallenge;
import com.chessarena.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FriendChallengeRepository extends JpaRepository<FriendChallenge, UUID> {

    @Query("SELECT c FROM FriendChallenge c WHERE c.challenged = :user AND c.status = 'PENDING'")
    List<FriendChallenge> findPendingChallengesForUser(@Param("user") User user);

    @Query("SELECT c FROM FriendChallenge c WHERE c.challenger = :user AND c.status = 'PENDING'")
    List<FriendChallenge> findPendingChallengesSentByUser(@Param("user") User user);

    @Query("SELECT c FROM FriendChallenge c WHERE (c.challenger = :user OR c.challenged = :user) AND c.status = :status")
    List<FriendChallenge> findByUserAndStatus(@Param("user") User user, @Param("status") ChallengeStatus status);
}
