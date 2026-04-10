import { log } from "../utility/utility.mjs";

const { ItemSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformItemBaseSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["storyform", "sheet", "item"],
        window: {
            resizable: true,
        },
        form: {
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            // Global UI Toggles
            toggleEditMode: this._onToggleEditMode,
            toggleSidebar: this._onToggleSidebar,
            config: this._onToggleSidebar,

            editImage: this._onEditImage,

            // Generic Array Management
            addModifier: this._onAddModifier,
            deleteModifier: this._onDeleteModifier,
            addAction: this._onAddAction,
            deleteAction: this._onDeleteAction,
            addHDA: this._onAddHDA,
            deleteHDA: this._onDeleteHDA,

        },
        tabGroups: {
            primary: "description"
        }
    };

    get title() {
        // Returning an empty string removes the text while keeping the bar
        return "";
    }



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

    /**
     * Handle clicking the document image to swap the file.
     * @param {PointerEvent} event      The initiating click event
     * @param {HTMLElement} target      The element that matched the [data-action]
     */
    static async _onEditImage(event, target) {
        // 'this' refers to the Sheet instance in these handlers
        const attr = target.dataset.edit || "img";
        const current = foundry.utils.getProperty(this.document, attr);

        // Create and open the FilePicker
        const fp = new FilePicker({
            type: "image",
            current: current,
            callback: path => {
                // Update the document with the new path
                return this.document.update({ [attr]: path });
            },
            top: this.position.top + 40,
            left: this.position.left + 10
        });
        return fp.browse();
    }

    // ── Array Manipulation Helpers ─────────────────────────────────

    async _updateArray(path, updateFn) {
        const current = foundry.utils.getProperty(this.document, path) || [];
        const newArray = foundry.utils.deepClone(current);

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