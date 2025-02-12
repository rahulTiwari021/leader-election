##How Leader Election Works (Step-by-Step)
Multiple replicas try to become the leader by setting a lock in Redis.
The first replica to succeed becomes the leader and connects to the WebSocket.
The leader replica keeps renewing the lock every few seconds.
If the leader replica crashes or stops renewing, another replica takes over and becomes the new leader.
