const http = require('http');
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fetchAndExtractData = require('./docs/fetchDisaster');
const cheerio = require('cheerio');

// Initialize the app
const app = express();
const port = process.env.PORT || 3000; // Changed port to 4000

// CORS configuration
let corsOptions = {
    origin: '*',
    // credentials: true
};

app.use(cors(corsOptions));

// Serve static files from the "docs" directory
app.use(express.static(path.join(__dirname, 'docs')));
app.use(express.json());

// Proxy setup for Google News
app.use(
    '/api/news',
    createProxyMiddleware({
        target: 'https://news.google.com',
        changeOrigin: true,
        pathRewrite: {
            '^/api/news': '',
        },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('origin', 'https://news.google.com');
        },
    })
);


function getFormattedDate(offsetDays) {
    const today = new Date();
    today.setDate(today.getDate() - offsetDays); // offsetDays만큼 날짜 조정
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}


// Fetch data Articles
async function fetchArticles() {
  const url = 'https://www.haesainfo.com/news/articleList.html?sc_section_code=S1N2&view_type=sm';
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log('Status Code:', response.status); // 상태 코드 확인
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const articles = [];
      $('section#section-list ul.type2 li').each((i, elem) => {
        const titleElement = $(elem).find('h4.titles a');
        const title = titleElement.text().trim();
        const link = `https://www.haesainfo.com${titleElement.attr('href')}`;
        const date = $(elem).find('span.byline em').last().text().trim();

        articles.push({ title, link, date });
      });
            return articles;
    }
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

fetchArticles().then(articles => console.log(articles));

// Fetch data Reports
async function fetchReports() {
  const baseUrl = 'https://www.kmi.re.kr/web/trebook/list.do?rbsIdx=135&page=';
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  };
  const totalPages = 10;
  const reports = [];

  for (let page = 1; page <= totalPages; page++) {
    const url = `${baseUrl}${page}`;
    try {
      const { data } = await axios.get(url, { headers });  // 헤더 추가
      const $ = cheerio.load(data);

      $('td.row').each((index, element) => {
        const titleElement = $(element).find('a').first();
        const title = titleElement.attr('title') || 'Weekly Report';

        // PDF 보기 링크 가져오기
        const viewerLink = $(element).find('a').eq(1).attr('href');

        if (title && viewerLink) {
          reports.push({
            title: title.replace('File Download', '').trim(),
            link: `https://www.kmi.re.kr${viewerLink}`  // 링크 앞에 도메인 추가
          });
        }
      });
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
    }
  }

  return reports;
}


// Fetch data functions
const fetchGlobalExports = async () => {
    const url = "https://www.econdb.com/widgets/global-trade/data/?type=export&net=0&transform=0";
    const response = await axios.get(url);
    if (response.status === 200) {
        const data = response.data;
        if (data.plots && data.plots.length > 0) {
            return data.plots[0].data;
        }
    }
    return null;
};

const fetchScfi = async () => {
    const url = "https://www.econdb.com/widgets/shanghai-containerized-index/data/";
    const response = await axios.get(url);
    if (response.status === 200) {
        const data = response.data;
        if (data.plots && data.plots.length > 0) {
            return {
                data: data.plots[0].data,
                series: data.plots[0].series,
                footnote: data.plots[0].footnote
            };
        }
    }
    return null;
};

const fetchPortComparison = async () => {
    const url = "https://www.econdb.com/widgets/top-port-comparison/data/";
    const response = await axios.get(url);
    if (response.status === 200) {
        const data = response.data;
        if (data.plots && data.plots.length > 0) {
            return data.plots[0].data;
        }
    }
    return null;
};

const fetchPortData = async () => {
    const url = "https://www.econdb.com/maritime/search/ports/?ab=-62.933895117588925%2C-138.84538637063213%2C75.17530232751466%2C150.31476987936844&center=17.35344883620718%2C5.734691754366622";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
        return response.data.response.docs;
    }
    return null;
};

const fetchPortmap = async () => {
    const url = "https://www.econdb.com/maritime/search/ports/?ab=-62.933895117588925%2C-138.84538637063213%2C75.17530232751466%2C150.31476987936844&center=17.35344883620718%2C5.734691754366622";
    const headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
        return response.data.response.docs;
    }
    return null;
};

// Fetch and process data functions
const processData = (title, data) => {
    if (!data || !Array.isArray(data) || data.length < 2) {
        console.error(`Invalid data for ${title}`);
        return null;
    }

    let previous_value = null;
    const differences = [];

    data.forEach(item => {
        const timestamp = item[0];
        const date = new Date(timestamp).toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
        item[0] = date;

        const current_value = item[1];
        if (previous_value !== null) {
            const difference = current_value - previous_value;
            differences.push(difference);
        }
        previous_value = current_value;
    });

    let latest_value = data[data.length - 1][1];
    let second_last_value = data[data.length - 2][1];
    let final_difference = latest_value - second_last_value;
    let percentage = ((final_difference / second_last_value) * 100).toFixed(2);

    return {
        title: title,
        data: data,
        finalDifference: final_difference,
        percentage: percentage
    };
};

