const Discord = require('discord.js');
const fetch = require('node-fetch');
const client = new Discord.Client();
const auth = require('./auth.json');
let fix = 0;
let i = 0;
let lrew_date = 1;
let avgBT = 12;
let last_blk = 1000000;
let usdRaw = 0.24;
let stats = {};
let cmc_btc = {};
let nodes_stats = {};

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
  fetch('http://api.akroma.io/addresses/0x848123468D05Aa670Da8b77ee3a6aB8b34aE33A3/transactions')
    .then(res => res.json())
    .then(json => lrew_date=json.transactions[0].timestamp)
    .catch(error => console.log(`Can't connect to http://api.akroma.io/addresses/0x848123468D05Aa670Da8b77ee3a6aB8b34aE33A3/transactions.\nError: \n-----------\n${error}\n-----------`));
  fetch('https://stats.akroma.io/akroma')
    .then(res => res.json())
    .then(json => {
      avgBT=json.avgBlocktime;
      last_blk=json.height[json.height.length-1];
    })
    .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma.\nError: \n-----------\n${error}\n-----------`));
  fetch('https://api.akroma.io/prices')
    .then(res => res.json())
    .then(json => usdRaw=json.usdRaw)
    .catch(error => console.log(`Can't connect to https://api.akroma.io/prices.\nError: \n-----------\n${error}\n-----------`));
  fetch('https://stats.akroma.io/akroma')
    .then(res => res.json())
    .then(json => stats=json)
    .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma.\nError: \n-----------\n${error}\n-----------`));
  console.log(`Logged in as ${client.user.tag}!`);
  fetch('https://api.coinmarketcap.com/v2/ticker/1/')
    .then(res => res.json())
    .then(json => cmc_btc = json)
    .catch(error => console.log(`Can't connect to https://api.coinmarketcap.com/v2/ticker/1/.\nError: \n-----------\n${error}\n-----------`));
  fetch('https://akroma.io/api/network')
    .then(res => res.json())
    .then(json => nodes_stats = json)
    .catch(error => console.log(`Can't connect to https://akroma.io/api/network.\nError: \n-----------\n${error}\n-----------`));
});

client.on('error', (e) => console.log(`Error on ready ...${e}`));

client.on('reconnecting',() =>
  console.log(`Bot ${client.user.tag} reconected!`));

client.on('disconnect',() => {
  console.log(`Bot ${client.user.tag} disconnected ... Attempted reconnecting... `);
  client.login(auth.token)
    .catch(error => console.log(`Can't login into discord due to ${error}`));
});

