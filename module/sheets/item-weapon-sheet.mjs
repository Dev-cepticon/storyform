const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformWeaponSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "weapon"],
    position: { width: 480, height: 500 },
    actions: {
      addProperty:    StoryformWeaponSheet._onAddProperty,
      deleteProperty: StoryformWeaponSheet._onDeleteProperty
    }
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/weapon-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    const context  = await super._prepareContext(options);
    context.item   = this.item;
    context.system = this.item.system;
    return context;
  }

  // ── Actions ───────────────────────────────────────────────

  static async _onAddProperty(event, target) {
    const props = foundry.utils.deepClone(this.item.system.properties);
    props.push("");
    await this.item.update({ "system.properties": props });
  }

  static async _onDeleteProperty(event, target) {
    const index = Number(target.dataset.index);
    const props = foundry.utils.deepClone(this.item.system.properties);
    props.splice(index, 1);
    await this.item.update({ "system.properties": props });
  }
}
