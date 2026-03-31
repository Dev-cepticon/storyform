
/**
 * Present the roll dialog and return the player's choices.
 * Returns null if they cancelled.
 *
 * @param {object} options
 * @param {string} options.label    skill or ability name for display
 * @param {object} options.dc   the base DC before modifiers
 * @param {number} options.heroDice how many hero dice actor has
 * @param {number} options.attackIndex 0= first attack 1= second 2= third
 * @returns {Promise<{heroDiceSpend: number, attackIndex: number}| null >}
 */
//import { DialogV2 } from foundry.applications.api;
async function getRollOptions({ label, dc, heroDice, attackIndex = 0 }) {
    //calculate the DC penalty for multi-attacks
    const { DialogV2 } = foundry.applications.api
    const attackPenalty = attackIndex * 2;
    const effectiveDC = dc + attackPenalty;

    return await DialogV2.wait({
        window: {
            title: "Roll Options",
            classes: ["storyform", "roll-dialog-window"]
        },
        content: `
        <form class="storyform roll-dialog" autocomplete="off">
          <div class="roll-dialog-dc">
            <span class="dc-label">DC</span>
            <span class="dc-value">${effectiveDC}</span>
            ${attackPenalty > 0
                ? `<span class="dc-penalty">(base ${dc} +${attackPenalty} penalty)</span>`
                : ""}
          </div>
          <div class="roll-dialog-hero">
            <label>
              Spend Hero Dice
              <span class="hero-available">(${heroDice} available)</span>
            </label>
            <input
              
              name="hero-dice-spend"
              type="number"
              min="0"
              max="${heroDice}"
              value="0"
            />
            <span class="hero-hint">
              Each die adds 1d6 to your roll.
            </span>
          </div>
          ${attackIndex > 0 ? `
          <div class="roll-dialog-penalty">
            <i class="fas fa-exclamation-triangle"></i>
            Attack ${attackIndex + 1} of the turn — +${attackPenalty} DC penalty applied.
          </div>
          ` : ""}
        </form>
      `,
        buttons: [
            {
                action: "roll",
                label: "Roll",
                default: true,
                callback: (event, button, dialog) => {
                    const { FormDataExtended } = foundry.applications.ux;
                    const formElement = dialog.element.querySelector("form");
                    const formdata = new FormDataExtended(formElement);
                    const spend = Math.clamp(
                        Number(formdata.object["hero-dice-spend"] ?? 0),
                        0,
                        heroDice
                    );
                    return { heroDiceSpend: spend, attackIndex };
                }
            },
            {
                action: "cancel",
                label: "Cancel",
                callback: () => null
            }
        ]
    }).catch(() => null); // X button dismissal returns null same as cancel
}

/**
 * Execute a skill roll for an actor.
 *
 * @param {Actor}  actor        The actor making the roll
 * @param {string} skillKey     Key into actor.system.skills (e.g. "stealth")
 * @param {object} [options]
 * @param {string} [options.label]        Override display label
 * @param {number} [options.dcModifier]   Extra modifier to DC (difficulties)
 * @param {number} [options.attackIndex]  0/1/2 for multi-attack penalty
 * @param {boolean}[options.skipDialog]   Skip the dialog (for macros/automation)
 * @param {number} [options.heroDiceSpend] Pre-set Hero Dice spend (used with skipDialog)
 */
export async function rollSkill(actor, skillKey, options = {}) {

    const skill = actor.system.skills[skillKey];
    if (!skill) {
        ui.notifications.warn(`Unknown skill: ${skillKey}`);
        return;
    }

    // Build the display label from localization
    const labelKey = `STORYFORM.Skill${skillKey.charAt(0).toUpperCase()}${skillKey.slice(1)}`;
    const label = options.label ?? game.i18n.localize(labelKey) ?? skillKey;

    // Base DC + any situational modifier the GM has applied
    const baseDC = (options.dcOverride ?? skill.dc) + (options.dcModifier ?? 0);
    const attackIndex = options.attackIndex ?? 0;
    const attackPenalty = attackIndex * 2;
    const effectiveDC = baseDC + attackPenalty;

    const currentHeroDice = actor.system.attributes.herodice.value;

    // ── Dialog ────────────────────────────────────────────

    let heroDiceSpend = 0;
    if (!options.skipDialog) {
        const result = await getRollOptions({
            label,
            dc: baseDC,
            heroDice: currentHeroDice,
            attackIndex
        });

        // Player cancelled
        if (result === null) return;
        console.log("result.heroDiceSpend " + result.heroDiceSpend)
        heroDiceSpend = result.heroDiceSpend;
        console.log("heroDiceSpend " + heroDiceSpend)
    } else {
        heroDiceSpend = options.heroDiceSpend ?? 0;
    }

    // ── Build the dice formula ────────────────────────────

    // Always roll 1d20
    // Add one d6 per Hero Die spent
    const formula = heroDiceSpend > 0
        ? `1d20 + ${heroDiceSpend}d6`
        : "1d20";

    const roll = await new Roll(formula).evaluate();
    const d20 = roll.dice[0].results[0].result;  // The d20 result specifically
    const total = roll.total;

    // ── Determine result ──────────────────────────────────

    const isCritical = d20 === 20;
    const isFumble = d20 === 1;
    const isSuccess = total > effectiveDC;

    let resultKey;
    if (isCritical) resultKey = "STORYFORM.RollCriticalSuccess";
    else if (isFumble) resultKey = "STORYFORM.RollCriticalFailure";
    else if (isSuccess) resultKey = "STORYFORM.RollSuccess";
    else resultKey = "STORYFORM.RollFailure";

    const resultLabel = game.i18n.localize(resultKey);

    // ── Deduct spent Hero Dice ────────────────────────────

    if (heroDiceSpend > 0) {
        await actor.update({
            "system.attributes.herodice.value":
                Math.max(0, currentHeroDice - heroDiceSpend)
        });
    }

    // ── Build chat flavor ─────────────────────────────────

    const penaltyText = attackPenalty > 0
        ? ` <span class="attack-penalty">(+${attackPenalty} penalty)</span>`
        : "";

    const heroDiceText = heroDiceSpend > 0
        ? ` <span class="hero-dice-used">+${heroDiceSpend}d6 Hero</span>`
        : "";

    const flavor = `
    <div class="storyform roll-result ${isSuccess ? "success" : "failure"} ${isCritical ? "critical" : ""} ${isFumble ? "fumble" : ""}">
      <div class="roll-header">
        <span class="roll-skill-name">${label}</span>
        <span class="roll-dc">DC ${effectiveDC}${penaltyText}</span>
      </div>
      <div class="roll-outcome">
        ${resultLabel}${heroDiceText}
      </div>
    </div>
  `;

    // ── Send to chat ──────────────────────────────────────

    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor,
        rollMode: game.settings.get("core", "rollMode")
    });

    // Return the result so callers (e.g. attack rolls)
    // can act on it
    return {
        roll,
        total,
        d20,
        effectiveDC,
        isSuccess,
        isCritical,
        isFumble,
        heroDiceSpend
    };
}
/**
 * Execute an attack roll, then roll damage on a hit.
 *
 * @param {Actor}  actor
 * @param {Item}   weapon       The weapon item being used
 * @param {object} [options]
 * @param {string} [options.skillKey]    "melee", "shooting", or "brawling"
 * @param {number} [options.attackIndex] For multi-attack penalty
 * @param {number} [options.targetDR]    Target's Damage Resistance
 * @param {number} [options.dcModifier]  Extra difficulty modifier
 */
