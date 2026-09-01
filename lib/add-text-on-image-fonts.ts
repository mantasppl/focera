export type TextFontId = string;

export type TextFontCategory =
  | "Sans Serif"
  | "Serif"
  | "Monospace"
  | "Display"
  | "Handwriting";

export type TextFontSource = "system" | "google";

export type TextFontOption = {
  value: TextFontId;
  label: string;
  category: TextFontCategory;
  css: string;
  weight: number;
  source: TextFontSource;
  googleFamily?: string;
};

export const TEXT_FONT_CATEGORIES: TextFontCategory[] = [
  "Sans Serif",
  "Serif",
  "Monospace",
  "Display",
  "Handwriting",
];

function fallbackFor(category: TextFontCategory): string {
  if (category === "Serif") return "serif";
  if (category === "Monospace") return "monospace";
  if (category === "Handwriting") return "cursive";
  if (category === "Display") return "sans-serif";
  return "sans-serif";
}

function systemFont(
  value: string,
  label: string,
  category: TextFontCategory,
  css: string,
  weight = 400,
): TextFontOption {
  return { value, label, category, css, weight, source: "system" };
}

function googleFont(
  value: string,
  label: string,
  category: TextFontCategory,
  family: string,
  weight = 400,
): TextFontOption {
  return {
    value,
    label,
    category,
    css: `"${family}", ${fallbackFor(category)}`,
    weight,
    source: "google",
    googleFamily: family,
  };
}

