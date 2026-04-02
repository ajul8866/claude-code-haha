# Claude Code Haha

<p align="right"><strong>Bahasa Indonesia</strong> | <a href="./README.en.md">English</a> | <a href="./README.md">中文</a></p>

**Versi lokal yang dapat dijalankan** berdasarkan source code Claude Code yang bocor, mendukung API yang kompatibel dengan Anthropic (seperti MiniMax, OpenRouter, dll).

> Source code asli yang bocor tidak dapat dijalankan langsung. Repository ini memperbaiki beberapa masalah pada startup chain agar TUI Ink lengkap dapat berjalan di lokal.

<p align="center">
  <img src="docs/00runtime.png" alt="Screenshot" width="800">
</p>

## Fitur

- TUI Ink lengkap (sama dengan Claude Code resmi)
- Mode `--print` tanpa antarmuka (untuk script/CI)
- Mendukung MCP server, plugin, dan Skills
- Mendukung API endpoint dan model kustom
- Mode CLI Recovery fallback

---

## Arsitektur

<table>
  <tr>
    <td align="center" width="25%"><img src="docs/01-overall-architecture.png" alt="Arsitektur Keseluruhan"><br><b>Arsitektur Keseluruhan</b></td>
    <td align="center" width="25%"><img src="docs/02-request-lifecycle.png" alt="Siklus Request"><br><b>Siklus Request</b></td>
    <td align="center" width="25%"><img src="docs/03-tool-system.png" alt="Sistem Tool"><br><b>Sistem Tool</b></td>
    <td align="center" width="25%"><img src="docs/04-multi-agent.png" alt="Arsitektur Multi Agent"><br><b>Arsitektur Multi Agent</b></td>
  </tr>
  <tr>
    <td align="center" width="25%"><img src="docs/05-terminal-ui.png" alt="UI Terminal"><br><b>UI Terminal</b></td>
    <td align="center" width="25%"><img src="docs/06-permission-security.png" alt="Permission & Security"><br><b>Permission & Security</b></td>
    <td align="center" width="25%"><img src="docs/07-services-layer.png" alt="Layer Services"><br><b>Layer Services</b></td>
    <td align="center" width="25%"><img src="docs/08-state-data-flow.png" alt="State & Data Flow"><br><b>State & Data Flow</b></td>
  </tr>
</table>

---

## Quick Start

### 1. Install Bun

