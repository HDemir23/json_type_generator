import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

export const jsGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => ` * @property {${v}} ${k}`
    );
    return `/**\n * @typedef {Object} ${def.name}\n${lines.join("\n")}\n */`;
  },
  getFileExtension: () => "js",
  getCommentStyle: () => "//",
};
