import { registerAsyncHelper } from '@ember/test';
import { triggerEvent } from '@ember/test-helpers';

/**
  Drags elements by an offset specified in pixels.

  Examples

      drag(
        'mouse',
        '.some-list li[data-item=uno]',
        function() {
          return { dy: 50, dx: 20 };
        }
      );

  @method drag
  @param {'mouse'|'touch'} [mode]
    event mode
  @param {String} [itemSelector]
    selector for the element to drag
  @param {Function} [offsetFn]
    function returning the offset by which to drag
  @param {Object} [callbacks]
    callbacks that are fired at the different stages of the interaction
  @return {Promise}
*/

export function drag(app, mode, itemSelector, offsetFn, callbacks = {}) {
  let start, move, end, which;

  const {
    andThen,
    findWithAssert,
    wait
  } = app.testHelpers;

  if (mode === 'mouse') {
    start = 'mousedown';
    move = 'mousemove';
    end = 'mouseup';
    which = 1;
  } else if (mode === 'touch') {
    start = 'touchstart';
    move = 'touchmove';
    end = 'touchend';
  } else {
    throw new Error(`Unsupported mode: '${mode}'`);
  }

  andThen(() => {
    let item = findWithAssert(itemSelector);
    let itemOffset = item.offset();
    let offset = offsetFn();
    let itemElement = item.get(0);
    let rect = itemElement.getBoundingClientRect();
    let scale = itemElement.clientHeight / (rect.bottom - rect.top);
    let halfwayX = itemOffset.left + (offset.dx * scale) / 2;
    let halfwayY = itemOffset.top + (offset.dy * scale) / 2;
    let targetX = itemOffset.left + offset.dx * scale;
    let targetY = itemOffset.top + offset.dy * scale;

    andThen(() => {
      triggerEvent(itemElement, start, {
        clientX: itemOffset.left,
        clientY: itemOffset.top,
        which
      });
    });

    if (callbacks.dragstart) {
      andThen(callbacks.dragstart);
    }

    andThen(() => {
      triggerEvent(itemElement, move, {
        clientX: itemOffset.left,
        clientY: itemOffset.top
      });
    });

    if (callbacks.dragmove) {
      andThen(callbacks.dragmove);
    }

    andThen(() => {
      triggerEvent(itemElement, move, {
        clientX: halfwayX,
        clientY: halfwayY
      });
    });

    andThen(() => {
      triggerEvent(itemElement, move, {
        clientX: targetX,
        clientY: targetY
      });
    });

    andThen(() => {
      triggerEvent(itemElement, end, {
        clientX: targetX,
        clientY: targetY
      });
    });

    if (callbacks.dragend) {
      andThen(callbacks.dragend);
    }
  });

  return wait();
}

export default registerAsyncHelper('drag', drag);
