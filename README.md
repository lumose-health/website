# Lumose Website

Public website for the Lumose platform at [lumose.org](https://lumose.org).

## Tech Stack

- Next.js 16 with static export
- React 19, TypeScript
- Tailwind CSS v4, shadcn/ui
- Framer Motion, Recharts
- Deployed to Cloudflare Pages

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static output is generated in `./out/` and deployed to Cloudflare Pages.

## Third-party marks

Product names and logos shown on the site belong to their owners. The local runtime marks in `public/ai-providers/` come from each project's own brand files:

- `lmstudio.svg`: LM Studio icon (outline, white), unchanged, from the [LM Studio brand page](https://lmstudio.ai/brand), used under the terms on that page.
- `llamacpp.svg`: llama.cpp icon (dark), unchanged, from [ggml-org/llama-brand](https://github.com/ggml-org/llama-brand), CC BY-NC 4.0 with the extra permission in its `BRAND-USAGE.md`.
- `vllm.svg`: vLLM logo, unchanged, from the [vLLM project site](https://vllm.ai/), the homepage of [vllm-project/vllm](https://github.com/vllm-project/vllm).

## License

GPL-3.0 - see [LICENSE](LICENSE)
