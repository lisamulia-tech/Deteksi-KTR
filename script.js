// ===== VARIABLES =====
let map;
let markers = [];
let heatmapLayer = null;
let currentFilter = 'all';
let currentTimeFilter = 'all';
let violationData = [];
let bandaSaktiBoundary = null;
let boundaryLayer = null;
// File foto disimpan hanya saat klik simpan

// DOM Elements
const form = document.getElementById('violationForm');
const locationInput = document.getElementById('locationName');
const autoCategory = document.getElementById('autoCategory');
const photoInput = document.getElementById('photo');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const photoPreview = document.getElementById('photoPreview');
const predictionResult = document.getElementById('predictionResult');
const clearFormBtn = document.getElementById('clearFormBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const heatmapToggle = document.getElementById('heatmapToggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const segmentButtons = document.querySelectorAll('.segment');
const timeChipButtons = document.querySelectorAll('.time-chip');
const confirmModal = document.getElementById('confirmModal');
const confirmMessage = document.getElementById('confirmMessage');
const cancelConfirm = document.getElementById('cancelConfirm');
const confirmAction = document.getElementById('confirmAction');

// Category icons
const categoryIcons = {
    patuh: 'fa-check-circle',
    ringan: 'fa-exclamation-triangle',
    berat: 'fa-times-circle'
};

// Category labels
const categoryLabels = {
    patuh: '✅ Patuh',
    ringan: '⚠️ Pelanggaran Ringan',
    berat: '🔴 Pelanggaran Berat'
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    loadData();
    setupEventListeners();
});

// ===== MAP INITIALIZATION =====
function initMap() {
    // Initialize map centered on Indonesia (Jakarta)
    map = L.map('map', {
        center: [-6.2088, 106.8456],
        zoom: 13,
        zoomControl: true
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Add map click event
    map.on('click', function(e) {
        latitudeInput.value = e.latlng.lat.toFixed(6);
        longitudeInput.value = e.latlng.lng.toFixed(6);

        const inside = isInBandaSakti(e.latlng.lat, e.latlng.lng);
        updateCoordFieldStyle(inside);
        if (inside) {
            showToast('Lokasi berhasil dipilih!', 'success');
        } else {
            showToast('Lokasi tidak berada di dalam wilayah Banda Sakti!', 'error');
        }
    });

    // Load Banda Sakti boundary
    loadBoundary();

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                map.setView([position.coords.latitude, position.coords.longitude], 15);
            },
            function(error) {
                console.log('Could not get user location:', error);
            }
        );
    }
}

