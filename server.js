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
const { fetchUrls, fetchUrlData } = require('./docs/coord');

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


app.get('/coord', async (req, res) => {
  try {
    const fetchPromises = fetchUrls.map(async url => {
      const data = await fetchUrlData(url);
      return { url, data };
    });

    const results = await Promise.all(fetchPromises);
    
    res.json(results);
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
