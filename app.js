const $ = (s) => document.querySelector(s);
const app = $('#app');
const layers = [
  [
    'Physical',
    'Bits',
    'Signals on a medium',
    'Turns bits into electrical, optical, or radio signals. Cables, fibre and radio carry these signals between devices.',
    'Ethernet physical standards, fibre, radio',
    'A road carries vehicles; the physical medium carries signals.',
  ],
  [
    'Data link',
    'Frames',
    'Delivery on the local link',
    'Packages data into frames for a local link. Ethernet uses MAC addresses. Switches forward frames; routers separate networks.',
    'Ethernet, Wi-Fi (MAC)',
    'A local delivery label identifies the next stop, not the whole journey.',
  ],
  [
    'Network',
    'Packets',
    'Routing between networks',
    'IP addresses identify network interfaces. Routers forward IP packets toward their destination across interconnected networks. IP itself does not guarantee delivery.',
    'IPv4, IPv6, ICMP',
    'A destination address helps each sorting office choose the next route.',
  ],
  [
    'Transport',
    'Segments / datagrams',
    'Communication between applications',
    'Ports identify application endpoints. TCP offers an ordered, reliable byte stream; UDP sends independent datagrams without built-in delivery or ordering guarantees.',
    'TCP, UDP',
    'Ports direct a delivery to the right department inside a building.',
  ],
  [
    'Session',
    'Data',
    'Managing conversations',
    'The OSI session layer describes establishing, coordinating and ending conversations. In internet applications, these responsibilities often live in application libraries rather than a separate protocol layer.',
    'Session management, checkpoints',
    'Keeping track of a conversation so both sides know its state.',
  ],
  [
    'Presentation',
    'Data',
    'Representation and transformation',
    'Describes data encoding, serialization, compression and encryption. Real internet stacks do not map perfectly to OSI: TLS sits above transport and provides encryption for applications.',
    'UTF-8, serialization, compression; TLS as a conceptual example',
    'A translator makes the same message understandable to both sides.',
  ],
  [
    'Application',
    'Data',
    'Services used by applications',
    'Protocols define messages and rules for tasks such as fetching web pages, resolving names, and sending email. This is the layer closest to application software.',
    'HTTP, DNS, SMTP, DHCP',
    'The actual letter: what you want to say or request.',
  ],
];
const tcp = [
  ['SYN', 0, 2, 'TCP', 'The client asks to establish a TCP connection.'],
  [
    'SYN + ACK',
    2,
    0,
    'TCP',
    'The server acknowledges the request and sends its own starting sequence number.',
  ],
  [
    'ACK',
    0,
    2,
    'TCP',
    'The client acknowledges the server. The TCP connection is ready.',
  ],
];
const dns = [
  [
    'DNS query',
    0,
    1,
    'DNS',
    'The client asks a DNS resolver for the IP address associated with example.com.',
  ],
  [
    'DNS answer',
    1,
    0,
    'DNS',
    'The resolver returns an address. It may use a cached answer or query other DNS servers.',
  ],
];
const protocols = [
  {
    name: 'HTTPS',
    full: 'HTTP over TLS',
    layer: 7,
    port: '443',
    transport: 'TCP*',
    about:
      'The secure way to request a web page. TLS encrypts HTTP messages and authenticates the server using a certificate.',
    tip: 'The lock protects data in transit. It does not guarantee that a website is trustworthy.',
    steps: [
      ...dns,
      ...tcp,
      [
        'TLS handshake',
        0,
        2,
        'TLS',
        'Simplified TLS exchange: client and server negotiate keys, and the client validates the server certificate. This arrow represents several messages.',
      ],
      [
        'Encrypted GET /',
        0,
        2,
        'HTTP',
        'The browser sends an HTTP request protected inside TLS records.',
      ],
      [
        'Encrypted 200 OK',
        2,
        0,
        'HTTP',
        'The server returns the page over the encrypted connection. The browser can render it.',
      ],
    ],
  },
  {
    name: 'HTTP',
    full: 'Hypertext Transfer Protocol',
    layer: 7,
    port: '80',
    transport: 'TCP*',
    about:
      'A request–response protocol for web resources. Plain HTTP does not encrypt request or response contents.',
    tip: 'HTTP status codes describe the result: 200 means success, 404 means the resource was not found.',
    steps: [
      ...dns,
      ...tcp,
      [
        'GET /',
        0,
        2,
        'HTTP',
        'The client requests a resource. With plain HTTP, the contents are not encrypted.',
      ],
      [
        '200 OK + page',
        2,
        0,
        'HTTP',
        'The server responds with a status code, headers and a response body.',
      ],
    ],
  },
  {
    name: 'DNS',
    full: 'Domain Name System',
    layer: 7,
    port: '53',
    transport: 'UDP / TCP',
    about:
      'Maps domain names to records such as IP addresses. Resolvers can cache answers for the time specified by their TTL.',
    tip: 'DNS commonly uses UDP, but TCP is also supported. Encrypted variants include DNS over HTTPS and DNS over TLS.',
    steps: dns,
  },
  {
    name: 'TCP',
    full: 'Transmission Control Protocol',
    layer: 4,
    port: 'Application-specific',
    transport: 'Over IP',
    about:
      'Provides a reliable, ordered byte stream with acknowledgements, retransmission and flow control.',
    tip: 'TCP is a byte stream: it does not preserve application message boundaries.',
    steps: [
      ...tcp,
      [
        'Application data',
        0,
        2,
        'TCP',
        'Bytes are carried in segments with sequence numbers.',
      ],
      [
        'Acknowledgement',
        2,
        0,
        'TCP',
        'The receiver acknowledges received bytes. Missing data can be retransmitted.',
      ],
    ],
  },
  {
    name: 'UDP',
    full: 'User Datagram Protocol',
    layer: 4,
    port: 'Application-specific',
    transport: 'Over IP',
    about:
      'Sends individual datagrams with minimal overhead. It has no built-in handshake, retransmission or ordering guarantee.',
    tip: 'Applications can add reliability on top of UDP. QUIC, used by HTTP/3, does exactly that.',
    steps: [
      [
        'Datagram 1',
        0,
        2,
        'UDP',
        'Send a self-contained message without first establishing a connection.',
      ],
      [
        'Datagram 2',
        0,
        2,
        'UDP',
        'Each message travels independently. It may be lost or arrive out of order.',
      ],
      [
        'Application reply',
        2,
        0,
        'UDP',
        'The application may reply; UDP itself does not require an acknowledgement.',
      ],
    ],
  },
  {
    name: 'ICMP',
    full: 'Internet Control Message Protocol',
    layer: 3,
    port: 'No ports',
    transport: 'Over IP',
    about:
      'Carries network control and error messages. Ping commonly uses ICMP echo requests and replies.',
    tip: 'No ping response does not always mean a host is down: firewalls may block ICMP.',
    steps: [
      [
        'Echo request',
        0,
        2,
        'ICMP',
        'Ping sends a request to test reachability and measure round-trip time.',
      ],
      [
        'Echo reply',
        2,
        0,
        'ICMP',
        'The destination replies if it is reachable and allows ICMP echo traffic.',
      ],
    ],
  },
  {
    name: 'DHCP',
    full: 'Dynamic Host Configuration Protocol',
    layer: 7,
    port: '67 / 68',
    transport: 'UDP',
    about:
      'Automatically supplies a device with configuration such as an IPv4 address, subnet mask, gateway and DNS server.',
    tip: 'DORA helps you remember the common DHCPv4 exchange: Discover, Offer, Request, Acknowledge.',
    steps: [
      [
        'Discover',
        0,
        2,
        'DHCP',
        'A new client broadcasts to find DHCP servers. The server shown represents a server on the local network.',
      ],
      ['Offer', 2, 0, 'DHCP', 'A server offers an address and configuration.'],
      ['Request', 0, 2, 'DHCP', 'The client requests the offered configuration.'],
      ['Acknowledge', 2, 0, 'DHCP', 'The server confirms a time-limited lease.'],
    ],
  },
  {
    name: 'SMTP',
    full: 'Simple Mail Transfer Protocol',
    layer: 7,
    port: '25 / 587',
    transport: 'TCP',
    about:
      'Transfers outgoing email between clients and mail servers, or between mail servers. Reading mail typically uses IMAP or POP3.',
    tip: 'Port 25 is common for server-to-server transfer. Port 587 is commonly used for authenticated submission.',
    steps: [
      ...tcp,
      [
        'EHLO',
        0,
        2,
        'SMTP',
        'The sending system identifies itself and asks about supported extensions.',
      ],
      [
        '250 capabilities',
        2,
        0,
        'SMTP',
        'The server lists supported capabilities. TLS may be negotiated separately.',
      ],
      [
        'MAIL / RCPT / DATA',
        0,
        2,
        'SMTP',
        'Simplified exchange: identify sender and recipients, then send message content.',
      ],
      [
        '250 accepted',
        2,
        0,
        'SMTP',
        'The server accepts the message for delivery; this is not proof it reached the inbox.',
      ],
    ],
  },
];
let selected = 0,
  step = 0,
  timer = null,
  view = 'explorer',
  filter = '',
  layer = 7;
