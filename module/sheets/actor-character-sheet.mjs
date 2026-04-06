import { rollSkill, rollAttack, rollAbilityCheck } from "../rolls/skill-roll.mjs";
import { log } from "../utility/utility.mjs";

const { ActorSheetV2 } = foundry.applications.sheets;
const { HandlebarsApplicationMixin } = foundry.applications.api;

export default class StoryformCharacterSheet
  extends HandlebarsApplicationMixin(ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["storyform", "sheet", "actor", "character"],
    template: "systems/storyform/templates/actors/actor-character.hbs",
    position: { width: 680, height: 740 },
    tabGroups: {
      primary: "details"
    },
    dragDrop: [
      { dragSelector: ".item", dropSelector: ".window-content" } // or .sheet-body""
    ],
    form: {
      submitOnChange: true
    },
    actions: {
      skillRoll: StoryformCharacterSheet._onSkillRoll,
      abilityRoll: StoryformCharacterSheet._onAbilityRoll,
      attackRoll: StoryformCharacterSheet._onAttackRoll,
      earnHeroDie: StoryformCharacterSheet._onEarnHeroDie,
      spendHeroDie: StoryformCharacterSheet._onSpendHeroDie,

      changeTab: StoryformCharacterSheet._onChangeTab,

      toggleEquip: StoryformCharacterSheet._onToggleEquip,
      delete: StoryformCharacterSheet._onDeleteItem
    },

  };

  static PARTS = {
    header: {
      template: "systems/storyform/templates/actors/parts/character/character-header.hbs"
    },
    tabs: {
      template: "systems/storyform/templates/actors/parts/character/character-tabs.hbs"
    },
    details: {
      template: "systems/storyform/templates/actors/parts/character/character-details.hbs",
      scrollable: [""],
      tab: { group: "primary", id: "details" }
    },
    gear: {
      template: "systems/storyform/templates/actors/parts/character/character-gear.hbs",
      scrollable: [""],
      tab: { group: "primary", id: "gear" }
    },
    biography: {
      template: "systems/storyform/templates/actors/parts/character/character-biography.hbs",
      scrollable: [""],
      tab: { group: "primary", id: "biography" }
    }
  };

  tabGroups = foundry.utils.deepClone(this.options.tabGroups);

  /** @override */
  _getTabs() {
    return [
      { id: "details", group: "primary", label: game.i18n.localize("STORYFORM.TabDetails"), icon: "fa-solid fa-address-card" },
      { id: "gear", group: "primary", label: game.i18n.localize("STORYFORM.TabGear"), icon: "fa-solid fa-backpack" },
      { id: "biography", group: "primary", label: game.i18n.localize("STORYFORM.TabBiography"), icon: "fa-solid fa-sparkles" }
    ];
  }

  async _prepareContext(options) {

    log(`Preparing context for ${this.actor.name}`);

    const context = await super._prepareContext(options);

    context.actor = this.actor;
    context.system = this.actor.system;
    context.flags = this.actor.flags;
    context.navTabs = this._getTabs();
    context.abilityGroups = this._getAbilityGroups();
    context.CONFIG = CONFIG.STORYFORM;

    const a = this.actor.system.abilities;
    context.isStrOver = a.str.skillPointsSpent > a.str.skillPoints;
    context.isDexOver = a.dex.skillPointsSpent > a.dex.skillPoints;
    context.isIntOver = a.int.skillPointsSpent > a.int.skillPoints;
    context.isChaOver = a.cha.skillPointsSpent > a.cha.skillPoints;

    context.items = this.actor.items.map(i => i.toObject(false));

    log(`Finished preparing context for ${this.actor.name}`);

    return context;
  }

 /** @override */
  async _preparePartContext(partId, context) {
    const activeTabId = this.tabGroups.primary;
    const isActive = activeTabId === partId;

    // 1. Link Tab State
    // We flatten the framework's tab groups to find the metadata for this specific part
    const allTabs = context.tabs ? Object.values(context.tabs).flat() : [];
    context.tab = allTabs.find(t => t.id === partId) || {
      id: partId,
      active: isActive,
      cssClass: isActive ? "active" : ""
    };

    // 2. Specialized Logic
    if (partId === "details") {
      context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.actor.system.details.biography ?? "",
        {
          secrets: this.actor.isOwner,
          rollData: this.actor.getRollData(),
          async: true
        }
      );
    }

    // 3. Flow Tracking
    log(`Flow: Render Part [${partId}] | Active: ${isActive}`);

    return context;
  }

  _getAbilityGroups() {
    const s = this.actor.system.skills;
    const a = this.actor.system.abilities;

    // Structure is driven by CONFIG.STORYFORM.skillsByAbility — skills are
    // never hardcoded here. Adding a skill to config.mjs propagates automatically.
    return CONFIG.STORYFORM.abilities.map(({ key: abilityKey }) => ({
      key: abilityKey,
      labelKey: `STORYFORM.Ability${abilityKey.charAt(0).toUpperCase()}${abilityKey.slice(1)}`,
      dc: a[abilityKey].dc,
      skillPoints: a[abilityKey].skillPoints,
      spent: a[abilityKey].skillPointsSpent,
      skills: CONFIG.STORYFORM.skillsByAbility[abilityKey].map(({ key: skillKey, label }) => ({
        key: skillKey,
        labelKey: `STORYFORM.Skill${skillKey.charAt(0).toUpperCase()}${skillKey.slice(1)}`,
        label,
        dc: s[skillKey].dc
      }))
    }));
  }

  /** @override */
  async _onDropItem(event, data) {
    const item = await Item.fromDropData(data);
    if (!item) return;

    // List of types that act as unique "Origins"
    const originTypes = ["race", "class", "background"];

    if (originTypes.includes(item.type)) {
      // Find any existing item of this type on the actor
      const existing = this.actor.itemTypes[item.type].map(i => i.id);
      if (existing.length > 0) {
        // Remove the previous origin item before adding the new one
        await this.actor.deleteEmbeddedDocuments("Item", existing);
      }
    }

    return super._onDropItem(event, data);
  }

  static async _onChangeTab(event, target) {
    const group = target.dataset.group;
    const tabId = target.dataset.tab;

    log(`Changing tab: Group=${group}, Tab=${tabId}`);

    this.tabGroups[group] = tabId;

    this.render();
  }

  static async _onSkillRoll(event, target) {

    const skillKey = target.dataset.skill;

    log(`UI Action: Skill Roll triggered for ${skillKey}`);

    await rollSkill(this.actor, skillKey);
  }

  static async _onAbilityRoll(event, target) {

    const abilityKey = target.dataset.ability;

    log(`UI Action: Ability Roll triggered for ${abilityKey}`);

    await rollAbilityCheck(this.actor, abilityKey);
  }

  static async _onAttackRoll(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const weapon = this.actor.items.get(itemId);

    log(`UI Action: Attack Roll triggered for weapon: ${weapon?.name ?? 'Unknown'}`);

    if (!weapon) return;
    await rollAttack(this.actor, weapon);
  }

  static async _onEarnHeroDie(event, target) {
    const { value, max } = this.actor.system.attributes.herodice;

    log(`UI Action: Earn Hero Die. Current: ${value}/${max}`);

    if (value >= max) return ui.notifications.warn("Already at maximum Hero Dice.");
    await this.actor.update({ "system.attributes.herodice.value": value + 1 });
  }

  static async _onSpendHeroDie(event, target) {
    const current = this.actor.system.attributes.herodice.value;

    log(`UI Action: Manual Spend Hero Die. Current: ${current}`);

    if (current <= 0) return ui.notifications.warn("No Hero Dice remaining.");
    await this.actor.update({ "system.attributes.herodice.value": current - 1 });
  }

  static async _onToggleEquip(event, target) {

    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);

    log("equiping armor: ", item.name)

    if (!item) return;

    const isEquipped = item.system.equipped ?? false;

    await item.update({ "system.equipped": !isEquipped });

    log(`UI Action: Toggled equipment status for ${item.name} to ${!isEquipped}`);
  }
  static async _onDeleteItem(event, target) {
    event.preventDefault();

    // Find the item ID from the closest parent list item
    const li = target.closest("[data-item-id]");
    const itemId = li?.dataset.itemId;
    const item = this.actor.items.get(itemId);

    if (!item) {
      log(`Delete failed: Item ID ${itemId} not found on Actor ${this.actor.name}`, "warn");
      return;
    }

    log(`UI Action: Deleting item "${item.name}" from ${this.actor.name}`);

    // Perform the deletion
    return item.delete();
  }
}