export async function rollAttack(actor, weapon, options = {}) {

    // Determine which skill drives this attack
    const skillKey = options.skillKey ?? _getAttackSkill(weapon);

    const label = `Attack — ${weapon.name}`;

    // ── Attack roll ───────────────────────────────────────

    const attackResult = await rollSkill(actor, skillKey, {
        label,
        dcModifier: options.dcModifier ?? 0,
        attackIndex: options.attackIndex ?? 0
    });

    // Player cancelled or roll failed to execute
    if (!attackResult) return;

    // ── On a hit, roll damage ─────────────────────────────

    if (attackResult.isSuccess || attackResult.isCritical) {

        const damageFormula = weapon.system.damage
            ?? weapon.system.defaultDamage
            ?? "1d4";

        // Critical hit doubles the damage dice
        const finalFormula = attackResult.isCritical
            ? `(${damageFormula}) * 2`
            : damageFormula;

        const damageRoll = await new Roll(finalFormula).evaluate();

        // Subtract target DR — minimum 0
        const targetDR = options.targetDR ?? 0;
        const rawDamage = damageRoll.total;
        const finalDamage = Math.max(0, rawDamage - targetDR);

        const drText = targetDR > 0
            ? ` <span class="dr-note">(${rawDamage} − ${targetDR} DR)</span>`
            : "";

        const critText = attackResult.isCritical
            ? `<span class="crit-label">Critical Hit! </span>`
            : "";

        const damageFlavor = `
      <div class="storyform damage-result">
        <div class="damage-header">
          <span class="damage-weapon">${weapon.name}</span>
          <span class="damage-formula">${finalFormula}</span>
        </div>
        <div class="damage-total">
          ${critText}
          <span class="damage-value">${finalDamage}</span>
          damage${drText}
        </div>
      </div>
    `;

        await damageRoll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: damageFlavor,
            rollMode: game.settings.get("core", "rollMode")
        });

        return { attackResult, damageRoll, finalDamage };
    }

    return { attackResult, damageRoll: null, finalDamage: 0 };
}

/**
 * Determine which skill to use for an attack based on weapon category.
 * @param {Item} weapon
 * @returns {string} skill key
 */
function _getAttackSkill(weapon) {
    if (weapon.type !== "weapon") return "brawling";
    switch (weapon.system.category) {
        case "gun": return "shooting";
        case "melee": return "melee";
        default: return "brawling";
    }
}

/**
 * Roll a raw ability check when no skill applies.
 * Uses the ability's DC directly, bypassing skill DCs.
 *
 * @param {Actor}  actor
 * @param {string} abilityKey  "str" | "dex" | "int" | "cha"
 * @param {number} [dcModifier]  Situational modifier to apply on top
 */
export async function rollAbilityCheck(actor, abilityKey, dcModifier = 0) {

    const ability = actor.system.abilities[abilityKey];
    if (!ability) {
        ui.notifications.warn(`Unknown ability: ${abilityKey}`);
        return;
    }

    // Build a localized label e.g. "Strength Check"
    const labelKey = `STORYFORM.Ability${abilityKey.charAt(0).toUpperCase()}${abilityKey.slice(1)}`;
    const label = `${game.i18n.localize(labelKey)} Check`;

    // Map ability to a representative skill so rollSkill can
    // find the actor's skills object — but we override the DC
    // with the raw ability DC so the skill's trained value is ignored
    const representativeSkill = _abilityToSkill(abilityKey);

    return rollSkill(actor, representativeSkill, {
        label,
        dcModifier,
        dcOverride: ability.dc  // ← uses the ability DC, not the skill DC
    });
}

/**
 * Map an ability key to a representative skill for the check.
 * Used when a GM calls for a raw ability check.
 */
function _abilityToSkill(abilityKey) {
    const map = {
        str: "athletics",
        dex: "stealth",
        int: "perception",
        cha: "charm"
    };
    return map[abilityKey] ?? "athletics";
}