const message = (name, from, to, protocol, detail) => [name, from, to, protocol, detail];
const tls = [
  message(
    'Client Hello',
    0,
    2,
    'TLS',
    'The client proposes TLS versions and cryptographic options and sends an ephemeral key share.',
  ),
  message(
    'Server Hello',
    2,
    0,
    'TLS',
    'The server selects the parameters and sends its key share. Both peers can now derive handshake keys.',
  ),
  message(
    'Certificate + Finished',
    2,
    0,
    'TLS',
    'The server sends its certificate and proof of possession under encryption. The client verifies its identity and the handshake transcript.',
  ),
  message(
    'Client Finished',
    0,
    2,
    'TLS',
    'The client confirms the handshake transcript. The connection can carry protected application data.',
  ),
];
protocols[0].steps.splice(5, 1, ...tls);
const additions = [
  [
    'TLS',
    'Transport Layer Security',
    6,
    'Varies',
    'TCP',
    'Authenticates peers and protects application data in transit. Shown near presentation in the OSI model for teaching purposes.',
    [...tcp, ...tls],
  ],
  [
    'WebSocket',
    'Two-way browser messaging',
    7,
    '80 / 443',
    'TCP',
    'An HTTP/1.1 upgrade opens a long-lived connection for messages in both directions.',
    [
      ...tcp,
      ['Upgrade: websocket', 0, 2],
      ['101 Switching Protocols', 2, 0],
      ['Text frame', 0, 2],
      ['Text frame', 2, 0],
    ],
  ],
  [
    'SSH',
    'Secure Shell',
    7,
    '22',
    'TCP',
    'Encrypts remote terminal sessions. Host keys let clients verify the server.',
    [
      ...tcp,
      ['Version exchange', 0, 2],
      ['Key exchange', 2, 0],
      ['User authentication', 0, 2],
      ['Channel open', 0, 2],
    ],
  ],
  [
    'NTP',
    'Network Time Protocol',
    7,
    '123',
    'UDP',
    'Exchanges timestamps to estimate clock offset and round-trip delay.',
    [
      ['Time request', 0, 2],
      ['Timestamp reply', 2, 0],
    ],
  ],
  [
    'IMAP',
    'Internet Message Access Protocol',
    7,
    '143 / 993',
    'TCP',
    'Accesses and synchronizes mail stored on a server. This example starts after connection setup.',
    [
      ['Server greeting', 2, 0],
      ['SELECT INBOX', 0, 2],
      ['Mailbox status', 2, 0],
      ['FETCH', 0, 2],
      ['Message data', 2, 0],
    ],
  ],
  [
    'POP3',
    'Post Office Protocol v3',
    7,
    '110 / 995',
    'TCP',
    'Retrieves messages from a mailbox. This example starts after authentication.',
    [
      ['LIST', 0, 2],
      ['Message list', 2, 0],
      ['RETR 1', 0, 2],
      ['Message contents', 2, 0],
      ['QUIT', 0, 2],
    ],
  ],
  [
    'IPv4',
    'Internet Protocol v4',
    3,
    'No ports',
    'Network',
    'Routers select the next hop from the destination IP address and decrement TTL.',
    [
      ['IPv4 packet', 0, 2],
      ['IPv4 response', 2, 0],
    ],
  ],
  [
    'IPv6',
    'Internet Protocol v6',
    3,
    'No ports',
    'Network',
    'IPv6 uses 128-bit addresses. Routers decrement the Hop Limit when forwarding packets.',
    [
      ['IPv6 packet', 0, 2],
      ['IPv6 response', 2, 0],
    ],
  ],
];
additions.forEach(([name, full, layer, port, transport, about, steps]) => {
  colors[name] ??= 'var(--signal-slate)';
  protocols.push({
    name,
    full,
    layer,
    port,
    transport,
    about,
    tip: about,
    steps: steps.map(([label, from, to, proto, detail]) => {
      return message(
        label,
        from,
        to,
        proto || name,
        detail ||
          {
            'Upgrade: websocket':
              'The client asks to upgrade this HTTP connection to WebSocket.',
            '101 Switching Protocols':
              'The server accepts the upgrade. Both ends can now send WebSocket frames.',
            'Text frame':
              'A text message travels over the established WebSocket connection.',
            'Version exchange': 'Client and server announce their SSH protocol versions.',
            'Key exchange':
              'The peers negotiate keys and the server proves possession of its host key.',
            'User authentication':
              'The client authenticates over the encrypted SSH connection.',
            'Channel open': 'The client opens a logical channel for an SSH service.',
            'Time request': 'The client sends a timestamped request to the time server.',
            'Timestamp reply':
              'The server returns timestamps for when it received and sent the message.',
            'Server greeting':
              'The server announces that it is ready to accept commands.',
            'SELECT INBOX': 'The client selects the inbox for subsequent commands.',
            'Mailbox status':
              'The server reports information about the selected mailbox.',
            'FETCH':
              'The client requests selected fields or contents of one or more messages.',
            'Message data': 'The server returns the requested message data.',
            'LIST': 'The client asks for the available message numbers and sizes.',
            'Message list': 'The server lists the messages available for retrieval.',
            'RETR 1': 'The client requests the first message in the current session.',
            'Message contents': 'The server returns the requested email.',
            'QUIT': 'The client asks to end the session.',
          }[label] ||
          'Each router forwards the packet towards the destination using its routing table. The reply makes an independent journey back.',
      );
    }),
  });
});
let category = 'All';
const categoryFor = (p) => {
  return securityLessons.has(p.name)
    ? 'Security'
    : p.layer <= 4 || p.name === 'BGP'
      ? 'Core'
      : 'Application';
};
const originalList = renderList;

