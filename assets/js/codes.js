/**
 * codes.js
 * Business rules for codes: status computed by date, counts,
 * and visibility policy.
 */

import { Utils } from './utils.js';


export const Codes = {


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

      .filter(Boolean)

      .map(code => ({

        ...code,

        status:
          Utils.getCodeStatus(
            code?.expires
          ),

      }))


      .sort((a, b) =>

        (order[a.status] ?? 99) -
        (order[b.status] ?? 99)

      );


  },





  countByStatus(codes = [], status) {


    if (!Array.isArray(codes)) {

      return 0;

    }



    return codes.filter(code => {


      const currentStatus =

        code.status ??

        Utils.getCodeStatus(
          code?.expires
        );


      return currentStatus === status;


    }).length;


  },





  splitVisible(codesWithStatus = []) {


    if (!Array.isArray(codesWithStatus)) {

      return {

        visible: [],

        expired: [],

      };

    }



    const prepared =

      this.withStatus(
        codesWithStatus
      );



    return {


      visible:

        prepared.filter(
          code =>
            code.status !== 'expired'
        ),



      expired:

        prepared.filter(
          code =>
            code.status === 'expired'
        ),


    };


  },





  mostRecentVerification(codes = []) {


    if (!Array.isArray(codes) || !codes.length) {

      return null;

    }



    const dates =

      codes

        .map(code => code?.verified)

        .filter(Boolean)

        .filter(date =>

          !Number.isNaN(
            new Date(date).getTime()
          )

        );



    if (!dates.length) {

      return null;

    }



    return dates.sort(

      (a, b) =>

        new Date(b) -
        new Date(a)

    )[0];


  },


};
