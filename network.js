/* Network scenes share the same lesson and packet state as the sequence view. */
const baseExplorer = explorer,
  baseUpdate = update,
  baseList = renderList;
let mode = 'network',
  playing = false,
  speed = 1,
  elapsed = 0,
  lastFrame = 0,
  frame = 0,
  showOverview = false;
const duration = 3200;

stop = function () {
  clearInterval(timer);
  timer = null;
  playing = false;
  cancelAnimationFrame(frame);
  lastFrame = 0;
};

function pauseScene() {
  stop();
  syncControls();
}

function syncControls() {
  if (!$('#play')) {
    return;
  }
  $('#play').textContent = playing
    ? 'Ⅱ Pause'
    : step === protocols[selected].steps.length && elapsed >= duration
      ? '↻ Replay'
      : '▶ Play';
  $('#next').disabled = step === protocols[selected].steps.length;
  $('#previous').disabled = step === 0;
  $('#motion-status').textContent = playing
    ? 'PACKET IN TRANSIT'
    : step
      ? 'PAUSED'
      : 'READY';
}

function jump(n) {
  stop();
  step = Math.max(0, Math.min(protocols[selected].steps.length, n));
  elapsed = duration;
  update();
}

function tick(now) {
  if (!playing) {
    return;
  }
  if (lastFrame) {
    elapsed += Math.min(now - lastFrame, 100) * speed;
  }
  lastFrame = now;
  if (elapsed >= duration) {
    if (step >= protocols[selected].steps.length) {
      elapsed = duration;
      positionPacket();
      pauseScene();
      return;
    }
    step++;
    elapsed = 0;
    update();
  }
  positionPacket();
  frame = requestAnimationFrame(tick);
}

function playScene() {
  if (playing) {
    pauseScene();
    return;
  }
  if (step === protocols[selected].steps.length && elapsed >= duration) {
    step = 0;
    elapsed = 0;
  }
  if (step === 0 || elapsed >= duration) {
    step++;
    elapsed = 0;
  }
  playing = true;
  lastFrame = 0;
  update();
  frame = requestAnimationFrame(tick);
}

explorer = function () {
  stop();
  baseExplorer();
  document.body.classList.add('lab-mode');
  const center = $('.center'),
    workspace = $('.workspace');
  workspace.append($('.packets'));
  center.querySelector('.panel-title').innerHTML =
    '<div class="view-tabs">\
<button id="network-tab">◈ Network\
</button>\
<button id="sequence-tab">⇄ Sequence\
</button>\
</div>\
<span id="motion-status" class="count">\
</span>';
  $('.controls').innerHTML =
    '<select id="speed" aria-label="Playback speed">\
<option value="0.5">0.5× speed\
</option>\
<option value="1">1× speed\
</option>\
<option value="2">2× speed\
</option>\
</select>\
<button id="previous" aria-label="Previous step">←\
</button>\
<button class="primary" id="play">▶ Play\
</button>\
<button id="next">Step →\
</button>\
<button id="reset">↺ Reset\
</button>\
<span class="progress">\
</span>';
  $('.workspace > aside:last-of-type .panel-title').innerHTML =
    '<span>STEP DETAILS\
</span>\
<button id="overview-toggle">Overview\
</button>';
  $('#play').onclick = playScene;
  $('#next').onclick = () => jump(step + 1);
  $('#previous').onclick = () => jump(step - 1);
  $('#reset').onclick = () => {
    elapsed = 0;
    jump(0);
  };
  $('#speed').value = speed;
  $('#speed').onchange = (e) => (speed = +e.target.value);
  $('#network-tab').onclick = () => {
    mode = 'network';
    update();
  };
  $('#sequence-tab').onclick = () => {
    mode = 'sequence';
    update();
  };
  $('#overview-toggle').onclick = () => {
    showOverview = !showOverview;
    update();
  };
  update();
};

