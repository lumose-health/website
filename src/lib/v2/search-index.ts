type Status = "idle" | "loading" | "ready" | "failed";

/**
 * Decides which URL a search loads the docs index from, and when a failed
 * download may be tried again.
 *
 * Fumadocs keeps the download per URL, including one that failed, so the only
 * way to try again is a new URL. Left alone, that means either search stays
 * broken until a reload, or every keystroke starts another multi-megabyte
 * download. This allows one download at a time and a fixed number of retries,
 * after which it stops until reset() is called.
 */
export function createIndexLoader(base: string, maxRetries = 3) {
  let status: Status = "idle";
  // Numbers the URL. Only ever goes up, because an old URL keeps its failure.
  let serial = 0;
  // Retries spent since the first load or the last reset.
  let retries = 0;

  const url = () => (serial === 0 ? base : `${base}?retry=${serial}`);

  return {
    /** True when the download failed and no retries are left. */
    get exhausted() {
      return status === "failed" && retries >= maxRetries;
    },

    /** Gives the retries back, so the next search downloads again. */
    reset() {
      retries = 0;
    },

    /**
     * Runs one search against the index. Searches that start while a download
     * is pending share its URL, so they share the download. A search that
     * starts after a failed download moves to a new URL. Once the index has
     * loaded, later errors are search errors and never cause a download.
     */
    async run<T>(search: (from: string) => Promise<T>): Promise<T> {
      if (status === "failed") {
        if (retries >= maxRetries) {
          throw new Error("The search index could not be downloaded.");
        }
        retries += 1;
        serial += 1;
        status = "loading";
      } else if (status === "idle") {
        status = "loading";
      }

      const from = url();
      try {
        const result = await search(from);
        if (from === url()) status = "ready";
        return result;
      } catch (error) {
        // A late failure from an older URL must not undo a newer attempt.
        if (status === "loading" && from === url()) status = "failed";
        throw error;
      }
    },
  };
}
