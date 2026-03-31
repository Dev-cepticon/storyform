export default class DerpData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      StringField,
      BooleanField,
      NumberField,
      HTMLField
    } = foundry.data.fields;

    return {

      // Does leaning into this Derp earn a Hero Die?
      earnsHeroDie: new BooleanField({ initial: true }),

      // Some Derps grant a situational bonus
      // e.g. Daredevil gives +2 when taking extra risks
      hasBonus: new BooleanField({ initial: false }),

      bonusValue: new NumberField({
        integer: true, min: 0, initial: 2
      }),

      // Describes when the bonus applies
      bonusCondition: new StringField({ initial: "" }),

      description: new HTMLField({ initial: "" })
    };
  }
}