renderList = function () {
  baseList();
  const active = $('.protocol.selected');
  if (active) {
    const list = document.createElement('div');
    list.className = 'step-list';
    list.innerHTML =
      `<button data-jump="0" class="${step === 0 ? 'current' : ''}">\
<i>${step ? '✓' : '1'}</i>\
<span>START REQUEST\
<small>Application prepares a message\
</small>\
</span>\
</button>` +
      protocols[selected].steps
        .map((s, i) => {
          return `<button data-jump="${i + 1}" class="${step === i + 1 ? 'current' : ''}">\
<i>${step > i + 1 ? '✓' : i + 2}</i>\
<span>${s[0]}<small>${s[3]} · ${s[1] === 0 ? 'outbound' : 'inbound'}</small>\
</span>\
</button>`;
        })
        .join('');
    active.after(list);
    list
      .querySelectorAll('button')
      .forEach((b) => (b.onclick = () => jump(+b.dataset.jump)));
  }
};

function device(type, x, y, label, address) {
  let shape = '';
  if (type === 'laptop') {
    shape =
      '<path d="M-65,-22 L15,-69 L20,16 L-61,64Z"/>\
<path d="M-56,-19 L8,-56 L12,10 L-53,49Z" fill="var(--surface-subtle)"/>\
<path d="M-61,64 L20,16 L82,52 L0,101Z M-61,64 V72 L0,109 L82,60 V52 M0,101 V109"/>\
<path d="M-40,63 L18,29 L58,52 L0,86Z" fill="var(--surface-subtle)"/>\
<path d="M-25,62 L32,62 M-14,51 L44,51 M-27,69 L30,36 M-12,77 L44,44"/>\
<path d="M-44,-12 L-2,-36" stroke="var(--signal-green)"/>\
<path d="M-43,0 L-15,-16 M-42,11 L-7,-9" opacity=".5"/>';
  } else if (type === 'router') {
    shape =
      '<path d="M-68,0 L0,-39 L68,0 L0,40Z"/>\
<path d="M-68,0 V40 L0,79 L68,40 V0 M0,40 V79"/>\
<path d="M13,42 L56,17 V36 L13,61Z" fill="var(--surface-subtle)"/>\
<path d="M-10,-34 L-7,-98 L-4,-34Z"/>\
<circle cx="-7" cy="-100" r="4"/>\
<path d="M-45,26 L-35,32 V44 L-45,38Z M-25,38 L-15,44 V56 L-25,50Z"/>\
<path d="M-28,-2 L-21,-6 L-13,-2 L-20,2Z M-12,7 L-5,3 L3,7 L-4,11Z M4,16 L11,12 L19,16 L12,20Z" fill="var(--signal-green)"/>';
  } else if (type === 'cloud') {
    shape =
      '<path d="M-59,28 C-104,26 -98,-29 -58,-26 C-59,-57 -23,-69 -4,-50 C20,-83 59,-58 60,-28 C99,-21 100,23 67,38 C57,71 15,73 0,53 C-25,81 -60,61 -59,28Z"/>\
<circle cx="2" cy="0" r="23"/>\
<ellipse cx="2" cy="0" rx="10" ry="23"/>\
<path d="M-20,0 H24 M-15,-13 H19 M-15,13 H19"/>';
  } else {
    shape = '<path d="M-40,-56 L0,-79 L44,-54 L2,-29Z"/>';
    for (let i = 0; i < 3; i++) {
      let y = -54 + i * 25;
      shape += `<path d="M-40,${y} L2,${y + 25} L44,${y} V${y + 21} L2,${y + 46} L-40,${y + 21}Z M2,${y + 25} V${y + 46}"/>\
<path d="M-31,${y + 10} L-7,${y + 24}" stroke="var(--signal-green)"/>\
<path d="M11,${y + 25} L34,${y + 12}"/>`;
    }
  }
  return `<g class="device" transform="translate(${x} ${y})" fill="var(--surface)" stroke="var(--edge-strong)" stroke-width="2" stroke-linejoin="round">${shape}<text y="${type === 'laptop' ? 137 : type === 'router' ? 106 : 100}" text-anchor="middle" stroke="none" fill="var(--ink)" font-size="15">${label}</text>\
<text y="${type === 'laptop' ? 156 : type === 'router' ? 125 : 119}" text-anchor="middle" stroke="none" fill="var(--secondary)" font-size="11">${address}</text>\
</g>`;
}