renderList = function () {
  originalList();
  const list = $('.protocol-list');
  if (!list) {
    return;
  }
  list.querySelectorAll('[data-p]').forEach((button) => {
    const p = protocols[+button.dataset.p];
    if (category !== 'All' && categoryFor(p) !== category) {
      if (button.nextElementSibling?.classList.contains('step-list')) {
        button.nextElementSibling.remove();
      }
      button.remove();
    }
  });
  if (!list.children.length) {
    list.innerHTML = '<div class="empty">No matching lessons.</div>';
  }
  document
    .querySelectorAll('[data-category]')
    .forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.category === category)),
    );
};
const networkExplorer = explorer,
  networkUpdate = update;

explorer = function () {
  networkExplorer();
  const workspace = $('.workspace'),
    controls = $('.controls');
  $('.workspace aside .count').textContent = protocols.length;
  $('.search').insertAdjacentHTML(
    'afterend',
    '<div class="categories">' +
      ['All', 'Core', 'Application', 'Security']
        .map((c) => {
          return (
            '<button data-category="' +
            c +
            '">' +
            c +
            ' <small>' +
            protocols.filter((p) => c === 'All' || categoryFor(p) === c).length +
            '</small></button>'
          );
        })
        .join('') +
      '</div>',
  );
  document.querySelectorAll('[data-category]').forEach((b) => {
    return (b.onclick = () => {
      category = b.dataset.category;
      renderList();
    });
  });
  $('.packets .panel-title').innerHTML =
    '<strong>PACKET FLOW\
</strong>\
<div class="legend" aria-label="Packet colors">\
</div>';
  $('.packets .panel-title').append(controls);
  $('.center .explanation').removeAttribute('aria-live');
  $('.overview').setAttribute('aria-live', 'polite');
  workspace.classList.add('reference-layout');
  renderList();
  update();
};

