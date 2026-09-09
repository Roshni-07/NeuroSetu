def evaluate(latency_ms=0, error_count=0, consecutive_errors=0, mastery_drop=0, days_without_session=0, sos=False):
    if sos: return {'severity':'critical','reason':'SOS requested'}
    if latency_ms > 15000 and consecutive_errors >= 2: return {'severity':'critical','reason':'Repeated high latency and errors'}
    if latency_ms > 15000 or error_count >= 2 or consecutive_errors >= 2: return {'severity':'attention','reason':'Cognitive interaction difficulty detected'}
    if mastery_drop >= 24: return {'severity':'critical','reason':'Mastery dropped by 24+ points in 7 days'}
    if days_without_session > 5: return {'severity':'attention','reason':'No cognitive session for more than 5 days'}
    return {'severity':'stable','reason':'No active triage rule triggered'}