function lessonEndpoints(p) {
  return p.name === 'Reverse proxy'
    ? ['Client', 'Reverse proxy', 'Backend server']
    : [
        'Client',
        'DNS resolver',
        p.localEndpoint || (p.name === 'DHCP' ? 'DHCP server' : 'Remote server'),
      ];
}

function routeFor(s) {
  const p = protocols[selected],
    local = p.localEndpoint || p.name === 'DHCP';
  if (p.name === 'Reverse proxy') {
    const stops =
      s[1] === 0 || s[2] === 0
        ? [
            [180, 350],
            [395, 265],
            [640, 365],
            [640, 135],
          ]
        : [
            [640, 135],
            [820, 170],
          ];
    return s[1] === 0 || (s[1] === 1 && s[2] === 2) ? stops : stops.reverse();
  }
  let points = local
    ? [
        [180, 350],
        [395, 265],
        [690, 170],
      ]
    : s[3] === 'DNS'
      ? [
          [180, 350],
          [395, 265],
          [640, 365],
          [640, 135],
        ]
      : [
          [180, 350],
          [395, 265],
          [640, 365],
          [820, 170],
        ];
  if (s[1] !== 0) {
    points.reverse();
  }
  return points;
}

function scene() {
  const p = protocols[selected],
    s = p.steps[step - 1],
    c = s ? colors[s[3]] : 'var(--signal-slate)',
    local = p.localEndpoint || p.name === 'DHCP',
    names = lessonEndpoints(p);
  let pts = s ? routeFor(s) : [];
  let d = pts.map((v, i) => (i ? 'L' : 'M') + v.join(',')).join(' ');
  return `<svg id="network-svg" viewBox="0 0 960 550" role="img" aria-label="Animated ${p.name} network: packets travel between client, router and ${local ? names[2] : 'remote services via the internet'}">\
<defs>\
<pattern id="grid" width="80" height="46" patternUnits="userSpaceOnUse">\
<path d="M0 0 L80 46 M80 0 L0 46" fill="none" stroke="var(--edge)" stroke-width=".8"/>\
</pattern>\
</defs>\
<rect width="960" height="550" fill="url(#grid)"/>\
<path d="M180,350 L395,265 ${local ? 'L690,170' : 'L640,365 L820,170 M640,365 L640,135'}" stroke="var(--edge-strong)" fill="none" stroke-width="2" stroke-dasharray="7 8"/>${s ? `<path id="packet-path" d="${d}" fill="none" stroke="${c}" stroke-opacity=".65" stroke-width="2" stroke-dasharray="6 7"/>` : ''}${device('laptop', 155, 330, 'Client', p.name === 'DHCP' ? (step === 4 ? 'LEASE ACQUIRED' : '0.0.0.0 · NO LEASE') : p.name === 'IPv6' ? '2001:db8:1::10' : '192.168.1.10')}${device('router', 395, 245, local ? 'LAN switch' : 'Router', local ? 'LOCAL LINK' : p.name === 'IPv6' ? '2001:db8:1::1' : '192.168.1.1')}${local ? device('server', 690, 135, names[2], 'LOCAL NETWORK') : device('cloud', 640, 365, 'Internet', 'INTERCONNECTED NETWORKS') + device('server', 640, 100, names[1], p.name === 'Reverse proxy' ? 'PUBLIC ENDPOINT' : '8.8.8.8') + device('server', 820, 135, names[2], p.name === 'IPv6' ? '2001:db8:2::10' : '203.0.113.10')}${!step ? `<g transform="translate(70 140)">\
<rect width="280" height="46" rx="5" fill="var(--surface)" stroke="var(--edge-strong)"/>\
<text x="16" y="29" fill="var(--ink)" font-size="16">${p.name === 'HTTPS' ? 'https://example.com' : p.name === 'HTTP' ? 'http://example.com' : p.name + ' · prepare request'}<tspan class="cursor">▏\
</tspan>\
</text>\
</g>` : `<g id="moving-packet">\
<circle r="7" fill="${c}" stroke="var(--surface)" stroke-width="2"/>\
<g transform="translate(-83 -62)">\
<rect width="166" height="45" rx="4" fill="var(--surface)" stroke="${c}"/>\
<text x="83" y="19" text-anchor="middle" fill="${c}" font-size="12">${s[0]}</text>\
<text x="83" y="35" text-anchor="middle" fill="var(--secondary)" font-size="9">${s[3]} · ${names[s[1]].toUpperCase()} → ${names[s[2]].toUpperCase()}</text>\
</g>\
</g>`}<text x="22" y="528" fill="var(--secondary)" font-size="10">SIMULATED NETWORK · ${local ? 'LOCAL LINK EXCHANGE' : 'ROUTING / NAT DETAILS SIMPLIFIED'}</text>\
</svg>`;
}

