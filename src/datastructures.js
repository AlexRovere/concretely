/**
 * Small, pure data-structure models for the visualizer. The hash map is the
 * star: it shows hashing, collisions (chaining) and resizing on load factor.
 */

/** Deterministic 32-bit string hash (same idea as Java's String.hashCode). */
export function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return h;
}

/** Non-negative bucket index for a key. */
export function bucketIndex(key, nBuckets) {
  return ((hashCode(String(key)) % nBuckets) + nBuckets) % nBuckets;
}

export class HashMap {
  constructor(nBuckets = 8, maxLoad = 0.75) {
    this.nBuckets = nBuckets;
    this.maxLoad = maxLoad;
    this.size = 0;
    this.buckets = Array.from({ length: nBuckets }, () => []);
  }

  index(key) { return bucketIndex(key, this.nBuckets); }
  loadFactor() { return this.size / this.nBuckets; }

  /** Returns { index, collision, resized } describing what happened. */
  set(key, value = true) {
    const i = this.index(key);
    const chain = this.buckets[i];
    const existing = chain.find((e) => e.key === key);
    if (existing) { existing.value = value; return { index: i, collision: false, resized: false }; }
    const collision = chain.length > 0;
    chain.push({ key, value });
    this.size++;
    let resized = false;
    if (this.loadFactor() > this.maxLoad) { this.resize(this.nBuckets * 2); resized = true; }
    return { index: this.index(key), collision, resized };
  }

  get(key) {
    const e = this.buckets[this.index(key)].find((x) => x.key === key);
    return e ? e.value : undefined;
  }

  resize(n) {
    const entries = this.buckets.flat();
    this.nBuckets = n;
    this.buckets = Array.from({ length: n }, () => []);
    this.size = 0;
    for (const e of entries) { this.buckets[this.index(e.key)].push(e); this.size++; }
  }
}

export class Stack {
  constructor() { this.items = []; }
  push(x) { this.items.push(x); }
  pop() { return this.items.pop(); }
  get top() { return this.items.at(-1); }
  get size() { return this.items.length; }
}

export class Queue {
  constructor() { this.items = []; }
  enqueue(x) { this.items.push(x); }
  dequeue() { return this.items.shift(); }
  get front() { return this.items[0]; }
  get size() { return this.items.length; }
}

export const STRUCTURES = ['stack', 'queue', 'hashmap'];