const colors = {
  DNS: 'var(--signal-slate)',
  TCP: 'var(--signal-green)',
  TLS: 'var(--signal-mauve)',
  HTTP: 'var(--signal-ochre)',
  UDP: 'var(--signal-ochre)',
  ICMP: 'var(--signal-clay)',
  DHCP: 'var(--signal-mauve)',
  SMTP: 'var(--signal-slate)',
};

function stop() {
  clearInterval(timer);
  timer = null;
}

function activate(id) {
  document
    .querySelectorAll('nav button')
    .forEach((b) => b.classList.toggle('active', b.id === id));
}

function explorer() {
  view = 'explorer';
  activate('explore');
  const p = protocols[selected];
  app.innerHTML = `<div class="workspace">\
<aside class="panel">\
<div class="panel-title">PROTOCOL LIBRARY \
<span class="count">08\
</span>\
</div>\
<input class="search" aria-label="Search protocols" placeholder="⌕  Find a protocol…" value="">\
<div class="protocol-list">\
</div>\
</aside>\
<section class="center">\
<div class="panel">\
<div class="panel-title">\
<span>↗ &nbsp; CONNECTION WALKTHROUGH\
</span>\
<span class="badge">${p.name}</span>\
</div>\
<div class="diagram">\
<div class="endpoints">\
<div>\
<div class="endpoint-icon">▱\
</div>Your device\
<small>CLIENT\
</small>\
</div>\
<div>\
<div class="endpoint-icon">◎\
</div>DNS resolver\
<small>NAME LOOKUP\
</small>\
</div>\
<div>\
<div class="endpoint-icon">▥\
</div>${p.name === 'DHCP' ? 'DHCP server' : 'Remote server'}<small>DESTINATION\
</small>\
</div>\
</div>\
<div id="arrows">\
</div>\
</div>\
<div class="controls">\
<button class="primary" id="play">▶ Play\
</button>\
<button id="next">Step →\
</button>\
<button id="reset" aria-label="Reset playback">↺ Reset\
</button>\
<span class="progress">\
</span>\
</div>\
<div class="explanation" aria-live="polite">\
</div>\
</div>\
<div class="panel packets">\
<div class="panel-title">PACKET LOG \
<span class="count">ILLUSTRATIVE EXCHANGE\
</span>\
</div>\
<table>\
<thead>\
<tr>\
<th>#\
</th>\
<th>PROTOCOL\
</th>\
<th>DIRECTION\
</th>\
<th>MESSAGE\
</th>\
</tr>\
</thead>\
<tbody>\
</tbody>\
</table>\
</div>\
</section>\
<aside class="panel">\
<div class="panel-title">PROTOCOL NOTES \
<span>↗\
</span>\
</div>\
<div class="overview">\
<div>\
<span class="badge">LAYER ${p.layer} · ${layers[p.layer - 1][0].toUpperCase()}</span>\
<h2>${p.name}</h2>\
<h3>${p.full}</h3>\
<p>${p.about}</p>\
</div>\
<dl class="facts">\
<div>\
<dt>Default port\
</dt>\
<dd>${p.port}</dd>\
</div>\
<div>\
<dt>Transport\
</dt>\
<dd>${p.transport}</dd>\
</div>\
<div>\
<dt>Data unit\
</dt>\
<dd>${layers[p.layer - 1][1]}</dd>\
</div>\
</dl>\
<div>\
<div class="tip">✧ &nbsp; NOTE\
<br>${p.tip}</div>${p.transport === 'TCP*' ? '<p style="font-size:11px">*This walkthrough models HTTP/1.1 or HTTP/2 over TCP. HTTP/3 uses QUIC over UDP.\
</p>' : ''}<button id="layer-link" style="width:100%;margin-top:20px">Explore layer ${p.layer} →\
</button>\
</div>\
</div>\
</aside>\
</div>`;
  $('.search').value = filter;
  $('.search').oninput = (e) => {
    filter = e.target.value;
    renderList();
  };
  renderList();
  $('#play').onclick = () => {
    if (timer) {
      stop();
      update();
    } else {
      if (step >= p.steps.length) {
        step = 0;
      }
      timer = setInterval(() => {
        step++;
        if (step >= p.steps.length) {
          stop();
        }
        update();
      }, 1100);
      update();
    }
  };
  $('#next').onclick = () => {
    stop();
    step = Math.min(step + 1, p.steps.length);
    update();
  };
  $('#reset').onclick = () => {
    stop();
    step = 0;
    update();
  };
  $('#layer-link').onclick = () => {
    layer = p.layer;
    osi();
  };
  update();
}

