import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import { isV2Preview } from "./src/lib/v2/preview";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    // The preview flag as a value that is always set. An unset variable is
    // read at run time, so the bundler keeps code behind it. This one is
    // inlined, which lets every other build drop the code it guards. It comes
    // from isV2Preview(), so the two can't disagree.
    NEXT_PUBLIC_V2_PREVIEW: isV2Preview() ? "1" : "0",
  },
};

export default withMDX(nextConfig);
