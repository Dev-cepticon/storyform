import { log } from "../utility/utility.mjs";

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

    log(`Preparing context for armor item: ${this.item.name}`);

    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;

    log("Enriching armor description HTML...");

    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description ?? "",
      {
        secrets: this.item.isOwner,
        rollData: this.item.getRollData(),
        async: true
      }
    );

    log(`Finished preparing context for ${this.item.name}`);

    return context;
  }

  // ── Actions ───────────────────────────────────────────────

  static async _onAddProperty(event, target) {

    log(`UI Action: Adding property to ${this.item.name}`);

    const props = foundry.utils.deepClone(this.item.system.properties);
    props.push("");

    log(`Updating item properties. New count: ${props.length}`);
    
    await this.item.update({ "system.properties": props });
  }

  static async _onDeleteProperty(event, target) {

    const index = Number(target.dataset.index);
    const props = foundry.utils.deepClone(this.item.system.properties);

    log(`UI Action: Deleting property at index ${index} from ${this.item.name}`);

    props.splice(index, 1);

    log(`Updating item properties. New count: ${props.length}`);

    await this.item.update({ "system.properties": props });
  }

  async _processFormData(event, form, formData) {

    const data = foundry.utils.expandObject(formData.object);
    
    log(`Processing form data for ${this.item.name}. Saving updates...`);

    await this.item.update(data);
  }
}