const fetchData = async (title, url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return processData(title, response.data);
    } catch (error) {
        console.error(`Failed to fetch data for ${title}:`, error);
        return null;
    }
};

const urls = {
    "BDI": "https://www.ksg.co.kr/upload/shipschedule_jsons/bdi_free.json",
    "SCFI": "https://www.ksg.co.kr/upload/shipschedule_jsons/main_scfi_total_free.json"
};

// Fetch BDI Data
const fetchBdiData = async () => {
    try {
        const url = 'https://www.ksg.co.kr/upload/shipschedule_jsons/bdi_free.json';
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return processData('BDI', response.data);
    } catch (error) {
        console.error('Failed to fetch BDI data:', error);
        return null;
    }
};

// Fetch HRCI Data
const fetchHrciData = async () => {
    try {
        const url = 'https://www.ksg.co.kr/upload/shipschedule_jsons/main_hrci.json';
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return processData('HRCI', response.data);
    } catch (error) {
        console.error('Failed to fetch HRCI data:', error);
        return null;
    }
};

// Fetch SCFI Data
const fetchScfiData = async () => {
    try {
        const url = 'https://www.ksg.co.kr/upload/shipschedule_jsons/main_scfi_total_free.json';
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return processData('SCFI', response.data);
    } catch (error) {
        console.error('Failed to fetch SCFI data:', error);
        return null;
    }
};

// Fetch KCCI Data
const fetchKcciData = async () => {
    try {
        const url = 'https://www.ksg.co.kr/upload/shipschedule_jsons/kcci_main_free.json';
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return processData('KCCI', response.data);
    } catch (error) {
        console.error('Failed to fetch KCCI data:', error);
        return null;
    }
};

// Fetch KDCI Data
const fetchKdciData = async () => {
    try {
        const url = 'https://www.ksg.co.kr/upload/shipschedule_jsons/kdci_main_free.json';
        const response = await axios.get(url);
        if (response.status !== 200) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return processData('KDCI', response.data);
    } catch (error) {
        console.error('Failed to fetch KDCI data:', error);
        return null;
    }
};

// Proxy setup for media sources
const mediaSources = {
    Freight: 'https://www.shipshipship.uk/search?q=Ocean%20container%20freight%20rates%20in%20Asia&sort_by=recency&since=week',
    Splash: 'https://www.shipshipship.uk/publications/6/splash-247',
    Lloyd: 'https://www.shipshipship.uk/publications/3/lloyds-list',
    Loadstar: 'https://www.shipshipship.uk/publications/39/loadstar',
    Intelligence: 'https://www.shipshipship.uk/publications/362/sea-intelligence',
    Seanews: 'https://seanews.ru/en/category/news/'
};

const parseMedia = {
    'Freight': ($) => {
        const articles = [];
        $('.search-result-title a').each((index, element) => {
            const title = $(element).text().trim();
            const articleUrl = 'https://www.shipshipship.uk' + $(element).attr('href');
            articles.push({ title, url: articleUrl });
            if (articles.length >= 5) return false; // Limit to 5 articles
        });
        return articles;
    },
    'Splash': ($) => {
        const articles = [];
        $('li.post a').each((index, element) => {
            const title = $(element).text().trim();
            const articleUrl = 'https://www.shipshipship.uk' + $(element).attr('href');
            articles.push({ title, url: articleUrl });
            if (articles.length >= 5) return false; // Limit to 5 articles
        });
        return articles;
    },
    'Lloyd': ($) => {
        const articles = [];
        $('li.post a').each((index, element) => {
            const title = $(element).text().trim();
            const articleUrl = 'https://www.shipshipship.uk' + $(element).attr('href');
            articles.push({ title, url: articleUrl });
            if (articles.length >= 5) return false; // Limit to 5 articles
        });
        return articles;
    },
    'Loadstar': ($) => {
        const articles = [];
        $('li.post a').each((index, element) => {
            const title = $(element).text().trim();
            const articleUrl = 'https://www.shipshipship.uk' + $(element).attr('href');
            articles.push({ title, url: articleUrl });
            if (articles.length >= 5) return false; // Limit to 5 articles
        });
        return articles;
    },
    'Intelligence': ($) => {
        const articles = [];
        $('li.post a').each((index, element) => {
            const title = $(element).text().trim();
            const articleUrl = 'https://www.shipshipship.uk' + $(element).attr('href');
            articles.push({ title, url: articleUrl });
            if (articles.length >= 5) return false; // Limit to 5 articles
        });
        return articles;
    },
    'Seanews': ($) => {
        const articles = [];
        $('.category_item_cont').each((index, element) => {
            const title = $(element).find('.category_item_title').text().trim();
            const link = 'https://seanews.ru' + $(element).find('.category_item_title').attr('href');
            if (title && link) {
                articles.push({ title, url: link });
            }
            if (articles.length >= 5) return false; // Limit to 5 articles
        });
        return articles;
    }
};


