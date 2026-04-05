import { log } from "../utility/utility.mjs";

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
          max: new NumberField({ required: true, integer: true, min: 0, initial: 15 }),
          tempMax: new NumberField({ required: false, integer: true, min: 0, initial: 0 })
        }),
        herodice: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 }),
          max: new NumberField({ required: true, integer: true, min: 0, max: 5, initial: 5 })
        }),
        movement: new NumberField({ required: true, integer: true, min: 0, initial: 3 }),
        dr: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        actions: new NumberField({ reqiured: true, integer: true, min: 0, initial: 3 })

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
  /** @override */
  prepareDerivedData() {
    log("preparing character derived data")
    super.prepareDerivedData();

    // For each ability, calculate how many skill points the player had to spend, based on the rule:
    // (20 - Ability DC) × 3 = Skill Points for that group
    log("getting abilities and skill points");
    const abilities = this.abilities;

    this.abilities.str.skillPoints = (20 - abilities.str.dc) * 3;
    this.abilities.dex.skillPoints = (20 - abilities.dex.dc) * 3;
    this.abilities.int.skillPoints = (20 - abilities.int.dc) * 3;
    this.abilities.cha.skillPoints = (20 - abilities.cha.dc) * 3;

    // Calculate how many points have been SPENT by summingall skill DC reductions from their base of 20.
    // Lets the sheet show a running total.
    const s = this.skills;

    this.abilities.str.skillPointsSpent = 0;
    //   (20 - s.brawling.dc) + (20 - s.climb.dc) +
    //   (20 - s.intimidate.dc) + (20 - s.athletics.dc);

    this.abilities.dex.skillPointsSpent = 0;
    //   (20 - s.melee.dc) + (20 - s.shooting.dc) +
    //   (20 - s.piloting.dc) + (20 - s.stealth.dc);

    this.abilities.int.skillPointsSpent = 0;
    //   (20 - s.firstAid.dc) + (20 - s.repair.dc) +
    //   (20 - s.techArcana.dc) + (20 - s.perception.dc);

    this.abilities.cha.skillPointsSpent = 0;
    //   (20 - s.charm.dc) + (20 - s.deception.dc) +
    //   (20 - s.gatherInfo.dc) + (20 - s.haggle.dc);

    //Calculte characters damage resistance based on equiped armor
    // Find all items of type 'armor' that are marked as equipped
    log("calculating damage resistance")
    const equippedArmor = this.parent.items.filter(i =>
      i.type === "armor" && i.system.equipped === true
    );
    // If exactly one armor is equipped, use its DR. 
    // If 0 or >1, DR resets to 0.
    if (equippedArmor.length === 1) {
      this.attributes.dr = equippedArmor[0].system.dr || 0;
    } else {
      this.attributes.dr = 0;
      // Optional: If length > 1, we could log a warning to the console
    }
    //log("***********",race);
    const actor = this.parent;
    //Map embedded items to identify the active Origins
    const raceItem = actor.itemTypes.race?.[0];
    const classItem = actor.itemTypes.class?.[0];
    const backgroundItem = actor.itemTypes.background?.[0];

    //Sync Item Names to the Schema Fields (system.details)
    this.details.race = raceItem?.name ?? "";
    this.details.class = classItem?.name ?? "";
    this.details.background = backgroundItem?.name ?? "";

    //Aggregate Modifiers
    const mods = {
      abilities: { str: 0, dex: 0, int: 0, cha: 0 },
      skills: {}
    };

    this.attributes.hp.tempMax = this.attributes.hp.max;
    log("this.attributes.hp.tempMax", this.attributes.hp.tempMax);
    log("this.attributes.hp.max", this.attributes.hp.max)
    // Race Modifiers
    if (raceItem) {
      if (!raceItem) return;
      this.attributes.hp.tempMax = this.attributes.hp.max + (raceItem.system.hpBonus || 0);
      //log("this.abilities.movement", this.abilities.movement);
      this.attributes.movement = raceItem.system.movement || this.attributes.movement;
      raceItem.system.abilityModifiers?.forEach(m => mods.abilities[m.ability] += m.modifier);
      raceItem.system.skillModifiers?.forEach(m => mods.skills[m.skill] = (mods.skills[m.skill] || 0) + m.modifier);
    }
    // Class/Background Modifiers
    let count = 0;
    [classItem, backgroundItem].forEach(item => {
      if (!item) return;
      count += 1;
      item.system.skillModifiers?.forEach(m => mods.skills[m.skill] = (mods.skills[m.skill] || 0) + m.modifier);

    });

    // Apply "Floor of 8" Logic
    // Logic: DC = Math.max(8, BaseDC) + Modifiers
    // Process Abilities
    for (let [id, ability] of Object.entries(this.abilities)) {

      const base = Math.max(8, ability.dc);
      ability.total = base + (mods.abilities[id] || 0);
      ability.skillPoints = (20 - base) * 3;
      ability.dc = base// + (mods.abilities[id] || 0);
      ability.skillPoints = (20 - base) * 3;
    }

    // Process Skills
    for (let [id, skill] of Object.entries(this.skills)) {
      const base = Math.max(8, skill.dc);

      skill.total = base + (mods.skills[id] || 0);
      const cost = 20 - base;

      const mapping = this._getSkillAbilityMapping(id);

      if (this.abilities[mapping]) {
        this.abilities[mapping].skillPointsSpent += cost;
      }

      skill.dc = base
    }

    log("derived data finished");
  }
  _getSkillAbilityMapping(skillId) {
    const groups = {
      str: ["brawling", "climb", "intimidate", "athletics"],
      dex: ["melee", "shooting", "piloting", "stealth"],
      int: ["firstAid", "repair", "techArcana", "perception"],
      cha: ["charm", "deception", "gatherInfo", "haggle"]
    };
    for (let [abl, skills] of Object.entries(groups)) {
      if (skills.includes(skillId)) return abl;
    }
    return null;
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
