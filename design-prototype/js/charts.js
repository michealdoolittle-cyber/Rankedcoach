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
  return `<svg class="radar-svg" viewBox="0 0 ${size} ${size}" width="100%" height="${size}">
    ${rings}
    <polygon class="radar-shape" points="${shapePts}"/>
    ${labelsSvg}
    ${valuesSvg}
  </svg>`;
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