function renderList() {
  const matches = protocols
    .map((p, i) => ({ p, i }))
    .filter(({ p }) =>
      (p.name + ' ' + p.full).toLowerCase().includes(filter.toLowerCase()),
    );
  $('.protocol-list').innerHTML =
    matches
      .map(({ p, i }) => {
        return `<button class="protocol ${selected === i ? 'selected' : ''}" data-p="${i}">\
<span class="dot">◈\
</span>\
<span>\
<b>${p.name}</b>\
<small>${p.full}</small>\
</span>\
<em>L${p.layer}</em>\
</button>`;
      })
      .join('') || '<div class="empty">No matching protocols.</div>';
  document.querySelectorAll('[data-p]').forEach((b) => {
    return (b.onclick = () => {
      stop();
      selected = +b.dataset.p;
      step = 0;
      explorer();
    });
  });
}

function update() {
  const p = protocols[selected];
  const positions = [75, 300, 525],
    height = 55 + p.steps.length * 34;
  $('#arrows').innerHTML =
    `<svg viewBox="0 0 600 ${height}" role="img" aria-label="${p.name} packet sequence. ${step} of ${p.steps.length} steps shown">\
<defs>${Object.entries(
      colors,
    )
      .map(([n, c]) => {
        return `<marker id="${n}" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">\
<path d="M0,0 L7,3 L0,6" fill="${c}"/>\
</marker>`;
      })
      .join('')}</defs>${positions
      .map((x) => {
        return `<line x1="${x}" x2="${x}" y1="5" y2="${height}" stroke="var(--edge-strong)" stroke-dasharray="4 7"/>`;
      })
      .join('')}${p.steps
      .map((s, i) => {
        const y = 35 + i * 34,
          c = colors[s[3]],
          on = i < step;
        return `<g opacity="${on ? 1 : 0.13}">\
<line x1="${positions[s[1]]}" y1="${y}" x2="${positions[s[2]]}" y2="${y + 12}" stroke="${c}" stroke-width="${i === step - 1 ? 2.5 : 1.5}" marker-end="url(#${s[3]})"/>\
<circle cx="${positions[s[1]]}" cy="${y}" r="3" fill="${c}"/>\
<text x="${(positions[s[1]] + positions[s[2]]) / 2}" y="${y - 5}" text-anchor="middle" fill="${c}" font-size="10" font-family="monospace">${s[0]}</text>\
</g>`;
      })
      .join('')}</svg>`;
  $('.progress').textContent =
    `${step.toString().padStart(2, '0')} / ${p.steps.length.toString().padStart(2, '0')}`;
  $('#play').textContent = timer
    ? 'Ⅱ Pause'
    : step === p.steps.length
      ? '↻ Replay'
      : '▶ Play';
  $('#next').disabled = step === p.steps.length;
  $('.explanation').innerHTML = step
    ? `<b>${String(step).padStart(2, '0')} / ${p.steps[step - 1][0]}</b>\
