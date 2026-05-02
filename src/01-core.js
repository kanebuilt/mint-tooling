import {
  dictionarySize,
  listDictionaryKeys,
  setDictionaryValue,
  getDictionaryValue,
} from "./03-logic.js";

class DictProExtension {
  getInfo() {
    return {
      id: mint.manifest.get("id"),
      name: Scratch.translate(mint.manifest.get("name")),
      blocks: [
        {
          opcode: "setValue",
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate("set key [KEY] in dictionary [DICT] to [VALUE]"),
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "score" },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "100" },
          },
        },
        {
          opcode: "getValue",
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate("get key [KEY] from dictionary [DICT]"),
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "score" },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
          },
        },
        {
          opcode: "size",
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate("number of keys in dictionary [DICT]"),
          arguments: {
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
          },
        },
        {
          opcode: "keys",
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate("keys in dictionary [DICT]"),
          arguments: {
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
          },
        },
      ],
    };
  }

  setValue(args) {
    setDictionaryValue(args.DICT, args.KEY, args.VALUE);
  }

  getValue(args) {
    return getDictionaryValue(args.DICT, args.KEY);
  }

  size(args) {
    return dictionarySize(args.DICT);
  }

  keys(args) {
    return listDictionaryKeys(args.DICT).join("\n");
  }
}

Scratch.extensions.register(new DictProExtension());
