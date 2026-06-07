# -*- coding: utf-8 -*-
import json
import random

# Seed values to make generation deterministic
random.seed(42)

# --- 1. GEOGRAPHY DATASET (50 Countries) ---
geography_countries = [
    {"name_no": "Norge", "name_en": "Norway", "capital_no": "Oslo", "capital_en": "Oslo"},
    {"name_no": "Sverige", "name_en": "Sweden", "capital_no": "Stockholm", "capital_en": "Stockholm"},
    {"name_no": "Danmark", "name_en": "Denmark", "capital_no": "København", "capital_en": "Copenhagen"},
    {"name_no": "Finland", "name_en": "Finland", "capital_no": "Helsinki", "capital_en": "Helsinki"},
    {"name_no": "Island", "name_en": "Iceland", "capital_no": "Reykjavik", "capital_en": "Reykjavik"},
    {"name_no": "Tyskland", "name_en": "Germany", "capital_no": "Berlin", "capital_en": "Berlin"},
    {"name_no": "Frankrike", "name_en": "France", "capital_no": "Paris", "capital_en": "Paris"},
    {"name_no": "Spania", "name_en": "Spain", "capital_no": "Madrid", "capital_en": "Madrid"},
    {"name_no": "Italia", "name_en": "Italy", "capital_no": "Roma", "capital_en": "Rome"},
    {"name_no": "Storbritannia", "name_en": "United Kingdom", "capital_no": "London", "capital_en": "London"},
    {"name_no": "Nederland", "name_en": "Netherlands", "capital_no": "Amsterdam", "capital_en": "Amsterdam"},
    {"name_no": "Belgia", "name_en": "Belgium", "capital_no": "Brussel", "capital_en": "Brussels"},
    {"name_no": "Sveits", "name_en": "Switzerland", "capital_no": "Bern", "capital_en": "Bern"},
    {"name_no": "Østerrike", "name_en": "Austria", "capital_no": "Wien", "capital_en": "Vienna"},
    {"name_no": "Polen", "name_en": "Poland", "capital_no": "Warszawa", "capital_en": "Warsaw"},
    {"name_no": "Hellas", "name_en": "Greece", "capital_no": "Athen", "capital_en": "Athens"},
    {"name_no": "Portugal", "name_en": "Portugal", "capital_no": "Lisboa", "capital_en": "Lisbon"},
    {"name_no": "Tyrkia", "name_en": "Turkey", "capital_no": "Ankara", "capital_en": "Ankara"},
    {"name_no": "Russland", "name_en": "Russia", "capital_no": "Moskva", "capital_en": "Moscow"},
    {"name_no": "USA", "name_en": "United States", "capital_no": "Washington D.C.", "capital_en": "Washington D.C."},
    {"name_no": "Canada", "name_en": "Canada", "capital_no": "Ottawa", "capital_en": "Ottawa"},
    {"name_no": "Mexico", "name_en": "Mexico", "capital_no": "Mexico City", "capital_en": "Mexico City"},
    {"name_no": "Brasil", "name_en": "Brazil", "capital_no": "Brasilia", "capital_en": "Brasilia"},
    {"name_no": "Argentina", "name_en": "Argentina", "capital_no": "Buenos Aires", "capital_en": "Buenos Aires"},
    {"name_no": "Japan", "name_en": "Japan", "capital_no": "Tokyo", "capital_en": "Tokyo"},
    {"name_no": "Kina", "name_en": "China", "capital_no": "Beijing", "capital_en": "Beijing"},
    {"name_no": "Sør-Korea", "name_en": "South Korea", "capital_no": "Seoul", "capital_en": "Seoul"},
    {"name_no": "India", "name_en": "India", "capital_no": "New Delhi", "capital_en": "New Delhi"},
    {"name_no": "Australia", "name_en": "Australia", "capital_no": "Canberra", "capital_en": "Canberra"},
    {"name_no": "New Zealand", "name_en": "New Zealand", "capital_no": "Wellington", "capital_en": "Wellington"},
    {"name_no": "Egypt", "name_en": "Egypt", "capital_no": "Kairo", "capital_en": "Cairo"},
    {"name_no": "Sør-Afrika", "name_en": "South Africa", "capital_no": "Pretoria", "capital_en": "Pretoria"},
    {"name_no": "Kenya", "name_en": "Kenya", "capital_no": "Nairobi", "capital_en": "Nairobi"},
    {"name_no": "Marokko", "name_en": "Morocco", "capital_no": "Rabat", "capital_en": "Rabat"},
    {"name_no": "Saudi-Arabia", "name_en": "Saudi Arabia", "capital_no": "Riyadh", "capital_en": "Riyadh"},
    {"name_no": "Thailand", "name_en": "Thailand", "capital_no": "Bangkok", "capital_en": "Bangkok"},
    {"name_no": "Vietnam", "name_en": "Vietnam", "capital_no": "Hanoi", "capital_en": "Hanoi"},
    {"name_no": "Singapore", "name_en": "Singapore", "capital_no": "Singapore", "capital_en": "Singapore"},
    {"name_no": "Indonesia", "name_en": "Indonesia", "capital_no": "Jakarta", "capital_en": "Jakarta"},
    {"name_no": "Filippinene", "name_en": "Philippines", "capital_no": "Manila", "capital_en": "Manila"},
    {"name_no": "Ukraina", "name_en": "Ukraine", "capital_no": "Kyiv", "capital_en": "Kyiv"},
    {"name_no": "Irland", "name_en": "Ireland", "capital_no": "Dublin", "capital_en": "Dublin"},
    {"name_no": "Ungarn", "name_en": "Hungary", "capital_no": "Budapest", "capital_en": "Budapest"},
    {"name_no": "Tsjekkia", "name_en": "Czech Republic", "capital_no": "Praha", "capital_en": "Prague"},
    {"name_no": "Kroatia", "name_en": "Croatia", "capital_no": "Zagreb", "capital_en": "Zagreb"},
    {"name_no": "Colombia", "name_en": "Colombia", "capital_no": "Bogota", "capital_en": "Bogota"},
    {"name_no": "Chile", "name_en": "Chile", "capital_no": "Santiago", "capital_en": "Santiago"},
    {"name_no": "Peru", "name_en": "Peru", "capital_no": "Lima", "capital_en": "Lima"},
    {"name_no": "Cuba", "name_en": "Cuba", "capital_no": "Havanna", "capital_en": "Havana"},
    {"name_no": "Jamaica", "name_en": "Jamaica", "capital_no": "Kingston", "capital_en": "Kingston"},
]

# --- 2. HISTORY DATASET (50 Events) ---
history_events = [
    {"year": 1814, "desc_no": "ble den norske grunnloven undertegnet på Eidsvoll", "desc_en": "was the Norwegian Constitution signed at Eidsvoll"},
    {"year": 1905, "desc_no": "ble unionen mellom Norge og Sverige oppløst", "desc_en": "was the union between Norway and Sweden dissolved"},
    {"year": 1940, "desc_no": "ble Norge invadert under andre verdenskrig", "desc_en": "was Norway invaded during World War II"},
    {"year": 1945, "desc_no": "sluttet andre verdenskrig i Europa", "desc_en": "did World War II end in Europe"},
    {"year": 1914, "desc_no": "startet første verdenskrig", "desc_en": "did World War I begin"},
    {"year": 1918, "desc_no": "sluttet første verdenskrig", "desc_en": "did World War I end"},
    {"year": 1939, "desc_no": "startet andre verdenskrig med invasjonen av Polen", "desc_en": "did World War II begin with the invasion of Poland"},
    {"year": 1789, "desc_no": "startet den franske revolusjonen med stormingen av Bastillen", "desc_en": "did the French Revolution begin with the storming of the Bastille"},
    {"year": 1989, "desc_no": "falt Berlinmuren", "desc_en": "did the Berlin Wall fall"},
    {"year": 1991, "desc_no": "ble Sovjetunionen offisielt oppløst", "desc_en": "was the Soviet Union officially dissolved"},
    {"year": 1969, "desc_no": "landet Apollo 11 på månen for første gang", "desc_en": "did Apollo 11 land on the moon for the first time"},
    {"year": 1912, "desc_no": "sank passasjerskipet Titanic etter å ha truffet et isfjell", "desc_en": "did the passenger liner Titanic sink after striking an iceberg"},
    {"year": 1066, "desc_no": "fant slaget ved Hastings sted i England", "desc_en": "did the Battle of Hastings take place in England"},
    {"year": 1492, "desc_no": "ankom Kristoffer Columbus Amerika for første gang", "desc_en": "did Christopher Columbus first arrive in the Americas"},
    {"year": 1215, "desc_no": "undertegnet kong Johan av England Magna Carta", "desc_en": "did King John of England sign the Magna Carta"},
    {"year": 1963, "desc_no": "ble president John F. Kennedy myrdet i Dallas", "desc_en": "was President John F. Kennedy assassinated in Dallas"},
    {"year": 1929, "desc_no": "skjedde det store krakket på Wall Street som utløste depresjonen", "desc_en": "did the Wall Street Crash occur, triggering the Great Depression"},
    {"year": 1953, "desc_no": "besteg Edmund Hillary og Tenzing Norgay Mount Everest", "desc_en": "did Edmund Hillary and Tenzing Norgay summit Mount Everest"},
    {"year": 1994, "desc_no": "ble Nelson Mandela valgt som president i Sør-Afrika", "desc_en": "was Nelson Mandela elected President of South Africa"},
    {"year": 1605, "desc_no": "ble kruttsammensvergelsen ledet av Guy Fawkes oppdaget i London", "desc_en": "was the Gunpowder Plot led by Guy Fawkes discovered in London"},
    {"year": 1948, "desc_no": "ble staten Israel offisielt opprettet", "desc_en": "was the State of Israel officially declared"},
    {"year": 1865, "desc_no": "ble Abraham Lincoln skutt og drept i Washington D.C.", "desc_en": "was Abraham Lincoln shot and killed in Washington D.C."},
    {"year": 1815, "desc_no": "ble Napoleon Bonaparte endelig beseiret i slaget ved Waterloo", "desc_en": "was Napoleon Bonaparte finally defeated at the Battle of Waterloo"},
    {"year": 1957, "desc_no": "skjøt Sovjetunionen opp Sputnik 1, jordens første kunstige satellitt", "desc_en": "did the Soviet Union launch Sputnik 1, Earth's first artificial satellite"},
    {"year": 2001, "desc_no": "fant terrorangrepene 11. september sted i USA", "desc_en": "did the September 11 terrorist attacks take place in the United States"},
    {"year": 1804, "desc_no": "kronet Napoleon Bonaparte seg selv til keiser av Frankrike", "desc_en": "did Napoleon Bonaparte crown himself Emperor of France"},
    {"year": 1975, "desc_no": "sluttet Vietnamkrigen med Saigons fall", "desc_en": "did the Vietnam War end with the fall of Saigon"},
    {"year": 1986, "desc_no": "skjedde atomulykken i Tsjernobyl i Ukraina", "desc_en": "did the Chernobyl nuclear disaster occur in Ukraine"},
    {"year": 1347, "desc_no": "kom svartedauden til Europa", "desc_en": "did the Black Death arrive in Europe"},
    {"year": 1859, "desc_no": "publiserte Charles Darwin boken 'Artenes opprinnelse'", "desc_en": "did Charles Darwin publish 'On the Origin of Species'"},
    {"year": 1917, "desc_no": "fant den russiske revolusjonen sted", "desc_en": "did the Russian Revolution take place"},
    {"year": 1997, "desc_no": "omkom prinsesse Diana i en bilulykke i Paris", "desc_en": "did Princess Diana die in a car crash in Paris"},
    {"year": 1666, "desc_no": "fant den store bybrannen i London sted", "desc_en": "did the Great Fire of London take place"},
    {"year": 1776, "desc_no": "ble den amerikanske uavhengighetserklæringen undertegnet", "desc_en": "was the United States Declaration of Independence signed"},
    {"year": 1999, "desc_no": "ble euroen offisielt introdusert som regnskapsvaluta", "desc_en": "was the Euro currency officially introduced for accounting"},
    {"year": 1889, "desc_no": "sto Eiffeltårnet i Paris ferdigbygget", "desc_en": "was the Eiffel Tower in Paris completed"},
    {"year": 1947, "desc_no": "ble India og Pakistan uavhengige fra Storbritannia", "desc_en": "did India and Pakistan gain independence from Great Britain"},
    {"year": 1933, "desc_no": "ble Adolf Hitler utnevnt til rikskansler i Tyskland", "desc_en": "was Adolf Hitler appointed Chancellor of Germany"},
    {"year": 1805, "desc_no": "fant slaget ved Trafalgar sted", "desc_en": "did the Battle of Trafalgar take place"},
    {"year": 1954, "desc_no": "ble DNA-molekylets dobbelhelix-struktur beskrevet av Watson og Crick", "desc_en": "was the double-helix structure of DNA described by Watson and Crick"},
    {"year": 1517, "desc_no": "startet Martin Luther reformasjonen ved å henge opp sine 95 teser", "desc_en": "did Martin Luther start the Reformation by posting his 95 theses"},
    {"year": 1993, "desc_no": "ble Maastricht-traktaten virksom, noe som etablerte EU", "desc_en": "did the Maastricht Treaty take effect, officially establishing the EU"},
    {"year": 1848, "desc_no": "brøt det ut en rekke revolusjoner i Europa (Februarrevolusjonen m.fl.)", "desc_en": "did a wave of revolutions sweep across Europe"},
    {"year": 1962, "desc_no": "fant Cubakrisen sted, den kaldeste perioden under den kalde krigen", "desc_en": "did the Cuban Missile Crisis bring the world to the brink of nuclear war"},
    {"year": 1903, "desc_no": "fløy brødrene Wright historiens første motoriserte fly", "desc_en": "did the Wright brothers make the first controlled, powered airplane flight"},
    {"year": 1922, "desc_no": "ble graven til Tutankhamon oppdaget av Howard Carter", "desc_en": "was the tomb of Tutankhamon discovered by Howard Carter"},
    {"year": 1861, "desc_no": "startet den amerikanske borgerkrigen", "desc_en": "did the American Civil War begin"},
    {"year": 1995, "desc_no": "ble Verdens handelsorganisasjon (WTO) offisielt opprettet", "desc_en": "was the World Trade Organization (WTO) officially established"},
    {"year": 1901, "desc_no": "ble de aller første Nobelprisene delt ut", "desc_en": "were the very first Nobel Prizes awarded"},
    {"year": 1799, "desc_no": "ble Rosettasteinen funnet i Egypt av franske soldater", "desc_en": "was the Rosetta Stone discovered in Egypt by French soldiers"}
]

