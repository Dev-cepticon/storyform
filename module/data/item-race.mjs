export default class RaceData extends foundry.abstract.TypeDataModel {

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

      size: new StringField({
        initial: "medium",
        choices: ["small", "medium", "large"],
        label: "STORYFORM.RaceSize"
      }),

      age: new SchemaField({
        maturity: new NumberField({ integer: true, initial: 18 }),
        max:      new NumberField({ integer: true, initial: 100 })
      }),

      // Movement speed in squares
      movement: new NumberField({
        required: true, integer: true,
        min: 1, initial: 3,
        label: "STORYFORM.AttributeMovement"
      }),

      // Ability DC modifiers. Negative = beneficial (lowers DC).
      // e.g. Shadow Elf: -2 Dexterity, -1 Intelligence
      abilityModifiers: new ArrayField(
        new SchemaField({
          ability:  new StringField({
            required: true,
            choices: ["str", "dex", "int", "cha"]
          }),
          modifier: new NumberField({
            required: true, integer: true, initial: -1
          })
        }),
        { label: "STORYFORM.RaceAbilityModifiers" }
      ),

      // Skill DC modifiers
      // e.g. Shadow Elf: +1 Melee, -1 Stealth
      skillModifiers: new ArrayField(
        new SchemaField({
          skill:    new StringField({ required: true }),
          modifier: new NumberField({
            required: true, integer: true, initial: -1
          })
        }),
        { label: "STORYFORM.RaceSkillModifiers" }
      ),

      // Optional racial trait — toggle to show/hide fields
      racialTrait: new SchemaField({
        hasTrait:    new BooleanField({ initial: false }),
        name:        new StringField({ initial: "" }),
        description: new StringField({ initial: "" })
      }),

      description: new HTMLField({ initial: "" })
    };
  }
}
