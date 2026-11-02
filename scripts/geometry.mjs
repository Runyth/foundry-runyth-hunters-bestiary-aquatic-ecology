export const DEFAULT_DASHBOARD_SIZE = Object.freeze({ width: 1080, height: 760 });
export const MIN_DASHBOARD_SIZE = Object.freeze({ width: 720, height: 520 });
const VIEWPORT_MARGIN = 40;

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function viewportSize(viewport = {}) {
  return {
    width: Math.max(320, finiteNumber(viewport.width) ?? finiteNumber(globalThis.window?.innerWidth) ?? 1920),
    height: Math.max(240, finiteNumber(viewport.height) ?? finiteNumber(globalThis.window?.innerHeight) ?? 1080)
  };
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function clampDashboardGeometry(value = {}, viewport = {}) {
  const screen = viewportSize(viewport);
  const maximumWidth = Math.max(320, screen.width - VIEWPORT_MARGIN);
  const maximumHeight = Math.max(240, screen.height - VIEWPORT_MARGIN);
  const minimumWidth = Math.min(MIN_DASHBOARD_SIZE.width, maximumWidth);
  const minimumHeight = Math.min(MIN_DASHBOARD_SIZE.height, maximumHeight);
  const width = clamp(finiteNumber(value.width) ?? DEFAULT_DASHBOARD_SIZE.width, minimumWidth, maximumWidth);
  const height = clamp(finiteNumber(value.height) ?? DEFAULT_DASHBOARD_SIZE.height, minimumHeight, maximumHeight);
  const maximumLeft = Math.max(0, screen.width - width);
  const maximumTop = Math.max(0, screen.height - height);
  const geometry = { width, height };
  const left = finiteNumber(value.left);
  const top = finiteNumber(value.top);
  if (left !== undefined) geometry.left = clamp(left, 0, maximumLeft);
  if (top !== undefined) geometry.top = clamp(top, 0, maximumTop);
  return geometry;
}

export function serializeDashboardGeometry(value = {}, viewport = {}) {
  return clampDashboardGeometry(value, viewport);
}

export function resetDashboardSizeGeometry(value = {}, viewport = {}) {
  return clampDashboardGeometry({
    ...value,
    width: DEFAULT_DASHBOARD_SIZE.width,
    height: DEFAULT_DASHBOARD_SIZE.height
  }, viewport);
}

export function resetDashboardPositionGeometry(value = {}, viewport = {}) {
  const geometry = clampDashboardGeometry(value, viewport);
  const screen = viewportSize(viewport);
  return {
    ...geometry,
    left: Math.max(0, Math.round((screen.width - geometry.width) / 2)),
    top: Math.max(0, Math.round((screen.height - geometry.height) / 2))
  };
}

export function resetDashboardGeometry(viewport = {}) {
  return resetDashboardPositionGeometry(DEFAULT_DASHBOARD_SIZE, viewport);
}
