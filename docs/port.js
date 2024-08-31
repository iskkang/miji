const axios = require('axios');

const portData = [
  { name: 'SGN', url: 'https://www.econdb.com/maritime/ports/async/SG%20SIN/' },
  { name: 'SHA', url: 'https://www.econdb.com/maritime/ports/async/CN%20SHA/' },
  { name: 'PUS', url: 'https://www.econdb.com/maritime/ports/async/KR%20PUS/' },
  { name: 'NGB', url: 'https://www.econdb.com/maritime/ports/async/CN%20NGB/' },
  { name: 'RTM', url: 'https://www.econdb.com/maritime/ports/async/NL%20RTM/' },
  { name: 'JEA', url: 'https://www.econdb.com/maritime/ports/async/AE%20JEA/' },
  { name: 'TAO', url: 'https://www.econdb.com/maritime/ports/async/CN%20TAO/' },
  { name: 'TPP', url: 'https://www.econdb.com/maritime/ports/async/MY%20TPP/' },
  { name: 'ANR', url: 'https://www.econdb.com/maritime/ports/async/BE%20ANR/' },
  { name: 'KHH', url: 'https://www.econdb.com/maritime/ports/async/TW%20KHH/' },
  { name: 'PTM', url: 'https://www.econdb.com/maritime/ports/async/MA%20PTM/' },
  { name: 'PKG', url: 'https://www.econdb.com/maritime/ports/async/MY%20PKG/' },
  { name: 'HKG', url: 'https://www.econdb.com/maritime/ports/async/HK%20HKG/' },
  { name: 'SHK', url: 'https://www.econdb.com/maritime/ports/async/CN%20SHK/' },
  { name: 'LAX', url: 'https://www.econdb.com/maritime/ports/async/US%20LAX/' },
  { name: 'LCH', url: 'https://www.econdb.com/maritime/ports/async/TH%20LCH/' },
  { name: 'YTN', url: 'https://www.econdb.com/maritime/ports/async/CN%20YTN/' },
  { name: 'LGB', url: 'https://www.econdb.com/maritime/ports/async/US%20LGB/' },
  { name: 'SGN', url: 'https://www.econdb.com/maritime/ports/async/VN%20SGN/' },
  { name: 'HAM', url: 'https://www.econdb.com/maritime/ports/async/DE%20HAM/' },
  { name: 'NYC', url: 'https://www.econdb.com/maritime/ports/async/US%20NYC/' },
  { name: 'MUN', url: 'https://www.econdb.com/maritime/ports/async/IN%20MUN/' },
  { name: 'XMN', url: 'https://www.econdb.com/maritime/ports/async/CN%20XMN/' },
  { name: 'NSA', url: 'https://www.econdb.com/maritime/ports/async/IN%20NSA/' },
  { name: 'ALG', url: 'https://www.econdb.com/maritime/ports/async/ES%20ALG/' },
  { name: 'CMB', url: 'https://www.econdb.com/maritime/ports/async/LK%20CMB/' },
  { name: 'HPH', url: 'https://www.econdb.com/maritime/ports/async/VN%20HPH/' },
  { name: 'ONX', url: 'https://www.econdb.com/maritime/ports/async/PA%20ONX/' },
  { name: 'VLC', url: 'https://www.econdb.com/maritime/ports/async/ES%20VLC/' },
  { name: 'SSZ', url: 'https://www.econdb.com/maritime/ports/async/BR%20SSZ/' },
  { name: 'BRY', url: 'https://www.econdb.com/maritime/ports/async/DE%20BRY/' },
  { name: 'JKT', url: 'https://www.econdb.com/maritime/ports/async/ID%20JKT/' },
  { name: 'TXG', url: 'https://www.econdb.com/maritime/ports/async/CN%20TXG/' },
  { name: 'BLB', url: 'https://www.econdb.com/maritime/ports/async/PA%20BLB/' },
  { name: 'PIR', url: 'https://www.econdb.com/maritime/ports/async/GR%20PIR/' },
  { name: 'SAV', url: 'https://www.econdb.com/maritime/ports/async/US%20SAV/' },
  { name: 'NSA', url: 'https://www.econdb.com/maritime/ports/async/CN%20NSA/' },
  { name: 'PSD', url: 'https://www.econdb.com/maritime/ports/async/EG%20PSD/' },
  { name: 'HOU', url: 'https://www.econdb.com/maritime/ports/async/US%20HOU/' },
  { name: 'VUT', url: 'https://www.econdb.com/maritime/ports/async/VN%20VUT/' }
];

async function fetchPortData(portName) {
  try {
    const port = portData.find(p => p.name === portName);
    if (!port) {
      throw new Error(`Port ${portName} not found`);
    }

    const response = await axios.get(port.url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for port ${portName}:`, error.message);
    return null;
  }
}

async function fetchAllPortsData() {
  const results = await Promise.all(portData.map(async (port) => {
    const data = await fetchPortData(port.name);
    return { name: port.name, data };
  }));
  return results.filter(result => result.data !== null);
}

module.exports = {
  fetchPortData,
  fetchAllPortsData
};
