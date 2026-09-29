# Nightpaw: Vibe-Games store listing

Nightpaw is published on Vibe-Games like any creator's game: upload the package in
**Publish** and paste the copy below. Nothing about it ships inside the Vibe-Games code.

## Files

`node tools/pack.cjs` builds the game and writes:

| Publish field | File |
| --- | --- |
| Game package | `release/nightpaw-<version>.zip` |
| Cover / key art (600×900) | `release/store/cover.png` |
| Header capsule (920×430) | `release/store/header.png` |
| Store banner (1920×620) | `release/store/banner.png` |
| Screenshots | `release/store/shot1.png` … `shot5.png` |

The store art comes from `node tools/store/make-store-media.cjs --shots http://localhost:8123/index.html`
(serve `dist/` on port 8123 first). Re-run it when the look of the game changes.

## Store copy

**Title:** Nightpaw
**Developer:** Moonwhisker Studio
**Price:** $9.99, with the 5-minute instant demo on

**Short description:**
A small black cat in a red scarf-cloak follows a missing girl down the old well, into the Underneath, where lost things go.

**About this game** (paragraphs separated by a blank line):

One stormy night Mira follows a pale moth out of her window, and in the morning her bed is empty. Her cat, Nightpaw, has already spent eight of his nine lives. He jumps down the well anyway.

The Underneath used to be lit by the Hearthlamp. Now it is dark, and lost things are forgetting what they were: thimbles, socks and buttons gone hollow. Scratch your way through them, find the Shadow Dash and Moth Wings, and recover the lost lives you left down here long ago.

A story-driven metroidvania with painted storybook cutscenes, a cast of polite, frightened creatures, secrets, and the Hollow Warden waiting in his hall. Keyboard, gamepad and touch.

**Tags:** Metroidvania, Action, Dark Fantasy, Cute, Exploration, Platformer

**Built with:** Claude Code
**The prompt that started it:** A tiny black cat with a red scarf goes down a well to find the girl who owns him. Metroidvania, storybook cutscenes, sad but cosy. Make the cat feel amazing to control first.
**Time to build:** fill in your own estimate

Controller Support and Touch Controls are added to the store page automatically from
`"input"` in `manifest.json`; Cloud Saves and Achievements come from the SDK and the
manifest's achievement list.

## Updates

Bump `"version"` in `manifest.json` (versions are immutable, and each one must be higher
than the last), run `node tools/pack.cjs`, then use **Publish → your game → Update**
and drop in the new zip. Players only download the files that changed.
To change the art or copy later, use **Edit store page**, which can also replace the cover,
header, banner and screenshots.
