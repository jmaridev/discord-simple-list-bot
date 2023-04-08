require("dotenv").config();
const { Client, IntentsBitField, Embed, ChannelType } = require("discord.js");
const { init } = require("./commands/init.js");
const { EmbedBuilder, codeBlock } = require("@discordjs/builders");

const Nedb = require("nedb");
const { listService } = require("./services/listService.js");
const lists = new Nedb({ filename: "database/lists.db", autoload: true });

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", (c) => {
  console.log(`${c.user.username} is ready!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  switch (interaction.commandName) {
    case "init":
      //init(interation);

      // Create channel values
      const channelName = `new-list`;
      const listName = `Grocery List`;
      const creator = interaction.user.username;
      interaction.reply(
        `Creating a new list with the name "${listName}" in [${channelName}]`
      );

      // Create channel and store in a variable
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
      });

      // Create database and store guildId, channelId, and empty list
      lists.insert({
        guildId: interaction.guildId,
        channelId: channel.id,
        list: [],
      });

      // Get codeblock formatted list
      const listCodeblock = listService.convertListToCodeblock([]);

      // Create initial message in the channel
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(listName)
        .setDescription(listCodeblock)
        .setFooter({ text: `${creator} has created a new list.` });
      channel.send({ embeds: [embed] });

      break;
    default:
      interation.reply("Sorry, I don't recognize that command.");
      break;
  }
});

client.on("messageCreate", (message) => {
  // Don't respond to bot messages
  if (message.author.bot) {
    return;
  }

  const command = message.content.split(" ")[0];

  switch (command) {
    default:
      addItemToList(message);
      updateMessage(message);
      deleteMessage(message);
      break;
  }
});

function getListFromMessage(message) {
  const query = { guildId: message.guild.id, channelId: message.channel.id };
  let list = [];
  lists.findOne(query, function (err, doc) {
    console.log(doc);
    list = doc;
  });
  return list;
}

function addItemToList(message) {
  // --- ADD ITEM --- //
  // Get list from message
  const list = getListFromMessage(message);

  console.log(list);

  // Update if guild and channel exists
  list.push(message.content);
  lists.update(query, { $set: { list: list } });
  console.log(`Successfully added item: ${message.content}`);
  lists.loadDatabase();
}

function deleteMessage(message) {
  message.delete();
}

function updateMessage(message) {
  const list = getListFromMessage(message);
  console.log(list);

  // Get codeblock formatted list
  const listCodeblock = listService.convertListToCodeblock();

  // Create initial message in the channel
  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(listName)
    .setDescription(listCodeblock)
    .setFooter({ text: `${creator} has created a new list.` });
  channel.send({ embeds: [embed] });

  message.edit();
}

client.login(process.env.BOT_TOKEN);
