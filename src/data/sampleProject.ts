import type { StoryProject } from '../types/plotline';

export interface CoverGradientOption {
  id: string;
  name: string;
  cssGradient: string;
  accentHex: string;
}

export const COVER_GRADIENTS: CoverGradientOption[] = [
  {
    id: 'rose-quartz',
    name: 'Rose Quartz',
    cssGradient: 'linear-gradient(135deg, #FCE4EC 0%, #F8C8DC 48%, #EFA7C5 100%)',
    accentHex: '#D94F93',
  },
  {
    id: 'velvet-orchard',
    name: 'Velvet Orchard',
    cssGradient: 'linear-gradient(135deg, #F3E8F7 0%, #EFA7C5 52%, #BA86A6 100%)',
    accentHex: '#4F3048',
  },
  {
    id: 'strawberry-silk',
    name: 'Strawberry Silk',
    cssGradient: 'linear-gradient(135deg, #FFF0F5 0%, #F8C8DC 42%, #ED75A7 100%)',
    accentHex: '#B93778',
  },
  {
    id: 'plum-dusk',
    name: 'Plum Dusk',
    cssGradient: 'linear-gradient(135deg, #BA86A6 0%, #7C4E6F 55%, #4F3048 100%)',
    accentHex: '#FCE4EC',
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    cssGradient: 'linear-gradient(135deg, #FFFAFC 0%, #F3E8F7 55%, #E3C7EA 100%)',
    accentHex: '#7A4F71',
  },
  {
    id: 'blush-parchment',
    name: 'Blush Parchment',
    cssGradient: 'linear-gradient(135deg, #FFFAFC 0%, #FCE4EC 60%, #F6D2E0 100%)',
    accentHex: '#8E496C',
  },
];

export const GENRE_OPTIONS: string[] = [
  'Gothic Fantasy',
  'Mystery',
  'Romance',
  'Literary Fiction',
  'Dark Academia',
  'Historical Fiction',
  'Sci-Fi',
  'Speculative',
  'Thriller',
  'Horror',
  'Drama',
  'Interactive Fiction',
];