function fieldView(p, s) {
  const [label, from, to, protocol] = s;
  const endpoints = lessonEndpoints(p);
  const source = endpoints[from],
    target = endpoints[to];
  const fields = [
    ['Source', source],
    ['Destination', target],
    ['Protocol', protocol],
    ['Message', label],
  ];
  let wire = [];
  const add = (name, value, bytes) => {
    const start = wire.length;
    wire.push(...bytes);
    fields.push([name, value, start, wire.length]);
  };
  if (protocol === 'DNS') {
    const reply = from === 1;
    add('Transaction ID', '0x4a32', [0x4a, 0x32]);
    add(
      'Flags',
      reply ? 'Response · no error' : 'Query · recursion desired',
      reply ? [0x81, 0x80] : [1, 0],
    );
    add('Question count', '1', [0, 1]);
    add('Answer count', reply ? '1' : '0', reply ? [0, 1] : [0, 0]);
    add('Authority / additional count', '0 / 0', [0, 0, 0, 0]);
    add(
      'Question',
      'example.com · A · IN',
      [7, 101, 120, 97, 109, 112, 108, 101, 3, 99, 111, 109, 0, 0, 1, 0, 1],
    );
    if (reply) {
      add(
        'Answer',
        '203.0.113.10 · TTL 60 seconds',
        [0xc0, 0x0c, 0, 1, 0, 1, 0, 0, 0, 60, 0, 4, 203, 0, 113, 10],
      );
    }
  } else if (protocol === 'TCP' && ['SYN', 'SYN + ACK', 'ACK'].includes(label)) {
    const port =
      Number(p.port.split(' / ')[0]) ||
      { TLS: 443, SMTP: 25, WebSocket: 80, SSH: 22 }[p.name] ||
      443;
    const u16 = (n) => [n >> 8, n & 255],
      u32 = (n) => [0, 0, ...u16(n)];
    const client = from === 0,
      seq = client ? (label === 'ACK' ? 1001 : 1000) : 2000,
      ack = label === 'SYN' ? 0 : client ? 2001 : 1001;
    add('Source port', client ? 52144 : port, u16(client ? 52144 : port));
    add('Destination port', client ? port : 52144, u16(client ? port : 52144));
    add('Sequence number', seq, u32(seq));
    add('Acknowledgement number', ack, u32(ack));
    add('Header length and flags', '20 bytes · ' + label, [
      0x50,
      { SYN: 2, 'SYN + ACK': 18, ACK: 16 }[label],
    ]);
    add('Receive window', '64240', u16(64240));
    add('Checksum / urgent pointer', 'Illustrative checksum placeholder', [0, 0, 0, 0]);
  } else if (protocol === 'HTTP' && !label.startsWith('Encrypted')) {
    const header =
      from === 0
        ? 'GET / HTTP/1.1\r\nHost: example.com\r\n\r\n'
        : 'HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nHello';
    add(
      'HTTP message',
      from === 0 ? 'GET / · Host: example.com' : '200 OK · Content-Length: 5',
      [...new TextEncoder().encode(header)],
    );
  }
  return { fields, wire };
}

function inspect(i) {
  jump(i + 1);
  const p = protocols[selected],
    s = p.steps[i],
    { fields, wire } = fieldView(p, s);
  const dialog = $('#packet-inspector');
  dialog.querySelector('h2').textContent = s[0];
  dialog.querySelector('.decode').innerHTML = fields
    .map(([key, val, start, end]) => {
      return (
        '<button ' +
        (start === undefined
          ? 'disabled'
          : 'data-start="' + start + '" data-end="' + end + '"') +
        '><span>' +
        key +
        '</span><strong>' +
        val +
        '</strong></button>'
      );
    })
    .join('');
  dialog.querySelector('.hex').innerHTML = wire.length
    ? wire.map((n) => '<span>' + n.toString(16).padStart(2, '0') + '</span>').join('')
    : '<p>This lesson provides a message summary. A byte sample is available for DNS, the TCP handshake, and plain HTTP.\
</p>';
  dialog.querySelectorAll('[data-start]').forEach((b) => {
    return (b.onclick = () => {
      return dialog.querySelectorAll('.hex span').forEach((byte, j) => {
        return byte.classList.toggle(
          'marked',
          j >= +b.dataset.start && j < +b.dataset.end,
        );
      });
    });
  });
  dialog.showModal();
}

