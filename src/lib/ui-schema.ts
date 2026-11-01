import { z } from "zod";
import { ICON_NAMES } from "@/lib/ui-icons";

/**
 * Catalogue de blocs que le modèle est autorisé à produire.
 * Chaque bloc est validé côté client avant rendu : le modèle ne peut pas
 * injecter de HTML ou de composant arbitraire.
 */

const shortText = (max = 240) => z.string().min(1).max(max);
const optionalText = (max = 500) => z.string().max(max).optional();

export const ActionSchema = z.object({
  label: shortText(60).describe("Libellé court du bouton, à l'infinitif ou à l'impératif."),
  prompt: shortText(1200).describe(
    "Message complet envoyé à l'assistant quand l'utilisateur clique. Il doit être autonome et reprendre le contexte utile."
  ),
  variant: z.enum(["primary", "secondary"]).optional(),
});

export type UIAction = z.infer<typeof ActionSchema>;

export const FormFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Identifiant de champ invalide")
    .describe("Identifiant technique du champ, sans espaces (ex: budget)."),
  label: shortText(80),
  type: z.enum(["text", "number", "textarea", "select"]),
  placeholder: optionalText(120),
  options: z.array(shortText(80)).max(12).optional(),
  required: z.boolean().optional(),
  defaultValue: optionalText(200),
});

export type UIFormField = z.infer<typeof FormFieldSchema>;

const MarkdownBlock = z.object({
  type: z.literal("markdown"),
  content: z.string().max(12000).describe("Texte Markdown. Pas de HTML brut."),
});

const HeadingBlock = z.object({
  type: z.literal("heading"),
  text: shortText(160),
  level: z.union([z.literal(2), z.literal(3)]).optional(),
});

const CalloutBlock = z.object({
  type: z.literal("callout"),
  variant: z.enum(["info", "success", "warning", "danger"]).optional(),
  title: optionalText(120),
  content: z.string().max(2000),
});

const StatsBlock = z.object({
  type: z.literal("stats"),
  items: z
    .array(
      z.object({
        label: shortText(60),
        value: shortText(40),
        hint: optionalText(100),
        trend: z.enum(["up", "down", "neutral"]).optional(),
      })
    )
    .min(1)
    .max(8),
});

const TableBlock = z.object({
  type: z.literal("table"),
  columns: z.array(shortText(80)).min(1).max(12),
  rows: z.array(z.array(z.string().max(400)).min(1).max(12)).min(1).max(50),
  caption: optionalText(200),
  filterable: z.boolean().optional(),
});

const ChartBlock = z.object({
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "area", "pie", "donut", "gauge", "histogram"]),
  title: optionalText(120),
  data: z
    .array(
      z.object({
        label: shortText(40),
        value: z.number().finite(),
      })
    )
    .min(1)
    .max(30),
  unit: optionalText(24),
  caption: optionalText(200),
});

const ChecklistBlock = z.object({
  type: z.literal("checklist"),
  title: optionalText(120),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        label: shortText(160),
        checked: z.boolean().optional(),
      })
    )
    .min(1)
    .max(20),
});

const TimelineBlock = z.object({
  type: z.literal("timeline"),
  title: optionalText(120),
  layout: z.enum(["vertical", "horizontal"]).optional(),
  progress: z.number().min(0).max(100).optional(),
  items: z
    .array(
      z.object({
        title: shortText(120),
        description: optionalText(500),
        date: optionalText(60),
        status: z.enum(["completed", "in_progress", "pending", "to_prepare"]).optional(),
      })
    )
    .min(1)
    .max(24),
});

const CompareBlock = z.object({
  type: z.literal("compare"),
  left: z.object({
    title: shortText(80),
    points: z.array(shortText(220)).min(1).max(8),
  }),
  right: z.object({
    title: shortText(80),
    points: z.array(shortText(220)).min(1).max(8),
  }),
  verdict: optionalText(400),
});

const SliderBlock = z.object({
  type: z.literal("slider"),
  title: optionalText(120),
  label: shortText(120),
  min: z.number().finite(),
  max: z.number().finite(),
  step: z.number().finite().positive().optional(),
  defaultValue: z.number().finite(),
  unit: optionalText(24),
  formula: z
    .string()
    .max(200)
    .optional()
    .describe(
      "Formule arithmétique utilisant la variable value. Ex: value * 12. Autorise + - * / ( ) et des nombres."
    ),
  resultLabel: optionalText(80),
  resultUnit: optionalText(24),
  hint: optionalText(240),
});

