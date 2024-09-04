document.addEventListener('DOMContentLoaded', async () => {
    // 각 API 경로에 맞는 테이블을 위한 설정
    const apis = [
        { url: '/api/weekly', tableBodyId: 'weekly-report-table-body' },
        { url: '/api/global_weekly', tableBodyId: 'global-weekly-report-table-body' },
        { url: '/api/russia', tableBodyId: 'russia-report-table-body' },
        { url: '/api/america', tableBodyId: 'america-report-table-body' }
    ];

    // 모든 API 경로에 대해 테이블을 생성하는 함수
    async function fetchReports(apiUrl, tableBodyId) {
        try {
            const response = await fetch(apiUrl);
            const reports = await response.json();
            
            const tableBody = document.getElementById(tableBodyId);
            tableBody.innerHTML = ''; // 테이블 초기화

            // 데이터를 테이블 형식으로 추가
            reports.forEach(report => {
                const row = document.createElement('tr');

                // Title 열
                const titleCell = document.createElement('td');
                const titleLink = document.createElement('a');
                titleLink.href = report.link;
                titleLink.textContent = report.title;
                titleLink.target = "_blank";  // 새 탭에서 열기
                titleCell.appendChild(titleLink);
                row.appendChild(titleCell);

                // PDF Link 열
                const linkCell = document.createElement('td');
                const link = document.createElement('a');
                link.href = report.link;
                link.textContent = "Open PDF";
                link.target = "_blank";  // 새 탭에서 열기
                linkCell.appendChild(link);
                row.appendChild(linkCell);

                // 테이블에 행 추가
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error(`Error fetching reports from ${apiUrl}:`, error);
            const tableBody = document.getElementById(tableBodyId);
            tableBody.innerHTML = `<tr><td colspan="2">Failed to load reports. Please try again later.</td></tr>`;
        }
    }

    // 각 API에 대해 데이터를 가져오고 테이블을 렌더링
    apis.forEach(api => {
        fetchReports(api.url, api.tableBodyId);
    });
});