// ===== BOUNDARY CHECKING =====
const BANDA_SAKTI_RING = [[97.1113625,5.2023141],[97.1114764,5.2024376],[97.1131919,5.204298],[97.113631,5.2045814],[97.1139318,5.2052697],[97.1137773,5.2062333],[97.1128504,5.2093993],[97.11233,5.2105816],[97.112517,5.2114399],[97.1143546,5.2133427],[97.1153629,5.2149946],[97.1160865,5.2157638],[97.1178961,5.2165878],[97.1180168,5.2162593],[97.1165362,5.2156008],[97.1163417,5.2154286],[97.1162586,5.215303],[97.116213,5.2151534],[97.1162079,5.2150263],[97.1162505,5.2146967],[97.1165121,5.2134159],[97.1165563,5.2133277],[97.1166368,5.2132316],[97.1169305,5.2129097],[97.1173033,5.2125571],[97.11788,5.2121257],[97.1185425,5.2116797],[97.1188201,5.2115301],[97.1192278,5.2113431],[97.1197602,5.2110786],[97.1207955,5.2105391],[97.1214366,5.2101705],[97.1220615,5.2098366],[97.1228179,5.209504],[97.1230794,5.2094039],[97.1235663,5.2092049],[97.1239538,5.2090473],[97.1244232,5.2088336],[97.1248497,5.2086466],[97.1253124,5.2084182],[97.1257898,5.2081912],[97.1263759,5.2079254],[97.1270666,5.2076316],[97.1275198,5.2074432],[97.1280523,5.2072162],[97.1287939,5.2068743],[97.1295395,5.2065244],[97.1300264,5.2062679],[97.1311623,5.2056696],[97.1319307,5.2052729],[97.1328239,5.2048335],[97.1340121,5.2043193],[97.1344748,5.2040869],[97.1347502,5.2039522],[97.1358481,5.2034245],[97.1361861,5.2032482],[97.1365415,5.2030465],[97.1370122,5.2028141],[97.1372817,5.2026579],[97.1374802,5.202533],[97.1376666,5.2024282],[97.1379872,5.2022612],[97.138356,5.2020609],[97.1388361,5.2017711],[97.1396877,5.2012609],[97.1402979,5.2008629],[97.140656,5.2006104],[97.1412997,5.2001256],[97.1415357,5.199984],[97.1418858,5.1998057],[97.141922,5.1997837],[97.1421392,5.1996328],[97.1422445,5.1995486],[97.14228,5.1995166],[97.1424028,5.1994024],[97.1425945,5.1992388],[97.1426231,5.1992143],[97.142797,5.1990658],[97.1429271,5.198953],[97.1429593,5.1989259],[97.1432812,5.1986411],[97.1433087,5.1986062],[97.1433388,5.1985697],[97.1434341,5.1984795],[97.1434884,5.1984328],[97.1435279,5.1984014],[97.1435963,5.1983479],[97.1436131,5.1983192],[97.1436111,5.1982705],[97.1436104,5.1982131],[97.1436211,5.1981683],[97.1436553,5.1981196],[97.1437009,5.1980708],[97.1438371,5.1979539],[97.1440583,5.197779],[97.1444137,5.1974611],[97.144753,5.1971633],[97.1449703,5.1969583],[97.1450018,5.1969205],[97.1451768,5.1967586],[97.1452291,5.1967112],[97.1452848,5.1966631],[97.1453042,5.1966357],[97.1453022,5.196579],[97.1453103,5.1965335],[97.1453398,5.1964795],[97.1455671,5.1962764],[97.1457334,5.1960961],[97.1458809,5.1959466],[97.1461116,5.1956768],[97.1461759,5.1955699],[97.1464106,5.195208],[97.146526,5.1949382],[97.1466078,5.1947378],[97.1466708,5.194615],[97.1472555,5.1937615],[97.1474031,5.1935305],[97.1475171,5.1933942],[97.1476445,5.19325],[97.1478148,5.1930617],[97.1478778,5.1930283],[97.1479355,5.1930109],[97.1479797,5.1930029],[97.1480149,5.1929905],[97.1480411,5.1929585],[97.1481997,5.1927044],[97.1487254,5.1919685],[97.1491559,5.191318],[97.1494,5.1909127],[97.1496467,5.1904379],[97.1500705,5.1895958],[97.1503079,5.1891697],[97.1504903,5.188773],[97.1508296,5.1880117],[97.1513379,5.1869032],[97.1514626,5.1865639],[97.1522176,5.1843682],[97.1524443,5.183667],[97.1525811,5.1832262],[97.1526521,5.1830272],[97.1528372,5.1825972],[97.1530236,5.1822058],[97.1531363,5.181944],[97.1532275,5.1816903],[97.1533039,5.1814445],[97.1534099,5.1811039],[97.1534662,5.1808849],[97.1535158,5.1805897],[97.1535748,5.1800782],[97.1539088,5.176488],[97.1539624,5.1758082],[97.1539704,5.1756318],[97.1537559,5.1740585],[97.1537411,5.1740037],[97.1537089,5.1739436],[97.1536516,5.1738963],[97.1535479,5.1738385],[97.1534796,5.1737566],[97.1534346,5.1736251],[97.1534152,5.1735095],[97.1534347,5.1732762],[97.1534555,5.1731462],[97.1534555,5.1730714],[97.1534367,5.1730113],[97.1533737,5.1729392],[97.1531859,5.1727843],[97.153025,5.1725973],[97.1525744,5.1719482],[97.1525167,5.1718734],[97.1524832,5.171844],[97.1524074,5.1718026],[97.1522786,5.1717425],[97.1522035,5.1716991],[97.1521439,5.1716603],[97.1520956,5.1716156],[97.1519885,5.1714901],[97.1520168,5.1714619],[97.1519922,5.1714264],[97.1519394,5.1713722],[97.1518945,5.1713935],[97.1518744,5.1713798],[97.1517823,5.171386],[97.1517274,5.1713468],[97.1518296,5.1712732],[97.1517923,5.1712181],[97.1517211,5.1712649],[97.1517053,5.1712443],[97.1516928,5.1711605],[97.1516919,5.1711172],[97.1515915,5.1709771],[97.1513915,5.1706833],[97.151358,5.1705577],[97.1513575,5.1704762],[97.1513783,5.1704555],[97.1513512,5.1703659],[97.1513405,5.1702105],[97.1513432,5.1699367],[97.1513271,5.1698672],[97.1512802,5.1697991],[97.1512105,5.1697764],[97.1511354,5.1697938],[97.1510978,5.1698365],[97.1510442,5.1700048],[97.1510012,5.1700582],[97.150839,5.1701704],[97.1508014,5.1702172],[97.150792,5.1702586],[97.1508095,5.170312],[97.1510173,5.1704709],[97.1510589,5.1705417],[97.151071,5.1706178],[97.1510616,5.1706833],[97.151024,5.170734],[97.1509409,5.1707861],[97.1508282,5.1708222],[97.1507639,5.1708275],[97.1506888,5.1708035],[97.1506459,5.1707861],[97.1505948,5.1707331],[97.1505775,5.1707474],[97.1505184,5.1707113],[97.150445,5.170654],[97.150412,5.170586],[97.1504045,5.1705284],[97.1504232,5.1704602],[97.1504629,5.1704174],[97.1504621,5.1703921],[97.1504715,5.1703454],[97.1504594,5.1703013],[97.1503669,5.170153],[97.1503294,5.1700983],[97.150261,5.1699767],[97.1502019,5.1698979],[97.1500571,5.1697924],[97.1500021,5.1697203],[97.1499525,5.1696268],[97.1498479,5.1694732],[97.1497433,5.1693423],[97.1496253,5.1691727],[97.1493919,5.1688882],[97.1493544,5.1688307],[97.149345,5.168784],[97.149357,5.1686999],[97.1493819,5.1686244],[97.1494174,5.168569],[97.1495113,5.1684648],[97.1495448,5.1684407],[97.1496306,5.1683993],[97.1496722,5.1683633],[97.1496843,5.1683152],[97.1496762,5.1682724],[97.1495984,5.1681135],[97.1495166,5.1679759],[97.1494174,5.1678437],[97.1493892,5.1677342],[97.1493852,5.167606],[97.1494389,5.1672387],[97.1494603,5.1671799],[97.1495032,5.1671532],[97.1495629,5.1671338],[97.1496655,5.1671211],[97.149929,5.1671124],[97.1499713,5.1671245],[97.1499907,5.1671478],[97.1499934,5.1671805],[97.1499854,5.1672206],[97.1498398,5.1674951],[97.1497252,5.1676787],[97.1496527,5.1677618],[97.1495864,5.1678257],[97.1495441,5.1678617],[97.1495421,5.1678751],[97.1495488,5.1678871],[97.1495636,5.1678898],[97.1495844,5.1678831],[97.149699,5.1677936],[97.1497346,5.1677582],[97.1499257,5.1674731],[97.1499458,5.167463],[97.1499632,5.1674657],[97.1499867,5.1674797],[97.1500544,5.1675672],[97.1500652,5.1676133],[97.1500611,5.1677856],[97.1500839,5.1680107],[97.1500947,5.1681689],[97.1501027,5.168199],[97.1501188,5.1682284],[97.1501926,5.1682684],[97.150206,5.1682938],[97.1502006,5.1683279],[97.1501838,5.1683553],[97.1501242,5.1684247],[97.1501108,5.1684568],[97.1501228,5.1684915],[97.1501563,5.1685075],[97.1502194,5.1685129],[97.1502797,5.1685356],[97.1502998,5.168565],[97.1503119,5.1686224],[97.1503159,5.1686958],[97.150332,5.1687666],[97.1503669,5.1688401],[97.1504219,5.1689189],[97.1505184,5.1691553],[97.1505681,5.1692969],[97.150674,5.1695039],[97.1507129,5.1696014],[97.1507129,5.1696789],[97.1506821,5.1697417],[97.1506163,5.1698138],[97.150607,5.1698619],[97.1506311,5.169922],[97.1506834,5.1699661],[97.1507424,5.1699767],[97.1507893,5.169962],[97.1508524,5.1698939],[97.1508966,5.1698004],[97.1509369,5.1696415],[97.150953,5.1695079],[97.1509583,5.1694211],[97.1509503,5.1693183],[97.1509543,5.1692087],[97.1509396,5.168999],[97.1509221,5.1688668],[97.150898,5.16878],[97.1508403,5.1686211],[97.1507961,5.1684808],[97.1507666,5.168418],[97.1507223,5.1683486],[97.1506003,5.1680935],[97.150501,5.1679185],[97.1504107,5.1677084],[97.1503454,5.1674978],[97.1503294,5.1673909],[97.1503267,5.1672961],[97.1503472,5.1671863],[97.1504098,5.1670543],[97.1506204,5.1667605],[97.1507196,5.1666697],[97.1508779,5.1665608],[97.1510227,5.1664065],[97.1512835,5.1660833],[97.1512963,5.1660486],[97.1512949,5.1660279],[97.1512789,5.1660065],[97.1512467,5.1659958],[97.1512252,5.1659958],[97.1512058,5.1660085],[97.1509919,5.1662222],[97.1508189,5.1664259],[97.1507277,5.1664967],[97.1505681,5.1665882],[97.1504688,5.1666416],[97.1503375,5.1666997],[97.1495824,5.1669515],[97.1494389,5.1670209],[97.1493812,5.1670677],[97.1493611,5.1671091],[97.1493302,5.1672333],[97.1492699,5.167634],[97.1492632,5.1677422],[97.1493095,5.1679172],[97.1493825,5.1680988],[97.1493718,5.1681616],[97.1493463,5.1682204],[97.1493021,5.1682778],[97.1488354,5.1685917],[97.1484169,5.1677088],[97.1477263,5.166094],[97.1476458,5.1659471],[97.1475466,5.1658349],[97.1474513,5.1657761],[97.1473762,5.1657561],[97.1473092,5.1657601],[97.1472636,5.1657935],[97.1472475,5.1658416],[97.1472569,5.165923],[97.1472783,5.1659778],[97.1473239,5.1660098],[97.1473655,5.1660265],[97.1474091,5.1660619],[97.1474265,5.166096],[97.1474245,5.1661421],[97.147401,5.1661828],[97.1473147,5.1662418],[97.1472469,5.166266],[97.1470919,5.1663057],[97.1470819,5.1663211],[97.1470772,5.1663378],[97.1471382,5.1665648],[97.1471315,5.1665895],[97.1471067,5.1666136],[97.1470772,5.1666136],[97.1470591,5.1665989],[97.1470443,5.1665675],[97.1470202,5.1665394],[97.146992,5.1665301],[97.1469551,5.1665261],[97.1468881,5.1665288],[97.1468351,5.1665434],[97.1468016,5.1665768],[97.1467943,5.166615],[97.1467988,5.166659],[97.1467888,5.1667164],[97.1467593,5.1667738],[97.1466889,5.166852],[97.1466225,5.1669315],[97.1465917,5.1669782],[97.1465769,5.1670303],[97.1465743,5.1670677],[97.1465778,5.167102],[97.1466413,5.1672387],[97.1466406,5.1672547],[97.1466225,5.1672727],[97.1466024,5.1672774],[97.1465749,5.1672754],[97.1463657,5.1671692],[97.1463161,5.1671725],[97.1462698,5.1671846],[97.1462289,5.1672166],[97.1462211,5.1672643],[97.1462283,5.1673034],[97.1462544,5.1673422],[97.1463208,5.1673869],[97.1464978,5.1674493],[97.1465518,5.1674724],[97.1465706,5.1674844],[97.1465823,5.1675021],[97.1466018,5.1675958],[97.1466326,5.1676894],[97.1464844,5.1677736],[97.146423,5.1676914],[97.1462178,5.1678227],[97.1462702,5.1679487],[97.146237,5.1679652],[97.1462169,5.1679686],[97.1461907,5.1679619],[97.1461619,5.1679325],[97.1460821,5.167797],[97.1457763,5.1672013],[97.1454719,5.1665815],[97.1450816,5.1658429],[97.1450548,5.1658055],[97.1438451,5.1644738],[97.1437164,5.1643456],[97.1436051,5.1642722],[97.1435139,5.1642428],[97.1434146,5.1642441],[97.1432966,5.1642802],[97.1423203,5.1640277],[97.1358865,5.1736017],[97.1351079,5.1742643],[97.1334374,5.1752795],[97.1312692,5.1772575],[97.1307637,5.1779763],[97.1306359,5.1783449],[97.1306423,5.1787377],[97.1307217,5.1790729],[97.1310043,5.1792665],[97.132077,5.1797112],[97.1325414,5.1802777],[97.1326692,5.1805678],[97.1328605,5.1809221],[97.1328756,5.1814756],[97.1327301,5.1820412],[97.1326401,5.1823869],[97.1323996,5.182844],[97.1323187,5.1832361],[97.132063,5.1836869],[97.131755,5.1840623],[97.1313617,5.1844255],[97.1309332,5.1847347],[97.1305593,5.1849274],[97.1302228,5.1851214],[97.1298827,5.1853465],[97.1294902,5.1857775],[97.1294335,5.1861439],[97.1294215,5.1865589],[97.129661,5.187125],[97.1296951,5.1874139],[97.1296685,5.1876485],[97.1296012,5.1878587],[97.1294149,5.1882005],[97.1290895,5.1884264],[97.128885,5.188648],[97.1283377,5.1890397],[97.1280129,5.1892956],[97.1276991,5.1895672],[97.1274181,5.1900689],[97.1273457,5.1904616],[97.1273579,5.1907595],[97.1274332,5.1910645],[97.1275199,5.1914466],[97.1275296,5.1918523],[97.1274943,5.1923987],[97.1274357,5.1926637],[97.1272427,5.1935469],[97.1271931,5.1938259],[97.1270952,5.1941155],[97.1269026,5.1946063],[97.12663,5.1950745],[97.1263239,5.1955359],[97.1260073,5.1959999],[97.1255781,5.1963818],[97.1252169,5.1965945],[97.1247902,5.1968886],[97.124355,5.197079],[97.1238937,5.1971431],[97.1235638,5.1970389],[97.1233572,5.1968867],[97.1220269,5.1954763],[97.121705,5.1949768],[97.1215039,5.1947965],[97.1212276,5.1947524],[97.1209956,5.1949835],[97.1207877,5.1952653],[97.1206268,5.195479],[97.1203693,5.1956753],[97.1200715,5.195853],[97.1196826,5.1959384],[97.1190013,5.1959037],[97.1188404,5.1959678],[97.1183737,5.1961761],[97.1178801,5.1966116],[97.1174859,5.1969989],[97.116008,5.1979552],[97.1150531,5.1987031],[97.1147527,5.199069],[97.1145274,5.199451],[97.1144952,5.1997235],[97.1145167,5.1999746],[97.1146347,5.2002364],[97.1147205,5.2005088],[97.1147795,5.2007279],[97.1147956,5.2009576],[97.1147808,5.2011743],[97.1147124,5.201391],[97.1143384,5.2019254],[97.1140701,5.2020712],[97.1138428,5.2020292],[97.1136798,5.2019659],[97.1133545,5.2014315],[97.1132002,5.2010209],[97.1130552,5.2008478],[97.1128955,5.2007986],[97.1127733,5.2008723],[97.1125984,5.2010266],[97.1116454,5.201827],[97.1113625,5.2023141]];