<p>${p.steps[step - 1][4]}</p>`
    : '<b>No packets yet\
</b>\
<p>Press Play to watch the exchange, or use Step to see one packet at a time.\
</p>';
  $('tbody').innerHTML =
    p.steps
      .slice(0, step)
      .map((s, i) => {
        return `<tr class="${i === step - 1 ? 'current' : ''}">\
<td>${String(i + 1).padStart(2, '0')}</td>\
<td style="color:${colors[s[3]]}">${s[3]}</td>\
<td>${s[1] === 0 ? 'Client →' : s[1] === 1 ? 'Resolver →' : 'Server →'} ${s[2] === 0 ? 'Client' : s[2] === 1 ? 'Resolver' : 'Server'}</td>\
<td>${s[0]}</td>\
</tr>`;
      })
      .join('') ||
    '<tr>\
<td colspan="4" style="color:var(--muted)">Waiting for your first packet…\
</td>\
</tr>';
}

function osi() {
  stop();
  view = 'osi';
  activate('osi');
  const l = layers[layer - 1];
  app.innerHTML = `<div class="layer-layout">\
<div class="panel layers">\
<div class="panel-title">THE SEVEN-LAYER MODEL\
</div>${[
    7, 6, 5, 4, 3, 2, 1,
  ]
    .map((n) => {
      return `<button class="layer ${n === layer ? 'selected' : ''}" data-layer="${n}" style="--c:${['var(--signal-clay)', 'var(--signal-ochre)', 'var(--signal-green)', 'var(--signal-green)', 'var(--signal-slate)', 'var(--signal-slate)', 'var(--signal-mauve)'][n - 1]}">\
<b>0${n}</b>\
<span>${layers[n - 1][0]}<small>${layers[n - 1][2]}</small>\
</span>\
</button>`;
    })
    .join(
      '',
    )}</div>\
