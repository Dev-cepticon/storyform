import { rollSkill, rollAttack, rollAbilityCheck } from "../rolls/skill-roll.mjs";
import { log } from "../utility/utility.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformNpcSheet
    extends HandlebarsApplicationMixin(ActorSheetV2) {

    static DEFAULT_OPTIONS = {
        classes: ["storyform", "sheet", "actor"],
        template: "systems/storyform/templates/actors/actor-npc.hbs",
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
        position: { width: 600, height: 700 },
        tabGroups: {
            //primary: "details"
        },
        form: {
            submitOnChange: true
        },
        dragDrop: [
            { dragSelector: ".item", dropSelector: ".window-content" } // or .sheet-body""
        ],
        actions: {
            //changeTab: StoryformNpcSheet._onChangeTab,
            addAttack: StoryformNpcSheet._onAddAttack,
            removeAttack: StoryformNpcSheet._onRemoveAttack
        }

    };

    static PARTS = {
        form: {
            template: "systems/storyform/templates/actors/actor-npc.hbs"
        }
        // header: {
        //     template: "systems/storyform/templates/actors/parts/npc/npc-header.hbs"
        // },

        // tabs: {
        //     template: "systems/storyform/templates/actors/parts/npc/npc-tabs.hbs"
        // },

        // details: {
        //     template: "systems/storyform/templates/actors/parts/npc/npc-details.hbs",
        //     scrollable: [""],
        //     tab: { group: "primary", id: "details" }
        // },

        // combat: {
        //     template: "systems/storyform/templates/actors/parts/npc/npc-combat.hbs",
        //     scrollable: [""],
        //     tab: { group: "primary", id: "combat" }
        // },

        // biography: {
        //     template: "systems/storyform/templates/actors/parts/npc/npc-biography.hbs",
        //     scrollable: [""],
        //     tab: { group: "primary", id: "biography" }
        // }
    };


    /** Tabs                                     */
    // tabGroups = foundry.utils.deepClone(this.options.tabGroups);
    // _getTabs() {
    //     return {
    //         details: {
    //             id: "details",
    //             group: "primary",
    //             label: "Details",
    //             cssClass: this.tabGroups.primary === "details" ? "active" : ""
    //         },
    //         combat: {
    //             id: "combat",
    //             group: "primary",
    //             label: "Combat",
    //             cssClass: this.tabGroups.primary === "combat" ? "active" : ""
    //         },
    //         biography: {
    //             id: "biography",
    //             group: "primary",
    //             label: "Biography",
    //             cssClass: this.tabGroups.primary === "biography" ? "active" : ""
    //         }
    //     };
    // }

    /** Context                                  */
    async _prepareContext(options) {

        log(`Preparing NPC context for ${this.actor.name}`);

        const context = await super._prepareContext(options);

        context.actor = this.actor;
        context.system = this.actor.system;
        context.flags = this.actor.flags;
        //context.tabs = this._getTabs();
        context.config = {
            actorSizes: {
                "tiny": "STORYFORM.SizeTiny",
                "small": "STORYFORM.SizeSmall",
                "medium": "STORYFORM.SizeMedium",
                "large": "STORYFORM.SizeLarge",
                "huge": "STORYFORM.SizeHuge"
            },
            stances: {
                "friendly": "STORYFORM.StanceFriendly",
                "neutral": "STORYFORM.StanceNeutral",
                "hostile": "STORYFORM.StanceHostile"
            }
        };


        // Ensure attacks always exists (prevents HBS crash)
        context.system.combat = context.system.combat || {};
        context.system.combat.attacks = context.system.combat.attacks || [];

        context.abilityLabels = Object.keys(this.actor.system.abilities).reduce((acc, key) => {
            // Uses Foundry's built-in .capitalize() string extension
            acc[key] = game.i18n.localize(`STORYFORM.Ability${key.capitalize()}`);
            return acc;
        }, {});

        log(`Finished NPC context for ${this.actor.name}`);

        return context;
    }


    // async _preparePartContext(partId, context) {

    //     log(`Preparing NPC part: ${partId}`);

    //     context.tab = context.tab || {};
    //     context.tab.active = this.tabGroups.primary === partId;
    //     context.tab.cssClass = context.tab.active ? "active" : "";
    //     context.tab.group = "primary";
    //     context.tab.id = partId;

    //     if (partId === "biography") {
    //         context.enrichedBiography =
    //             await foundry.applications.ux.TextEditor.implementation.enrichHTML(
    //                 this.actor.system.details.biography ?? "",
    //                 {
    //                     secrets: this.actor.isOwner,
    //                     rollData: this.actor.getRollData(),
    //                     async: true
    //                 }
    //             );
    //     }

    //     return context;
    // }

    static async _onSubmitHelper(event, form, formData) {
        const submitData = foundry.utils.expandObject(formData.object);

        // Disable the form briefly to prevent multiple clicks/changes during save
        form.querySelectorAll("select, input").forEach(i => i.disabled = true);

        try {
            await this.document.update(submitData);
        } finally {
            // Re-enabling is handled by the natural re-render of the sheet
        }
    }

    async _onDropItem(event, data) {
        const item = await Item.fromDropData(data);
        if (!item) return;

        return super._onDropItem(event, data);
    }
    /** ---------------------------------------- */
    /** Actions                                  */
    /** ---------------------------------------- */

    // static async _onChangeTab(event, target) {

    //     const group = target.dataset.group;
    //     const tabId = target.dataset.tab;

    //     log(`NPC Tab Change: ${group} -> ${tabId}`);

    //     this.tabGroups[group] = tabId;

    //     this.render();
    // }

    /** ---------------------------------------- */
    /** Attack Management                        */
    /** ---------------------------------------- */

    static async _onAddAttack(event, target) {

        log(`Adding new attack`);

        const attacks = foundry.utils.deepClone(this.actor.system.combat.attacks || []);

        attacks.push({
            name: "",
            damage: "",
            skill: ""
        });

        await this.actor.update({
            "system.combat.attacks": attacks
        });
    }

    static async _onRemoveAttack(event, target) {

        const index = Number(target.dataset.index);

        log(`Removing attack at index ${index}`);

        const attacks = foundry.utils.deepClone(this.actor.system.combat.attacks || []);

        attacks.splice(index, 1);

        await this.actor.update({
            "system.combat.attacks": attacks
        });
    }





};



