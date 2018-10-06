# Work with Python 3.6

import json

import discord
from discord.ext.commands import Bot

with open("auth.json") as data_file:
    auth = json.load(data_file)
with open("links.json") as data_file:
    data = json.load(data_file)

TOKEN = auth["token"]
BOT_PREFIX = "?"

client = Bot(BOT_PREFIX)


@client.event
async def on_message(msg):
    m = msg.content.lower()
    check = (
        msg.channel.name == "akroma-bot"
        or msg.channel.type == discord.ChannelType.private
        or "Core-Team" in [role.name for role in msg.author.roles]
        or "Support-Team" in [role.name for role in msg.author.roles]
        or "Contributors" in [role.name for role in msg.author.roles]
    )
    # we do not want the bot to reply to itself
    if msg.author == client.user:
        return
    if check:
        if m.startswith("?help"):
            message = "\n".join(data["help"])
            await client.send_message(msg.channel, message)
        elif m.startswith("?links"):
            message = "\n".join(data["links"])
            await client.send_message(msg.channel, message)
        elif m.startswith("?roadmap"):
            message = f"{data['roadmap']}"
            await client.send_message(msg.channel, message)
        elif m.startswith("?awesome"):
            message = f"{data['awesome']}"
            await client.send_message(msg.channel, message)
        elif m.startswith("?about"):
            message = "\n".join(data["about"])
            await client.send_message(msg.channel, message)
    else:
        message = f"{data['default']}"
        await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
