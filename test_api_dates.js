const https = require('https');

const url = 'https://apis.data.go.kr/B552468/news_api02/getNews_api02?serviceKey=a30f91c128600f0935b421b583b0102300e96384e6a45ae868ecf9a643c014e9&callApiId=1040&pageNo=1&numOfRows=3000&_type=json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const items = json.body.items.item;
        console.log("Total items:", items.length);
        
        let c25 = 0;
        let c26 = 0;
        
        for (const item of items) {
            const rawKeyword = (item.keyword || '').normalize('NFC').trim();
            const metaMatch = rawKeyword.match(/\[(\d{1,2})[\/\.\-](\d{1,2}),?\s*([^\]]+)\]/);
            
            if (metaMatch) {
                const mStr = metaMatch[1].padStart(2, '0');
                const dStr = metaMatch[2].padStart(2, '0');
                const itemMonth = parseInt(mStr);
                const itemDay = parseInt(dStr);
                
                let itemYear = 2026;
                // 미래 날짜 보정: 현재 4월 22일 기준
                if (itemMonth > 4 || (itemMonth === 4 && itemDay > 22)) {
                    itemYear = 2025;
                }
                
                if (itemYear === 2025) c25++;
                if (itemYear === 2026) c26++;
            }
        }
        console.log(`2025: ${c25}, 2026: ${c26}`);
    });
});
