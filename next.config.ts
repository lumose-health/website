import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    // The preview flag as a value that is always set. An unset variable is
    // read at run time, so the bundler keeps code behind it. This one is
    // inlined, which lets every other build drop the code it guards.
    NEXT_PUBLIC_V2_PREVIEW:
      process.env.NEXT_PUBLIC_DOCS_V2 === "1" ||
      process.env.NEXT_PUBLIC_BUILD_ENV === "preview"
        ? "1"
        : "0",
  },
};

export default withMDX(nextConfig);
