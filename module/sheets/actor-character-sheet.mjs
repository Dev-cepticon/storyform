import { rollSkill, rollAttack, rollAbilityCheck } from "../rolls/skill-roll.mjs";

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

      changeTab: StoryformCharacterSheet._onChangeTab
    },

  };

  static PARTS = {
    header: {
      template: "systems/storyform/templates/actors/character-header.hbs"
    },
    tabs: {
      template: "systems/storyform/templates/actors/character-tabs.hbs"
    },
    details: {
      template: "systems/storyform/templates/actors/character-details.hbs",
      scrollable: [""],
      tab: { group: "primary", id: "details" }
    },
    gear: {
      template: "systems/storyform/templates/actors/character-gear.hbs",
      scrollable: [""],
      tab: { group: "primary", id: "gear" }
    },
    biography: {
      template: "systems/storyform/templates/actors/character-biography.hbs",
      scrollable: [""],
      tab: { group: "primary", id: "biography" }
    }
  };

  tabGroups = foundry.utils.deepClone(this.options.tabGroups);

  _getTabs() {
    return {
      details: {
        id: "details", group: "primary",
        label: game.i18n.localize("STORYFORM.TabDetails"),
        //active: this.tabGroups.primary === "details",
        cssClass: this.tabGroups.primary === "details" ? "active" : ""
      },
      gear: {
        id: "gear", group: "primary",
        label: game.i18n.localize("STORYFORM.TabGear"),
        //active: this.tabGroups.primary === "gear",
        cssClass: this.tabGroups.primary === "gear" ? "active" : ""
      },
      biography: {
        id: "biography", group: "primary",
        label: game.i18n.localize("STORYFORM.TabBiography"),
        //active: this.tabGroups.primary === "biography",
        cssClass: this.tabGroups.primary === "biography" ? "active" : ""
      }
    };
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actor = this.actor;
    context.system = this.actor.system;
    context.flags = this.actor.flags;
    context.tabs = this._getTabs();
    context.abilityGroups = this._getAbilityGroups();

    const a = this.actor.system.abilities;
    context.isStrOver = a.str.skillPointsSpent > a.str.skillPoints;
    context.isDexOver = a.dex.skillPointsSpent > a.dex.skillPoints;
    context.isIntOver = a.int.skillPointsSpent > a.int.skillPoints;
    context.isChaOver = a.cha.skillPointsSpent > a.cha.skillPoints;

    context.items = this.actor.items.map(i => i.toObject(false));
    return context;
  }

  async _preparePartContext(partId, context) {
    context.tab = context.tab || {};
    context.tab.active = this.tabGroups.primary === partId;
    context.tab.cssClass = context.tab.active ? "active" : "";
    context.tab.group = "primary";
    context.tab.id = partId;

    return context;
  }

  static async _onChangeTab(event, target) {
    const group = target.dataset.group;
    const tabId = target.dataset.tab;

    this.tabGroups[group] = tabId;

    this.render();
  }

  _getAbilityGroups() {
    const s = this.actor.system.skills;
    const a = this.actor.system.abilities;

    return [
      {
        key: "str",
        labelKey: "STORYFORM.AbilityStr",
        dc: a.str.dc,
        skillPoints: a.str.skillPoints,
        spent: a.str.skillPointsSpent,
        skills: [
          { key: "brawling", labelKey: "STORYFORM.SkillBrawling", dc: s.brawling.dc },
          { key: "climb", labelKey: "STORYFORM.SkillClimb", dc: s.climb.dc },
          { key: "intimidate", labelKey: "STORYFORM.SkillIntimidate", dc: s.intimidate.dc },
          { key: "athletics", labelKey: "STORYFORM.SkillAthletics", dc: s.athletics.dc }
        ]
      },
      {
        key: "dex",
        labelKey: "STORYFORM.AbilityDex",
        dc: a.dex.dc,
        skillPoints: a.dex.skillPoints,
        spent: a.dex.skillPointsSpent,
        skills: [
          { key: "melee", labelKey: "STORYFORM.SkillMelee", dc: s.melee.dc },
          { key: "shooting", labelKey: "STORYFORM.SkillShooting", dc: s.shooting.dc },
          { key: "piloting", labelKey: "STORYFORM.SkillPiloting", dc: s.piloting.dc },
          { key: "stealth", labelKey: "STORYFORM.SkillStealth", dc: s.stealth.dc }
        ]
      },
      {
        key: "int", labelKey: "STORYFORM.AbilityInt",
        dc: a.int.dc, skillPoints: a.int.skillPoints,
        spent: a.int.skillPointsSpent,
        skills: [
          { key: "firstAid", labelKey: "STORYFORM.SkillFirstAid", dc: s.firstAid.dc },
          { key: "repair", labelKey: "STORYFORM.SkillRepair", dc: s.repair.dc },
          { key: "techArcana", labelKey: "STORYFORM.SkillTechArcana", dc: s.techArcana.dc },
          { key: "perception", labelKey: "STORYFORM.SkillPerception", dc: s.perception.dc }
        ]
      },
      {
        key: "cha", labelKey: "STORYFORM.AbilityCha",
        dc: a.cha.dc, skillPoints: a.cha.skillPoints,
        spent: a.cha.skillPointsSpent,
        skills: [
          { key: "charm", labelKey: "STORYFORM.SkillCharm", dc: s.charm.dc },
          { key: "deception", labelKey: "STORYFORM.SkillDeception", dc: s.deception.dc },
          { key: "gatherInfo", labelKey: "STORYFORM.SkillGatherInfo", dc: s.gatherInfo.dc },
          { key: "haggle", labelKey: "STORYFORM.SkillHaggle", dc: s.haggle.dc }
        ]
      }
    ];
  }
  // /** @override */
  // async _onDrop(event) {
  //   // Fix: Use JSON.parse to avoid the deprecated TextEditor call
  //   const data = JSON.parse(event.dataTransfer.getData("text/plain"));
    
  //   if (data.type === "Item") {
  //     return this._onDropItem(event, data);
  //   }
    
  //   return super._onDrop(event);
  // }

  // /**
  //  * Handle dropping an Item on the sheet.
  //  */
  // async _onDropItem(event, data) {
  //   if ( !this.actor.isOwner ) return false;

  //   // Get the item from the UUID (this is an async operation)
  //   const item = await Item.fromDropData(data);
    
  //   // Safety check: ensure the item exists
  //   if ( !item ) return false;

  //   const itemData = item.toObject();

  //   // Remove the ID so Foundry generates a new one for this actor
  //   delete itemData._id;

  //   // Create the item on the actor
  //   return this.actor.createEmbeddedDocuments("Item", [itemData]);
  // }

  static async _onSkillRoll(event, target) {
    const skillKey = target.dataset.skill;
    await rollSkill(this.actor, skillKey);
  }

  static async _onAbilityRoll(event, target) {
    const abilityKey = target.dataset.ability;
    await rollAbilityCheck(this.actor, abilityKey);
  }

  static async _onAttackRoll(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const weapon = this.actor.items.get(itemId);
    if (!weapon) return;
    await rollAttack(this.actor, weapon);
  }

  static async _onEarnHeroDie(event, target) {
    const { value, max } = this.actor.system.attributes.herodice;
    if (value >= max) return ui.notifications.warn("Already at maximum Hero Dice.");
    await this.actor.update({ "system.attributes.herodice.value": value + 1 });
  }

  static async _onSpendHeroDie(event, target) {
    const current = this.actor.system.attributes.herodice.value;
    if (current <= 0) return ui.notifications.warn("No Hero Dice remaining.");
    await this.actor.update({ "system.attributes.herodice.value": current - 1 });
  }
}
