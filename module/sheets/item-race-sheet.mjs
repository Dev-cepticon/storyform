const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformRaceSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "race"],
    //template: "systems/storyform/templates/items/race-sheet.hbs",
    //position: { width: 500, height: 700 },
    form: {
      submitOnClose: true,
    },
    actions: {
      addAbilityMod: StoryformRaceSheet._onAddAbilityMod,
      deleteAbilityMod: StoryformRaceSheet._onDeleteAbilityMod,
      addSkillMod: StoryformRaceSheet._onAddSkillMod,
      deleteSkillMod: StoryformRaceSheet._onDeleteSkillMod
    }
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/race-sheet.hbs",
      scrollable: [".item-body"]
    }
  };
// ── Context ───────────────────────────────────────────────
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.abilityChoices = [
      { key: "str", label: game.i18n.localize("STORYFORM.AbilityStr") },
      { key: "dex", label: game.i18n.localize("STORYFORM.AbilityDex") },
      { key: "int", label: game.i18n.localize("STORYFORM.AbilityInt") },
      { key: "cha", label: game.i18n.localize("STORYFORM.AbilityCha") }
    ];
    context.skillChoices = this._getSkillChoices();
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description ?? "",
      {
        secrets: this.item.isOwner,
        rollData: this.item.getRollData(),
        async: true
      }
    );
    return context;
  }

  _getSkillChoices() {
    // const skills = [
    //   ["brawling", "SkillBrawling"], ["climb", "SkillClimb"],
    //   ["intimidate", "SkillIntimidate"], ["athletics", "SkillAthletics"],
    //   ["melee", "SkillMelee"], ["shooting", "SkillShooting"],
    //   ["piloting", "SkillPiloting"], ["stealth", "SkillStealth"],
    //   ["firstAid", "SkillFirstAid"], ["repair", "SkillRepair"],
    //   ["techArcana", "SkillTechArcana"], ["perception", "SkillPerception"],
    //   ["charm", "SkillCharm"], ["deception", "SkillDeception"],
    //   ["gatherInfo", "SkillGatherInfo"], ["haggle", "SkillHaggle"]
    // ];
    // return skills.map(([key, loc]) => ({
    //   key, label: game.i18n.localize(`STORYFORM.${loc}`)
    // }));
    return [
      ["brawling",   "SkillBrawling"],
      ["climb",      "SkillClimb"],
      ["intimidate", "SkillIntimidate"],
      ["athletics",  "SkillAthletics"],
      ["melee",      "SkillMelee"],
      ["shooting",   "SkillShooting"],
      ["piloting",   "SkillPiloting"],
      ["stealth",    "SkillStealth"],
      ["firstAid",   "SkillFirstAid"],
      ["repair",     "SkillRepair"],
      ["techArcana", "SkillTechArcana"],
      ["perception", "SkillPerception"],
      ["charm",      "SkillCharm"],
      ["deception",  "SkillDeception"],
      ["gatherInfo", "SkillGatherInfo"],
      ["haggle",     "SkillHaggle"]
    ].map(([key, loc]) => ({
      key,
      label: game.i18n.localize(`STORYFORM.${loc}`)
    }));
  }

  _processFormData(){
    console.log("TEST")
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

  // static async _processFormData(event, form, formData) {
  // const data = foundry.utils.expandObject(formData.object);

  // if (data.system?.abilityModifiers) {
  //   data.system.abilityModifiers = Object.values(data.system.abilityModifiers);
  // }
  // if (data.system?.skillModifiers) {
  //   data.system.skillModifiers = Object.values(data.system.skillModifiers);
  // }
  // console.log("Final Data for Save:", data);
  // return data;
  // }
}
