var http = require("https");
const chalk = require('chalk');
const readline = require('readline');
const cTable = require('console.table');


const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout
});

rl.question(`Whose fixtures shall i look up? \n`, answer => {
    getDataFromApi(`/v2/teams/search/${answer}`, function(data) {
        data = JSON.parse(data.toString()).api.teams[0];
        const userTeam = data.team_id;
        const teamName = data.name;
        console.log(`
------------------------------------------
|           ${chalk.bgBlue('Upcoming Fixtures')}            |
------------------------------------------
            `);
        
        getDataFromApi(`/v2/fixtures/team/${userTeam}/next/10`, function(data) {
            displayFixtures(data, userTeam, teamName);
            if (userTeam !== 182) {
                return rl.close();
            } 
            getDataFromApi(`/v2/leagueTable/754`, function(data) {
                displayTable(data);
            });
        });

    });

});

function displayFixtures(data, userTeam, answer) {
    const nextFixtures = JSON.parse(data.toString()).api.fixtures;
    for (let i = 0; i < nextFixtures.length; i++) {
        const nextFixture = nextFixtures[i];
        const unFormattedDate = new Date(nextFixture.event_date);
        const options = { month: "long", day: "numeric", year: "numeric" };
        const date = new Intl.DateTimeFormat("en-US", options).format(unFormattedDate);
        console.log(chalk.blue(`${date}: \t`) + `${nextFixture.homeTeam.team_name} ${chalk.red.bold.bgWhite('v')} ${nextFixture.awayTeam.team_name}`);
    }
    nextFixtures.length === 0 && console.log(`Sorry, there are no upcoming fixtures for ${answer}`);
    
}

function displayTable(data) {
    const table = JSON.parse(data.toString()).api.standings[0];
    console.log(`
------------------------------------------
|           ${chalk.bgBlue('Current Standings...')}         |
------------------------------------------
        `);

    const mappedTable = table.map(r => {
        return {
            pos: r.rank,
            team: r.teamName,
            points: r.points  
        };
    });

    console.table(mappedTable);
    rl.close();
}

function getDataFromApi(path, cb) {
    var options = {
        "method": "GET",
        "hostname": "api-football-v1.p.rapidapi.com",
        "port": null,
        "path": path,
        "headers": {
            "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
            "x-rapidapi-key": require('./secrets').key,
            "useQueryString": true
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", function () {
            var body = Buffer.concat(chunks);
            cb(body);
        });
    });
    req.end();
}
