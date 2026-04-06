/**
 * CONFIG.STORYFORM
 *
 * Registered once during the `init` hook (storyform.mjs) after i18n is ready.
 * All sheets, rolls, and macros reference this object instead of rebuilding
 * these lookup tables locally.
 *
 * Ordering within each array is intentional: it controls UI display order.
 */

export function registerSystemConfig() {

  // ── Abilities ──────────────────────────────────────────────
  // Ordered: str → dex → int → cha
  const abilities = [
    { key: "str", label: "STORYFORM.AbilityStr" },
    { key: "dex", label: "STORYFORM.AbilityDex" },
    { key: "int", label: "STORYFORM.AbilityInt" },
    { key: "cha", label: "STORYFORM.AbilityCha" }
  ];

  // ── Skills ─────────────────────────────────────────────────
  // Grouped by governing ability. Order within each group
  // matches the character sheet layout.
  const skillsByAbility = {
    str: [
      { key: "brawling",   label: "STORYFORM.SkillBrawling"   },
      { key: "climb",      label: "STORYFORM.SkillClimb"      },
      { key: "intimidate", label: "STORYFORM.SkillIntimidate" },
      { key: "athletics",  label: "STORYFORM.SkillAthletics"  }
    ],
    dex: [
      { key: "melee",    label: "STORYFORM.SkillMelee"    },
      { key: "shooting", label: "STORYFORM.SkillShooting" },
      { key: "piloting", label: "STORYFORM.SkillPiloting" },
      { key: "stealth",  label: "STORYFORM.SkillStealth"  }
    ],
    int: [
      { key: "firstAid",   label: "STORYFORM.SkillFirstAid"   },
      { key: "repair",     label: "STORYFORM.SkillRepair"      },
      { key: "techArcana", label: "STORYFORM.SkillTechArcana"  },
      { key: "perception", label: "STORYFORM.SkillPerception"  }
    ],
    cha: [
      { key: "charm",      label: "STORYFORM.SkillCharm"      },
      { key: "deception",  label: "STORYFORM.SkillDeception"  },
      { key: "gatherInfo", label: "STORYFORM.SkillGatherInfo" },
      { key: "haggle",     label: "STORYFORM.SkillHaggle"     }
    ]
  };

  // Flat skill list — used by sheets that need a dropdown of all skills.
  // Derived from skillsByAbility so ordering is always consistent and
  // there is only one place to add or rename a skill.
  const skills = Object.values(skillsByAbility).flat();

  // ── Skill → Ability reverse lookup ────────────────────────
  // Derived from skillsByAbility so it can never diverge.
  // Used by CharacterData._getSkillAbilityMapping and roll logic.
  const skillAbilityMap = Object.fromEntries(
    Object.entries(skillsByAbility).flatMap(([abilityKey, skillList]) =>
      skillList.map(skill => [skill.key, abilityKey])
    )
  );

  // ── Localize all labels now that i18n is ready ─────────────
  // Sheets receive pre-localized strings — no localize call in templates.
  const localize = key => game.i18n.localize(key);

  CONFIG.STORYFORM = {
    abilities: abilities.map(a => ({ ...a, label: localize(a.label) })),
    skills:    skills.map(s    => ({ ...s, label: localize(s.label) })),
    skillsByAbility: Object.fromEntries(
      Object.entries(skillsByAbility).map(([abilityKey, skillList]) => [
        abilityKey,
        skillList.map(s => ({ ...s, label: localize(s.label) }))
      ])
    ),
    skillAbilityMap // plain string→string, no localization needed
  };
}
