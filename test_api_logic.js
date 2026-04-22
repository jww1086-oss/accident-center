const https = require('https');

const url = 'https://apis.data.go.kr/B552468/news_api02/getNews_api02?serviceKey=a30f91c128600f0935b421b583b0102300e96384e6a45ae868ecf9a643c014e9&callApiId=1040&pageNo=1&numOfRows=3000&_type=json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const items = json.body.items.item;
        
        let c25_jan_apr = 0;
        let nowMonth = 4;
        let nowDay = 22;

        for (const item of items) {
            const rawKeyword = (item.keyword || '').normalize('NFC').trim();
            const metaMatch = rawKeyword.match(/\[(\d{1,2})[\/\.\-](\d{1,2}),?\s*([^\]]+)\]/);
            
            if (metaMatch) {
                const mStr = metaMatch[1].padStart(2, '0');
                const dStr = metaMatch[2].padStart(2, '0');
                const itemMonth = parseInt(mStr);
                const itemDay = parseInt(dStr);
                
                let itemYear = 2026;
                // 미래 날짜 보정: 현재 날짜보다 미래인 경우 작년 데이터로 간주
                // 여기서 문제! 만약 2025년 3월 데이터라면?
                // API는 연도를 주지 않는다! [3/15, 서울] 이렇게 준다.
                // 지금 내 로직: itemMonth(3) > 4 는 false. 그러므로 itemYear는 2026이 된다!!!
                // 아아아아아!!!!
            }
        }
    });
});
