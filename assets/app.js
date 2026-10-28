/* 双城天气对比 · 数据处理 / DOM 渲染 / 实时刷新 */
(function () {
  'use strict';

  var COORDS = {
    wz: { lat: 31.263, lon: 120.632, name: '苏州吴中', region: '江苏省苏州市 · 江南水乡', elevLabel: '约 4 m' },
    dr: { lat: 33.749, lon: 99.652, name: '果洛达日', region: '青海省果洛州 · 青藏高原', elevLabel: '约 3986 m' }
  };

  /* ---------------- 天气码与图标 ---------------- */
  var WMO = {
    0: '晴', 1: '大部晴朗', 2: '局部多云', 3: '阴',
    45: '雾', 48: '冻雾',
    51: '小毛毛雨', 53: '毛毛雨', 55: '浓毛毛雨', 56: '冻毛毛雨', 57: '冻毛毛雨',
    61: '小雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '冻雨',
    71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
    80: '小阵雨', 81: '阵雨', 82: '强阵雨', 85: '小阵雪', 86: '阵雪',
    95: '雷暴', 96: '雷暴伴冰雹', 99: '雷暴伴冰雹'
  };
  function wmoText(code) { return WMO[code] || '多云'; }
  function wmoGroup(code) {
    if (code === 0 || code === 1) return 'clear';
    if (code === 2) return 'partly';
    if (code === 3) return 'cloud';
    if (code === 45 || code === 48) return 'fog';
    if (code >= 51 && code <= 57) return 'drizzle';
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'thunder';
    return 'cloud';
  }

  var C_SUN = '#f2c14e', C_MOON = '#cfd8ea', C_CLOUD = '#9fb0c9', C_RAIN = '#7ea6ff', C_SNOW = '#e8f0ff', C_BOLT = '#f2b366';
  function iconSVG(code, isDay, size) {
    var g = wmoGroup(code);
    var day = isDay !== 0;
    var s = '<svg viewBox="0 0 64 64" width="' + (size || '100%') + '" height="' + (size || '100%') + '" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    var sun = '<circle cx="32" cy="32" r="11" fill="' + C_SUN + '"/>' +
      '<g stroke="' + C_SUN + '" stroke-width="3.5">' +
      '<line x1="32" y1="8" x2="32" y2="15"/><line x1="32" y1="49" x2="32" y2="56"/>' +
      '<line x1="8" y1="32" x2="15" y2="32"/><line x1="49" y1="32" x2="56" y2="32"/>' +
      '<line x1="15" y1="15" x2="20" y2="20"/><line x1="44" y1="44" x2="49" y2="49"/>' +
      '<line x1="49" y1="15" x2="44" y2="20"/><line x1="20" y1="44" x2="15" y2="49"/></g>';
    var moon = '<path d="M40 12a15 15 0 1 0 12 24 17 17 0 0 1-12-24z" fill="' + C_MOON + '"/>';
    var cloud = '<path d="M20 46h24a9 9 0 0 0 1.6-17.8A13 13 0 0 0 20.5 31 8.5 8.5 0 0 0 20 46z" fill="' + C_CLOUD + '"/>';
    var cloudSmall = '<path d="M18 50h24a8 8 0 0 0 1.4-15.9A11.5 11.5 0 0 0 18.9 36.6 7.6 7.6 0 0 0 18 50z" fill="' + C_CLOUD + '"/>';
    var rays = '<g stroke="' + C_SUN + '" stroke-width="3.5"><line x1="20" y1="14" x2="23" y2="19"/><line x1="34" y1="10" x2="34" y2="16"/><line x1="46" y1="16" x2="42" y2="20"/></g>';
    var raysMoon = '';
    var rainDrops = '<g stroke="' + C_RAIN + '" stroke-width="3.5"><line x1="24" y1="52" x2="21" y2="59"/><line x1="34" y1="52" x2="31" y2="59"/><line x1="44" y1="52" x2="41" y2="59"/></g>';
    var drizzleDrops = '<g stroke="' + C_RAIN + '" stroke-width="3"><line x1="26" y1="52" x2="24" y2="57"/><line x1="38" y1="52" x2="36" y2="57"/></g>';
    var snowFlakes = '<g stroke="' + C_SNOW + '" stroke-width="3"><line x1="24" y1="52" x2="24" y2="58"/><line x1="34" y1="52" x2="34" y2="58"/><line x1="44" y1="52" x2="44" y2="58"/></g>';
    var bolt = '<path d="M32 44l-5 10h6l-3 8 10-13h-6l4-5z" fill="' + C_BOLT + '"/>';
    var fogLines = '<g stroke="' + C_CLOUD + '" stroke-width="3.5"><line x1="14" y1="50" x2="50" y2="50"/><line x1="18" y1="57" x2="46" y2="57"/></g>';
    var body = '';
    switch (g) {
      case 'clear': body = day ? sun : moon; break;
      case 'partly': body = (day ? '<g transform="translate(-6,-6) scale(0.72)"><circle cx="30" cy="30" r="11" fill="' + C_SUN + '"/></g>' + rays : raysMoon + '<g transform="translate(-4,-6) scale(0.7)"><path d="M40 12a15 15 0 1 0 12 24 17 17 0 0 1-12-24z" fill="' + C_MOON + '"/></g>') + cloudSmall; break;
      case 'cloud': body = '<g transform="translate(0,2)">' + cloud + '</g>'; break;
      case 'fog': body = '<g transform="translate(0,-6)">' + cloud + '</g>' + fogLines; break;
      case 'drizzle': body = '<g transform="translate(0,-4)">' + cloud + '</g>' + drizzleDrops; break;
      case 'rain': body = '<g transform="translate(0,-4)">' + cloud + '</g>' + rainDrops; break;
      case 'snow': body = '<g transform="translate(0,-4)">' + cloud + '</g>' + snowFlakes; break;
      case 'thunder': body = '<g transform="translate(0,-4)">' + cloud + '</g>' + bolt; break;
    }
    return s + body + '</svg>';
  }

  /* 小图标：湿度 / 风 / 气压 / 降水 / 紫外线 / 日出 / 日落 */
  function miniIcon(kind) {
    var c = 'currentColor';
    var inner = '';
    if (kind === 'hum') inner = '<path d="M12 3C12 3 5.5 10 5.5 14a6.5 6.5 0 0 0 13 0C18.5 10 12 3 12 3z" stroke="' + c + '" stroke-width="1.8" fill="none"/>';
    else if (kind === 'wind') inner = '<path d="M3 8h9a3 3 0 1 0-3-3M3 12h13a3 3 0 1 1-3 3M3 16h7a2.5 2.5 0 1 1-2.5 2.5" stroke="' + c + '" stroke-width="1.8" fill="none"/>';
    else if (kind === 'pres') inner = '<circle cx="12" cy="13" r="8" stroke="' + c + '" stroke-width="1.8" fill="none"/><path d="M12 13l4-4" stroke="' + c + '" stroke-width="1.8"/><path d="M9 2h6" stroke="' + c + '" stroke-width="1.8"/>';
    else if (kind === 'rain') inner = '<path d="M7 13h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 6.6 3.8 3.8 0 0 0 7 13z" stroke="' + c + '" stroke-width="1.7" fill="none"/><path d="M8 16l-1 3M12 16l-1 3M16 16l-1 3" stroke="' + c + '" stroke-width="1.7"/>';
    else if (kind === 'uv') inner = '<circle cx="12" cy="12" r="4" stroke="' + c + '" stroke-width="1.8" fill="none"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="' + c + '" stroke-width="1.7"/>';
    else if (kind === 'aqi') inner = '<path d="M4 18c0-4 3-6 4-9 1.5 3 3 4 3 7M20 18c0-5-4-7-5-11-2 4-3 5-3 8" stroke="' + c + '" stroke-width="1.7" fill="none"/><path d="M3 18h18" stroke="' + c + '" stroke-width="1.7"/>';
    else if (kind === 'sunrise') inner = '<path d="M12 9a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" stroke="' + c + '" stroke-width="1.8" fill="none"/><path d="M12 3v3M12 3l-2.5 2.5M12 3l2.5 2.5M3 18h18" stroke="' + c + '" stroke-width="1.7"/>';
    else if (kind === 'sunset') inner = '<path d="M12 9a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" stroke="' + c + '" stroke-width="1.8" fill="none"/><path d="M12 6V3M12 6L9.5 3.5M12 6l2.5-2.5M3 18h18" stroke="' + c + '" stroke-width="1.7"/>';
    else if (kind === 'cloth') inner = '<path d="M12 5a2 2 0 0 1 2 2l6 3-2 4-2-1v7H8v-7l-2 1-2-4 6-3a2 2 0 0 1 2-2z" stroke="' + c + '" stroke-width="1.7" fill="none"/>';
    else if (kind === 'high') inner = '<path d="M3 19l6-10 4 6 3-4 5 8z" stroke="' + c + '" stroke-width="1.8" fill="none"/><path d="M9 9l1.5-2.5L12 9" stroke="' + c + '" stroke-width="1.6" fill="none"/>';
    else if (kind === 'trip') inner = '<path d="M5 19l2-9h10l2 9" stroke="' + c + '" stroke-width="1.7" fill="none"/><path d="M9 10V7a3 3 0 0 1 6 0v3" stroke="' + c + '" stroke-width="1.7" fill="none"/>';
    return '<svg viewBox="0 0 24 24" width="14" height="14" style="vertical-align:-2px">' + inner + '</svg>';
  }
  function adviceIcon(kind) {
    var c = 'currentColor';
    var inner = '';
    if (kind === 'cloth') inner = '<path d="M12 5a2 2 0 0 1 2 2l6 3-2 4-2-1v7H8v-7l-2 1-2-4 6-3a2 2 0 0 1 2-2z" stroke="' + c + '" stroke-width="1.7" fill="none"/>';
    else if (kind === 'uv') inner = '<circle cx="12" cy="12" r="4" stroke="' + c + '" stroke-width="1.8" fill="none"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" stroke="' + c + '" stroke-width="1.7"/>';
    else if (kind === 'high') inner = '<path d="M3 19l6-10 4 6 3-4 5 8z" stroke="' + c + '" stroke-width="1.8" fill="none"/>';
    else inner = '<path d="M7 13h10a4 4 0 0 0 .7-7.9A6 6 0 0 0 6.2 6.6 3.8 3.8 0 0 0 7 13z" stroke="' + c + '" stroke-width="1.7" fill="none"/><path d="M8 16l-1 3M12 16l-1 3M16 16l-1 3" stroke="' + c + '" stroke-width="1.7"/>';
    return '<svg class="a-ico" viewBox="0 0 24 24" width="20" height="20">' + inner + '</svg>';
  }

  /* ---------------- 工具 ---------------- */
  function $(id) { return document.getElementById(id); }
  function fmt(n, d) { return n == null || isNaN(n) ? '--' : Number(n).toFixed(d == null ? 0 : d); }
  function windDirCN(deg) {
    var arr = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    return arr[Math.round(deg / 45) % 8] + '风';
  }
  function aqiText(aqi) {
    if (aqi == null) return '--';
    if (aqi <= 50) return '优';
    if (aqi <= 100) return '良';
    if (aqi <= 150) return '轻度污染';
    if (aqi <= 200) return '中度污染';
    return '重度污染';
  }
  function uvText(uv) {
    if (uv == null) return '--';
    if (uv < 3) return '弱';
    if (uv < 6) return '中等';
    if (uv < 8) return '强';
    if (uv < 11) return '很强';
    return '极强';
  }
  function dayLabel(isoDate, idx) {
    if (idx === 0) return '今天';
    if (idx === 1) return '明天';
    var wd = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return wd[new Date(isoDate + 'T00:00:00+08:00').getDay()];
  }
  function hm(isoDateTime) { return isoDateTime ? isoDateTime.slice(11, 16) : '--'; }
  function toast(msg) {
    var t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------------- 渲染：实时卡片 ---------------- */
  function renderCityCard(el, d, air, cfg) {
    var c = d.current, daily = d.daily;
    el.innerHTML =
      '<div class="city-top">' +
        '<div><div class="city-name">' + cfg.name + '</div><div class="city-geo">' + cfg.region + '</div></div>' +
        '<span class="city-tag">海拔 ' + fmt(d.elevation) + ' m</span>' +
      '</div>' +
      '<div class="now-row">' +
        '<div class="now-temp">' + fmt(c.temperature_2m) + '<span class="deg">°C</span></div>' +
        '<div class="now-icon">' + iconSVG(c.weather_code, c.is_day) + '</div>' +
        '<div><div class="now-cond">' + wmoText(c.weather_code) + '</div>' +
        '<div class="now-feels">体感 ' + fmt(c.apparent_temperature) + '°C · ' + aqiText(air && air.current ? air.current.us_aqi : null) + '空气</div></div>' +
      '</div>' +
      '<div class="metric-grid">' +
        '<div class="metric"><div class="m-label">' + miniIcon('hum') + ' 湿度</div><div class="m-val">' + fmt(c.relative_humidity_2m) + '<small> %</small></div></div>' +
        '<div class="metric"><div class="m-label">' + miniIcon('wind') + ' 风</div><div class="m-val">' + fmt(c.wind_speed_10m) + '<small> km/h ' + windDirCN(c.wind_direction_10m) + '</small></div></div>' +
        '<div class="metric"><div class="m-label">' + miniIcon('pres') + ' 气压</div><div class="m-val">' + fmt(c.surface_pressure) + '<small> hPa</small></div></div>' +
        '<div class="metric"><div class="m-label">' + miniIcon('uv') + ' 紫外线</div><div class="m-val">' + fmt(daily.uv_index_max[0], 1) + '<small> ' + uvText(daily.uv_index_max[0]) + '</small></div></div>' +
      '</div>' +
      '<div class="sun-row">' +
        '<span>' + miniIcon('sunrise') + ' 日出 <b>' + hm(daily.sunrise[0]) + '</b></span>' +
        '<span>' + miniIcon('sunset') + ' 日落 <b>' + hm(daily.sunset[0]) + '</b></span>' +
        '<span>今日 <b>' + fmt(daily.temperature_2m_min[0]) + '° / ' + fmt(daily.temperature_2m_max[0]) + '°</b></span>' +
      '</div>';
  }

  /* ---------------- 渲染：洞察条 ---------------- */
  function renderInsights(wz, dr, wzAir, drAir) {
    var cw = wz.current, cd = dr.current;
    var diff = cw.temperature_2m - cd.temperature_2m;
    var warmer = diff >= 0 ? '吴中更暖' : '达日更暖';
    var humDiff = cw.relative_humidity_2m - cd.relative_humidity_2m;
    var aw = wzAir && wzAir.current ? wzAir.current.us_aqi : null;
    var ad = drAir && drAir.current ? drAir.current.us_aqi : null;
    var items = [
      { label: '当前温差', val: '<em>' + fmt(Math.abs(diff), 1) + '°C</em> ' + warmer, sub: '体感温差 ' + fmt(Math.abs(cw.apparent_temperature - cd.apparent_temperature), 1) + '°C' },
      { label: '海拔差距', val: '<em>' + fmt(wz.elevation) + ' m</em> vs <em>' + fmt(dr.elevation) + ' m</em>', sub: '达日地处青藏高原，气压仅约海平面 ' + Math.round(cd.surface_pressure / 1013.25 * 100) + '%' },
      { label: '空气湿度', val: '<em>' + fmt(cw.relative_humidity_2m) + '%</em> vs <em>' + fmt(cd.relative_humidity_2m) + '%</em>', sub: humDiff > 20 ? '达日非常干燥，注意补水' : '两地湿度接近' },
      { label: '空气质量', val: '<em>' + (aw == null ? '--' : aw) + ' ' + aqiText(aw) + '</em> vs <em>' + (ad == null ? '--' : ad) + ' ' + aqiText(ad) + '</em>', sub: 'US AQI · PM2.5 ' + fmt(wzAir && wzAir.current ? wzAir.current.pm2_5 : null, 1) + ' / ' + fmt(drAir && drAir.current ? drAir.current.pm2_5 : null, 1) + ' μg/m³' }
    ];
    $('insights').innerHTML = items.map(function (i) {
      return '<div class="insight"><div class="i-label">' + i.label + '</div><div class="i-val">' + i.val + '</div><div class="i-sub">' + i.sub + '</div></div>';
    }).join('');
  }

  /* ---------------- 渲染：7日卡片 ---------------- */
  function renderForecast(el, d) {
    var daily = d.daily, html = '';
    for (var i = 0; i < daily.time.length; i++) {
      var pop = daily.precipitation_probability_max[i];
      html +=
        '<div class="day-card">' +
          '<div class="dc-day">' + dayLabel(daily.time[i], i) + '</div>' +
          '<div class="dc-date">' + daily.time[i].slice(5).replace('-', '/') + '</div>' +
          '<div class="dc-icon">' + iconSVG(daily.weather_code[i], 1) + '</div>' +
          '<div class="dc-cond">' + wmoText(daily.weather_code[i]) + '</div>' +
          '<div class="dc-temp"><span class="lo">' + fmt(daily.temperature_2m_min[i]) + '°</span> / ' + fmt(daily.temperature_2m_max[i]) + '°</div>' +
          '<div class="dc-pop' + (pop > 0 ? '' : ' none') + '">降水 ' + (pop == null ? '--' : pop) + '%</div>' +
        '</div>';
    }
    el.innerHTML = html;
  }

  /* ---------------- 渲染：对比表 ---------------- */
  function badge(text, cls) { return '<span class="better ' + cls + '">' + text + '</span>'; }
  function renderTable(wz, dr, wzAir, drAir) {
    var cw = wz.current, cd = dr.current, dw = wz.daily, dd = dr.daily;
    var aw = wzAir && wzAir.current ? wzAir.current.us_aqi : null;
    var ad = drAir && drAir.current ? drAir.current.us_aqi : null;
    var aqiBadge = (aw != null && ad != null) ? (aw <= ad ? badge('吴中更优', 'b-wz') : badge('达日更优', 'b-dr')) : '';
    var rows = [
      ['实时气温', fmt(cw.temperature_2m, 1) + ' °C', fmt(cd.temperature_2m, 1) + ' °C', '吴中高出 ' + fmt(cw.temperature_2m - cd.temperature_2m, 1) + '°C'],
      ['体感温度', fmt(cw.apparent_temperature, 1) + ' °C', fmt(cd.apparent_temperature, 1) + ' °C', cd.wind_speed_10m >= 15 ? '达日风大，体感比实际低 ' + fmt(cd.temperature_2m - cd.apparent_temperature, 1) + '°C' : '风影响体感温度'],
      ['天气状况', wmoText(cw.weather_code), wmoText(cd.weather_code), ''],
      ['相对湿度', fmt(cw.relative_humidity_2m) + ' %', fmt(cd.relative_humidity_2m) + ' %', cd.relative_humidity_2m < 30 ? '达日空气湿度极低，体感干冷' : '40–60% 为舒适区间'],
      ['风速风向', fmt(cw.wind_speed_10m, 1) + ' km/h · ' + windDirCN(cw.wind_direction_10m), fmt(cd.wind_speed_10m, 1) + ' km/h · ' + windDirCN(cd.wind_direction_10m), cd.wind_speed_10m > cw.wind_speed_10m * 2 ? '达日风力明显更强，高原风硬' : ''],
      ['地面气压', fmt(cw.surface_pressure) + ' hPa', fmt(cd.surface_pressure) + ' hPa', '海拔每升 1000m 气压约降 12%，达日仅约海平面 ' + Math.round(cd.surface_pressure / 1013.25 * 100) + '%'],
      ['今日气温区间', fmt(dw.temperature_2m_min[0]) + '° ~ ' + fmt(dw.temperature_2m_max[0]) + '°C', fmt(dd.temperature_2m_min[0]) + '° ~ ' + fmt(dd.temperature_2m_max[0]) + '°C', '达日昼夜温差 ' + fmt(dd.temperature_2m_max[0] - dd.temperature_2m_min[0]) + '°C，高原特征明显'],
      ['紫外线（今日峰值）', fmt(dw.uv_index_max[0], 1) + ' · ' + uvText(dw.uv_index_max[0]), fmt(dd.uv_index_max[0], 1) + ' · ' + uvText(dd.uv_index_max[0]), dd.uv_index_max[0] > dw.uv_index_max[0] ? '高原紫外线更烈，须硬防晒' : ''],
      ['空气质量 US AQI', (aw == null ? '--' : aw + ' · ' + aqiText(aw)), (ad == null ? '--' : ad + ' · ' + aqiText(ad) + aqiBadge), '数值越低越好'],
      ['日出 / 日落', hm(dw.sunrise[0]) + ' / ' + hm(dw.sunset[0]), hm(dd.sunrise[0]) + ' / ' + hm(dd.sunset[0]), '同用北京时间，达日偏西，晨昏更晚'],
      ['海拔', fmt(wz.elevation) + ' m', fmt(dr.elevation) + ' m', '相差近 ' + fmt((dr.elevation - wz.elevation) / 1000, 1) + ' km，气候差异的根源'],
      ['明日降水概率', (dw.precipitation_probability_max[1] == null ? '--' : dw.precipitation_probability_max[1] + ' %'), (dd.precipitation_probability_max[1] == null ? '--' : dd.precipitation_probability_max[1] + ' %'), '']
    ];
    $('cmp-body').innerHTML = rows.map(function (r) {
      return '<tr><td>' + r[0] + '</td><td class="num">' + r[1] + '</td><td class="num">' + r[2] + '</td><td class="note">' + r[3] + '</td></tr>';
    }).join('');
  }

  /* ---------------- 渲染：建议 ---------------- */
  function clothing(minT, maxT) {
    if (maxT <= 5 || minT <= -10) return '厚羽绒服、帽子手套全套冬装';
    if (minT < 0) return '羽绒服或棉服，内搭保暖内衣';
    if (maxT <= 15) return '毛衣加厚外套';
    if (maxT <= 22) return '薄外套或卫衣，早晚加衣';
    if (maxT <= 28) return '长袖衬衫即可';
    return '短袖清凉装，注意防暑';
  }
  function renderAdvice(wz, dr) {
    var cw = wz.current, cd = dr.current, dw = wz.daily, dd = dr.daily;
    var tripDiff = Math.abs(cw.temperature_2m - cd.temperature_2m);
    var cards = [
      {
        icon: 'cloth', title: '穿衣建议', html:
          '<p class="a-line"><span class="who wz">吴中</span>' + clothing(dw.temperature_2m_min[0], dw.temperature_2m_max[0]) + '（今日 ' + fmt(dw.temperature_2m_min[0]) + '°~' + fmt(dw.temperature_2m_max[0]) + '°C）。</p>' +
          '<p class="a-line"><span class="who dr">达日</span>' + clothing(dd.temperature_2m_min[0], dd.temperature_2m_max[0]) + '（今日 ' + fmt(dd.temperature_2m_min[0]) + '°~' + fmt(dd.temperature_2m_max[0]) + '°C，夜间零下）。</p>' +
          '<p class="a-line">若今日往返两地，落地温差约 <b>' + fmt(tripDiff, 0) + '°C</b>，务必备好换季衣物。</p>'
      },
      {
        icon: 'uv', title: '防晒提醒', html:
          '<p class="a-line"><span class="who wz">吴中</span>紫外线峰值 ' + fmt(dw.uv_index_max[0], 1) + '（' + uvText(dw.uv_index_max[0]) + '），' + (dw.uv_index_max[0] >= 3 ? '外出建议涂抹防晒霜。' : '无需特别防护。') + '</p>' +
          '<p class="a-line"><span class="who dr">达日</span>紫外线峰值 ' + fmt(dd.uv_index_max[0], 1) + '（' + uvText(dd.uv_index_max[0]) + '）。<b>高原紫外线极强</b>，防晒霜 SPF50+、墨镜、遮阳帽为标配，阴天也不例外。</p>'
      },
      {
        icon: 'high', title: '高原健康提示', html:
          '<p class="a-line"><span class="who dr">达日</span>海拔约 ' + fmt(dr.elevation) + ' m，气压 ' + fmt(cd.surface_pressure) + ' hPa（约海平面 ' + Math.round(cd.surface_pressure / 1013.25 * 100) + '%），氧气稀薄。</p>' +
          '<p class="a-line">初到者避免剧烈运动，注意高原反应；当前湿度仅 <b>' + fmt(cd.relative_humidity_2m) + '%</b>，务必多喝水、注意保湿。吴中（海拔 ' + fmt(wz.elevation) + ' m）前往时请预留 1–2 天适应期。</p>'
      },
      {
        icon: 'rain', title: '降水与出行', html:
          '<p class="a-line"><span class="who wz">吴中</span>明日降水概率 ' + (dw.precipitation_probability_max[1] == null ? '--' : dw.precipitation_probability_max[1] + '%') + '（' + wmoText(dw.weather_code[1]) + '）' + (dw.precipitation_probability_max[1] >= 50 ? '，出门记得带伞。' : '，出行无忧。') + '</p>' +
          '<p class="a-line"><span class="who dr">达日</span>明日降水概率 ' + (dd.precipitation_probability_max[1] == null ? '--' : dd.precipitation_probability_max[1] + '%') + '（' + wmoText(dd.weather_code[1]) + '）' + (dd.temperature_2m_min[1] < 0 ? '；夜间低温 ' + fmt(dd.temperature_2m_min[1]) + '°C，路面可能结冰，驾车谨慎。' : '。') + '</p>'
      }
    ];
    $('advice').innerHTML = cards.map(function (c) {
      return '<div class="advice-card"><h3>' + adviceIcon(c.icon) + c.title + '</h3>' + c.html + '</div>';
    }).join('');
  }

  /* ---------------- 渲染：图表数据准备 ---------------- */
  function slice24h(d) {
    var nowHour = d.current.time.slice(0, 13) + ':00';
    var idx = d.hourly.time.indexOf(nowHour);
    if (idx < 0) idx = 0;
    var labels = [], temps = [];
    for (var i = idx; i < Math.min(idx + 24, d.hourly.time.length); i++) {
      labels.push(d.hourly.time[i].slice(11, 13) + '时');
      temps.push(d.hourly.temperature_2m[i]);
    }
    return { labels: labels, temps: temps };
  }
  function dayLabels(d) {
    return d.daily.time.map(function (t, i) { return dayLabel(t, i); });
  }

  /* ---------------- 总渲染 ---------------- */
  function renderAll(data, live) {
    var wz = data.wuzhong, dr = data.darlag, wzAir = data.wuzhongAir, drAir = data.darlagAir;
    renderCityCard($('card-wz'), wz, wzAir, COORDS.wz);
    renderCityCard($('card-dr'), dr, drAir, COORDS.dr);
    var diff = wz.current.temperature_2m - dr.current.temperature_2m;
    $('diff-now').textContent = fmt(Math.abs(diff), 1) + '°C';
    $('diff-now').style.color = diff >= 0 ? 'var(--accent)' : 'var(--accent2)';
    $('diff-note').textContent = diff >= 0 ? '吴中更暖' : '达日更暖';
    renderInsights(wz, dr, wzAir, drAir);
    renderForecast($('fc-wz'), wz);
    renderForecast($('fc-dr'), dr);
    renderTable(wz, dr, wzAir, drAir);
    renderAdvice(wz, dr);
    var h24w = slice24h(wz), h24d = slice24h(dr);
    window.WeatherCharts.render24h(h24w.labels, h24w.temps, h24d.temps);
    window.WeatherCharts.render7dTemp(dayLabels(wz), wz.daily.temperature_2m_max, wz.daily.temperature_2m_min, dr.daily.temperature_2m_max, dr.daily.temperature_2m_min);
    window.WeatherCharts.render7dPop(dayLabels(wz), wz.daily.precipitation_probability_max, dr.daily.precipitation_probability_max);

    var badgeEl = $('badge-live'), badgeText = $('badge-text');
    if (live) {
      badgeEl.className = 'badge-live ok';
      badgeText.textContent = '实时数据';
      $('update-time').textContent = '更新于 ' + new Date().toLocaleString('zh-CN', { hour12: false });
    } else {
      badgeEl.className = 'badge-live stale';
      badgeText.textContent = '快照数据';
      $('update-time').textContent = '快照时间 ' + (data.fetchedAt || '--');
    }
  }

  /* ---------------- 实时拉取 ---------------- */
  function fetchJSON(url, ms) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, ms || 12000);
    return fetch(url, { signal: ctrl.signal }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }
  function apiURL(cfg) {
    return 'https://api.open-meteo.com/v1/forecast?latitude=' + cfg.lat + '&longitude=' + cfg.lon +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m' +
      '&hourly=temperature_2m,precipitation_probability,weather_code' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max' +
      '&timezone=Asia%2FShanghai&forecast_days=7';
  }
  function airURL(cfg) {
    return 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + cfg.lat + '&longitude=' + cfg.lon +
      '&current=us_aqi,pm2_5,pm10&timezone=Asia%2FShanghai';
  }
  function refresh(loud) {
    var btn = $('btn-refresh');
    btn.disabled = true;
    btn.textContent = '刷新中…';
    Promise.all([
      fetchJSON(apiURL(COORDS.wz)),
      fetchJSON(apiURL(COORDS.dr)),
      fetchJSON(airURL(COORDS.wz)).catch(function () { return null; }),
      fetchJSON(airURL(COORDS.dr)).catch(function () { return null; })
    ]).then(function (rs) {
      renderAll({ wuzhong: rs[0], darlag: rs[1], wuzhongAir: rs[2], darlagAir: rs[3] }, true);
      if (loud) toast('实时数据已更新');
    }).catch(function () {
      if (loud) toast('实时获取失败，继续展示快照数据');
      var b = $('badge-live');
      if (b.className.indexOf('ok') < 0) { b.className = 'badge-live stale'; $('badge-text').textContent = '快照数据'; }
    }).finally(function () {
      btn.disabled = false;
      btn.textContent = '刷新实时数据';
    });
  }

  /* ---------------- 启动 ---------------- */
  renderAll(window.SNAPSHOT, false);   // 先用内置快照秒开
  refresh(false);                      // 再静默拉取实时数据
  $('btn-refresh').addEventListener('click', function () { refresh(true); });
  setInterval(function () { refresh(false); }, 10 * 60 * 1000);
})();