client.on('message', msg => {
  if (msg.content.substring(0, 1) === '!') {
    if (msg.webhookID === null) {
      if(msg.channel.name === 'akroma-bot' || msg.channel.type === 'dm' || msg.member.roles.find('name', 'Core-Team') || msg.member.roles.find('name', 'Support-Team') || msg.member.roles.find('name', 'Contributors')){
        var args = msg.content.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        var cmd1 = args[0];
        switch(cmd) {
        case 'netinfo':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => stats=json)
            .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma.\nError: \n-----------\n${error}\n-----------`));
          fetch('http://akroma.minerpool.net/api/stats')
            .then(res => res.json())
            .then (json => msg.channel.send(`• Block Height• **${json.nodes[0].height}**\n• Avg Block Time• **${Math.floor(stats.avgBlocktime*100)/100} s**\n• Avg Network Hashrate• **${Math.floor(stats.avgHashrate/100000000)/10} GH/s**\n• Difficulty• **${Math.floor(json.nodes[0].difficulty/100000000)/100} Th**`))
            .catch(error => console.log(`Can't connect to http://akroma.minerpool.net/api/stats.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'help':
          msg.channel.send('-- `!help` | This is your help.\n-- `!links` | Useful links.\n-- `!netinfo` | Show current network stats.\n-- `!mninfo` | Dashboard info.\n-- `!hpow [your Mh/s]` | Approximate AKA per hour/day.\n-- `!mnrewards [no. of nodes]` | Approximate AKA reward per day.\n-- `!akausd [amount]` | Current price in USD.\n-- `!roadmap` | Link to Akroma Road-map.\n-- `!awesome` | Link to Awesome Akroma.\n-- `!exchange [EXCHANGE]` | Current Akroma exchanges [_exchange info_].\n-- `!pool [POOL]` | Akroma mining pools [_connection info_].\n-- `!epoch` - Akroma monetary policy\n-- `!about` | Info about this bot.');
          break;
        case 'members': if (msg.channel.type !== 'dm' && msg.member.roles.find('name', 'Core-Team')){
          msg.channel.send(`Number of members on Akroma Official Discord: **${msg.guild.memberCount}**`);}
          break;
        case 'links':
          msg.channel.send('**Akroma Website** • <https://akroma.io/>\n**Akroma Announcement** • <https://bitcointalk.org/index.php?topic=2844280>\n**Akroma Whitepaper** • <http://bit.ly/2EMQ4E4>\n**Akroma wiki** • <https://docs.akroma.io/>\n**Akroma Github** • <https://github.com/akroma-project/>\n**Akroma Wallets** • <https://wallet.akroma.io/> <https://play.google.com/store/apps/details?id=com.wallet.crypto.akroma&hl=en> <https://chrome.google.com/webstore/detail/akroma/gghgmpjmebiapnjjpgakibnpklhbnkof>\n**Akroma Block Explorer** • <https://akroma.io/explorer>\n**Akroma Community** • <https://medium.com/akroma> <https://t.me/akroma_official> <https://twitter.com/akroma_io/> <https://www.facebook.com/AkromaIO/> <https://instagram.com/akroma.io>');
          break;
        case 'roadmap':
          msg.channel.send('• **Akroma Road-map** •\n<https://medium.com/akroma/akroma-road-map-q2-2018-ee616bb2d5f8>');
          break;
        case 'awesome':
          msg.channel.send('• **Awesome Akroma** •\n<https://github.com/akroma-project/awesome-akroma/blob/master/README.md>');
          break;
        case 'about':
          msg.channel.send('• Version 1.5\n• Author: ciripel _(Discord: Amitabha#0517)_\n• Source Code: <https://github.com/ciripel/Akroma-BOT>');
          break;
        case 'hpow':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => {
              avgBT=json.avgBlocktime;
              last_blk=json.height[json.height.length-1];
            })
            .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://api.akroma.io/prices')
            .then(res => res.json())
            .then(json => usdRaw=json.usdRaw)
            .catch(error => console.log(`Can't connect to https://api.akroma.io/prices.\nError: \n-----------\n${error}\n-----------`));
          fetch('http://akroma.minerpool.net/api/stats')
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
            default: {switch(true) {
            case last_blk<=300000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*9/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*9/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*9/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*9*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 300000<last_blk && last_blk<=1200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*7/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*7/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*7/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*7*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 1200000<last_blk && last_blk<=2200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*6/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*6*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 2200000<last_blk && last_blk<=3200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*5.5/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*5.5/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*5.5/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*5.5*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 3200000<last_blk && last_blk<=4200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*5/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*5/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*5/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*5*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 4200000<last_blk && last_blk<=5200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*4.5/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*4.5/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*4.5/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*4.5*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 5200000<last_blk && last_blk<=6200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*4/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*4*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 6200000<last_blk && last_blk<=7200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.8/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*3.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.8*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 7200000<last_blk && last_blk<=8200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.6/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*3.6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.6*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 8200000<last_blk && last_blk<=9200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.4/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*3.4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.4*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 9200000<last_blk && last_blk<=10200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.2/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*3.2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3.2*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 10200000<last_blk && last_blk<=11200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*3/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*3*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 11200000<last_blk && last_blk<=12200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.8/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*2.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.8*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 12200000<last_blk && last_blk<=13200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.6/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*2.6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.6*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 13200000<last_blk && last_blk<=14200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.4/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*2.4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.4*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 14200000<last_blk && last_blk<=15200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.2/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*2.2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2.2*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 15200000<last_blk && last_blk<=16200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*2*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 16200000<last_blk && last_blk<=17200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.8/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*1.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.8*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 17200000<last_blk && last_blk<=18200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.6/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*1.6/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.6*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 18200000<last_blk && last_blk<=19200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.4/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*1.4/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.4*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 19200000<last_blk && last_blk<=20200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.2/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*1.2/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*1.2*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 20200000<last_blk && last_blk<=21200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 21200000<last_blk && last_blk<=22200000:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            case 22200000<last_blk:
              msg.channel.send(`Current network difficulty is **${Math.floor(json.nodes[0].difficulty/1000000000)/1000} Th**.\nA hashrate of **${args[0]} Mh/s** will get you approximately **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*0.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*0.8/avgBT*usdRaw)/1000}$***)_ per **hour** and **${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*24*0.8/avgBT)/1000} AKA** _(***${Math.floor(args[0]/json.nodes[0].difficulty*10000000000*3600*0.8*24/avgBT*usdRaw)/1000}$***)_ per **day** at current network difficulty.`);
              break;
            }}}})
            .catch(error => console.log(`Can't connect to http://akroma.minerpool.net/api/stats.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'mninfo':
          fetch('http://api.akroma.io/addresses/0x848123468D05Aa670Da8b77ee3a6aB8b34aE33A3/transactions')
            .then(res => res.json())
            .then(json => lrew_date=json.transactions[0].timestamp)
            .catch(error => console.log(`Can't connect to http://api.akroma.io/addresses/0x848123468D05Aa670Da8b77ee3a6aB8b34aE33A3/transactions.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => avgBT=json.avgBlocktime)
            .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://akroma.io/api/network')
            .then(res => res.json())
            .then (json => msg.channel.send(`• Users •      **${json.data.users}**\n• Nodes •     **${json.data.nodes}**\n• ROI •          **${Math.floor(365*3600000*24/avgBT*2.25/json.data.nodes/50)/1000}%**\n• Locked •    **${json.data.locked} AKA**\n• Rewards • **${json.data.akaTotal} AKA**\n• Last rewards were paid **${timeConverter(lrew_date)}**\n• Install Guide • <https://docs.akroma.io/masternodes/operating-systems/installation-on-linux>`))
            .catch(error => console.log(`Can't connect to https://akroma.io/api/network'.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'mnrewards':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => {
              avgBT=json.avgBlocktime;
              last_blk=json.height[json.height.length-1];
            })
            .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma'.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://api.akroma.io/prices')
            .then(res => res.json())
            .then(json => usdRaw=json.usdRaw)
            .catch(error => console.log(`Can't connect to https://api.akroma.io/prices'.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://akroma.io/api/network')
            .then(res => res.json())
            .then (json => {switch (true) {
            case args[0]===undefined:{switch(true) {
            case last_blk<=300000:
              msg.channel.send('Masternodes are not implemented for the moment. They will be available after block 300000.');
              break;
            case 300000<last_blk && last_blk<=1200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 1200000<last_blk && last_blk<=2200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.25/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.25/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 2200000<last_blk && last_blk<=3200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.5/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.5/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 3200000<last_blk && last_blk<=4200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.6/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.6/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 4200000<last_blk && last_blk<=5200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.5/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.5/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 5200000<last_blk && last_blk<=6200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.4/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.4/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 6200000<last_blk && last_blk<=7200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.3/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.3/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 7200000<last_blk && last_blk<=8200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.2/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.2/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 8200000<last_blk && last_blk<=9200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.1/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.1/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 9200000<last_blk && last_blk<=10200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 10200000<last_blk && last_blk<=11200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.9/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.9/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 11200000<last_blk && last_blk<=12200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.8/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.8/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 12200000<last_blk && last_blk<=13200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.7/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.7/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 13200000<last_blk && last_blk<=14200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.6/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.6/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 14200000<last_blk && last_blk<=15200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.5/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.5/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 15200000<last_blk && last_blk<=16200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.4/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.4/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 16200000<last_blk && last_blk<=17200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.3/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.3/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 17200000<last_blk && last_blk<=18200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.2/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.2/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 18200000<last_blk && last_blk<=19200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.1/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.1/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 19200000<last_blk && last_blk<=20200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 20200000<last_blk && last_blk<=21200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*0.9/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*0.9/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 21200000<last_blk && last_blk<=22200000:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*0.8/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*0.8/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 22200000<last_blk:
              msg.channel.send(`**1** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*0.6/json.data.nodes)/1000} AKA** _(***${Math.floor(3600000*24/avgBT*0.6/json.data.nodes*usdRaw)/1000}$***)_ per **day**.`);
              break;
            }}
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
            default:{switch(true) {
            case last_blk<=300000:
              msg.channel.send('Masternodes are not implemented for the moment. They will be available after block 300000.');
              break;
            case 300000<last_blk && last_blk<=1200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 1200000<last_blk && last_blk<=2200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.25/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.25/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 2200000<last_blk && last_blk<=3200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.5/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.5/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 3200000<last_blk && last_blk<=4200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.6/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.6/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 4200000<last_blk && last_blk<=5200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.5/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.5/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 5200000<last_blk && last_blk<=6200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.4/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.4/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 6200000<last_blk && last_blk<=7200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.3/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.3/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 7200000<last_blk && last_blk<=8200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.2/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.2/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 8200000<last_blk && last_blk<=9200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2.1/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2.1/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 9200000<last_blk && last_blk<=10200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*2/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 10200000<last_blk && last_blk<=11200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.9/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.9/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 11200000<last_blk && last_blk<=12200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.8/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.8/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 12200000<last_blk && last_blk<=13200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.7/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.7/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 13200000<last_blk && last_blk<=14200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.6/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.6/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 14200000<last_blk && last_blk<=15200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.5/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.5/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 15200000<last_blk && last_blk<=16200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.4/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.4/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 16200000<last_blk && last_blk<=17200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.3/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.3/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 17200000<last_blk && last_blk<=18200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.2/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.2/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 18200000<last_blk && last_blk<=19200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*1.1/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*1.1/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 19200000<last_blk && last_blk<=20200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 20200000<last_blk && last_blk<=21200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*0.9/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*0.9/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 21200000<last_blk && last_blk<=22200000:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*0.8/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*0.8/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            case 22200000<last_blk:
              msg.channel.send(`**${args[0]}** masternode(s) will give you approximately **${Math.floor(3600000*24/avgBT*0.6/json.data.nodes*args[0])/1000} AKA** _(***${Math.floor(3600000*24/avgBT*0.6/json.data.nodes*args[0]*usdRaw)/1000}$***)_ per **day**.`);
              break;
            }}}})
            .catch(error => console.log(`Can't connect to https://akroma.io/api/network'.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'epoch':
          fetch('https://stats.akroma.io/akroma')
            .then(res => res.json())
            .then(json => {switch(true) {
            case json.height[json.height.length-1]<=300000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **300001**\n• Epoch change in•  **${Math.floor((300000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 9.00 | 0.00 | 1.00 |  **10.00**  |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 300000<json.height[json.height.length-1] && json.height[json.height.length-1]<=1200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **1200001**\n• Epoch change in•  **${Math.floor((1200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 7.00 | 2.00 | 1.00 |  **10.00**  |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);              break;
            case 1200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=2200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **2200001**\n• Epoch change in•  **${Math.floor((2200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 6.00 | 2.25 | 0.75 |  **9.00**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 2200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=3200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **3200001**\n• Epoch change in•  **${Math.floor((3200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 5.50 | 2.50 | 0.65 |  **8.65**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 3200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=4200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **4200001**\n• Epoch change in•  **${Math.floor((4200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 5.00 | 2.60 | 0.55 |  **8.15**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 4200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=5200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **5200001**\n• Epoch change in•  **${Math.floor((5200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 4.50 | 2.50 | 0.45 |  **7.45**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 5200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=6200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **6200001**\n• Epoch change in•  **${Math.floor((6200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 4.00 | 2.40 | 0.35 |  **6.75**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 6200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=7200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **7200001**\n• Epoch change in•  **${Math.floor((7200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 3.80 | 2.30 | 0.25 |  **6.35**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 7200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=8200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **8200001**\n• Epoch change in•  **${Math.floor((8200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 3.60 | 2.20 | 0.15 |  **5.95**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 8200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=9200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **9200001**\n• Epoch change in•  **${Math.floor((9200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 3.40 | 2.10 | 0.15 |  **5.65**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 9200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=10200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **10200001**\n• Epoch change in•  **${Math.floor((10200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 3.20 | 2.00 | 0.15 |  **5.35**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 10200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=11200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **11200001**\n• Epoch change in•  **${Math.floor((11200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 3.00 | 1.90 | 0.15 |  **5.05**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 11200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=12200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **12200001**\n• Epoch change in•  **${Math.floor((12200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 2.80 | 1.80 | 0.15 |  **4.75**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 12200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=13200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **13200001**\n• Epoch change in•  **${Math.floor((13200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 2.60 | 1.70 | 0.15 |  **4.45**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 13200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=14200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **14200001**\n• Epoch change in•  **${Math.floor((14200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 2.40 | 1.60 | 0.15 |  **4.15**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 14200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=15200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **15200001**\n• Epoch change in•  **${Math.floor((15200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 2.20 | 1.50 | 0.15 |  **3.85**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 15200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=16200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **16200001**\n• Epoch change in•  **${Math.floor((16200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 2.00 | 1.40 | 0.10 |  **3.50**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 16200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=17200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **17200001**\n• Epoch change in•  **${Math.floor((17200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 1.80 | 1.30 | 0.10 |  **3.20**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 17200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=18200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **18200001**\n• Epoch change in•  **${Math.floor((18200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 1.60 | 1.20 | 0.10 |  **2.90**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 18200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=19200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **19200001**\n• Epoch change in•  **${Math.floor((19200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 1.40 | 1.10 | 0.10 |  **2.60**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 19200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=20200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **20200001**\n• Epoch change in•  **${Math.floor((20200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 1.20 | 1.00 | 0.10 |  **2.30**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 20200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=21200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **21200001**\n• Epoch change in•  **${Math.floor((21200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 1.00 | 0.90 | 0.10 |  **2.00**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 21200000<json.height[json.height.length-1] && json.height[json.height.length-1]<=22200000:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• Next epoch start block•  **22200001**\n• Epoch change in•  **${Math.floor((22200000-json.height[json.height.length-1])*json.avgBlocktime/86.4)/1000} Days**\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 1.00 | 0.80 | 0.10 |  **1.90**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            case 22200000<json.height[json.height.length-1]:
              msg.channel.send(`• Block height•  **${json.height[json.height.length-1]+1}**\n• This is the last epoch •\n\n--------- Block reward --------\n| Mnr  |  Mn  | Dev  |       **T**      |\n---------------------------------\n| 0.08 | 0.60 | 0.05 |  **0.73**   |\n---------------------------------\n• **Monetary policy** •\n<https://medium.com/akroma/akroma-coin-supply-5cb692a77e1b>`);
              break;
            }
            })
            .catch(error => console.log(`Can't connect to https://stats.akroma.io/akroma'.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'exchange':
          switch (cmd1){
          case undefined:
            msg.channel.send('-- `exchange stoc` | **Stocks.Exchange** • <https://app.stocks.exchange/en/basic-trade/pair/BTC/AKA/1D>\n-- `exchange grav` | **Graviex** • <https://graviex.net/markets/akabtc>\n-- `exchange bite` | **BiteBTC** • <https://bitebtc.com/trade/aka_btc>\n\nUse `!exchange [EXCHANGE]` for additional info');
            break;
          case 'stoc':
            fetch('https://app.stocks.exchange/api2/ticker')
              .then(res => res.json())
              .then(json => { if (json[fix].market_name != 'AKA_BTC'){
                for (i=0;i<json.length;i++){
                  if (json[i].market_name == 'AKA_BTC') {fix=i; break;}}
              }
              msg.channel.send('\n• Last price:  **' + json[fix].last +' BTC**\n• 24h Change:  **' + Math.floor((json[fix].last-json[fix].lastDayAgo)/json[fix].lastDayAgo*1000000)/10000 + '%**\n• 24h Max Buy:  **' + json[fix].ask + ' BTC**\n• 24h Min Sell:  **' + json[fix].bid + ' BTC**\n• 24h Volume:  **' + Math.floor(json[fix].vol*1000)/1000 +' AKA** | **' + Math.floor(json[fix].vol*json[fix].last*1000)/1000 + ' BTC**\n');
              })
              .catch(error => console.log(`Can't connect to https://app.stocks.exchange/api2/ticker'.\nError: \n-----------\n${error}\n-----------`));
            break;
          case 'grav':
            fetch('https://graviex.net/api/v2/tickers/akabtc')
              .then(res => res.json())
              .then(json =>
                msg.channel.send(`\n• Last price:  **${json.ticker.last} BTC**\n• 24h Change:  **${Math.floor(json.ticker.change*1000)/1000}%**\n• 24h Max Buy:  **${json.ticker.high} BTC**\n• 24h Min Sell:  **${json.ticker.low} BTC**\n• 24h Volume:  **${Math.floor(json.ticker.vol*1000)/1000} AKA** | **${Math.floor(json.ticker.volbtc*1000)/1000} BTC**\n`)
              )
              .catch(error => console.log(`Can't connect to https://graviex.net/api/v2/tickers/akabtc'.\nError: \n-----------\n${error}\n-----------`));
            break;
          case 'bite':
            fetch('https://bitebtc.com/api/v1/ticker?market=aka_btc')
              .then(res => res.json())
              .then(json =>
                msg.channel.send(`\n• Last price:  **${json.result.price} BTC**\n• 24h Change:  **${json.result.percent}%**\n• 24h Max Buy:  **${json.result.high} BTC**\n• 24h Min Sell:  **${json.result.low} BTC**\n• 24h Volume:  **${json.result.volume} AKA**\n`)
              )
              .catch(error => console.log(`Can't connect to https://bitebtc.com/api/v1/ticker?market=aka_btc'.\nError: \n-----------\n${error}\n-----------`));
            break;
          default:
            msg.channel.send('Maybe you wanted to write `!exchange` or `!exchange [EXCHANGE]`?');
          }
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
            }})
            .catch(error => console.log(`Can't connect to https://api.akroma.io/prices'.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'coininfo':
          fetch('https://api.coinmarketcap.com/v2/ticker/1/')
            .then(res => res.json())
            .then(json => cmc_btc = json)
            .catch(error => console.log(`Can't connect to https://api.coinmarketcap.com/v2/ticker/1/.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://akroma.io/api/network')
            .then(res => res.json())
            .then(json => nodes_stats = json)
            .catch(error => console.log(`Can't connect to https://akroma.io/api/network.\nError: \n-----------\n${error}\n-----------`));
          fetch('https://api.coinmarketcap.com/v2/ticker/3151/')
            .then(res => res.json())
            .then(json => msg.channel.send(`• Current Price•          **${Math.floor(json.data.quotes.USD.price/cmc_btc.data.quotes.USD.price*10000000)/10000000} BTC** | **${Math.floor(json.data.quotes.USD.price*1000)/1000}$**\n• 24h Volume •           **${Math.floor(json.data.quotes.USD.volume_24h/cmc_btc.data.quotes.USD.price*100)/100} BTC** | **${Math.floor(json.data.quotes.USD.volume_24h)}$**\n• Market Cap•             **${Math.floor(json.data.quotes.USD.market_cap)}$**\n• Circulating Supply• **${Math.floor(json.data.circulating_supply)} AKA**\n• Locked Coins•          **${nodes_stats.data.locked} AKA**\n• 24h Change•            **${json.data.quotes.USD.percent_change_24h}%**\n`))
            .catch(error => console.log(`Can't connect to https://api.coinmarketcap.com/v2/ticker/3151/.\nError: \n-----------\n${error}\n-----------`));
          break;
        case 'pool':
          switch (cmd1){
          case undefined:
            msg.channel.send('-- `!pool comi` | Comining.io <https://comining.io/>\n-- `!pool vipo` | Vipool <http://aka.vipool.net/>\n-- `!pool mine` | Minerpool.net <http://akroma.minerpool.net/>\n-- `!pool cryp` | Cryptopools.info <https://akroma.cryptopools.info/>\n-- `!pool akro` | Mining.Akroma <http://mining.akroma.org/>\n-- `!pool clon` | Clona <http://clona.ru/>\n-- `!pool sign` | Signal2noi <http://aka.signal2noi.se/>\n-- `!pool afun` | MiningPool.fun <http://akroma.miningpool.fun/>\n-- `!pool warl` | CryptoWarlords <http://akroma.cryptowarlords.net/>\n-- `!pool aika` | AikaPool <https://aikapool.com/>\n-- `!pool sexy` | Pool Sexy <http://aka.pool.sexy/>\n-- `!pool fair` | FairPool <http://aka.fairpool.xyz/>\n-- `!pool 2mnr` | 2Miners <https://2miners.com/aka-mining-pool>\n-- `!pool solo` | SoloPool <https://aka.solopool.org/>\n-- `!pool bylt` | Bylt.gq <https://akroma.bylt.gq/>\n-- `!pool pfun` | Poolfun.ru <http://poolfun.ru/>\n-- `!pool unit` | Unitystreams Akroma Pool <https://akromapool.unitystreams.com/>\n-- `!pool cube` | CubePool <https://akroma.cubepool.eu/>\n-- `!pool baik` | BaikalMine <http://pool.baikalmine.com/en/aka/>\n\nUse `!pool [POOL]` for specific mining details\n_Please spread the hashpower across all pools._');
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
          case 'sign':
            msg.channel.send('```prolog\nSignal2noi Pool connection info.```\nWebsite: <http://aka.signal2noi.se/>\nDefault port: `8008`\nDefault server: `aka.signal2noi.se`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethdcrminer64 -epool aka.signal2noi.se:8008 -ewal [ADDRESS].[WORKER] -epsw x -mode 1 -allcoins 1\nPhoenixMiner -pool aka.signal2noi.se:8008 -wal [ADDRESS].[WORKER] -pass x -log 0 -coin akroma```');
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
          case 'fair':
            msg.channel.send('```prolog\nFairPool connection info.```\nWebsite: <https://aka.fairpool.xyz/>\nDefault port: `2222`\nDefault server: `mine.aka.fairpool.xyz`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```ethminer.exe -S mine.aka.fairpool.xyz:2222 -O <YOUR_AKA_ADDRESS>+<WORKER_NAME>:x -SC 1 -SP 2 -U\nsgminer -k ethash -o stratum+tcp://mine.aka.fairpool.xyz:2222 -u <YOUR_AKA_ADDRESS>.<WORKER_NAME> -p x -X 1024 -w 192 -g 1\nEthDcrMiner64.exe -epool mine.aka.fairpool.xyz:2222 -ewal <YOUR_AKA_ADDRESS>.<WORKER_NAME> -epsw x -esm 3 -allcoins 1```');
            break;
          case '2mnr':
            msg.channel.send('```prolog\n2Miners Pool connection info.```\nWebsite: <https://2miners.com/aka-mining-pool>\nDefault port: `5050`\nDefault server: `aka.2miners.com`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool aka.2miners.com:5050 -allcoins etc -allpools 0 -eworker RIG_ID -ewal YOUR_ADDRESS -epsw x```');
            break;
          case 'solo':
            msg.channel.send('```prolog\nSoloPool connection info.```\nWebsite: <https://aka.solopool.org/>\nDefault port: `8013`\nDefault server: `s2.solopool.org`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -allcoins 1 -epool s2.solopool.org:8013 -ewal [ADDRESS] -epsw x -eworker [RIG_ID]```');
            break;
          case 'bylt':
            msg.channel.send('```prolog\nBylt.Gq Pool connection info.```\nWebsite: <https://akroma.bylt.gq/>\nDefault port: `8008`\nDefault server: `akroma.bylt.gq`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool akroma.bylt.gq:8008 -esm 0 -ewal <address> -eworker <worker> -allcoins 1 -allpools 1```');
            break;
          case 'pfun':
            msg.channel.send('```prolog\nPoolfun.Ru connection info.```\nWebsite: <http://poolfun.ru/>\nLow difficulty (<100Mh/s): `4092`\nMedium difficulty(100-200Mh/s): `4094`\nHigh difficulty (>200Mh/s): `4096`\nNicehash: `4098`\nDefault server: `aka.poolfun.ru`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool aka.poolfun.ru:4092 -ewal <wallet_address> -epsw x -eworker <rig_name> -allcoins 1```');
            break;
          case 'unit':
            msg.channel.send('```prolog\nUnitySteams Akroma Pool connection info.```\nWebsite: <https://akromapool.unitystreams.com/>\nHigh difficulty (150-300Mh/s): `16008`\nMedium difficulty (60-100Mh/s): `16007`\nLow difficulty (<60Mh/s): `16010`\nMedium nicehash (100-800Mh/s): `16004`\nHigh nicehash (>800Mh/s): `16009`\nDefault server: `server2.unitystreams.com`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```Pheonixminer.exe -pool server2.unitystreams.com:16008 -wal <address> -amd -clNew 1\nEthDcrMiner64.exe -epool stratum+tcp://server2.unitystreams.com:16008 -wal <address> -eworker <your_rig> -allcoins 1```');
            break;
          case 'cube':
            msg.channel.send('```prolog\nCubePool connection info.```\nWebsite: <https://akroma.cubepool.eu/>\nLow difficulty (2b): `7002`\nMedium difficulty (4b): `7004`\nHigh difficulty/nicehash (8b): `7008`\nDefault server: `akroma.cubepool.eu`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool stratum+tcp://akroma.cubepool.eu:7002 -ewal YOUR_WALLET_ADDRESS -epsw x -allpools 1 -esm 0 -mport 0 -eworker YOUR_WORKER_NAME\nPhoenixMiner.exe -pool stratum+tcp://akroma.cubepool.eu:7004 -wal YOUR_WALLET_ADDRESS -pass x -worker YOUR_WORKER_NAME```');
            break;
          case 'baik':
            msg.channel.send('```prolog\nBaikalMine Pool connection info.```\nWebsite: <http://pool.baikalmine.com/en/aka/>\nDefault port: `3344`\nDefault server: `aka.baikalmine.com`\n\nTo mine Akroma u can use any Ethash miner.\n**Examples:**\n```EthDcrMiner64.exe -epool aka.baikalmine.com:3344 -ewal [ADRESS] -epsw x -allcoins 47 -gser 2 -eworker [RIG_ID]```');
            break;
          default:
            msg.channel.send('Unrecognized pool. Please check again.');
          }
          break;
        default:
          msg.channel.send('Command not recognized. `!help` to get a list of commands.');
        }
      }
      else msg.channel.send(`Beep beep... oooh a young one! Please try to speak with me in ${'<#440132389986107392>'} channel or you can wisper me your secrets...`);
    }
  }
});

client.login(auth.token)
  .catch(error => console.log(`Can't login into discord due to ${error}`));
