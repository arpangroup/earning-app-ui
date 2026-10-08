import { createPortal } from 'react-dom';

/** Renders children into the phone frame so overlays escape transformed/scrolling screens. */
export default function Portal({ children }) {
  const host = document.querySelector('.app-shell');
  return host ? createPortal(children, host) : children;
}
