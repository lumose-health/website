export type Connection =
  | "Cloud"
  | "Bluetooth + cloud"
  | "Bridge"
  | "Via Nightscout";

export type Integration = {
  name: string;
  /** Shown when `flags.logosCleared` is off. */
  initial: string;
  logo: string;
  connection: Connection;
};

// Omnipod isn't listed because it reaches Lumose through Glooko.
export const integrations: Integration[] = [
  {
    name: "Dexcom",
    initial: "D",
    logo: "/vendors/dexcom.png",
    connection: "Cloud",
  },
  {
    name: "Tandem",
    initial: "T",
    logo: "/vendors/tandem.png",
    connection: "Bluetooth + cloud",
  },
  {
    name: "Medtronic",
    initial: "M",
    logo: "/vendors/medtronic.jpg",
    connection: "Bluetooth + cloud",
  },
  {
    name: "Glooko",
    initial: "G",
    logo: "/vendors/glooko.png",
    connection: "Cloud",
  },
  {
    name: "Nightscout",
    initial: "N",
    logo: "/vendors/nightscout.png",
    connection: "Bridge",
  },
  {
    name: "FreeStyle Libre",
    initial: "F",
    logo: "/vendors/libre.png",
    connection: "Via Nightscout",
  },
  {
    name: "Eversense",
    initial: "E",
    logo: "/vendors/eversense.png",
    connection: "Via Nightscout",
  },
  {
    name: "Loop",
    initial: "L",
    logo: "/vendors/loop.png",
    connection: "Via Nightscout",
  },
  {
    name: "Trio",
    initial: "T",
    logo: "/vendors/trio.jpg",
    connection: "Via Nightscout",
  },
  {
    name: "AndroidAPS",
    initial: "A",
    logo: "/vendors/aaps.png",
    connection: "Via Nightscout",
  },
  {
    name: "xDrip+",
    initial: "X",
    logo: "/vendors/xdrip.jpg",
    connection: "Via Nightscout",
  },
];