<article class="panel lesson">\
<span class="eyebrow">OSI MODEL / LAYER 0${layer}</span>\
<h2>${l[0]} layer\
</h2>\
<p>${l[3]}</p>\
<h3>An example\
</h3>\
<p>${l[5]}</p>\
<h3>Examples & responsibilities\
</h3>\
<p>${l[4]}</p>\
<h3>Data unit: ${l[1]}</h3>\
<p>On the sending device, data moves down the stack. The receiving device processes it in the opposite direction.\
</p>\
<div class="encap">\
<span>Application data\
</span>\
<span>+ Transport header\
</span>\
<span>+ IP header\
</span>\
<span>+ Link header / trailer\
</span>\
<span>→ Bits\
</span>\
</div>\
<div class="tip" style="margin-top:30px">OSI is a learning and reference model. The internet uses the TCP/IP suite; actual protocols do not always fit neatly into seven separate layers.\
</div>\
<h3>Remember the order, top to bottom\
</h3>\
<p>All People Seem To Need Data Processing.\
</p>\
<button id="back" style="margin-top:20px">← Back to the protocol lab\
</button>\
</article>\
</div>`;
  document.querySelectorAll('[data-layer]').forEach((b) => {
    return (b.onclick = () => {
      layer = +b.dataset.layer;
      osi();
    });
  });
  $('#back').onclick = explorer;
}

$('#explore').onclick = () => {
  stop();
  explorer();
};
$('#osi').onclick = osi;