Project ini membutuhkan [Bun](https://bun.sh). Jika belum terinstall:

```bash
# macOS / Linux (script resmi)
curl -fsSL https://bun.sh/install | bash
```

Jika di Linux minimalis muncul pesan `unzip is required to install bun`:

```bash
# Ubuntu / Debian
apt update && apt install -y unzip
```

```bash
# macOS (Homebrew)
brew install bun
```

```powershell
# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

Setelah install, buka ulang terminal dan verifikasi:

```bash
bun --version
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Konfigurasi Environment Variable

Copy file contoh dan isi API Key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Autentikasi API (pilih salah satu)
ANTHROPIC_API_KEY=sk-xxx          # API Key standar (header x-api-key)
ANTHROPIC_AUTH_TOKEN=sk-xxx       # Bearer Token (header Authorization)

# API Endpoint (opsional, default Anthropic resmi)
ANTHROPIC_BASE_URL=https://api.minimaxi.com/anthropic

# Konfigurasi Model
ANTHROPIC_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_SONNET_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_HAIKU_MODEL=MiniMax-M2.7-highspeed
ANTHROPIC_DEFAULT_OPUS_MODEL=MiniMax-M2.7-highspeed

# Timeout (milidetik)
API_TIMEOUT_MS=3000000

# Nonaktifkan telemetry dan network request non-esensial
DISABLE_TELEMETRY=1
CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

### 4. Jalankan

#### macOS / Linux

```bash
# Mode TUI interaktif (interface lengkap)
./bin/claude-haha

# Mode print (single query)
./bin/claude-haha -p "your prompt here"

# Pipe input
echo "explain this code" | ./bin/claude-haha -p

# Lihat semua opsi
./bin/claude-haha --help
```

#### Windows

> **Prasyarat**: Harus install [Git for Windows](https://git-scm.com/download/win) (menyediakan Git Bash).

**Cara 1: PowerShell / cmd dengan Bun (recommended)**

```powershell
# Mode TUI interaktif
bun --env-file=.env ./src/entrypoints/cli.tsx

# Mode print
bun --env-file=.env ./src/entrypoints/cli.tsx -p "your prompt here"

# Recovery CLI fallback
bun --env-file=.env ./src/localRecoveryCli.ts
```

**Cara 2: Git Bash**

```bash
# Di terminal Git Bash, sama seperti macOS/Linux
./bin/claude-haha
```

> **Note**: Beberapa fitur (voice input, Computer Use, Sandbox isolation) tidak tersedia di Windows.

---

## Environment Variables

| Variable                                   | Required   | Keterangan                                             |
| ------------------------------------------ | ---------- | ------------------------------------------------------ |
| `ANTHROPIC_API_KEY`                        | pilih satu | API Key, dikirim via header `x-api-key`                |
| `ANTHROPIC_AUTH_TOKEN`                     | pilih satu | Auth Token, dikirim via header `Authorization: Bearer` |
| `ANTHROPIC_BASE_URL`                       | tidak      | API endpoint kustom, default Anthropic resmi           |
| `ANTHROPIC_MODEL`                          | tidak      | Model default                                          |
| `ANTHROPIC_DEFAULT_SONNET_MODEL`           | tidak      | Mapping model level Sonnet                             |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL`            | tidak      | Mapping model level Haiku                              |
| `ANTHROPIC_DEFAULT_OPUS_MODEL`             | tidak      | Mapping model level Opus                               |
| `API_TIMEOUT_MS`                           | tidak      | Timeout request API, default 600000 (10 menit)         |
| `DISABLE_TELEMETRY`                        | tidak      | Set `1` untuk nonaktifkan telemetry                    |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | tidak      | Set `1` untuk nonaktifkan network request non-esensial |

---

## Mode Recovery

Jika TUI lengkap bermasalah, gunakan mode readline interaktif yang disederhanakan:

```bash
CLAUDE_CODE_FORCE_RECOVERY_CLI=1 ./bin/claude-haha
```

---

## Perbaikan dari Source Code Asli

Source code yang bocor tidak dapat dijalankan langsung. Perbaikan utama:

| Masalah                | Penyebab                                                                         | Perbaikan                                |
| ---------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| TUI tidak start        | Entry script route startup tanpa parameter ke recovery CLI                       | Restore ke entry point `cli.tsx` lengkap |
| Startup hang           | `verify` skill import file `.md` yang tidak ada                                  | Buat stub file `.md`                     |
| `--print` hang         | `filePersistence/types.ts` tidak ada                                             | Buat type stub file                      |
| `--print` hang         | `ultraplan/prompt.txt` tidak ada                                                 | Buat resource stub file                  |
| **Enter tidak respon** | package native `modifiers-napi` tidak ada, `isModifierPressed()` throw exception | Tambah try-catch error handling          |
| Setup di-skip          | `preload.ts` auto-set `LOCAL_RECOVERY=1` skip semua inisialisasi                 | Hapus default setting                    |

---

## Struktur Project

```
bin/claude-haha          # Entry script
preload.ts               # Bun preload (set MACRO global variables)
.env.example             # Environment variable template
src/
├── entrypoints/cli.tsx  # CLI main entry
├── main.tsx             # TUI main logic (Commander.js + React/Ink)
├── localRecoveryCli.ts  # Fallback Recovery CLI
├── setup.ts             # Startup initialization
├── screens/REPL.tsx     # Interactive REPL interface
├── ink/                 # Ink terminal rendering engine
├── components/          # UI components
├── tools/               # Agent tools (Bash, Edit, Grep, etc.)
├── commands/            # Slash commands (/commit, /review, etc.)
├── skills/              # Skill system
├── services/            # Services layer (API, MCP, OAuth, etc.)
├── hooks/               # React hooks
└── utils/               # Utility functions
```

---

## Tech Stack

| Kategori    | Teknologi                                          |
| ----------- | -------------------------------------------------- |
| Runtime     | [Bun](https://bun.sh)                              |
| Bahasa      | TypeScript                                         |
| Terminal UI | React + [Ink](https://github.com/vadimdemedes/ink) |
| CLI Parser  | Commander.js                                       |
| API         | Anthropic SDK                                      |
| Protocol    | MCP, LSP                                           |

---

## Disclaimer

Repository ini berdasarkan source code Claude Code yang bocor dari Anthropic npm registry pada 2026-03-31. Semua hak cipta source code asli milik [Anthropic](https://www.anthropic.com). Hanya untuk tujuan pembelajaran dan penelitian.