# --- 3. CHEMISTRY / ELEMENTS DATASET (50 Elements) ---
chemistry_elements = [
    {"symbol": "H", "name_no": "Hydrogen", "name_en": "Hydrogen"},
    {"symbol": "He", "name_no": "Helium", "name_en": "Helium"},
    {"symbol": "Li", "name_no": "Litium", "name_en": "Lithium"},
    {"symbol": "Be", "name_no": "Beryllium", "name_en": "Beryllium"},
    {"symbol": "B", "name_no": "Bor", "name_en": "Boron"},
    {"symbol": "C", "name_no": "Karbon", "name_en": "Carbon"},
    {"symbol": "N", "name_no": "Nitrogen", "name_en": "Nitrogen"},
    {"symbol": "O", "name_no": "Oksygen", "name_en": "Oxygen"},
    {"symbol": "F", "name_no": "Fluor", "name_en": "Fluorine"},
    {"symbol": "Ne", "name_no": "Neon", "name_en": "Neon"},
    {"symbol": "Na", "name_no": "Natrium", "name_en": "Sodium"},
    {"symbol": "Mg", "name_no": "Magnesium", "name_en": "Magnesium"},
    {"symbol": "Al", "name_no": "Aluminium", "name_en": "Aluminium"},
    {"symbol": "Si", "name_no": "Silisium", "name_en": "Silicon"},
    {"symbol": "P", "name_no": "Fosfor", "name_en": "Phosphorus"},
    {"symbol": "S", "name_no": "Svovel", "name_en": "Sulfur"},
    {"symbol": "Cl", "name_no": "Klor", "name_en": "Chlorine"},
    {"symbol": "Ar", "name_no": "Argon", "name_en": "Argon"},
    {"symbol": "K", "name_no": "Kalium", "name_en": "Potassium"},
    {"symbol": "Ca", "name_no": "Kalsium", "name_en": "Calcium"},
    {"symbol": "Fe", "name_no": "Jern", "name_en": "Iron"},
    {"symbol": "Co", "name_no": "Kobolt", "name_en": "Cobalt"},
    {"symbol": "Ni", "name_no": "Nikkel", "name_en": "Nickel"},
    {"symbol": "Cu", "name_no": "Kobber", "name_en": "Copper"},
    {"symbol": "Zn", "name_no": "Sink", "name_en": "Zinc"},
    {"symbol": "As", "name_no": "Arsen", "name_en": "Arsenic"},
    {"symbol": "Kr", "name_no": "Krypton", "name_en": "Krypton"},
    {"symbol": "Ag", "name_no": "Sølv", "name_en": "Silver"},
    {"symbol": "Sn", "name_no": "Tinn", "name_en": "Tin"},
    {"symbol": "I", "name_no": "Jod", "name_en": "Iodine"},
    {"symbol": "Xe", "name_no": "Xenon", "name_en": "Xenon"},
    {"symbol": "Ba", "name_no": "Barium", "name_en": "Barium"},
    {"symbol": "W", "name_no": "Wolfram", "name_en": "Tungsten"},
    {"symbol": "Pt", "name_no": "Platina", "name_en": "Platinum"},
    {"symbol": "Au", "name_no": "Gull", "name_en": "Gold"},
    {"symbol": "Hg", "name_no": "Kvikksølv", "name_en": "Mercury"},
    {"symbol": "Pb", "name_no": "Bly", "name_en": "Lead"},
    {"symbol": "Bi", "name_no": "Bismut", "name_en": "Bismuth"},
    {"symbol": "Rn", "name_no": "Radon", "name_en": "Radon"},
    {"symbol": "U", "name_no": "Uran", "name_en": "Uranium"},
    {"symbol": "Pu", "name_no": "Plutonium", "name_en": "Plutonium"},
    {"symbol": "Ti", "name_no": "Titan", "name_en": "Titanium"},
    {"symbol": "Cr", "name_no": "Krom", "name_en": "Chromium"},
    {"symbol": "Mn", "name_no": "Mangan", "name_en": "Manganese"},
    {"symbol": "Sr", "name_no": "Strontium", "name_en": "Strontium"},
    {"symbol": "Pd", "name_no": "Palladium", "name_en": "Palladium"},
    {"symbol": "Sb", "name_no": "Antimon", "name_en": "Antimony"},
    {"symbol": "Cs", "name_no": "Cesium", "name_en": "Caesium"},
    {"symbol": "Ra", "name_no": "Radium", "name_en": "Radium"},
    {"symbol": "Lr", "name_no": "Lawrencium", "name_en": "Lawrencium"},
]

