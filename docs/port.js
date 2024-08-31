const axios = require('axios');

// 포트 이름과 URL 매핑
const portUrls = {
    SGN: 'https://www.econdb.com/maritime/ports/async/SG%20SIN/',
    SHA: 'https://www.econdb.com/maritime/ports/async/CN%20SHA/',
    PUS: 'https://www.econdb.com/maritime/ports/async/KR PUS',
    NGB: 'https://www.econdb.com/maritime/ports/async/CN NGB',
    RTM: 'https://www.econdb.com/maritime/ports/async/NL RTM',
    JEA: 'https://www.econdb.com/maritime/ports/async/AE JEA',
    TAO: 'https://www.econdb.com/maritime/ports/async/CN TAO',
    TPP: 'https://www.econdb.com/maritime/ports/async/MY TPP',
    ANR: 'https://www.econdb.com/maritime/ports/async/BE ANR',
    KHH: 'https://www.econdb.com/maritime/ports/async/TW KHH',
    PTM: 'https://www.econdb.com/maritime/ports/async/MA PTM',
    PKG: 'https://www.econdb.com/maritime/ports/async/MY PKG',
    HKG: 'https://www.econdb.com/maritime/ports/async/HK HKG',
    SHK: 'https://www.econdb.com/maritime/ports/async/CN SHK',
    LAX: 'https://www.econdb.com/maritime/ports/async/US LAX',
    LCH: 'https://www.econdb.com/maritime/ports/async/TH LCH',
    YTN: 'https://www.econdb.com/maritime/ports/async/CN YTN',
    LGB: 'https://www.econdb.com/maritime/ports/async/US LGB',
    SGN_VN: 'https://www.econdb.com/maritime/ports/async/VN SGN',
    HAM: 'https://www.econdb.com/maritime/ports/async/DE HAM',
    NYC: 'https://www.econdb.com/maritime/ports/async/US NYC',
    MUN: 'https://www.econdb.com/maritime/ports/async/IN MUN',
    XMN: 'https://www.econdb.com/maritime/ports/async/CN XMN',
    NSA_IN: 'https://www.econdb.com/maritime/ports/async/IN NSA',
    ALG: 'https://www.econdb.com/maritime/ports/async/ES ALG',
    CMB: 'https://www.econdb.com/maritime/ports/async/LK CMB',
    HPH: 'https://www.econdb.com/maritime/ports/async/VN HPH',
    ONX: 'https://www.econdb.com/maritime/ports/async/PA ONX',
    VLC: 'https://www.econdb.com/maritime/ports/async/ES VLC',
    SSZ: 'https://www.econdb.com/maritime/ports/async/BR SSZ',
    BRY: 'https://www.econdb.com/maritime/ports/async/DE BRY',
    JKT: 'https://www.econdb.com/maritime/ports/async/ID JKT',
    TXG: 'https://www.econdb.com/maritime/ports/async/CN TXG',
    BLB: 'https://www.econdb.com/maritime/ports/async/PA BLB',
    PIR: 'https://www.econdb.com/maritime/ports/async/GR PIR',
    SAV: 'https://www.econdb.com/maritime/ports/async/US SAV',
    NSA_CN: 'https://www.econdb.com/maritime/ports/async/CN NSA',
    PSD: 'https://www.econdb.com/maritime/ports/async/EG PSD',
    HOU: 'https://www.econdb.com/maritime/ports/async/US HOU',
    VUT: 'https://www.econdb.com/maritime/ports/async/VN VUT',
};

// JSON 데이터를 가져오는 함수
async function fetchData(portName) {
    const url = portUrls[portName];
    if (!url) {
        throw new Error(`No URL found for port name: ${portName}`);
    }

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for port ${portName}:`, error);
        throw error;
    }
}

module.exports = { fetchData };
