// 입력값에 천 단위 콤마 추가 및 숫자만 허용 (소수점 포함)
function formatInput(input) {
    // 현재 커서 위치 저장
    let cursorPosition = input.selectionStart;
    let originalLength = input.value.length;

    // 숫자와 소수점만 남기고 제거
    let value = input.value.replace(/[^0-9.]/g, '');

    // 소수점이 여러 개일 경우 첫 번째 소수점만 남김
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    // 정수 부분에 천 단위 콤마 추가
    if (parts[0].length > 0) {
        parts[0] = parseInt(parts[0], 10).toLocaleString('ko-KR');
    }

    // 다시 합치기
    input.value = parts.join('.');

    // 커서 위치 보정
    let newLength = input.value.length;
    cursorPosition = cursorPosition + (newLength - originalLength);
    input.setSelectionRange(cursorPosition, cursorPosition);
}

// 콤마가 포함된 문자열을 숫자로 변환
function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, '')) || 0;
}

function calculate() {
    // 입력값 가져오기
    const printQuantity = parseNumber(document.getElementById('printQuantity').value) || 1; // 1회 출력 개수 (기본값 1)
    const filamentUsage = parseNumber(document.getElementById('filamentUsage').value);
    const plaPrice = parseNumber(document.getElementById('plaPrice').value);
    const printTime = parseNumber(document.getElementById('printTime').value);
    const elecRate = parseNumber(document.getElementById('elecRate').value);
    const powerUsage = parseNumber(document.getElementById('powerUsage').value);

    const printerPrice = parseNumber(document.getElementById('printerPrice').value);
    const printerLife = parseNumber(document.getElementById('printerLife').value) || 1;

    const nozzlePrice = parseNumber(document.getElementById('nozzlePrice').value);
    const nozzleLife = parseNumber(document.getElementById('nozzleLife').value) || 1;

    const amsPrice = parseNumber(document.getElementById('amsPrice').value);
    const amsLife = parseNumber(document.getElementById('amsLife').value) || 1;

    const otherCost = parseNumber(document.getElementById('otherCost').value);

    const laborCost = parseNumber(document.getElementById('laborCost').value);
    const packageCost = parseNumber(document.getElementById('packageCost').value);
    const lossRate = parseNumber(document.getElementById('lossRate').value);
    const designCost = parseNumber(document.getElementById('designCost').value);
    const marketingCost = parseNumber(document.getElementById('marketingCost').value);
    const platformFeeRate = parseNumber(document.getElementById('platformFeeRate').value);
    const marginRate = parseNumber(document.getElementById('marginRate').value);

    // 계산 (1회 총 금액)
    const costFilament = filamentUsage * (plaPrice / 1000);
    const costElec = (powerUsage / 1000) * printTime * elecRate;
    const costPrinter = (printerPrice / printerLife) * printTime;
    const costNozzle = (nozzlePrice / nozzleLife) * printTime;
    const costAms = (amsPrice / amsLife) * printTime;

    const baseCost = costFilament + costElec + costPrinter + costNozzle + costAms + otherCost;
    const costLoss = baseCost * (lossRate / 100);
    const totalCost = baseCost + costLoss + laborCost + packageCost + designCost + marketingCost;

    // 판매가 계산 (마진율 + 수수료율 적용: 원가 / (1 - 마진율/100 - 수수료율/100))
    let sellPriceEx = 0;
    const totalRate = marginRate + platformFeeRate;
    if (totalRate >= 100) {
        sellPriceEx = totalCost; // 임시 처리
    } else {
        sellPriceEx = totalCost / (1 - (totalRate / 100));
    }

    const costPlatformFee = sellPriceEx * (platformFeeRate / 100);
    const sellPriceInc = sellPriceEx * 1.1;
    const marginAmt = sellPriceEx - totalCost - costPlatformFee;

    // 포맷팅 함수
    const formatKRW = (num) => Math.round(num).toLocaleString('ko-KR') + '원';

    // 결과 출력 (1회 총 금액)
    document.getElementById('resFilament').innerText = formatKRW(costFilament);
    document.getElementById('resElec').innerText = formatKRW(costElec);
    document.getElementById('resPrinter').innerText = formatKRW(costPrinter);
    document.getElementById('resNozzle').innerText = formatKRW(costNozzle);
    document.getElementById('resAms').innerText = formatKRW(costAms);
    document.getElementById('resOther').innerText = formatKRW(otherCost);

    document.getElementById('resLoss').innerText = formatKRW(costLoss);
    document.getElementById('resLabor').innerText = formatKRW(laborCost);
    document.getElementById('resPackage').innerText = formatKRW(packageCost);
    document.getElementById('resDesign').innerText = formatKRW(designCost);
    document.getElementById('resMarketing').innerText = formatKRW(marketingCost);

    document.getElementById('resTotalCost').innerText = formatKRW(totalCost);
    document.getElementById('resTotalCost2').innerText = formatKRW(totalCost);

    document.getElementById('resPlatformFee').innerText = formatKRW(costPlatformFee);
    document.getElementById('resMarginAmt').innerText = formatKRW(marginAmt);
    document.getElementById('resSellPriceEx').innerText = formatKRW(sellPriceEx);
    document.getElementById('resSellPriceInc').innerText = formatKRW(sellPriceInc);

    // 결과 출력 (개당 금액)
    document.getElementById('resFilamentPerItem').innerText = formatKRW(costFilament / printQuantity);
    document.getElementById('resElecPerItem').innerText = formatKRW(costElec / printQuantity);
    document.getElementById('resPrinterPerItem').innerText = formatKRW(costPrinter / printQuantity);
    document.getElementById('resNozzlePerItem').innerText = formatKRW(costNozzle / printQuantity);
    document.getElementById('resAmsPerItem').innerText = formatKRW(costAms / printQuantity);
    document.getElementById('resOtherPerItem').innerText = formatKRW(otherCost / printQuantity);

    document.getElementById('resLossPerItem').innerText = formatKRW(costLoss / printQuantity);
    document.getElementById('resLaborPerItem').innerText = formatKRW(laborCost / printQuantity);
    document.getElementById('resPackagePerItem').innerText = formatKRW(packageCost / printQuantity);
    document.getElementById('resDesignPerItem').innerText = formatKRW(designCost / printQuantity);
    document.getElementById('resMarketingPerItem').innerText = formatKRW(marketingCost / printQuantity);

    document.getElementById('resTotalCostPerItem').innerText = formatKRW(totalCost / printQuantity);
    document.getElementById('resTotalCost2PerItem').innerText = formatKRW(totalCost / printQuantity);

    document.getElementById('resPlatformFeePerItem').innerText = formatKRW(costPlatformFee / printQuantity);
    document.getElementById('resMarginAmtPerItem').innerText = formatKRW(marginAmt / printQuantity);
    document.getElementById('resSellPriceExPerItem').innerText = formatKRW(sellPriceEx / printQuantity);
    document.getElementById('resSellPriceIncPerItem').innerText = formatKRW(sellPriceInc / printQuantity);
}

// 다크 모드 토글 함수
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeButton(isDarkMode);
}

// 다크 모드 버튼 텍스트 업데이트
function updateDarkModeButton(isDarkMode) {
    const btn = document.getElementById('darkModeToggle');
    if (isDarkMode) {
        btn.innerText = '☀️ 라이트 모드';
    } else {
        btn.innerText = '🌙 다크 모드';
    }
}

// 초기 실행
window.onload = () => {
    // 로컬 스토리지에서 다크 모드 설정 불러오기
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeButton(savedDarkMode);

    // 초기 계산 실행
    calculate();
};