# --- 4. SCIENCE FACTS DATASET (50 Science Facts) ---
science_facts = [
    {
        "q_no": "Hvilken planet er den største i solsystemet vårt?",
        "q_en": "Which planet is the largest in our solar system?",
        "ans_no": "Jupiter", "ans_en": "Jupiter",
        "w1_no": "Saturn", "w1_en": "Saturn",
        "w2_no": "Neptun", "w2_en": "Neptun",
        "w3_no": "Jorden", "w3_en": "Earth"
    },
    {
        "q_no": "Hva er det hardeste naturlige mineralet på jorden?",
        "q_en": "What is the hardest natural mineral on Earth?",
        "ans_no": "Diamant", "ans_en": "Diamond",
        "w1_no": "Gull", "w1_en": "Gold",
        "w2_no": "Kvarts", "w2_en": "Quartz",
        "w3_no": "Rubin", "w3_en": "Ruby"
    },
    {
        "q_no": "Hvilken gass utgjør omtrent 78% av luften vi puster inn på jorden?",
        "q_en": "Which gas makes up about 78% of the air we breathe on Earth?",
        "ans_no": "Nitrogen", "ans_en": "Nitrogen",
        "w1_no": "Oksygen", "w1_en": "Oxygen",
        "w2_no": "Karbondioksid", "w2_en": "Carbon dioxide",
        "w3_no": "Argon", "w3_en": "Argon"
    },
    {
        "q_no": "Hva er kvadratroten av 144?",
        "q_en": "What is the square root of 144?",
        "ans_no": "12", "ans_en": "12",
        "w1_no": "10", "w1_en": "10",
        "w2_no": "14", "w2_en": "14",
        "w3_no": "16", "w3_en": "16"
    },
    {
        "q_no": "Hva er den kjemiske formelen for vanlig bordsalt?",
        "q_en": "What is the chemical formula for common table salt?",
        "ans_no": "NaCl", "ans_en": "NaCl",
        "w1_no": "H2O", "w1_en": "H2O",
        "w2_no": "CO2", "w2_en": "CO2",
        "w3_no": "KCl", "w3_en": "KCl"
    },
    {
        "q_no": "Hvor mange tenner har et voksent menneske normalt (inkludert visdomstenner)?",
        "q_en": "How many teeth does an adult human normally have (including wisdom teeth)?",
        "ans_no": "32", "ans_en": "32",
        "w1_no": "28", "w1_en": "28",
        "w2_no": "30", "w2_en": "30",
        "w3_no": "36", "w3_en": "36"
    },
    {
        "q_no": "Hva kalles prosessen der planter lager sukker og oksygen ved hjelp av sollys?",
        "q_en": "What is the process where plants make sugar and oxygen using sunlight?",
        "ans_no": "Fotosyntese", "ans_en": "Photosynthesis",
        "w1_no": "Respirasjon", "w1_en": "Respiration",
        "w2_no": "Osmose", "w2_en": "Osmosis",
        "w3_no": "Transpirasjon", "w3_en": "Transpiration"
    },
    {
        "q_no": "Hva er det raskeste landpattedyret i verden?",
        "q_en": "What is the fastest land mammal in the world?",
        "ans_no": "Gepard", "ans_en": "Cheetah",
        "w1_no": "Løve", "w1_en": "Lion",
        "w2_no": "Gaffelantilope", "w2_en": "Pronghorn",
        "w3_no": "Hest", "w3_en": "Horse"
    },
    {
        "q_no": "Hvilken kraft trekker gjenstander ned mot bakken på jorden?",
        "q_en": "Which force pulls objects down to the ground on Earth?",
        "ans_no": "Tyngdekraft", "ans_en": "Gravity",
        "w1_no": "Elektromagnetisme", "w1_en": "Electromagnetism",
        "w2_no": "Sentrifugalkraft", "w2_en": "Centrifugal force",
        "w3_no": "Friksjon", "w3_en": "Friktion"
    },
    {
        "q_no": "Hvor mange minutter bruker sollyset på å nå jorden?",
        "q_en": "How many minutes does sunlight take to reach the Earth?",
        "ans_no": "Ca. 8 minutter", "ans_en": "About 8 minutes",
        "w1_no": "Ca. 8 sekunder", "w1_en": "About 8 seconds",
        "w2_no": "Ca. 8 timer", "w2_en": "About 8 hours",
        "w3_no": "Øyeblikkelig", "w3_en": "Instantly"
    },
    {
        "q_no": "Hvilket organ i menneskekroppen renser blodet og produserer urin?",
        "q_en": "Which organ in the human body filters blood and produces urine?",
        "ans_no": "Nyrene", "ans_en": "Kidneys",
        "w1_no": "Leveren", "w1_en": "Liver",
        "w2_no": "Milten", "w2_en": "Spleen",
        "w3_no": "Hjertet", "w3_en": "Heart"
    },
    {
        "q_no": "Hva er det største pattedyret på jorden?",
        "q_en": "What is the largest mammal on Earth?",
        "ans_no": "Blåhval", "ans_en": "Blue whale",
        "w1_no": "Afrikansk elefant", "w1_en": "African elephant",
        "w2_no": "Finnhval", "w2_en": "Fin whale",
        "w3_no": "Hvalhai", "w3_en": "Whale shark"
    },
    {
        "q_no": "Hvilken planet er nærmest solen?",
        "q_en": "Which planet is closest to the Sun?",
        "ans_no": "Merkur", "ans_en": "Mercury",
        "w1_no": "Venus", "w1_en": "Venus",
        "w2_no": "Mars", "w2_en": "Mars",
        "w3_no": "Jorden", "w3_en": "Earth"
    },
    {
        "q_no": "Hva er vannets kokepunkt i grader Celsius ved normalt atmosfærisk trykk?",
        "q_en": "What is the boiling point of water in degrees Celsius at standard atmospheric pressure?",
        "ans_no": "100", "ans_en": "100",
        "w1_no": "90", "w1_en": "90",
        "w2_no": "120", "w2_en": "120",
        "w3_no": "80", "w3_en": "80"
    },
    {
        "q_no": "Hvor mange bein har en voksen edderkopp normalt?",
        "q_en": "How many legs does an adult spider normally have?",
        "ans_no": "8", "ans_en": "8",
        "w1_no": "6", "w1_en": "6",
        "w2_no": "10", "w2_en": "10",
        "w3_no": "12", "w3_en": "12"
    },
    {
        "q_no": "Hvilken type blodceller hjelper kroppen med å bekjempe infeksjoner?",
        "q_en": "Which type of blood cells helps the body fight infections?",
        "ans_no": "Hvite blodceller", "ans_en": "White blood cells",
        "w1_no": "Røde blodceller", "w1_en": "Red blood cells",
        "w2_no": "Blodplater", "w2_en": "Platelets",
        "w3_no": "Plasma", "w3_en": "Plasma"
    },
    {
        "q_no": "Hvilket kjemisk element har atomnummer 1?",
        "q_en": "Which chemical element has atomic number 1?",
        "ans_no": "Hydrogen", "ans_en": "Hydrogen",
        "w1_no": "Helium", "w1_en": "Helium",
        "w2_no": "Oksygen", "w2_en": "Oxygen",
        "w3_no": "Karbon", "w3_en": "Carbon"
    },
    {
        "q_no": "Hva kalles vitenskapen som studerer stjerner, planeter og verdensrommet?",
        "q_en": "What is the science that studies stars, planets, and space?",
        "ans_no": "Astronomi", "ans_en": "Astronomy",
        "w1_no": "Astrologi", "w1_en": "Astrology",
        "w2_no": "Geologi", "w2_en": "Geology",
        "w3_no": "Meteorologi", "w3_en": "Meteorology"
    },
    {
        "q_no": "Hvilket vitamin produserer kroppen vår når huden utsettes for sollys?",
        "q_en": "Which vitamin does our body produce when the skin is exposed to sunlight?",
        "ans_no": "Vitamin D", "ans_en": "Vitamin D",
        "w1_no": "Vitamin C", "w1_en": "Vitamin C",
        "w2_no": "Vitamin A", "w2_en": "Vitamin A",
        "w3_no": "Vitamin B12", "w3_en": "Vitamin B12"
    },
    {
        "q_no": "Hvilket organ kontrollerer tanker, følelser og nervesystemet i menneskekroppen?",
        "q_en": "Which organ controls thoughts, emotions, and the nervous system in the human body?",
        "ans_no": "Hjernen", "ans_en": "Brain",
        "w1_no": "Hjertet", "w1_en": "Heart",
        "w2_no": "Leveren", "w2_en": "Liver",
        "w3_no": "Ryggmargen", "w3_en": "Spinal cord"
    },
    {
        "q_no": "Hvilken gass puster vi ut som et avfallsprodukt fra celleåndingen?",
        "q_en": "Which gas do we breathe out as a waste product of cell respiration?",
        "ans_no": "Karbondioksid", "ans_en": "Carbon dioxide",
        "w1_no": "Oksygen", "w1_en": "Oxygen",
        "w2_no": "Nitrogen", "w2_en": "Nitrogen",
        "w3_no": "Metan", "w3_en": "Methane"
    },
    {
        "q_no": "Hvor mange farger finnes i en standard regnbue?",
        "q_en": "How many colors are in a standard rainbow?",
        "ans_no": "7", "ans_en": "7",
        "w1_no": "6", "w1_en": "6",
        "w2_no": "8", "w2_en": "8",
        "w3_no": "5", "w3_en": "5"
    },
    {
        "q_no": "Hvilken temperatur representerer absolutt nullpunkt på Celsiusskalaen?",
        "q_en": "What temperature represents absolute zero on the Celsius scale?",
        "ans_no": "-273,15 °C", "ans_en": "-273.15 °C",
        "w1_no": "0 °C", "w1_en": "0 °C",
        "w2_no": "-100 °C", "w2_en": "-100 °C",
        "w3_no": "-459,67 °C", "w3_en": "-459.67 °C"
    },
    {
        "q_no": "Hva er den viktigste energikilden for livet på jorden?",
        "q_en": "What is the primary source of energy for life on Earth?",
        "ans_no": "Solen", "ans_en": "The Sun",
        "w1_no": "Månen", "w1_en": "The Moon",
        "w2_no": "Jordvarme", "w2_en": "Geothermal heat",
        "w3_no": "Fossilt brensel", "w3_en": "Fossil fuels"
    },
    {
        "q_no": "Hvilken planet kalles ofte jordens 'søsterplanet' på grunn av lik størrelse og masse?",
        "q_en": "Which planet is often called Earth's 'sister planet' due to similar size and mass?",
        "ans_no": "Venus", "ans_en": "Venus",
        "w1_no": "Mars", "w1_en": "Mars",
        "w2_no": "Merkur", "w2_en": "Mercury",
        "w3_no": "Saturn", "w3_en": "Saturn"
    },
    {
        "q_no": "Hvilket metall er flytende ved normal romtemperatur?",
        "q_en": "Which metal is liquid at normal room temperature?",
        "ans_no": "Kvikksølv", "ans_en": "Mercury",
        "w1_no": "Bly", "w1_en": "Lead",
        "w2_no": "Gallium", "w2_en": "Gallium",
        "w3_no": "Sølv", "w3_en": "Silver"
    },
    {
        "q_no": "Hvilken type dyr er en flaggermus?",
        "q_en": "What type of animal is a bat?",
        "ans_no": "Pattedyr", "ans_en": "Mammal",
        "w1_no": "Fugl", "w1_en": "Bird",
        "w2_no": "Krypdyr", "w2_en": "Reptile",
        "w3_no": "Amfibium", "w3_en": "Amphibian"
    },
    {
        "q_no": "Hvilket stoff gjør planteblader grønne og absorberer lys under fotosyntesen?",
        "q_en": "Which substance makes plant leaves green and absorbs light during photosynthesis?",
        "ans_no": "Klorofyll", "ans_en": "Chlorophyll",
        "w1_no": "Karoten", "w1_en": "Carotene",
        "w2_no": "Melanin", "w2_en": "Melanin",
        "w3_no": "Xantofyll", "w3_en": "Xanthophyll"
    },
    {
        "q_no": "Hvor mange hjertekamre har et menneskehjerte?",
        "q_en": "How many chambers does a human heart have?",
        "ans_no": "4", "ans_en": "4",
        "w1_no": "2", "w1_en": "2",
        "w2_no": "3", "w2_en": "3",
        "w3_no": "6", "w3_en": "6"
    },
    {
        "q_no": "Hvilket kjemisk symbol har gull?",
        "q_en": "What is the chemical symbol for gold?",
        "ans_no": "Au", "ans_en": "Au",
        "w1_no": "Ag", "w1_en": "Ag",
        "w2_no": "Fe", "w2_en": "Fe",
        "w3_no": "Gd", "w3_en": "Gd"
    },
    {
        "q_no": "Hvilken tidsenhet defineres som tiden det tar jorden å rotere en gang rundt sin egen akse?",
        "q_en": "Which unit of time is defined as the time it takes Earth to rotate once on its axis?",
        "ans_no": "Et døgn", "ans_en": "A day",
        "w1_no": "En time", "w1_en": "An hour",
        "w2_no": "Et år", "w2_en": "A year",
        "w3_no": "En måned", "w3_en": "A month"
    },
    {
        "q_no": "Hvem formulerte relativitetsteorien?",
        "q_en": "Who formulated the theory of relativity?",
        "ans_no": "Albert Einstein", "ans_en": "Albert Einstein",
        "w1_no": "Isaac Newton", "w1_en": "Isaac Newton",
        "w2_no": "Galileo Galilei", "w2_en": "Galileo Galilei",
        "w3_no": "Marie Curie", "w3_en": "Marie Curie"
    },
    {
        "q_no": "Hva er det mest utbredte elementet i hele universet?",
        "q_en": "What is the most abundant element in the universe?",
        "ans_no": "Hydrogen", "ans_en": "Hydrogen",
        "w1_no": "Helium", "w1_en": "Helium",
        "w2_no": "Oksygen", "w2_en": "Oxygen",
        "w3_no": "Karbon", "w3_en": "Carbon"
    },
    {
        "q_no": "Hvilket vitamin er det spesielt mye av i sitrusfrukter som appelsiner og sitroner?",
        "q_en": "Which vitamin is particularly abundant in citrus fruits like oranges and lemons?",
        "ans_no": "Vitamin C", "ans_en": "Vitamin C",
        "w1_no": "Vitamin A", "w1_en": "Vitamin A",
        "w2_no": "Vitamin D", "w2_en": "Vitamin D",
        "w3_no": "Vitamin E", "w3_en": "Vitamin E"
    },
    {
        "q_no": "Hvor mange planeter finnes i vårt solsystem (etter at Pluto ble omdefinert)?",
        "q_en": "How many planets are in our solar system (after Pluto was reclassified)?",
        "ans_no": "8", "ans_en": "8",
        "w1_no": "9", "w1_en": "9",
        "w2_no": "7", "w2_en": "7",
        "w3_no": "10", "w3_en": "10"
    },
    {
        "q_no": "Hva slags type himmellegeme er solen vår?",
        "q_en": "What type of celestial body is our sun?",
        "ans_no": "En stjerne", "ans_en": "A star",
        "w1_no": "En planet", "w1_en": "A planet",
        "w2_no": "En komet", "w2_en": "A comet",
        "w3_no": "En asteroide", "w3_en": "An asteroid"
    },
    {
        "q_no": "Hva heter den største månen til planeten Saturn?",
        "q_en": "What is the name of Saturn's largest moon?",
        "ans_no": "Titan", "ans_en": "Titan",
        "w1_no": "Europa", "w1_en": "Europa",
        "w2_no": "Ganymedes", "w2_en": "Ganymede",
        "w3_no": "Callisto", "w3_en": "Callisto"
    },
    {
        "q_no": "Hvilken type stråling blir stoppet av vanlig menneskehud og papir?",
        "q_en": "Which type of radiation is stopped by normal human skin and paper?",
        "ans_no": "Alfastråling", "ans_en": "Alpha radiation",
        "w1_no": "Betastråling", "w1_en": "Beta radiation",
        "w2_no": "Gammastråling", "w2_en": "Gamma radiation",
        "w3_no": "Røntgenstråling", "w3_en": "X-rays"
    },
    {
        "q_no": "Hva kalles læren om jordskorpen, dens bergarter og utvikling over tid?",
        "q_en": "What is the study of the Earth's crust, its rocks, and development over time?",
        "ans_no": "Geologi", "ans_en": "Geology",
        "w1_no": "Geografi", "w1_en": "Geography",
        "w2_no": "Meteorologi", "w2_en": "Meteorology",
        "w3_no": "Palæontologi", "w3_en": "Paleontology"
    },
    {
        "q_no": "Hva er vannets kjemiske formel?",
        "q_en": "What is the chemical formula for water?",
        "ans_no": "H2O", "ans_en": "H2O",
        "w1_no": "CO2", "w1_en": "CO2",
        "w2_no": "HO2", "w2_en": "HO2",
        "w3_no": "NaCl", "w3_en": "NaCl"
    },
    {
        "q_no": "Hvilket ledddyr har flest par bein per kroppssegment?",
        "q_en": "Which arthropod has the most pairs of legs per body segment?",
        "ans_no": "Tusenbein", "ans_en": "Millipede",
        "w1_no": "Skolopender", "w1_en": "Centipede",
        "w2_no": "Edderkopp", "w2_en": "Spider",
        "w3_no": "Kreps", "w3_en": "Crayfish"
    },
    {
        "q_no": "Hvilken farge har flytende oksygen?",
        "q_en": "What color is liquid oxygen?",
        "ans_no": "Lyseblå", "ans_en": "Pale blue",
        "w1_no": "Fargeløs", "w1_en": "Colorless",
        "w2_no": "Lysegul", "w2_en": "Pale yellow",
        "w3_no": "Rød", "w3_en": "Red"
    },
    {
        "q_no": "Hva kalles det når et stoff går direkte fra fast form til gassform uten å være flytende imellom?",
        "q_en": "What is it called when a substance goes directly from solid to gas without becoming liquid?",
        "ans_no": "Sublimering", "ans_en": "Sublimation",
        "w1_no": "Fordamping", "w1_en": "Evaporation",
        "w2_no": "Kondensering", "w2_en": "Condensation",
        "w3_no": "Smelting", "w3_en": "Melting"
    },
    {
        "q_no": "Hvilket organ i menneskekroppen produserer insulin?",
        "q_en": "Which organ in the human body produces insulin?",
        "ans_no": "Bukspyttkjertelen", "ans_en": "Pancreas",
        "w1_no": "Leveren", "w1_en": "Liver",
        "w2_no": "Milten", "w2_en": "Spleen",
        "w3_no": "Galleblæren", "w3_en": "Gallbladder"
    },
    {
        "q_no": "Hvor mange kromosomer har en normal menneskelig celle (parvise)?",
        "q_en": "How many chromosomes does a normal human cell have (in pairs)?",
        "ans_no": "23 par", "ans_en": "23 pairs",
        "w1_no": "24 par", "w1_en": "24 pairs",
        "w2_no": "22 par", "w2_en": "22 pairs",
        "w3_no": "46 par", "w3_en": "46 pairs"
    },
    {
        "q_no": "Hvilket insekt kan bære opptil 50 ganger sin egen vekt?",
        "q_en": "Which insect can carry up to 50 times its own body weight?",
        "ans_no": "Maur", "ans_en": "Ant",
        "w1_no": "Bie", "w1_en": "Bee",
        "w2_no": "Gresshoppe", "w2_en": "Grasshopper",
        "w3_no": "Bille", "w3_en": "Beetle"
    },
    {
        "q_no": "Hvilken plante regnes som den raskest voksende i verden?",
        "q_en": "Which plant is considered the fastest-growing in the world?",
        "ans_no": "Bambus", "ans_en": "Bamboo",
        "w1_no": "Tare", "w1_en": "Kelp",
        "w2_no": "Eføy", "w2_en": "Ivy",
        "w3_no": "Solsikke", "w3_en": "Sunflower"
    },
    {
        "q_no": "Hva er den kjemiske betegnelsen på rust?",
        "q_en": "What is the chemical term for rust?",
        "ans_no": "Jernoksid", "ans_en": "Iron oxide",
        "w1_no": "Kobberoksid", "w1_en": "Copper oxide",
        "w2_no": "Kalsiumkarbonat", "w2_en": "Calcium carbonate",
        "w3_no": "Natriumkarbonat", "w3_en": "Sodium carbonate"
    },
    {
        "q_no": "Hva er jordens gjennomsnittlige avstand til solen i kilometer?",
        "q_en": "What is the average distance from the Earth to the Sun in kilometers?",
        "ans_no": "Omtrent 150 millioner km", "ans_en": "About 150 million km",
        "w1_no": "Omtrent 150 tusen km", "w1_en": "About 150 thousand km",
        "w2_no": "Omtrent 1,5 milliarder km", "w2_en": "About 1.5 billion km",
        "w3_no": "Omtrent 15 millioner km", "w3_en": "About 15 million km"
    },
    {
        "q_no": "Hva slags bergart dannes når flytende magma eller lava størkner og avkjøles?",
        "q_en": "What type of rock is formed when liquid magma or lava solidifies and cools?",
        "ans_no": "Magmatisk bergart", "ans_en": "Igneous rock",
        "w1_no": "Sedimentær bergart", "w1_en": "Sedimentary rock",
        "w2_no": "Metamorf bergart", "w2_en": "Metamorphic rock",
        "w3_no": "Kalkstein", "w3_en": "Limestone"
    }
]

