const axios = require('axios');

// Array of URLs to fetch
const fetchUrls = [
  'https://www.econdb.com/maritime/search/?ab=45.0,-36.0,47.368421052631575,-32.21052631578947',
'https://www.econdb.com/maritime/search/?ab=47.368421052631575,-32.21052631578947,49.73684210526315,-28.421052631578945',
'https://www.econdb.com/maritime/search/?ab=49.73684210526316,-28.42105263157895,52.10526315789474,-24.63157894736842',
'https://www.econdb.com/maritime/search/?ab=52.10526315789474,-24.63157894736842,54.473684210526315,-20.842105263157894',
'https://www.econdb.com/maritime/search/?ab=54.473684210526315,-20.842105263157897,56.84210526315789,-17.05263157894737',
'https://www.econdb.com/maritime/search/?ab=56.84210526315789,-17.05263157894737,59.210526315789465,-13.263157894736844',
'https://www.econdb.com/maritime/search/?ab=59.21052631578947,-13.263157894736842,61.578947368421055,-9.473684210526317',
'https://www.econdb.com/maritime/search/?ab=61.578947368421055,-9.473684210526319,63.94736842105263,-5.684210526315793',
'https://www.econdb.com/maritime/search/?ab=63.94736842105263,-5.684210526315791,66.3157894736842,-1.894736842105265',
'https://www.econdb.com/maritime/search/?ab=66.3157894736842,-1.8947368421052673,68.68421052631578,1.8947368421052588',
'https://www.econdb.com/maritime/search/?ab=68.68421052631578,1.8947368421052602,71.05263157894736,5.684210526315786',
'https://www.econdb.com/maritime/search/?ab=71.05263157894737,5.684210526315788,73.42105263157895,9.473684210526313',
'https://www.econdb.com/maritime/search/?ab=73.42105263157895,9.473684210526315,75.78947368421052,13.26315789473684',
'https://www.econdb.com/maritime/search/?ab=75.78947368421052,13.263157894736842,78.1578947368421,17.05263157894737',
'https://www.econdb.com/maritime/search/?ab=78.15789473684211,17.052631578947363,80.52631578947368,20.84210526315789',
'https://www.econdb.com/maritime/search/?ab=80.52631578947368,20.84210526315789,82.89473684210526,24.631578947368418',
'https://www.econdb.com/maritime/search/?ab=82.89473684210526,24.631578947368418,85.26315789473684,28.421052631578945',
'https://www.econdb.com/maritime/search/?ab=85.26315789473684,28.421052631578945,87.63157894736841,32.21052631578947',
'https://www.econdb.com/maritime/search/?ab=87.63157894736841,32.210526315789465,89.99999999999999,35.99999999999999',
'https://www.econdb.com/maritime/search/?ab=0.0,-108.0,7.5,-96.0',
'https://www.econdb.com/maritime/search/?ab=7.5,-96.0,15.0,-84.0',
'https://www.econdb.com/maritime/search/?ab=15.0,-84.0,22.5,-72.0',
'https://www.econdb.com/maritime/search/?ab=22.5,-72.0,30.0,-60.0',
'https://www.econdb.com/maritime/search/?ab=30.0,-60.0,37.5,-48.0',
'https://www.econdb.com/maritime/search/?ab=37.5,-48.0,45.0,-36.0',
'https://www.econdb.com/maritime/search/?ab=0.0,-36.0,4.090909090909091,-29.454545454545453',
'https://www.econdb.com/maritime/search/?ab=4.090909090909091,-29.454545454545453,8.181818181818182,-22.909090909090907',
'https://www.econdb.com/maritime/search/?ab=8.181818181818182,-22.909090909090907,12.272727272727273,-16.36363636363636',
'https://www.econdb.com/maritime/search/?ab=12.272727272727273,-16.363636363636363,16.363636363636363,-9.818181818181817',
'https://www.econdb.com/maritime/search/?ab=16.363636363636363,-9.818181818181817,20.454545454545453,-3.2727272727272707',
'https://www.econdb.com/maritime/search/?ab=20.454545454545453,-3.2727272727272734,24.545454545454543,3.2727272727272725',
'https://www.econdb.com/maritime/search/?ab=24.545454545454547,3.2727272727272734,28.636363636363637,9.81818181818182',
'https://www.econdb.com/maritime/search/?ab=28.636363636363637,9.81818181818182,32.72727272727273,16.363636363636367',
'https://www.econdb.com/maritime/search/?ab=32.72727272727273,16.363636363636367,36.81818181818182,22.909090909090914',
'https://www.econdb.com/maritime/search/?ab=36.81818181818182,22.909090909090914,40.909090909090914,29.45454545454546',
'https://www.econdb.com/maritime/search/?ab=40.90909090909091,29.454545454545453,45.0,36.0',
'https://www.econdb.com/maritime/search/?ab=0.0,36.0,3.4615384615384617,41.53846153846154',
'https://www.econdb.com/maritime/search/?ab=3.4615384615384617,41.53846153846154,6.923076923076923,47.07692307692308',
'https://www.econdb.com/maritime/search/?ab=6.923076923076923,47.07692307692308,10.384615384615385,52.61538461538462',
'https://www.econdb.com/maritime/search/?ab=10.384615384615385,52.61538461538461,13.846153846153847,58.15384615384615',
'https://www.econdb.com/maritime/search/?ab=13.846153846153847,58.15384615384615,17.307692307692307,63.69230769230769',
'https://www.econdb.com/maritime/search/?ab=17.307692307692307,63.69230769230769,20.769230769230766,69.23076923076923',
'https://www.econdb.com/maritime/search/?ab=20.76923076923077,69.23076923076923,24.230769230769234,74.76923076923076',
'https://www.econdb.com/maritime/search/?ab=24.230769230769234,74.76923076923077,27.692307692307693,80.3076923076923',
'https://www.econdb.com/maritime/search/?ab=27.692307692307693,80.3076923076923,31.153846153846153,85.84615384615384',
'https://www.econdb.com/maritime/search/?ab=31.153846153846153,85.84615384615384,34.61538461538461,91.38461538461537',
'https://www.econdb.com/maritime/search/?ab=34.61538461538461,91.38461538461539,38.07692307692307,96.92307692307692',
'https://www.econdb.com/maritime/search/?ab=38.07692307692308,96.92307692307692,41.53846153846154,102.46153846153845',
'https://www.econdb.com/maritime/search/?ab=41.53846153846154,102.46153846153845,45.0,107.99999999999999',
'https://www.econdb.com/maritime/search/?ab=0.0,108.0,2.3684210526315788,111.78947368421052',
'https://www.econdb.com/maritime/search/?ab=2.3684210526315788,111.78947368421052,4.7368421052631575,115.57894736842104',
'https://www.econdb.com/maritime/search/?ab=4.7368421052631575,115.57894736842105,7.105263157894736,119.36842105263158',
'https://www.econdb.com/maritime/search/?ab=7.105263157894736,119.36842105263158,9.473684210526315,123.1578947368421',
'https://www.econdb.com/maritime/search/?ab=9.473684210526315,123.15789473684211,11.842105263157894,126.94736842105263',
'https://www.econdb.com/maritime/search/?ab=11.842105263157894,126.94736842105263,14.210526315789473,130.73684210526315',
'https://www.econdb.com/maritime/search/?ab=14.210526315789473,130.73684210526315,16.57894736842105,134.52631578947367',
'https://www.econdb.com/maritime/search/?ab=16.57894736842105,134.52631578947367,18.94736842105263,138.3157894736842',
'https://www.econdb.com/maritime/search/?ab=18.94736842105263,138.31578947368422,21.31578947368421,142.10526315789474',
'https://www.econdb.com/maritime/search/?ab=21.31578947368421,142.10526315789474,23.684210526315788,145.89473684210526',
'https://www.econdb.com/maritime/search/?ab=23.684210526315788,145.89473684210526,26.052631578947366,149.68421052631578',
'https://www.econdb.com/maritime/search/?ab=26.052631578947366,149.68421052631578,28.421052631578945,153.4736842105263',
'https://www.econdb.com/maritime/search/?ab=28.421052631578945,153.4736842105263,30.789473684210524,157.26315789473682',
'https://www.econdb.com/maritime/search/?ab=30.789473684210524,157.26315789473685,33.1578947368421,161.05263157894737',
'https://www.econdb.com/maritime/search/?ab=33.1578947368421,161.05263157894737,35.526315789473685,164.8421052631579',
'https://www.econdb.com/maritime/search/?ab=35.526315789473685,164.8421052631579,37.89473684210526,168.6315789473684',
'https://www.econdb.com/maritime/search/?ab=37.89473684210526,168.6315789473684,40.263157894736835,172.42105263157893',
'https://www.econdb.com/maritime/search/?ab=40.263157894736835,172.42105263157896,42.63157894736841,176.21052631578948',
'https://www.econdb.com/maritime/search/?ab=42.63157894736842,176.21052631578948,45.0,180.0',
'https://www.econdb.com/maritime/search/?ab=-45.0,-108.0,-30.0,-84.0',
'https://www.econdb.com/maritime/search/?ab=-30.0,-84.0,-15.0,-60.0',
'https://www.econdb.com/maritime/search/?ab=-15.0,-60.0,0.0,-36.0',
'https://www.econdb.com/maritime/search/?ab=-45.0,-36.0,-30.0,-12.0',
'https://www.econdb.com/maritime/search/?ab=-30.0,-12.0,-15.0,12.0',
'https://www.econdb.com/maritime/search/?ab=-15.0,12.0,0.0,36.0',
'https://www.econdb.com/maritime/search/?ab=-45.0,108.0,-36.0,122.4',
'https://www.econdb.com/maritime/search/?ab=-36.0,122.4,-27.0,136.8',
'https://www.econdb.com/maritime/search/?ab=-27.0,136.8,-18.0,151.20000000000002',
'https://www.econdb.com/maritime/search/?ab=-18.0,151.2,-9.0,165.6',
'https://www.econdb.com/maritime/search/?ab=-9.0,165.6,0.0,180.0',
'https://www.econdb.com/maritime/search/?ab=45.0,-180.0,67.5,-144.0',
'https://www.econdb.com/maritime/search/?ab=67.5,-144.0,90.0,-108.0',
'https://www.econdb.com/maritime/search/?ab=45,-108,90,-36',
'https://www.econdb.com/maritime/search/?ab=45,36,90,108',
'https://www.econdb.com/maritime/search/?ab=45,108,90,180',
'https://www.econdb.com/maritime/search/?ab=0.0,-180.0,22.5,-144.0',
'https://www.econdb.com/maritime/search/?ab=22.5,-144.0,45.0,-108.0',
'https://www.econdb.com/maritime/search/?ab=-45.0,36.0,-22.5,72.0',
'https://www.econdb.com/maritime/search/?ab=-22.5,72.0,0.0,108.0',
'https://www.econdb.com/maritime/search/?ab=-45,36,0,108',
'https://www.econdb.com/maritime/search/?ab=-90,-108,-45,-36',
'https://www.econdb.com/maritime/search/?ab=-90,108,-45,180',
];

// Function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to fetch data in chunks with headers
async function fetchInChunks(chunkSize, delayTime) {
  const results = [];

  for (let i = 0; i < fetchUrls.length; i += chunkSize) {
    const chunk = fetchUrls.slice(i, i + chunkSize);

    // Fetch all URLs in the current chunk with headers
    const fetchPromises = chunk.map(async fetchUrl => {
      try {
        const response = await axios.get(fetchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        // Return the entire response data
        return {
          url: fetchUrl,
          data: response.data.response.docs || []
        };
      } catch (error) {
        console.error(`Error fetching ${fetchUrl}:`, error);
        return { url: fetchUrl, data: [] };  // Return empty array or handle the error as needed
      }
    });

    const responses = await Promise.all(fetchPromises);

    // Add each response to results as a separate JSON object
    results.push(...responses);

    // Wait for the specified delay before the next chunk
    if (i + chunkSize < fetchUrls.length) {
      await delay(delayTime);
    }
  }

  return results;
}

module.exports = { fetchInChunks };

