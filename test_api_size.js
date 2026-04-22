const https = require('https');

const url = 'https://apis.data.go.kr/B552468/news_api02/getNews_api02?serviceKey=a30f91c128600f0935b421b583b0102300e96384e6a45ae868ecf9a643c014e9&callApiId=1040&pageNo=1&numOfRows=3000&_type=json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Raw JSON Size:", (data.length / 1024 / 1024).toFixed(2), "MB");
        const json = JSON.parse(data);
        const items = json.body.items.item;
        
        const mappedItems = items.map((item) => {
            return {
                ...item,
                contents: (item.contents || '').replace(/&nbsp;/g, ' ').replace(/src=['"]\//g, "src='https://www.kosha.or.kr/").replace(/(<br\s*\/?>[\s\u00A0]*)+/gi, '<br>').trim(),
                keyword: item.keyword,
                _parsed: { date: "2026-01-01", region: "서울" }
            };
        });
        
        const stringified = JSON.stringify(mappedItems);
        console.log("Parsed & Stringified Size:", (stringified.length / 1024 / 1024).toFixed(2), "MB");
    });
});
