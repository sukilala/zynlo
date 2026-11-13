/** One shared promise for concurrent callers. The slot clears when it settles. */
export function singleFlight<T>(
  slot: { current: Promise<T> | null },
  run: () => Promise<T>,
): Promise<T> {
  if (!slot.current) {
    const pending = run().finally(() => {
      if (slot.current === pending) slot.current = null;
    });
    slot.current = pending;
  }
  return slot.current;
}
