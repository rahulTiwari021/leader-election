**How Leader Election Works (Step-by-Step)**
1. Multiple replicas try to become the leader by setting a lock in Redis.
2. The first replica to succeed becomes the leader and connects to the WebSocket.
3. The leader replica keeps renewing the lock every few seconds.
4. If the leader replica crashes or stops renewing, another replica takes over and becomes the new leader.
