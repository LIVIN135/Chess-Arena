// Setup environment mocks for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const storage = {};
  globalThis.localStorage = {
    getItem: (key) => (key in storage ? storage[key] : null),
    setItem: (key, val) => {
      storage[key] = String(val);
    },
    removeItem: (key) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((k) => delete storage[k]);
    },
  };
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = {
    localStorage: globalThis.localStorage,
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}
