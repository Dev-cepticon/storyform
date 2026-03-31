const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformWeaponSheet
  extends HandlebarsApplicationMixin(ItemSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "item", "weapon"],
    template: "systems/storyform/templates/items/weapon-sheet.hbs",
    position: { width: 480, height: 500 },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    actions: {
      addProperty: StoryformWeaponSheet._onAddProperty,
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
    const context = await super._prepareContext(options);
    context.item = this.item;
    context.system = this.item.system;
    context.editable = this.isEditable;
    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description ?? "",
      {
        secrets: this.item.isOwner,
        rollData: this.item.getRollData(),
        async: true
      }
    );
    console.log(context.enrichedDescription);
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
    console.log("V13 Process Form Data:", data);
    return super._processFormData(event, form, formData);
  }


  // _onRender(context, options) {
  //   super._onRender(context, options);

  //   // Find the prosemirror element
  //   const html = this.element;
  //   const editor = html.querySelector("prose-mirror");

  //   if (editor) {
  //     // Force a form submission when the editor saves (checkmark click)
  //     editor.addEventListener("save", () => {
  //       this.submit();
  //       console.log("Manual submission triggered via ProseMirror Save");
  //     });
  //   }
  // }

  // /** @override */
  // async _updateObject(event, formData) {
  //   // Debug: See what the sheet thinks 'system.description' is during save
  //   console.log("Form Data being saved:", formData);
  //   return this.item.update(formData);
  // }
}
