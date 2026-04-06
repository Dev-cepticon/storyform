import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformDerpSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "derp"],
    position: { width: 460, height: 420 },
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
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
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

    const context = await super._prepareContext(options);

    context.item = this.item;
    context.system = this.item.system;

    log("Enriching description HTML...");
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );

    log(`Finished preparing context for ${this.item.name}. System data:`, context.system);

    return context;
  }

  // ── Form Handling ───────────────────────────────────────────────
  /** @override */
  static async _processFormData(config, event, formData) {

    log("Processing form data for persistence check...");

    //Expand the flat dot-notation keys into a nested object
    const data = foundry.utils.expandObject(formData.object);

    log("Expanded Data Payload:", data);

    console.log("Saving")
    await this.item.update(data);

    return super._processFormData(event, form, formData);
  }



}
