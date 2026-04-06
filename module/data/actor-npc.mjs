import { buildAttributesSchema, buildAbilitiesSchema, buildSkillsSchema} from "./shared-schema.mjs";
import { log } from "../utility/utility.mjs";

export default class NpcData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField,
      ArrayField
    } = foundry.data.fields;

    return {
      attributes: buildAttributesSchema(foundry.data.fields, { isCharacter: false }),
      abilities: buildAbilitiesSchema(foundry.data.fields),
      skills: buildSkillsSchema(foundry.data.fields),
      movement: new NumberField({ required: true, integer: true, min: 0, initial: 3 }),
      details: new SchemaField({
        biography: new HTMLField({ initial: "" }),
        size: new StringField({ required: false, initial: "medium" }),
        challenge: new NumberField({ required: false, initial: 1 })
      }),
      stance: new StringField({ required: false, initial: "neutral" }),
      combat: new SchemaField({
        attacks: new ArrayField(new SchemaField({
          name: new StringField({ initial: "" }),
          damage: new StringField({ initial: "" }),
          skill: new StringField({ initial: "" })
        }))
      }),
      //TODO: For use later in NPC sheet
      meta: new SchemaField({
        faction: new StringField({ required: false, initial: "" }),
        tags: new ArrayField(new StringField())
      })
    };
  }
  //TODO:fill out for this actor
  prepareDerivedData() { }
}
