const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformClassSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "class"],
    position: { width: 520, height: 600 },
    actions: {
      addSkillBonus:    StoryformClassSheet._onAddSkillBonus,
      deleteSkillBonus: StoryformClassSheet._onDeleteSkillBonus,
      addHDA:           StoryformClassSheet._onAddHDA,
      deleteHDA:        StoryformClassSheet._onDeleteHDA
    }
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/class-sheet.hbs",
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
    return [
      { key: "brawling",   label: game.i18n.localize("STORYFORM.SkillBrawling") },
      { key: "climb",      label: game.i18n.localize("STORYFORM.SkillClimb") },
      { key: "intimidate", label: game.i18n.localize("STORYFORM.SkillIntimidate") },
      { key: "athletics",  label: game.i18n.localize("STORYFORM.SkillAthletics") },
      { key: "melee",      label: game.i18n.localize("STORYFORM.SkillMelee") },
      { key: "shooting",   label: game.i18n.localize("STORYFORM.SkillShooting") },
      { key: "piloting",   label: game.i18n.localize("STORYFORM.SkillPiloting") },
      { key: "stealth",    label: game.i18n.localize("STORYFORM.SkillStealth") },
      { key: "firstAid",   label: game.i18n.localize("STORYFORM.SkillFirstAid") },
      { key: "repair",     label: game.i18n.localize("STORYFORM.SkillRepair") },
      { key: "techArcana", label: game.i18n.localize("STORYFORM.SkillTechArcana") },
      { key: "perception", label: game.i18n.localize("STORYFORM.SkillPerception") },
      { key: "charm",      label: game.i18n.localize("STORYFORM.SkillCharm") },
      { key: "deception",  label: game.i18n.localize("STORYFORM.SkillDeception") },
      { key: "gatherInfo", label: game.i18n.localize("STORYFORM.SkillGatherInfo") },
      { key: "haggle",     label: game.i18n.localize("STORYFORM.SkillHaggle") }
    ];
  }

  // ── Actions ───────────────────────────────────────────────

  static async _onAddSkillBonus(event, target) {
    const bonuses = foundry.utils.deepClone(this.item.system.skillBonuses);
    bonuses.push({ skill: "brawling", modifier: -1 });
    await this.item.update({ "system.skillBonuses": bonuses });
  }

  static async _onDeleteSkillBonus(event, target) {
    const index   = Number(target.dataset.index);
    const bonuses = foundry.utils.deepClone(this.item.system.skillBonuses);
    bonuses.splice(index, 1);
    await this.item.update({ "system.skillBonuses": bonuses });
  }

  static async _onAddHDA(event, target) {
    const abilities = foundry.utils.deepClone(this.item.system.heroDiceAbilities);
    abilities.push({ name: "", cost: 1, description: "" });
    await this.item.update({ "system.heroDiceAbilities": abilities });
  }

  static async _onDeleteHDA(event, target) {
    const index     = Number(target.dataset.index);
    const abilities = foundry.utils.deepClone(this.item.system.heroDiceAbilities);
    abilities.splice(index, 1);
    await this.item.update({ "system.heroDiceAbilities": abilities });
  }
}
