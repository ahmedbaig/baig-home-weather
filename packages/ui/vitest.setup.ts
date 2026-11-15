import '@testing-library/jest-dom/vitest';

if (!Element.prototype.animate) {
  Element.prototype.animate = function animate() {
    const animation = {
      onfinish: null as (() => void) | null,
      cancel() {},
      finish() {
        animation.onfinish?.();
      },
      currentTime: 0,
      playState: 'finished'
    };
    queueMicrotask(() => animation.finish());
    return animation as unknown as Animation;
  };
}

if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}