const FormBlock = z.object({
  type: z.literal("form"),
  title: optionalText(120),
  description: optionalText(400),
  fields: z.array(FormFieldSchema).min(1).max(8),
  submitLabel: optionalText(60),
  promptTemplate: optionalText(1200).describe(
    "Modèle de message avec des variables {{nom_du_champ}}. Si absent, les valeurs sont ajoutées automatiquement."
  ),
});

const ActionsBlock = z.object({
  type: z.literal("actions"),
  title: optionalText(120),
  actions: z.array(ActionSchema).min(1).max(6),
});

const safeUrl = z
  .string()
  .url()
  .max(500)
  .refine((value) => /^https?:\/\//i.test(value), "URL http(s) attendue");

const SourcesBlock = z.object({
  type: z.literal("sources"),
  items: z
    .array(
      z.object({
        title: shortText(160),
        url: safeUrl.optional(),
        snippet: optionalText(300),
      })
    )
    .min(1)
    .max(8),
});

const iconName = z.enum(ICON_NAMES);

const TabsBlock = z.object({
  type: z.literal("tabs"),
  title: optionalText(120),
  tabs: z
    .array(
      z.object({
        label: shortText(40),
        icon: iconName.optional(),
        content: z.string().max(3000).describe("Texte Markdown du panneau. Pas de HTML."),
        points: z.array(shortText(220)).max(8).optional(),
      })
    )
    .min(2)
    .max(8),
});

const CardsBlock = z.object({
  type: z.literal("cards"),
  title: optionalText(120),
  layout: z.enum(["grid", "carousel"]).optional(),
  items: z
    .array(
      z.object({
        title: shortText(80),
        text: optionalText(400),
        icon: iconName.optional(),
        badge: optionalText(30),
        prompt: optionalText(1200).describe(
          "Message autonome envoyé à l'assistant si l'utilisateur clique sur la carte. Optionnel."
        ),
      })
    )
    .min(1)
    .max(12),
});

const StepsBlock = z.object({
  type: z.literal("steps"),
  title: optionalText(120),
  items: z
    .array(
      z.object({
        title: shortText(120),
        description: optionalText(300),
        detail: optionalText(1500).describe("Détail affiché quand l'utilisateur déplie l'étape."),
      })
    )
    .min(1)
    .max(12),
});

const FlashcardsBlock = z.object({
  type: z.literal("flashcards"),
  title: optionalText(120),
  cards: z
    .array(
      z.object({
        front: shortText(300),
        back: shortText(600),
      })
    )
    .min(1)
    .max(16),
});

const CalculatorBlock = z.object({
  type: z.literal("calculator"),
  title: optionalText(120),
  description: optionalText(300),
  inputs: z
    .array(
      z.object({
        name: z
          .string()
          .min(1)
          .max(30)
          .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, "Identifiant invalide")
          .describe("Nom de variable utilisable dans les formules (ex: capital)."),
        label: shortText(80),
        min: z.number().finite(),
        max: z.number().finite(),
        step: z.number().finite().positive().optional(),
        defaultValue: z.number().finite(),
        unit: optionalText(24),
      })
    )
    .min(1)
    .max(6),
  outputs: z
    .array(
      z.object({
        label: shortText(80),
        formula: z
          .string()
          .min(1)
          .max(300)
          .describe(
            "Expression utilisant les noms des entrées, + - * / % ^, parenthèses et min max abs sqrt round floor ceil pow."
          ),
        unit: optionalText(24),
        decimals: z.number().int().min(0).max(6).optional(),
        highlight: z.boolean().optional(),
      })
    )
    .min(1)
    .max(6),
  hint: optionalText(240),
});

const MapBlock = z.object({
  type: z.literal("map"),
  title: optionalText(120),
  markers: z
    .array(
      z.object({
        label: shortText(80),
        lat: z.number().finite().min(-90).max(90),
        lng: z.number().finite().min(-180).max(180),
        category: optionalText(40),
        icon: optionalText(8).describe("Un seul emoji pour l'épingle ; sinon l'épingle affiche son numéro."),
        description: optionalText(240),
      })
    )
    .min(1)
    .max(20),
  route: z.boolean().optional().describe("Trace l'itinéraire routier entre les marqueurs, dans l'ordre."),
  height: z.number().int().min(200).max(720).optional(),
  caption: optionalText(200),
});

