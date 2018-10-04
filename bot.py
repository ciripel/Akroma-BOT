# Work with Python 3.6

import discord
import json

with open('auth.json') as data_file:
    data = json.load(data_file)

TOKEN = data['token']

client = discord.Client()


@client.event
async def on_message(message):
    # we do not want the bot to reply to itself
    if message.author == client.user:
        return

    if message.content.startswith('!'):
        msg = 'Hello {0.author.mention}'.format(message)
        await client.send_message(message.channel, msg)


@client.event
async def on_ready():
    print('Logged in as: {0}'.format(client.user.name))

client.run(TOKEN)
