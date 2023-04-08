const { ChannelType } = require("discord.js");

module.exports.init = function (interation, name) {
  const channelName = name ? name : `new-list`;
  interation.reply(`Creating a new list with the name ${channelName}`);
  interation.guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
  });
};
