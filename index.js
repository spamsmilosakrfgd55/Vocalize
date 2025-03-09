const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Command to create temporary voice channel and move the user into it
client.on('messageCreate', async (message) => {
    // Check if the message is from a bot or doesn't start with the correct prefix
    if (message.author.bot || !message.content.startsWith('!createvoice')) return;

    // Create a new temporary voice channel
    const channelName = `temp-voice-${message.author.username}`;

    try {
        // Create voice channel
        const tempChannel = await message.guild.channels.create(channelName, {
            type: ChannelType.GuildVoice,
            reason: 'Temporary voice channel created by bot',
            userLimit: 10, // Optional: limit the number of users
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['Connect'],
                },
                {
                    id: message.author.id,
                    allow: ['Connect'],
                }
            ]
        });

        // Move the user who created the channel into the new channel
        await message.member.voice.setChannel(tempChannel);
        
        // Inform the user
        message.channel.send(`✅ A temporary voice channel named **${channelName}** has been created and you've been moved there!`);

        // Add event listener to delete channel once empty
        tempChannel.members.forEach((member) => {
            if (member.voice.channel !== tempChannel) {
                tempChannel.delete();
            }
        });

        tempChannel.on('delete', () => {
            message.channel.send(`The temporary channel **${channelName}** has been deleted.`);
        });

    } catch (error) {
        console.error('Error creating voice channel:', error);
        message.channel.send('❌ There was an error creating the channel!');
    }
});

client.login(process.env.DISCORD_TOKEN);
