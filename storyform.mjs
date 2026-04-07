import CharacterData from "./module/data/actor-character.mjs";
import NpcData from "./module/data/actor-npc.mjs";
import WeaponData from "./module/data/item-weapon.mjs";
import ArmorData from "./module/data/item-armor.mjs";
import ClassData from "./module/data/item-class.mjs";
import RaceData from "./module/data/item-race.mjs";
import BackgroundData from "./module/data/item-background.mjs";
import DerpData from "./module/data/item-derp.mjs";

import StoryformCharacterSheet
  from "./module/sheets/actor-character-sheet.mjs";
import StoryformNpcSheet
  from "./module/sheets/actor-npc-sheet.mjs";
import StoryformWeaponSheet
  from "./module/sheets/item-weapon-sheet.mjs";
import StoryformArmorSheet
  from "./module/sheets/item-armor-sheet.mjs";
import StoryformClassSheet
  from "./module/sheets/item-class-sheet.mjs";
import StoryformRaceSheet
  from "./module/sheets/item-race-sheet.mjs";
import StoryformBackgroundSheet
  from "./module/sheets/item-background-sheet.mjs";
import StoryformDerpSheet
  from "./module/sheets/item-derp-sheet.mjs";

import { rollSkill, rollAttack, rollAbilityCheck }
  from "./module/rolls/skill-roll.mjs";

import { log } from "./module/utility/utility.mjs";
import { registerSystemConfig } from "./module/utility/config.mjs";

Hooks.once("i18nInit", () => {
  registerSystemConfig();
  log("Storyform | System config registered (i18nInit).");
});

// ── Initialization Hook ────────────────────────────────────
Hooks.once("init", () => {
  log("Storyform | Initializing system");

  log("Preloading templates and registering helpers...");
  preloadHandlebarsTemplates();
  registerHandlebarsHelpers();

  // ── Data Models ───────────────────────────────────────────
  log("Registering Actor and Item Data Models...");
  CONFIG.Actor.dataModels = {
    character: CharacterData,
    npc: NpcData
  };

  CONFIG.Item.dataModels = {
    weapon: WeaponData,
    armor: ArmorData,
    class: ClassData,
    race: RaceData,
    background: BackgroundData,
    derp: DerpData
  };

  // ── Sheet Registration ────────────────────────────────────
  log("Configuring Sheet Registrations...");

  const { Actors: ActorsCollection, Items: ItemsCollection } =
    foundry.documents.collections;

  const actorSheets = [
    [StoryformCharacterSheet, "character", "Character"],
    [StoryformNpcSheet, "npc", "NPC"],
  ];

  ActorsCollection.unregisterSheet("core", foundry.appv1.sheets.ActorSheet, {
    types: ["character", "npc"]
  });

  for (const [sheet, type, label] of actorSheets) {
    ActorsCollection.registerSheet("storyform", sheet, {
      types: [type],
      makeDefault: true,
      label: `Storyform ${label} Sheet`
    });
  }

  log("Actor sheets registered.");

  ItemsCollection.unregisterSheet("core", foundry.appv1.sheets.ItemSheet, {
    types: ["weapon", "armor", "class", "race", "background", "derp"]
  });

  const itemSheets = [
    [StoryformWeaponSheet, "weapon", "Weapon"],
    [StoryformArmorSheet, "armor", "Armor"],
    [StoryformClassSheet, "class", "Class"],
    [StoryformRaceSheet, "race", "Race"],
    [StoryformBackgroundSheet, "background", "Background"],
    [StoryformDerpSheet, "derp", "Derp"]
  ];

  for (const [sheet, type, label] of itemSheets) {
    ItemsCollection.registerSheet("storyform", sheet, {
      types: [type],
      makeDefault: true,
      label: `Storyform ${label} Sheet`
    });
    log(`Registered ${label} sheet for type: ${type}`);
  }
  log("Initialization complete.");
});

// ── Ready Hook ─────────────────────────────────────────────
Hooks.once("ready", async () => {
  log("Storyform | System ready");

  // Expose roll functions globally so macros can call them.
  // e.g. game.storyform.rollSkill(actor, "stealth")
  game.storyform = {
    rollSkill,
    rollAttack,
    rollAbilityCheck
  };
  log("Global API exposed to game.storyform");

  if (!game.user.isGM) return;
  log("Performing GM-only setup routines...");
  // GM-only setup goes here

});

// ── Handlebars ────────────────────────────────────────────

function preloadHandlebarsTemplates() {

  log("Loading template partials...");
  const templatePaths = [
    "systems/storyform/templates/items/parts/origins/origin-modifiers.hbs",
    "systems/storyform/templates/items/parts/origins/origin-herodice.hbs",
    "systems/storyform/templates/items/parts/origins/origin-actions.hbs"
  ];
  return foundry.applications.handlebars.loadTemplates(templatePaths);
}

function registerHandlebarsHelpers() {

  log("Registering system Handlebars helpers...");

  Handlebars.registerHelper("equals", function (v1, v2) {
    return v1 === v2;
  });

  Handlebars.registerHelper("contains", function (element, search) {
    return element.includes(search);
  });

  Handlebars.registerHelper("concat", function (s1, s2, s3) {
    return s1 + s2 + s3;
  });

  Handlebars.registerHelper("isGreater", function (p1, p2) {
    return p1 > p2;
  });

  Handlebars.registerHelper("isEqualOrGreater", function (p1, p2) {
    return p1 >= p2;
  });

  Handlebars.registerHelper("ifOr", function (c1, c2) {
    return c1 || c2;
  });

  Handlebars.registerHelper("doLog", function (value) {
    console.log(value);
  });

  Handlebars.registerHelper("toBoolean", function (string) {
    return string === "true";
  });

  Handlebars.registerHelper("for", function (from, to, incr, content) {
    let result = "";
    for (let i = from; i < to; i += incr)
      result += content.fn(i);
    return result;
  });

  Handlebars.registerHelper("times", function (n, content) {
    let result = "";
    for (let i = 0; i < n; i++)
      result += content.fn(i);
    return result;
  });

  Handlebars.registerHelper("notEmpty", function (value) {
    if (value === null || value === undefined || value === "") return false;
    if (value === 0 || value === "0") return false;
    return true;
  });

  Handlebars.registerHelper("numRange", function (from, to) {
    const result = [];
    for (let i = from; i <= to; i++) {
      result.push(i);
    }
    return result;
  });
  Handlebars.registerHelper('capitalize', function (string) {
    if (!string || typeof string !== "string") return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  });

}
