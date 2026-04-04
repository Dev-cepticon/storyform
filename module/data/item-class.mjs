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

      // Skill DC bonuses granted by the class.
      // Rules: one at -2, two at -1.
      skillModifiers: new ArrayField(
        new SchemaField({
          skill:    new StringField({ required: true }),
          modifier: new NumberField({
            required: true, integer: true, initial: -1
          })
        }),
        { label: "STORYFORM.ClassSkillBonuses" }
      ),

      // The once-per-turn ability
      oncePerturn: new SchemaField({
        name:        new StringField({ initial: "" }),
        description: new StringField({ initial: "" })
      }),

      // Hero Dice abilities — classes get two
      heroDiceAbilities: new ArrayField(
        new SchemaField({
          name:        new StringField({ initial: "" }),
          cost:        new NumberField({
            required: true, integer: true, min: 1, initial: 1
          }),
          description: new StringField({ initial: "" })
        }),
        { label: "STORYFORM.ClassHeroDiceAbilities" }
      ),

      description: new HTMLField({ initial: "" })
    };
  }
}
