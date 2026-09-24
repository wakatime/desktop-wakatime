# desktop-wakatime

Desktop system tray app for automatic time tracking and metrics generated from your app usage activity.

## Install

https://wakatime.com/desktop

## Usage

Keep the app running in your system tray, and your app usage will show on your [WakaTime dashboard][dashboard].

### Codex desktop project attribution on Windows

The Codex window title does not identify its active project. To opt into reading
the active task ID from Codex's local desktop log and its workspace path from
the task's session metadata, add this to `~/.wakatime.cfg`:

```ini
[settings]
codex_context_enabled = true
```

When the Codex window is active, WakaTime passes that workspace path to
`wakatime-cli` for normal project detection. Codex window time has no inferred
language; file activity from AI transcripts keeps its detected programming
language. If the task ID or workspace cannot be resolved, window tracking
continues without a project label. This feature reads only local log and
session metadata; it does not send task titles or transcript text.
The workspace path is passed locally to `wakatime-cli`, with its folder and
branch names hidden from Codex window heartbeats. The detected project name
is still sent to WakaTime.
Only new activity is labelled. This currently supports the packaged Windows
Codex app and depends on an internal Codex log format that may change.

## Local Development Setup

```shell
git clone git@github.com:wakatime/desktop-wakatime.git
cd desktop-wakatime
npm i
npm run dev
```

## Generate Release

To create a release build for the platform you are currently using, run the following command:

```shell
npm run build
```

Once the build completes, you will find the installer file at the following path:

```shell
/release/wakatime-[Platform]-[Arch].[Extension]
```

## Supported Apps

Before requesting support for a new app, first check the [list of supported apps][supported apps].

## Contributing

Pull requests and issues are welcome!
See [Contributing][contributing] for more details.

Made with :heart: by the WakaTime Team.

[api key]: https://wakatime.com/api-key
[dashboard]: https://wakatime.com/
[supported apps]: https://github.com/wakatime/desktop-wakatime/blob/80fba053a1334f22f08c4d0b069be4951d15de95/electron/watchers/apps.ts#L3
[contributing]: CONTRIBUTING.md