const SvgBlock = z.object({
  type: z.literal("svg"),
  title: optionalText(120),
  description: optionalText(400),
  code: z.string().min(1).max(35000).describe("Code SVG standard valide (<svg ...>...</svg>)."),
  svg: z.string().max(35000).optional(),
  viewBox: optionalText(60),
  caption: optionalText(200),
  animated: z.boolean().optional(),
});

const DiagramBlock = z.object({
  type: z.literal("diagram"),
  diagramType: z.enum([
    "mindmap",
    "flowchart",
    "network",
    "architecture",
    "sequence",
    "circuit",
    "tree",
    "concept",
    "process",
    "annotated-plan",
  ]),
  title: optionalText(120),
  description: optionalText(300),
  nodes: z
    .array(
      z.object({
        id: shortText(40),
        label: shortText(120),
        category: optionalText(40),
        description: optionalText(240),
        color: optionalText(30),
        icon: optionalText(8),
        shape: z.enum(["round", "rect", "pill", "diamond", "cylinder"]).optional(),
        x: z.number().optional(),
        y: z.number().optional(),
      })
    )
    .min(1)
    .max(30),
  edges: z
    .array(
      z.object({
        from: shortText(40),
        to: shortText(40),
        label: optionalText(60),
        style: z.enum(["solid", "dashed", "animated"]).optional(),
        relation: optionalText(40),
        arrow: z.boolean().optional(),
      })
    )
    .max(50)
    .optional(),
  interactive: z.boolean().optional(),
  animated: z.boolean().optional(),
});

const MockupBlock = z.object({
  type: z.literal("mockup"),
  device: z.enum(["desktop", "mobile", "web", "tablet"]),
  title: optionalText(120),
  activeScreenId: optionalText(40),
  screens: z
    .array(
      z.object({
        id: shortText(40),
        name: shortText(60),
        type: z.enum(["login", "chat", "dashboard", "form", "menu", "custom"]),
        title: optionalText(80),
        subtitle: optionalText(160),
        elements: z
          .array(
            z.object({
              id: shortText(40),
              kind: z.enum([
                "navbar",
                "sidebar",
                "button",
                "input",
                "card",
                "chat-bubble",
                "kpi",
                "avatar",
                "text",
                "image",
                "menu-item",
                "badge",
              ]),
              label: optionalText(120),
              targetScreenId: optionalText(40),
              variant: z.enum(["primary", "secondary", "outline", "ghost", "danger"]).optional(),
              value: optionalText(200),
              meta: optionalText(120),
            })
          )
          .min(1)
          .max(24),
      })
    )
    .min(1)
    .max(8),
});

const QuizBlock = z.object({
  type: z.literal("quiz"),
  title: optionalText(120),
  description: optionalText(300),
  questions: z
    .array(
      z.object({
        id: shortText(40),
        question: shortText(300),
        explanation: optionalText(500),
        hint: optionalText(200),
        options: z
          .array(
            z.object({
              id: shortText(20),
              label: shortText(200),
              correct: z.boolean().optional(),
            })
          )
          .min(2)
          .max(6),
      })
    )
    .min(1)
    .max(12),
});

const ImageStudioBlock = z.object({
  type: z.literal("imageStudio"),
  title: optionalText(120),
  prompt: shortText(600),
  category: z.enum([
    "illustration",
    "poster",
    "background",
    "icon",
    "logo",
    "cover",
    "synthesis",
    "classic",
  ]),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
  url: safeUrl.optional(),
  svg: z.string().max(35000).optional(),
  caption: optionalText(240),
  elements: z
    .array(
      z.object({
        id: shortText(40),
        label: shortText(80),
        color: optionalText(30),
        type: z.enum(["subject", "background", "accent", "text", "icon"]).optional(),
      })
    )
    .max(12)
    .optional(),
});

