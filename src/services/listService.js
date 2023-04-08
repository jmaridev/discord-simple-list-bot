const { codeBlock } = require("discord.js");

module.exports.listService = {
  convertListToCodeblock: function (list) {
    if (list.length === 0) {
      return codeBlock("*tumbleweed*");
    }
    return codeBlock(list);
  },
};
