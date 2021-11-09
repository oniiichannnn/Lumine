const Discord = require("discord.js")
const { Client, Message, MessageEmbed, TextChannel } = require("discord.js")

const client    = new Client({ 
    intents: [ Discord.Intents.FLAGS.GUILDS , Discord.Intents.FLAGS.GUILD_MESSAGES , Discord.Intents.FLAGS.GUILD_MEMBERS , Discord.Intents.FLAGS.GUILD_BANS , Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS , Discord.Intents.FLAGS.GUILD_PRESENCES ],
    partials: ["MESSAGE","CHANNEL","REACTION","USER","GUILD_MEMBER"],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
})

const ms = require("ms")

let     rolledCharacters    = []
let     isDailyRolls        = false
const   MudaeId             = "432610292342587392"
const   TOKEN               = process.env.TOKEN
const   mudaeChannelId      = "879154422758932500"
const   tokenUserId         = "879337112024018978"

client.on ( "ready", async () => {
    await sendMessage ("$dk", TOKEN, mudaeChannelId)
    await Roll()

    setInterval(async () => {
        await Roll()

        await sendMessage ("$dk", TOKEN, mudaeChannelId)
        await sendMessage ("$daily", TOKEN, mudaeChannelId)
    }, ms("1 hour"));
})

client.on ( "messageReactionAdd", async message => {
    checkReactedMessage(message)
} )

client.on ("messageCreate", async message => {
    addCharacter(message)
    checkIsClaimDaily(message)
})

async function wait (ms) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res(true)
        }, ms);
    })
}

async function Roll () {
    const mudaeChannelId = "879154422758932500"
    const maxRollAmount = 10
    const tokenUserId = "879337112024018978"

    const rollCommand = "$w"

    for (var i = 0 ; i < maxRollAmount ; i++) {
        if (i !== 0) { await wait(2000) }

        await sendMessage(rollCommand, TOKEN, mudaeChannelId)
    }

    let sortedRolledCharacters = rolledCharacters.sort((a, b) => b.kakeraValue - a.kakeraValue)
    let currentReactCharacterIndex = 0

    if (sortedRolledCharacters[0].kakeraValue < 120 && isDailyRolls) {
        await refreshRoll()

        rolledCharacters = []

        for (var i = 0 ; i < maxRollAmount ; i++) {
            if (i !== 0) { await wait(2000) }
    
            await sendMessage(rollCommand, TOKEN, mudaeChannelId)
        }

        sortedRolledCharacters = rolledCharacters.sort((a, b) => b.kakeraValue - a.kakeraValue)
        currentReactCharacterIndex = 0
        
        isDailyRolls = false
    }

    await claimCharacter()

    async function claimCharacter () {
        try {
            await react(sortedRolledCharacters[currentReactCharacterIndex].messageId)

            rolledCharacters = []
            return
        } catch {
            currentReactCharacterIndex = currentReactCharacterIndex + 1
            
            if (currentReactCharacterIndex > maxRollAmount) {
                return
            } else {
                await claimCharacter()
            }
        }
    }

    async function refreshRoll () {
        return await sendMessage("$rolls", TOKEN, mudaeChannelId)
    }
}

/**
 * @param { Message } message 
*/
function checkReactedMessage (message) {
    if (message.author.id === MudaeId) {
        if (message.embeds[0] && message.embeds[0].description) {
            const Data = getData(message.embeds[0])
            if (Data === null) return

            if (rolledCharacters.find(character => character.messageId === message.id)){
                rolledCharacters.splice(
                    rolledCharacters.findIndex(character => character.messageId === message.id), 1
                )
            }
        }
    }
}

/**
 * @param { Message } message 
*/
function addCharacter (message) {
    if (message.author.id === MudaeId) {

        if (message.embeds[0] && message.embeds[0].description) {
            const Data = getData(message.embeds[0])
            if (Data === null) return

            rolledCharacters.push({
                name        : Data.name,
                claimRank   : Data.claimRank,
                likeRank    : Data.likeRank,
                kakeraValue : Data.kakeraValue,
                messageId   : message.id
            })
        }
    }
}

async function sendMessage  (content, token, channelId) {
    if (!content) return    console.log("[X] Send Message - No content provided")
    if (!token) return      console.log("[X] Send Message - No token provided")
    if (!channelId) return  console.log("[X] Send Message - No channel id provided")

    return await fetch.post(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": token,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": `https://discord.com/channels/@me/${channelId}`,
        "referrerPolicy": "no-referrer-when-downgrade",
        "body": JSON.stringify({
            "content": content,
            "nonce": "",
            "tts": false,
        }),
        "mode": "cors"
    })
}

async function react    (messageId, token, channelId) {
    if (!messageId) return  console.log("[X] React - No message ID provided")
    if (!token) return      console.log("[X] React - No token provided")
    if (!channelId) return  console.log("[X] React - No channel id provided")

    return await fetch.put(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/%E2%9D%A4%EF%B8%8F/%40me`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": token,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": `https://discord.com/channels/@me/${channelId}`,
        "referrerPolicy": "no-referrer-when-downgrade",
        "mode": "cors"
    })
}

async function unreact  (messageId, token, channelId) {
    if (!messageId) return  console.log("[X] Unreact - No message ID provided")
    if (!token) return      console.log("[X] Unreact - No token provided")
    if (!channelId) return  console.log("[X] Unreact - No channel id provided")

    return await fetch.delete(`https://discord.com/api/v9/channels/${channelId}/messages/${messageId}/reactions/%E2%9D%A4%EF%B8%8F/%40me`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US",
            "authorization": token,
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": `https://discord.com/channels/@me/${channelId}`,
        "referrerPolicy": "no-referrer-when-downgrade",
        "mode": "cors"
    })
}

/**
 * @param { MessageEmbed } embed 
*/
function getData (embed) {
    const description = embed.description
    const [ name, claims, likes, kakera ] = description.split("\n")

    if (!name || !claims || !likes || !kakera) return null

    return {
        name        : name,
        claimRank   : Number(claims.split("#")[1]),
        likeRank    : Number(likes.split("#")[1]),
        kakeraValue : Number(kakera.split("**")[1])
    }
}

/**
 * @param { Discord.MessageReaction } reaction
 * @param { Discord.User } user
*/
async function checkIsClaimDaily (reaction, user) {
    if (reaction.partial)           reaction            = await reaction.fetch()
    if (reaction.message.partial)   reaction.message    = await reaction.message.fetch()

    if (reaction.message.content.startsWith("$daily") && reaction.message.author.id === tokenUserId && user.id === MudaeId) {
        isDailyRolls = true
    }
}

const express   = require("express")
const app       = express()

app.get("/", ( req,res ) => { res.send("Online")            })
app.listen(4000, () =>      { console.log("Keep alived")    })
client.login("ODkyMTAyNzc3MjA2MDgzNjA1.YVIBdA.g1iOhyOjsPtOULPBTwW8sonmFXg")