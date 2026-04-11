//import { log } from "../utility/utility.mjs";

//ACTOR

/**
 * Builds the shared attributes schema for Actors.
 * @param {object} fields - The foundry.data.fields reference.
 * @param {object} options
 * @param {boolean} options.isCharacter - Whether to include PC-specific fields like Hero Dice.
 */
export function buildAttributesSchema(fields, { isCharacter = false } = {}) {
  const { NumberField, SchemaField } = fields;

  const schema = {
    //NPC and Characters start with same intial hp. For npc it assumed that the gm will all most always
    //be changing the value, so it intial value is inconsequential.
    hp: new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, initial: 15 }),
      max: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
    }),
    dr: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
    actions: new NumberField({ required: true, integer: true, min: 0, initial: 3 })
  };

  // Inject Character-only fields
  if (isCharacter) {
    schema.herodice = new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 }),
      max: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 })
    });
    //Some Special or Boss npc may have hero dice
  } else {
    schema.herodice = new SchemaField({
      value: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 }),
      max: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 0 })
    });
    schema.movement= new NumberField({ required: true, integer: true, min: 0, initial: 3 })
  }

  return new SchemaField(schema);
}

//Builds the ability and skill schema for Actors.
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


//ITEMS
//Origin items
const { NumberField, StringField, SchemaField, HTMLField, ArrayField, BooleanField } = foundry.data.fields;

// Helper: Ability Modifiers
const abilityModifierPart = () => new ArrayField(new SchemaField({
  ability: new StringField({ required: true, choices: ["str", "dex", "int", "cha"] }),
  modifier: new NumberField({ required: true, integer: true, initial: -1 })
}));

// Helper: Skill Modifiers
const skillModifierPart = () => new ArrayField(new SchemaField({
  skill: new StringField({ required: true }),
  modifier: new NumberField({ required: true, integer: true, initial: -1 }),
  type: new StringField({ initial: "base" }) // "base", "related", etc.
}));

// Helper: Actions/Traits
// Cost are there for future implementaion of once per turn actions that
// cost more than one of the characters actions to perform when in iniative. 
const actionPart = () => new ArrayField(new SchemaField({
  name: new StringField({ initial: "" }),
  cost: new NumberField({ required: false, integer: true, min: 0, initial: 0 }),
  description: new StringField({ initial: "" })
}),
  { initial: [] }
);


// Helper: Hero Dice Actions
const heroDicePart = () => new ArrayField(new SchemaField({
  name: new StringField({ initial: "" }),
  cost: new NumberField({ required: true, integer: true, min: 1, initial: 1 }),
  description: new StringField({ initial: "" })
}));

/**
 * The Standardized Origin Factory
 * @param {object} options - Toggles for feature sets
 */
/**
 * Builds the schema for Origin-related data (Races, Classes, Backgrounds).
 * * We have removed the 'options' toggles to implement an "Always-On" schema.
 * * WHY:
 * 1. Schema Stability: In Foundry V12, defineSchema is static. It runs once when 
 * the class is initialized. It cannot reactively add/remove fields during play.
 * 2. Data Persistence: By always defining these fields, we ensure that if a user 
 * toggles 'hasSkills' off and then back on, their previous data is still there.
 * 3. Validation: UI toggles should control visibility (the "if" in your Handlebars), 
 * while the Schema controls the integrity of the data being saved.
 */
export function buildOriginSchema() {
  return {
    // These fields are now always present in the DataModel structure.
    // Use system.config.hasSkills (etc.) in your .hbs templates to 
    // decide whether to show the HTML for these fields.

    abilityModifiers: abilityModifierPart(),
    skillModifiers: skillModifierPart(),
    oncePerturn: actionPart(),
    heroDiceAbilities: heroDicePart()
  };
}