export default class ArmorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      HTMLField,
      ArrayField
    } = foundry.data.fields;

    return {

      tier: new NumberField({
        required: true, integer: true,
        min: 1, max: 5, initial: 1,
        label: "STORYFORM.ArmorTier"
      }),

      // DR directly reduces incoming damage.
      // Default: tier = DR, but can be overridden.
      dr: new NumberField({
        required: true, integer: true,
        min: 0, max: 10, initial: 1,
        label: "STORYFORM.ArmorDR"
      }),

      // Free-text properties — open-ended like weapons.
      properties: new ArrayField(
        new StringField({ blank: false }),
        { label: "STORYFORM.ArmorProperties" }
      ),

      description: new HTMLField({ initial: "" })
    };
  }

  // ── Derived Data ──────────────────────────────────────────

  prepareDerivedData() {
    // Default DR matches tier unless manually overridden.
    this.defaultDR = this.tier;
  }
}
