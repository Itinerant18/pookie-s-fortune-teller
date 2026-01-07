import pytest
from datetime import datetime
from src.engines.astrology_engine import AstrologyCalculator

@pytest.fixture
def calculator():
    return AstrologyCalculator()

def test_calculate_birth_chart(calculator):
    """Test birth chart calculation"""
    birth_dt = datetime(1990, 5, 15, 14, 30, 0)
    latitude = 19.0760
    longitude = 72.8777
    
    chart = calculator.calculate_birth_chart(birth_dt, latitude, longitude)
    
    assert 'planets' in chart.__dict__
    assert 'houses' in chart.__dict__
    assert 'ascendant' in chart.__dict__
    assert len(chart.planets) == 9  # 9 planets

def test_detect_yogas(calculator):
    """Test Yoga detection"""
    # Create mock planets with specific positions
    from src.engines.astrology_engine import PlanetaryPosition
    
    # Helper to create mock planet
    def mock_planet(house, degree=0):
        return PlanetaryPosition(
            planet="mock", sign="Aries", degree=degree, minute=0, second=0,
            house=house, speed=0, retrograde=False, nakshatra="Ashwini", nakshatra_pad=1
        )
    
    planets = {
        'jupiter': mock_planet(house=1),
        'moon': mock_planet(house=1),
        'mars': mock_planet(house=8),
        'sun': mock_planet(house=5),
        'mercury': mock_planet(house=5),
        'venus': mock_planet(house=5),
        'saturn': mock_planet(house=5),
        'rahu': mock_planet(house=2),
        'ketu': mock_planet(house=8)
    }
    
    # Need to fill other planets to avoid key errors if engine checks them
    for p in ['sun', 'mercury', 'venus', 'saturn', 'rahu', 'ketu']:
        if p not in planets:
             planets[p] = mock_planet(house=3)

    houses = {}
    ascendant = "Aries"
    
    yogas = calculator._detect_yogas(
        planets,
        houses,
        ascendant
    )
    
    assert 'Raj Yoga' in yogas
    assert 'Gaja Kesari Yoga' in yogas

def test_detect_doshas(calculator):
    """Test Dosha detection"""
    from src.engines.astrology_engine import PlanetaryPosition
    
    def mock_planet(house, degree=0):
        return PlanetaryPosition(
            planet="mock", sign="Aries", degree=degree, minute=0, second=0,
            house=house, speed=0, retrograde=False, nakshatra="Ashwini", nakshatra_pad=1
        )

    planets = {
        'mars': mock_planet(house=8),
        'rahu': mock_planet(house=1, degree=10),
        'ketu': mock_planet(house=7, degree=190), # Opposite + 180
        'sun': mock_planet(house=5, degree=50),
        'saturn': mock_planet(house=5, degree=55), # Conjunct
        'jupiter': mock_planet(house=2),
        'moon': mock_planet(house=2),
        'mercury': mock_planet(house=2),
        'venus': mock_planet(house=2)
    }
    
    houses = {}
    
    doshas = calculator._detect_doshas(planets, houses)
    
    dosha_names = [d['name'] for d in doshas]
    assert 'Mangal Dosha' in dosha_names
    assert 'Kaal Sarp Dosha' in dosha_names
    assert 'Pitra Dosha' in dosha_names