const KpiBlock = z.object({
  type: z.literal("kpi"),
  title: optionalText(120),
  items: z
    .array(
      z.object({
        label: shortText(80),
        value: shortText(40),
        change: optionalText(30),
        trend: z.enum(["up", "down", "neutral"]).optional(),
        status: z.enum(["success", "warning", "danger", "neutral"]).optional(),
        target: optionalText(60),
        hint: optionalText(120),
      })
    )
    .min(1)
    .max(8),
});

const VisualDocBlock = z.object({
  type: z.literal("visualDoc"),
  title: shortText(160),
  docType: z.enum(["sheet", "poster", "cover", "report", "pedagogy", "synthesis"]),
  subtitle: optionalText(200),
  author: optionalText(80),
  badge: optionalText(40),
  sections: z
    .array(
      z.object({
        heading: shortText(120),
        content: z.string().max(2000),
        takeaway: optionalText(300),
        highlight: z.boolean().optional(),
        bullets: z.array(shortText(200)).max(8).optional(),
      })
    )
    .min(1)
    .max(8),
});

const TravelBlock = z.object({
  type: z.literal("travel"),
  title: optionalText(140),
  origin: z.object({
    name: shortText(100),
    lat: z.number().finite().min(-90).max(90).optional(),
    lng: z.number().finite().min(-180).max(180).optional(),
    address: optionalText(200),
  }),
  destination: z.object({
    name: shortText(100),
    lat: z.number().finite().min(-90).max(90).optional(),
    lng: z.number().finite().min(-180).max(180).optional(),
    address: optionalText(200),
  }),
  distanceKm: z.number().finite().positive().optional(),
  summary: optionalText(400),
  recommendation: optionalText(400),
  flight: z
    .object({
      duration: shortText(60),
      direct: z.boolean().optional(),
      airports: z.object({
        departure: shortText(100),
        arrival: shortText(100),
        departureCode: optionalText(10),
        arrivalCode: optionalText(10),
      }),
      prices: z.object({
        eco: shortText(60),
        premium: optionalText(60),
        business: optionalText(60),
      }),
      co2Kg: z.number().finite().optional(),
      airlines: z.array(shortText(60)).max(8).optional(),
      frequency: optionalText(80),
      transfers: optionalText(200),
      tips: optionalText(400),
    })
    .optional(),
  train: z
    .object({
      duration: shortText(60),
      stations: z.object({
        departure: shortText(100),
        arrival: shortText(100),
      }),
      trainTypes: z.array(shortText(60)).max(8).optional(),
      prices: z
        .object({
          standard: shortText(60),
          firstClass: optionalText(60),
        })
        .optional(),
      price: optionalText(60),
      transfers: z.number().int().min(0).optional(),
      connections: optionalText(400),
      co2Kg: z.number().finite().optional(),
      frequency: optionalText(80),
      tips: optionalText(400),
    })
    .optional(),
  car: z
    .object({
      duration: shortText(60),
      distance: shortText(60),
      tolls: optionalText(60),
      routeHighway: optionalText(120),
      thermal: z.object({
        consumption: shortText(80),
        fuelCost: shortText(80),
        totalCost: optionalText(80),
        co2Kg: z.number().finite().optional(),
        gasStations: z
          .array(
            z.object({
              name: shortText(100),
              location: optionalText(100),
              brand: optionalText(60),
              services: z.array(shortText(60)).max(8).optional(),
            })
          )
          .max(8)
          .optional(),
      }),
      electric: z.object({
        autonomy: shortText(80),
        chargingStops: z.number().int().min(0),
        chargingTime: shortText(80),
        chargingCost: shortText(80),
        totalCost: optionalText(80),
        co2Kg: z.number().finite().optional(),
        superchargers: z
          .array(
            z.object({
              name: shortText(100),
              location: optionalText(100),
              powerKw: optionalText(40),
              stalls: optionalText(40),
              duration: optionalText(60),
            })
          )
          .max(8)
          .optional(),
      }),
      tips: optionalText(400),
    })
    .optional(),
  walking: z
    .object({
      duration: shortText(60),
      distance: shortText(60),
      steps: optionalText(60),
      calories: optionalText(60),
      elevation: optionalText(80),
      difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
      highlights: z.array(shortText(160)).max(10).optional(),
      tips: optionalText(400),
    })
    .optional(),
  mapMarkers: z
    .array(
      z.object({
        label: shortText(100),
        lat: z.number().finite().min(-90).max(90),
        lng: z.number().finite().min(-180).max(180),
        category: optionalText(60),
        icon: optionalText(8),
        description: optionalText(300),
      })
    )
    .max(24)
    .optional(),
});