update = function () {
  networkUpdate();
  if (!$('.workspace')) {
    return;
  }
  const p = protocols[selected];
  layerPicker
    .querySelectorAll('[data-n]')
    .forEach((b) => b.classList.toggle('selected', +b.dataset.n === p.layer));
  const endpoints = lessonEndpoints(p);
  const endpointLabels = document.querySelectorAll('.endpoints > div');
  endpointLabels.forEach((el, i) => {
    if (el.childNodes[1]) {
      el.childNodes[1].textContent = endpoints[i];
    }
    el.hidden = !p.steps.some((s) => s[1] === i || s[2] === i);
  });
  const legend = $('.legend');
  if (legend) {
    legend.innerHTML = [...new Set(p.steps.map((s) => s[3]))]
      .map((name) => '<span style="--packet:' + colors[name] + '">' + name + '</span>')
      .join('');
  }
  $('thead tr').innerHTML =
    '<th scope="col">NO.\
</th>\
<th scope="col">SOURCE\
</th>\
<th scope="col">DESTINATION\
</th>\
<th scope="col">PROTOCOL\
</th>\
<th scope="col">MESSAGE\
</th>\
<th scope="col">SAMPLE\
</th>';
  const addresses =
    p.name === 'IPv6'
      ? ['2001:db8:1::10', '—', '2001:db8:2::10']
      : ['192.168.1.10', '8.8.8.8', '203.0.113.10'];
  document.querySelectorAll('tbody tr').forEach((tr, i) => {
    if (!p.steps[i] || i >= step) {
      tr.firstElementChild.colSpan = 6;
      return;
    }
    const s = p.steps[i],
      sample = fieldView(p, s).wire.length;
    const hosts =
      p.localEndpoint || p.name === 'DHCP' || p.name === 'Reverse proxy'
        ? endpoints
        : addresses;
    tr.innerHTML =
      '<td>' +
      (i + 1) +
      '</td><td>' +
      hosts[s[1]] +
      '</td><td>' +
      hosts[s[2]] +
      '</td><td style="color:' +
      colors[s[3]] +
      '">' +
      s[3] +
      '</td><td>' +
      s[0] +
      '</td><td>' +
      (sample ? sample + ' B' : '—') +
      '</td>';
    tr.title = 'Inspect packet fields and bytes';
    tr.onclick = () => inspect(i);
    tr.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inspect(i);
      }
    };
  });
  const button = $('#overview-toggle');
  if (button) {
    $('.workspace>aside:last-of-type .panel-title > span').textContent = showOverview
      ? 'PROTOCOL OVERVIEW'
      : 'STEP DETAILS';
  }
  for (const tab of ['network', 'sequence']) {
    $('#' + tab + '-tab')?.setAttribute('aria-pressed', String(mode === tab));
  }
};
const layerPicker = $('#layer-picker');
layerPicker.innerHTML =
  '<span>OSI LAYER</span><div>' +
  layers
    .map(([name], i) => {
      return (
        '<button aria-label="Layer ' +
        (i + 1) +
        ' · ' +
        name +
        '" title="' +
        name +
        '" data-n="' +
        (i + 1) +
        '">' +
        (i + 1) +
        '</button>'
      );
    })
    .join('') +
  '</div>';
layerPicker.querySelectorAll('button').forEach((b) => {
  return (b.onclick = () => {
    layer = +b.dataset.n;
    osi();
  });
});
$('#help').onclick = () => $('#shortcuts').showModal();
let light = false;
try {
  light = localStorage.getItem('packet-lab-theme') === 'light';
} catch {}

function theme() {
  document.body.classList.toggle('light', light);
  $('#theme').textContent = light ? '☾' : '☀';
  $('#theme').setAttribute('aria-label', light ? 'Use dark theme' : 'Use light theme');
}

$('#theme').onclick = () => {
  light = !light;
  try {
    localStorage.setItem('packet-lab-theme', light ? 'light' : 'dark');
  } catch {}
  theme();
};
theme();
document.addEventListener('keydown', (event) => {
  if (
    event.target.closest('input,select,textarea,dialog') ||
    document.querySelector('dialog[open]')
  ) {
    return;
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!$('.search')) {
      explorer();
    }
    $('.search').focus();
    return;
  }
  if (view !== 'explorer' || event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }
  if (event.code === 'Space' && event.target.tagName !== 'BUTTON') {
    event.preventDefault();
    playScene();
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    jump(step + 1);
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    jump(step - 1);
  }
});
const requested = new URLSearchParams(location.search).get('p')?.toLowerCase();
protocols.sort((a, b) => preferredOrder.indexOf(a.name) - preferredOrder.indexOf(b.name));
const requestedIndex = protocols.findIndex((p) => p.name.toLowerCase() === requested);
selected =
  requestedIndex >= 0 ? requestedIndex : protocols.findIndex((p) => p.name === 'HTTPS');

$('#expand').onclick = () => {
  const expanded = document.body.classList.toggle('expanded-network');
  $('#expand').setAttribute('aria-pressed', String(expanded));
};
explorer();
