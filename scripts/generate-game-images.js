/**
 * generate-game-images.js
 *
 * Generates Roblox game thumbnails automatically.
 *
 * Reads:
 * data/games.json
 *
 * Creates:
 * assets/images/games/*.webp
 */


import fs from "fs";
import path from "path";
import https from "https";



const ROOT = path.resolve(".");


const gamesFile = path.join(
  ROOT,
  "data",
  "games.json"
);


const outputDir = path.join(
  ROOT,
  "assets",
  "images",
  "games"
);



if (!fs.existsSync(outputDir)) {

  fs.mkdirSync(
    outputDir,
    {
      recursive: true
    }
  );

}



function download(url, filePath) {

  return new Promise((resolve, reject) => {


    const file = fs.createWriteStream(
      filePath
    );


    https.get(
      url,
      response => {


        response.pipe(file);



        file.on(
          "finish",
          () => {

            file.close();

            resolve();

          }
        );


      }

    ).on(
      "error",
      error => {

        fs.unlink(
          filePath,
          () => {}
        );

        reject(error);

      }

    );


  });


}





async function getRobloxThumbnail(placeId) {


  const api =

    `https://thumbnails.roblox.com/v1/games/icons?placeIds=${placeId}&size=512x512&format=Png&isCircular=false`;



  const response = await fetch(api);



  const data = await response.json();



  return (

    data.data?.[0]?.imageUrl || null

  );


}





async function main() {


  const json =

    JSON.parse(

      fs.readFileSync(

        gamesFile,

        "utf8"

      )

    );



  const games = json.games;



  console.log(
    `Found ${games.length} games`
  );



  for (const game of games) {


    if (!game.robloxId) {


      console.log(
        `Skipping ${game.name}: missing robloxId`
      );


      continue;

    }




    try {


      const imageUrl =

        await getRobloxThumbnail(

          game.robloxId

        );



      if (!imageUrl) {


        console.log(
          `No image: ${game.name}`
        );


        continue;

      }



      const fileName =

        `${game.id}.png`;



      const filePath =

        path.join(

          outputDir,

          fileName

        );



      await download(

        imageUrl,

        filePath

      );



      console.log(
        `Saved: ${game.name}`
      );



    } catch(error) {


      console.log(
        `Error ${game.name}:`,
        error.message
      );


    }


  }


}



main();