function loadBoundary() {
    bandaSaktiBoundary = { features: [{ geometry: { coordinates: [BANDA_SAKTI_RING], type: 'Polygon' }, type: 'Feature', properties: {} }], type: 'FeatureCollection' };
    console.log('Boundary loaded:', BANDA_SAKTI_RING.length, 'points');
    boundaryLayer = L.polygon(BANDA_SAKTI_RING.map(p => [p[1], p[0]]), {
        color: '#2563eb', weight: 3, opacity: 0.8,
        fillColor: '#3b82f6', fillOpacity: 0.1
    }).addTo(map);
    map.fitBounds(boundaryLayer.getBounds());
}

function pointInPolygon(lat, lng, ring) {
    let inside = false;
    const n = ring.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const lng_i = ring[i][0], lat_i = ring[i][1];
        const lng_j = ring[j][0], lat_j = ring[j][1];
        if ((lat_i > lat) !== (lat_j > lat) && lng < (lng_j + (lng_i - lng_j) * (lat - lat_j) / (lat_i - lat_j))) {
            inside = !inside;
        }
    }
    return inside;
}

function isInBandaSakti(lat, lng) {
    if (!bandaSaktiBoundary) return true;
    try {
        const ring = bandaSaktiBoundary.features[0].geometry.coordinates[0];
        return pointInPolygon(lat, lng, ring);
    } catch (e) {
        console.error('Boundary check error:', e);
        return true;
    }
}

