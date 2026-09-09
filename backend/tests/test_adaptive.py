from app.services.adaptive_service import calculate_next_level
def test_downgrade(): assert calculate_next_level(5,.4,2,16000)[0] == 4
def test_upgrade(): assert calculate_next_level(5,.9,0,5000,0,3)[0] == 6
