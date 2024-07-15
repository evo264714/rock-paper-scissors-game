const crypto = require('crypto');
const readline = require('readline');

class TableGenerator {
    static generateTable(moves) {
        const size = moves.length;
        const header = [' ', ...moves];
        const table = [header];

        for (let i = 0; i < size; i++) {
            const row = [moves[i]];
            for (let j = 0; j < size; j++) {
                if (i === j) {
                    row.push('Draw');
                } else if ((j > i && j <= i + size / 2) || (j < i && j <= (i + size / 2) % size)) {
                    row.push('Win');
                } else {
                    row.push('Lose');
                }
            }
            table.push(row);
        }

        return table;
    }

    static printTable(table) {
        table.forEach(row => {
            console.log(row.join(' | '));
        });
    }
}

class RuleEvaluator {
    constructor(moves) {
        this.moves = moves;
    }

    evaluate(playerMove, computerMove) {
        const playerIndex = this.moves.indexOf(playerMove);
        const computerIndex = this.moves.indexOf(computerMove);

        if (playerIndex === computerIndex) {
            return 'Draw';
        }

        const halfSize = Math.floor(this.moves.length / 2);
        if ((computerIndex > playerIndex && computerIndex <= playerIndex + halfSize) ||
            (computerIndex < playerIndex && computerIndex <= (playerIndex + halfSize) % this.moves.length)) {
            return 'Win';
        } else {
            return 'Lose';
        }
    }
}

class KeyGenerator {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

class HMACGenerator {
    static generateHMAC(key, message) {
        return crypto.createHmac('sha256', key).update(message).digest('hex');
    }
}

function printHelp(moves) {
    console.log('Available moves:');
    moves.forEach((move, index) => {
        console.log(`${index + 1} - ${move}`);
    });
    console.log('0 - Exit');
}

function validateArguments(args) {
    if (args.length < 3) {
        throw new Error('There must be at least 3 moves.');
    }
    if (args.length % 2 === 0) {
        throw new Error('The number of moves must be odd.');
    }
    if (new Set(args).size !== args.length) {
        throw new Error('Moves must be unique.');
    }
}

async function main() {
    const args = process.argv.slice(2);

    try {
        validateArguments(args);
    } catch (error) {
        console.error(error.message);
        console.log('Example: node game.js Rock Paper Scissors');
        return;
    }

    const moves = args;
    const key = KeyGenerator.generateKey();
    const computerMove = moves[Math.floor(Math.random() * moves.length)];
    const hmac = HMACGenerator.generateHMAC(key, computerMove);

    console.log('HMAC:', hmac);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    printHelp(moves);

    rl.question('Enter your move: ', (answer) => {
        const playerMoveIndex = parseInt(answer) - 1;
        if (isNaN(playerMoveIndex) || playerMoveIndex < 0 || playerMoveIndex >= moves.length) {
            console.log('Invalid move. Try again.');
            rl.close();
            return;
        }

        const playerMove = moves[playerMoveIndex];
        const ruleEvaluator = new RuleEvaluator(moves);
        const result = ruleEvaluator.evaluate(playerMove, computerMove);

        console.log('Your move:', playerMove);
        console.log('Computer move:', computerMove);
        console.log('Result:', result);
        console.log('Key:', key);

        rl.close();
    });
}

main();
