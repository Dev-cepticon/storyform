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
    position: { width: 480, height: 540 },
    form: {
      //handler: StoryformRaceSheet._processFormData,
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
    const context = await super._prepareContext(options);

    // Provide direct access to the Item and its DataModel (system)
    context.item = this.item;
    context.system = this.item.system;

    // Prepare selection choices for the UI
    context.abilityChoices = this._getAbilityChoices();
    context.skillChoices = this._getSkillChoices();

    // Enrich HTML for the description field (ProseMirror)

    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );


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
  static async _processFormData(config, event, formData) {
    //Expand the flat dot-notation keys into a nested object
    const data = foundry.utils.expandObject(formData.object);

    // 2. CRITICAL: expandObject turns indices into object keys (e.g., {"0": {..}})
    // We must convert these back into true Arrays [] for the DataModel.
    if (data.system?.abilityModifiers) {
      data.system.abilityModifiers = Object.values(data.system.abilityModifiers);
    }
    if (data.system?.skillModifiers) {
      data.system.skillModifiers = Object.values(data.system.skillModifiers);
    }
    console.log("Saving")
    return data;
  }

  // ── Actions ───────────────────────────────────────────────

  static async _onAddAbilityMod(event, target) {
    const mods = foundry.utils.deepClone(this.item.system.abilityModifiers);
    mods.push({ ability: "str", modifier: -1 });
    await this.item.update({ "system.abilityModifiers": mods });
  }

  static async _onDeleteAbilityMod(event, target) {
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
