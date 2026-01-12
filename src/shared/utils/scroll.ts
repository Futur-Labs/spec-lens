export function smoothScrollTo(elementOrId: string | HTMLElement, offset = 0) {
  const element =
    typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!element) return;

  // Find the scrollable container
  let container: HTMLElement | Window = window;
  let curr = element.parentElement;
  while (curr) {
    const style = window.getComputedStyle(curr);
    if (
      style.overflowY === 'auto' ||
      style.overflowY === 'scroll' ||
      document.body === curr ||
      document.documentElement === curr
    ) {
      container = curr;
      break;
    }
    curr = curr.parentElement;
  }

  const start = container === window ? window.scrollY : (container as HTMLElement).scrollTop;
  const elementTop = element.getBoundingClientRect().top;
  const containerTop =
    container === window ? 0 : (container as HTMLElement).getBoundingClientRect().top;

  // Calculate relative position based on current scrollTop
  // targetScrollTop = currentScrollTop + (elementTop - containerTop)
  const target = start + elementTop - containerTop - offset;

  const distance = target - start;
  const duration = 500; // ms
  let startTime: number | null = null;
  let animationFrameId: number;

  const onUserScroll = () => {
    cancelAnimationFrame(animationFrameId);
    cleanup();
  };

  const cleanup = () => {
    window.removeEventListener('wheel', onUserScroll);
    window.removeEventListener('touchstart', onUserScroll);
    window.removeEventListener('keydown', onUserScroll);
  };

  // Add listeners to cancel on user interaction
  window.addEventListener('wheel', onUserScroll, { passive: true });
  window.addEventListener('touchstart', onUserScroll, { passive: true });
  window.addEventListener('keydown', onUserScroll, { passive: true }); // e.g. arrow keys

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);

    const currentPos = start + distance * ease;

    if (container === window) {
      window.scrollTo(0, currentPos);
    } else {
      (container as HTMLElement).scrollTop = currentPos;
    }

    if (timeElapsed < duration) {
      animationFrameId = requestAnimationFrame(animation);
    } else {
      cleanup();
    }
  };

  animationFrameId = requestAnimationFrame(animation);
}
