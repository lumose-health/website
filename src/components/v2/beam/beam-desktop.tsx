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

const CORE = { x: 380, y: 180 };
const DEVICE_X = 70;
const DEVICE_Y = [40, 110, 180, 250, 320];
const PROVIDER_X = 690;
const PROVIDER_Y = [75, 145, 215, 285];

const INBOUND: BeamCurve[] = DEVICE_Y.map((y) => [
  [96, y],
  [230, y],
  [240, CORE.y],
  [326, CORE.y],
]);

const OUTBOUND: BeamCurve[] = PROVIDER_Y.map((y) => [
  [434, CORE.y],
  [520, CORE.y],
  [530, y],
  [664, y],
]);

export function BeamDesktop() {
  return (
    <BeamStage
      width={760}
      height={360}
      axis="x"
      inbound={INBOUND}
      outbound={OUTBOUND}
      className="relative hidden h-[390px] w-[760px] shrink-0 tablet:block"
    >
      {BEAM_DEVICES.map((mark, index) => (
        <BeamTile
          key={mark.name}
          mark={mark}
          shape="tile"
          x={DEVICE_X}
          y={DEVICE_Y[index]}
        />
      ))}
      {BEAM_PROVIDERS.map((mark, index) => (
        <BeamTile
          key={mark.name}
          mark={mark}
          shape="node"
          x={PROVIDER_X}
          y={PROVIDER_Y[index]}
        />
      ))}
      <BeamCore {...CORE} />
      <BeamLabel className="top-[366px] left-11">YOUR DEVICES</BeamLabel>
      <BeamLabel className="top-[246px] left-[340px]">YOUR SERVER</BeamLabel>
      <BeamLabel className="top-[366px] left-[660px]">YOUR AI</BeamLabel>
    </BeamStage>
  );
}
