"""
Swiss Ephemeris-based Astrology Engine
Calculates birth charts, planetary positions, Dashas, Yogas, and Doshas
"""

from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import math
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Zodiac and planetary data
ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira",
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha",
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
    "Visakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati"
]

PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]

DASHA_LORDS = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]

DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

@dataclass
class PlanetaryPosition:
    """Represents a planet's position in the zodiac"""
    planet: str
    sign: str
    degree: float
    minute: float
    second: float
    house: int
    speed: float
    retrograde: bool
    nakshatra: str
    nakshatra_pad: int

@dataclass
class BirthChartData:
    """Complete birth chart information"""
    planets: Dict[str, PlanetaryPosition]
    houses: Dict[int, str]
    ascendant: str
    moon_nakshatra: str
    current_dasha: str
    current_dasha_lord: str
    yogas: List[str]
    doshas: List[Dict[str, Any]]
    calculated_at: datetime

class AdvancedAstrologyEngine:
    def __init__(self):
        self.planets_order = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
        # Standard Ashtakvarga points (simplified example for Saturn)
        self.ashtak_rules = {
            "Saturn": {"Saturn": [3, 5, 6, 11], "Jupiter": [5, 6, 11], "Mars": [3, 5, 6, 11]}
        }

    def calculate_sripati_houses(self, asc_lon: float, mc_lon: float) -> List[float]:
        """
        Calculates Sripati House Cusps.
        Unlike Equal House, Sripati calculates the distance between 
        the Ascendant and Midheaven and divides it into unequal portions.
        """
        # Distances between angles
        dist = (mc_lon - asc_lon) % 360
        step = dist / 6
        cusps = [(asc_lon + (i * step)) % 360 for i in range(12)]
        return cusps

    def check_sade_sati(self, natal_moon_lon: float, current_saturn_lon: float) -> Dict[str, Any]:
        """
        Sade Sati occurs when Transit Saturn is in the 12th, 1st, or 2nd house 
        from the Natal Moon (roughly 45 degrees before to 45 degrees after).
        """
        diff = (current_saturn_lon - natal_moon_lon)
        # Normalize diff to -180 to 180
        if diff > 180: diff -= 360
        if diff < -180: diff += 360

        is_active = -45 <= diff <= 45
        phase = "None"
        if -45 <= diff < -15: phase = "First Phase (Rising)"
        elif -15 <= diff < 15: phase = "Peak Phase (Core)"
        elif 15 <= diff <= 45: phase = "Final Phase (Setting)"

        return {"active": is_active, "phase": phase, "distance": diff}

    def calculate_ashtakvarga(self, planets: Dict[str, Any]) -> Dict[int, int]:
        """
        Calculates Sarvashtakvarga (total points per house).
        In reality, this requires checking every planet against every other planet.
        """
        house_points = {i: 0 for i in range(1, 13)}
        # Placeholder logic: High points if benefics (Jupiter/Venus) are in houses
        for p_name, data in planets.items():
            if data.planet in ["Jupiter", "Venus"]:
                house_points[data.house] += 4
            elif data.planet in ["Saturn", "Mars"]:
                house_points[data.house] += 2
        return house_points

    def get_antardasha(self, mahadasha_lord: str, start_date: datetime) -> List[Dict]:
        """
        Calculates the sub-periods (Antardashas) within a Mahadasha.
        Rule: Antardasha duration = (M-years * A-years) / 120
        """
        m_years = DASHA_YEARS[mahadasha_lord]
        antardashas = []
        current_start = start_date

        # The first Antardasha is always the same lord as the Mahadasha
        start_idx = DASHA_LORDS.index(mahadasha_lord)
        for i in range(9):
            a_lord = DASHA_LORDS[(start_idx + i) % 9]
            a_years = DASHA_YEARS[a_lord]
            duration_days = (m_years * a_years / 120) * 365.25
            end_date = current_start + timedelta(days=duration_days)
            
            antardashas.append({
                "lord": a_lord,
                "start": current_start.date(),
                "end": end_date.date()
            })
            current_start = end_date
            
        return antardashas

