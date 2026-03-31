export default class CharacterData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const {
      NumberField,
      StringField,
      SchemaField,
      HTMLField
    } = foundry.data.fields;

    return {

      // ── ABILITIES ──────────────────────────────────────────
      // Each is a DC (Difficulty Class). Lower = more capable.
      // Range: roughly 8 (elite) to 20 (untrained).
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

      // ── SKILLS ────────────────────────────────────────────
      // Each skill is also a DC. Players roll d20 and need to
      // roll ABOVE the DC to succeed.
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

      // ── CORE STATS ────────────────────────────────────────
      attributes: new SchemaField({
        hp: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        }),
        herodice: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 }),
          max: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 })
        }),
        movement: new NumberField({ required: true, integer: true, min: 0, initial: 3 }),
        defense: new NumberField({ required: true, integer: true, min: 0, initial: 0 })
      }),

      // ── IDENTITY / BIOGRAPHY ──────────────────────────────
      details: new SchemaField({
        race: new StringField({ initial: "" }),
        class: new StringField({ initial: "" }),
        background: new StringField({ initial: "" }),
        personality: new StringField({ initial: "" }),
        biography: new HTMLField({ initial: "" })
      })

    };
  }

  // ── Derived Data ──────────────────────────────────────────

  prepareDerivedData() {

    // For each ability, calculate how many skill points
    // the player had to spend, based on the rule:
    // (20 - Ability DC) × 3 = Skill Points for that group
    const abilities = this.abilities;

    this.abilities.str.skillPoints = (20 - abilities.str.dc) * 3;
    this.abilities.dex.skillPoints = (20 - abilities.dex.dc) * 3;
    this.abilities.int.skillPoints = (20 - abilities.int.dc) * 3;
    this.abilities.cha.skillPoints = (20 - abilities.cha.dc) * 3;

    // Calculate how many points have been SPENT by summing
    // all skill DC reductions from their base of 20.
    // Lets the sheet show a running total.
    const s = this.skills;

    this.abilities.str.skillPointsSpent =
      (20 - s.brawling.dc) + (20 - s.climb.dc) +
      (20 - s.intimidate.dc) + (20 - s.athletics.dc);

    this.abilities.dex.skillPointsSpent =
      (20 - s.melee.dc) + (20 - s.shooting.dc) +
      (20 - s.piloting.dc) + (20 - s.stealth.dc);

    this.abilities.int.skillPointsSpent =
      (20 - s.firstAid.dc) + (20 - s.repair.dc) +
      (20 - s.techArcana.dc) + (20 - s.perception.dc);

    this.abilities.cha.skillPointsSpent =
      (20 - s.charm.dc) + (20 - s.deception.dc) +
      (20 - s.gatherInfo.dc) + (20 - s.haggle.dc);
  }

  async _preUpdate(changed, options, user) {
    const result = await super._preUpdate(changed, options, user);
    if (result === false) return false;

    // Only validate if skills or abilities are being updated
    if (!changed.system?.skills && !changed.system?.abilities) return true;

    // Merge the changes with current data to see the "future" state
    const abilities = foundry.utils.mergeObject(this.abilities, changed.system?.abilities || {}, { inplace: false });
    const skills = foundry.utils.mergeObject(this.skills, changed.system?.skills || {}, { inplace: false });

    // 1. Strength Validation
    const strLimit = (20 - abilities.str.dc) * 3;
    const strSpent = (20 - skills.brawling.dc) + (20 - skills.climb.dc) +
      (20 - skills.intimidate.dc) + (20 - skills.athletics.dc);
    if (strSpent > strLimit) {
      ui.notifications.warn(`Warning: Strength Skill Points exceeded! (${strSpent}/${strLimit})`);
    }

    // 2. Dexterity Validation
    const dexLimit = (20 - abilities.dex.dc) * 3;
    const dexSpent = (20 - skills.melee.dc) + (20 - skills.shooting.dc) +
      (20 - skills.piloting.dc) + (20 - skills.stealth.dc);
    if (dexSpent > dexLimit) {
      ui.notifications.warn(`Warning: Dexterity Skill Points exceeded! (${dexSpent}/${dexLimit})`);
    }

    // 3. Intelligence Validation
    const intLimit = (20 - abilities.int.dc) * 3;
    const intSpent = (20 - skills.firstAid.dc) + (20 - skills.repair.dc) +
      (20 - skills.techArcana.dc) + (20 - skills.perception.dc);
    if (intSpent > intLimit) {
      ui.notifications.warn(`Warning: Intelligence Skill Points exceeded! (${intSpent}/${intLimit})`);
    }

    // 4. Charisma Validation
    const chaLimit = (20 - abilities.cha.dc) * 3;
    const chaSpent = (20 - skills.charm.dc) + (20 - skills.deception.dc) +
      (20 - skills.gatherInfo.dc) + (20 - skills.haggle.dc);
    if (chaSpent > chaLimit) {
      ui.notifications.warn(`Warning: Charisma Skill Points exceeded! (${chaSpent}/${chaLimit})`);
    }

    return true;
  }


}
