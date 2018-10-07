#!/usr/bin/env python3
# Work with Python 3.6

import json

import discord
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

    # Bot runs in #akroma-bot channel and private channels for everyone
    # Bot runs in all channels for specific roles
    if (
        not (
            msg.channel.name == "akroma-bot"
            or msg.channel.type == discord.ChannelType.private
            or "Core-Team" in [role.name for role in msg.author.roles]
            or "Support-Team" in [role.name for role in msg.author.roles]
            or "Contributors" in [role.name for role in msg.author.roles]
        )
        and msg.content[0] == BOT_PREFIX
    ):
        message = f"{data['default']}"
        await client.send_message(msg.channel, message)
        return

    args = msg.content[1:].split(" ")
    cmd = args[0].lower()
    if cmd == ("help"):
        message = "\n".join(data["help"])
        await client.send_message(msg.channel, message)
    elif cmd == ("links"):
        message = "\n".join(data["links"])
        await client.send_message(msg.channel, message)
    elif cmd == ("roadmap"):
        message = f"{data['roadmap']}"
        await client.send_message(msg.channel, message)
    elif cmd == ("awesome"):
        message = f"{data['awesome']}"
        await client.send_message(msg.channel, message)
    elif cmd == ("about"):
        message = "\n".join(data["about"])
        await client.send_message(msg.channel, message)
    elif cmd == ("netinfo"):
        avgBT = getAverageBlockTime(6500)
        lastblock = w3.eth.blockNumber
        message = (
            f"• Block Height• **{format(lastblock, ',')}**\n• Avg"
            + f" Block Time• **{round(avgBT, 4)} s**\n"
        )
        await client.send_message(msg.channel, message)
    else:
        if msg.content[0] == BOT_PREFIX:
            message = f"{data['unknown']}"
            await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
