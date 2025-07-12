import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToRust = (type: string): string => {
  switch (type) {
    case "string":
      return "String";
    case "number":
      return "f64";
    case "boolean":
      return "bool";
    case "null":
      return "Option<()>";
    case "any":
      return "serde_json::Value";
    case "object":
      return "serde_json::Value";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToRust(type.slice(0, -2));
        return `Vec<${elementType}>`;
      }
      return "serde_json::Value";
  }
};

export const rustGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `    pub ${k}: ${mapTypeToRust(v)},`
    );
    return `#[derive(Debug, Serialize, Deserialize)]\npub struct ${
      def.name
    } {\n${lines.join("\n")}\n}`;
  },
  getFileExtension: () => "rs",
  getCommentStyle: () => "//",
};
