const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

async function connectDatabase() {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("running on port : 3000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}
connectDatabase();

// API-1
app.get("/players/", async (request, response) => {
  try {
    const getPlayers = `
        SELECT
            player_id as playerId,
            player_name as playerName
        FROM
            player_details;`;
    const playerArray = await db.all(getPlayers);
    response.send(playerArray);
  } catch (e) {
    console.log(`DB error : ${e.message}`);
  }
});

// API-2
app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayer = `
    SELECT
        player_id as playerId,
        player_name as playerName
    FROM 
        player_details
    WHERE
        player_id = ${playerId};`;
    const player = await db.get(getPlayer);
    response.send(player);
  } catch (e) {
    console.log(`DB error : ${e.message}`);
  }
});

// Api-3
app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName } = playerDetails;
    const updatePlayer = `
    UPDATE
        player_details
    SET
        player_name = '${playerName}'
    WHERE
        player_id = ${playerId};`;
    await db.run(updatePlayer);
    response.send("Player Details Updated");
  } catch (e) {
    console.log(`DB error : ${e.message}`);
  }
});

// API-4
app.get("/matches/:matchId/", async (request, response) => {
  try {
    const { matchId } = request.params;
    const getMatch = ` 
        SELECT 
            match_id as matchId,
            match,
            year
        FROM
            match_details
        WHERE
            match_id = ${matchId};`;
    const match = await db.get(getMatch);
    response.send(match);
  } catch (e) {
    console.log(`DB error ${e.message}`);
  }
});

// API-5
app.get("/players/:playerId/matches/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayer = `
        SELECT
           match_id as matchId,
           match,
           year
        FROM
            player_match_score NATURAL JOIN
            match_details 
        WHERE
            player_id = ${playerId};`;
    const matches = await db.all(getPlayer);
    response.send(matches);
  } catch (e) {
    console.log(`error : ${e}`);
  }
});

// API-6
app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayersQuery = `
	    SELECT
	      player_details.player_id AS playerId,
	      player_details.player_name AS playerName
	    FROM player_match_score NATURAL JOIN player_details
        WHERE match_id=${matchId};`;
  const player = await db.all(getMatchPlayersQuery);
  response.send(player);
});

// API-7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScored = `
    SELECT

    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes

    FROM 

    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    
    WHERE 
    player_details.player_id = ${playerId};`;

  const playerScores = await db.all(getPlayerScored);
  response.send(playerScores);
});
module.exports = app;
