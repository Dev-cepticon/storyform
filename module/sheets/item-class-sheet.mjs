import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformClassSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "class"],
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
    position: { width: 520, height: 600 },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addSkillMod: StoryformClassSheet._onAddSkillMod,       
      deleteSkillMod: StoryformClassSheet._onDeleteSkillMod, 
      addHDA: StoryformClassSheet._onAddHDA,
      deleteHDA: StoryformClassSheet._onDeleteHDA
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/class-sheet.hbs",
      scrollable: [""]
    }
  };

  /** @override */
  async _prepareContext(options) {

    log(`Preparing context for class item: ${this.item.name}`);

    const context = await super._prepareContext(options);

    // Provide direct access to the Item and its DataModel (system)
    context.item = this.item;
    context.system = this.item.system;

    log("Fetching skill choices for class configuration...");
    context.skillChoices = CONFIG.STORYFORM.skills;

    log("Enriching description HTML...");
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );

    log(`Finished preparing context for ${this.item.name}`);

    return context;
  }



  // ── Form Handling ───────────────────────────────────────────────
  /** @override */
  static async _processFormData(config, event, formData) {

    log("Processing form data for persistence check...");

    //Expand the flat dot-notation keys into a nested object
    const data = foundry.utils.expandObject(formData.object);

    log("Expanded Data Payload:", expandedData);

    if (data.system?.skillModifiers) {
      data.system.skillModifiers = Object.values(data.system.skillModifiers);
    }
    console.log("Saving")
    foundry.utils.mergeObject(formData.object, foundry.utils.flattenObject(data));
    return super._processFormData(config, event, formData);
  }


  // ── Actions ───────────────────────────────────────────────

  static async _onAddSkillMod(event, target) {

    log(`UI Action: Adding skill bonus to class ${this.item.name}`);

    const mods = foundry.utils.deepClone(this.item.system.skillModifiers);
    mods.push({ skill: "brawling", modifier: -1 });

    log(`Updating class skill bonuses. New count: ${mods.length}`);

    await this.item.update({ "system.skillModifiers": mods });
  }

  static async _onDeleteSkillMod(event, target) {
    const index = Number(target.dataset.index);
    const mods = foundry.utils.deepClone(this.item.system.skillModifiers);

    log(`UI Action: Deleting skill bonus at index ${index} from class ${this.item.name}`);

    mods.splice(index, 1);

    log(`Updating class skill bonuses. New count: ${mods.length}`);

    await this.item.update({ "system.skillModifiers": mods });
  }

  static async _onAddHDA(event, target) {

    log(`UI Action: Adding Hero Dice Ability (HDA) to class ${this.item.name}`);

    const abilities = foundry.utils.deepClone(this.item.system.heroDiceAbilities);
    abilities.push({ name: "", cost: 1, description: "" });

    log(`Updating class HDAs. New count: ${abilities.length}`);

    await this.item.update({ "system.heroDiceAbilities": abilities });
  }

  static async _onDeleteHDA(event, target) {
    const index = Number(target.dataset.index);
    const abilities = foundry.utils.deepClone(this.item.system.heroDiceAbilities);

    log(`UI Action: Deleting Hero Dice Ability (HDA) at index ${index} from class ${this.item.name}`);

    abilities.splice(index, 1);

    log(`Updating class HDAs. New count: ${abilities.length}`);

    await this.item.update({ "system.heroDiceAbilities": abilities });
  }
}
