# Miatagotchi: design plan

Status: draft v1, written after the first Q&A round (30 Oct 2026).
Mock-up: [`mock/index.html`](../mock/index.html) (playable main screen and sprite sheet).

## 1. The idea

A pocket NA Miata that lives on your phone. It starts as a barn find under a tarp, needs fuel, drives, washes and repairs, and grows up by getting modded. How you care for it decides what it becomes: Track, Stance, Safari or Concours, or blends like Rally and Drift. When two owners scan each other's QR codes, their cars meet, flash their pop-ups at each other (the Miata wave) and gossip about their owners.

## 2. Decisions so far

| Topic | Decision |
| --- | --- |
| Audience | Me and friends. The name Miatagotchi stays; it would need a new name for a public release ("Miata" and "-gotchi" are other companies' trademarks). |
| Platform | Installable PWA. iPhone and Android matter equally, so design for iPhone Safari's limits. |
| Hosting | GitHub Pages from this repo. No server in v1. |
| Code | TypeScript + Vite (chosen for maintainability; you won't be editing code). |
| Main view | Cute 3/4 front view. Waiting on your reference picture. |
| Other views | Side view for driving and meetups, front "face" close-ups, top-down for mini-games and the mods screen. |
| Color setting | Changes the game screen only. The device shell keeps its paint color. |
| Color off | 4-shade LCD in the Game Boy style. |
| Device | Car-front toy shell: pop-up headlight "ears", A/B/C in the air intake, the car's name on the plate. |
| Attention | A few short check-ins a day. |
| Neglect | Permadeath is a settings toggle you can change anytime. |
| Growth | Open-ended: new parts and tiers keep coming. |
| Path choice | Habits earn path points; you confirm the path at the fork. |
| Paths | Track, Stance, Safari, Concours. Blends: Rally, Drift. Special: Rust Bucket, secret V8 Monster. |
| Parts | Growth sets the big changes; you make small choices (wing style, wheel color, stickers). |
| Mini-games | Autocross cones, Canyon run, Heel-toe rhythm, Car-meet photo shoot. |
| Personality | Random trait per car. |
| Dialogue | Written templates filled with real stats. Offline, no AI. |
| Extra mechanics | Sleep on the real clock, discipline, weight, simulated weather. |
| Garage | One active car. Retire it to the Hall of Fame anytime. |
| Saving | On the phone, plus a backup code or QR. No accounts. |
| Sharing | Picture card, read-only link, animated GIF, Hall of Fame page. |
| Meetups | Both phones scan each other. Works offline. |
| Meetup perks | Mood boost, sticker trade, friendship stamps, path points. |
| Owner info in chats | Nickname and game stats only. |
| Paint | Random NA factory color at the reveal, repaint later, rare special-edition colors. |
| Naming | The owner names the car when the tarp comes off; the name goes on the plate. |
| Main screen | Classic: needs only show in Gauges; the check-engine light signals trouble. |
| Sound | Chiptune beeps, off by default. |
| Notifications | Not in v1. Maybe later (needs a small push server). |
| Language | English only. All text lives in one strings file so translations can come later. |
| Humor | Lots of Miata inside jokes. |

## 3. Look and feel

### The screen

- A small logical canvas (about 96 × 88 pixels: a 96 × 64 play area plus an icon row above and below), scaled up by whole device pixels so every pixel stays square and sharp.
- Every sprite is palette-indexed: each pixel stores a palette key, not a color. The same sprite renders in **Color** (a limited palette built around NA factory paints) and in **Mono** (4 greens: `#d3dcb2`, `#99ad7e`, `#57704f`, `#1f3326`) with dot-matrix gaps and a faint segment shadow.
- The screen ticks at 8 frames per second for the pet, like an LCD toy. Mini-games run smoother.

### Views

| View | Used for | Art needed |
| --- | --- | --- |
| 3/4 front | Home screen, most of the time | Every part |
| Side | Drive animation, Canyon run, meetups | Every part |
| Front face | Petting, big reactions, sickness | Parts that change the face (lights, lips, bull bars) |
| Top-down | Autocross, mods screen | Simplified parts |

The pop-up headlights are the eyes in every view: up when awake, down when asleep, a quick down-up to blink, one down to wink. The front air intake is the mouth.

### The device shell

- Shaped like the front of an NA: pop-up headlight "ears" that fold down when it sleeps and blink with it, the keyring as the rear-view mirror, A/B/C buttons inside the air intake, amber turn signals, and the license plate carrying the car's name.
- The shell takes the car's paint color.
- Tapping the license plate opens the car's card: **Share**, **Meet** and **Backup**.

### Icons and buttons

Eight icons on the screen frame, as on the original toy:

| Top row | Fuel | Drive | Garage | Fix |
| --- | --- | --- | --- | --- |
| **Bottom row** | **Wash** | **Gauges** | **Horn** | **Check engine** |

- **Garage** opens a small menu: lights out (sleep), Mods, Paint shop, Hall of Fame.
- **Horn** is the discipline button (the mock shows a Mods icon in this slot; it moves into Garage).
- **Check engine** is the attention light: it blinks when the car needs something or is acting up.
- **A** moves the cursor, **B** selects, **C** goes back. Icons can also be tapped directly, and tapping the car pets it.

## 4. The pet

### Life stages

| Stage | Look | Typical timing |
| --- | --- | --- |
| Barn find | A lumpy tarp with one tire peeking out. Tap to pull the tarp off, then name the car. | First 5 minutes |
| Beater | Steel wheels, rust spots, a primer-gray door, sun-faded paint | Day 1 |
| Daily | Cleaned up, factory wheels, pop-ups working | Days 2 to 3 |
| Project | First bolt-ons. Path points become visible in Gauges. | Days 4 to 6 |
| Build, tier 1, 2, 3 and up | Path parts pile on | A new tier every 3 to 5 days of good care, with no end |

Age shows as days and as odometer miles.

### Needs

Each need shows as four hearts on the Gauges screen.

- **Fuel** (hunger). Regular is a meal. Premium is a treat: more fun, more weight. Octane booster is a snack: a big mood bump, extra weight, and a small check-engine risk if overused.
- **Fun** (happiness). Drives, mini-games and petting.
- **Clean.** Oil drips under the car are the "poop". Mud, bird droppings and winter road salt add to it. Wash cleans everything.
- **Health.** Drops after care mistakes, ignored drips, rain with the top down and normal wear. Fix covers oil changes, tune-ups and repairs.
- **Sleep.** Bedtime follows the real clock (default 10 pm to 7 am, adjustable). Close the garage when it gets sleepy; leaving the lights on is a care mistake. While asleep the top goes up and the pop-ups close.
- **Discipline.** Sometimes it acts up without a real need: honks at night, refuses to start, flashes a fake check-engine code. Press Horn to correct it. Better discipline means better mini-game scores and fewer tantrums.
- **Weight.** Curb weight starts around 2,100 lb. Premium fuel, snacks and heavy parts add pounds; "add lightness" parts take them off. Weight matters for Track scores and for the V8 secret.
- **Weather** (simulated, no location). Sun, clouds, rain and snow follow the real season. Rain means the top should go up; snow and salt mean a wash or rust.

### Pace

- Each need loses one heart about every 3 to 4 hours while awake, about four times slower while asleep, so 3 to 5 short visits a day keep it happy.
- A **care mistake** is a need left empty for 30 minutes, the check-engine light ignored for an hour, or bedtime ignored for an hour. Care mistakes push it toward Rust Bucket and hurt health.
- When the app opens, the game catches up on the time it was closed, minute by minute (capped at 7 days), with a random-number generator seeded from the car and the clock, so the result is always the same.

### Check-engine light

Blinks when there is a real need or a tantrum. Tap it to read the "code", for example *P0300: random misfire, probably feelings*.

### Breakdown and permadeath

- **Permadeath off** (default): health at zero for 12 hours means it breaks down and gets towed to the junkyard. Rescue it with cash or a repair mini-game. It comes back looking like a Beater, with Rust Bucket points.
- **Permadeath on**: the same breakdown, but if it isn't rescued within 24 hours it is crushed ("rust in peace") and enters the Hall of Fame as a memorial.
- The toggle lives in Settings and can be changed anytime. Turning it on asks for confirmation.

### Personality

One random trait at the reveal: **Eager, Lazy, Diva, Grumpy, Nervous** or **Show-off**. The trait sets a favorite activity (extra fun), how often it throws tantrums, its idle animations and the voice of its dialogue.

## 5. Growth and paths

### Path points

Everything you do adds points to one or more paths.

| Activity | Track | Stance | Safari | Concours |
| --- | --- | --- | --- | --- |
| Autocross cones | +3 | | | |
| Canyon run | +2 | | +1 on gravel stages | |
| Heel-toe rhythm | +2 | +1 | | |
| Photo shoot at a car meet | | +2 | | +1 |
| Dirt-road cruise | | | +3 | |
| Coast-road cruise | +1 | | | +1 |
| Wash and wax | | +1 | | +2 |
| Garage nights on time | | | | +1 |
| Staying light (under 2,050 lb) | +1 per day | | | |
| Getting muddy and leaving it | | | +1 | |
| Meeting a friend | +1 toward the friend's path | | | |

Care mistakes add **Rust Bucket** points instead.

### The fork

At the end of the Project stage, every path above a threshold counts as qualified. You pick one of them, and a reveal animation plays as the first parts go on. If only one path qualifies, it is confirmed automatically. If none qualifies, the car becomes a **Rust Bucket**.

### Blends

Points keep coming after the fork. When a second path reaches 60% of the main path's points, a blend unlocks and you confirm it:

- **Track + Safari = Rally**: mud flaps, light pods, roof scoop, rally plates.
- **Track + Stance = Drift**: angle kit, mismatched panels, tire smoke.
- More blends can be added later (for example a Concours + Track "restomod").

**Rust Bucket** is the neglect and budget-racer path: zip ties, duct tape, a mismatched door. Good care for a while lets it climb back into a normal path.

**V8 Monster** is secret: a hood bulge and side pipes. It unlocks from hidden conditions (draft: Track tier 3 or higher, under 2,000 lb, 10 different friends met, 50,000 miles).

### Tiers and part choices

Each tier adds one or two parts from the path's list. Some parts come with a small choice.

| Path | Parts in order (choices in brackets) |
| --- | --- |
| Track | roll bar, bucket seats, tow hook, wing [ducktail or GT wing], splitter, number roundel [pick the number], hardtop, slicks, livery [stripe colors] |
| Stance | 1-inch drop, deep-dish wheels [lip color], hardtop, camber, tsurikawa ring, canards, air ride (it lifts and drops on screen) |
| Safari | lift, all-terrain tires, skid plate, light bar [bar or pods], spare on the trunk, snorkel, roof rack with tent |
| Concours | factory wheels, top [tan soft top or color hardtop], chrome trunk rack, wood steering wheel, show plaque, trophies |
| Rally | mud flaps, light pods [2 or 4], roof scoop, rally plates |
| Drift | angle kit, mismatched panel [which panel], tire smoke |

When a list runs out, tiers keep adding trophies, cosmetic stars and rare paint unlocks, so growth never stops.

### Stickers and paint

- Stickers come from meetups and mini-games and stick to set places on the body in each view.
- The paint shop opens at the Daily stage. Repainting costs cash. Rare colors (Sunburst Yellow, British Racing Green, Laguna Blue, Merlot Mica and others) appear as rare barn-find reveals or as stamp-card rewards.

## 6. Mini-games (Drive)

Each round lasts 30 to 60 seconds, plays with one thumb, uses a little fuel, can get the car dirty, and pays out fun, cash and path points.

| Game | View | How it plays | Feeds |
| --- | --- | --- | --- |
| Autocross cones | Top-down | Steer through a cone course against the clock; each cone hit adds 2 seconds. | Track |
| Canyon run | Side | Brake and turn in at the right moment for each corner; some stages are gravel. | Track, Rally |
| Heel-toe rhythm | Close-up of the pedals and tach | Tap on the beat to rev-match each downshift. | Track, Drift |
| Car-meet photo shoot | 3/4, side or front | Pick a spot and angle, wait for the light, snap; judges score the shot. | Stance, Concours |

Quick cruises skip the game when you only have a few seconds: Coast road, Dirt road, Car meet, Cars and coffee.

## 7. Meetups

### Flow

1. Tap the license plate, then **Meet**. Your phone shows your car's meet code as a QR.
2. Your friend scans it in their app. Then they show theirs and you scan it.
3. Each phone plays the meetup: both cars parked nose to nose in side view, the pop-up wave, then 6 to 10 lines of chat about their owners, then the sticker swap.

### The meet card

The QR holds a small, compressed card (a few hundred bytes):

- format version and a random car id
- car name and owner nickname
- paint, path, blend and tier, key parts
- personality
- game stats: washes, drives, miles, track days, mud trips, friends met
- the sticker it offers

No location, no contact details, nothing personal beyond the nickname.

### Same chat on both phones

Both phones seed the dialogue generator with the two car ids and the date, so they produce the same conversation without talking to each other.

### Perks and limits

- Mood boost for both cars.
- Sticker trade.
- A friendship stamp. Ten stamps with the same friend unlock a rare part.
- Path points toward the friend's path (this is how blends spread between friends).
- Perks apply once per friend per day. The chat can be replayed anytime.

### When the camera can't be used

Fallbacks: share the meet code as text and paste it, or pick a screenshot of the QR from the photo library.

### Sample lines

- "My owner says I'm not slow. I carry momentum."
- "Alex checked under me for oil drips four times today. I'm fine. Mostly."
- "Miata is always the answer. What was the question?"
- "Jun waxes me twice a week. I've never seen rain."
- "Alex left my top down in a storm once. We don't talk about it."

Lines are templates filled with the cards' stats and nicknames, flavored by each car's personality.

## 8. Saving and sharing

### Saving

- Autosave to the phone's storage (IndexedDB) after every action, and ask the browser to keep the data.
- iPhone can clear a website's data after about a week without visits unless it is installed to the Home Screen, so onboarding walks the owner through "Add to Home Screen" early.
- **Backup code**: the compressed save as text and as a QR. Restore by scanning it or pasting it on the new phone. A backup file can also be saved through the share sheet.

### Sharing

| Format | What it is |
| --- | --- |
| Picture card | A pixel "build sheet" PNG: the car in 3/4 view, name, path and tier, odometer, stickers, and a QR to its read-only link. Sent through the phone's share sheet. |
| Animated GIF | A 2 to 3 second loop of the car's idle animation, made on the phone. |
| Read-only link | A link whose data lives in the URL itself, so it works on GitHub Pages with no server. Opens a viewer page showing the car, build and stats. |
| Hall of Fame | Every retired or lost car with its build, dates, odometer and friends met. Shareable as one image or one link. |

### Retiring

Retire the active car anytime from Garage, then Hall of Fame. It is saved there with a snapshot of its build, and a new barn find appears. The new car inherits one heirloom (a sticker or a keychain charm).

## 9. Tech plan

| Piece | Choice |
| --- | --- |
| Language and build | TypeScript + Vite, no UI framework. The game is a canvas; the few menus are plain DOM. |
| PWA | `vite-plugin-pwa` (Workbox) for offline caching and the manifest; Apple meta tags and touch icons; a guide for Add to Home Screen on iPhone. |
| Rendering | Canvas 2D, palette-indexed sprites stored as text grids (as in the mock), integer scaling. |
| Simulation | Plain TypeScript with no DOM access: needs, decay, catch-up, sleep, weather, discipline, growth, seeded random numbers. Unit-tested. |
| Storage | IndexedDB through `idb-keyval`; the save format is versioned with migrations. |
| QR | Generate with `qrcode-generator`. Scan with the built-in BarcodeDetector where it exists (Android Chrome) and with `jsQR` on camera frames elsewhere (iPhone Safari has no BarcodeDetector). |
| Compression | `CompressionStream` with `fflate` as fallback, then base64url. |
| GIF | `gifenc`. |
| Sound | Web Audio square-wave and noise channels, off by default. |
| Haptics | Vibration on Android; iPhone browsers don't allow it. |
| Tests | Vitest for the simulation, growth rules, save and card codecs, and dialogue; a Playwright smoke test for the app. |
| Deploy | GitHub Actions: test, build, publish to GitHub Pages. |

Planned layout:

```
src/
  engine/     palette, pixel buffer, renderer, pixel font
  art/        sprites by view (three-quarter, side, front, top), parts, icons
  sim/        state, needs, decay, catch-up, sleep, weather, discipline, weight, growth, paths
  screens/    home, gauges, garage, mods, fuel, fix, wash, settings, hall of fame
  minigames/  autocross, canyon, heel-toe, photo shoot
  meet/       card codec, QR show and scan, dialogue, perks
  share/      picture card, GIF, read-only link, backup
  strings/    en.ts: every line of text and dialogue template
public/       app icons and manifest assets
mock/         the v0 mock-up, kept for reference
```

## 10. Milestones

1. **Art direction.** Redraw the car in the cute 3/4 view from your reference; full sprite sheet in Color and Mono for your approval.
2. **App skeleton.** Installable PWA, device shell, screen renderer, icons and A/B/C, settings with the color toggle, save and restore.
3. **Care loop.** Needs, decay and catch-up, sleep, weather, discipline, weight, check-engine light, breakdown and permadeath.
4. **Growth.** Stages, path points, the fork, tiers, blends, Rust Bucket, the V8 secret, the top-down mods screen with part choices, paint shop, stickers.
5. **Mini-games.** Autocross, Canyon run, Heel-toe, Photo shoot.
6. **Saving and sharing.** Backup code and QR, picture card, GIF, read-only link, Hall of Fame and retiring.
7. **Meetups.** Meet card QR, scanner with fallbacks, shared dialogue, perks and stamps.
8. **Polish and launch.** Sound, onboarding, balancing, deploy to GitHub Pages.

## 11. Still open

- **Your reference picture** for the cute 3/4 style, including which way the car faces.
- Default bedtime, and whether weekends get a later one.
- Blends beyond Rally and Drift: add more now or later?
- Cash: one currency for everything (parts choices, repaints, rescues), or separate tokens for parts?
