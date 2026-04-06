import { buildAttributesSchema , buildAbilitiesSchema, buildSkillsSchema } from "./shared-schema.mjs";
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
      // ── CORE STATS ────────────────────────────────────────
      attributes: buildAttributesSchema(foundry.data.fields, { isCharacter: true }),
      // ── ABILITIES ──────────────────────────────────────────
      abilities: buildAbilitiesSchema(foundry.data.fields),
      // ── SKILLS ────────────────────────────────────────────
      skills: buildSkillsSchema(foundry.data.fields),
      // ── IDENTITY / BIOGRAPHY ──────────────────────────────
      details: new SchemaField({
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

    //Calculte characters damage resistance based on equiped armor
    // Find all items of type 'armor' that are marked as equipped
    log("calculating damage resistance")
    const equippedArmor = this.parent.items.filter(i =>
      i.type === "armor" && i.system.equipped === true
    );
    // If exactly one armor is equipped, use its DR. 
    // If 0 or >1, DR resets to 0.
    if (equippedArmor.length === 1) {
      this.attributes.dr = equippedArmor[0].system.dr ?? 0;
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
    this.abilities.str.skillPointsSpent = 0;
    this.abilities.dex.skillPointsSpent = 0;
    this.abilities.int.skillPointsSpent = 0;
    this.abilities.cha.skillPointsSpent = 0;

    // Race Modifiers
    if (raceItem) {
      log("this.attributes.hp.tempMax", this.attributes.hp.tempMax);
      this.attributes.movement = raceItem.system.movement ?? this.attributes.movement;
      raceItem.system.abilityModifiers?.forEach(m => mods.abilities[m.ability] += m.modifier);
      raceItem.system.skillModifiers?.forEach(m => mods.skills[m.skill] = (mods.skills[m.skill] || 0) + m.modifier);
    }
    this.attributes.hp.tempMax = this.attributes.hp.max + (raceItem?.system.hpBonus ?? 0);
    // Class/Background Modifiers    
    [classItem, backgroundItem].forEach(item => {
      if (!item) return;
      item.system.skillModifiers?.forEach(m => mods.skills[m.skill] = (mods.skills[m.skill] || 0) + m.modifier);

    });

    // Logic: DC = Math.max(8, BaseDC) + Modifiers
    // Process Abilities
    for (let [id, ability] of Object.entries(this.abilities)) {

      const base = Math.max(8, ability.dc);
      ability.total = base + (mods.abilities[id] || 0);
      ability.skillPoints = (20 - base) * 3;
      ability.dc = base// + (mods.abilities[id] || 0);
    }

    // Process Skills
    for (let [id, skill] of Object.entries(this.skills)) {
      const base = Math.max(8, skill.dc);

      skill.total = base + (mods.skills[id] || 0);
      const cost = 20 - base;

      const mapping = CONFIG.STORYFORM.skillAbilityMap[id] ?? null;

      if (this.abilities[mapping]) {
        this.abilities[mapping].skillPointsSpent += cost;
      }

      skill.dc = base
    }

    log("derived data finished");
  }

  async _preUpdate(changed, options, user) {
    const result = await super._preUpdate(changed, options, user);
    if (result === false) return false;

    // Only validate if skills or abilities are being updated
    if (!changed.system?.skills && !changed.system?.abilities) return true;

    // Merge the changes with current data to see the "future" state
    const abilities = foundry.utils.mergeObject(this.abilities, changed.system?.abilities || {}, { inplace: false });
    const skills = foundry.utils.mergeObject(this.skills, changed.system?.skills || {}, { inplace: false });

    for (const { key: abilityKey } of CONFIG.STORYFORM.abilities) {
      const limit = (20 - abilities[abilityKey].dc) * 3;
      const spent = CONFIG.STORYFORM.skillsByAbility[abilityKey]
        .reduce((sum, { key }) => sum + (20 - skills[key].dc), 0);
      if (spent > limit) {
        const label = game.i18n.localize(`STORYFORM.Ability${abilityKey.capitalize()}`);
        ui.notifications.warn(`Warning: ${label} Skill Points exceeded! (${spent}/${limit})`);
      }
    }
    return true;
  }


}
