def calculate_next_level(previous_level, accuracy, error_count, response_time_ms, consecutive_errors=0, consecutive_successes=0):
    level = max(1, min(10, int(previous_level or 1)))
    if consecutive_errors >= 2 or error_count >= 2 or response_time_ms > 15000 or accuracy < .50:
        return max(1, level - 1), -1
    if consecutive_successes >= 3 and accuracy >= .80 and 0 < response_time_ms < 8000:
        return min(10, level + 1), 1
    return level, 0

def calculate_mastery(previous, accuracy, error_count, response_time_ms):
    previous = max(0, min(100, float(previous or 0)))
    performance = accuracy*100*.35 + max(0, 100-min(error_count*20,100))*.10 + max(0, 100-min(response_time_ms/150,100))*.10 + accuracy*100*.45
    return round(max(0,min(100, previous*.60 + performance*.40)),2)
