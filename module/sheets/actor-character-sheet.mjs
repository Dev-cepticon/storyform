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

      toggleEquip: StoryformCharacterSheet._onToggleEquip
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

    log(`Preparing context for ${this.actor.name}`);

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

    log(`Finished preparing context for ${this.actor.name}`);

    return context;
  }

  async _preparePartContext(partId, context) {

    log(`Preparing part context for: ${partId}`);

    context.tab = context.tab || {};
    context.tab.active = this.tabGroups.primary === partId;
    context.tab.cssClass = context.tab.active ? "active" : "";
    context.tab.group = "primary";
    context.tab.id = partId;

    if (partId === "details") {
      log("Enriching biography HTML...");
      context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.actor.system.details.biography ?? "",
        {
          secrets: this.actor.isOwner,
          rollData: this.actor.getRollData(),
          async: true
        }
      );
    }



    return context;
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

    const itemElement = target.closest("[data-item-id]");
   
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.actor.items.get(itemId);

    log("equiping armor: ", item.name)

    if (!item) return;

    const isEquipped = item.system.equipped ?? false;

    log(isEquipped)

    await item.update({ "system.equipped": !isEquipped });

    log(`UI Action: Toggled equipment status for ${item.name} to ${!isEquipped}`);
  }
}
