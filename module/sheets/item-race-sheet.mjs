import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformRaceSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "race"],
    window: {
      resizable: true,
      controls: [
        {
          icon: "fa-solid fa-gear",
          label: "STORYFORM.ItemRace",
          action: "showConfig"
        }
      ]
    },
    position: { width: 480, height: 600 },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addAbilityMod: StoryformRaceSheet._onAddAbilityMod,
      deleteAbilityMod: StoryformRaceSheet._onDeleteAbilityMod,
      addSkillMod: StoryformRaceSheet._onAddSkillMod,
      deleteSkillMod: StoryformRaceSheet._onDeleteSkillMod
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/race-sheet.hbs",
      scrollable: [".item-body"]
    }
  };
  // ── Context ───────────────────────────────────────────────
  /** @override */
  async _prepareContext(options) {

    log(`Preparing context for Race: ${this.item.name}`);

    const context = await super._prepareContext(options);

    // Provide direct access to the Item and its DataModel (system)
    context.item = this.item;
    context.system = this.item.system;

    // Prepare selection choices for the UI
    context.abilityChoices = this._getAbilityChoices();
    context.skillChoices = this._getSkillChoices();

    // Enrich HTML for the description field (ProseMirror)
    log("Enriching description HTML...");
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );

    log("Context preparation complete", context);
    return context;
  }

  _getAbilityChoices() {
    return [
      { key: "str", label: game.i18n.localize("STORYFORM.AbilityStr") },
      { key: "dex", label: game.i18n.localize("STORYFORM.AbilityDex") },
      { key: "int", label: game.i18n.localize("STORYFORM.AbilityInt") },
      { key: "cha", label: game.i18n.localize("STORYFORM.AbilityCha") }
    ];
  }

  _getSkillChoices() {
    ;
    return [
      ["brawling", "SkillBrawling"],
      ["climb", "SkillClimb"],
      ["intimidate", "SkillIntimidate"],
      ["athletics", "SkillAthletics"],
      ["melee", "SkillMelee"],
      ["shooting", "SkillShooting"],
      ["piloting", "SkillPiloting"],
      ["stealth", "SkillStealth"],
      ["firstAid", "SkillFirstAid"],
      ["repair", "SkillRepair"],
      ["techArcana", "SkillTechArcana"],
      ["perception", "SkillPerception"],
      ["charm", "SkillCharm"],
      ["deception", "SkillDeception"],
      ["gatherInfo", "SkillGatherInfo"],
      ["haggle", "SkillHaggle"]
    ].map(([key, loc]) => ({
      key,
      label: game.i18n.localize(`STORYFORM.${loc}`)
    }));
  }

  // ── Form Handling ───────────────────────────────────────────────
  /** @override */
  static async _processFormData(config, event, formData) {

    log("Processing form data for persistence check...");

    //Expand the flat dot-notation keys into a nested object
    const data = foundry.utils.expandObject(formData.object);

    log("Expanded Data Payload:", expandedData);

    if (data.system?.abilityModifiers) {
      data.system.abilityModifiers = Object.values(data.system.abilityModifiers);
    }
    if (data.system?.skillModifiers) {
      data.system.skillModifiers = Object.values(data.system.skillModifiers);
    }
    console.log("Saving")
    foundry.utils.mergeObject(formData.object, foundry.utils.flattenObject(data));
    return super._processFormData(config, event, formData);
  }

  // ── Actions ───────────────────────────────────────────────

  static async _onAddAbilityMod(event, target) {

    event.preventDefault();
    event.stopImmediatePropagation();

    const mods = foundry.utils.deepClone(this.item.system.abilityModifiers);
    mods.push({ ability: "str", modifier: -1 });
    await this.item.update({ "system.abilityModifiers": mods });
  }

  static async _onDeleteAbilityMod(event, target) {

    event.preventDefault();
    event.stopImmediatePropagation();

    const index = Number(target.dataset.index);
    const mods = foundry.utils.deepClone(this.item.system.abilityModifiers);
    mods.splice(index, 1);
    await this.item.update({ "system.abilityModifiers": mods });
  }

  static async _onAddSkillMod(event, target) {
    const mods = foundry.utils.deepClone(this.item.system.skillModifiers);
    mods.push({ skill: "brawling", modifier: -1 });
    await this.item.update({ "system.skillModifiers": mods });
  }

  static async _onDeleteSkillMod(event, target) {
    const index = Number(target.dataset.index);
    const mods = foundry.utils.deepClone(this.item.system.skillModifiers);
    mods.splice(index, 1);
    await this.item.update({ "system.skillModifiers": mods });
  }
}