// Endpoints for data fetching
app.get('/global-exports', async (req, res) => {
    const data = await fetchGlobalExports();
    res.json(data);
});

app.get('/scfi', async (req, res) => {
    const data = await fetchScfi();
    res.json(data);
});

app.get('/port-comparison', async (req, res) => {
    const data = await fetchPortComparison();
    res.json(data);
});

app.get('/port-data', async (req, res) => {
    const data = await fetchPortData();
    res.json(data);
});

app.get('/port-map', async (req, res) => {
    const data = await fetchPortmap();
    res.json(data);
});

// Fetch disaster data
app.get('/disaster-data', async (req, res) => {
    const url = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/ARCHIVE?eventlist=EQ;TC;FL;VO;WF';
    const data = await fetchAndExtractData(url);
    res.json(data);
});


app.get('/data', async (req, res) => {
    const bdiData = await fetchBdiData();
    const hrciData = await fetchHrciData();
    const scfiData = await fetchScfiData();
    const kcciData = await fetchKcciData();
    const kdciData = await fetchKdciData();

    res.json([bdiData, hrciData, scfiData, kcciData, kdciData]);
});

app.get('/data/bdi', async (req, res) => {
    const data = await fetchBdiData();
    res.json(data);
});

app.get('/data/scfi', async (req, res) => {
    const data = await fetchScfiData();
    res.json(data);
});

app.get('/data/kcci', async (req, res) => {
    const data = await fetchKcciData();
    res.json(data);
});

app.get('/bdi-difference', async (req, res) => {
    const result = await fetchBdiData();
    if (result !== null) {
        res.json(result);
    } else {
        res.status(500).send('Failed to fetch BDI data');
    }
});

app.get('/data/:type', async (req, res) => {
    const type = req.params.type.toUpperCase();
    const url = urls[type];
    if (url) {
        const data = await fetchData(type, url);
        res.json(data);
    } else {
        res.status(404).send('Invalid data type');
    }
});

app.get('/media/:source', async (req, res) => {
    const source = req.params.source;
    const url = mediaSources[source];
    
    if (url) {
        try {
            const response = await axios.get(url);
            const html = response.data;
            const $ = cheerio.load(html);
            const articles = parseMedia[source]($);

            res.json({ articles });
        } catch (error) {
            console.error(`Error fetching media for ${source}:`, error);
            res.status(500).send('Failed to fetch media');
        }
    } else {
        res.status(404).send('Invalid media source');
    }
});

app.get('/api/articles', async (req, res) => {
  const articles = await fetchArticles();
  res.json(articles);
});

app.get('/api/weekly', async (req, res) => {
  try {
    const downloads = await fetchReports();  // fetchReports 함수 호출
    res.json(downloads);  // 클라이언트로 JSON 형식으로 응답
  } catch (error) {
    console.error('Error fetching weekly reports:', error);
    res.status(500).json({ error: 'Failed to fetch weekly reports' });
  }
});

//fetch Data news1
// 기사 데이터를 가져오는 API 엔드포인트 (경로: /api/data1)
// 웹사이트에서 기사 데이터를 fetching하는 함수
app.get('/logis-news/:page', async (req, res) => {
    try {
        const page = parseInt(req.params.page, 10) || 1;
        const dateString = getFormattedDate(page - 1);

        const url = `https://www.forwarder.kr/logis_news/${dateString}`;
        console.log(`Fetching data from URL: ${url}`);

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const newsList = [];

        $('.news-list .news-item').each((index, element) => {
            const title = $(element).find('.news-title a').text();
            const link = $(element).find('.news-title a').attr('href');
            const content = $(element).find('.news-content').text();
            let sourceText = $(element).find('.news-source').text();

            if (sourceText.startsWith('출처 : ')) {
                sourceText = sourceText.replace('출처 : ', '').split(' - ')[0].trim();
            }

            newsList.push({
                title,
                link,
                content,
                source: sourceText
            });
        });

        res.json(newsList);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

// Array of URLs to fetch
const urls = [
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

// Function to fetch data in chunks
async function fetchInChunks(urls, chunkSize, delayTime) {
  const results = [];

  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);

    // Fetch all URLs in the current chunk
    const fetchPromises = chunk.map(url => axios.get(url));
    const responses = await Promise.all(fetchPromises);

    // Extract data from response.docs and add to results
    responses.forEach(response => {
      if (response.data && response.data.response && response.data.response.docs) {
        results.push(...response.data.response.docs);
      }
    });

    // Wait for the specified delay before the next chunk
    if (i + chunkSize < urls.length) {
      await delay(delayTime);
    }
  }

  return results;
}

app.get('/coord', async (req, res) => {
  try {
    // Fetch data in chunks of 5 URLs with a 5000ms (5 seconds) delay between each chunk
    const data = await fetchInChunks(urls, 5, 5000);

    // Send extracted data as JSON response
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching data');
  }
});




// Serve index.html for all routes to support client-side routing
app.get('*', (req, res) => {
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Date': Date.now()
    });
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
