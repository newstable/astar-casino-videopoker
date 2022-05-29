const axios = require("axios");
const rand = require("random-seed").create();
require("dotenv").config();

function Check(card, cardCopy, data) {
    var raiseprice;
    var msg = "";
    var cases;
    var active_array = [];
    var newArray = [];
    for (var i = 0; i < cardCopy.length; i++) {
        newArray[i] = cardCopy[i] % 13;
    }
    var straight = Straight(newArray);
    var get = NumSame(newArray);
    var markCheck = MarkSame(card);


    if (markCheck || straight != -1) {
        if (markCheck && straight != -1) {
            if (straight == 12) {
                msg = "ROYAL FLUSH";
                raiseprice = data.betAmount * 800;
                cases = 0;
            } else {
                msg = "STRAIGHT FLUSH";
                raiseprice = data.betAmount * 60;
                cases = 1;
            }
        } else if (markCheck && straight == -1) {
            msg = "FLUSH";
            raiseprice = data.betAmount * 6;
            cases = 4;
        } else {
            msg = "STRAIGHT";
            raiseprice = data.betAmount * 4;
            cases = 5;
        }
        active_array = [0, 1, 2, 3, 4];
    } else if (get.msg != "") {
        switch (get.msg) {
            case "JACKS OR BETTER":
                if (newArray[get.active[0]] > 8 && newArray[get.active[0]] < 13) {
                    msg = get.msg;
                    raiseprice = data.betAmount * 1;
                    active_array = get.active;
                    cases = 8;
                } else {
                    msg = "";
                    raiseprice = 0;
                    active_array = [];
                    cases = 9;
                }
                break;
            case "TWO PAIRS":
                raiseprice = data.betAmount * 2;
                active_array = get.active;
                msg = get.msg;
                cases = 7;
                break;
            case "THREE OF A KIND":
                raiseprice = data.betAmount * 3;
                active_array = get.active;
                msg = get.msg;
                cases = 6;
                break;
            case "FULL HOUSE":
                raiseprice = data.betAmount * 9;
                active_array = [0, 1, 2, 3, 4];
                msg = get.msg;
                cases = 3;
                break;
            case "FOUR OF A KIND":
                raiseprice = data.betAmount * 22;
                active_array = get.active;
                msg = get.msg;
                cases = 2;
                break;
            default:
                msg = "";
                active_array = [];
                cases = 9;
                raiseprice = 0;
                break;
        }
    } else {
        msg = "";
        active_array = [];
        cases = 9;
        raiseprice = 0;
    }
    var result = {
        msg: msg,
        activeArray: active_array,
        raisePrice: raiseprice,
        cases: cases,
    };
    return result;
}
function Straight(array) {
    var n = 0;
    var newArray = [];
    var sortArray = [];
    for (var i = 0; i < array.length; i++) {
        newArray.push((array[i]) % 13);
    }
    sortArray = [...newArray];
    sortArray.sort(function (a, b) { return a - b });
    if (sortArray[4] - sortArray[3] == 1 && sortArray[3] - sortArray[2] == 1 && sortArray[2] - sortArray[1] == 1 && sortArray[1] - sortArray[0] == 1)
        return sortArray[4];
    else
        return -1;
}
function MarkSame(array) {
    var n1 = 0;
    var n2 = 0;
    var n3 = 0;
    var n4 = 0;
    array.forEach((i) => {
        if (i > -1 && i < 13) {
            n1++;
        } else if (i > 12 && i < 26) {
            n2++;
        } else if (i > 25 && i < 39) {
            n3++;
        } else {
            n4++;
        }
    })
    if (n1 == 5 || n2 == 5 || n3 == 5 || n4 == 5) {
        return true;
    } else {
        return false;
    }
}
function NumSame(cardCopy) {
    var countsArrays = count_duplicate(cardCopy);
    var result = {
        msg: getMessage(countsArrays.counts),
        active: countsArrays.active
    }
    return result;
}
function count_duplicate(randomArray) {
    var counts = [];
    var active = [];
    var array = [...randomArray];
    array.forEach((i) => {
        counts[i] = (counts[i] || 0) + 1
        if (counts[i] > 1) {
            active.push(i);
        }
    });

    var actived = [];
    for (var i = 0; i < active.length; i++) {
        for (var j = 0; j < array.length; j++) {
            if (array[j] == active[i]) {
                actived.push(j);
            }
        }
    }
    counts = counts.filter((c) => {
        if (c) return c
    });
    counts = counts.sort();
    var result = {
        counts: counts,
        active: actived,
    }
    return result;
}
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
function getMessage(counts) {
    for (var score of cases) {
        if (arrayEquals(counts, score.counts)) {
            return score.msg;
        }
    }
    return 0;
}

const cases = [
    {
        counts: [1, 1, 1, 1, 1],
        msg: "",
    },
    {
        counts: [1, 1, 1, 2],
        msg: "JACKS OR BETTER",
    },
    {
        counts: [1, 2, 2],
        msg: "TWO PAIRS",
    },
    {
        counts: [1, 1, 3],
        msg: "THREE OF A KIND",
    },
    {
        counts: [2, 3],
        msg: "FULL HOUSE",
    },
    {
        counts: [1, 4],
        msg: "FOUR OF A KIND",
    },
    {
        counts: [5],
        msg: "",
    },
]
function getArray(num, max) {
    var array = [];
    for (var i = 0; i < num;) {
        var random = getRandomInt(max);
        if (array.indexOf(random) == -1) {
            array[i] = random;
            i++;
        }
    }
    return array;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
module.exports = {
    StartSignal: async (req, res) => {
        const { userName, betAmount, token, amount } = req.body;
        var betValue = parseFloat(betAmount);
        var amountValue = parseFloat(amount);
        let user = [];
        user[token] = {
            userName: userName,
            betAmount: betValue,
            userToken: token,
            amount: amountValue
        }
        try {
            if (token != "demo") {
                try {
                    await axios.post(
                        process.env.PLATFORM_SERVER + "api/games/bet",
                        {
                            token: user[token].userToken,
                            amount: user[token].betAmount,
                        }
                    );
                } catch (err) {
                    throw new Error("Bet Error!");
                }
            }
            var card = getArray(5, 51);
            var cardCopy = [...card];
            card.sort(function (a, b) { return a - b });
            var response = Check(card, cardCopy, user[token]);
            var total = user[token].amount + response.raisePrice - user[token].betAmount;
            if (token != "demo") {
                try {
                    await axios.post(
                        process.env.PLATFORM_SERVER + "api/games/winlose",
                        {
                            token: user[token].userToken,
                            amount: response.raisePrice,
                            winState: response.raisePrice != 0 ? true : false,
                        }
                    )
                } catch (err) {
                    throw new Error("WinLose Error!");
                }
            }
            try {
                res.json({
                    msg: response.msg,
                    cardArray: cardCopy,
                    activeArray: response.activeArray,
                    total: total,
                    raisePrice: response.raisePrice,
                    cases: response.cases,
                    serverMsg: "Success"
                })
            } catch (error) {
                throw new Error("Can't find Server!");
            };
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
        delete user[token];
    },
};
