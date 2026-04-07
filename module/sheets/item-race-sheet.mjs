import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformRaceSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "race"],
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
    position: { width: 480, height: 600 },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      // Modifiers (Abilities/Skills)
      addModifier: this._onAddModifier,
      deleteModifier: this._onDeleteModifier,
      // Once Per Turn Actions
      addAction: this._onAddAction,
      deleteAction: this._onDeleteAction,
      // Hero Dice
      addHDA: this._onAddHDA,
      deleteHDA: this._onDeleteHDA,
    }
  };

  /** @override */
  static PARTS = {
    form: {
      template: "systems/storyform/templates/items/race-sheet.hbs",
      scrollable: [".item-body"]
    }
  };
  // ── Context ───────────────────────────────────────────────
  /** @override */
  async _prepareContext(options) {

    log(`Preparing context for Race: ${this.item.name}`);

    const context = await super._prepareContext(options);

    // Provide direct access to the Item and its DataModel (system)
    context.item = this.item;
    context.system = this.item.system;
    context.abilityChoices = CONFIG.STORYFORM.abilities;
    context.skillChoices = CONFIG.STORYFORM.skills;

    log("STORYFORM | Ability Choices:", context.abilityChoices);
    log("STORYFORM | Skill Choices:", context.skillChoices);


    // Enrich HTML for the description field (ProseMirror)
    log("Enriching description HTML...");
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      { async: true }
    );

    log("Context preparation complete", context);
    return context;
  }

  // ── Form Handling ───────────────────────────────────────────────
  /** @override */
  static async _processFormData(config, event, formData) {
    const data = foundry.utils.expandObject(formData.object);

    // Uniformly convert all potential array-objects back to arrays
    const arrayPaths = [
      "system.abilityModifiers",
      "system.skillModifiers",
      "system.oncePerturn",
      "system.heroDiceAbilities"
    ];

    for (const path of arrayPaths) {
      const val = foundry.utils.getProperty(data, path);
      if (val && typeof val === "object") {
        foundry.utils.setProperty(data, path, Object.values(val));
      }
    }

    foundry.utils.mergeObject(formData.object, foundry.utils.flattenObject(data));
    return super._processFormData(config, event, formData);
  }
  // ── Array Manipulation Helpers ─────────────────────────────────

  async _updateArray(path, updateFn) {
    const current = foundry.utils.getProperty(this.document, path) || [];
    const newArray = foundry.utils.deepClone(current);
    console.log("newArray", newArray);
    updateFn(newArray);
    return this.document.update({ [path]: newArray });
  }

  // ACTIONS
  static async _onAddModifier(event, target) {
    const { path, typeKey } = target.dataset;
    const defaultVal = typeKey === "ability" ? "str" : "athletics";
    return this._updateArray(path, arr => arr.push({ [typeKey]: defaultVal, modifier: 0 }));
  }

  /**
   * Handle deleting an entry from a modifiers array.
   * @param {PointerEvent} event      The initiating click event
   * @param {HTMLElement} target      The element that matched the [data-action]
   */
  static async _onDeleteModifier(event, target) {
    const { path, index } = target.dataset;
    return this._updateArray(path, arr => arr.splice(Number(index), 1));
  }

  static async _onAddAction(event, target) {
    // 'this' in an action handler is the Sheet instance
    console.log("ADDING");
    return this._updateArray("system.oncePerturn", arr =>
      arr.push({ name: "New Ability", description: "" }));
  }

  static async _onDeleteAction(event, target) {
    console.log("DELETEING");
    const index = Number(target.dataset.index);
    return this._updateArray("system.oncePerturn", arr => arr.splice(index, 1));
  }

  static async _onAddHDA(event, target) {
    return this._updateArray("system.heroDiceAbilities", arr =>
      arr.push({ name: "New Ability", cost: 1, description: "" }));
  }

  static async _onDeleteHDA(event, target) {
    const index = Number(target.dataset.index);
    return this._updateArray("system.heroDiceAbilities", arr => arr.splice(index, 1));
  }

}
