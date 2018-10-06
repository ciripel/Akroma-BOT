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
        args = msg.content[1:].split(" ")
        if args[0].lower() == ("help"):
            message = "\n".join(data["help"])
        elif args[0].lower() == ("links"):
            message = "\n".join(data["links"])
        elif args[0].lower() == ("roadmap"):
            message = f"{data['roadmap']}"
        elif args[0].lower() == ("awesome"):
            message = f"{data['awesome']}"
        elif args[0].lower() == ("about"):
            message = "\n".join(data["about"])
        else:
            if msg.content[0] == BOT_PREFIX:
                message = f"{data['unknown']}"
    else:
        if msg.content[0] == BOT_PREFIX:
            message = f"{data['default']}"

    await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
