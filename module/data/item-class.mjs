import { buildOriginSchema } from "./shared-schema.mjs";
//import { log } from "../utility/utility.mjs";

export default class ClassData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField,
      ArrayField
    } = foundry.data.fields;

    return {

      // Class role description shown on the sheet
      role: new StringField({ initial: "" }),
      description: new HTMLField({ initial: "" }),
      ...buildOriginSchema({ 
        abilities: false, 
        skills: true, 
        actions: true, 
        heroDice: true 
      })
      

      // The once-per-turn ability
      // oncePerturn: new SchemaField({
      //   name:        new StringField({ initial: "" }),
      //   description: new StringField({ initial: "" })
      // }),

      // Hero Dice abilities — classes get two
    };
  }
}
