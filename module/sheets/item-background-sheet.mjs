import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformBackgroundSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "background"],
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
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addSkillMod: StoryformBackgroundSheet._onAddSkillMod,
      deleteSkillMod: StoryformBackgroundSheet._onDeleteSkillMod,
      addHDA: StoryformBackgroundSheet._onAddHDA,
      deleteHDA: StoryformBackgroundSheet._onDeleteHDA
    }
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/background-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {

    log(`Preparing context for background item: ${this.item.name}`);

    const context = await super._prepareContext(options);

    // Provide direct access to the Item and its DataModel (system)
    context.item = this.item;
    context.system = this.item.system;

    // Prepare selection choices for the UI
    context.skillChoices = this._getSkillChoices();

    // Enrich HTML for the description field (ProseMirror)
    log("Enriching description HTML...");
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );

    log(`Finished preparing context for ${this.item.name}`);

    return context;
  }

  _getSkillChoices() {

    log("Generating skill choices for background dropdowns...");

    const skills = [
      ["brawling", "SkillBrawling"], ["climb", "SkillClimb"],
      ["intimidate", "SkillIntimidate"], ["athletics", "SkillAthletics"],
      ["melee", "SkillMelee"], ["shooting", "SkillShooting"],
      ["piloting", "SkillPiloting"], ["stealth", "SkillStealth"],
      ["firstAid", "SkillFirstAid"], ["repair", "SkillRepair"],
      ["techArcana", "SkillTechArcana"], ["perception", "SkillPerception"],
      ["charm", "SkillCharm"], ["deception", "SkillDeception"],
      ["gatherInfo", "SkillGatherInfo"], ["haggle", "SkillHaggle"]
    ];
    return skills.map(([key, loc]) => ({
      key, label: game.i18n.localize(`STORYFORM.${loc}`)
    }));
  }

  // ── Actions ───────────────────────────────────────────────
  // Note: oncePerturn fields save automatically through V2's
  // form binding — no handler needed for those fields.

  static async _onAddSkillMod(event, target) {

    log(`UI Action: Adding skill bonus to ${this.item.name}`);

    const mods = foundry.utils.deepClone(this.item.system.skillModifiers);
    mods.push({ skill: "brawling", modifier: -1, type: "related" });

    log(`Updating skill bonuses. New count: ${mods.length}`);

    await this.item.update({ "system.skillModifiers": mods });
  }

  static async _onDeleteSkillMod(event, target) {

    const index = Number(target.dataset.index);
    const mods = foundry.utils.deepClone(this.item.system.skillModifiers);

    log(`UI Action: Deleting skill bonus at index ${index} from ${this.item.name}`);

    mods.splice(index, 1);

    log(`Updating skill modifiers. New count: ${mods.length}`);

    await this.item.update({ "system.skillModifiers": mods });
  }

  static async _onAddHDA(event, target) {

    log(`UI Action: Adding Hero Dice Ability (HDA) to ${this.item.name}`);

    const abilities = foundry.utils.deepClone(
      this.item.system.heroDiceAbilities
    );
    abilities.push({ name: "", cost: 1, description: "" });

    log(`Updating Hero Dice Abilities. New count: ${abilities.length}`);

    await this.item.update({ "system.heroDiceAbilities": abilities });
  }

  static async _onDeleteHDA(event, target) {
    const index = Number(target.dataset.index);
    const abilities = foundry.utils.deepClone(
      this.item.system.heroDiceAbilities
    );

    log(`UI Action: Deleting Hero Dice Ability (HDA) at index ${index} from ${this.item.name}`);

    abilities.splice(index, 1);

    log(`Updating Hero Dice Abilities. New count: ${abilities.length}`);

    await this.item.update({ "system.heroDiceAbilities": abilities });
  }
}
