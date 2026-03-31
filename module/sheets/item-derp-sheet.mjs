const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformDerpSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "derp"],
    position: { width: 460, height: 420 },
    // No dynamic array actions needed — all fields on the
    // derp sheet save automatically via V2 form binding.
    // The hasBonus toggle is handled by the template's
    // conditional {{#if system.hasBonus}} block, which
    // re-renders automatically when the value changes.
    actions: {}
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/derp-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    const context  = await super._prepareContext(options);
    context.item   = this.item;
    context.system = this.item.system;
    return context;
  }
}
