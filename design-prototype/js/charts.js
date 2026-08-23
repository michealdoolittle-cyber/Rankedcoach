// Shared chart primitives: 5-axis radar (Compass), trend line, mini bar.

export function radarChart(labels, values, opts){
  opts = opts || {};
  const size = opts.size || 220;
  const cx = size/2, cy = size/2, r = size*0.36;
  const n = labels.length;
  const max = opts.max || 100;
  const pt = (i, val) => {
    const ang = -Math.PI/2 + i * (2*Math.PI/n);
    const rad = r * (val/max);
    return [cx + rad*Math.cos(ang), cy + rad*Math.sin(ang)];
  };
  const labelPt = (i) => {
    const ang = -Math.PI/2 + i * (2*Math.PI/n);
    const rad = r + 22;
    return [cx + rad*Math.cos(ang), cy + rad*Math.sin(ang)];
  };
  const rings = [0.25,0.5,0.75,1].map(f => {
    const pts = labels.map((_,i)=>pt(i, max*f).join(',')).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="var(--rc-border-subtle)" stroke-width="1"/>`;
  }).join('');
  const shapePts = values.map((v,i)=>pt(i,v).join(',')).join(' ');
  const labelsSvg = labels.map((l,i)=>{
    const [x,y] = labelPt(i);
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle">${l}</text>`;
  }).join('');
  const valuesSvg = values.map((v,i)=>{
    const [x,y] = pt(i,v);
    return `<text x="${x}" y="${y-9}" text-anchor="middle" fill="var(--rc-text-1)" font-weight="700" font-size="11">${v}</text>`;
  }).join('');
  const fill = opts.color || 'var(--rc-review)';
  return `<svg class="radar-svg" viewBox="0 0 ${size} ${size}" width="100%" height="${size}">
    ${rings}
    <polygon points="${shapePts}" fill="${fill}" fill-opacity=".28" stroke="${fill}" stroke-width="2"/>
    ${labelsSvg}
    ${valuesSvg}
  </svg>`;
}

// Small inline sparkline for a single metric tile — no axis, just shape.
export function sparkline(points, color){
  // viewBox fixes the internal coordinate system/aspect ratio; the .sparkline class (not a
  // fixed width/height attribute) is what lets this actually grow at large viewports instead
  // of staying a tiny fixed 90x28px next to text that scales up around it via clamp().
  const w = 90, h = 28, pad = 2;
  const max = Math.max(...points), min = Math.min(...points);
  const range = (max-min)||1;
  const step = (w-pad*2)/(points.length-1);
  const xy = points.map((p,i)=>[pad+i*step, h-pad-((p-min)/range)*(h-pad*2)]);
  const d = xy.map((p,i)=> (i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  return `<svg class="sparkline" viewBox="0 0 ${w} ${h}"><path d="${d}" fill="none" stroke="${color||'var(--rc-brand-strong)'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// Color-coded W/L/D result-letter row, used under RR trend charts.
export function resultLetters(results){
  const color = { W:'var(--rc-success)', L:'var(--rc-danger)', D:'var(--rc-text-3)' };
  return `<div style="display:flex;gap:6px;">${results.map(r=>`<span style="font-weight:800;font-size:11px;color:${color[r]};">${r}</span>`).join('')}</div>`;
}

// Gem-style rank emblem — an approximation of the faceted diamond icon used across the reference art.
export function rankGem(size){
  size = size || 48;
  return `<svg width="${size}" height="${size}" viewBox="0 0 48 48">
    <defs><linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--rc-brand-strong)"/><stop offset="100%" stop-color="var(--rc-brand-deep)"/>
    </linearGradient></defs>
    <polygon points="24,3 40,17 24,45 8,17" fill="url(#gemGrad)" stroke="var(--rc-brand-strong)" stroke-width="1"/>
    <polygon points="24,3 32,17 24,45 16,17" fill="rgba(255,255,255,.12)"/>
    <polygon points="8,17 24,17 16,17" fill="rgba(255,255,255,.08)"/>
    <polygon points="40,17 24,17 32,17" fill="rgba(0,0,0,.1)"/>
  </svg>`;
}

// Labeled progress-bar stat, used in Insight Detail's Evidence Breakdown rail.
export function evidenceStat(label, value, pct, color){
  return `<div style="margin-bottom:10px;">
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;"><span style="color:var(--rc-text-3);">${label}</span><span style="font-weight:700;color:var(--rc-text-1);">${value}</span></div>
    ${miniBar(pct, color)}
  </div>`;
}

export function trendLine(points, opts){
  opts = opts || {};
  const w = opts.w || 460, h = opts.h || 120, pad = 14;
  const max = Math.max(...points), min = Math.min(...points);
  const range = (max-min)||1;
  const step = (w-pad*2)/(points.length-1);
  const xy = points.map((p,i)=>[pad+i*step, h-pad-((p-min)/range)*(h-pad*2)]);
  const d = xy.map((p,i)=> (i===0?'M':'L')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const dots = xy.map(p=>`<circle class="trend-dot" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
    <line x1="${pad}" y1="${h-pad}" x2="${w-pad}" y2="${h-pad}" stroke="var(--rc-border-subtle)"/>
    <path class="trend-line" d="${d}"/>
    ${dots}
  </svg>`;
}

export function miniBar(pct, color){
  return `<div style="height:6px;border-radius:4px;background:var(--rc-surface-3);overflow:hidden;">
    <div style="height:100%;width:${pct}%;background:${color||'linear-gradient(90deg,var(--rc-brand),var(--rc-review))'};border-radius:4px;"></div>
  </div>`;
}
