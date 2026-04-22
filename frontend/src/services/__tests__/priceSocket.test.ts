import { describe, test, expect, beforeEach } from 'vitest';
import { usePriceSocket } from '../priceSocket';

describe('usePriceSocket zustand store', () => {
  beforeEach(() => {
    // Reset the store to initial state between tests
    usePriceSocket.setState({ prices: {}, connected: false });
  });

  test('initial state has connected: false', () => {
    const state = usePriceSocket.getState();
    expect(state.connected).toBe(false);
  });

  test('initial state has empty prices object', () => {
    const state = usePriceSocket.getState();
    expect(state.prices).toEqual({});
  });

  test('subscribe method exists and is a function', () => {
    const state = usePriceSocket.getState();
    expect(typeof state.subscribe).toBe('function');
  });

  test('unsubscribe method exists and is a function', () => {
    const state = usePriceSocket.getState();
    expect(typeof state.unsubscribe).toBe('function');
  });

  test('connect method exists and is a function', () => {
    const state = usePriceSocket.getState();
    expect(typeof state.connect).toBe('function');
  });

  test('disconnect method exists and is a function', () => {
    const state = usePriceSocket.getState();
    expect(typeof state.disconnect).toBe('function');
  });

  test('getPrice returns undefined for unknown symbol', () => {
    const state = usePriceSocket.getState();
    expect(state.getPrice('AAPL')).toBeUndefined();
  });

  test('getPrice returns price data after setState', () => {
    const priceData = {
      symbol: 'AAPL',
      price: 150.5,
      open: 149,
      high: 151,
      low: 148,
      close: 150.5,
      volume: 1000000,
      timestamp: Date.now(),
    };

    usePriceSocket.setState({
      prices: { AAPL: priceData },
    });

    const state = usePriceSocket.getState();
    expect(state.getPrice('AAPL')).toEqual(priceData);
    // Case-insensitive lookup
    expect(state.getPrice('aapl')).toEqual(priceData);
  });

  test('disconnect sets connected to false', () => {
    usePriceSocket.setState({ connected: true });
    expect(usePriceSocket.getState().connected).toBe(true);

    usePriceSocket.getState().disconnect();
    expect(usePriceSocket.getState().connected).toBe(false);
  });
});