export const TEXT_FONTS: TextFontOption[] = [
  // Sans Serif — system
  systemFont(
    "system-sans",
    "System Sans",
    "Sans Serif",
    'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
  ),
  systemFont("arial", "Arial", "Sans Serif", "Arial, Helvetica, sans-serif"),
  systemFont(
    "helvetica",
    "Helvetica Neue",
    "Sans Serif",
    '"Helvetica Neue", Helvetica, Arial, sans-serif',
  ),
  systemFont("verdana", "Verdana", "Sans Serif", "Verdana, Geneva, sans-serif"),
  systemFont("tahoma", "Tahoma", "Sans Serif", "Tahoma, Geneva, sans-serif"),
  systemFont(
    "trebuchet",
    "Trebuchet MS",
    "Sans Serif",
    '"Trebuchet MS", Helvetica, sans-serif',
  ),
  systemFont(
    "segoe-ui",
    "Segoe UI",
    "Sans Serif",
    '"Segoe UI", Tahoma, Geneva, sans-serif',
  ),
  systemFont("roboto", "Roboto (System)", "Sans Serif", "Roboto, Arial, sans-serif"),
  systemFont("futura", "Futura", "Sans Serif", "Futura, Century Gothic, sans-serif"),
  systemFont(
    "century-gothic",
    "Century Gothic",
    "Sans Serif",
    '"Century Gothic", AppleGothic, sans-serif',
  ),
  systemFont(
    "gill-sans",
    "Gill Sans",
    "Sans Serif",
    '"Gill Sans", "Gill Sans MT", Calibri, sans-serif',
  ),
  systemFont(
    "lucida-sans",
    "Lucida Sans",
    "Sans Serif",
    '"Lucida Sans", "Lucida Grande", sans-serif',
  ),
  systemFont("calibri", "Calibri", "Sans Serif", "Calibri, Candara, sans-serif"),
  systemFont(
    "franklin-gothic",
    "Franklin Gothic",
    "Sans Serif",
    '"Franklin Gothic Medium", Arial, sans-serif',
  ),
  systemFont("optima", "Optima", "Sans Serif", "Optima, Segoe, sans-serif"),
  systemFont("avenir", "Avenir", "Sans Serif", "Avenir, Montserrat, sans-serif"),
  systemFont(
    "sf-pro",
    "SF Pro",
    "Sans Serif",
    '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
  ),

  // Sans Serif — Google
  googleFont("inter", "Inter", "Sans Serif", "Inter"),
  googleFont("roboto-google", "Roboto", "Sans Serif", "Roboto"),
  googleFont("open-sans", "Open Sans", "Sans Serif", "Open Sans"),
  googleFont("lato", "Lato", "Sans Serif", "Lato"),
  googleFont("montserrat", "Montserrat", "Sans Serif", "Montserrat"),
  googleFont("poppins", "Poppins", "Sans Serif", "Poppins"),
  googleFont("raleway", "Raleway", "Sans Serif", "Raleway"),
  googleFont("nunito", "Nunito", "Sans Serif", "Nunito"),
  googleFont("ubuntu", "Ubuntu", "Sans Serif", "Ubuntu"),
  googleFont("oswald", "Oswald", "Sans Serif", "Oswald"),
  googleFont("rubik", "Rubik", "Sans Serif", "Rubik"),
  googleFont("work-sans", "Work Sans", "Sans Serif", "Work Sans"),
  googleFont("dm-sans", "DM Sans", "Sans Serif", "DM Sans"),
  googleFont("pt-sans", "PT Sans", "Sans Serif", "PT Sans"),
  googleFont("fira-sans", "Fira Sans", "Sans Serif", "Fira Sans"),
  googleFont("source-sans-3", "Source Sans 3", "Sans Serif", "Source Sans 3"),
  googleFont("noto-sans", "Noto Sans", "Sans Serif", "Noto Sans"),
  googleFont("mukta", "Mukta", "Sans Serif", "Mukta"),
  googleFont("quicksand", "Quicksand", "Sans Serif", "Quicksand"),
  googleFont("barlow", "Barlow", "Sans Serif", "Barlow"),
  googleFont("karla", "Karla", "Sans Serif", "Karla"),
  googleFont("manrope", "Manrope", "Sans Serif", "Manrope"),
  googleFont("josefin-sans", "Josefin Sans", "Sans Serif", "Josefin Sans"),
  googleFont("cabin", "Cabin", "Sans Serif", "Cabin"),
  googleFont("hind", "Hind", "Sans Serif", "Hind"),
  googleFont("arimo", "Arimo", "Sans Serif", "Arimo"),
  googleFont("mulish", "Mulish", "Sans Serif", "Mulish"),
  googleFont("exo-2", "Exo 2", "Sans Serif", "Exo 2"),
  googleFont("catamaran", "Catamaran", "Sans Serif", "Catamaran"),
  googleFont("signika", "Signika", "Sans Serif", "Signika"),
  googleFont("asap", "Asap", "Sans Serif", "Asap"),
  googleFont("questrial", "Questrial", "Sans Serif", "Questrial"),
  googleFont("kanit", "Kanit", "Sans Serif", "Kanit"),
  googleFont("teko", "Teko", "Sans Serif", "Teko"),
  googleFont("be-vietnam-pro", "Be Vietnam Pro", "Sans Serif", "Be Vietnam Pro"),
  googleFont("outfit", "Outfit", "Sans Serif", "Outfit"),
  googleFont("figtree", "Figtree", "Sans Serif", "Figtree"),
  googleFont("lexend", "Lexend", "Sans Serif", "Lexend"),
  googleFont("sora", "Sora", "Sans Serif", "Sora"),
  googleFont("public-sans", "Public Sans", "Sans Serif", "Public Sans"),
  googleFont("ibm-plex-sans", "IBM Plex Sans", "Sans Serif", "IBM Plex Sans"),
  googleFont("red-hat-display", "Red Hat Display", "Sans Serif", "Red Hat Display"),
  googleFont("archivo", "Archivo", "Sans Serif", "Archivo"),
  googleFont("titillium-web", "Titillium Web", "Sans Serif", "Titillium Web"),
  googleFont("overpass", "Overpass", "Sans Serif", "Overpass"),
  googleFont("assistant", "Assistant", "Sans Serif", "Assistant"),
  googleFont("heebo", "Heebo", "Sans Serif", "Heebo"),
  googleFont("noto-sans-jp", "Noto Sans JP", "Sans Serif", "Noto Sans JP"),
  googleFont("noto-sans-kr", "Noto Sans KR", "Sans Serif", "Noto Sans KR"),
  googleFont("noto-sans-sc", "Noto Sans SC", "Sans Serif", "Noto Sans SC"),

  // Serif — system
  systemFont("georgia", "Georgia", "Serif", "Georgia, serif"),
  systemFont(
    "times-new-roman",
    "Times New Roman",
    "Serif",
    '"Times New Roman", Times, serif',
  ),
  systemFont(
    "palatino",
    "Palatino",
    "Serif",
    'Palatino, "Palatino Linotype", serif',
  ),
  systemFont("garamond", "Garamond", "Serif", 'Garamond, "Times New Roman", serif'),
  systemFont(
    "baskerville",
    "Baskerville",
    "Serif",
    'Baskerville, "Baskerville Old Face", serif',
  ),
  systemFont(
    "book-antiqua",
    "Book Antiqua",
    "Serif",
    '"Book Antiqua", Palatino, serif',
  ),
  systemFont(
    "cambria",
    "Cambria",
    "Serif",
    "Cambria, Georgia, serif",
  ),
  systemFont(
    "didot",
    "Didot",
    "Serif",
    "Didot, Bodoni MT, serif",
  ),

  // Serif — Google
  googleFont("playfair-display", "Playfair Display", "Serif", "Playfair Display"),
  googleFont("merriweather", "Merriweather", "Serif", "Merriweather"),
  googleFont("lora", "Lora", "Serif", "Lora"),
  googleFont("pt-serif", "PT Serif", "Serif", "PT Serif"),
  googleFont(
    "libre-baskerville",
    "Libre Baskerville",
    "Serif",
    "Libre Baskerville",
  ),
  googleFont("crimson-text", "Crimson Text", "Serif", "Crimson Text"),
  googleFont("eb-garamond", "EB Garamond", "Serif", "EB Garamond"),
  googleFont("cormorant", "Cormorant", "Serif", "Cormorant"),
  googleFont("bitter", "Bitter", "Serif", "Bitter"),
  googleFont("source-serif-4", "Source Serif 4", "Serif", "Source Serif 4"),
  googleFont("noto-serif", "Noto Serif", "Serif", "Noto Serif"),
  googleFont("spectral", "Spectral", "Serif", "Spectral"),
  googleFont("cardo", "Cardo", "Serif", "Cardo"),
  googleFont("vollkorn", "Vollkorn", "Serif", "Vollkorn"),
  googleFont("zilla-slab", "Zilla Slab", "Serif", "Zilla Slab"),
  googleFont("arvo", "Arvo", "Serif", "Arvo"),
  googleFont("slabo-27px", "Slabo 27px", "Serif", "Slabo 27px"),
  googleFont("literata", "Literata", "Serif", "Literata"),
  googleFont("dm-serif-display", "DM Serif Display", "Serif", "DM Serif Display"),
  googleFont("fraunces", "Fraunces", "Serif", "Fraunces"),
  googleFont("newsreader", "Newsreader", "Serif", "Newsreader"),
  googleFont("old-standard-tt", "Old Standard TT", "Serif", "Old Standard TT"),
  googleFont("rokkitt", "Rokkitt", "Serif", "Rokkitt"),
  googleFont("tinos", "Tinos", "Serif", "Tinos"),
  googleFont("noto-serif-jp", "Noto Serif JP", "Serif", "Noto Serif JP"),

  // Monospace — system
  systemFont(
    "courier-new",
    "Courier New",
    "Monospace",
    '"Courier New", Courier, monospace',
  ),
  systemFont("consolas", "Consolas", "Monospace", "Consolas, Monaco, monospace"),
  systemFont("monaco", "Monaco", "Monospace", "Monaco, Consolas, monospace"),
  systemFont(
    "lucida-console",
    "Lucida Console",
    "Monospace",
    '"Lucida Console", Monaco, monospace',
  ),

  // Monospace — Google
  googleFont("roboto-mono", "Roboto Mono", "Monospace", "Roboto Mono"),
  googleFont("fira-code", "Fira Code", "Monospace", "Fira Code"),
  googleFont("source-code-pro", "Source Code Pro", "Monospace", "Source Code Pro"),
  googleFont("jetbrains-mono", "JetBrains Mono", "Monospace", "JetBrains Mono"),
  googleFont("ibm-plex-mono", "IBM Plex Mono", "Monospace", "IBM Plex Mono"),
  googleFont("inconsolata", "Inconsolata", "Monospace", "Inconsolata"),
  googleFont("space-mono", "Space Mono", "Monospace", "Space Mono"),
  googleFont("ubuntu-mono", "Ubuntu Mono", "Monospace", "Ubuntu Mono"),
  googleFont("courier-prime", "Courier Prime", "Monospace", "Courier Prime"),
  googleFont("red-hat-mono", "Red Hat Mono", "Monospace", "Red Hat Mono"),
  googleFont("dm-mono", "DM Mono", "Monospace", "DM Mono"),
  googleFont("anonymous-pro", "Anonymous Pro", "Monospace", "Anonymous Pro"),
  googleFont("overpass-mono", "Overpass Mono", "Monospace", "Overpass Mono"),

  // Display — system
  systemFont(
    "arial-black",
    "Arial Black",
    "Display",
    '"Arial Black", Gadget, sans-serif',
    900,
  ),
  systemFont("impact", "Impact", "Display", "Impact, Haettenschweiler, sans-serif"),
  systemFont("papyrus", "Papyrus", "Display", "Papyrus, fantasy"),
  systemFont("copperplate", "Copperplate", "Display", "Copperplate, Papyrus, fantasy"),

  // Display — Google
  googleFont("bebas-neue", "Bebas Neue", "Display", "Bebas Neue"),
  googleFont("anton", "Anton", "Display", "Anton"),
  googleFont("alfa-slab-one", "Alfa Slab One", "Display", "Alfa Slab One"),
  googleFont("righteous", "Righteous", "Display", "Righteous"),
  googleFont("lobster", "Lobster", "Display", "Lobster"),
  googleFont("abril-fatface", "Abril Fatface", "Display", "Abril Fatface"),
  googleFont("bungee", "Bungee", "Display", "Bungee"),
  googleFont("black-ops-one", "Black Ops One", "Display", "Black Ops One"),
  googleFont("russo-one", "Russo One", "Display", "Russo One"),
  googleFont("permanent-marker", "Permanent Marker", "Display", "Permanent Marker"),
  googleFont("fredoka", "Fredoka", "Display", "Fredoka"),
  googleFont("bangers", "Bangers", "Display", "Bangers"),
  googleFont("passion-one", "Passion One", "Display", "Passion One"),
  googleFont("comfortaa", "Comfortaa", "Display", "Comfortaa"),
  googleFont("bungee-shade", "Bungee Shade", "Display", "Bungee Shade"),
  googleFont("creepster", "Creepster", "Display", "Creepster"),
  googleFont("monoton", "Monoton", "Display", "Monoton"),
  googleFont("press-start-2p", "Press Start 2P", "Display", "Press Start 2P"),
  googleFont("orbitron", "Orbitron", "Display", "Orbitron"),
  googleFont("audiowide", "Audiowide", "Display", "Audiowide"),
  googleFont("staatliches", "Staatliches", "Display", "Staatliches"),
  googleFont("ultra", "Ultra", "Display", "Ultra"),
  googleFont("bungee-inline", "Bungee Inline", "Display", "Bungee Inline"),

  // Handwriting — system
  systemFont("comic-sans", "Comic Sans MS", "Handwriting", '"Comic Sans MS", cursive'),
  systemFont(
    "brush-script",
    "Brush Script MT",
    "Handwriting",
    '"Brush Script MT", cursive',
  ),
  systemFont(
    "lucida-handwriting",
    "Lucida Handwriting",
    "Handwriting",
    '"Lucida Handwriting", cursive',
  ),
  systemFont(
    "segoe-script",
    "Segoe Script",
    "Handwriting",
    '"Segoe Script", cursive',
  ),

  // Handwriting — Google
  googleFont("dancing-script", "Dancing Script", "Handwriting", "Dancing Script"),
  googleFont("pacifico", "Pacifico", "Handwriting", "Pacifico"),
  googleFont("great-vibes", "Great Vibes", "Handwriting", "Great Vibes"),
  googleFont("sacramento", "Sacramento", "Handwriting", "Sacramento"),
  googleFont("caveat", "Caveat", "Handwriting", "Caveat"),
  googleFont("satisfy", "Satisfy", "Handwriting", "Satisfy"),
  googleFont("kaushan-script", "Kaushan Script", "Handwriting", "Kaushan Script"),
  googleFont("indie-flower", "Indie Flower", "Handwriting", "Indie Flower"),
  googleFont(
    "shadows-into-light",
    "Shadows Into Light",
    "Handwriting",
    "Shadows Into Light",
  ),
  googleFont("amatic-sc", "Amatic SC", "Handwriting", "Amatic SC"),
  googleFont("cookie", "Cookie", "Handwriting", "Cookie"),
  googleFont("handlee", "Handlee", "Handwriting", "Handlee"),
  googleFont("parisienne", "Parisienne", "Handwriting", "Parisienne"),
  googleFont("allura", "Allura", "Handwriting", "Allura"),
  googleFont("marck-script", "Marck Script", "Handwriting", "Marck Script"),
  googleFont("yellowtail", "Yellowtail", "Handwriting", "Yellowtail"),
  googleFont("courgette", "Courgette", "Handwriting", "Courgette"),
  googleFont("alex-brush", "Alex Brush", "Handwriting", "Alex Brush"),
  googleFont("tangerine", "Tangerine", "Handwriting", "Tangerine"),
  googleFont("bad-script", "Bad Script", "Handwriting", "Bad Script"),
  googleFont("gloria-hallelujah", "Gloria Hallelujah", "Handwriting", "Gloria Hallelujah"),
  googleFont("rock-salt", "Rock Salt", "Handwriting", "Rock Salt"),
  googleFont("homemade-apple", "Homemade Apple", "Handwriting", "Homemade Apple"),
  googleFont("reenie-beanie", "Reenie Beanie", "Handwriting", "Reenie Beanie"),
  googleFont("mr-dafoe", "Mr Dafoe", "Handwriting", "Mr Dafoe"),
  googleFont("pinyon-script", "Pinyon Script", "Handwriting", "Pinyon Script"),
  googleFont("sriracha", "Sriracha", "Handwriting", "Sriracha"),
  googleFont("covered-by-your-grace", "Covered By Your Grace", "Handwriting", "Covered By Your Grace"),
];