# --- 5. SPORTS & ENTERTAINMENT FACTS DATASET (50 Facts) ---
sports_entertainment_facts = [
    {
        "q_no": "Hvor mange spillere har et fotballag på banen samtidig under en kamp?",
        "q_en": "How many players does a soccer team have on the field at once during a match?",
        "ans_no": "11", "ans_en": "11",
        "w1_no": "10", "w1_en": "10",
        "w2_no": "12", "w2_en": "12",
        "w3_no": "9", "w3_en": "9"
    },
    {
        "q_no": "Hvor ofte arrangeres de olympiske leker normalt (sommer eller vinter)?",
        "q_en": "How often are the Olympic Games normally held (summer or winter)?",
        "ans_no": "Hvert 4. år", "ans_en": "Every 4 years",
        "w1_no": "Hvert 2. år", "w1_en": "Every 2 years",
        "w2_no": "Hvert år", "w2_en": "Every year",
        "w3_no": "Hvert 5. år", "w3_en": "Every 5 years"
    },
    {
        "q_no": "Hvilken farge har ledertrøyen i sykkelrittet Tour de France?",
        "q_en": "What color is the leader's jersey in the Tour de France bicycle race?",
        "ans_no": "Gul", "ans_en": "Yellow",
        "w1_no": "Grønn", "w1_en": "Green",
        "w2_no": "Rød", "w2_en": "Red",
        "w3_no": "Hvit", "w3_en": "White"
    },
    {
        "q_no": "Hva er den offisielle distansen for et maratonløp i kilometer?",
        "q_en": "What is the official distance of a marathon race in kilometers?",
        "ans_no": "42,195 km", "ans_en": "42.195 km",
        "w1_no": "40,000 km", "w1_en": "40.000 km",
        "w2_no": "45,500 km", "w2_en": "45.500 km",
        "w3_no": "38,250 km", "w3_en": "38.250 km"
    },
    {
        "q_no": "Hvilket land har vunnet flest fotball-VM for menn totalt?",
        "q_en": "Which country has won the most men's FIFA World Cups in total?",
        "ans_no": "Brasil", "ans_en": "Brazil",
        "w1_no": "Tyskland", "w1_en": "Germany",
        "w2_no": "Italia", "w2_en": "Italy",
        "w3_no": "Argentina", "w3_en": "Argentina"
    },
    {
        "q_no": "Hva er maksimal poengsum i en enkelt serie med bowling (en perfekt serie)?",
        "q_en": "What is the maximum score in a single game of bowling (a perfect game)?",
        "ans_no": "300", "ans_en": "300",
        "w1_no": "200", "w1_en": "200",
        "w2_no": "250", "w2_en": "250",
        "w3_no": "400", "w3_en": "400"
    },
    {
        "q_no": "I hvilken sport kan man score en 'home run'?",
        "q_en": "In which sport can you score a 'home run'?",
        "ans_no": "Baseball", "ans_en": "Baseball",
        "w1_no": "Cricket", "w1_en": "Cricket",
        "w2_no": "Amerikansk fotball", "w2_en": "American football",
        "w3_no": "Basketball", "w3_en": "Basketball"
    },
    {
        "q_no": "Hvor mange brikker starter en sjakkspiller med ved starten av et spill?",
        "q_en": "How many pieces does a chess player start with at the beginning of a game?",
        "ans_no": "16", "ans_en": "16",
        "w1_no": "8", "w1_en": "8",
        "w2_no": "12", "w2_en": "12",
        "w3_no": "20", "w3_en": "20"
    },
    {
        "q_no": "Hvor mange hull har en standard golfbane?",
        "q_en": "How many holes does a standard golf course have?",
        "ans_no": "18", "ans_en": "18",
        "w1_no": "9", "w1_en": "9",
        "w2_no": "12", "w2_en": "12",
        "w3_no": "24", "w3_en": "24"
    },
    {
        "q_no": "Hvilken legendarisk idrettsutøver har vunnet flest OL-gullmedaljer i historien?",
        "q_en": "Which legendary athlete has won the most Olympic gold medals in history?",
        "ans_no": "Michael Phelps", "ans_en": "Michael Phelps",
        "w1_no": "Usain Bolt", "w1_en": "Usain Bolt",
        "w2_no": "Larisa Latynina", "w2_en": "Larisa Latynina",
        "w3_no": "Carl Lewis", "w3_en": "Carl Lewis"
    },
    {
        "q_no": "Hvilken karakter spilte Harrison Ford i Star Wars-filmene?",
        "q_en": "Which character did Harrison Ford play in the Star Wars films?",
        "ans_no": "Han Solo", "ans_en": "Han Solo",
        "w1_no": "Luke Skywalker", "w1_en": "Luke Skywalker",
        "w2_no": "Darth Vader", "w2_en": "Darth Vader",
        "w3_no": "Obi-Wan Kenobi", "w3_en": "Obi-Wan Kenobi"
    },
    {
        "q_no": "Hva er navnet på det fiktive landet der historien i Black Panther utspiller seg?",
        "q_en": "What is the name of the fictional country where the Black Panther story is set?",
        "ans_no": "Wakanda", "ans_en": "Wakanda",
        "w1_no": "Zamunda", "w1_en": "Zamunda",
        "w2_no": "El Dorado", "w2_en": "El Dorado",
        "w3_no": "Genovia", "w3_en": "Genovia"
    },
    {
        "q_no": "Hvilken film fra 1997 om en skipsulykke vant 11 Oscar-priser?",
        "q_en": "Which 1997 film about a shipwreck won 11 Oscar awards?",
        "ans_no": "Titanic", "ans_en": "Titanic",
        "w1_no": "Avatar", "w1_en": "Avatar",
        "w2_no": "Ringenes Herre", "w2_en": "Lord of the Rings",
        "w3_no": "Gladiatoren", "w3_en": "Gladiator"
    },
    {
        "q_no": "Hvilken kjent artist spilte rollen som Ally Campana i filmen 'A Star Is Born' (2018)?",
        "q_en": "Which famous artist played the role of Ally Campana in the film 'A Star Is Born' (2018)?",
        "ans_no": "Lady Gaga", "ans_en": "Lady Gaga",
        "w1_no": "Taylor Swift", "w1_en": "Taylor Swift",
        "w2_no": "Beyoncé", "w2_en": "Beyoncé",
        "w3_no": "Rihanna", "w3_en": "Rihanna"
    },
    {
        "q_no": "Hva heter det berømte musikkarrangementet som arrangeres årlig i Storbritannia (verdens største grønne festival)?",
        "q_en": "What is the name of the famous music event held annually in the UK (the world's largest greenfield festival)?",
        "ans_no": "Glastonbury", "ans_en": "Glastonbury",
        "w1_no": "Coachella", "w1_en": "Coachella",
        "w2_no": "Tomorrowland", "w2_en": "Tomorrowland",
        "w3_no": "Roskilde", "w3_en": "Roskilde"
    },
    {
        "q_no": "Hvem regnes som kongen av Popmusikk?",
        "q_en": "Who is considered the King of Pop?",
        "ans_no": "Michael Jackson", "ans_en": "Michael Jackson",
        "w1_no": "Elvis Presley", "w1_en": "Elvis Presley",
        "w2_no": "Prince", "w2_en": "Prince",
        "w3_no": "Freddie Mercury", "w3_en": "Freddie Mercury"
    },
    {
        "q_no": "I hvilken animert filmserie møter vi lekene Woody og Buzz Lightyear?",
        "q_en": "In which animated film series do we meet the toys Woody and Buzz Lightyear?",
        "ans_no": "Toy Story", "ans_en": "Toy Story",
        "w1_no": "Shrek", "w1_en": "Shrek",
        "w2_no": "Istid", "w2_en": "Ice Age",
        "w3_no": "Biler", "w3_en": "Cars"
    },
    {
        "q_no": "Hva heter strømmetjenesten til Apple som blant annet har produsert serien Ted Lasso?",
        "q_en": "What is the name of Apple's streaming service that produced the series Ted Lasso?",
        "ans_no": "Apple TV+", "ans_en": "Apple TV+",
        "w1_no": "Apple Movies", "w1_en": "Apple Movies",
        "w2_no": "Apple Arcade", "w2_en": "Apple Arcade",
        "w3_no": "Apple Streaming", "w3_en": "Apple Streaming"
    },
    {
        "q_no": "Hvilken popgruppe fra Sverige vant Eurovision Song Contest i 1974 med sangen Waterloo?",
        "q_en": "Which Swedish pop group won the Eurovision Song Contest in 1974 with the song Waterloo?",
        "ans_no": "ABBA", "ans_en": "ABBA",
        "w1_no": "Roxette", "w1_en": "Roxette",
        "w2_no": "Ace of Base", "w2_en": "Ace of Base",
        "w3_no": "The Cardigans", "w3_en": "The Cardigans"
    },
    {
        "q_no": "Hvilken film vant den aller første Oscar for beste film i 1929?",
        "q_en": "Which film won the very first Oscar for Best Picture in 1929?",
        "ans_no": "Wings", "ans_en": "Wings",
        "w1_no": "Sunrise", "w1_en": "Sunrise",
        "w2_no": "The Jazz Singer", "w2_en": "The Jazz Singer",
        "w3_no": "Metropolis", "w3_en": "Metropolis"
    },
    {
        "q_no": "Hvor lang er en tennisbane i meter?",
        "q_en": "How long is a tennis court in meters?",
        "ans_no": "23,77 m", "ans_en": "23.77 m",
        "w1_no": "20,50 m", "w1_en": "20.50 m",
        "w2_no": "25,00 m", "w2_en": "25.00 m",
        "w3_no": "22,00 m", "w3_en": "22.00 m"
    },
    {
        "q_no": "Hvilken basketballspiller er allment kjent som 'Air Jordan'?",
        "q_en": "Which basketball player is widely known as 'Air Jordan'?",
        "ans_no": "Michael Jordan", "ans_en": "Michael Jordan",
        "w1_no": "LeBron James", "w1_en": "LeBron James",
        "w2_no": "Kobe Bryant", "w2_en": "Kobe Bryant",
        "w3_no": "Shaquille O'Neal", "w3_en": "Shaquille O'Neal"
    },
    {
        "q_no": "Hvilken fotballklubb spiller sine hjemmekamper på Old Trafford?",
        "q_en": "Which soccer club plays its home games at Old Trafford?",
        "ans_no": "Manchester United", "ans_en": "Manchester United",
        "w1_no": "Liverpool FC", "w1_en": "Liverpool FC",
        "w2_no": "Manchester City", "w2_en": "Manchester City",
        "w3_no": "Arsenal FC", "w3_en": "Arsenal FC"
    },
    {
        "q_no": "Hvor mange røde kuler starter man med i et Snooker-spill?",
        "q_en": "How many red balls do you start with in a game of Snooker?",
        "ans_no": "15", "ans_en": "15",
        "w1_no": "10", "w1_en": "10",
        "w2_no": "21", "w2_en": "21",
        "w3_no": "12", "w3_en": "12"
    },
    {
        "q_no": "Hvilken brettsport ble lagt til i de olympiske leker i Tokyo i 2020?",
        "q_en": "Which board sport was added to the Olympic Games in Tokyo 2020?",
        "ans_no": "Skateboard", "ans_en": "Skateboarding",
        "w1_no": "Snøbrett", "w1_en": "Snowboarding",
        "w2_no": "Wakeboard", "w2_en": "Wakeboarding",
        "w3_no": "Kitesurfing", "w3_en": "Kitesurfing"
    },
    {
        "q_no": "Hvem regnes som den mest suksessfulle Formel 1-føreren (flest seire)?",
        "q_en": "Who is considered the most successful Formula 1 driver (most wins)?",
        "ans_no": "Lewis Hamilton", "ans_en": "Lewis Hamilton",
        "w1_no": "Michael Schumacher", "w1_en": "Michael Schumacher",
        "w2_no": "Ayrton Senna", "w2_en": "Ayrton Senna",
        "w3_no": "Sebastian Vettel", "w3_en": "Sebastian Vettel"
    },
    {
        "q_no": "Hvilken tysk bilprodusent sponser fotballstadionet til FC Bayern München?",
        "q_en": "Which German car manufacturer sponsors the football stadium of FC Bayern Munich?",
        "ans_no": "Audi", "ans_en": "Audi",
        "w1_no": "BMW", "w1_en": "BMW",
        "w2_no": "Mercedes-Benz", "w2_en": "Mercedes-Benz",
        "w3_no": "Porsche", "w3_en": "Porsche"
    },
    {
        "q_no": "Hvilken artist ga ut det banebrytende albumet 'Thriller' i 1982?",
        "q_en": "Which artist released the ground-breaking album 'Thriller' in 1982?",
        "ans_no": "Michael Jackson", "ans_en": "Michael Jackson",
        "w1_no": "Prince", "w1_en": "Prince",
        "w2_no": "Madonna", "w2_en": "Madonna",
        "w3_no": "David Bowie", "w3_en": "David Bowie"
    },
    {
        "q_no": "Hva er navnet på det berømte operahuset i Australia?",
        "q_en": "What is the name of the famous Opera House in Australia?",
        "ans_no": "Sydney Opera House", "ans_en": "Sydney Opera House",
        "w1_no": "Melbourne Opera", "w1_en": "Melbourne Opera",
        "w2_no": "Brisbane House", "w2_en": "Brisbane House",
        "w3_no": "Adelaide Theatre", "w3_en": "Adelaide Theatre"
    },
    {
        "q_no": "Hvem regnes som 'The Queen of Soul'?",
        "q_en": "Who is considered 'The Queen of Soul'?",
        "ans_no": "Aretha Franklin", "ans_en": "Aretha Franklin",
        "w1_no": "Diana Ross", "w1_en": "Diana Ross",
        "w2_no": "Whitney Houston", "w2_en": "Whitney Houston",
        "w3_no": "Tina Turner", "w3_en": "Tina Turner"
    },
    {
        "q_no": "Hva er den eldste tennisturneringen i verden?",
        "q_en": "What is the oldest tennis tournament in the world?",
        "ans_no": "Wimbledon", "ans_en": "Wimbledon",
        "w1_no": "US Open", "w1_en": "US Open",
        "w2_no": "French Open", "w2_en": "French Open",
        "w3_no": "Australian Open", "w3_en": "Australian Open"
    },
    {
        "q_no": "Hvor mange poeng får man for et 'field goal' i amerikansk fotball?",
        "q_en": "How many points do you get for a 'field goal' in American football?",
        "ans_no": "3", "ans_en": "3",
        "w1_no": "6", "w1_en": "6",
        "w2_no": "1", "w2_en": "1",
        "w3_no": "2", "w3_en": "2"
    },
    {
        "q_no": "Hvilken sykkelrytter har vunnet Tour de France 5 ganger på rad (1991-1995)?",
        "q_en": "Which cyclist won the Tour de France 5 times in a row (1991-1995)?",
        "ans_no": "Miguel Indurain", "ans_en": "Miguel Indurain",
        "w1_no": "Eddy Merckx", "w1_en": "Eddy Merckx",
        "w2_no": "Bernard Hinault", "w2_en": "Bernard Hinault",
        "w3_no": "Lance Armstrong", "w3_en": "Lance Armstrong"
    },
    {
        "q_no": "Hvilken sport spilles på en isflate med koster og en tung stein?",
        "q_en": "Which sport is played on ice with brooms and a heavy stone?",
        "ans_no": "Curling", "ans_en": "Curling",
        "w1_no": "Ishockey", "w1_en": "Ice hockey",
        "w2_no": "Bandy", "w2_en": "Bandy",
        "w3_no": "Skøyter", "w3_en": "Ice skating"
    },
    {
        "q_no": "Hvem regnes som tidenes mestvinnende kvinnelige skiløper i vinter-OL?",
        "q_en": "Who is considered the most winning female skier in Winter Olympics history?",
        "ans_no": "Marit Bjørgen", "ans_en": "Marit Bjoergen",
        "w1_no": "Therese Johaug", "w1_en": "Therese Johaug",
        "w2_no": "Charlotte Kalla", "w2_en": "Charlotte Kalla",
        "w3_no": "Justyna Kowalczyk", "w3_en": "Justyna Kowalczyk"
    },
    {
        "q_no": "Hva er tittelen på den mest innbringende filmen i historien (justert for inflasjon)?",
        "q_en": "What is the title of the highest-grossing film in history (adjusted for inflation)?",
        "ans_no": "Tatt av vinden", "ans_en": "Gone with the Wind",
        "w1_no": "Avatar", "w1_en": "Avatar",
        "w2_no": "Star Wars: A New Hope", "w2_en": "Star Wars: A New Hope",
        "w3_no": "Titanic", "w3_en": "Titanic"
    },
    {
        "q_no": "Hvilket år ble strømmetjenesten Netflix grunnlagt?",
        "q_en": "In what year was the streaming service Netflix founded?",
        "ans_no": "1997", "ans_en": "1997",
        "w1_no": "2005", "w1_en": "2005",
        "w2_no": "2010", "w2_en": "2010",
        "w3_no": "1995", "w3_en": "1995"
    },
    {
        "q_no": "Hvilken sang spilt av Luis Fonsi og Daddy Yankee ble en global farsott i 2017?",
        "q_en": "Which song performed by Luis Fonsi and Daddy Yankee became a global hit in 2017?",
        "ans_no": "Despacito", "ans_en": "Despacito",
        "w1_no": "Mi Gente", "w1_en": "Mi Gente",
        "w2_no": "Bailando", "w2_en": "Bailando",
        "w3_no": "Gasolina", "w3_en": "Gasolina"
    },
    {
        "q_no": "Hva heter det kjente spillutviklerstudioet som skapte spillene Grand Theft Auto og Red Dead Redemption?",
        "q_en": "What is the name of the famous game development studio that created the Grand Theft Auto and Red Dead Redemption games?",
        "ans_no": "Rockstar Games", "ans_en": "Rockstar Games",
        "w1_no": "Electronic Arts", "w1_en": "Electronic Arts",
        "w2_no": "Ubisoft", "w2_en": "Ubisoft",
        "w3_no": "Activision Blizzard", "w3_en": "Activision Blizzard"
    },
    {
        "q_no": "Hvilken film regissert av Bong Joon Ho ble den første fremmedspråklige filmen til å vinne Oscar for beste film i 2020?",
        "q_en": "Which film directed by Bong Joon Ho became the first foreign language film to win the Oscar for Best Picture in 2020?",
        "ans_no": "Parasitt", "ans_en": "Parasite",
        "w1_no": "Roma", "w1_en": "Roma",
        "w2_no": "Minari", "w2_en": "Minari",
        "w3_no": "The Artist", "w3_en": "The Artist"
    },
    {
        "q_no": "Hvilken rase er hunden Scooby-Doo?",
        "q_en": "What breed of dog is Scooby-Doo?",
        "ans_no": "Grand danois", "ans_en": "Great Dane",
        "w1_no": "Schæfer", "w1_en": "German Shepherd",
        "w2_no": "Sankt bernhardshund", "w2_en": "Saint Bernard",
        "w3_no": "Mastiff", "w3_en": "Mastiff"
    },
    {
        "q_no": "Hvilken skuespiller ga stemme til Genie i Disneys originale Robin Williams-animerte Aladdin (1992)?",
        "q_en": "Which actor voiced the Genie in Disney's original animated Aladdin (1992)?",
        "ans_no": "Robin Williams", "ans_en": "Robin Williams",
        "w1_no": "Tom Hanks", "w1_en": "Tom Hanks",
        "w2_no": "Will Smith", "w2_en": "Will Smith",
        "w3_no": "Jim Carrey", "w3_en": "Jim Carrey"
    },
    {
        "q_no": "Hvilket instrument spilte Louis Armstrong?",
        "q_en": "Which instrument did Louis Armstrong play?",
        "ans_no": "Trompet", "ans_en": "Trumpet",
        "w1_no": "Saksofon", "w1_en": "Saxophone",
        "w2_no": "Trombone", "w2_en": "Trombone",
        "w3_no": "Klarinett", "w3_en": "Clarinet"
    },
    {
        "q_no": "Hvem er skaperen av tegneserien 'Knøttene' (Peanuts) med Snoopy og Charlie Brown?",
        "q_en": "Who is the creator of the comic strip 'Peanuts' featuring Snoopy and Charlie Brown?",
        "ans_no": "Charles M. Schulz", "ans_en": "Charles M. Schulz",
        "w1_no": "Walt Disney", "w1_en": "Walt Disney",
        "w2_no": "Matt Groening", "w2_en": "Matt Groening",
        "w3_no": "Stan Lee", "w3_en": "Stan Lee"
    },
    {
        "q_no": "Hvilken popstjerne har en lojal tilhengerskare kjent som 'Swifties'?",
        "q_en": "Which pop star has a loyal fanbase known as 'Swifties'?",
        "ans_no": "Taylor Swift", "ans_en": "Taylor Swift",
        "w1_no": "Katy Perry", "w1_en": "Katy Perry",
        "w2_no": "Ariana Grande", "w2_en": "Ariana Grande",
        "w3_no": "Billie Eilish", "w3_en": "Billie Eilish"
    },
    {
        "q_no": "I hvilken by ble OL i 2012 arrangert?",
        "q_en": "In which city were the 2012 Summer Olympics held?",
        "ans_no": "London", "ans_en": "London",
        "w1_no": "Beijing", "w1_en": "Beijing",
        "w2_no": "Rio de Janeiro", "w2_en": "Rio de Janeiro",
        "w3_no": "Athen", "w3_en": "Athens"
    },
    {
        "q_no": "Hva heter den berømte spillkonsollen utgitt av Nintendo i 2017 som kan brukes både håndholdt og stasjonært?",
        "q_en": "What is the name of the famous game console released by Nintendo in 2017 that can be used both handheld and docked?",
        "ans_no": "Nintendo Switch", "ans_en": "Nintendo Switch",
        "w1_no": "Nintendo Wii U", "w1_en": "Nintendo Wii U",
        "w2_no": "Nintendo 3DS", "w2_en": "Nintendo 3DS",
        "w3_no": "Nintendo DS", "w3_en": "Nintendo DS"
    },
    {
        "q_no": "Hvem skrev den episke fantasyromanserien 'En sang om is og ild' (A Song of Ice and Fire) som TV-serien Game of Thrones er basert på?",
        "q_en": "Who wrote the epic fantasy novel series 'A Song of Ice and Fire' upon which the TV series Game of Thrones is based?",
        "ans_no": "George R.R. Martin", "ans_en": "George R.R. Martin",
        "w1_no": "J.R.R. Tolkien", "w1_en": "J.R.R. Tolkien",
        "w2_no": "C.S. Lewis", "w2_en": "C.S. Lewis",
        "w3_no": "Brandon Sanderson", "w3_en": "Brandon Sanderson"
    },
    {
        "q_no": "Hvilken superheltgruppe fra Marvel inkluderer Iron Man, Thor og Captain America?",
        "q_en": "Which Marvel superhero group includes Iron Man, Thor, and Captain America?",
        "ans_no": "The Avengers", "ans_en": "The Avengers",
        "w1_no": "Justice League", "w1_en": "Justice League",
        "w2_no": "X-Men", "w2_en": "X-Men",
        "w3_no": "Fantastic Four", "w3_en": "Fantastic Four"
    },
    {
        "q_no": "Hva heter karakteren Keanu Reeves spiller i John Wick-filmene?",
        "q_en": "What is the name of the character Keanu Reeves plays in the John Wick movies?",
        "ans_no": "John Wick", "ans_en": "John Wick",
        "w1_no": "Neo", "w1_en": "Neo",
        "w2_no": "Jack Traven", "w2_en": "Jack Traven",
        "w3_no": "Ted Logan", "w3_en": "Ted Logan"
    }
]

