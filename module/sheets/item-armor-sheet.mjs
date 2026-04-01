const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformArmorSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "armor"],
    template: "systems/storyform/templates/items/armor-sheet.hbs",
    position: { width: 480, height: 460 },
    form: {
      submitOnChange: true
    },
    actions: {
      addProperty: StoryformArmorSheet._onAddProperty,
      deleteProperty: StoryformArmorSheet._onDeleteProperty
    }
  };

  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/armor-sheet.hbs",
      scrollable: [""]
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
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

  async _processFormData(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    //console.log("saving")
    await this.item.update(data);
    return super._processFormData(event, form, formData);
  }
}
