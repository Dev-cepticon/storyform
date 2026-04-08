import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformItemBaseSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["storyform", "sheet", "item"],
        window: {
            resizable: true,
            // The Gear icon now lives in the title bar globally
            controls: [
                {
                    icon: "fa-solid fa-gears",
                    label: "STORYFORM.Config",
                    action: "toggleSidebar" // Triggers the action below
                }
            ]
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            // Global UI Toggles
            toggleEditMode: this._onToggleEditMode,
            toggleSidebar: this._onToggleSidebar,

            // Generic Array Management
            addModifier: this._onAddModifier,
            deleteModifier: this._onDeleteModifier,
            addAction: this._onAddAction,
            deleteAction: this._onDeleteAction,
            addHDA: this._onAddHDA,
            deleteHDA: this._onDeleteHDA
        },
        tabGroups: {
            primary: "description"
        }
    };

    // ... (rest of the prepareContext logic stays the same)

    /* -------------------------------------------- */
    /* Action Handlers                             */
    /* -------------------------------------------- */

    static async _onToggleEditMode(event, target) {
        const isEditMode = this.document.system.config.editMode;
        return this.document.update({ "system.config.editMode": !isEditMode });
    }

    static async _onToggleSidebar(event, target) {
        const isSidebarOpen = this.document.system.config.showSidebar;
        // We only allow the sidebar if we are also in Edit Mode
        if (!this.document.system.config.editMode) {
            ui.notifications.warn("Enable Edit Mode to access configuration.");
            return;
        }
        return this.document.update({ "system.config.showSidebar": !isSidebarOpen });
    }

    // ── Array Manipulation Helpers ─────────────────────────────────

    async _updateArray(path, updateFn) {
        const current = foundry.utils.getProperty(this.document, path) || [];
        const newArray = foundry.utils.deepClone(current);
        console.log("newArray", newArray);
        updateFn(newArray);
        return this.document.update({ [path]: newArray });
    }

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