export const MathBlock = z.object({
  type: z.literal("math"),
  title: shortText(160),
  description: optionalText(500),
  topic: z
    .enum(["algebra", "geometry", "analysis", "statistics", "trigonometry", "finance", "general"])
    .optional(),
  summary: optionalText(400),
  formulas: z
    .array(
      z.object({
        latex: shortText(500),
        name: shortText(120),
        explanation: optionalText(400),
        variables: z
          .array(
            z.object({
              symbol: shortText(40),
              meaning: shortText(120),
              value: optionalText(80),
            })
          )
          .max(12)
          .optional(),
        steps: z
          .array(
            z.object({
              step: z.number().int(),
              title: shortText(120),
              latex: shortText(500),
              explanation: optionalText(400),
            })
          )
          .max(12)
          .optional(),
      })
    )
    .max(8)
    .optional(),
  geometry: z
    .object({
      shapeType: z.enum([
        "triangle",
        "right_triangle",
        "circle",
        "trig_circle",
        "polygon",
        "pythagoras",
        "thales",
        "cartesian_vectors",
        "custom_svg",
      ]),
      title: optionalText(120),
      description: optionalText(400),
      theorems: z.array(shortText(160)).max(6).optional(),
      properties: z
        .array(
          z.object({
            label: shortText(80),
            value: shortText(80),
          })
        )
        .max(12)
        .optional(),
      svgCode: z.string().max(30000).optional(),
    })
    .optional(),
  functionPlot: z
    .object({
      fn: shortText(160).describe("Expression analytique de la fonction, ex: x^2 - 4*x + 3 ou sin(x)"),
      label: shortText(80),
      fn2: optionalText(160),
      label2: optionalText(80),
      xMin: z.number().finite().default(-10),
      xMax: z.number().finite().default(10),
      yMin: z.number().finite().optional(),
      yMax: z.number().finite().optional(),
      step: z.number().finite().positive().optional(),
      asymptotes: z.array(z.number().finite()).max(4).optional(),
      keyPoints: z
        .array(
          z.object({
            x: z.number().finite(),
            y: z.number().finite(),
            label: shortText(80),
            type: z.enum(["root", "extremum", "inflection", "intercept", "custom"]).optional(),
          })
        )
        .max(12)
        .optional(),
      description: optionalText(400),
    })
    .optional(),
  spreadsheet: z
    .object({
      title: optionalText(120),
      description: optionalText(400),
      columns: z
        .array(
          z.object({
            id: shortText(40),
            header: shortText(80),
            formula: optionalText(120),
          })
        )
        .min(1)
        .max(12),
      rows: z
        .array(z.record(z.string(), z.union([z.string(), z.number()])))
        .min(1)
        .max(50),
      summary: optionalText(400),
    })
    .optional(),
});

export const BlockSchema = z.discriminatedUnion("type", [
  MapBlock,
  TabsBlock,
  CardsBlock,
  StepsBlock,
  FlashcardsBlock,
  CalculatorBlock,
  MarkdownBlock,
  HeadingBlock,
  CalloutBlock,
  StatsBlock,
  TableBlock,
  ChartBlock,
  ChecklistBlock,
  TimelineBlock,
  CompareBlock,
  SliderBlock,
  FormBlock,
  ActionsBlock,
  SourcesBlock,
  SvgBlock,
  DiagramBlock,
  MockupBlock,
  QuizBlock,
  ImageStudioBlock,
  KpiBlock,
  VisualDocBlock,
  TravelBlock,
  MathBlock,
]);

export type UIBlock = z.infer<typeof BlockSchema>;
export type BlockType = UIBlock["type"];

export const UIResponseSchema = z.object({
  title: z.string().max(160).optional(),
  blocks: z.array(BlockSchema).min(1).max(24),
  followUps: z.array(shortText(180)).max(6).optional(),
});

export type UIResponse = z.infer<typeof UIResponseSchema>;

export const BLOCK_TYPES = BlockSchema.options.map((option) => option.shape.type.value) as BlockType[];

export const MAX_BLOCKS = 8;
