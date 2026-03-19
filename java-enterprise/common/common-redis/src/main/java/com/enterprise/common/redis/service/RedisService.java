package com.enterprise.common.redis.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Redis service facade.
 * Provides commonly used Redis operations with type safety.
 */
@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    // ===== String Operations =====

    public void set(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public void set(String key, Object value, Duration ttl) {
        redisTemplate.opsForValue().set(key, value, ttl);
    }

    @SuppressWarnings("unchecked")
    public <T> Optional<T> get(String key) {
        Object value = redisTemplate.opsForValue().get(key);
        return Optional.ofNullable((T) value);
    }

    public boolean hasKey(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public boolean delete(String key) {
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    public boolean expire(String key, Duration ttl) {
        return Boolean.TRUE.equals(redisTemplate.expire(key, ttl.toSeconds(), TimeUnit.SECONDS));
    }

    public Long getExpire(String key) {
        return redisTemplate.getExpire(key);
    }

    // ===== Increment =====

    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    public Long incrementBy(String key, long delta) {
        return redisTemplate.opsForValue().increment(key, delta);
    }

    // ===== Hash Operations =====

    public void hashSet(String key, String field, Object value) {
        redisTemplate.opsForHash().put(key, field, value);
    }

    @SuppressWarnings("unchecked")
    public <T> Optional<T> hashGet(String key, String field) {
        Object value = redisTemplate.opsForHash().get(key, field);
        return Optional.ofNullable((T) value);
    }

    public void hashDelete(String key, String... fields) {
        redisTemplate.opsForHash().delete(key, (Object[]) fields);
    }

    // ===== Set Operations =====

    public void setAdd(String key, Object... values) {
        redisTemplate.opsForSet().add(key, values);
    }

    public Set<Object> setMembers(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    public boolean setIsMember(String key, Object value) {
        return Boolean.TRUE.equals(redisTemplate.opsForSet().isMember(key, value));
    }

    // ===== Distributed Lock =====

    /**
     * Try to acquire a distributed lock.
     *
     * @param lockKey  lock key
     * @param value    lock holder identifier (e.g. UUID)
     * @param ttl      lock expiry duration
     * @return true if lock acquired
     */
    public boolean tryLock(String lockKey, String value, Duration ttl) {
        return Boolean.TRUE.equals(
                redisTemplate.opsForValue().setIfAbsent(lockKey, value, ttl));
    }

    /**
     * Release lock only if owned by caller (compare-and-delete).
     */
    public boolean releaseLock(String lockKey, String expectedValue) {
        Object actual = redisTemplate.opsForValue().get(lockKey);
        if (expectedValue.equals(actual)) {
            return Boolean.TRUE.equals(redisTemplate.delete(lockKey));
        }
        return false;
    }
}