export function createSampleGlassOrchardProject(): StoryProject {
  const now = '2026-11-10T18:30:00.000Z';

  return {
    id: 'sample-glass-orchard',
    title: 'The Glass Orchard',
    synopsis:
      "In a secluded town where memories grow inside crystalline fruit, a young archivist discovers that someone has been altering the town's history by harvesting memories before they ripen.",
    genres: ['Gothic Fantasy', 'Mystery', 'Romance'],
    coverType: 'gradient',
    coverGradientId: 'velvet-orchard',
    isSample: true,
    createdAt: now,
    updatedAt: now,
    characters: [
      {
        id: 'char-clara-vance',
        fullName: 'Clara Vance',
        nickname: 'Clarry',
        age: '24',
        pronouns: 'she/her',
        role: 'Protagonist',
        speciesOrIdentity: 'Human (Memory-Sensitive)',
        occupation: 'Junior Archivist at the Vitreous Conservatory',
        physicalDescription:
          'Ink-stained fingertips, silver-rimmed reading spectacles, always wears a pressed linen apron with brass pruning shears tucked into the sash.',
        coreTraits: 'Observant, meticulous, quietly stubborn, deeply empathetic',
        strengths: 'Unmatched recall for archival ledgers; notices minute color shifts in crystal fruit.',
        flaws: 'Avoids direct confrontation; hides behind rules until someone she loves is threatened.',
        habits: 'Traces the rims of glass jars when anxious; keeps shorthand margins in rose-tinted ink.',
        fears: 'Losing her own childhood memories of her late mother, which are stored in Vault 4.',
        internalContradictions:
          'Reveres institutional preservation yet is willing to commit archival theft to uncover the truth.',
        externalGoal: 'Catalog the missing autumn harvest and expose whoever is falsifying town records.',
        internalDesire: 'To trust someone enough to share the weight of what she remembers.',
        centralMotivation:
          'Discovered an unripe crystal pear bearing her own handwriting from a day she has no memory of living.',
        emotionalWound:
          'Her mother voluntarily surrendered her final winter memories to pay off conservatory debts.',
        secrets:
          'She secretly visits Vault 4 after curfew to listen to her mother’s preserved laughter.',
        moralBoundaries:
          'Will never shatter an unharvested memory crystal, even to destroy incriminating evidence.',
        characterArc:
          'Moves from passive record-keeper to active guardian of living, unedited memory.',
        relationships: [
          {
            id: 'rel-clara-julian',
            targetCharacterId: 'char-julian-thorne',
            targetName: 'Julian Thorne',
            relationshipType: 'Reluctant Allies / Slow-Burn Romance',
            currentStatus: 'Guarded mutual fascination',
            majorConflicts:
              'Julian refuses to explain why the south-wall trees bloom out of season; Clara suspects he is protecting a thief.',
            hiddenFeelings:
              'Finds his quiet care for blighted trees disarming and fears he is the only person who truly sees her.',
          },
          {
            id: 'rel-clara-aurelia',
            targetCharacterId: 'char-aurelia-sterling',
            targetName: 'Magistrate Aurelia Sterling',
            relationshipType: 'Mentor / Institutional Superior',
            currentStatus: 'Formal deference masking growing suspicion',
            majorConflicts:
              'Aurelia keeps ordering early harvests under the guise of preventing memory rot.',
            hiddenFeelings:
              'Part of Clara still craves Aurelia’s approval as a substitute maternal figure.',
          },
        ],
        backstory:
          'Raised in the conservatory dormer rooms after her mother fell ill, Clara learned to classify crystalline memories before she learned to swim.',
        importantEvents:
          'Found three prematurely plucked orchard branches in the furnace room on the first frost.',
        authorsNotes:
          'Keep Clara’s voice grounded in sensory details: cold glass, sap scent, nib scratch on paper.',
        customTags: ['Archivist', 'Point-of-View', 'Vault 4'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'char-julian-thorne',
        fullName: 'Julian Thorne',
        nickname: 'Jules',
        age: '27',
        pronouns: 'he/him',
        role: 'Deuteragonist & Love Interest',
        speciesOrIdentity: 'Human',
        occupation: 'Orchard Groundskeeper & Crystal Grafter',
        physicalDescription:
          'Tall, weathered wool coat dusted with frost and crushed quartz, dark curls, calloused palms wrapped in linen tape.',
        coreTraits: 'Protective, wryly humorous, guarded, fiercely loyal',
        strengths: 'Can read the health and emotional resonance of a glass bough by touch alone.',
        flaws: 'Carries guilt alone; lies by omission to shield others from retaliation.',
        habits: 'Carves small wooden tags for nameless saplings; drinks bitter chicory tea at midnight.',
        fears: 'Being forced to graft another person’s sorrow into an innocent family’s tree.',
        internalContradictions:
          'Appears cynical about the town’s traditions, yet tends every blighted root like a sacred duty.',
        externalGoal: 'Keep the wild orchard alive long enough for the town council’s monopoly to collapse.',
        internalDesire: 'To be forgiven for the harvest he performed five winters ago.',
        centralMotivation:
          'His younger sister’s memory of their childhood was harvested unripe and traded by the Guild.',
        emotionalWound:
          'Believes his own hands are stained because he obeyed Magistrate Sterling before realizing the cost.',
        secrets:
          'He has been grafting stolen, unripe blossoms onto hidden wildwood roots beyond the wall.',
        moralBoundaries: 'Never harms a living rootstock or lies directly to Clara when asked point-blank.',
        characterArc:
          'Learns that shared truth is stronger than solitary martyrdom.',
        relationships: [
          {
            id: 'rel-julian-clara',
            targetCharacterId: 'char-clara-vance',
            targetName: 'Clara Vance',
            relationshipType: 'Ally / Romantic Interest',
            currentStatus: 'Protective distance',
            majorConflicts:
              'Every clue Clara uncovers brings her closer to the secret graft he is hiding.',
            hiddenFeelings:
              'Deeply drawn to her integrity; keeps leaving warm lanterns along her evening walk.',
          },
        ],
        backstory:
          'Apprenticed to the old orchardist at sixteen; took over the grounds after his mentor vanished during the Solstice Freeze.',
        importantEvents: 'Discovered Clara inspecting the grafted pear tree in the fog.',
        authorsNotes: 'Speaks sparingly; shows affection through practical acts and quiet attentiveness.',
        customTags: ['Groundskeeper', 'Romantic Lead', 'Wildwood'],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'char-aurelia-sterling',
        fullName: 'Magistrate Aurelia Sterling',
        nickname: 'The Glass Magistrate',
        age: '52',
        pronouns: 'she/her',
        role: 'Antagonist',
        speciesOrIdentity: 'Human',
        occupation: 'Head of the Civic Memory Guild',
        physicalDescription:
          'Impeccably tailored plum velvet coats, silver hair pinned with a quartz hairpin, calm porcelain composure.',
        coreTraits: 'Composed, visionary, manipulative, unsentimental about collateral damage',
        strengths: 'Commands civic loyalty; frames erasure as communal mercy.',
        flaws: 'Believes ordinary citizens cannot bear unedited grief without tearing the town apart.',
        habits: 'Rests one gloved hand atop her ledger before delivering verdicts.',
        fears: 'The town remembering the true cause of the Quarry Collapse twenty years ago.',
        internalContradictions:
          'Truly believes she is protecting the town’s peace while hollowing out its soul.',
        externalGoal: 'Complete the winter pruning before the Biennial Census.',
        internalDesire: 'To erase her own culpability from living history.',
        centralMotivation:
          'Harvesting memories before they ripen prevents bitter truths from crystallizing into permanent public record.',
        emotionalWound: 'Lost her brother in the Quarry Collapse her own family engineered.',
        secrets:
          'Keeps the only ripe crystal from the Collapse locked inside her private conservatory.',
        moralBoundaries: 'Avoids overt violence; prefers quiet revision and social exile.',
        characterArc:
          'Escalates from benevolent guardian to desperate censor as the orchard resists her shears.',
        relationships: [],
        backstory:
          'Rebuilt the Civic Memory Guild after the Collapse and turned memory curation into civic law.',
        importantEvents: 'Signed the midnight decree sealing the South Terrace.',
        authorsNotes: 'Never make her cartoonishly evil—her arguments should sound hauntingly reasonable.',
        customTags: ['Antagonist', 'Guild', 'Magistrate'],
        createdAt: now,
        updatedAt: now,
      },
    ],
    canonEntries: [
      {
        id: 'canon-crystal-ripening',
        title: 'Law of Crystalline Ripening',
        description:
          'Memories grow on orchard boughs as translucent blossoms that slowly harden into glass fruit over one full lunar cycle. Only ripe fruit preserves complete emotional and factual context; harvesting a fruit unripe leaves the original rememberer with an aching blank gap and produces cloudy, easily altered glass.',
        category: 'Worldbuilding',
        status: 'canon',
        linkedCharacterIds: ['char-clara-vance', 'char-julian-thorne'],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'canon-vault-four',
        title: 'Vault 4 Houses Clara’s Mother’s Winter Memories',
        description:
          'Three sealed ruby-tinted glass apples belonging to Clara’s mother sit on shelf 4B of the Vitreous Conservatory. Clara holds the duplicate brass key without the Guild’s knowledge.',
        category: 'Character',
        status: 'canon',
        linkedCharacterIds: ['char-clara-vance'],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'canon-unripe-pear',
        title: 'The Unripe Pear Bearing Clara’s Handwriting',
        description:
          'Inside the conservatory’s condemned furnace room, Clara recovered a cloudy, prematurely plucked glass pear etched with her own archival shorthand dated October 14—a date missing from her personal diary.',
        category: 'Plot',
        status: 'canon',
        linkedCharacterIds: ['char-clara-vance'],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'canon-julian-oath',
        title: 'Julian Never Lies When Asked Point-Blank',
        description:
          'Out of guilt for his past apprenticeship, Julian maintains a strict personal rule: he withholds information freely, but will not speak a direct falsehood to Clara if she asks him a direct yes-or-no question.',
        category: 'Relationship',
        status: 'canon',
        linkedCharacterIds: ['char-julian-thorne', 'char-clara-vance'],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'canon-quarry-collapse',
        title: 'The Quarry Collapse Twenty Years Ago',
        description:
          'Official town chronicles claim the Old Quartz Quarry collapsed due to an autumn tremor, but Magistrate Sterling’s family quietly sealed all surviving witness fruit during the first winter of the Guild.',
        category: 'Timeline',
        status: 'canon',
        linkedCharacterIds: ['char-aurelia-sterling'],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'canon-south-terrace',
        title: 'The South Terrace Glasshouse',
        description:
          'A mist-locked iron conservatory overlooking the ravine where unripe harvests are warmed over silver braziers so their cloudy interiors can be reshaped.',
        category: 'Location',
        status: 'canon',
        linkedCharacterIds: ['char-julian-thorne', 'char-aurelia-sterling'],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'canon-exp-belltower',
        title: 'Idea: Glass Chimes in the Belltower Warn of Tampering',
        description:
          'Experimental concept: whenever an unripe memory is melted down, the town belltower chimes off-key at dusk.',
        category: 'Worldbuilding',
        status: 'experimental',
        linkedCharacterIds: [],
        source: 'manual',
        createdAt: now,
        updatedAt: now,
      },
    ],
    plotCards: [
      {
        id: 'plot-ch1-frost-ledger',
        title: 'Chapter 1: The Frost Ledger',
        cardType: 'Chapter',
        summary:
          'Clara discovers a discrepancy in the autumn harvest weights and finds the cloudy glass pear etched with her own shorthand hidden behind the conservatory boiler.',
        order: 1,
        relatedCharacterIds: ['char-clara-vance', 'char-aurelia-sterling'],
        location: 'Vitreous Conservatory — Furnace Room',
        status: 'Drafting',
        authorsNotes: 'Open with the sound of glass fruit clicking in the freezing wind.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'plot-ch2-lantern-orchard',
        title: 'Chapter 2: Pruning at Midnight',
        cardType: 'Scene',
        summary:
          'Clara follows Julian into the fog-drenched South Terrace, expecting to catch a thief, and instead finds him tending a dying sapling grafted with forbidden wildwood blossoms.',
        order: 2,
        relatedCharacterIds: ['char-clara-vance', 'char-julian-thorne'],
        location: 'The South Terrace Glasshouse',
        status: 'Planned',
        authorsNotes:
          'Remember Julian’s canon rule: when Clara asks if he plucked the October pear, he cannot lie—he changes the subject or stays silent.',
        createdAt: now,
        updatedAt: now,
      },
    ],
    whatIfSessions: [
      {
        id: 'whatif-sample-1',
        question:
          'What if Clara discovers that the missing October 14 memory was voluntarily harvested by Julian to save her life?',
        changeType: 'Relationship',
        includedExperimentalIds: [],
        contextNotice: 'Sample demonstration exploration included with The Glass Orchard.',
        isSample: true,
        createdAt: now,
        updatedAt: now,
        branches: [
          {
            id: 'branch-sample-a',
            title: 'The Mercy Theft',
            approachLabel: 'Psychological Betrayal',
            premise:
              'Julian harvested Clara’s memory of witnessing Magistrate Sterling’s illegal winter burn so the Guild would not mark Clara for exile—leaving Clara torn between gratitude and fury over having her agency stolen.',
            plotConsequences: [
              'Clara realizes Julian’s silence was protective rather than cruel, shifting her investigation toward Sterling’s inner vault.',
              'Trust between Clara and Julian fractures just as romantic tension peaks, forcing a confrontation over consent and protection.',
            ],
            charactersAffected: ['Clara Vance', 'Julian Thorne', 'Magistrate Aurelia Sterling'],
            relationshipOrMotivationChanges:
              'Clara rejects being "saved" in the dark; Julian must learn that protecting someone without their consent mirrors the Guild’s control.',
            newConflicts: [
              'If Clara restores the cloudy pear, Magistrate Sterling will immediately detect the memory resonance.',
            ],
            emotionalThematicImpact:
              'Deepens the central theme: is edited peace ever preferable to painful truth?',
            continuityConflicts: [
              {
                id: 'cc-sample-1',
                description:
                  'Requires confirming whether Julian had access to the conservatory on October 14 alongside his South Terrace duties.',
                relatedCanonTitle: 'The Unripe Pear Bearing Clara’s Handwriting',
                severity: 'needs-decision',
                resolution: 'pending',
              },
            ],
            openQuestions: [
              'Did Clara ask Julian to take the memory in the moment, or did he act unilaterally?',
            ],
            proposedCanonChanges: [
              {
                id: 'pcc-sample-1',
                title: 'October 14 Witness Incident',
                description:
                  'On October 14, Clara accidentally witnessed an illegal midnight burning of unripe Quarry Collapse crystals, and Julian plucked her memory before it ripened to spare her from Guild exile.',
                category: 'Plot',
                linkedCharacterNames: ['Clara Vance', 'Julian Thorne'],
                rationale: 'Anchors the missing diary date directly to the central mystery.',
                decision: 'pending',
              },
            ],
            status: 'experimental',
            expansions: [],
            writerNotes: 'Strong emotional center for Act II midpoint.',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'branch-sample-b',
            title: 'The Shared Ledger Pact',
            approachLabel: 'Conspiratorial Alliance',
            premise:
              'Clara’s missing October 14 memory reveals she and Julian were already secretly working together before a Guild audit forced them to erase their tracks.',
            plotConsequences: [
              'The cloudy pear turns out to be a coded cipher Clara left for herself in case her memory was wiped.',
              'Both characters must rebuild a lost alliance from scraps of mutual instinct.',
            ],
            charactersAffected: ['Clara Vance', 'Julian Thorne'],
            relationshipOrMotivationChanges:
              'Transforms suspicion into bittersweet recognition—they have fallen into the same quiet rhythms twice.',
            newConflicts: [
              'Magistrate Sterling already suspects Clara and planted a false clue inside Vault 4.',
            ],
            emotionalThematicImpact:
              'Romantic longing underscored by the ache of forgetting someone you already trusted.',
            continuityConflicts: [],
            openQuestions: [
              'What happens to Vault 4 if Sterling uses Clara’s mother’s crystals as leverage?',
            ],
            proposedCanonChanges: [
              {
                id: 'pcc-sample-2',
                title: 'Clara’s Shorthand Cipher',
                description:
                  'Clara’s rose-ink shorthand contains deliberate memory triggers designed to survive partial harvest.',
                category: 'Character',
                linkedCharacterNames: ['Clara Vance'],
                rationale: 'Pays off Clara’s archival habits.',
                decision: 'pending',
              },
            ],
            status: 'candidate',
            expansions: [],
            writerNotes: '',
            createdAt: now,
            updatedAt: now,
          },
          {
            id: 'branch-sample-c',
            title: 'The Poisoned Graft',
            approachLabel: 'Gothic Subversion',
            premise:
              'The memory in the pear is not Clara’s at all—Julian grafted his sister’s stolen memory onto Clara’s tree to keep it alive, accidentally bleeding their recollections together.',
            plotConsequences: [
              'Clara begins experiencing phantom sensations and childhood loyalties that belong to Julian’s sister.',
              'The mystery expands from political censorship into eerie, botanical memory contagion.',
            ],
            charactersAffected: ['Clara Vance', 'Julian Thorne'],
            relationshipOrMotivationChanges:
              'Creates an uncanny intimacy where Clara literally carries Julian’s deepest regret.',
            newConflicts: [
              'Separating the grafted memories risks destroying both.',
            ],
            emotionalThematicImpact:
              'Heightens the Gothic horror and moral ambiguity of memory grafting.',
            continuityConflicts: [
              {
                id: 'cc-sample-2',
                description:
                  'The pear carries Clara’s archival shorthand, so the grafting must explain how her handwriting appeared on Julian’s sister’s fruit.',
                relatedCanonTitle: 'Law of Crystalline Ripening',
                severity: 'potential-tension',
                resolution: 'pending',
              },
            ],
            openQuestions: [
              'Can two merged memories ever be cleanly separated once ripened together?',
            ],
            proposedCanonChanges: [],
            status: 'candidate',
            expansions: [],
            writerNotes: '',
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
    ],
    conversations: [
      {
        id: 'conv-sample-1',
        title: 'Opening Chapter Atmosphere & Pacing',
        attachedBranchIds: [],
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: 'msg-sample-1',
            role: 'assistant',
            content:
              "Welcome to *The Glass Orchard* studio workspace. I'm grounded in your 6 established canon entries and 3 character profiles—none of your experimental branches are treated as canon unless you explicitly attach them.\n\nWhenever you'd like to pressure-test Clara's investigation, tighten Julian's vow of honesty, or outline Chapter 2 in the South Terrace Glasshouse, just ask or choose a prompt below.",
            createdAt: now,
          },
        ],
      },
    ],
  };
}