# --- 6. ARTS & LITERATURE FACTS DATASET (50 Facts) ---
arts_literature_facts = [
    {
        "q_no": "Hvilken norsk kunstner malte det berømte uttrykksfulle verket 'Skrik' i 1893?",
        "q_en": "Which Norwegian artist painted the famous expressive work 'The Scream' in 1893?",
        "ans_no": "Edvard Munch", "ans_en": "Edvard Munch",
        "w1_no": "Christian Krohg", "w1_en": "Christian Krohg",
        "w2_no": "Odd Nerdrum", "w2_en": "Odd Nerdrum",
        "w3_no": "Harald Sohlberg", "w3_en": "Harald Sohlberg"
    },
    {
        "q_no": "Hvilken forfatter skrev det verdenskjente kjærlighetsdramaet 'Romeo og Julie'?",
        "q_en": "Which author wrote the world-famous romantic tragedy 'Romeo and Juliet'?",
        "ans_no": "William Shakespeare", "ans_en": "William Shakespeare",
        "w1_no": "Charles Dickens", "w1_en": "Charles Dickens",
        "w2_no": "Jane Austen", "w2_en": "Jane Austen",
        "w3_no": "Mark Twain", "w3_en": "Mark Twain"
    },
    {
        "q_no": "Hvem er den mektigste guden i gresk mytologi, assosiert med torden og himmel?",
        "q_en": "Who is the most powerful god in Greek mythology, associated with thunder and the sky?",
        "ans_no": "Zeus", "ans_en": "Zeus",
        "w1_no": "Poseidon", "w1_en": "Poseidon",
        "w2_no": "Hades", "w2_en": "Hades",
        "w3_no": "Ares", "w3_en": "Ares"
    },
    {
        "q_no": "Hvilket renessansemaleri av Leonardo da Vinci som henger i Louvre, viser en kvinne med et mystisk smil?",
        "q_en": "Which Renaissance painting by Leonardo da Vinci hanging in the Louvre shows a woman with a mysterious smile?",
        "ans_no": "Mona Lisa", "ans_en": "Mona Lisa",
        "w1_no": "Nattverden", "w1_en": "The Last Supper",
        "w2_no": "Damen med hermelinen", "w2_en": "Lady with an Ermine",
        "w3_no": "Johannes Døperen", "w3_en": "St. John the Baptist"
    },
    {
        "q_no": "Hvem er den norrøne tordenguden som rir over himmelen i en vogn trukket av bukker og svinger hammeren Mjølner?",
        "q_en": "Who is the Norse god of thunder who rides across the sky in a chariot pulled by goats and wields the hammer Mjolnir?",
        "ans_no": "Tor", "ans_en": "Thor",
        "w1_no": "Odin", "w1_en": "Odin",
        "w2_no": "Loke", "w2_en": "Loki",
        "w3_no": "Balder", "w3_en": "Balder"
    },
    {
        "q_no": "Hvilken britisk forfatter skrev fantasysuksessen om trollmannsgutten Harry Potter?",
        "q_en": "Which British author wrote the fantasy success about the wizard boy Harry Potter?",
        "ans_no": "J.K. Rowling", "ans_en": "J.K. Rowling",
        "w1_no": "J.R.R. Tolkien", "w1_en": "J.R.R. Tolkien",
        "w2_no": "C.S. Lewis", "w2_en": "C.S. Lewis",
        "w3_no": "Roald Dahl", "w3_en": "Roald Dahl"
    },
    {
        "q_no": "Hvem er herskeren over underverdenen i gresk mytologi?",
        "q_en": "Who is the ruler of the underworld in Greek mythology?",
        "ans_no": "Hades", "ans_en": "Hades",
        "w1_no": "Zeus", "w1_en": "Zeus",
        "w2_no": "Poseidon", "w2_en": "Poseidon",
        "w3_no": "Hermes", "w3_en": "Hermes"
    },
    {
        "q_no": "Hva er navnet på skipet til den mystiske kaptein Nemo i Jules Vernes klassiker 'En verdensomseiling under havet'?",
        "q_en": "What is the name of Captain Nemo's ship in Jules Verne's classic 'Twenty Thousand Leagues Under the Sea'?",
        "ans_no": "Nautilus", "ans_en": "Nautilus",
        "w1_no": "Pequod", "w1_en": "Pequod",
        "w2_no": "Hispaniola", "w2_en": "Hispaniola",
        "w3_no": "Bounty", "w3_en": "Bounty"
    },
    {
        "q_no": "Hvilken kjent norsk dramatiker skrev det samfunnskritiske skuespillet 'Et dukkehjem' i 1879?",
        "q_en": "Which famous Norwegian playwright wrote the socially critical play 'A Doll's House' in 1879?",
        "ans_no": "Henrik Ibsen", "ans_en": "Henrik Ibsen",
        "w1_no": "Bjørnstjerne Bjørnson", "w1_en": "Bjoernstjerne Bjoernson",
        "w2_no": "Alexander Kielland", "w2_en": "Alexander Kielland",
        "w3_no": "Knut Hamsun", "w3_en": "Knut Hamsun"
    },
    {
        "q_no": "Hvilken renessansekunstner malte det storslåtte taket i Det sixtinske kapell i Vatikanet?",
        "q_en": "Which Renaissance artist painted the grand ceiling of the Sistine Chapel in the Vatican?",
        "ans_no": "Michelangelo", "ans_en": "Michelangelo",
        "w1_no": "Leonardo da Vinci", "w1_en": "Leonardo da Vinci",
        "w2_no": "Rafael", "w2_en": "Raphael",
        "w3_no": "Donatello", "w3_en": "Donatello"
    },
    {
        "q_no": "Hvilket land stammer mytene om gudene Odin, Tor og Loke fra?",
        "q_en": "Which region do the myths about the gods Odin, Thor, and Loki originate from?",
        "ans_no": "Skandinavia", "ans_en": "Scandinavia",
        "w1_no": "Hellas", "w1_en": "Greece",
        "w2_no": "Egypt", "w2_en": "Egypt",
        "w3_no": "Romerriket", "w3_en": "Rome"
    },
    {
        "q_no": "Hvilken nederlandsk post-impresjonistisk kunstner malte 'Stjernenatt' (The Starry Night) og kuttet av deler av sitt eget øre?",
        "q_en": "Which Dutch post-impressionist artist painted 'The Starry Night' and cut off part of his own ear?",
        "ans_no": "Vincent van Gogh", "ans_en": "Vincent van Gogh",
        "w1_no": "Claude Monet", "w1_en": "Claude Monet",
        "w2_no": "Rembrandt", "w2_en": "Rembrandt",
        "w3_no": "Johannes Vermeer", "w3_en": "Johannes Vermeer"
    },
    {
        "q_no": "Hvilken forfatter skrev den episke fantasyserien 'Ringenes Herre' (The Lord of the Rings)?",
        "q_en": "Which author wrote the epic fantasy series 'The Lord of the Rings'?",
        "ans_no": "J.R.R. Tolkien", "ans_en": "J.R.R. Tolkien",
        "w1_no": "C.S. Lewis", "w1_en": "C.S. Lewis",
        "w2_no": "George R.R. Martin", "w2_en": "George R.R. Martin",
        "w3_no": "Terry Pratchett", "w3_en": "Terry Pratchett"
    },
    {
        "q_no": "Hvem er skjønnhets- og kjærlighetsgudinnen i romersk mytologi (tilsvarende greske Afrodite)?",
        "q_en": "Who is the goddess of beauty and love in Roman mythology (corresponding to Greek Aphrodite)?",
        "ans_no": "Venus", "ans_en": "Venus",
        "w1_no": "Juno", "w1_en": "Juno",
        "w2_no": "Diana", "w2_en": "Diana",
        "w3_no": "Minerva", "w3_en": "Minerva"
    },
    {
        "q_no": "Hvilken roman av Herman Melville handler om jakten på den hvite hvalen?",
        "q_en": "Which novel by Herman Melville is about the hunt for the great white whale?",
        "ans_no": "Moby Dick", "ans_en": "Moby Dick",
        "w1_no": "Billy Budd", "w1_en": "Billy Budd",
        "w2_no": "Typee", "w2_en": "Typee",
        "w3_no": "Omoo", "w3_en": "Omoo"
    },
    {
        "q_no": "Hva heter hovedstaden i Dante Alighieris verk 'Den guddommelige komedie' der fortaperen møter Lucifer?",
        "q_en": "What is the name of the central location in Dante Alighieri's 'Divine Comedy' where the lost souls meet Lucifer?",
        "ans_no": "Helvete", "ans_en": "Hell (Inferno)",
        "w1_no": "Skjærsilden", "w1_en": "Purgatory",
        "w2_no": "Paradiset", "w2_en": "Paradise",
        "w3_no": "Underverdenen", "w3_en": "Underworld"
    },
    {
        "q_no": "Hvilken spansk surrealistisk kunstner malte 'Minnets utholdenhet' (med de smeltende klokkene)?",
        "q_en": "Which Spanish surrealist artist painted 'The Persistence of Memory' featuring melting clocks?",
        "ans_no": "Salvador Dalí", "ans_en": "Salvador Dali",
        "w1_no": "Pablo Picasso", "w1_en": "Pablo Picasso",
        "w2_no": "Joan Miró", "w2_en": "Joan Miro",
        "w3_no": "Francisco Goya", "w3_en": "Francisco Goya"
    },
    {
        "q_no": "Hvilken forfatter skrev romanen 'Don Quijote', regnet som den første moderne romanen?",
        "q_en": "Which author wrote the novel 'Don Quixote', considered the first modern novel?",
        "ans_no": "Miguel de Cervantes", "ans_en": "Miguel de Cervantes",
        "w1_no": "Lope de Vega", "w1_en": "Lope de Vega",
        "w2_no": "Federico García Lorca", "w2_en": "Federico Garcia Lorca",
        "w3_no": "Gabriel García Márquez", "w3_en": "Gabriel Garcia Marquez"
    },
    {
        "q_no": "Hvem er den egyptiske guden for sol og skaperverk, ofte avbildet med et falkehode?",
        "q_en": "Who is the Egyptian god of the sun and creation, often depicted with a falcon head?",
        "ans_no": "Ra", "ans_en": "Ra",
        "w1_no": "Osiris", "w1_en": "Osiris",
        "w2_no": "Anubis", "w2_en": "Anubis",
        "w3_no": "Horus", "w3_en": "Horus"
    },
    {
        "q_no": "Hvilken fransk forfatter skrev historiske klassikere som 'De tre musketerer' og 'Greven av Monte Cristo'?",
        "q_en": "Which French author wrote historical classics such as 'The Three Musketeers' and 'The Count of Monte Cristo'?",
        "ans_no": "Alexandre Dumas", "ans_en": "Alexandre Dumas",
        "w1_no": "Victor Hugo", "w1_en": "Victor Hugo",
        "w2_no": "Gustave Flaubert", "w2_en": "Gustave Flaubert",
        "w3_no": "Émile Zola", "w3_en": "Emile Zola"
    },
    {
        "q_no": "Hvilket berømt monument i Agra i India ble reist av keiser Shah Jahan som et mausoleum for hans kone?",
        "q_en": "Which famous monument in Agra, India, was built by Emperor Shah Jahan as a mausoleum for his wife?",
        "ans_no": "Taj Mahal", "ans_en": "Taj Mahal",
        "w1_no": "Gulltempelet", "w1_en": "Golden Temple",
        "w2_no": "Hawa Mahal", "w2_en": "Hawa Mahal",
        "w3_no": "Qutub Minar", "w3_en": "Qutub Minar"
    },
    {
        "q_no": "Hvilken epoke i europeisk kunsthistorie betyr bokstavelig talt 'gjenfødelse'?",
        "q_en": "Which era in European art history literally translates to 'rebirth'?",
        "ans_no": "Renessansen", "ans_en": "The Renaissance",
        "w1_no": "Barokken", "w1_en": "The Baroque",
        "w2_no": "Gotikken", "w2_en": "Gothic",
        "w3_no": "Romantikken", "w3_en": "Romanticism"
    },
    {
        "q_no": "Hva heter den berømte bronseskulpturen av Auguste Rodin som viser en mann i dype tanker?",
        "q_en": "What is the name of the famous bronze sculpture by Auguste Rodin showing a man in deep thought?",
        "ans_no": "Tenkeren", "ans_en": "The Thinker",
        "w1_no": "Kysset", "w1_en": "The Kiss",
        "w2_no": "Helvetesporten", "w2_en": "The Gates of Hell",
        "w3_no": "Borgerne fra Calais", "w3_en": "The Burghers of Calais"
    },
    {
        "q_no": "Hvem er visdoms- og krigsgudinnen i gresk mytologi, som ga navn til en stor gresk by?",
        "q_en": "Who is the goddess of wisdom and war in Greek mythology, who gave her name to a major Greek city?",
        "ans_no": "Athene", "ans_en": "Athena",
        "w1_no": "Artemis", "w1_en": "Artemis",
        "w2_no": "Hera", "w2_en": "Hera",
        "w3_no": "Afrodite", "w3_en": "Aphrodite"
    },
    {
        "q_no": "Hvilken berømt roman av Mary Shelley regnes som et av de tidligste verkene innen science fiction?",
        "q_en": "Which famous novel by Mary Shelley is considered one of the earliest works of science fiction?",
        "ans_no": "Frankenstein", "ans_en": "Frankenstein",
        "w1_no": "Dracula", "w1_en": "Dracula",
        "w2_no": "Jekyll og Hyde", "w2_en": "Jekyll and Hyde",
        "w3_no": "Den usynlige mann", "w3_en": "The Invisible Man"
    },
    {
        "q_no": "Hva het den trojanske prinsen som utløste trojakrigen ved å bortføre Helena?",
        "q_en": "What was the name of the Trojan prince who triggered the Trojan War by abducting Helen?",
        "ans_no": "Paris", "ans_en": "Paris",
        "w1_no": "Hektor", "w1_en": "Hector",
        "w2_no": "Akilles", "w2_en": "Achilles",
        "w3_no": "Agamemnon", "w3_en": "Agamemnon"
    },
    {
        "q_no": "Hvilken forfatter skrev 'Sagaen om isfolket'?",
        "q_en": "Which author wrote the novel series 'The Legend of the Ice People'?",
        "ans_no": "Margit Sandemo", "ans_en": "Margit Sandemo",
        "w1_no": "Knut Hamsun", "w1_en": "Knut Hamsun",
        "w2_no": "Jo Nesbø", "w2_en": "Jo Nesbo",
        "w3_no": "Anne-Cath. Vestly", "w3_en": "Anne-Cath. Vestly"
    },
    {
        "q_no": "Hvilket instrument var Wolfgang Amadeus Mozart spesielt kjent for å mestre allerede som barn?",
        "q_en": "Which instrument was Wolfgang Amadeus Mozart famous for mastering as a child prodigy?",
        "ans_no": "Klaver/Klavér", "ans_en": "Harpsichord/Piano",
        "w1_no": "Fiolin", "w1_en": "Violin",
        "w2_no": "Fløyte", "w2_en": "Flute",
        "w3_no": "Cello", "w3_en": "Cello"
    },
    {
        "q_no": "Hva er navnet på Odins åttebente hest i norrøn mytologi?",
        "q_en": "What is the name of Odin's eight-legged horse in Norse mythology?",
        "ans_no": "Sleipner", "ans_en": "Sleipnir",
        "w1_no": "Skinfakse", "w1_en": "Skinfaxi",
        "w2_no": "Gullfakse", "w2_en": "Gullfaxi",
        "w3_no": "Alsvinn", "w3_en": "Alsvid"
    },
    {
        "q_no": "Hvilken tysk komponist fortsatte å skape storslått musikk selv etter at han ble helt døv?",
        "q_en": "Which German composer continued to create grand music even after becoming completely deaf?",
        "ans_no": "Ludwig van Beethoven", "ans_en": "Ludwig van Beethoven",
        "w1_no": "Johann Sebastian Bach", "w1_en": "Johann Sebastian Bach",
        "w2_no": "Richard Wagner", "w2_en": "Richard Wagner",
        "w3_no": "Johannes Brahms", "w3_en": "Johannes Brahms"
    },
    {
        "q_no": "Hva heter Arthur-legendens berømte sverd, som han trakk ut av en stein?",
        "q_en": "What is the name of King Arthur's famous sword, which he pulled from a stone?",
        "ans_no": "Excalibur", "ans_en": "Excalibur",
        "w1_no": "Mjolnir", "w1_en": "Mjolnir",
        "w2_no": "Durandal", "w2_en": "Durandal",
        "w3_no": "Gram", "w3_en": "Gram"
    },
    {
        "q_no": "Hvilken russisk forfatter skrev gigantverkene 'Krig og fred' og 'Anna Karenina'?",
        "q_en": "Which Russian author wrote the giant novels 'War and Peace' and 'Anna Karenina'?",
        "ans_no": "Leo Tolstoj", "ans_en": "Leo Tolstoy",
        "w1_no": "Fjodor Dostojevskij", "w1_en": "Fyodor Dostoevsky",
        "w2_no": "Anton Tsjekhov", "w2_en": "Anton Chekhov",
        "w3_no": "Aleksandr Pusjkin", "w3_en": "Alexander Pushkin"
    },
    {
        "q_no": "Hvem er den romerske guden for krig (tilsvarende greske Ares)?",
        "q_en": "Who is the Roman god of war (corresponding to Greek Ares)?",
        "ans_no": "Mars", "ans_en": "Mars",
        "w1_no": "Jupiter", "w1_en": "Jupiter",
        "w2_no": "Mercur", "w2_en": "Mercury",
        "w3_no": "Vulkan", "w3_en": "Vulcan"
    },
    {
        "q_no": "Hvilken fransk impresjonistisk maler er kjent for sine mange bilder av vannliljer i hans egen hage i Giverny?",
        "q_en": "Which French impressionist painter is famous for his many depictions of water lilies in his garden at Giverny?",
        "ans_no": "Claude Monet", "ans_en": "Claude Monet",
        "w1_no": "Pierre-Auguste Renoir", "w1_en": "Pierre-Auguste Renoir",
        "w2_no": "Edgar Degas", "w2_en": "Edgar Degas",
        "w3_no": "Paul Cézanne", "w3_en": "Paul Cezanne"
    },
    {
        "q_no": "Hvilken forfatter skrev romanen '1984' som advarte mot totalitær overvåking?",
        "q_en": "Which author wrote the novel '1984' warning against totalitarian surveillance?",
        "ans_no": "George Orwell", "ans_en": "George Orwell",
        "w1_no": "Aldous Huxley", "w1_en": "Aldous Huxley",
        "w2_no": "Ray Bradbury", "w2_en": "Ray Bradbury",
        "w3_no": "H.G. Wells", "w3_en": "H.G. Wells"
    },
    {
        "q_no": "Hva var navnet på Odins raver som fløy over verden for å samle informasjon?",
        "q_en": "What were the names of Odin's ravens that flew across the world to gather information?",
        "ans_no": "Hugin og Munin", "ans_en": "Hugin and Munin",
        "w1_no": "Gere og Freke", "w1_en": "Geri and Freki",
        "w2_no": "Hugin og Lodin", "w2_en": "Hugin and Lodin",
        "w3_no": "Munin og Torin", "w3_en": "Munin and Torin"
    },
    {
        "q_no": "Hvilken spansk kubistisk maler skapte det monumentale antikrigs-maleriet 'Guernica' i 1937?",
        "q_en": "Which Spanish cubist painter created the monumental anti-war painting 'Guernica' in 1937?",
        "ans_no": "Pablo Picasso", "ans_en": "Pablo Picasso",
        "w1_no": "Salvador Dalí", "w1_en": "Salvador Dali",
        "w2_no": "Joan Miró", "w2_en": "Joan Miro",
        "w3_no": "Juan Gris", "w3_en": "Juan Gris"
    },
    {
        "q_no": "Hvilken amerikansk forfatter regnes som mesteren av detektiv- og skrekklitteratur og skrev 'Ravnen' (The Raven)?",
        "q_en": "Which American author is considered the master of detective and horror fiction and wrote 'The Raven'?",
        "ans_no": "Edgar Allan Poe", "ans_en": "Edgar Allan Poe",
        "w1_no": "Nathaniel Hawthorne", "w1_en": "Nathaniel Hawthorne",
        "w2_no": "Herman Melville", "w2_en": "Herman Melville",
        "w3_no": "Washington Irving", "w3_en": "Washington Irving"
    },
    {
        "q_no": "Hva er navnet på kjempenes rike i norrøn mytologi?",
        "q_en": "What is the name of the realm of giants in Norse mythology?",
        "ans_no": "Jotunheimen", "ans_en": "Jotunheim",
        "w1_no": "Midgard", "w1_en": "Midgard",
        "w2_no": "Åsgard", "w2_en": "Asgard",
        "w3_no": "Utgard", "w3_en": "Utgard"
    },
    {
        "q_no": "Hvilken tysk dikter og vitenskapsmann skrev det verdenskjente dramaet 'Faust'?",
        "q_en": "Which German poet and scientist wrote the world-famous tragedy 'Faust'?",
        "ans_no": "Johann Wolfgang von Goethe", "ans_en": "Johann Wolfgang von Goethe",
        "w1_no": "Friedrich Schiller", "w1_en": "Friedrich Schiller",
        "w2_no": "Heinrich Heine", "w2_en": "Heinrich Heine",
        "w3_no": "Thomas Mann", "w3_en": "Thomas Mann"
    },
    {
        "q_no": "Hvem skrev romanen 'Jorden rundt på 80 dager'?",
        "q_en": "Who wrote the novel 'Around the World in Eighty Days'?",
        "ans_no": "Jules Verne", "ans_en": "Jules Verne",
        "w1_no": "H.G. Wells", "w1_en": "H.G. Wells",
        "w2_no": "Charles Dickens", "w2_en": "Charles Dickens",
        "w3_no": "Mark Twain", "w3_en": "Mark Twain"
    },
    {
        "q_no": "Hvilken forfatter skrev grøsseren 'Dracula' fra 1897?",
        "q_en": "Which author wrote the 1897 gothic horror novel 'Dracula'?",
        "ans_no": "Bram Stoker", "ans_en": "Bram Stoker",
        "w1_no": "Mary Shelley", "w1_en": "Mary Shelley",
        "w2_no": "Edgar Allan Poe", "w2_en": "Edgar Allan Poe",
        "w3_no": "H.P. Lovecraft", "w3_en": "H.P. Lovecraft"
    },
    {
        "q_no": "Hvem er den greske gudinnen for kjærlighet og skjønnhet?",
        "q_en": "Who is the Greek goddess of love and beauty?",
        "ans_no": "Afrodite", "ans_en": "Aphrodite",
        "w1_no": "Hera", "w1_en": "Hera",
        "w2_no": "Athene", "w2_en": "Athena",
        "w3_no": "Artemis", "w3_en": "Artemis"
    },
    {
        "q_no": "Hvem skrev boken 'Den lille prinsen'?",
        "q_en": "Who wrote the book 'The Little Prince'?",
        "ans_no": "Antoine de Saint-Exupéry", "ans_en": "Antoine de Saint-Exupery",
        "w1_no": "Albert Camus", "w1_en": "Albert Camus",
        "w2_no": "Victor Hugo", "w2_en": "Victor Hugo",
        "w3_no": "Jules Verne", "w3_en": "Jules Verne"
    },
    {
        "q_no": "Hvilken tysk dikter skrev diktet 'Ode til gleden' (Ode an die Freude), brukt i Beethovens 9. symfoni?",
        "q_en": "Which German poet wrote the poem 'Ode to Joy', used in Beethoven's 9th Symphony?",
        "ans_no": "Friedrich Schiller", "ans_en": "Friedrich Schiller",
        "w1_no": "Johann Wolfgang von Goethe", "w1_en": "Johann Wolfgang von Goethe",
        "w2_no": "Heinrich Heine", "w2_en": "Heinrich Heine",
        "w3_no": "Thomas Mann", "w3_en": "Thomas Mann"
    },
    {
        "q_no": "Hvem malte det kjente kunstverket 'Pike med perleøredobb'?",
        "q_en": "Who painted the famous artwork 'Girl with a Pearl Earring'?",
        "ans_no": "Johannes Vermeer", "ans_en": "Johannes Vermeer",
        "w1_no": "Rembrandt", "w1_en": "Rembrandt",
        "w2_no": "Vincent van Gogh", "w2_en": "Vincent van Gogh",
        "w3_no": "Claude Monet", "w3_en": "Claude Monet"
    },
    {
        "q_no": "Hva heter den norrøne guden for fruktbarhet, fred og solskinn, som er bror til Frøya?",
        "q_en": "What is the name of the Norse god of fertility, peace, and sunshine, who is the brother of Freya?",
        "ans_no": "Frøy", "ans_en": "Freyr",
        "w1_no": "Balder", "w1_en": "Balder",
        "w2_no": "Heimdall", "w2_en": "Heimdall",
        "w3_no": "Njord", "w3_en": "Njord"
    },
    {
        "q_no": "Hvem skrev de klassiske eposene 'Odysseen' og 'Iliaden'?",
        "q_en": "Who wrote the classic epic poems 'Odyssey' and 'Iliad'?",
        "ans_no": "Homer", "ans_en": "Homer",
        "w1_no": "Virgil", "w1_en": "Virgil",
        "w2_no": "Sofokles", "w2_en": "Sophocles",
        "w3_no": "Platon", "w3_en": "Plato"
    },
    {
        "q_no": "Hvilken fransk skulptør laget den berømte skulpturen 'Frihetsgudinnen' (gitt til USA)?",
        "q_en": "Which French sculptor designed the famous Statue of Liberty (given to the US)?",
        "ans_no": "Frédéric-Auguste Bartholdi", "ans_en": "Frederic-Auguste Bartholdi",
        "w1_no": "Auguste Rodin", "w1_en": "Auguste Rodin",
        "w2_no": "Edgar Degas", "w2_en": "Edgar Degas",
        "w3_no": "Gustav Vigeland", "w3_en": "Gustav Vigeland"
    },
    {
        "q_no": "Hvem er visdomsgudinnen i romersk mytologi (tilsvarende gresk Athena)?",
        "q_en": "Who is the goddess of wisdom in Roman mythology (corresponding to Greek Athena)?",
        "ans_no": "Minerva", "ans_en": "Minerva",
        "w1_no": "Diana", "w1_en": "Diana",
        "w2_no": "Juno", "w2_en": "Juno",
        "w3_no": "Vesta", "w3_en": "Vesta"
    }
]

