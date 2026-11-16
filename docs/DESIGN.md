# Design specification

Current release: see [3D dashboard](3D_DASHBOARD.md) and [3D verification](QA_3D.md). The official brand is **ZhipTech - Smart Home**, using the supplied unaltered logo. Full Web now uses interactive Three.js geometry; SVG remains the Lite/WebGL fallback. The text below records the original concept implementation and is historical where it differs from this update.

Primary concept: `outputs/design/dashboard-concept.png`, generated with built-in ImageGen. User supplied dark house dashboard reference plus the Thai master prompt govern the implementation.

## Tokens and components

Final typography refinement: bundled variable Noto Sans Thai (`web/public/fonts/NotoSansThai.ttf`) and its SIL Open Font License from Google Fonts. The app makes no CDN request. System fonts are fallbacks only. Font asset source: https://github.com/google/fonts/tree/main/ofl/notosansthai.

Neutral charcoal background #151716; surface #1d201e; border #303631; primary text #eef3ef; muted #929d95; mint accent #78e4ab; amber warning #e9ba74; red alert #f08d8d. Light mode uses #f4f6f3 background and white panels. 8/12/16/24/32 px spacing; 16 px panel radius; 9 px controls. Thin 1.7 px consistent SVG outline icons. Thai system font stack Tahoma/Leelawadee UI/Noto Sans Thai/system sans; no network font dependency. Desktop sidebar 224 px, main gutter 28 px, two column house/inspector region; compact environmental measurements and scenes above, chart/timeline below. Mobile drawer navigation and one-column content, >=44 px touch targets. Respect reduced motion.

Reusable families: shell/sidebar/topbar; panel/header; metric; device row + mode selector + switch; scene selector; map and zone tabs; chart; activity row; form field; empty/error state; toast/dialog. Pages split from shell and state providers.

## Visible content and intentional deviations

Brand Smart Home Hub. Navigation: ภาพรวม, แผนผังบ้าน, อุปกรณ์, ระบบอัตโนมัติ, โหมดบ้าน, ความปลอดภัย, สถิติ, บันทึกกิจกรรม, ตั้งค่า. Heading บ้านที่พร้อมสำหรับคุณ. Actions ทดลองสถานการณ์, Home, Away, Night, Work. Map six actual zones: ห้องนั่งเล่น, ห้องนอน, โรงรถ, สวน, ทางเข้า, ศูนย์ควบคุม. Right inspector contains actual lighting/climate/RGB controls. Environmental measurements show real provider state, never frozen concept values. Events and chart start with actually collected simulation data.

Written requirements override invented concept content: no door/window/smoke sensors; security uses PIR, buzzer and doorbell only. No fabricated historical hours. A lightweight, fully interactive architectural SVG replaces the concept's rendered raster miniature (explicit SVG requirement and ESP32 storage constraints). Header shows actual date. Simulation label remains prominent. Device RGB belongs to bedroom, independently selectable from living room. No camera/music/workspace booking controls, as those are outside the supplied inventory. Image is a design reference only and is not shipped as UI or LittleFS asset.

Responsive clarification: mobile keeps the six labeled room tabs and uses the map as a clean spatial overview; tiny in-map labels are hidden to avoid unreadable type. Room selection still works through tabs, clickable SVG zones and keyboard focus.

## Interaction inventory

Every route, scene button, device switch, auto/manual selector, RGB swatch/color/brightness, simulation input, alarm control, rule editor, scene editor, filter, CSV export and settings action changes provider state or validates input. Live operations await firmware acknowledgment. Offline retains last known stale data and disables commands. Unsupported firmware capabilities are clearly disabled. Reset requires confirmation. Focus outlines, semantic labels, keyboard map buttons, loading and toast feedback are required.
