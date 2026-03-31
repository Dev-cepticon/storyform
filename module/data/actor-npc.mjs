export default class NpcData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField
    } = foundry.data.fields;

    return {
      attributes: new SchemaField({
        hp: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
          max:   new NumberField({ required: true, integer: true, min: 0, initial: 10 })
        }),
        defense:  new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        movement: new NumberField({ required: true, integer: true, min: 0, initial: 3 })
      }),
      details: new SchemaField({
        biography: new HTMLField({ initial: "" })
      })
    };
  }
}