# --- 7. HELPER TO GENERATE QUESTIONS ---

questions_seed = []

# Filter Helper: get random items except the correct one
def get_random_choices(full_list, correct_val, key, count=3):
    pool = [item[key] for item in full_list if item[key] != correct_val]
    return random.sample(pool, count)

# 1. QUIZ 1: [NO] Geografi & Landegrenser (Lett)
# 50 questions from geography dataset in Norwegian
q1_questions = []
for idx, item in enumerate(geography_countries):
    # Capital question
    wrong = get_random_choices(geography_countries, item["capital_no"], "capital_no", 3)
    options = [item["capital_no"]] + wrong
    random.shuffle(options)
    
    q1_questions.append({
        "text": f"Hva er hovedstaden i {item['name_no']}?",
        "type": "multiple-choice",
        "options": options,
        "ans": item["capital_no"],
        "pts": 10,
        "idx": idx,
        "timer": 20,
        "scale": 10
    })

# 2. QUIZ 2: [NO] Historiske Begivenheter (Medium)
# 50 questions from history dataset in Norwegian
q2_questions = []
for idx, item in enumerate(history_events):
    correct_year = item["year"]
    # Generate 3 logical wrong years
    wrong = [correct_year - 10, correct_year + 5, correct_year + 20]
    # Check for duplicate choices
    while len(set([correct_year] + wrong)) < 4:
        wrong = [correct_year + random.randint(-40, 40) for _ in range(3)]
    options = [str(correct_year)] + [str(y) for y in wrong]
    random.shuffle(options)
    
    q2_questions.append({
        "text": f"I hvilket år {item['desc_no']}?",
        "type": "multiple-choice",
        "options": options,
        "ans": str(correct_year),
        "pts": 15,
        "idx": idx,
        "timer": 30,
        "scale": 10
    })

