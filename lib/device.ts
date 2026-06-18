import { getSetting, setSetting } from '../db';
import { uid } from './id';

/**
 * Anonymous device identity. Generated on first launch and persisted locally.
 * Will be sent as a header for future backend sync; no signup/login needed.
 */
export function getDeviceId(): string {
  let id = getSetting('device_id');
  if (!id) {
    id = `dev_${uid()}${uid()}`;
    setSetting('device_id', id);
  }
  return id;
}