function setSubmitButtonState(enabled) {
    const btn = document.getElementById('submitBtn');
    if (!btn) return;
    if (enabled) {
        btn.disabled = false;
        btn.className = 'flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-2 text-sm';
        btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
    } else {
        btn.disabled = true;
        btn.className = 'flex-1 bg-slate-300 text-slate-500 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm cursor-not-allowed';
        btn.innerHTML = '<i class="fas fa-ban"></i> Simpan (di luar wilayah)';
    }
}

function updateCoordFieldStyle(isValid) {
    setSubmitButtonState(isValid);
    const fields = [latitudeInput, longitudeInput];
    fields.forEach(f => {
        if (isValid) {
            f.className = 'w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs cursor-pointer text-center font-mono';
        } else {
            f.className = 'w-full px-3 py-2 bg-red-50 border-2 border-red-400 rounded-lg text-xs cursor-pointer text-center font-mono text-red-700';
        }
    });
    const warningEl = document.getElementById('wilayahWarning');
    if (warningEl) {
        warningEl.remove();
    }
    if (!isValid) {
        const warning = document.createElement('div');
        warning.id = 'wilayahWarning';
        warning.className = 'flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg';
        warning.innerHTML = '<i class="fas fa-exclamation-circle text-red-500 text-xs"></i><span class="text-xs text-red-700 font-semibold">Lokasi tidak berada di dalam wilayah Banda Sakti!</span>';
        latitudeInput.parentElement.parentElement.insertAdjacentElement('afterend', warning);
    }
}

