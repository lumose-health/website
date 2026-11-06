import type { QuietPillStatus } from "@/components/v2/quiet-pill";

export type DeviceStatus = Exclude<QuietPillStatus, "in-development">;

export type DeviceRow = {
  name: string;
  status: DeviceStatus;
};

export type DeviceCard = {
  kicker: string;
  title: string;
  description: string;
  rows: DeviceRow[];
};

/** Tracks the row marked `not-working`. */
export const NOT_WORKING_ISSUE_URL =
  "https://github.com/lumose-health/lumose/issues/811";

// To change what a row says, edit its `status`. Labels and marks come from
// QuietPill. Change the product README and docs first.
export const deviceCards: DeviceCard[] = [
  {
    kicker: "Bluetooth · Android app",
    title: "Direct connect",
    description:
      "Pair your pump with the phone app. Readings stream straight to your server, no vendor cloud in between.",
    rows: [
      { name: "Tandem t:slim X2", status: "supported" },
      { name: "Tandem Mobi", status: "untested" },
      { name: "Medtronic 780G", status: "beta" },
      { name: "Medtronic 680G / 770G", status: "untested" },
    ],
  },
  {
    kicker: "Cloud sync",
    title: "Vendor clouds",
    description:
      "Already uploading? Lumose pulls from the cloud you use today, on a schedule.",
    rows: [
      { name: "Dexcom G7", status: "supported" },
      { name: "Dexcom G6", status: "beta" },
      { name: "Dexcom ONE+", status: "untested" },
      { name: "Tandem cloud", status: "supported" },
      { name: "Medtronic CareLink (US)", status: "beta" },
      { name: "Medtronic CareLink (EU)", status: "not-working" },
      { name: "Glooko: smart pens", status: "supported" },
      { name: "Glooko: Omnipod 5", status: "untested" },
    ],
  },
  {
    kicker: "Bridge",
    title: "Nightscout",
    description:
      "Running Loop, AAPS, Trio or xDrip+? Point Lumose at your Nightscout site.",
    rows: [
      { name: "Nightscout", status: "supported" },
      { name: "Libre / Eversense via Nightscout", status: "supported" },
      { name: "Loop, AAPS, Trio uploads", status: "supported" },
    ],
  },
];
