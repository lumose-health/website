"use client";

import type { BeamCurve } from "./beam-tiles";
import {
  BEAM_DEVICES,
  BEAM_PROVIDERS,
  BeamCore,
  BeamLabel,
  BeamStage,
  BeamTile,
} from "./beam-tiles";

const CORE = { x: 171, y: 226 };
// 66px apart leaves the row 316 wide, so even a 320px screen clips no tile.
const DEVICE_X = [39, 105, 171, 237, 303];
const DEVICE_Y = 50;
const PROVIDER_X = [72, 138, 204, 270];
const PROVIDER_Y = 416;

const DEVICE_EDGE = DEVICE_Y + 26;
const CORE_TOP = CORE.y - 54;
// Below the core's caption, so no path runs through it.
const OUT_START = 306;
const PROVIDER_EDGE = PROVIDER_Y - 26;

const INBOUND: BeamCurve[] = DEVICE_X.map((x) => [
  [x, DEVICE_EDGE],
  [x, DEVICE_EDGE + 56],
  [CORE.x, CORE_TOP - 38],
  [CORE.x, CORE_TOP],
]);

const OUTBOUND: BeamCurve[] = PROVIDER_X.map((x) => [
  [CORE.x, OUT_START],
  [CORE.x, OUT_START + 34],
  [x, PROVIDER_EDGE - 48],
  [x, PROVIDER_EDGE],
]);

// Scaling the wide layout down would take tiles to 24px, so this is its own.
export function BeamMobile() {
  return (
    <BeamStage
      width={342}
      height={460}
      axis="y"
      inbound={INBOUND}
      outbound={OUTBOUND}
      className="relative h-[460px] w-[342px] shrink-0 tablet:hidden"
    >
      {BEAM_DEVICES.map((mark, index) => (
        <BeamTile
          key={mark.name}
          mark={mark}
          shape="tile"
          x={DEVICE_X[index]}
          y={DEVICE_Y}
        />
      ))}
      <BeamCore {...CORE} />
      {BEAM_PROVIDERS.map((mark, index) => (
        <BeamTile
          key={mark.name}
          mark={mark}
          shape="node"
          x={PROVIDER_X[index]}
          y={PROVIDER_Y}
        />
      ))}
      <BeamLabel className="top-0 left-1/2 -translate-x-1/2">
        YOUR DEVICES
      </BeamLabel>
      <BeamLabel className="top-[288px] left-1/2 -translate-x-1/2">
        YOUR SERVER
      </BeamLabel>
      <BeamLabel className="bottom-0 left-1/2 -translate-x-1/2">
        YOUR AI
      </BeamLabel>
    </BeamStage>
  );
}
