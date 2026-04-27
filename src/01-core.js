import {
  dictionarySize,
  listDictionaryKeys,
  setDictionaryValue,
  getDictionaryValue,
} from "./03-logic.js";

class TfDictionariesPro {
  getInfo() {
    return {
      id: "triflareDictionariesPro",
      name: "Dictionaries Pro",
      blocks: [
        {
          opcode: "setValue",
          blockType: Scratch.BlockType.COMMAND,
          text: "set key [KEY] in dictionary [DICT] to [VALUE]",
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "score" },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
            VALUE: { type: Scratch.ArgumentType.STRING, defaultValue: "100" },
          },
        },
        {
          opcode: "getValue",
          blockType: Scratch.BlockType.REPORTER,
          text: "get key [KEY] from dictionary [DICT]",
          arguments: {
            KEY: { type: Scratch.ArgumentType.STRING, defaultValue: "score" },
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
          },
        },
        {
          opcode: "size",
          blockType: Scratch.BlockType.REPORTER,
          text: "number of keys in dictionary [DICT]",
          arguments: {
            DICT: { type: Scratch.ArgumentType.STRING, defaultValue: "player" },
          },
        },
        {
          opcode: "keys",
          blockType: Scratch.BlockType.REPORTER,
          text: "keys in dictionary [DICT]",
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

Scratch.extensions.register(new TfDictionariesPro());
