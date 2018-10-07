# Work with Python 3.6

import json

import discord
from discord.ext.commands import Bot
from web3 import HTTPProvider, Web3

with open("auth.json") as data_file:
    auth = json.load(data_file)
with open("links.json") as data_file:
    data = json.load(data_file)

TOKEN = auth["token"]
BOT_PREFIX = "?"

client = Bot(BOT_PREFIX)


# localserver = HTTPProvider(data["localserver"])
remoteserver = HTTPProvider(data["remoteserver"])
remoteserver1 = HTTPProvider(data["remoteserver1"])
remoteserver2 = HTTPProvider(data["remoteserver2"])
w3 = Web3([remoteserver, remoteserver1, remoteserver1])
# print(f"Current provider {w3.currentProvider}")
lastblock = w3.eth.blockNumber
actualtime = w3.eth.getBlock(lastblock).timestamp
print(f"Latest block is: {lastblock}:{actualtime}")

"""
function getAverageBlockTime(blocks){
  return web3.eth.getBlockNumber().then(result=> {
    var pr1=web3.eth.getBlock(result)
    var pr2=web3.eth.getBlock(result - blocks)
    return Promise.all([pr1, pr2]).then(result=> {
      var timestamps=[result[0].timestamp, result[1].timestamp]
      var Average_BT=(timestamps[0] - timestamps[1]) / (blocks - 1)
      return Average_BT
        })
      .catch(err= > console.log(`Something broke: ${err}`))
      })
    .catch(err=> console.log(`Something broke: ${err}`))
}
"""


def getAverageBlockTime(blocks):
    lastblock = w3.eth.blockNumber
    now = w3.eth.getBlock(lastblock).timestamp
    before = w3.eth.getBlock(lastblock - blocks).timestamp
    Average_BT = (now - before) / (blocks - 1)
    return Average_BT


@client.event
async def on_message(msg):

    # We do not want the bot to respond to Bots or Webhooks
    if msg.author.bot:
        return

    # Bot runs in #akroma-bot channel and private channels for everyone
    # Bot runs in all channels for specific roles
    check = (
        msg.channel.name == "akroma-bot"
        or msg.channel.type == discord.ChannelType.private
        or "Core-Team" in [role.name for role in msg.author.roles]
        or "Support-Team" in [role.name for role in msg.author.roles]
        or "Contributors" in [role.name for role in msg.author.roles]
    )

    if check:
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

    else:
        if msg.content[0] == BOT_PREFIX:
            message = f"{data['default']}"
            await client.send_message(msg.channel, message)


@client.event
async def on_ready():
    print(f"Logged in as: {client.user.name} {{{client.user.id}}}")


client.run(TOKEN)