function checkBoundaryAndNotify(lat, lng) {
    const isValid = isInBandaSakti(lat, lng);
    updateCoordFieldStyle(isValid);
    if (!isValid) {
        showToast('Lokasi tidak berada di dalam wilayah Banda Sakti!', 'error');
        return false;
    }
    return true;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form submission
    if (form) form.addEventListener('submit', handleFormSubmit);

    // Photo preview
    if (photoInput) photoInput.addEventListener('change', handlePhotoPreview);

    // Clear form button
    if (clearFormBtn) clearFormBtn.addEventListener('click', clearForm);

    // Clear all data button
    if (clearAllBtn) clearAllBtn.addEventListener('click', () => {
        showConfirmModal('Apakah Anda yakin ingin menghapus semua data?', () => {
            clearAllData();
        });
    });

    // Heatmap toggle - redesigned button
    if (heatmapToggle) heatmapToggle.addEventListener('click', toggleHeatmap);

    // Filter buttons
    segmentButtons.forEach(btn => {
        btn.addEventListener('click', () => handleFilter(btn.dataset.filter));
    });

    // Time filter buttons
    timeChipButtons.forEach(btn => {
        btn.addEventListener('click', () => handleTimeFilter(btn.dataset.timeFilter));
    });

    // Modal events
    if (cancelConfirm) cancelConfirm.addEventListener('click', hideConfirmModal);
    if (confirmModal) confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) hideConfirmModal();
    });
}

// ===== FORM HANDLING =====
async function handleFormSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        return;
    }

    // Check boundary (safety net for Enter key submission)
    const chkLat = parseFloat(latitudeInput.value);
    const chkLng = parseFloat(longitudeInput.value);
    if (chkLat && chkLng) {
        const inside = isInBandaSakti(chkLat, chkLng);
        console.log('Boundary check:', chkLat, chkLng, 'inside:', inside);
        updateCoordFieldStyle(inside);
        if (!inside) {
            showToast('Tidak dapat menyimpan: lokasi di luar wilayah Banda Sakti!', 'error');
            return;
        }
    }

    // Disable submit button
    const btn = document.getElementById('submitBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    }

    try {
        // Create violation object
        const categoryValue = autoCategory.querySelector('span')?.textContent || 'Unknown';
        let categoryKey = 'berat';
        if (categoryValue.includes('RINGAN')) {
            categoryKey = 'ringan';
        } else if (categoryValue.includes('PATUH')) {
            categoryKey = 'patuh';
        }
    const violation = {
        id: Date.now(),
        locationName: locationInput.value.trim(),
        category: categoryKey,
        latitude: parseFloat(latitudeInput.value),
        longitude: parseFloat(longitudeInput.value),
        timestamp: new Date().toISOString()
    };

        // Kirim data ke server untuk disimpan di database CSV
        const formData = new FormData();
        formData.append('location_name', violation.locationName);
        formData.append('category', violation.category);
        formData.append('latitude', violation.latitude);
        formData.append('longitude', violation.longitude);
        
        // Kirim file foto asli untuk generate bbox saat simpan
        const photoFile = photoInput.files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }

        // Simpan ke server database
        const response = await fetch('/save', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Save to localStorage juga untuk cache lokal
            saveViolation(violation);

            // Add marker to map
            addMarker(violation);

            // Update statistics
            updateStatistics();

            // Show success message
            showToast('Data berhasil disimpan ke database server!', 'success');

            // Clear form
            clearForm();
        } else {
            showToast('Gagal menyimpan: ' + (result.error || 'Unknown error'), 'error');
        }

    } catch (error) {
        console.error('Save error:', error);
        showToast('Error koneksi server: ' + error.message, 'error');
    } finally {
        // Re-enable submit button
        const btn = document.getElementById('submitBtn');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-save"></i> Simpan';
        }
    }
}

function validateForm() {
    if (!locationInput.value.trim()) {
        showToast('Mohon masukkan nama lokasi!', 'error');
        locationInput.focus();
        return false;
    }

    if (!latitudeInput.value || !longitudeInput.value) {
        showToast('Mohon upload foto dengan GPS atau klik peta untuk memilih lokasi!', 'error');
        return false;
    }

    return true;
}

function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
            photoPreview.classList.add('active');
            
            // Call prediction API
            predictImage(file);
        };
        reader.readAsDataURL(file);
    } else {
        photoPreview.innerHTML = '';
        photoPreview.classList.remove('active');
        predictionResult.innerHTML = '';
        predictionResult.classList.remove('active');
    }
}

function clearForm() {
    form.reset();
    photoPreview.innerHTML = '';
    photoPreview.classList.remove('active');
    predictionResult.innerHTML = '';
    predictionResult.classList.remove('active');
    autoCategory.innerHTML = '<span class="text-slate-400">Upload foto untuk deteksi otomatis</span>';
    autoCategory.className = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm';
    latitudeInput.value = '';
    longitudeInput.value = '';
    updateCoordFieldStyle(true);
}

