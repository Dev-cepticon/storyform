import { log } from "../utility/utility.mjs";

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

    log(`Preparing context for class item: ${this.item.name}`);

    const context  = await super._prepareContext(options);
    context.item   = this.item;
    context.system = this.item.system;

    log("Fetching skill choices for class configuration...");

    context.skillChoices = this._getSkillChoices();

    log(`Finished preparing context for ${this.item.name}`);

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

    log(`UI Action: Adding skill bonus to class ${this.item.name}`);

    const bonuses = foundry.utils.deepClone(this.item.system.skillBonuses);
    bonuses.push({ skill: "brawling", modifier: -1 });

    log(`Updating class skill bonuses. New count: ${bonuses.length}`);

    await this.item.update({ "system.skillBonuses": bonuses });
  }

  static async _onDeleteSkillBonus(event, target) {
    const index   = Number(target.dataset.index);
    const bonuses = foundry.utils.deepClone(this.item.system.skillBonuses);

    log(`UI Action: Deleting skill bonus at index ${index} from class ${this.item.name}`);

    bonuses.splice(index, 1);

    log(`Updating class skill bonuses. New count: ${bonuses.length}`);

    await this.item.update({ "system.skillBonuses": bonuses });
  }

  static async _onAddHDA(event, target) {

    log(`UI Action: Adding Hero Dice Ability (HDA) to class ${this.item.name}`);

    const abilities = foundry.utils.deepClone(this.item.system.heroDiceAbilities);
    abilities.push({ name: "", cost: 1, description: "" });

    log(`Updating class HDAs. New count: ${abilities.length}`);

    await this.item.update({ "system.heroDiceAbilities": abilities });
  }

  static async _onDeleteHDA(event, target) {
    const index     = Number(target.dataset.index);
    const abilities = foundry.utils.deepClone(this.item.system.heroDiceAbilities);

    log(`UI Action: Deleting Hero Dice Ability (HDA) at index ${index} from class ${this.item.name}`);

    abilities.splice(index, 1);

    log(`Updating class HDAs. New count: ${abilities.length}`);
    
    await this.item.update({ "system.heroDiceAbilities": abilities });
  }
}
