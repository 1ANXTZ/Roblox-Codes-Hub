/**
 * codes.js
 * Business rules for codes: status computed by date, counts,
 * and the core product policy: "don't leave expired codes
 * visible by default".
 */

import { Utils } from './utils.js';

export const Codes = {
  /**
   * Attaches the computed status (active | expiring | expired) to each code.
   */
  withStatus(codes) {
    return codes
      .map(c => ({ ...c, status: Utils.getCodeStatus(c.expires) }))
      .sort((a, b) => {
        // Sort: active first, then expiring, expired last.
        const order = { active: 0, expiring: 1, expired: 2 };
        return order[a.status] - order[b.status];
      });
  },

  countByStatus(codes, status) {
    return codes.filter(c => Utils.getCodeStatus(c.expires) === status).length;
  },

  /**
   * By default, the product policy is to hide expired codes.
   * This function returns the visible codes and, separately, the hidden
   * ones, so the UI can offer an optional "show expired" toggle.
   */
  splitVisible(codesWithStatus) {
    return {
      visible: codesWithStatus.filter(c => c.status !== 'expired'),
      expired: codesWithStatus.filter(c => c.status === 'expired'),
    };
  },

  mostRecentVerification(codes) {
    if (!codes.length) return null;
    return codes.reduce((latest, c) => {
      if (!c.verified) return latest;
      return !latest || c.verified > latest ? c.verified : latest;
    }, null);
  },
};
