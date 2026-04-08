import StoryformItemBaseSheet from "./item-base-sheet.mjs";
import { log } from "../utility/utility.mjs";

/**
 * The Sheet class for the 'Race' item type.
 * Inherits all global logic from StoryformItemBaseSheet.
 * @extends {StoryformItemBaseSheet}
 */
export default class StoryformRaceSheet extends StoryformItemBaseSheet {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "race"],
    window: {
      title: "STORYFORM.ItemRace",
    },
    // Pointers for the Master Shell to render the correct content
    mainTemplate: "systems/storyform/templates/items/race-main.hbs",
    sidebarTemplate: "systems/storyform/templates/items/parts/config/race-config.hbs",
    actions: {
      tab: this._onTabClick,
    }
  };

  /** @override */
  static PARTS = {
    // We only need one PART: the master shell. 
    // The shell handles the header, tabs, and sidebar internally.
    form: {
      template: "systems/storyform/templates/items/item-shell.hbs",
      scrollable: [".item-main-content", ".item-config-sidebar"]
    }
  };

  /* -------------------------------------------- */
  /* Context Preparation                          */
  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {

    log(`Preparing context for Race: ${this.item.name}`);
    // 1. Get base context (item, system, config, etc.)
    const context = await super._prepareContext(options);

    context.item = this.item; 
    context.system = this.item.system;

    // 2. Add Race-specific data for dropdowns
    context.abilityChoices = CONFIG.STORYFORM.abilities;
    context.skillChoices = CONFIG.STORYFORM.skills;

    const activeTab = this.tabGroups.primary || "description";

    // 2. Build the tabs object for Handlebars
    context.tabs = {
      primary: {
        active: activeTab,
        [activeTab]: "active" // This allows {{tabs.primary.description}} to return "active"
      }
    };

    context.mainTemplate = this.options.mainTemplate;
    context.sidebarTemplate = this.options.sidebarTemplate;


    log("Enriching description HTML...");
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );
    log("Context preparation complete", context);
    return context;
  }

  static _onTabClick(event, target) {
    console.log("clicked");
    // const group = target.dataset.group;
    // const tab = target.dataset.tab;
    // this.tabGroups[group] = tab;
    // this.render();
  }
}