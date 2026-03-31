const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformBackgroundSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "background"],
    position: { width: 480, height: 540 },
    actions: {
      addSkillBonus:    StoryformBackgroundSheet._onAddSkillBonus,
      deleteSkillBonus: StoryformBackgroundSheet._onDeleteSkillBonus,
      addHDA:           StoryformBackgroundSheet._onAddHDA,
      deleteHDA:        StoryformBackgroundSheet._onDeleteHDA
    }
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/background-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    const context  = await super._prepareContext(options);
    context.item   = this.item;
    context.system = this.item.system;
    context.skillChoices = this._getSkillChoices();
    return context;
  }

  _getSkillChoices() {
    const skills = [
      ["brawling",   "SkillBrawling"],   ["climb",      "SkillClimb"],
      ["intimidate", "SkillIntimidate"], ["athletics",  "SkillAthletics"],
      ["melee",      "SkillMelee"],      ["shooting",   "SkillShooting"],
      ["piloting",   "SkillPiloting"],   ["stealth",    "SkillStealth"],
      ["firstAid",   "SkillFirstAid"],   ["repair",     "SkillRepair"],
      ["techArcana", "SkillTechArcana"], ["perception", "SkillPerception"],
      ["charm",      "SkillCharm"],      ["deception",  "SkillDeception"],
      ["gatherInfo", "SkillGatherInfo"], ["haggle",     "SkillHaggle"]
    ];
    return skills.map(([key, loc]) => ({
      key, label: game.i18n.localize(`STORYFORM.${loc}`)
    }));
  }

  // ── Actions ───────────────────────────────────────────────
  // Note: oncePerturn fields save automatically through V2's
  // form binding — no handler needed for those fields.

  static async _onAddSkillBonus(event, target) {
    const bonuses = foundry.utils.deepClone(this.item.system.skillBonuses);
    bonuses.push({ skill: "brawling", modifier: -1, type: "related" });
    await this.item.update({ "system.skillBonuses": bonuses });
  }

  static async _onDeleteSkillBonus(event, target) {
    const index   = Number(target.dataset.index);
    const bonuses = foundry.utils.deepClone(this.item.system.skillBonuses);
    bonuses.splice(index, 1);
    await this.item.update({ "system.skillBonuses": bonuses });
  }

  static async _onAddHDA(event, target) {
    const abilities = foundry.utils.deepClone(
      this.item.system.heroDiceAbilities
    );
    abilities.push({ name: "", cost: 1, description: "" });
    await this.item.update({ "system.heroDiceAbilities": abilities });
  }

  static async _onDeleteHDA(event, target) {
    const index     = Number(target.dataset.index);
    const abilities = foundry.utils.deepClone(
      this.item.system.heroDiceAbilities
    );
    abilities.splice(index, 1);
    await this.item.update({ "system.heroDiceAbilities": abilities });
  }
}
