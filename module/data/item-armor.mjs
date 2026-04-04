export default class ArmorData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      SchemaField,
      StringField,
      HTMLField,
      ArrayField,
      BooleanField
    } = foundry.data.fields;

    return {

      tier: new NumberField({
        required: true, integer: true,
        min: 1, max: 5, initial: 1,
        label: "STORYFORM.ArmorTier"
      }),

      // DR directly reduces incoming damage.
      dr: new NumberField({
        required: true, integer: true,
        min: 0, max: 10, initial: 1,
        label: "STORYFORM.ArmorDR"
      }),

      // Free-text properties — open-ended like weapons.
      properties: new ArrayField(
        new SchemaField({
          name: new StringField({initial: "" }),
          description: new StringField({initial: ""})
        }),
        { label: "STORYFORM.ArmorProperties" }
      ),

      description: new HTMLField({ initial: "" }),
      equipped: new BooleanField({ initial: false }),
    };
  }

  // ── Derived Data ──────────────────────────────────────────

  prepareDerivedData() {

    super.prepareDerivedData();

    // Default DR matches tier unless manually overridden.
    this.defaultDR = this.tier;
  }
}
