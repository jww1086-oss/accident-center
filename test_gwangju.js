const https = require('https');

const url = 'https://apis.data.go.kr/B552468/news_api02/getNews_api02?serviceKey=a30f91c128600f0935b421b583b0102300e96384e6a45ae868ecf9a643c014e9&callApiId=1040&pageNo=1&numOfRows=100&_type=json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const json = JSON.parse(data);
        const items = json.body.items.item;
        
        let count = 0;
        for (const item of items) {
            const rawKeyword = (item.keyword || '').normalize('NFC').trim();
            const metaMatch = rawKeyword.match(/\[(\d{1,2})[\/\.\-](\d{1,2}),?\s*([^\]]+)\]/);
            let region = "전국";
            
            if (metaMatch) {
                const fullRegionText = metaMatch[3].normalize('NFC').trim();
                let rawRegion = fullRegionText.split(' ')[0];
                const regionMap = {
                    '광주광역시':'광주', '전라남도':'전남', '전라북도':'전북', '경상남도':'경남', 
                    '경상북도':'경북', '충청남도':'충남', '충청북도':'충북', '제주특별자치도':'제주',
                    '서울특별시':'서울', '부산광역시':'부산', '대구광역시':'대구', '인천광역시':'인천',
                    '대전광역시':'대전', '울산광역시':'울산', '세종특별자치시':'세종', '경기도':'경기', '강원도':'강원'
                };
                region = (regionMap[rawRegion] || rawRegion.substring(0, 2)).normalize('NFC');
                if (fullRegionText.includes('광주') && (fullRegionText.includes('경기') || fullRegionText.includes('경기도'))) {
                    region = '경기'.normalize('NFC');
                } else if (fullRegionText.includes('광주') && !fullRegionText.includes('경기')) {
                    region = '광주'.normalize('NFC');
                }
            } else {
                const kNormal = rawKeyword.normalize('NFC');
                if (kNormal.includes('광주')) {
                    if (kNormal.includes('경기') || kNormal.includes('경기도')) {
                        region = '경기'.normalize('NFC');
                    } else {
                        region = '광주'.normalize('NFC');
                    }
                } else {
                    const regs = ['서울', '경기', '부산', '대구', '인천', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
                    for (const r of regs) {
                        if (kNormal.includes(r.normalize('NFC'))) { region = r.normalize('NFC'); break; }
                    }
                }
            }
            if (region === '광주' || rawKeyword.includes('광주')) {
                console.log(`Original: ${rawKeyword}`);
                console.log(`Region: ${region}`);
                console.log('---');
                count++;
            }
        }
        console.log("Total Gwangju entries: ", count);
    });
});