export const TEXT_FONT_COUNT = TEXT_FONTS.length;

export function getFontOption(fontId: TextFontId): TextFontOption {
  return TEXT_FONTS.find((option) => option.value === fontId) ?? TEXT_FONTS[0]!;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildGoogleFontsUrl(fonts: TextFontOption[]): string {
  const params = fonts
    .map(
      (font) =>
        `family=${encodeURIComponent(font.googleFamily!)}:wght@${font.weight}`,
    )
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

function injectStylesheet(href: string, id: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();

  const existing = document.getElementById(id) as HTMLLinkElement | null;
  if (existing?.href === href) return Promise.resolve();

  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
}

let fontsLoadPromise: Promise<void> | null = null;

/** Load all Google Font stylesheets used by the text-on-image tool. */
export function ensureTextFontsLoaded(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (fontsLoadPromise) return fontsLoadPromise;

  const googleFonts = TEXT_FONTS.filter(
    (font) => font.source === "google" && font.googleFamily,
  );
  const uniqueFamilies = new Map<string, TextFontOption>();
  for (const font of googleFonts) {
    const key = `${font.googleFamily}:${font.weight}`;
    if (!uniqueFamilies.has(key)) uniqueFamilies.set(key, font);
  }
  const uniqueGoogleFonts = [...uniqueFamilies.values()];
  const chunks = chunk(uniqueGoogleFonts, 45);

  fontsLoadPromise = (async () => {
    await Promise.all(
      chunks.map((group, index) =>
        injectStylesheet(
          buildGoogleFontsUrl(group),
          `add-text-on-image-fonts-${index}`,
        ),
      ),
    );
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  })();

  return fontsLoadPromise;
}

export function fontCss(fontId: TextFontId, fontSize: number): string {
  const font = getFontOption(fontId);
  return `${font.weight} ${fontSize}px ${font.css}`;
}

export async function ensureFontReady(
  fontId: TextFontId,
  fontSize: number,
): Promise<void> {
  await ensureTextFontsLoaded();
  if (typeof document === "undefined" || !document.fonts?.load) return;

  const css = fontCss(fontId, Math.max(fontSize, 12));
  try {
    await document.fonts.load(css);
  } catch {
    // Fall back to system fonts when a web font fails to load.
  }
}
