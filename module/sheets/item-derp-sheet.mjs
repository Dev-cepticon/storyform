import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformDerpSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "derp"],
    position: { width: 460, height: 420 },
    actions: {}
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/derp-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {

    log(`Preparing context for derp item: ${this.item.name}`);

    const context  = await super._prepareContext(options);
    context.item   = this.item;
    context.system = this.item.system;

    log(`Finished preparing context for ${this.item.name}. System data:`, context.system);

    return context;
  }
}
