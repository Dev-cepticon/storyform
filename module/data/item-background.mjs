import { buildOriginSchema } from "./shared-schema.mjs";
//import { log } from "../utility/utility.mjs";

export default class BackgroundData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField,
      ArrayField
    } = foundry.data.fields;

    return {
      roleplaying: new StringField({ initial: "" }),
      description: new HTMLField({ initial: "" }),
      ...buildOriginSchema({ 
              abilities: false, 
              skills: true, 
              actions: false, 
              heroDice: false 
            }),
    };
  }
}
