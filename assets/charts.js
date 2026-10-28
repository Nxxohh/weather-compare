/* 双城天气对比 · ECharts 渲染（24h 逐时气温 / 7日温度走势 / 7日降水概率） */
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();

  var charts = [];
  function make(id) {
    var c = echarts.init(document.getElementById(id), null, { renderer: 'svg' });
    charts.push(c);
    window.addEventListener('resize', function () { c.resize(); });
    return c;
  }
  var baseTooltip = { trigger: 'axis', appendToBody: true, backgroundColor: 'rgba(14,21,38,0.95)', borderColor: rule, textStyle: { color: ink, fontSize: 12 } };
  var baseAxis = {
    axisLine: { lineStyle: { color: rule } },
    axisLabel: { color: muted, fontSize: 11 },
    splitLine: { lineStyle: { color: rule, type: 'dashed' } }
  };

  function render24h(hours, wzTemps, drTemps) {
    var c = make('chart-24h');
    c.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: Object.assign({}, baseTooltip, { valueFormatter: function (v) { return v == null ? '--' : v + ' °C'; } }),
      legend: { data: ['苏州吴中', '果洛达日'], textStyle: { color: muted }, top: 0, icon: 'roundRect' },
      grid: { left: 44, right: 18, top: 34, bottom: 28 },
      xAxis: Object.assign({ type: 'category', data: hours, boundaryGap: false }, baseAxis),
      yAxis: Object.assign({ type: 'value', scale: true, name: '°C', nameTextStyle: { color: muted } }, baseAxis),
      series: [
        {
          name: '苏州吴中', type: 'line', data: wzTemps, smooth: true, symbol: 'none',
          lineStyle: { width: 2.5 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent + '55' }, { offset: 1, color: accent + '00' }] } }
        },
        {
          name: '果洛达日', type: 'line', data: drTemps, smooth: true, symbol: 'none',
          lineStyle: { width: 2.5 },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: accent2 + '55' }, { offset: 1, color: accent2 + '00' }] } }
        }
      ]
    });
  }

  function render7dTemp(days, wzMax, wzMin, drMax, drMin) {
    var c = make('chart-7d-temp');
    c.setOption({
      animation: false,
      color: [accent, accent, accent2, accent2],
      tooltip: Object.assign({}, baseTooltip, { valueFormatter: function (v) { return v == null ? '--' : v + ' °C'; } }),
      legend: { data: ['吴中·最高', '吴中·最低', '达日·最高', '达日·最低'], textStyle: { color: muted, fontSize: 11 }, top: 0, icon: 'roundRect', itemWidth: 14 },
      grid: { left: 40, right: 14, top: 44, bottom: 26 },
      xAxis: Object.assign({ type: 'category', data: days, boundaryGap: false }, baseAxis),
      yAxis: Object.assign({ type: 'value', scale: true, name: '°C', nameTextStyle: { color: muted } }, baseAxis),
      series: [
        { name: '吴中·最高', type: 'line', data: wzMax, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 2.5 } },
        { name: '吴中·最低', type: 'line', data: wzMin, smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 1.8, type: 'dashed', opacity: 0.75 }, itemStyle: { opacity: 0.75 } },
        { name: '达日·最高', type: 'line', data: drMax, smooth: true, symbol: 'circle', symbolSize: 5, lineStyle: { width: 2.5 } },
        { name: '达日·最低', type: 'line', data: drMin, smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 1.8, type: 'dashed', opacity: 0.75 }, itemStyle: { opacity: 0.75 } }
      ]
    });
  }

  function render7dPop(days, wzPop, drPop) {
    var c = make('chart-7d-pop');
    c.setOption({
      animation: false,
      color: [accent, accent2],
      tooltip: Object.assign({}, baseTooltip, { valueFormatter: function (v) { return v == null ? '--' : v + ' %'; } }),
      legend: { data: ['苏州吴中', '果洛达日'], textStyle: { color: muted }, top: 0, icon: 'roundRect' },
      grid: { left: 40, right: 14, top: 34, bottom: 26 },
      xAxis: Object.assign({ type: 'category', data: days }, baseAxis),
      yAxis: Object.assign({ type: 'value', max: 100, name: '%', nameTextStyle: { color: muted } }, baseAxis),
      series: [
        { name: '苏州吴中', type: 'bar', data: wzPop, barMaxWidth: 18, itemStyle: { borderRadius: [4, 4, 0, 0], opacity: 0.9 } },
        { name: '果洛达日', type: 'bar', data: drPop, barMaxWidth: 18, itemStyle: { borderRadius: [4, 4, 0, 0], opacity: 0.9 } }
      ]
    });
  }

  window.WeatherCharts = { render24h: render24h, render7dTemp: render7dTemp, render7dPop: render7dPop };
})();
