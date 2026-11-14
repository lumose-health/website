/** How long one index download may take before it counts as failed. */
export const INDEX_TIMEOUT_MS = 20_000;

type Status = "idle" | "loading" | "ready" | "failed";

/**
 * Decides which URL a search loads the docs index from, and when a failed
 * download may be tried again.
 *
 * Fumadocs keeps the download per URL, including one that failed, so the only
 * way to try again is a new URL. Left alone, that means either search stays
 * broken until a reload, or every keystroke starts another multi-megabyte
 * download. This allows one download at a time and a fixed number of retries,
 * one per search that follows a failure, after which it stops until reset()
 * is called. A download that stalls counts as failed once the timeout passes,
 * so it cannot hold search up for good.
 */
export function createIndexLoader(
  base: string,
  maxRetries = 3,
  timeoutMs = INDEX_TIMEOUT_MS,
) {
  let status: Status = "idle";
  // Numbers the URL. Only ever goes up, because an old URL keeps its failure.
  let serial = 0;
  // Retries spent since the first load or the last reset.
  let retries = 0;
  // Set by a failed download and cleared once the index has loaded.
  let failed = false;

  // Rejects when the current download runs out of time. Every search that
  // waits on that download races against the same one.
  let deadline: Promise<never> | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const url = () => (serial === 0 ? base : `${base}?retry=${serial}`);

  function startLoading() {
    status = "loading";
    const from = url();
    clearTimeout(timer);
    deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        if (status === "loading" && from === url()) {
          status = "failed";
          failed = true;
        }
        reject(new Error("The search index took too long to download."));
      }, timeoutMs);
    });
    // Nothing may be waiting when it fires.
    deadline.catch(() => {});
  }

  return {
    /**
     * True from the first failed download until the index loads. It stays
     * true while a retry is on its way, so what it shows does not come and go
     * with every attempt.
     */
    get failed() {
      return failed;
    },

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
        startLoading();
      } else if (status === "idle") {
        startLoading();
      }

      const from = url();
      const waiting = status === "loading" && deadline !== null;
      try {
        // Once the deadline wins, this search is over: a stalled download
        // that finishes later reaches nobody and changes nothing here.
        const result = await (waiting
          ? Promise.race([search(from), deadline as Promise<never>])
          : search(from));
        if (from === url() && status === "loading") {
          status = "ready";
          failed = false;
          clearTimeout(timer);
        }
        return result;
      } catch (error) {
        // A late failure from an older URL must not undo a newer attempt.
        if (status === "loading" && from === url()) {
          status = "failed";
          failed = true;
          clearTimeout(timer);
        }
        throw error;
      }
    },
  };
}
