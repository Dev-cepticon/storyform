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

      skillBonuses: new ArrayField(
        new SchemaField({
          skill:    new StringField({ required: true }),
          modifier: new NumberField({
            required: true, integer: true, initial: -1
          }),
          type: new StringField({ initial: "related" })
        }),
        { label: "STORYFORM.BackgroundSkillBonuses" }
      ),

      // Optional — not all backgrounds grant a once-per-turn ability
      oncePerturn: new SchemaField({
        name:        new StringField({ initial: "" }),
        description: new StringField({ initial: "" })
      }),

      // Optional — not all backgrounds grant Hero Dice abilities
      heroDiceAbilities: new ArrayField(
        new SchemaField({
          name:        new StringField({ initial: "" }),
          cost:        new NumberField({
            required: true, integer: true, min: 1, initial: 1
          }),
          description: new StringField({ initial: "" })
        }),
        { label: "STORYFORM.BackgroundHeroDiceAbilities" }
      ),

      roleplaying: new StringField({ initial: "" }),

      description: new HTMLField({ initial: "" })
    };
  }
}
