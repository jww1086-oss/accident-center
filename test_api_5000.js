const https = require('https');

const url = 'https://apis.data.go.kr/B552468/news_api02/getNews_api02?serviceKey=a30f91c128600f0935b421b583b0102300e96384e6a45ae868ecf9a643c014e9&callApiId=1040&pageNo=1&numOfRows=5000&_type=json';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const items = json.body.items.item;
            console.log("Total items fetched with 5000:", items.length);
        } catch (e) {
            console.log("Error:", e.message);
        }
    });
});
