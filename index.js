var http = require("https");
const chalk = require('chalk');
const readline = require('readline');

const rl = readline.createInterface({ 
    input: process.stdin, 
    output: process.stdout
});

const teams = {
    union: 182,
    chelsea: 49,
    dafc: 1388
};

rl.question(`Whose fixtures shall i look up? Chelsea, DAFC, or FC Union? \n`, answer => {
    const lowerCaseAnswer = answer.toLowerCase();
    const userTeam = teams[lowerCaseAnswer];
    console.log(`
------------------------------------------
|           ${chalk.bgBlue('Upcoming Fixtures')}            |
------------------------------------------
    `);


    getDataFromApi(`/v2/fixtures/team/${userTeam}/next/10`, function(data) {
        const nextFixtures = JSON.parse(data.toString()).api.fixtures;
        for (let i = 0; i < nextFixtures.length; i++) {
            const nextFixture = nextFixtures[i];
            const unFormattedDate = new Date(nextFixture.event_date);
            const options = { month: "long", day: "numeric", year: "numeric" };
            const date = new Intl.DateTimeFormat("en-US", options).format(unFormattedDate);
            console.log(chalk.blue(`${date}: \t`) + `${nextFixture.homeTeam.team_name} ${chalk.red.bold.bgWhite('v')} ${nextFixture.awayTeam.team_name}`);
        }
        nextFixtures.length === 0 && console.log(`Sorry, there are no upcoming fixtures for ${answer}`);
        if (userTeam !== 182) {
            rl.close();
        } 
        getDataFromApi(`/v2/leagueTable/754`, function(data) {
            const table = JSON.parse(data.toString()).api.standings[0];
            console.log(`
------------------------------------------
|           ${chalk.bgBlue('Current Standings...')}         |
------------------------------------------
                `);

            for (let i = 0; i < table.length; i++) {
                console.log(chalk.blue(`${table[i].rank} \t`) + `${table[i].teamName.substring(0, 15)}\t\t ${table[i].points}`);
            }
            rl.close();

        });

    });
});

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