function positionPacket() {
  if (mode !== 'network') {
    return;
  }
  const path = $('#packet-path'),
    packet = $('#moving-packet');
  if (!path || !packet) {
    return;
  }
  let progress = Math.min(1, elapsed / duration);
  const point = path.getPointAtLength(path.getTotalLength() * progress);
  packet.setAttribute('transform', `translate(${point.x} ${point.y})`);
}

update = function () {
  if (!$('#arrows')) {
    return;
  }
  baseUpdate();
  if (!$('#network-tab')) {
    return;
  }
  const p = protocols[selected],
    s = p.steps[step - 1];
  $('.diagram').classList.toggle('network-mode', mode === 'network');
  $('#network-tab').classList.toggle('selected', mode === 'network');
  $('#sequence-tab').classList.toggle('selected', mode === 'sequence');
  $('.endpoints').style.display = mode === 'network' ? 'none' : '';
  if (mode === 'network') {
    $('#arrows').innerHTML = scene();
    positionPacket();
  }
  const overview = $('.overview');
  if (!overview.dataset.original) {
    overview.dataset.original = overview.innerHTML;
  }
  if (showOverview) {
    overview.innerHTML = overview.dataset.original;
    $('#layer-link').onclick = () => {
      layer = p.layer;
      osi();
    };
  } else {
    overview.innerHTML = `<span class="eyebrow">${step ? 'MESSAGE ' + step + ' OF ' + p.steps.length : 'START HERE'}</span>\
<h2>${s ? s[0] : 'Start request'}</h2>\
<p>${s ? s[4] : 'Press Play to watch the request, or pick a step from the list.'}</p>\
<div class="message-card" style="--packet:${s ? colors[s[3]] : 'var(--signal-slate)'}">\
<span>${s ? s[3] : p.name}</span>\
<b>${s ? s[0] : 'Ready to connect'}</b>\
<small>${s ? lessonEndpoints(p)[s[1]] + ' → ' + lessonEndpoints(p)[s[2]] : 'Client 192.168.1.10'}</small>\
</div>\
<dl class="facts">\
<div>\
<dt>OSI layer\
</dt>\
<dd>${s && s[3] === 'TCP' ? 4 : p.layer}</dd>\
</div>\
<div>\
<dt>Service port\
</dt>\
<dd>${s && s[3] === 'DNS' ? '53' : p.port}</dd>\
</div>\
<div>\
<dt>Playback\
</dt>\
<dd>Illustrative\
</dd>\
</div>\
</dl>\
<div class="tip">${p.tip}</div>\
<button id="detail-layer">Explore OSI layer ${p.layer} →\
</button>`;
    $('#detail-layer').onclick = () => {
      layer = p.layer;
      osi();
    };
  }
  $('#overview-toggle').textContent = showOverview ? 'Step details' : 'Overview';
  renderList();
  syncControls();
  document.querySelectorAll('tbody tr').forEach((r, i) => {
    if (step) {
      r.tabIndex = 0;
      r.title = 'Inspect this message';
      r.onclick = () => jump(i + 1);
      r.onkeydown = (e) => {
        if (e.key === 'Enter') {
          jump(i + 1);
        }
      };
    }
  });
};
const oldOSI = osi;

osi = function () {
  document.body.classList.remove('lab-mode');
  oldOSI();
};
$('#explore').onclick = () => explorer();
$('#osi').onclick = () => osi();
document.addEventListener('visibilitychange', () => {
  if (document.hidden && playing) {
    pauseScene();
  }
});
