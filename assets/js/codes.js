/**
 * codes.js
 * Business rules for codes: status computed by date, counts,
 * and the core product policy: "don't leave expired codes
 * visible by default".
 */

import { Utils } from './utils.js';

export const Codes = {


  /**
   * Attaches the computed status (active | expiring | expired)
   * to each code.
   */
  withStatus(codes) {

    return codes
      .map(code => ({
        ...code,
        status: Utils.getCodeStatus(code.expires),
      }))
      .sort((a, b) => {

        const order = {
          active: 0,
          expiring: 1,
          expired: 2,
        };

        return order[a.status] - order[b.status];

      });

  },


  /**
   * Counts codes by status.
   */
  countByStatus(codes, status) {

    return codes.filter(code =>
      Utils.getCodeStatus(code.expires) === status
    ).length;

  },


  /**
   * Separates visible codes from expired codes.
   */
  splitVisible(codesWithStatus) {

    return {
      visible: codesWithStatus.filter(
        code => code.status !== 'expired'
      ),

      expired: codesWithStatus.filter(
        code => code.status === 'expired'
      ),
    };

  },


  /**
   * Gets the latest verification date.
   */
  mostRecentVerification(codes) {

    if (!codes.length) return null;


    return codes.reduce((latest, code) => {

      if (!code.verified) return latest;


      if (!latest || code.verified > latest) {
        return code.verified;
      }


      return latest;

    }, null);

  },

};