// ===== AI PREDICTION =====
async function predictImage(file) {
    // Show loading state
    predictionResult.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendeteksi...',
    predictionResult.className = 'prediction-result active loading';
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.error) {
            predictionResult.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${result.error}`;
            predictionResult.className = 'prediction-result active error';
            return;
        }
        
        // Display detection results
        let detectionsHTML = '';
        if (result.detections && result.detections.length > 0) {
            result.detections.forEach(det => {
                detectionsHTML += `
                    <div class="detection-item">
                        <span>${det.class}</span>
                        <span>${(det.confidence * 100).toFixed(1)}%</span>
                    </div>
                `;
            });
        } else {
            detectionsHTML = '<div class="detection-item">Tidak ada objek terdeteksi</div>';
        }
        
        // Get compliance status
        const compliance = result.compliance || {};
        
        // Determine category based on user's rules:
        // - Ada Rokok atau Asbak = ringan
        // - Ada Merokok = berat
        // - Tidak ada keduanya = patuh
        const hasMerokok = result.summary?.has_merokok || false;
        const hasRokok = result.summary?.has_rokok || false;
        const hasAsbak = result.summary?.has_asbak || false;
        
        let categoryValue = '';
        let categoryText = '';
        let badgeClass = '';
        
        if (hasMerokok) {
            categoryValue = 'berat';
            categoryText = '🔴 PELANGGARAN BERAT';
            badgeClass = 'berat';
        } else if (hasRokok || hasAsbak) {
            categoryValue = 'ringan';
            categoryText = '⚠️ PELANGGARAN RINGAN';
            badgeClass = 'ringan';
        } else {
            categoryValue = 'patuh';
            categoryText = '✅ PATUH';
            badgeClass = 'patuh';
        }
        
        // Update auto category display
        autoCategory.innerHTML = `<span class="font-semibold">${categoryText}</span>`;
        autoCategory.className = 'w-full px-3 py-2 border rounded-lg text-sm ' + 
            (badgeClass === 'berat' ? 'bg-red-50 border-red-300 text-red-700' : 
             badgeClass === 'ringan' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' : 
             'bg-green-50 border-green-300 text-green-700');
        
        // Check for GPS data and auto-fill coordinates
        if (result.gps) {
            latitudeInput.value = result.gps.latitude.toFixed(6);
            longitudeInput.value = result.gps.longitude.toFixed(6);
            const inside = isInBandaSakti(result.gps.latitude, result.gps.longitude);
            updateCoordFieldStyle(inside);
            if (inside) {
                showToast('Koordinat otomatis diambil dari metadata foto!', 'success');
            } else {
                showToast('LOKASI TIDAK BERADA DI WILAYAH BANDA SAKTI!', 'error');
            }
        }

        // Tampilkan preview gambar dengan bounding box
        if (result.bbox_preview) {
            const previewImg = photoPreview.querySelector('img');
            if (previewImg) {
                previewImg.src = `data:image/jpeg;base64,${result.bbox_preview}`;
            }
        }

        const isOutside = result.gps && !isInBandaSakti(result.gps.latitude, result.gps.longitude);
        let luarWilayahHTML = '';
        if (isOutside) {
            luarWilayahHTML = `<div class="flex items-center gap-2 p-2 mt-2 bg-red-50 border border-red-300 rounded-lg">
                <i class="fas fa-exclamation-triangle text-red-500"></i>
                <span class="text-xs text-red-700 font-bold">⚠ LOKASI DI LUAR WILAYAH BANDA SAKTI — Tidak dapat menyimpan data</span>
            </div>`;
        }

        predictionResult.innerHTML = `
            <div><strong>Deteksi:</strong></div>
            ${detectionsHTML}
            <div><strong>Status:</strong> ${compliance.status || 'Unknown'}</div>
            <span class="compliance-badge ${badgeClass}">${compliance.status || 'Unknown'}</span>
            ${luarWilayahHTML}
        `;
        predictionResult.className = 'prediction-result active success';
        
    } catch (error) {
        console.error('Prediction error:', error);
        predictionResult.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error: ${error.message}`;
        predictionResult.className = 'prediction-result active error';
    }
}

// ===== MARKER MANAGEMENT =====
function addMarker(violation) {
    // Create custom icon based on category
    const icon = createMarkerIcon(violation.category);

    // Create marker
    const marker = L.marker([violation.latitude, violation.longitude], { icon })
        .addTo(map);

    // Create popup content
    const popupContent = createPopupContent(violation);
    marker.bindPopup(popupContent);

    // Add to markers array
    markers.push({
        id: violation.id,
        marker: marker,
        category: violation.category,
        timestamp: violation.timestamp
    });

    // Apply current filter
    applyFilter();

    return marker;
}

function createMarkerIcon(category) {
    const colors = {
        patuh: '#22c55e',
        ringan: '#eab308',
        berat: '#ef4444'
    };

    const icons = {
        patuh: '✓',
        ringan: '!',
        berat: '✕'
    };

    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: 36px;
            height: 36px;
            background: ${colors[category]};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 16px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">${icons[category]}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
}

function createPopupContent(violation) {
    let photoHTML = '<p style="color: #94a3b8; font-style: italic;">Tidak ada foto</p>';
    
    // Tampilkan foto dengan bounding box (sekarang filename berisi bbox_filename)
    if (violation.filename && violation.filename !== '') {
        photoHTML = `<img src="/uploads/${violation.filename}" alt="Foto Deteksi" class="popup-photo" loading="lazy" onerror="this.style.display='none'" />`;
    }

    return `
        <div class="popup-content">
            <h4>${violation.locationName}</h4>
            <span class="popup-category ${violation.category}">${categoryLabels[violation.category]}</span>
            ${photoHTML}
            <p class="popup-coords">
                <i class="fas fa-map-marker-alt"></i> 
                ${violation.latitude.toFixed(6)}, ${violation.longitude.toFixed(6)}
            </p>
            <button class="popup-delete" onclick="deleteMarker(${violation.id})">
                <i class="fas fa-trash-alt"></i> Hapus
            </button>
        </div>
    `;
}

