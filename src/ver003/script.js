// === 입력값 포맷 (천 단위 콤마, 소수점 허용) ===
function formatInput(input) {
    let cursorPosition = input.selectionStart;
    let originalLength = input.value.length;

    let value = input.value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts[0].length > 0) {
        parts[0] = parseInt(parts[0], 10).toLocaleString('ko-KR');
    }

    input.value = parts.join('.');

    let newLength = input.value.length;
    cursorPosition = cursorPosition + (newLength - originalLength);
    input.setSelectionRange(cursorPosition, cursorPosition);
}

// === 콤마 포함 문자열 → 숫자 ===
function parseNumber(str) {
    if (!str) return 0;
    return parseFloat(str.replace(/,/g, '')) || 0;
}

// === KRW 포맷 ===
function formatKRW(num) {
    return Math.round(num).toLocaleString('ko-KR') + '원';
}

// === 도넛 차트 업데이트 ===
function updateDonutChart(costFilament, costElec, costDepreciation, costLabor, costOther) {
    const circumference = 2 * Math.PI * 46; // ≈ 289.03

    const segments = [
        { segId: 'segFilament',     pctId: 'pctFilament',     value: costFilament },
        { segId: 'segElec',         pctId: 'pctElec',         value: costElec },
        { segId: 'segDepreciation', pctId: 'pctDepreciation', value: costDepreciation },
        { segId: 'segLabor',        pctId: 'pctLabor',        value: costLabor },
        { segId: 'segOther',        pctId: 'pctOther',        value: costOther },
    ];

    const total = segments.reduce((sum, s) => sum + Math.max(s.value, 0), 0);
    let cumulativeLen = 0;

    segments.forEach(seg => {
        const el = document.getElementById(seg.segId);
        const pctEl = document.getElementById(seg.pctId);
        if (!el) return;

        const value = Math.max(seg.value, 0);
        const portion = total > 0 ? value / total : 0;
        const segLen = portion * circumference;

        el.style.strokeDasharray = `${segLen} ${circumference - segLen}`;
        el.style.strokeDashoffset = `-${cumulativeLen}`;

        cumulativeLen += segLen;

        if (pctEl) {
            pctEl.textContent = total > 0 ? Math.round(portion * 100) + '%' : '0%';
        }
    });

    // 도넛 중앙 총 원가
    const donutTotal = document.getElementById('donutTotal');
    if (donutTotal) donutTotal.textContent = formatKRW(total);
}

