document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 서버에서 데이터 가져오기
        const response = await fetch('/api/weekly');
        const reports = await response.json();

        const tableBody = document.getElementById('report-table-body');

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
        console.error('Error fetching reports:', error);
        const tableBody = document.getElementById('report-table-body');
        tableBody.innerHTML = '<tr><td colspan="2">Failed to load reports. Please try again later.</td></tr>';
    }
});
