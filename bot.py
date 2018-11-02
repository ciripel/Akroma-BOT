#!/usr/bin/env python3.6
# Work with Python 3.6

import json

import discord
from aiohttp import get
from discord.ext.commands import Bot
from web3 import HTTPProvider, Web3
from web3.exceptions import CannotHandleRequest

with open("auth.json") as data_file:
    auth = json.load(data_file)
with open("links.json") as data_file:
    data = json.load(data_file)

TOKEN = auth["token"]
BOT_PREFIX = "!"

client = Bot(BOT_PREFIX)


class FrateHTTPProvider(HTTPProvider):
    def make_request(self, method, params):
        try:
            response = super().make_request(method, params)
        except Exception as e:
            raise CannotHandleRequest
        return response


w3 = Web3(
    [FrateHTTPProvider(data[server]) for server in ("localserver", "remoteserver1", "remoteserver", "remoteserver2")]
)


def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False


def getAverageBlockTime(blocks):
    last_block = w3.eth.blockNumber
    now = w3.eth.getBlock(last_block).timestamp
    before = w3.eth.getBlock(last_block - blocks).timestamp
    average_bt = (now - before) / (blocks - 1)
    return average_bt


@client.event
async def on_message(msg):
    # We do not want the bot to respond to Bots or Webhooks
    if msg.author.bot:
        return
    # We want the bot to not answer to messages that have no content
    # (example only attachment messages)
    # Bot checks BOT_PREFIX
    if not msg.content or msg.content[0] != BOT_PREFIX:
        return
    # Bot ignore all system messages
    if msg.type is not discord.MessageType.default:
        return

    # Bot runs in #akroma-bot channel and private channels for everyone
    # Bot runs in all channels for specific roles
    if not (
        msg.channel.name == "akroma-bot"
        or msg.channel.type == discord.ChannelType.private
        or "Core-Team" in [role.name for role in msg.author.roles]
        or "Support-Team" in [role.name for role in msg.author.roles]
        or "Contributors" in [role.name for role in msg.author.roles]
    ):
        message = f"{data['default']}"
        await client.send_message(msg.channel, message)
        return

    args = msg.content[1:].split()
    cmd = args[0].lower()
    # -------- <help> --------
    if cmd == "help":
        message = "\n".join(data["help"])
    # -------- <links> --------
    elif cmd == "links":
        message = "\n".join(data["links"])
    # -------- <netinfo> --------
    elif cmd == "netinfo":
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        async with get(data["akroma"]) as akroma:
            if akroma.status == 200:
                akroma_api = await akroma.json()
            else:
                print(f"{data['akroma']} is down")
        diff = akroma_api["difficulty"]
        hashrate = akroma_api["hashRate"]
        message = (
            f"• Block Height• **{last_block:,}**\n• Avg Block Time• **{round(avg_bt, 2)} s**\n• Network Hashrate• **"
            + f"{hashrate} GH/s**\n• Network Difficulty• **{diff} Th**"
        )
    # -------- <mninfo> --------
    elif cmd == "mninfo":
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        async with get(data["network"]["link"]) as network:
            if network.status == 200:
                network_api = await network.json()
            else:
                print(f"{data['network']['link']} is down")
        total_users = network_api["data"]["totalUsers"]
        remote_nodes = network_api["data"]["totalRemote"]
        full_nodes = network_api["data"]["totalFull"]
        boot_nodes = network_api["data"]["totalBoot"]
        balefire_nodes = network_api["data"]["totalBalefire"]
        total_nodes = network_api["data"]["totalNodes"]
        total_locked = network_api["data"]["totalLocked"]
        total_paid = network_api["data"]["totalPaid"]
        guide_link = data["network"]["guide_link"]
        for x in range(len(data["epoch"]["limit"])):
            if (
                float(data["epoch"]["limit"][x]) + 1 <= last_block
                and last_block < float(data["epoch"]["limit"][x + 1]) + 1
            ):
                mn_rew = float(data["epoch"]["mn"][x])
                f_roi_value = 0.6 * 3153600 / avg_bt * mn_rew / full_nodes / 5
                r_roi_value = 0.2 * 3153600 / avg_bt * mn_rew / remote_nodes / 15
                bo_roi_value = 0.2 * 3153600 / avg_bt * mn_rew / boot_nodes / 15
                message = (
                    f"• Users • **{total_users:1.0f}**\n• Masternodes • F: **{full_nodes:1.0f}** | R: **"
                    + f"{remote_nodes:1.0f}** | Bo: **{boot_nodes:1.0f}** | Ba: **{balefire_nodes:1.0f}** | T: **"
                    + f"{total_nodes:1.0f}**\n• ROI • F: **{f_roi_value:1.3f}%** | R: **{r_roi_value:1.3f}%** | Bo: **"
                    + f"{bo_roi_value:1.3f}%** | Ba: **0%**\n• Locked • **{total_locked} AKA**\n• Rewards • **"
                    + f"{total_paid} AKA**\n{guide_link}"
                )
    # -------- <hpow> --------
    elif cmd == "hpow":
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        async with get(data["cmc"]["cmc_aka"]) as cmc_aka:
            if cmc_aka.status == 200:
                cmc_aka_api = await cmc_aka.json()
            else:
                print(f"{data['cmc']['cmc_aka']} is down")
        aka_usd_price = float(cmc_aka_api["data"]["quotes"]["USD"]["price"])
        async with get(data["akroma"]) as akroma:
            if akroma.status == 200:
                akroma_api = await akroma.json()
            else:
                print(f"{data['akroma']} is down")
        diff = float(akroma_api["difficulty"])
        if len(args) < 2:
            message = f"{data['hpow']['default']}"
            await client.send_message(msg.channel, message)
            return
        cmd1 = args[1].lower()
        if not is_number(cmd1):
            message = f"{data['hpow']['default']}"
        elif cmd1 == "0":
            message = f"{data['hpow']['zero']}"
        elif is_number(cmd1) and float(cmd1) < 0:
            message = f"{data['akausd']['neg']}"
        elif is_number(cmd1):
            for x in range(len(data["epoch"]["limit"])):
                if (
                    float(data["epoch"]["limit"][x]) + 1 <= last_block
                    and last_block < float(data["epoch"]["limit"][x + 1]) + 1
                ):
                    mnr_rwd = data["epoch"]["mnr"][x]
                    cmd1 = float(cmd1)
                    message = (
                        f"Current network difficulty is **{diff} Th**.\nA hashrate of **{cmd1:1.0f} Mh/s** will get "
                        + f"you approximately **{cmd1/diff*36*mnr_rwd/avg_bt/10**3:1.2f} AKA** _(***"
                        + f"{cmd1/diff*36*mnr_rwd/avg_bt/10**3*aka_usd_price:1.2f}$***)_ per **hour** and **"
                        + f"{cmd1/diff*36*mnr_rwd*24/avg_bt/10**3:1.2f} AKA** _(***"
                        + f"{cmd1/diff*36*mnr_rwd*24/avg_bt/10**3*aka_usd_price:1.2f}$***)_ per **day** at current "
                        + "network difficulty."
                    )
    # -------- <mnrewards> --------
    elif cmd == "mnrewards":
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        async with get(data["cmc"]["cmc_aka"]) as cmc_aka:
            if cmc_aka.status == 200:
                cmc_aka_api = await cmc_aka.json()
            else:
                print(f"{data['cmc']['cmc_aka']} is down")
        aka_usd_price = float(cmc_aka_api["data"]["quotes"]["USD"]["price"])
        async with get(data["network"]["link"]) as network:
            if network.status == 200:
                network_api = await network.json()
            else:
                print(f"{data['network']['link']} is down")
        remote_nodes = network_api["data"]["totalRemote"]
        full_nodes = network_api["data"]["totalFull"]
        boot_nodes = network_api["data"]["totalBoot"]
        balefire_nodes = network_api["data"]["totalBalefire"]
        if len(args) < 2:
            for x in range(len(data["epoch"]["limit"])):
                if (
                    float(data["epoch"]["limit"][x]) + 1 <= last_block
                    and last_block < float(data["epoch"]["limit"][x + 1]) + 1
                ):
                    mn_rwd = data["epoch"]["mn"][x]
                    message = (
                        f"**1** Full Masternode will give you approximately **"
                        + f"{0.6*3600*24/avg_bt*mn_rwd/full_nodes:1.3f} AKA** _(***"
                        + f"{0.6*3600*24/avg_bt*mn_rwd/full_nodes*aka_usd_price:1.3f}$***)_ per **day**.\n**1** Remote"
                        + f" Masternode will give you approximately **{0.2*3600*24/avg_bt*mn_rwd/remote_nodes:1.3f} AK"
                        + f"A** _(***{0.2*3600*24/avg_bt*mn_rwd/remote_nodes*aka_usd_price:1.3f}$***)_ per **day**.\n*"
                        + f"*1** Boot Masternode will give you approximately **"
                        + f"{0.2*3600*24/avg_bt*mn_rwd/boot_nodes:1.3f} AKA** _(***"
                        + f"{0.2*3600*24/avg_bt*mn_rwd/boot_nodes*aka_usd_price:1.3f}$***)_ per **day**."
                    )
                    await client.send_message(msg.channel, message)
                    return
        cmd1 = args[1].lower()
        if not is_number(cmd1):
            message = f"{data['mnrewards']['default']}"
        elif cmd1 == "0":
            message = f"{data['mnrewards']['zero']}"
        elif is_number(cmd1) and float(cmd1) < 0:
            message = f"{data['mnrewards']['neg']}"
        elif is_number(cmd1):
            for x in range(len(data["epoch"]["limit"])):
                if (
                    float(data["epoch"]["limit"][x]) + 1 <= last_block
                    and last_block < float(data["epoch"]["limit"][x + 1]) + 1
                ):
                    mn_rwd = data["epoch"]["mn"][x]
                    cmd1 = float(cmd1)
                    message = (
                        f"**{cmd1:1.0f}** Full Masternode will give you approximately **"
                        + f"{cmd1*0.6*3600*24/avg_bt*mn_rwd/full_nodes:1.3f} AKA** _(***"
                        + f"{cmd1*0.6*3600*24/avg_bt*mn_rwd/full_nodes*aka_usd_price:1.3f}$***)_ per **day**.\n**"
                        + f"{cmd1:1.0f}** Remote Masternode will give you approximately **"
                        + f"{cmd1*0.2*3600*24/avg_bt*mn_rwd/remote_nodes:1.3f} AKA** _(***"
                        + f"{cmd1*0.2*3600*24/avg_bt*mn_rwd/remote_nodes*aka_usd_price:1.3f}$***)_ per **day**.\n**"
                        + f"{cmd1:1.0f}** Boot Masternode will give you approximately **"
                        + f"{cmd1*0.2*3600*24/avg_bt*mn_rwd/boot_nodes:1.3f} AKA** _(***"
                        + f"{cmd1*0.2*3600*24/avg_bt*mn_rwd/boot_nodes*aka_usd_price:1.3f}$***)_ per **day**."
                    )
    # -------- <akausd> --------
    elif cmd == "akausd":
        async with get(data["cmc"]["cmc_aka"]) as cmc_aka:
            if cmc_aka.status == 200:
                cmc_aka_api = await cmc_aka.json()
            else:
                print(f"{data['cmc']['cmc_aka']} is down")
        aka_usd_price = cmc_aka_api["data"]["quotes"]["USD"]["price"]
        if len(args) < 2:
            message = f"{data['akausd']['default']}{round(aka_usd_price, 3)}$***._"
            await client.send_message(msg.channel, message)
            return
        cmd1 = args[1].lower()
        if not is_number(cmd1):
            message = f"{data['akausd']['default']}{round(aka_usd_price, 3)}$***._"
        elif cmd1 == "0":
            message = f"{data['akausd']['zero']}"
        elif is_number(cmd1) and float(cmd1) < 0:
            message = f"{data['akausd']['neg']}"
        elif is_number(cmd1):
            message = (
                f"**{round(float(cmd1),2):,} AKA** = **{round(float(aka_usd_price)*float(cmd1),2):,}$**\n"
                + f"{data['akausd']['default']}{round(aka_usd_price, 3)}$***_"
            )
    # -------- <roadmap> --------
    elif cmd == "roadmap":
        message = f"{data['roadmap']}"
    # -------- <awesome> --------
    elif cmd == "awesome":
        message = f"{data['awesome']}"
    # -------- <exchange> --------
    elif cmd == "exchange":
        return
    # -------- <pool> --------
    elif cmd == "pool":
        return
    # -------- <epoch> --------
    elif cmd == "epoch":
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        for x in range(len(data["epoch"]["limit"])):
            if (
                float(data["epoch"]["limit"][x]) + 1 <= last_block
                and last_block < float(data["epoch"]["limit"][x + 1]) + 1
            ):
                total = float(data["epoch"]["mnr"][x]) + float(data["epoch"]["mn"][x]) + float(data["epoch"]["dev"][x])
                time_left = (float(data["epoch"]["limit"][x + 1]) - last_block + 1) * avg_bt / 86.4 / 10 ** 3
                message = (
                    f"{data['epoch']['bh']}{last_block}{data['epoch']['nesb']}"
                    + f"{float(data['epoch']['limit'][x+1])+1:1.0f}{data['epoch']['ech']}{time_left:1.3f}"
                    + f"{data['epoch']['brew']}{data['epoch']['mnr'][x]:5.2f} |{data['epoch']['mn'][x]:5.2f} |"
                    + f"{data['epoch']['dev'][x]:5.2f} |  **{total:5.2f}  {data['epoch']['policy']}"
                )
    # -------- <coininfo> --------
    elif cmd == "coininfo":
        async with get(data["network"]["link"]) as network:
            if network.status == 200:
                network_api = await network.json()
            else:
                print(f"{data['network']['link']} is down")
        async with get(data["cmc"]["cmc_btc"]) as cmc_btc:
            if cmc_btc.status == 200:
                cmc_btc_api = await cmc_btc.json()
            else:
                print(f"{data['cmc']['cmc_btc']} is down")
        async with get(data["cmc"]["cmc_aka"]) as cmc_aka:
            if cmc_aka.status == 200:
                cmc_aka_api = await cmc_aka.json()
            else:
                print(f"{data['cmc']['cmc_aka']} is down")
        total_locked = network_api["data"]["totalLocked"]
        aka_usd_price = cmc_aka_api["data"]["quotes"]["USD"]["price"]
        btc_usd_price = cmc_btc_api["data"]["quotes"]["USD"]["price"]
        aka_24vol = cmc_aka_api["data"]["quotes"]["USD"]["volume_24h"]
        aka_mcap = cmc_aka_api["data"]["quotes"]["USD"]["market_cap"]
        aka_circ_supply = cmc_aka_api["data"]["circulating_supply"]
        aka_24change = cmc_aka_api["data"]["quotes"]["USD"]["percent_change_24h"]
        message = (
            f"• Current Price•**{aka_usd_price/btc_usd_price:22.8f} BTC ** | **{aka_usd_price:8.4f}$**\n• 24h Volume •"
            + f"**{aka_24vol/btc_usd_price:18.3f} BTC ** | **{aka_24vol:10.2f}$**\n• Market Cap•**{aka_mcap:21.0f}$**"
            + f"\n• Circulating Supply• **{aka_circ_supply:10.0f} AKA **\n• Locked Coins•            **"
            + f"{total_locked} AKA **\n• 24h Change•**{aka_24change:19.2f} % **"
        )
    # -------- <about> --------
    elif cmd == "about":
        message = "\n".join(data["about"])
    # -------- <members(Core-Team only)> --------
    elif (
        cmd == "members"
        and msg.channel.type != discord.ChannelType.private
        and "Core-Team" in [role.name for role in msg.author.roles]
    ):
        members = msg.author.server.member_count
        message = f"Current number of members: {members}"

    else:
        message = f"{data['unknown']}"

    await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