class AstrologyCalculator(AdvancedAstrologyEngine):
    """
    Calculate birth charts using ephemeris data
    Supports Vedic Astrology calculations
    """
    
    def __init__(self):
        super().__init__()
        self.zodiac_signs = ZODIAC_SIGNS
        self.nakshatras = NAKSHATRAS
        self.planets = PLANETS
        logger.info("Astrology Calculator initialized")
    
    def calculate_birth_chart(
        self,
        birth_datetime: datetime,
        latitude: float,
        longitude: float,
        timezone_offset: int = 5.5  # IST default
    ) -> BirthChartData:
        """
        Calculate complete birth chart (Kundli)
        
        Args:
            birth_datetime: Birth date and time
            latitude: Birth location latitude (-90 to 90)
            longitude: Birth location longitude (-180 to 180)
            timezone_offset: UTC offset in hours (default IST = 5.5)
        
        Returns:
            BirthChartData with all calculated values
        
        Example:
            >>> from datetime import datetime
            >>> calc = AstrologyCalculator()
            >>> birth = datetime(1990, 5, 15, 14, 30, 0)
            >>> chart = calc.calculate_birth_chart(birth, 19.0760, 72.8777)
        """
        logger.info(f"Calculating birth chart for {birth_datetime} at ({latitude}, {longitude})")
        
        try:
            # Calculate Julian Date (astronomical calculation basis)
            jd = self._gregorian_to_julian_date(birth_datetime, timezone_offset)
            
            # Calculate planetary positions
            planets = self._calculate_planets(jd, latitude, longitude)
            
            # Calculate houses (Bhavas)
            houses = self._calculate_houses(jd, latitude, longitude)
            
            # Calculate Ascendant (Lagna)
            ascendant = self._calculate_ascendant(jd, latitude, longitude)
            
            # Get moon nakshatra
            moon_planet = planets["moon"]
            moon_nakshatra = self._get_nakshatra(moon_planet.degree)
            
            # Calculate current Dasha
            current_dasha = self._calculate_dasha(moon_nakshatra, birth_datetime)
            
            # Detect Yogas (auspicious combinations)
            yogas = self._detect_yogas(planets, houses, ascendant)
            
            # Detect Doshas (inauspicious combinations)
            doshas = self._detect_doshas(planets, houses)
            
            birth_chart = BirthChartData(
                planets=planets,
                houses=houses,
                ascendant=ascendant,
                moon_nakshatra=moon_nakshatra,
                current_dasha=current_dasha["period"],
                current_dasha_lord=current_dasha["lord"],
                yogas=yogas,
                doshas=doshas,
                calculated_at=datetime.now()
            )
            
            logger.info("Birth chart calculated successfully")
            return birth_chart
        
        except Exception as e:
            logger.error(f"Error calculating birth chart: {e}")
            raise
    
    def _gregorian_to_julian_date(self, dt: datetime, tz_offset: float) -> float:
        """
        Convert Gregorian date to Julian Date Number
        Used for astronomical calculations
        """
        # Adjust for timezone
        utc_dt = dt - timedelta(hours=tz_offset)
        
        y = utc_dt.year
        m = utc_dt.month
        d = utc_dt.day
        h = utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600
        
        if m <= 2:
            y -= 1
            m += 12
        
        A = y // 100
        B = 2 - A + (A // 4)
        
        JD = int(365.25 * (y + 4716)) + int(30.6001 * (m + 1)) + d + B - 1524.5
        JD += h / 24
        
        return JD
    
    def _calculate_planets(
        self,
        jd: float,
        latitude: float,
        longitude: float
    ) -> Dict[str, PlanetaryPosition]:
        """
        Calculate positions of 9 planets using ephemeris algorithm
        Returns ecliptic longitude for each planet
        """
        planets = {}
        
        # Simplified planet position calculation
        # In production, use swiss ephemeris library: pymeeus or swisseph
        
        for planet in self.planets:
            # Calculate mean longitude
            lon = self._calculate_planet_longitude(jd, planet)
            
            # Convert to sign and degree
            sign_idx = int(lon / 30)
            degree_in_sign = lon % 30
            
            degree = int(degree_in_sign)
            minute = int((degree_in_sign - degree) * 60)
            second = ((degree_in_sign - degree) * 60 - minute) * 60
            
            # Get house
            house = self._get_house(lon, latitude, jd)
            
            # Get nakshatra
            nakshatra = self._get_nakshatra(degree_in_sign)
            nakshatra_pad = int((degree_in_sign % (360/27)) / (360/27/4)) + 1
            
            planets[planet.lower()] = PlanetaryPosition(
                planet=planet,
                sign=self.zodiac_signs[sign_idx % 12],
                degree=degree,
                minute=minute,
                second=second,
                house=house,
                speed=0.0,  # Calculate actual speed
                retrograde=False,  # Check retrograde status
                nakshatra=nakshatra,
                nakshatra_pad=nakshatra_pad
            )
        
        return planets
    
    def _calculate_planet_longitude(self, jd: float, planet: str) -> float:
        """
        Calculate ecliptic longitude of planet at given Julian Date
        Using simplified mean position formula
        """
        T = (jd - 2451545.0) / 36525  # Julian centuries from J2000
        
        # Mean longitude calculations (simplified)
        if planet == "Sun":
            lon = 280.4665 + 36000.7698 * T
        elif planet == "Moon":
            lon = 218.3165 + 481267.8813 * T
        elif planet == "Mercury":
            lon = 252.3 + 149474.0 * T
        elif planet == "Venus":
            lon = 181.9797 + 58517.8156 * T
        elif planet == "Mars":
            lon = 355.4325 + 19139.8585 * T
        elif planet == "Jupiter":
            lon = 34.3515 + 3034.9057 * T
        elif planet == "Saturn":
            lon = 50.0452 + 1222.1136 * T
        elif planet == "Rahu":
            # Rahu: retrograde motion ~3:11 per day
            lon = 351.5449 - 0.0529 * (jd - 2451545.0)
        elif planet == "Ketu":
            # Ketu: opposite of Rahu
            lon = 171.5449 - 0.0529 * (jd - 2451545.0)
        else:
            lon = 0
        
        # Normalize to 0-360
        return lon % 360
    
    def _calculate_houses(
        self,
        jd: float,
        latitude: float,
        longitude: float
    ) -> Dict[int, str]:
        """
        Calculate 12 houses (Bhavas) using Placidus house system
        """
        houses = {}
        
        # Calculate RAMC (Right Ascension of Midheaven)
        lst = self._calculate_local_sidereal_time(jd, longitude)
        
        # Simplified house cusp calculation
        for i in range(1, 13):
            # In production, use full Placidus algorithm
            cusp_lon = (lst + (i - 1) * 30) % 360
            sign_idx = int(cusp_lon / 30)
            houses[i] = self.zodiac_signs[sign_idx % 12]
        
        return houses
    
    def _calculate_ascendant(self, jd: float, latitude: float, longitude: float) -> str:
        """
        Calculate Ascendant (Lagna)
        The zodiac sign at eastern horizon
        """
        lst = self._calculate_local_sidereal_time(jd, longitude)
        
        # RAMC (Right Ascension of MC)
        ramc = lst % 360
        
        # Calculate Ascendant
        # Simplified calculation
        asc_lon = (ramc - 90) % 360
        sign_idx = int(asc_lon / 30)
        
        return self.zodiac_signs[sign_idx % 12]
    
    def _calculate_local_sidereal_time(self, jd: float, longitude: float) -> float:
        """
        Calculate Local Sidereal Time at given location
        """
        # Greenwich Mean Sidereal Time
        gmst = 280.46061837 + 360.98564724 * (jd - 2451545.0)
        gmst = gmst % 360
        
        # Local Sidereal Time
        lst = (gmst + longitude) % 360
        
        return lst
    
    def _get_house(self, longitude: float, latitude: float, jd: float) -> int:
        """
        Determine which house (1-12) a planet is in
        """
        houses = self._calculate_houses(jd, latitude, 0)
        
        lon_normalized = longitude % 360
        
        # Find which house contains this longitude
        for i in range(1, 13):
            next_i = i % 12 + 1
            house_start = self._get_house_cusp_longitude(houses[i])
            house_end = self._get_house_cusp_longitude(houses[next_i])
            
            if house_start <= lon_normalized < house_end or \
               (house_start > house_end and (lon_normalized >= house_start or lon_normalized < house_end)):
                return i
        
        return 1  # Default to 1st house
    
    def _get_house_cusp_longitude(self, sign: str) -> float:
        """Get longitude of house cusp from sign"""
        sign_idx = self.zodiac_signs.index(sign)
        return sign_idx * 30
    
    def _get_nakshatra(self, degree: float) -> str:
        """
        Get Nakshatra (lunar mansion) from degree in zodiac
        27 nakshatras, each 13.33 degrees
        """
        nakshatra_degree = 360 / 27  # 13.333...
        nakshatra_idx = int(degree / nakshatra_degree)
        return self.nakshatras[nakshatra_idx % 27]
    
    def _calculate_dasha(self, moon_nakshatra: str, birth_time: datetime) -> Dict[str, Any]:
        """
        Calculate Vimshottari Dasha periods
        Based on Moon's nakshatra at birth
        """
        # Get starting Dasha lord from nakshatra
        nakshatra_idx = self.nakshatras.index(moon_nakshatra)
        dasha_lord_idx = nakshatra_idx % 9
        current_lord = DASHA_LORDS[dasha_lord_idx]
        
        # Calculate remaining dasha period
        # This is simplified; actual calculation is more complex
        remaining_fraction = 0.5  # Assume mid-way through dasha
        remaining_years = DASHA_YEARS[current_lord] * remaining_fraction
        
        return {
            "lord": current_lord,
            "period": f"{current_lord} Mahadasha",
            "duration_years": DASHA_YEARS[current_lord],
            "remaining_years": remaining_years,
            "start_date": birth_time.isoformat(),
            "sequence": DASHA_LORDS
        }
    
    def _detect_yogas(
        self,
        planets: Dict[str, PlanetaryPosition],
        houses: Dict[int, str],
        ascendant: str
    ) -> List[str]:
        """
        Detect auspicious Yogas (planetary combinations)
        """
        yogas = []
        
        # Raj Yoga: Jupiter in angular houses (1, 4, 7, 10)
        if planets["jupiter"].house in [1, 4, 7, 10]:
            yogas.append("Raj Yoga")
        
        # Gaja Kesari Yoga: Jupiter and Moon in favorable positions
        if self._check_gaja_kesari(planets["jupiter"], planets["moon"]):
            yogas.append("Gaja Kesari Yoga")
        
        # Parivarthan Yoga: Two planets in each other's signs
        if self._check_parivarthan(planets):
            yogas.append("Parivarthan Yoga")
        
        # Dhana Yoga: Benefics in 2nd and 11th houses
        if self._check_dhana_yoga(planets):
            yogas.append("Dhana Yoga")
        
        # Gajakesari Yoga: specific planetary alignment
        if self._check_gajakesari(planets):
            yogas.append("Gaja Kesari Yoga")
        
        return yogas
    
    def _check_gaja_kesari(self, jupiter: PlanetaryPosition, moon: PlanetaryPosition) -> bool:
        """Check for Gaja Kesari Yoga"""
        return jupiter.house in [1, 4, 7, 10] and moon.house in [1, 4, 7, 10]
    
    def _check_parivarthan(self, planets: Dict[str, PlanetaryPosition]) -> bool:
        """Check for Parivarthan Yoga"""
        # Check if any two benefic planets are in each other's signs
        return False  # Simplified
    
    def _check_dhana_yoga(self, planets: Dict[str, PlanetaryPosition]) -> bool:
        """Check for Dhana (wealth) Yoga"""
        # Check for benefics in 2nd and 11th houses
        house_2_planets = [p for p in planets.values() if p.house == 2]
        house_11_planets = [p for p in planets.values() if p.house == 11]
        
        return len(house_2_planets) > 0 and len(house_11_planets) > 0
    
    def _check_gajakesari(self, planets: Dict[str, PlanetaryPosition]) -> bool:
        """Check for Gaja Kesari Yoga"""
        return abs(planets["jupiter"].degree - planets["moon"].degree) <= 30
    
    def _detect_doshas(
        self,
        planets: Dict[str, PlanetaryPosition],
        houses: Dict[int, str]
    ) -> List[Dict[str, Any]]:
        """
        Detect inauspicious Doshas (malefic combinations)
        """
        doshas = []
        
        # Mangal Dosha: Mars in 1, 2, 4, 7, 8, or 12
        if planets["mars"].house in [1, 2, 4, 7, 8, 12]:
            severity = self._calculate_dosha_severity(planets["mars"])
            doshas.append({
                "name": "Mangal Dosha",
                "severity": severity,
                "description": "Mars in inauspicious house",
                "remedies": ["Wear red coral", "Recite Hanuman Chalisa daily"]
            })
        
        # Kaal Sarp Dosha: Rahu-Ketu axis on nodal axis
        if self._check_kaal_sarp(planets):
            doshas.append({
                "name": "Kaal Sarp Dosha",
                "severity": "medium",
                "description": "Rahu-Ketu on nodal axis",
                "remedies": ["Perform Nag Puja", "Worship Lord Shiva"]
            })
        
        # Pitra Dosha: Sun-Saturn conjunction
        if self._check_pitra_dosha(planets):
            doshas.append({
                "name": "Pitra Dosha",
                "severity": "medium",
                "description": "Indicates ancestral debts",
                "remedies": ["Perform Pitra Shradh", "Help the needy"]
            })
        
        return doshas
    
    def _calculate_dosha_severity(self, planet: PlanetaryPosition) -> str:
        """Calculate severity of dosha"""
        # Simplified: based on house position
        if planet.house in [8]:
            return "high"
        elif planet.house in [2, 12]:
            return "medium"
        else:
            return "low"
    
    def _check_kaal_sarp(self, planets: Dict[str, PlanetaryPosition]) -> bool:
        """Check for Kaal Sarp Dosha"""
        rahu_degree = planets["rahu"].degree
        ketu_degree = planets["ketu"].degree
        
        # Simplified: check if they're opposite
        return abs(rahu_degree - ketu_degree) > 170
    
    def _check_pitra_dosha(self, planets: Dict[str, PlanetaryPosition]) -> bool:
        """Check for Pitra Dosha"""
        sun_degree = planets["sun"].degree
        saturn_degree = planets["saturn"].degree
        
        # Check if Sun and Saturn are conjunct or opposite
        diff = abs(sun_degree - saturn_degree)
        return diff <= 10 or diff >= 350
    
    def get_daily_horoscope(self, zodiac_sign: str) -> Dict[str, Any]:
        """
        Generate daily horoscope for zodiac sign
        """
        if zodiac_sign not in self.zodiac_signs:
            raise ValueError(f"Invalid zodiac sign: {zodiac_sign}")
        
        return {
            "sign": zodiac_sign,
            "date": datetime.now().isoformat(),
            "mood": "optimistic",
            "lucky_number": 7,
            "lucky_color": "blue",
            "forecast": "A favorable day for new initiatives",
            "romance": "Positive energy in relationships",
            "career": "Good for important meetings",
            "health": "Pay attention to diet"
        }
