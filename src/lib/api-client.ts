export function createCancellableFetch() {
  let controller: AbortController | null = null;

  const run = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (controller) controller.abort();
    controller = new AbortController();
    const signal = controller.signal;
    return fetch(input, { ...init, signal });
  };

  const cancel = () => {
    if (controller) controller.abort();
  };

  return { run, cancel };
}