// === 메인 계산 함수 ===
function calculate() {
    // 입력값 파싱
    const printQuantity  = parseNumber(document.getElementById('printQuantity').value) || 1;
    const filamentUsage  = parseNumber(document.getElementById('filamentUsage').value);
    const plaPrice       = parseNumber(document.getElementById('plaPrice').value);
    const printTime      = parseNumber(document.getElementById('printTime').value);
    const elecRate       = parseNumber(document.getElementById('elecRate').value);
    const powerUsage     = parseNumber(document.getElementById('powerUsage').value);

    const printerPrice   = parseNumber(document.getElementById('printerPrice').value);
    const printerLife    = parseNumber(document.getElementById('printerLife').value) || 1;
    const nozzlePrice    = parseNumber(document.getElementById('nozzlePrice').value);
    const nozzleLife     = parseNumber(document.getElementById('nozzleLife').value) || 1;
    const amsPrice       = parseNumber(document.getElementById('amsPrice').value);
    const amsLife        = parseNumber(document.getElementById('amsLife').value) || 1;
    const otherCost      = parseNumber(document.getElementById('otherCost').value);

    const laborCost      = parseNumber(document.getElementById('laborCost').value);
    const packageCost    = parseNumber(document.getElementById('packageCost').value);
    const lossRate       = parseNumber(document.getElementById('lossRate').value);
    const designCost     = parseNumber(document.getElementById('designCost').value);
    const marketingCost  = parseNumber(document.getElementById('marketingCost').value);
    const platformFeeRate = parseNumber(document.getElementById('platformFeeRate').value);
    const marginRate     = parseNumber(document.getElementById('marginRate').value);

    // === 원가 계산 (1회 총액) ===
    const costFilament   = filamentUsage * (plaPrice / 1000);
    const costElec       = (powerUsage / 1000) * printTime * elecRate;
    const costPrinter    = (printerPrice / printerLife) * printTime;
    const costNozzle     = (nozzlePrice / nozzleLife) * printTime;
    const costAms        = (amsPrice / amsLife) * printTime;
    const costDepreciation = costPrinter + costNozzle + costAms;

    const baseCost       = costFilament + costElec + costPrinter + costNozzle + costAms + otherCost;
    const costLoss       = baseCost * (lossRate / 100);
    const costLaborTotal = laborCost + packageCost + designCost + marketingCost;
    const totalCost      = baseCost + costLoss + laborCost + packageCost + designCost + marketingCost;

    // === 판매가 계산 ===
    const totalRate = marginRate + platformFeeRate;
    let sellPriceEx = totalRate >= 100 ? totalCost : totalCost / (1 - totalRate / 100);
    const costPlatformFee = sellPriceEx * (platformFeeRate / 100);
    const sellPriceInc    = sellPriceEx * 1.1;
    const marginAmt       = sellPriceEx - totalCost - costPlatformFee;

    // === 개당 금액 ===
    const perItem = (v) => v / printQuantity;

    // === 결과 테이블 업데이트 ===
    document.getElementById('resFilament').innerText         = formatKRW(costFilament);
    document.getElementById('resElec').innerText             = formatKRW(costElec);
    document.getElementById('resPrinter').innerText          = formatKRW(costPrinter);
    document.getElementById('resNozzle').innerText           = formatKRW(costNozzle);
    document.getElementById('resAms').innerText              = formatKRW(costAms);
    document.getElementById('resOther').innerText            = formatKRW(otherCost);
    document.getElementById('resLoss').innerText             = formatKRW(costLoss);
    document.getElementById('resLabor').innerText            = formatKRW(laborCost);
    document.getElementById('resPackage').innerText          = formatKRW(packageCost);
    document.getElementById('resDesign').innerText           = formatKRW(designCost);
    document.getElementById('resMarketing').innerText        = formatKRW(marketingCost);
    document.getElementById('resTotalCost').innerText        = formatKRW(totalCost);
    document.getElementById('resTotalCost2').innerText       = formatKRW(totalCost);
    document.getElementById('resPlatformFee').innerText      = formatKRW(costPlatformFee);
    document.getElementById('resMarginAmt').innerText        = formatKRW(marginAmt);
    document.getElementById('resSellPriceEx').innerText      = formatKRW(sellPriceEx);
    document.getElementById('resSellPriceInc').innerText     = formatKRW(sellPriceInc);

    document.getElementById('resFilamentPerItem').innerText    = formatKRW(perItem(costFilament));
    document.getElementById('resElecPerItem').innerText        = formatKRW(perItem(costElec));
    document.getElementById('resPrinterPerItem').innerText     = formatKRW(perItem(costPrinter));
    document.getElementById('resNozzlePerItem').innerText      = formatKRW(perItem(costNozzle));
    document.getElementById('resAmsPerItem').innerText         = formatKRW(perItem(costAms));
    document.getElementById('resOtherPerItem').innerText       = formatKRW(perItem(otherCost));
    document.getElementById('resLossPerItem').innerText        = formatKRW(perItem(costLoss));
    document.getElementById('resLaborPerItem').innerText       = formatKRW(perItem(laborCost));
    document.getElementById('resPackagePerItem').innerText     = formatKRW(perItem(packageCost));
    document.getElementById('resDesignPerItem').innerText      = formatKRW(perItem(designCost));
    document.getElementById('resMarketingPerItem').innerText   = formatKRW(perItem(marketingCost));
    document.getElementById('resTotalCostPerItem').innerText   = formatKRW(perItem(totalCost));
    document.getElementById('resTotalCost2PerItem').innerText  = formatKRW(perItem(totalCost));
    document.getElementById('resPlatformFeePerItem').innerText = formatKRW(perItem(costPlatformFee));
    document.getElementById('resMarginAmtPerItem').innerText   = formatKRW(perItem(marginAmt));
    document.getElementById('resSellPriceExPerItem').innerText = formatKRW(perItem(sellPriceEx));
    document.getElementById('resSellPriceIncPerItem').innerText = formatKRW(perItem(sellPriceInc));

    // === KPI 카드 업데이트 ===
    document.getElementById('kpiTotalCost').innerText      = formatKRW(perItem(totalCost));
    document.getElementById('kpiTotalCostBatch').innerText = formatKRW(totalCost);
    document.getElementById('kpiSellPrice').innerText      = formatKRW(perItem(sellPriceInc));
    document.getElementById('kpiSellPriceEx').innerText    = formatKRW(perItem(sellPriceEx));
    document.getElementById('kpiMargin').innerText         = formatKRW(perItem(marginAmt));

    const roiPct = totalCost > 0 ? (marginAmt / totalCost) * 100 : 0;
    document.getElementById('kpiROI').innerText            = roiPct.toFixed(1) + '%';
    document.getElementById('kpiMarginRateDisplay').innerText = marginRate.toFixed(0) + '%';

    // === 도넛 차트 업데이트 ===
    const costOtherTotal = otherCost + costLoss;
    updateDonutChart(costFilament, costElec, costDepreciation, costLaborTotal, costOtherTotal);
}

// === 사이드바 토글 (모바일) ===
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    calculate();
});
