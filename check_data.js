async function checkData() {
    const serviceKey = 'a30f91c128600f0935b421b583b0102300e96384e6a45ae868ecf9a643c014e9';
    const url = `https://apis.data.go.kr/B552468/news_api02/getNews_api02?serviceKey=${serviceKey}&callApiId=1040&pageNo=1&numOfRows=100&_type=json`;

    try {
        const response = await fetch(url);
        const result = await response.json();
        const items = result.body?.items?.item;

        if (!items) {
            console.log('공공데이터 항목을 찾을 수 없습니다.');
            return;
        }

        const itemList = Array.isArray(items) ? items : [items];
        const count = itemList.length;
        
        const dateRegex = /(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/; // 2026. 4. 9.
        const shortDateRegex = /\[(\d{1,2})\/(\d{1,2})/; // [4/9]
        
        let allDates = [];

        itemList.forEach(item => {
            const content = item.contents || '';
            const keyword = item.keyword || '';
            
            const match = content.match(dateRegex);
            if (match) {
                allDates.push(new Date(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`));
            } else {
                const shortMatch = keyword.match(shortDateRegex);
                if (shortMatch) {
                    // Assume 2026 if not specified
                    allDates.push(new Date(`2026-${shortMatch[1].padStart(2, '0')}-${shortMatch[2].padStart(2, '0')}`));
                }
            }
        });

        if (allDates.length > 0) {
            const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
            const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
            
            console.log(`건수: ${count}건`);
            console.log(`기간: ${minDate.toISOString().split('T')[0]} ~ ${maxDate.toISOString().split('T')[0]}`);
        } else {
            console.log(`건수: ${count}건`);
            console.log(`기간: 날짜 정보를 추출할 수 없습니다.`);
        }

    } catch (error) {
        console.error('데이터 확인 중 오류:', error);
    }
}

checkData();