async function deleteMarker(id) {
    try {
        // Hapus dari database server terlebih dahulu
        const response = await fetch(`/delete/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Find marker
            const markerIndex = markers.findIndex(m => m.id === id);
            if (markerIndex > -1) {
                // Remove from map
                map.removeLayer(markers[markerIndex].marker);
                
                // Remove from array
                markers.splice(markerIndex, 1);

                // Remove from localStorage
                violationData = violationData.filter(v => v.id !== id);
                localStorage.setItem('violationData', JSON.stringify(violationData));

                // Update statistics
                updateAllVisualization();

                // Update heatmap if enabled
                if (heatmapToggle.classList.contains('heatmap-active')) {
                    updateHeatmap();
                }

                showToast('Data dan foto berhasil dihapus!', 'success');
            }
        } else {
            showToast('Gagal menghapus: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Error koneksi server', 'error');
    }
}

// ===== DATA STORAGE =====
function saveViolation(violation) {
    // Hanya simpan metadata saja tanpa base64 foto untuk menghindari quota error
    const saveData = violationData.map(v => ({
        id: v.id,
        locationName: v.locationName,
        category: v.category,
        latitude: v.latitude,
        longitude: v.longitude,
        timestamp: v.timestamp
    }));
    saveData.push(violation);
    localStorage.setItem('violationData', JSON.stringify(saveData));
}

async function loadData() {
    try {
        // Ambil semua data dari database server CSV
        const response = await fetch('/history');
        const result = await response.json();
        
        if (result && result.detections) {
            // Konversi format database ke format marker frontend
            violationData = result.detections.map(item => {
                let category = 'patuh';
                if (item.level === 'tidak_patuh_berat') category = 'berat';
                else if (item.level === 'tidak_patuh_ringan') category = 'ringan';
                
                return {
                    id: item.id,
                    locationName: item.location_name || `Data #${item.id}`,
                    category: category,
                    latitude: parseFloat(item.latitude),
                    longitude: parseFloat(item.longitude),
                    timestamp: item.timestamp,
                    filename: item.filename,
                    bbox_filename: item.bbox_filename
                };
            });
            
            // Add markers for all data
            violationData.forEach(violation => {
                if (violation.latitude && violation.longitude) {
                    addMarker(violation);
                }
            });

            // Update statistics and count badges
            updateAllVisualization();
            
            showToast(`Berhasil memuat ${violationData.length} data dari database!`, 'success');
        }
    } catch (error) {
        console.error('Load data error:', error);
        // Fallback ke localStorage jika server tidak bisa dihubungi
        const storedData = localStorage.getItem('violationData');
        if (storedData) {
            violationData = JSON.parse(storedData);
            violationData.forEach(violation => addMarker(violation));
            updateAllVisualization();
        }
    }
}

