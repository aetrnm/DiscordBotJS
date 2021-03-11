const Discord = require('discord.js');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Discord.Client({
    partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
});

client.on('ready', () => console.log('The Bot is ready!'));

// Adding reaction-role function
client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    if (reaction.message.channel.id === '818393494309568523') {
        if (reaction.emoji.name === '🦊') {
            await reaction.message.guild.members.cache
                .get(user.id)
                .roles.add('818392023039082516');
        }
        if (reaction.emoji.name === '🐯') {
            await reaction.message.guild.members.cache
                .get(user.id)
                .roles.add('818391986133401600');
        }
        if (reaction.emoji.name === '🐍') {
            await reaction.message.guild.members.cache
                .get(user.id)
                .roles.add('818391955284426774');
        }
    } else return;
});
// Removing reaction roles
client.on('messageReactionRemove', async (reaction, user) => {
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;
    if (reaction.message.channel.id === '818393494309568523') {
        if (reaction.emoji.name === '🦊') {
            await reaction.message.guild.members.cache
                .get(user.id)
                .roles.remove('818392023039082516');
        }
        if (reaction.emoji.name === '🐯') {
            await reaction.message.guild.members.cache
                .get(user.id)
                .roles.remove('818391986133401600');
        }
        if (reaction.emoji.name === '🐍') {
            await reaction.message.guild.members.cache
                .get(user.id)
                .roles.remove('818391955284426774');
        }
    } else return;
});

//Hello command
client.on('message', (msg) => {
    if (msg.content === 'Hello') {
        msg.reply('Hi');
    }
});

//#joke command
const jokes = [
    'I went to a street where the houses were numbered 8k, 16k, 32k, 64k, 128k, 256k and 512k. It was a trip down Memory Lane.',
    '“Debugging” is like being the detective in a crime drama where you are also the murderer.',
    'The best thing about a Boolean is that even if you are wrong, you are only off by a bit.',
    'A programmer puts two glasses on his bedside table before going to sleep. A full one, in case he gets thirsty, and an empty one, in case he doesn’t.',
    'If you listen to a UNIX shell, can you hear the C?',
    'Why do Java programmers have to wear glasses? Because they don’t C#.',
    'What sits on your shoulder and says “Pieces of 7! Pieces of 7!”? A Parroty Error.',
    'When Apple employees die, does their life HTML5 in front of their eyes?',
    'Without requirements or design, programming is the art of adding bugs to an empty text file.',
    'Before software can be reusable it first has to be usable.',
    'The best method for accelerating a computer is the one that boosts it by 9.8 m/s2.',
    'I think Microsoft named .Net so it wouldn’t show up in a Unix directory listing.',
    'There are two ways to write error-free programs; only the third one works.',
];
client.on('message', (msg) => {
    if (msg.content === '#joke') {
        msg.channel.send(jokes[Math.floor(Math.random() * jokes.length)]);
    }
});




const prefix = '#';

let currentSongLink;

let loop = false;

let queue = [];

function changeLoopValue() {
    loop = !loop;
}

function printLoopValue(message) {
    if (loop){
        message.channel.send('loop is now: ***ON***');
        return;
    }
    message.channel.send('loop is now: ***OFF***');
}

function addToQueue(message, link) {
    queue.push(link);
    ytdl(link).on('info', (info) => {
        queueToPrint.push(info.videoDetails.title);
    });
    setTimeout(function(){
        printQueue(message);
    }, 500);
    if(queue.length === 1) {
        play(message).then(() => printLoopValue(message));
    }
}

async function disconnectBot(message){
    if(message.member.voice.channelID === message.guild.me.voice.channelID){
        message.guild.me.voice.channel.leave();
    }
    else {
        message.channel.send('Join a voice channel where the bot is to disconnect it!');
    }
}

async function play(message){
    let link = queue[0];
    currentSongLink = link;
    if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join();
        const dispatcher = connection.play(ytdl(link, { filter: 'audioonly'}));
        dispatcher.on('finish', () => {
            if (loop){              //Playing once more
                play(message);
            }
            else{
                ytdl(link).on('info', (info) => {
                    message.channel.send('Finished playing: ' + '`' + info.videoDetails.title + '`'); // the video title
                });
                playNextSong(message, 0);
            }
        });
    }
    else {
        message.channel.send('Join a voice channel first to play some music!');
    }
}


let queueToPrint = [];

function printQueue(message){
    setTimeout(function(){
        message.channel.send("**Queue:**\r\n" + "`" + queueToPrint.join('\r\n') + "`");
    }, 1100);
}

function playNextSong(message, key) { // 1 to skip, 0 not to
    queue.shift();
    queueToPrint.shift();
    if(queue.length === 0) {
        setTimeout(function(){
            message.channel.send('The queue is over!');
        }, 1000);
        return;
    }
    if (key === 1) {
        ytdl(currentSongLink).on('info', (info) => {
            message.channel.send('Skipped: ' + '`' + info.videoDetails.title + '`'); // the video title
        });
    }
    play(message).then(() => printQueue(message));
}

//play commands
client.on('message', async message => {
    if (!message.guild) return;
    if(message.author.id === client.user.id) return;

    const inputList = message.content.split(' ');
    const command = inputList[0]?.toString();
    const link = inputList[1]?.toString();

    if (command === prefix + 'loop'){
        changeLoopValue();
        printLoopValue(message);
    }

    if (command === prefix + 'stop'){
        await disconnectBot(message);
    }

    if (command === prefix + 'skip'){
        if(queue.length === 0) {
            message.channel.send('Nothing to skip, queue empty!');
            return;
        }
        playNextSong(message, 1);
    }

    if (typeof link === "undefined") {
        return;
    }

    if (command === prefix + 'play') {
        printLoopValue(message);
        addToQueue(message, link);
    }
    
    if (command === prefix + 'add'){
        addToQueue(message, link);
    }
});









client.login(process.env.BOT_TOKEN).then(r => console.log('Successfully logged in!'));