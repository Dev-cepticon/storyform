//ACTOR

/**
 * Builds the shared attributes schema for Actors.
 * @param {object} fields - The foundry.data.fields reference.
 * @param {object} options
 * @param {boolean} options.isCharacter - Whether to include PC-specific fields like Hero Dice.
 */
export function buildAttributesSchema(fields, { initialHp = 10, isCharacter = false } = {}) {
  const { NumberField, SchemaField } = fields;

  const schema = {
    hp: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 15}),
      max: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
    }),
    dr: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    movement: new NumberField({ required: true, integer: true, min: 0, initial: 3 }),
    actions: new NumberField({ required: true, integer: true, min: 0, initial: 3 })
  };

  // Inject Character-only fields
  if (isCharacter) {
    schema.herodice = new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 }),
      max: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 })
    });
  } else {
    schema.herodice = new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 }),
      max: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 0 })
    });
  }

  return new SchemaField(schema);
}


export function buildAbilitiesSchema(fields) {
  const { NumberField, SchemaField } = fields;
  const dcField = (label) => new SchemaField({
    dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20, label })
  });
  return new SchemaField({
    str: dcField("STORYFORM.AbilityStr"),
    dex: dcField("STORYFORM.AbilityDex"),
    int: dcField("STORYFORM.AbilityInt"),
    cha: dcField("STORYFORM.AbilityCha")
  });
}

export function buildSkillsSchema(fields) {
  const { NumberField, SchemaField } = fields;
  const skill = () => new SchemaField({
    dc: new NumberField({ required: true, integer: true, min: 8, max: 30, initial: 20 })
  });
  return new SchemaField({
    brawling: skill(), climb: skill(), intimidate: skill(), athletics: skill(),
    melee: skill(), shooting: skill(), piloting: skill(), stealth: skill(),
    firstAid: skill(), repair: skill(), techArcana: skill(), perception: skill(),
    charm: skill(), deception: skill(), gatherInfo: skill(), haggle: skill()
  });
}


//ITEM