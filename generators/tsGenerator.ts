import { CodeGenerator } from "./types";
import { TypeDefinition, getDiscoveredTypes } from "../utils/typeInferer";

export const tsGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const discoveredTypes = getDiscoveredTypes();

    // Generate nested type definitions first
    const nestedTypes = discoveredTypes
      .filter((type) => type.name !== def.name) // Don't include the root type
      .map((type) => {
        const lines = Object.entries(type.fields).map(
          ([k, v]) => `  ${k}: ${v};`
        );
        return `export type ${type.name} = {\n${lines.join("\n")}\n}`;
      })
      .join("\n\n");

    // Generate the main type definition
    const lines = Object.entries(def.fields).map(([k, v]) => `  ${k}: ${v};`);
    const mainType = `export type ${def.name} = {\n${lines.join("\n")}\n}`;

    // Combine nested types with main type
    return nestedTypes + (nestedTypes ? "\n\n" : "") + mainType;
  },
  getFileExtension: () => "ts",
  getCommentStyle: () => "//",
};
