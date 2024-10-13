async function renderPortComparisonChart() {
    const portComparisonData = await fetchData('port-comparison');
    if (portComparisonData && portComparisonData.plots && portComparisonData.plots.length > 0) {
        const plot = portComparisonData.plots[0];
        const portNames = plot.data.map(item => item.name);
        const series = plot.series;
        
        const traces = series.map(s => {
            const code = s.code;
            return {
                y: portNames,
                x: plot.data.map(item => item[code]),
                type: 'bar',
                name: s.name,
                marker: { color: s.code.includes('24') ? 'indigo' : 'purple' },
                orientation: 'h'
            };
        });

        const portLayout = {
            title: plot.title,
            xaxis: { title: 'Thousand TEU' },
            yaxis: { title: '' },
            barmode: 'group',
            height: 600, // 차트 높이 설정
            margin: { l: 150 } // 왼쪽 여백 증가 (port 이름이 잘리지 않도록)
        };

        Plotly.newPlot('portComparisonChart', traces, portLayout);
    } else {
        console.error('Invalid or empty port comparison data');
    }
}