async function clearAllData() {
    try {
        // Hapus SEMUA data dan foto di server
        const response = await fetch('/clear-all', {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Remove all markers from map
            markers.forEach(m => map.removeLayer(m.marker));
            markers = [];

            // Clear localStorage
            violationData = [];
            localStorage.removeItem('violationData');

            // Update statistics
            updateAllVisualization();

            // Hide heatmap if visible and reset toggle state
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
                heatmapLayer = null;
            }
            heatmapToggle.classList.remove('heatmap-active');
            heatmapToggle.classList.add('heatmap-off');

            hideConfirmModal();
            showToast('Semua data dan foto berhasil dihapus!', 'success');
        } else {
            showToast('Gagal menghapus: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Clear all error:', error);
        showToast('Error koneksi server', 'error');
    }
}

// ===== STATISTICS =====
function updateStatistics(filteredData = violationData) {
    const stats = {
        patuh: filteredData.filter(v => v.category === 'patuh').length,
        ringan: filteredData.filter(v => v.category === 'ringan').length,
        berat: filteredData.filter(v => v.category === 'berat').length,
        total: filteredData.length
    };

    document.getElementById('statPatuh').textContent = stats.patuh;
    document.getElementById('statRingan').textContent = stats.ringan;
    document.getElementById('statBerat').textContent = stats.berat;
    document.getElementById('statTotal').textContent = stats.total;
}

// ===== FILTERING =====
function handleFilter(filter) {
    currentFilter = filter;

    // Update segmented button states
    segmentButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update status indicator
    updateStatusIndicator(filter);

    // Apply filter
    updateAllVisualization();
}

function handleTimeFilter(filter) {
    currentTimeFilter = filter;

    // Update chip states
    timeChipButtons.forEach(btn => {
        if (btn.dataset.timeFilter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Apply filter
    updateAllVisualization();
}

function updateStatusIndicator(filter) {
    const indicator = document.getElementById('statusIndicator');
    if (!indicator) return;
    
    const labels = {
        all: 'Semua',
        patuh: 'Patuh',
        ringan: 'Ringan',
        berat: 'Berat'
    };
    
    const classes = {
        all: 'indicator-all',
        patuh: 'indicator-patuh',
        ringan: 'indicator-ringan',
        berat: 'indicator-berat'
    };
    
    indicator.className = `filter-indicator ${classes[filter]}`;
    indicator.innerHTML = `<span class="w-2 h-2 ${filter === 'patuh' ? 'bg-green-500' : filter === 'ringan' ? 'bg-yellow-500' : filter === 'berat' ? 'bg-red-500' : 'bg-slate-500'} rounded-full"></span>${labels[filter]}`;
}

function updateCountBadges() {
    // Safety check - elements might not exist if DOM not ready
    const countAll = document.getElementById('count-all');
    const countPatuh = document.getElementById('count-patuh');
    const countRingan = document.getElementById('count-ringan');
    const countBerat = document.getElementById('count-berat');
    
    if (!countAll || !countPatuh || !countRingan || !countBerat) return;
    
    const filteredData = violationData.filter(v => {
        let categoryMatch = currentFilter === 'all' || v.category === currentFilter;
        let timeMatch = currentTimeFilter === 'all' || getTimePeriod(v.timestamp) === currentTimeFilter;
        return categoryMatch && timeMatch;
    });
    
    const stats = {
        all: filteredData.length,
        patuh: filteredData.filter(v => v.category === 'patuh').length,
        ringan: filteredData.filter(v => v.category === 'ringan').length,
        berat: filteredData.filter(v => v.category === 'berat').length
    };
    
    countAll.textContent = stats.all;
    countPatuh.textContent = stats.patuh;
    countRingan.textContent = stats.ringan;
    countBerat.textContent = stats.berat;
}

function updateAllVisualization() {
    const filteredData = violationData.filter(v => {
        const categoryMatch = currentFilter === 'all' || v.category === currentFilter;
        const timeMatch = currentTimeFilter === 'all' || getTimePeriod(v.timestamp) === currentTimeFilter;
        return categoryMatch && timeMatch;
    });
    
    applyFilter();
    updateStatistics(filteredData);
    updateCountBadges();
    
    // ✅ Gunakan heatmapLayer sebagai source of truth
    if (heatmapLayer !== null) {
        hideHeatmap();
        showHeatmap();
    }
}

function getTimePeriod(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();

    if (hour >= 7 && hour < 12) return 'pagi';
    if (hour >= 12 && hour < 15) return 'siang';
    if (hour >= 15 && hour <= 18) return 'sore';
    return null;
}

function applyFilter() {
    markers.forEach(m => {
        const categoryMatch = currentFilter === 'all' || m.category === currentFilter;
        const timeMatch = currentTimeFilter === 'all' || getTimePeriod(m.timestamp) === currentTimeFilter;
        
        if (categoryMatch && timeMatch) {
            // ✅ Tambahkan ke map jika belum ada
            if (!map.hasLayer(m.marker)) {
                m.marker.addTo(map);
            }
        } else {
            // ✅ Hapus dari map agar benar-benar tersembunyi
            if (map.hasLayer(m.marker)) {
                map.removeLayer(m.marker);
            }
        }
    });
}

// ===== HEATMAP =====
function toggleHeatmap() {
    // ✅ Gunakan heatmapLayer sebagai source of truth
    if (heatmapLayer === null) {
        heatmapToggle.classList.remove('heatmap-off');
        heatmapToggle.classList.add('heatmap-active');
        showHeatmap();
        markers.forEach(m => {
            if (map.hasLayer(m.marker)) map.removeLayer(m.marker);
        });
    } else {
        heatmapToggle.classList.remove('heatmap-active');
        heatmapToggle.classList.add('heatmap-off');
        hideHeatmap();
        applyFilter(); // ✅ restore marker sesuai filter aktif
    }
}

function showHeatmap() {
    // Get violations that match current filters
    // Display heatmap visualization based on filtered data
    const filteredViolations = violationData.filter(v => {
        let categoryMatch = currentFilter === 'all' || v.category === currentFilter;
        let timeMatch = currentTimeFilter === 'all' || getTimePeriod(v.timestamp) === currentTimeFilter;
        return categoryMatch && timeMatch;
    });

    if (filteredViolations.length === 0) {
        showToast('Tidak ada data untuk ditampilkan di heatmap!', 'info');
        heatmapToggle.classList.remove('heatmap-active');
        heatmapToggle.classList.add('heatmap-off');
        return;
    }

    // Create heatmap data with intensity based on category
    const heatData = filteredViolations.map(v => {
        // Different intensity for different categories
        const intensity = v.category === 'berat' ? 0.8 : v.category === 'ringan' ? 0.5 : 0.3;
        return [v.latitude, v.longitude, intensity];
    });

    // Add heatmap layer
    heatmapLayer = L.heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
            0.2: '#3b82f6',
            0.4: '#60a5fa',
            0.6: '#fbbf24',
            0.8: '#f97316',
            1.0: '#ef4444'
        }
    }).addTo(map);

    showToast('Heatmap ditampilkan!', 'info');
}

function hideHeatmap() {
    if (heatmapLayer) {
        map.removeLayer(heatmapLayer);
        heatmapLayer = null;
    }
}

function updateHeatmap() {
    if (heatmapToggle.classList.contains('heatmap-active')) {
        hideHeatmap();
        showHeatmap();
    }
}

// ===== MODAL =====
function showConfirmModal(message, onConfirm) {
    confirmMessage.textContent = message;
    confirmModal.classList.add('active');
    
    // Store the confirm action
    confirmAction.onclick = onConfirm;
}

function hideConfirmModal() {
    confirmModal.classList.remove('active');
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'info') {
    // Get toast container
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Icon mapping
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    // Show toast
    setTimeout(() => toast.style.opacity = '1', 10);

    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== UTILITY FUNCTIONS =====
// Make deleteMarker available globally
window.deleteMarker = deleteMarker;