# 3. QUIZ 3: [NO] Naturvitenskap & Kjemi (Vanskelig)
# 50 questions: 25 chemistry element symbol questions + 25 general science questions in Norwegian
q3_questions = []
# 25 Chemistry (first 25 elements)
for idx in range(25):
    item = chemistry_elements[idx]
    wrong = get_random_choices(chemistry_elements, item["symbol"], "symbol", 3)
    options = [item["symbol"]] + wrong
    random.shuffle(options)
    
    q3_questions.append({
        "text": f"Hva er det kjemiske symbolet for grunnstoffet {item['name_no']}?",
        "type": "multiple-choice",
        "options": options,
        "ans": item["symbol"],
        "pts": 20,
        "idx": idx,
        "timer": 20,
        "scale": 10
    })
# 25 Science facts (first 25 facts)
for idx in range(25):
    item = science_facts[idx]
    options = [item["ans_no"], item["w1_no"], item["w2_no"], item["w3_no"]]
    random.shuffle(options)
    
    q3_questions.append({
        "text": item["q_no"],
        "type": "multiple-choice",
        "options": options,
        "ans": item["ans_no"],
        "pts": 20,
        "idx": 25 + idx,
        "timer": 30,
        "scale": 10
    })

# 4. QUIZ 4: [NO] Sport & Underholdning (Medium)
# 50 questions: 25 sports/entertainment questions (first 25) in Norwegian
q4_questions = []
for idx in range(50):
    item = sports_entertainment_facts[idx]
    options = [item["ans_no"], item["w1_no"], item["w2_no"], item["w3_no"]]
    random.shuffle(options)
    
    q4_questions.append({
        "text": item["q_no"],
        "type": "multiple-choice",
        "options": options,
        "ans": item["ans_no"],
        "pts": 15,
        "idx": idx,
        "timer": 25,
        "scale": 10
    })

