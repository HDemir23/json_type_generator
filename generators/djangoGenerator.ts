import { CodeGenerator } from "./types";
import { TypeDefinition } from "../utils/typeInferer";

const mapTypeToDjango = (type: string): string => {
  switch (type) {
    case "string":
      return "models.CharField(max_length=255)";
    case "number":
      return "models.FloatField()";
    case "boolean":
      return "models.BooleanField()";
    case "null":
      return "models.JSONField(null=True, blank=True)";
    case "any":
      return "models.JSONField()";
    case "object":
      return "models.JSONField()";
    default:
      if (type.endsWith("[]")) {
        return "models.JSONField()";
      }
      return "models.JSONField()";
  }
};

export const djangoGenerator: CodeGenerator = {
  generate: (def: TypeDefinition) => {
    const lines = Object.entries(def.fields).map(
      ([k, v]) => `    ${k} = ${mapTypeToDjango(v)}`
    );
    return `from django.db import models\n\nclass ${
      def.name
    }(models.Model):\n${lines.join(
      "\n"
    )}\n\n    class Meta:\n        db_table = '${def.name.toLowerCase()}'`;
  },
  getFileExtension: () => "py",
  getCommentStyle: () => "#",
};
