import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToObjectiveC = (type: string): string => {
  switch (type) {
    case "string":
      return "NSString*";
    case "number":
      return "NSNumber*";
    case "boolean":
      return "BOOL";
    case "null":
      return "id";
    case "any":
      return "id";
    case "object":
      return "NSDictionary*";
    default:
      if (type.endsWith("[]")) {
        const elementType = mapTypeToObjectiveC(type.slice(0, -2));
        return `NSArray<${elementType}>*`;
      }
      return "id";
  }
};

export const objectiveCGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) =>
        `@property (nonatomic, strong) ${mapTypeToObjectiveC(v)} ${k};`
    );
    return `#import <Foundation/Foundation.h>\n\n@interface ${
      def.name
    } : NSObject\n\n${lines.join("\n")}\n\n@end`;
  },
  getFileExtension: () => "h",
  getCommentStyle: () => "//",
};
