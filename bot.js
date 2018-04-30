const fetch = require('node-fetch');
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot nedds to know if it will execute a command
    // It will listen for messages that will start with `!`
if (channelID in bot.directMessages || bot.channels[channelID].name == 'akroma-bot'){
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
       
        args = args.splice(1);
        switch(cmd) {
            case 'diff':
fetch('http://aka.pool.sexy/api/stats')
    .then(res => res.json())
    .then (json => bot.sendMessage({
                    to: channelID,
                    message: 'Current network difficulty is **'+ Math.floor(json.nodes[0].difficulty/1000000000)/1000 + ' Th**.'
                }));
            break;
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: '-- `!help` | This is your help.\n-- `!links` | Useful links.\n-- `!diff` | Current network difficulty.\n-- `!mninfo` | Dashboard info.\n-- `!hpow [your Mh/s]` | Approximate AKA per hour/day.\n-- `!mnrewards [no. of nodes]` | Approximate AKA reward per day.\n-- `!akausd [amount]` | Current price in USD.\n-- `!awesome` | Link to Awesome Akroma.\n-- `!about` | Info about this bot.'
                 });
            break;
            case 'links':
                bot.sendMessage({
                    to: channelID,
                    message: '**Akroma Website** • <https://akroma.io/>\n**Akroma Announcement** • <https://bitcointalk.org/index.php?topic=2844280>\n**Akroma Whitepaper** • <http://bit.ly/2EMQ4E4>\n**Akroma Github** • <https://github.com/akroma-project/>\n**Akroma Wallets** • <https://wallet.akroma.io/> <https://play.google.com/store/apps/details?id=com.wallet.crypto.akroma&hl=en>\n**Akroma Block Explorer** • <https://akroma.io/explorer>\n**Akroma Community** • <https://medium.com/akroma> <https://twitter.com/akroma_io/> <https://www.facebook.com/AkromaIO/> <https://instagram.com/akroma.io>'
                });
            break;
            case 'awesome':
                bot.sendMessage({
                    to: channelID,
                    message: '\n• **Awesome Akroma** •\n<https://github.com/akroma-project/awesome-akroma/blob/master/README.md>'
                 });
            break;
            case 'about':
                bot.sendMessage({
                    to: channelID,
                    message: '\n\n• Version 1.1\n• Author: ciripel _(Discord: Amitabha#0517)_\n• Source Code: <https://github.com/ciripel/Akroma-BOT>'
                 });
            break;
            case 'hpow':
fetch('https://api.akroma.io/prices')
    .then(res => res.json())
    .then(json => usdRaw=json.usdRaw)
fetch('http://aka.pool.sexy/api/stats')
    .then(res => res.json())
    .then (json => {if (args[0] != (null) && !isNaN(args[0])) 
                    bot.sendMessage({
                    to: channelID,
                    message: 'Current network difficulty is **'+ Math.floor(json.nodes[0].difficulty/1000000000)/1000 + ' Th**.\n' + 'A hashrate of **'+ args[0] + ' Mh/s** will get you approximately **' + Math.floor(args[0]/json.nodes[0].difficulty*1000000000*3600*7)/1000 + ' AKA** _(***' + Math.floor(args[0]/json.nodes[0].difficulty*1000000000*3600*7*usdRaw)/1000 + '$***)_ per **hour** and **' + Math.floor(args[0]/json.nodes[0].difficulty*1000000000*3600*24*7)/1000 + ' AKA** _(***' + Math.floor(args[0]/json.nodes[0].difficulty*1000000000*3600*7*24*usdRaw)/1000 + '$***)_ per **day** at current network difficulty.'
                                    });
                    else bot.sendMessage({
                    to: channelID,
                    message: 'Input your hashpower in Mh/s, like `!hpow 123`.'
                                        })
                    }
            );
            break;
            case 'mninfo':
fetch('http://api.akroma.io/addresses/0x80363B2956B00946D8F05D8B56DeAA2672613faf/transactions')
    .then(res => res.json())
    .then(json => lrew_date=json.transactions[0].timestamp)
fetch('https://akroma.io/api/network')
    .then(res => res.json())
    .then (json => bot.sendMessage({
                    to: channelID,
                    message: '• Users •      **' + json.data.users + '**\n• Nodes •     **' + json.data.nodes + '**\n• Locked •    **' + json.data.locked + '** AKA\n• Rewards • **' + json.data.akaTotal + '** AKA\n• Last rewards were paid **' +  Date(lrew_date) + '**\n• Install Guide • <https://github.com/akroma-project/akroma-masternode-management/wiki>'
                }));
            break;
            case 'mnrewards':
fetch('https://stats.akroma.io/akroma')
    .then(res => res.json())
    .then(json => avgBT=json.avgBlocktime)
fetch('http://api.akroma.io/addresses/0x80363B2956B00946D8F05D8B56DeAA2672613faf/transactions')
    .then(res => res.json())
    .then(json => todayRwds=json)
fetch('https://api.akroma.io/prices')
    .then(res => res.json())
    .then(json => usdRaw=json.usdRaw)
fetch('https://akroma.io/api/network')
    .then(res => res.json())
    .then (json => {if (args[0] != (null) && !isNaN(args[0])) 
                    bot.sendMessage({
                    to: channelID,
                    message: '**'+args[0]+'** masternode(s) will give you approximately **' + Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0])/1000 + ' AKA** _(***' + Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0]*usdRaw)/1000 + '$***)_ per **day**.\n_The accumulated rewards are not included in this aproximation.\nFor example the rewards for the last 3 days (with accumulated rewards) for one masternode were ***'+ Math.floor(todayRwds.transactions[0].value*1000)/1000 + ', ' + Math.floor(todayRwds.transactions[1].value*1000)/1000 + ' and ' + Math.floor(todayRwds.transactions[2].value*1000)/1000 + ' AKA***._' 
                                    });
                    else bot.sendMessage({
                    to: channelID,
                    message: 'Input the the number of nodes, like `!mnrewards 2`.'
                                        })
                    }
            );
            break;
            case 'akausd':
fetch('https://api.akroma.io/prices')
    .then(res => res.json())
    .then (json => {if (args[0] != (null) && !isNaN(args[0])) 
                    bot.sendMessage({
                    to: channelID,
                    message: '**' + args[0] +' AKA** = **' + json.usdRaw*args[0] + '$**\n _Today the aproximate price of ***1 AKA*** is ***' + json.usdRaw +'$*** and yesterday was ***' + json.usdDayAgoRaw + '$***._'
                                    });
                    else bot.sendMessage({
                    to: channelID,
                    message: '_Today the aproximate price of ***1 AKA*** is ***' + json.usdRaw +'$*** and yesterday was ***' + json.usdDayAgoRaw + '$***._'
                                        })
                    }
            );
            break;
            default:
                 bot.sendMessage({
                    to: channelID,
                    message: 'Command not recognized. `!help` to get a list of commands.\n'
                });
         }
     }
   } 
});
