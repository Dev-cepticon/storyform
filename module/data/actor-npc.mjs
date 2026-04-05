export default class NpcData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField,
      ArrayField
    } = foundry.data.fields;

    return {
      attributes: new SchemaField({
        hp: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
        }),
        dr: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        movement: new NumberField({ required: true, integer: true, min: 0, initial: 3 }),
        actions: new NumberField({ required: true, integer: true, min: 0, initial: 3 })
      }),
      details: new SchemaField({
        biography: new HTMLField({ initial: "" }),
        size: new StringField({ required: false, initial: "medium" }),
        challenge: new NumberField({ required: false, initial: 1 })
      }),
      stance: new StringField({ required: false, initial: "neutral" }),

      abilities: new SchemaField({
        str: new SchemaField({
          dc: new NumberField({
            required: true, integer: true,
            min: 8, max: 30, initial: 20,
            label: "STORYFORM.AbilityStr"
          })
        }),
        dex: new SchemaField({
          dc: new NumberField({
            required: true, integer: true,
            min: 8, max: 30, initial: 20,
            label: "STORYFORM.AbilityDex"
          })
        }),
        int: new SchemaField({
          dc: new NumberField({
            required: true, integer: true,
            min: 8, max: 30, initial: 20,
            label: "STORYFORM.AbilityInt"
          })
        }),
        cha: new SchemaField({
          dc: new NumberField({
            required: true, integer: true,
            min: 8, max: 30, initial: 20,
            label: "STORYFORM.AbilityCha"
          })
        })
      }),
      skills: new SchemaField({

        // Strength skills
        brawling: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        climb: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        intimidate: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        athletics: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),

        // Dexterity skills
        melee: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        shooting: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        piloting: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        stealth: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),

        // Intelligence skills
        firstAid: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        repair: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        techArcana: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        perception: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),

        // Charisma skills
        charm: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        deception: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        gatherInfo: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) }),
        haggle: new SchemaField({ dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 }) })
      }),
      combat: new SchemaField({
        attacks: new ArrayField(new SchemaField({
          name: new StringField({ initial: "" }),
          damage: new StringField({ initial: "" }),
          skill: new StringField({ initial: "" })
        }))
      }),
      meta: new SchemaField({
        faction: new StringField({ required: false, initial: "" }),
        tags: new ArrayField(new StringField())
      })
    };
  }
}
