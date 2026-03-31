export default class WeaponData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField,
      ArrayField
    } = foundry.data.fields;

    return {

      // Tier 1-4 for melee, 1-5 for guns.
      // Single model for both — category drives behaviour.
      tier: new NumberField({
        required: true, integer: true,
        min: 1, max: 5, initial: 1,
        label: "STORYFORM.WeaponTier"
      }),

      // "melee" or "gun"
      category: new StringField({
        required: true,
        initial: "melee",
        choices: ["melee", "gun"],
        label: "STORYFORM.WeaponCategory"
      }),

      // Damage formula e.g. "1d6", "3d6"
      // Stored as string so it can be rolled directly.
      damage: new StringField({
        required: true,
        initial: "1d4",
        label: "STORYFORM.WeaponDamage"
      }),

      // Properties are free-text — the rules treat them
      // as open-ended examples, not a fixed list.
      properties: new ArrayField(
        new StringField({ blank: false }),
        { label: "STORYFORM.WeaponProperties" }
      ),

      description: new HTMLField({ initial: "" })
    };
  }

  // ── Derived Data ──────────────────────────────────────────

  prepareDerivedData() {
    // Default damage formula based on tier and category.
    // Shown as a hint on the sheet; does not override
    // a manually entered value.
    const tierDamageMelee = {
      1: "1d4", 2: "1d6", 3: "1d8", 4: "1d10"
    };
    const tierDamageGun = {
      1: "1d6", 2: "2d6", 3: "3d6", 4: "4d6", 5: "5d6"
    };

    const table = this.category === "gun"
      ? tierDamageGun
      : tierDamageMelee;

    this.defaultDamage = table[this.tier] ?? "1d4";
  }
}
