#!/usr/bin/env python3
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
BOT_PREFIX = "?"

client = Bot(BOT_PREFIX)


class FrateHTTPProvider(HTTPProvider):
    def make_request(self, method, params):
        try:
            response = super().make_request(method, params)
        except Exception as e:
            raise CannotHandleRequest
        return response


w3 = Web3(
    [
        FrateHTTPProvider(data[server])
        for server in ("localserver", "remoteserver1", "remoteserver", "remoteserver2")
    ]
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

    # Bot checks BOT_PREFIX
    if msg.content:
        if msg.content[0] != BOT_PREFIX:
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

    args = msg.content[1:].split(" ")
    cmd = args[0].lower()
    if cmd == "help":
        message = "\n".join(data["help"])
    elif cmd == "links":
        message = "\n".join(data["links"])
    elif cmd == "roadmap":
        message = f"{data['roadmap']}"
    elif cmd == "awesome":
        message = f"{data['awesome']}"
    elif cmd == "about":
        message = "\n".join(data["about"])
    elif cmd == "members":
        if msg.channel.type != discord.ChannelType.private and "Core-Team" in [
            role.name for role in msg.author.roles
        ]:
            members = msg.author.server.member_count
            message = f"{members}"
        else:
            message = f"{data['unknown']}"
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
            f"• Block Height• **{format(last_block, ',')}**\n• Avg"
            + f" Block Time• **{round(avg_bt, 2)} s**\n• Network Hashrate• **"
            + f"{hashrate} GH/s**\n• Network Difficulty• **{diff} Th**"
        )
    elif cmd == "hpow":
        return
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
            if float(data["epoch"]["limit"][x]) <= last_block and last_block < float(
                data["epoch"]["limit"][x + 1]
            ):
                roi_value = (
                    365
                    * 36
                    * 10 ** 5
                    * 24
                    / avg_bt
                    * float(data["epoch"]["mn"][x])
                    / total_nodes
                    / (5 * 10 ** 4)
                )
                message = (
                    f"• Users •**{total_users:23.0f}**\n• Remote Nodes •**"
                    + f"{remote_nodes:3.0f}**\n• Full Nodes •**{full_nodes:14.0f}**\n"
                    + f"• Boot Nodes •**{boot_nodes:10.0f}**\n• Balefire Nodes •**"
                    + f"{balefire_nodes:3.0f}**\n• Total Nodes •**{total_nodes:11.0f}"
                    + f"**\n• ROI •**{roi_value:30.3f}%**\n• Locked •                "
                    + f"**{total_locked} AKA**\n• Rewards •             **{total_paid}"
                    + f" AKA**\n{guide_link}"
                )
    elif cmd == "mnrewards":
        return
    elif cmd == "epoch":
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        for x in range(len(data["epoch"]["limit"])):
            if float(data["epoch"]["limit"][x]) <= last_block and last_block < float(
                data["epoch"]["limit"][x + 1]
            ):
                total = (
                    float(data["epoch"]["mnr"][x])
                    + float(data["epoch"]["mn"][x])
                    + float(data["epoch"]["dev"][x])
                )
                time_left = (
                    (float(data["epoch"]["limit"][x + 1]) - last_block - 1)
                    * avg_bt
                    / 86.4
                    / 10 ** 3
                )
                message = (
                    f"{data['epoch']['bh']}{last_block}{data['epoch']['nesb']}"
                    + f"{float(data['epoch']['limit'][x+1])+1}"
                    + f"{data['epoch']['ech']}{time_left:10.3f}"
                    + f"{data['epoch']['brew']}{data['epoch']['mnr'][x]:5.2f} |"
                    + f"{data['epoch']['mn'][x]:5.2f} |"
                    + f"{data['epoch']['dev'][x]:5.2f} |  **{total:5.2f}  "
                    + f"{data['epoch']['policy']}"
                )
    elif cmd == "exchange":
        return
    elif cmd == "akausd":
        async with get(data["cmc"]["cmc_aka"]) as cmc_aka:
            if cmc_aka.status == 200:
                cmc_aka_api = await cmc_aka.json()
            else:
                print(f"{data['cmc']['cmc_aka']} is down")
        aka_usd_price = cmc_aka_api["data"]["quotes"]["USD"]["price"]
        if len(args) < 2:
            message = f"_The price of ***1 AKA*** is ***{round(aka_usd_price, 2)}$***._"
            await client.send_message(msg.channel, message)
            return
        cmd1 = args[1].lower()
        if not is_number(cmd1):
            message = f"_The price of ***1 AKA*** is ***{round(aka_usd_price, 2)}$***._"
        elif cmd1 == "0":
            message = "Welcome young one! We have all started with **0 AKA** zilionsof aeons ago!"
        elif is_number(cmd1) and float(cmd1) < 0:
            message = "Hmm! Yup! I feel sorry for you! You owe **AKA**... I feel your pain friend!"
        elif is_number(cmd1):
            message = (
                f"**{cmd1} AKA** = **{round(float(aka_usd_price)*float(cmd1),2)}$**"
                + f"\n_The price of ***1 AKA*** is ***{round(aka_usd_price, 2)}$***_"
            )

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
            f"• Current Price•**{aka_usd_price/btc_usd_price:22.8f} BTC ** | **"
            + f"{aka_usd_price:8.4f}$**\n• 24h Volume •**"
            + f"{aka_24vol/btc_usd_price:18.3f} BTC ** | **{aka_24vol:10.2f}$**"
            + f"\n• Market Cap•**{aka_mcap:21.0f}$**\n• Circulating Supply• **"
            + f"{aka_circ_supply:10.0f} AKA **\n• Locked Coins•            **"
            + f"{total_locked} AKA **\n• 24h Change•**{aka_24change:19.2f} % **"
        )
    elif cmd == "pool":
        return
    else:
        message = f"{data['unknown']}"

    await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
