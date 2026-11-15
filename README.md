# Packet Lab — Network Protocol Explorer

Packet Lab is an interactive way to learn how network protocols work. It includes 40 lessons covering HTTPS, DNS, TCP, Wi-Fi, routing, proxies, and more. Each lesson shows a simulated exchange that you can watch or step through one message at a time.

## Run locally

Open `index.html` in a web browser. Keep the JavaScript and CSS files in the same folder. There's no installation, build step, or local server required. An internet connection is only needed to load the optional Google Fonts. The lessons run with fallback fonts when you're offline.

## Explore a lesson

1. Pick a protocol from the library, or search for it by name.
2. Select **Play** to watch the exchange, or use **Step** to move one message at a time. You can also select a specific step from the lesson list.
3. Use **Network** to follow packets between devices and **Sequence** to see messages in order.
4. Select a row in **Packet Flow** to open the packet inspector. DNS, TCP handshake, and plain HTTP examples include byte samples. Select a field to highlight its bytes.
5. Select **OSI model** to explore all seven layers.

Use **Ctrl + K** (or **⌘ + K**) to search, **Space** to play or pause, and **← / →** to move between messages.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Page layout, navigation, and dialogs |
| `app.js` | Core lessons, explorer rendering, and OSI model |
| `network.js` | Network diagrams, packet animation, and playback controls |
| `catalog.js` | Additional lessons and protocol ordering |
| `dashboard.js` | Filters, packet inspector, and keyboard shortcuts |
| `style.css`, `network.css`, `dashboard.css` | Layout, diagrams, and light and dark themes |

The examples illustrate typical protocol exchanges using simulated traffic and sample data. Packet Lab does not capture live network traffic.
