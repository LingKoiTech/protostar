import '@testing-library/jest-dom/vitest';

class TestPointerEvent extends MouseEvent implements PointerEvent {
  pointerId = 1;
  width = 1;
  height = 1;
  pressure = 0;
  tangentialPressure = 0;
  tiltX = 0;
  tiltY = 0;
  twist = 0;
  pointerType = 'mouse';
  isPrimary = true;
  getCoalescedEvents(): PointerEvent[] { return []; }
  getPredictedEvents(): PointerEvent[] { return []; }
}

if (!window.PointerEvent) {
  Object.defineProperty(window, 'PointerEvent', { value: TestPointerEvent, configurable: true });
}
