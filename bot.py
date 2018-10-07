#!/usr/bin/env python3
# Work with Python 3.6

import json

import discord
from discord.ext.commands import Bot
from requests import get
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
    if cmd == ("help"):
        message = "\n".join(data["help"])
    elif cmd == ("links"):
        message = "\n".join(data["links"])
    elif cmd == ("roadmap"):
        message = f"{data['roadmap']}"
    elif cmd == ("awesome"):
        message = f"{data['awesome']}"
    elif cmd == ("about"):
        message = "\n".join(data["about"])
    elif cmd == "members":
        if msg.channel.type != discord.ChannelType.private and "Core-Team" in [
            role.name for role in msg.author.roles
        ]:
            members = msg.author.server.member_count
            message = f"{members}"
        else:
            message = f"{data['unknown']}"
    elif cmd == ("netinfo"):
        avg_bt = getAverageBlockTime(6500)
        last_block = w3.eth.blockNumber
        minerpools = get(data["pool_api"])
        pool_api = minerpools.json()
        diff = pool_api["nodes"][0]["difficulty"]
        message = (
            f"• Block Height• **{format(last_block, ',')}**\n• Avg"
            + f" Block Time• **{round(avg_bt, 2)} s**\n• Network Difficulty• *"
            + f"*{round(int(diff)/(10**10), 2)} Th**"
        )
    else:
        message = f"{data['unknown']}"

    await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
