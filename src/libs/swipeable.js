import Hammer from 'hammerjs';

export const bindSwipeEvent = (element, callback) => {
  const hammer = new Hammer(element);
  hammer.on('swipe', callback);

  return {
    self: hammer,
    unbind() {
      hammer.off('swipe', callback);
    },
    enable() {
      hammer.get('swipe').set({ enable: true });
    },
    disable() {
      hammer.get('swipe').set({ enable: false });
    }
  };
};
