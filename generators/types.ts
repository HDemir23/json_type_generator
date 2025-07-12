import { TypeDefinition } from "../utils/typeInferer";

export interface CodeGenerator {
  generate: (def: TypeDefinition) => string;
  getFileExtension: () => string;
  getCommentStyle: () => string;
}
