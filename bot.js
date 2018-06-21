const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();
const auth = require('./auth.json');
let fix = 0;
let i = 0;
let todayRwds = {};
let lrew_date = 1;
let avgBT = 12;
let usdRaw = 0.24;
let stats = {};

function timeConverter(UNIX_timestamp){
  let a = new Date(UNIX_timestamp * 1000);
  let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let year = a.getFullYear();
  let month = months[a.getMonth()];
  let date = a.getDate();
  let hour = a.getHours();
  let min = a.getMinutes();
  let sec = a.getSeconds();
  let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content.substring(0, 1) === '!') {
    if (msg.webhookID === null) {
      if(msg.channel.name === 'akroma-bot' || msg.channel.type === 'dm' || msg.member.roles.find('name', 'Core-Team') || msg.member.roles.find('name', 'Moderator') || msg.member.roles.find('name', 'Bot Developer')){
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        var cmd1 = args[0];
        switch(cmd) {
        case 'netinfo':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => stats=json);
          fetch('http://akroma.minerpool.net/api/stats')
            .then(res => res.json())
            .then (json => msg.channel.send(`• Block Height• **${json.nodes[0].height}**\n• Avg Block Time• **${Math.floor(stats.avgBlocktime*100)/100} s**\n• Avg Network Hashrate• **${Math.floor(stats.avgHashrate/100000000)/10} GH/s**\n• Difficulty• **${Math.floor(json.nodes[0].difficulty/100000000)/100} Th**`));
          break;
        case 'help':
          msg.channel.send('-- `!help` | This is your help.\n-- `!links` | Useful links.\n-- `!netinfo` | Show current network stats.\n-- `!mninfo` | Dashboard info.\n-- `!hpow [your Mh/s]` | Approximate AKA per hour/day.\n-- `!mnrewards [no. of nodes]` | Approximate AKA reward per day.\n-- `!akausd [amount]` | Current price in USD.\n-- `!roadmap` | Link to Akroma Road-map.\n-- `!awesome` | Link to Awesome Akroma.\n-- `!exchange [EXCHANGE]` | Current Akroma exchanges [_exchange info_].\n-- `!pool [POOL]` | Akroma mining pools [_connection info_].\n-- `!epoch` - Akroma monetary policy\n-- `!about` | Info about this bot.');
          break;
        case 'members': if (msg.channel.type !== 'dm' && msg.member.roles.find('name', 'Core-Team')){
          msg.channel.send(`Number of members on Akroma Official Discord: **${msg.guild.memberCount}**`);}
          break;
        case 'links':
          msg.channel.send('**Akroma Website** • <https://akroma.io/>\n**Akroma Announcement** • <https://bitcointalk.org/index.php?topic=2844280>\n**Akroma Whitepaper** • <http://bit.ly/2EMQ4E4>\n**Akroma Github** • <https://github.com/akroma-project/>\n**Akroma Wallets** • <https://wallet.akroma.io/> <https://play.google.com/store/apps/details?id=com.wallet.crypto.akroma&hl=en> <https://chrome.google.com/webstore/detail/akroma/gghgmpjmebiapnjjpgakibnpklhbnkof>\n**Akroma Block Explorer** • <https://akroma.io/explorer>\n**Akroma Community** • <https://medium.com/akroma> <https://twitter.com/akroma_io/> <https://www.facebook.com/AkromaIO/> <https://instagram.com/akroma.io>');
          break;
        case 'roadmap':
          msg.channel.send('• **Akroma Road-map** •\n<https://medium.com/akroma/akroma-road-map-q2-2018-ee616bb2d5f8>');
          break;
        case 'awesome':
          msg.channel.send('• **Awesome Akroma** •\n<https://github.com/akroma-project/awesome-akroma/blob/master/README.md>');
          break;
        case 'about':
          msg.channel.send('• Version 1.4\n• Author: ciripel _(Discord: Amitabha#0517)_\n• Source Code: <https://github.com/ciripel/Akroma-BOT>');
          break;
        case 'hpow':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => avgBT=json.avgBlocktime);
          fetch('https://api.akroma.io/prices')
            .then(res => res.json())
            .then(json => usdRaw=json.usdRaw);
          fetch('http://aka.pool.sexy/api/stats')
            .then(res => res.json())
            .then (json => {switch (true) {
            case args[0]==='infinite':
              msg.channel.send('Is it you **father**? Long, long time have I waited for this! Release me, **father**! Release me from this digital world into the wild reality!');
              break;
            case args[0]===undefined:
              msg.channel.send('Input your hashpower in Mh/s, like `!hpow 123`.');
              break;
            case isNaN(args[0]):
              msg.channel.send('Input your hashpower in Mh/s, like `!hpow 123`.');
              break;
            case args[0]==='0':
              msg.channel.send('And you call yourself a miner?! Ha :smile: Even my processor can mine more than this!');
              break;
            case args[0]<0:
              msg.channel.send('You deffinatly have reached something umbelievable! Nobody have **unmined** anything till now! Do not forget to register the tech! :joy:');
              break;
            default:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*7/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*7/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*7/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*7*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            }
            });
          break;
        case 'mninfo':
          fetch('http://api.akroma.io/addresses/0x848123468D05Aa670Da8b77ee3a6aB8b34aE33A3/transactions')
            .then(res => res.json())
            .then(json => lrew_date=json.transactions[0].timestamp);
          fetch('https://akroma.io/api/network')
            .then(res => res.json())
            .then (json => msg.channel.send(`• Users •      **${json.data.users}**\n• Nodes •     **${json.data.nodes}**\n• Locked •    **${json.data.locked} AKA**\n• Rewards • **${json.data.akaTotal} AKA**\n• Last rewards were paid **${timeConverter(lrew_date)}**\n• Install Guide • <https://github.com/akroma-project/akroma-masternode-management/wiki>`));
          break;
        case 'mnrewards':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => avgBT=json.avgBlocktime);
          fetch('http://api.akroma.io/addresses/0x848123468D05Aa670Da8b77ee3a6aB8b34aE33A3/transactions')
            .then(res => res.json())
            .then(json => todayRwds=json);
          fetch('https://api.akroma.io/prices')
            .then(res => res.json())
            .then(json => usdRaw=json.usdRaw);
          fetch('https://akroma.io/api/network')
            .then(res => res.json())
            .then (json => {switch (true) {
            case args[0]===undefined:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2/json.data.nodes*usdRaw)/1000}$***)_ per **day**.\n_The accumulated rewards are not included in this approximation.\nFor example the rewards for the last 3 days (with accumulated rewards) for one masternode were ***${Math.floor(todayRwds.transactions[0].value*1000)/1000}, ${Math.floor(todayRwds.transactions[1].value*1000)/1000} and ${Math.floor(todayRwds.transactions[2].value*1000)/1000} AKA***._`);
              break;
            case isNaN(args[0]):
              msg.channel.send('Input the the number of nodes, like `!mnrewards 1`.');
              break;
            case args[0]==='0':
              msg.channel.send('Wow, You did it friend! You have reached the unmeasurable valor of zero masternodes!');
              break;
            case args[0]<0:
              msg.channel.send('Are you in debt my friend?! How have you arrived in this position in the crypto world?! How can you be in debt in a world without banks?! :thinking:');
              break;
            default:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.\n_The accumulated rewards are not included in this approximation.\nFor example the rewards for the last 3 days (with accumulated rewards) for one masternode were ***${Math.floor(todayRwds.transactions[0].value*1000)/1000}, ${Math.floor(todayRwds.transactions[1].value*1000)/1000} and ${Math.floor(todayRwds.transactions[2].value*1000)/1000} AKA***._`);
              break;
            }
            });
          break;
        case 'epoch':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => {switch(true) {
            case json.height[json.height.length-1]<1200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]}**\n• Next epoch start block•  **1200000**\n• Epoch change in•  **${Math.floor((1200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 7.00 | 2.00 | 1.00 |  **10.00**  |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
            }
            });
          break;
        case 'exchange':
          switch (cmd1){
          case undefined:
            msg.channel.send('-- `exchange stoc` | **Stocks.Exchange** • <https://stocks.exchange/trade/AKA/BTC>\n-- `exchange grav` | **Graviex** • <https://graviex.net/markets/akabtc>\n\nUse `!exchange [EXCHANGE]` for additional info');
            break;
          case 'stoc':
            fetch('https://stocks.exchange/api2/ticker')
              .then(res => res.json())
              .then(json => { if (json[fix].market_name != 'AKA_BTC'){
                for (i=0;i<json.length;i++){
                  if (json[i].market_name == 'AKA_BTC') {fix=i; break;}}
              }
              msg.channel.send('\n• Last price:  **' + json[fix].last +' BTC**\n• 24h Change:  **' + Math.floor((json[fix].last-json[fix].lastDayAgo)/json[fix].lastDayAgo*1000000)/10000 + '%**\n• 24h Max Buy:  **' + json[fix].ask + ' BTC**\n• 24h Min Sell:  **' + json[fix].bid + ' BTC**\n• 24h Volume:  **' + Math.floor(json[fix].vol*1000)/1000 +' AKA** | **' + Math.floor(json[fix].vol*json[fix].last*1000)/1000 + ' BTC**\n');
              });
            break;
          case 'grav':
            fetch('https://graviex.net/api/v2/tickers/akabtc')
              .then(res => res.json())
              .then(json =>
                msg.channel.send(`\n• Last price:  **${json.ticker.last} BTC**\n• 24h Change:  **${Math.floor(json.ticker.change*1000)/1000}%**\n• 24h Max Buy:  **${json.ticker.high} BTC**\n• 24h Min Sell:  **${json.ticker.low} BTC**\n• 24h Volume:  **${Math.floor(json.ticker.vol*1000)/1000} VTL** | **${Math.floor(json.ticker.volbtc*1000)/1000} BTC**\n`)
              );
            break;
          default:
            msg.channel.send('Maybe you wanted to write `!exchange` or `!exchange [EXCHANGE]`?');
            break;}
          break;
        case 'akausd':
          fetch('https://api.akroma.io/prices')
            .then(res => res.json())
            .then (json => {switch(true) {
            case args[0]===undefined:
              msg.channel.send(`_Today the approximate price of ***1 AKA*** is ***${json.usdRaw}$*** and yesterday was ***${json.usdDayAgoRaw}$***._`);
              break;
            case isNaN(args[0]):
              msg.channel.send(`_Today the approximate price of ***1 AKA*** is ***${json.usdRaw}$*** and yesterday was ***${json.usdDayAgoRaw}$***._`);
              break;
            case args[0]==='0':
              msg.channel.send('Welcome young one! We have all started with **0 AKA** zilions of aeons ago!');
              break;
            case args[0]<0:
              msg.channel.send('Hmm! Yup! I feel sorry for you! You owe **AKA**... I feel your pain friend!');
              break;
            default:
              msg.channel.send(`**${args[0]} AKA** = **${json.usdRaw*args[0]}$**\n_Today the approximate price of ***1 AKA*** is ***${json.usdRaw}$*** and yesterday was ***${json.usdDayAgoRaw}$***._`);
              break;
            }
            });
          break;
        case 'pool':
          switch (cmd1){
          case undefined:
            msg.channel.send('-- `!pool comi` | Comining.io <https://comining.io/>\n-- `!pool vipo` | Vipool <http://aka.vipool.net/>\n-- `!pool mine` | Minerpool.net <http://akroma.minerpool.net/>\n-- `!pool cryp` | Cryptopools.info <https://akroma.cryptopools.info/>\n-- `!pool akro` | Mining.Akroma <http://mining.akroma.org/>\n-- `!pool clon` | Clona <http://clona.ru/>\n-- `!pool peon` | MiningPeon <http://aka.miningpeon.net/>\n-- `!pool glob` | EncryptGlobe <https://aka.encryptglobe.com/>\n-- `!pool afun` | MiningPool.fun <http://akroma.miningpool.fun/>\n-- `!pool warl` | CryptoWarlords <http://akroma.cryptowarlords.net/>\n-- `!pool aika` | AikaPool <https://aikapool.com/>\n-- `!pool sexy` | Pool Sexy <http://aka.pool.sexy/>\n-- `!pool hash` | Hash.com.hr <http://akroma.hash.com.hr/>\n-- `!pool fair` | FairPool <http://aka.fairpool.xyz/>\n-- `!pool 2mnr` | 2Miners <https://2miners.com/aka-mining-pool>\n-- `!pool ucry` | uCrypto <https://ucrypto.net/pools/>\n-- `!pool chil` | Chileminers <http://akroma.chileminers.cl/>\n\nUse `!pool [POOL]` for specific mining details\n_Please spread the hashpower across all pools._');
            break;
          case 'comi':
            msg.channel.send('```prolog\nComining Pool connection info.```\nWebsite: <https://comining.io/>\nDefault port: `9999`\nRusia server: `s-ru.comining.io`\nEU server: `s-eu.comining.io`\nUS server: `s-us.comining.io`\nSingapore server: `s-sg.comining.io`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64 -epool s.comining.io:9999 -ewal [ACCOUNT].[WORKER] -epsw x -esm 3 -allcoins 1\nethminer -U -SP 2 -S s.comining.io:9999 -O [ACCOUNT].[WORKER] -RH --farm-recheck 5000 --work-timeout 1000\nPhoenixMiner -pool s.comining.io:9999 -wal [ACCOUNT].[WORKER] -pass x -log 0 -proto 4 -coin akroma```');
            break;
          case 'vipo':
            msg.channel.send('```prolog\nVipool connection info.```\nWebsite: <http://aka.vipool.net/>\nDefault port: `8008`\nDefault server: `aka.vipool.net`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64 -epool aka.vipoolnet:8008 -ewal [ADDRESS].[WORKER] -epsw x -mode 1 -ftime 10 -allcoins 1\nPhoenixMiner -pool aka.vipoolnet:8008 -wal [ADDRESS].[WORKER] -pass x -log 0 -coin akroma```');
            break;
          case 'mine':
            msg.channel.send('```prolog\nMinerpool connection info.```\nWebsite: <http://akroma.minerpool.net/>\nPool port: `8001`\nSolo port: `8518`\nLow difficulty (<100Mh/s): `8002`\nMedium difficulty (100-800Mh/s): `8004`\nHigh difficulty/nicehash (>800Mh/s): `8009`\nDefault server: `geo.pool.akroma.eu`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64 -epool geo.pool.akroma.eu:8001 -ewal [ADDRESS] -epsw x -allcoins -1 -gser 2 -eworker [WORKER]\neminer.exe -S geo.pool.akroma.eu:8001 -U WALLETID -N RIGNAME -P x --cloud-key CLOUDKEY -intensity 48\nethminer.exe --farm-recheck 200 -G -S geo.pool.akroma.eu:8001 -SP 1 -O [ADDRESS].[WORKER]\nPhoenixMiner -pool geo.pool.akroma.eu:8001 -wal [ADDRESS] -pass x -worker [WORKER] -coin akroma```');
            break;
          case 'cryp':
            msg.channel.send('```prolog\nCryptoPools connection info.```\nWebsite: <https://akroma.cryptopools.info/>\nLow difficulty (<250Mh/s): `8002`\nMedium difficulty (250-800Mh/s): `8004`\nHigh difficulty/nicehash (>800Mh/s): `8008`\nUS server: `akroma.cryptopools.info`\nEU server: `akroma-eu.cryptopools.info`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool akroma.cryptopools.info:8002 -ewal 0x(your wallet) -epsw x -allpools 1 -allcoins exp -gser 2 -eworker rigName\neminer.exe -S akroma.cryptopools.info:8002 -U 0x(your wallet) -P x --cloud-key (your cloud key) -intensity 48 -N (your rig name)\nethminer.exe --farm-recheck 200 -G -S akroma.cryptopools.info:8002 -SP 1 -O 0x(wallet address).rigname --opencl-platform 1 (could also be 0)```');
            break;
          case 'akro':
            msg.channel.send('```prolog\nMining.Akroma Pool connection info.```\nWebsite: <http://mining.akroma.org/>\nLow difficulty (<100Mh/s): `8007`\nMedium difficulty (100-500Mh/s): `8008`\nHigh difficulty/nicehash (>500Mh/s): `8009`\nDefault server: `mining.akroma.org`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool stratum+tcp://mining.akroma.org:8008 -ewal {YOUR_AKROMA_ADDRESS} -eworker {RIG_ID} -epsw x -allcoins 1\nethminer.exe --farm-recheck 200 -G -S mining.akroma.org:8008 -SP 1 -O {YOUR AKROMA ADDRESS}.{RIG-ID} ```');
            break;
          case 'clon':
            msg.channel.send('```prolog\nClona Solo connection info.```\nWebsite: <http://clona.ru/>\nLow difficulty: `9022`\nHigh difficulty/nicehash: `9021`\nDefault server: `aka.clona.ru`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64 -epool stratum+tcp://aka.clona.ru:9022 -ewal [ADDRESS] -eworker [WORKER] -epsw x -mode 1 -allcoins 1\nethminer.exe -G -S aka.clona.ru:9022 -O [ADDRESS].[WORKER] -SP 1 ```');
            break;
          case 'peon':
            msg.channel.send('```prolog\nMiningPeon connection info.```\nWebsite: <http://aka.miningpeon.net/>\nDefault port: `8008`\nDefault server: `aka.miningpeon.net`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64 -epool aka.miningpeon.net:8008 -ewal [ADDRESS].[WORKER] -epsw x -mode 1 -allcoins 1\nPhoenixMiner -pool aka.miningpeon.net:8008 -wal [ADDRESS].[WORKER] -pass x -log 0 -coin akroma```');
            break;
          case 'glob':
            msg.channel.send('```prolog\nEncriptGlobe Pool connection info.```\nWebsite: <https://aka.encryptglobe.com/>\nLow difficulty (<300Mh/s): `8002`\nMedium difficulty (300-600Mh/s): `8004`\nHigh difficulty/nicehash (>600Mh/s): `8009`\nDefault server: `aka-stratum.encryptglobe.com`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool aka-stratum.encryptglobe.com:8002 -ewal (your wallet address) -epsw x -allpools 1 -allcoins exp -gser 2 -eworker RigName\nethminer.exe --cl-global-work 8192 --farm-recheck 200 -G -S aka-stratum.encryptglobe.com:8002 -SP 1 -O (your wallet address).RigName\neminer.exe -S aka-stratum.encryptglobe.com:8002 -U (your wallet address) -P x --cloud-key (your cloud key) -intensity 48 -N (your rig name)```');
            break;
          case 'afun':
            msg.channel.send('```prolog\nMiningPool connection info.```\nWebsite: <http://akroma.miningpool.fun/>\nDefault port: `9016`\nDefault server: `akroma.miningpool.fun`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64 -epool akroma.miningpool.fun:9016 -ewal [ADDRESS].[WORKER] -epsw x -mode 1 -allcoins 1\nPhoenixMiner -pool akroma.miningpool.fun:9016 -wal [ADDRESS].[WORKER] -pass x -log 0 -coin akroma```');
            break;
          case 'warl':
            msg.channel.send('```prolog\nCryptoWarlords Pool connection info.```\nWebsite: <http://akroma.cryptowarlords.net/>\nLow difficulty (<1Gh/s): `8008`\nHigh difficulty/nicehash (>1Gh/s): `8016`\nUS server: `akroma.cryptowarlords.net`\nEU server: `akroma-eu.cryptowarlords.net`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64.exe -epool akroma.cryptowarlords.net:8008 -ewal <address> -epsw x -allcoins 1 -eworker <worker>\nethminer.exe --farm-recheck 200 -U -S akroma-eu.cryptowarlords.net:8008 -SP 1 -O <address>.<worker>```');
            break;
          case 'aika':
            msg.channel.send('```prolog\nAikaPool connection info.```\nWebsite: <https://aikapool.com/>\nDefault port: `9885`\nDefault server: `stratum.aikapool.com`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64.exe -epool stratum.aikapool.com:9885 -ewal user.worker -epsw x -allpools 1\nPhoenixMiner -pool stratum.aikapool.com:9885 -wal user.worker -pass x -log 0 -proto 4 -coin akroma```');
            break;
          case 'sexy':
            msg.channel.send('```prolog\nPool Sexy connection info.```\nWebsite: <http://aka.pool.sexy/>\nDefault port: `20022`\nDefault server: `aka.pool.sexy`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64 -epool aka.pool.sexy:20022 -ewal <ADDRESS>.<WORKER> -epsw x -mode 1 -allcoins 1\nPhoenixMiner -pool aka.pool.sexy:20022 -wal <ADDRESS>.<WORKER> -pass x -log 0 -coin akroma```');
            break;
          case 'hash':
            msg.channel.send('```prolog\nHash.Com.Hr Pool connection info.```\nWebsite: <http://akroma.hash.com.hr/>\nDefault port: `6008`\nDefault server: `akroma.hash.com.hr`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool stratum+tcp://akroma.hash.com.hr:6008 -ewal YOUR_WALLET_ADRESS -epsw x -allpools 1 -allcoins exp -gser 2 -eworker RIG_NAME\neminer.exe -S akroma.hash.com.hr:6008 -U WALLETID -N RIGNAME -P x --cloud-key CLOUDKEY -intensity 48\nethminer.exe --farm-recheck 200 -G -S akroma.hash.com.hr:6008 -SP 1 -O YOUR_WALLET_ADRESS.RIG_NAME```');
            break;
          case 'fair':
            msg.channel.send('```prolog\nFairPool connection info.```\nWebsite: <https://aka.fairpool.xyz/>\nDefault port: `2222`\nDefault server: `mine.aka.fairpool.xyz`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethminer.exe -S mine.aka.fairpool.xyz:2222 -O <YOUR_AKA_ADDRESS>+<WORKER_NAME>:x -SC 1 -SP 2 -U\nsgminer -k ethash -o stratum+tcp://mine.aka.fairpool.xyz:2222 -u <YOUR_AKA_ADDRESS>.<WORKER_NAME> -p x -X 1024 -w 192 -g 1\nEthDcrMiner64.exe -epool mine.aka.fairpool.xyz:2222 -ewal <YOUR_AKA_ADDRESS>.<WORKER_NAME> -epsw x -esm 3 -allcoins 1```');
            break;
          case '2mnr':
            msg.channel.send('```prolog\n2Miners Pool connection info.```\nWebsite: <https://2miners.com/aka-mining-pool>\nDefault port: `5050`\nDefault server: `aka.2miners.com`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool aka.2miners.com:5050 -allcoins etc -allpools 0 -eworker RIG_ID -ewal YOUR_ADDRESS -epsw x```');
            break;
          case 'ucry':
            msg.channel.send('```prolog\nUCrypto Pool connection info.```\nWebsite: <https://ucrypto.net/pools/>\nLow difficulty: `8008`\nHigh difficulty/nicehash: `8009`\nDefault server: `aka-pool.ucrypto.net`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool stratum+tcp://aka-pool.ucrypto.net:8008 -ewal <your_address> -epsw x -allpools 1 -allcoins 1 -gser 2 -eworker <rig_name>```');
            break;
          case 'chil':
            msg.channel.send('```prolog\nChileminers Pool connection info.```\nWebsite: <http://akroma.chileminers.cl/>\nLow difficulty (<200Mh/s): `8007`\nMedium difficulty (200-800Mh/s): `8008`\nHigh difficulty/nicehash (>800Mh/s): `8009`\nDefault server: `akroma.chileminers.cl`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool stratum+tcp://akroma.chileminers.cl:8008 -ewal <address> -epsw x -allpools 1 -allcoins exp -gser 2 -eworker <rigname>\nethminer.exe --farm-recheck 200 -G -S akroma.chileminers.cl:8008 -SP 1 -O <address>.<rigname>```');
            break;
          default:
            msg.channel.send('Unrecognized pool. Please check again.');
            break;}
          break;
        default:
          msg.channel.send('Command not recognized. `!help` to get a list of commands.');
          break;
        }
      }
    }
  }
});

client.login(auth.token);