# 5. QUIZ 5: [NO] Kunst, Litteratur & Mytologi (Vanskelig)
# 50 questions: 50 arts & literature questions in Norwegian
q5_questions = []
for idx in range(50):
    item = arts_literature_facts[idx]
    options = [item["ans_no"], item["w1_no"], item["w2_no"], item["w3_no"]]
    random.shuffle(options)
    
    q5_questions.append({
        "text": item["q_no"],
        "type": "multiple-choice",
        "options": options,
        "ans": item["ans_no"],
        "pts": 20,
        "idx": idx,
        "timer": 30,
        "scale": 10
    })

# 6. QUIZ 6: [EN] World Geography (Easy)
# 50 questions from geography dataset in English
q6_questions = []
for idx, item in enumerate(geography_countries):
    wrong = get_random_choices(geography_countries, item["capital_en"], "capital_en", 3)
    options = [item["capital_en"]] + wrong
    random.shuffle(options)
    
    q6_questions.append({
        "text": f"What is the capital city of {item['name_en']}?",
        "type": "multiple-choice",
        "options": options,
        "ans": item["capital_en"],
        "pts": 10,
        "idx": idx,
        "timer": 20,
        "scale": 10
    })

# 7. QUIZ 7: [EN] History & Milestones (Medium)
# 50 questions from history dataset in English
q7_questions = []
for idx, item in enumerate(history_events):
    correct_year = item["year"]
    wrong = [correct_year - 10, correct_year + 5, correct_year + 20]
    while len(set([correct_year] + wrong)) < 4:
        wrong = [correct_year + random.randint(-40, 40) for _ in range(3)]
    options = [str(correct_year)] + [str(y) for y in wrong]
    random.shuffle(options)
    
    q7_questions.append({
        "text": f"In which year {item['desc_en']}?",
        "type": "multiple-choice",
        "options": options,
        "ans": str(correct_year),
        "pts": 15,
        "idx": idx,
        "timer": 30,
        "scale": 10
    })

# 8. QUIZ 8: [EN] Science & Chemistry (Hard)
# 50 questions: 25 chemistry element symbols + 25 science facts in English
q8_questions = []
# 25 Chemistry (remaining 25 elements, idx 25-49)
for idx in range(25):
    item = chemistry_elements[25 + idx]
    wrong = get_random_choices(chemistry_elements, item["symbol"], "symbol", 3)
    options = [item["symbol"]] + wrong
    random.shuffle(options)
    
    q8_questions.append({
        "text": f"What is the chemical symbol for the element {item['name_en']}?",
        "type": "multiple-choice",
        "options": options,
        "ans": item["symbol"],
        "pts": 20,
        "idx": idx,
        "timer": 20,
        "scale": 10
    })
# 25 Science facts (remaining 25 science facts, idx 25-49)
for idx in range(25):
    item = science_facts[25 + idx]
    options = [item["ans_en"], item["w1_en"], item["w2_en"], item["w3_en"]]
    random.shuffle(options)
    
    q8_questions.append({
        "text": item["q_en"],
        "type": "multiple-choice",
        "options": options,
        "ans": item["ans_en"],
        "pts": 20,
        "idx": 25 + idx,
        "timer": 30,
        "scale": 10
    })

# 9. QUIZ 9: [EN] Sports & Entertainment (Medium)
# 50 questions from sports/entertainment dataset in English
q9_questions = []
for idx in range(50):
    item = sports_entertainment_facts[idx]
    options = [item["ans_en"], item["w1_en"], item["w2_en"], item["w3_en"]]
    random.shuffle(options)
    
    q9_questions.append({
        "text": item["q_en"],
        "type": "multiple-choice",
        "options": options,
        "ans": item["ans_en"],
        "pts": 15,
        "idx": idx,
        "timer": 25,
        "scale": 10
    })

# 10. QUIZ 10: [EN] Arts, Literature & Mythology (Hard)
# 50 questions from arts/literature dataset in English
q10_questions = []
for idx in range(50):
    item = arts_literature_facts[idx]
    options = [item["ans_en"], item["w1_en"], item["w2_en"], item["w3_en"]]
    random.shuffle(options)
    
    q10_questions.append({
        "text": item["q_en"],
        "type": "multiple-choice",
        "options": options,
        "ans": item["ans_en"],
        "pts": 20,
        "idx": idx,
        "timer": 30,
        "scale": 10
    })

# Assemble Quizzes package
quizzes_seed = [
    {
        "title": "[NO] Geografi & Landegrenser (Lett)",
        "description": "En lett geografiquiz om hovedsteder i 50 forskjellige land rundt om i verden.",
        "questions": q1_questions
    },
    {
        "title": "[NO] Historiske Begivenheter (Medium)",
        "description": "Test din historiske kunnskap om viktige nasjonale og internasjonale milepæler gjennom tidene.",
        "questions": q2_questions
    },
    {
        "title": "[NO] Naturvitenskap & Kjemi (Vanskelig)",
        "description": "En utfordrende vitenskapsquiz som dekker kjemiske symboler, fysikk og menneskekroppens anatomi.",
        "questions": q3_questions
    },
    {
        "title": "[NO] Sport & Underholdning (Medium)",
        "description": "Morsomme trivia-spørsmål om populær musikk, filmer, OL, fotballregler og klassiske spill.",
        "questions": q4_questions
    },
    {
        "title": "[NO] Kunst, Litteratur & Mytologi (Vanskelig)",
        "description": "Test dine kunnskaper om kjente malerier, forfattere og guder i gresk, romersk og norrøn mytologi.",
        "questions": q5_questions
    },
    {
        "title": "[EN] World Geography (Easy)",
        "description": "An easy-level geography quiz exploring capital cities of 50 different countries worldwide.",
        "questions": q6_questions
    },
    {
        "title": "[EN] History & Milestones (Medium)",
        "description": "Test your historical knowledge on critical global events, wars, discoveries, and treaties.",
        "questions": q7_questions
    },
    {
        "title": "[EN] Science & Chemistry (Hard)",
        "description": "A demanding science quiz exploring chemical element symbols, astronomy, and biology facts.",
        "questions": q8_questions
    },
    {
        "title": "[EN] Sports & Entertainment (Medium)",
        "description": "Fun trivia queries regarding sports records, Oscar wins, classic movies, and legendary music.",
        "questions": q9_questions
    },
    {
        "title": "[EN] Arts, Literature & Mythology (Hard)",
        "description": "Explore questions regarding masterpiece paintings, classic novelists, and mythological tales.",
        "questions": q10_questions
    }
]

# Write to JSON file
with open("api/questions_seed.json", "w", encoding="utf-8") as f:
    json.dump(quizzes_seed, f, ensure_ascii=False, indent=2)

print("Successfully generated 10 quizzes and 500 questions in api/questions_seed.json")
