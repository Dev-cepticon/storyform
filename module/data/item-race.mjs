import { buildOriginSchema } from "./shared-schema.mjs";
//import { log } from "../utility/utility.mjs";


export default class RaceData extends foundry.abstract.TypeDataModel {

  /** @override */
  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField,
      ArrayField,
      BooleanField
    } = foundry.data.fields;

    return {
      config: new SchemaField({
        hasSkills: new BooleanField({ initial: false }),
        hasAction: new BooleanField({initial: false}),
        hasHeroDice: new BooleanField({initial: false}),
        
      }),
      hpBonus: new NumberField({
        required: true, integer: true, initial: 0,
        label: "STORYFORM.RaceHpBonus"
      }),
      size: new StringField({
        initial: "medium",
        choices: ["tiny", "small", "medium", "large", "huge"],
        label: "STORYFORM.RaceSize"
      }),
      age: new SchemaField({
        maturity: new NumberField({ integer: true, initial: 18 }),
        max: new NumberField({ integer: true, initial: 100 })
      }),
      // Movement speed in squares
      movement: new NumberField({
        required: true, integer: true,
        min: 1, initial: 3,
        label: "STORYFORM.AttributeMovement"
      }),
      //Optional racial trait — toggle to show/hide fields
      racialTrait: new SchemaField({
        hasTrait: new BooleanField({ initial: false }),
        name: new StringField({ initial: "" }),
        description: new StringField({ initial: "" })
      }),
      description: new HTMLField({
        required: true,
        initial: "",
        label: "STORYFORM.Description"
      }),
      ...buildOriginSchema(),

    };
  }
}
