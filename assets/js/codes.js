/**
 * codes.js
 * Business rules for codes: status computed by date, counts,
 * and visibility policy.
 */

import { Utils } from './utils.js';


export const Codes = {


  /**
   * Adds computed status to every code.
   */
  withStatus(codes = []) {


    if (!Array.isArray(codes)) {
      return [];
    }


    const order = {

      active: 0,

      expiring: 1,

      expired: 2,

    };



    return codes

      .map(code => ({

        ...code,

        status:
          Utils.getCodeStatus(
            code.expires
          ),

      }))


      .sort((a, b) =>

        (order[a.status] ?? 99) -
        (order[b.status] ?? 99)

      );


  },





  /**
   * Counts codes by status.
   */
  countByStatus(codes = [], status) {


    if (!Array.isArray(codes)) {
      return 0;
    }



    return codes.filter(code =>

      (
        code.status ??
        Utils.getCodeStatus(
          code.expires
        )

      ) === status

    ).length;


  },





  /**
   * Splits visible and expired codes.
   */
  splitVisible(codesWithStatus = []) {


    return {

      visible:

        codesWithStatus.filter(
          code =>
            code.status !== 'expired'
        ),



      expired:

        codesWithStatus.filter(
          code =>
            code.status === 'expired'
        ),

    };


  },





  /**
   * Gets latest verification date.
   */
  mostRecentVerification(codes = []) {


    if (!codes.length) {
      return null;
    }



    return codes.reduce(
      (latest, code) => {


        if (!code.verified) {
          return latest;
        }



        if (
          !latest ||
          new Date(code.verified) >
          new Date(latest)
        ) {

          return code.verified;

        }



        return latest;


      },

      null

    );


  },


};
