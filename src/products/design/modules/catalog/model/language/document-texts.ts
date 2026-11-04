import { getLocale } from "@shared/core";

import type { BrochureSettings } from "../../brochure";
import type { DocumentTexts } from "./language.types";

/** The English words, and those of a language with none of its own. */
const ENGLISH: DocumentTexts = {
  items: {
    "page-number": "Page number",
    "page-of": "Page of total",
    title: "Brochure title",
    section: "Section name",
    folio: "Section and page",
    date: "Date",
    toc: "Table of contents",
  },
  pageOf: "Page {page} of {pages}",
  left: "left",
  right: "right",
};

/**
 * What a brochure writes in each language it can be in. These are the document's words, not the
 * app's, so they're kept here rather than in the app's translations, for every brochure language.
 */
export const DOCUMENT_TEXTS: Readonly<Record<string, DocumentTexts>> = {
  en: ENGLISH,
  es: {
    items: {
      "page-number": "Número de página",
      "page-of": "Página de total",
      title: "Título del folleto",
      section: "Nombre de la sección",
      folio: "Sección y página",
      date: "Fecha",
      toc: "Índice",
    },
    pageOf: "Página {page} de {pages}",
    left: "izquierda",
    right: "derecha",
  },
  fr: {
    items: {
      "page-number": "Numéro de page",
      "page-of": "Page sur total",
      title: "Titre de la brochure",
      section: "Nom de la section",
      folio: "Section et page",
      date: "Date",
      toc: "Table des matières",
    },
    pageOf: "Page {page} sur {pages}",
    left: "gauche",
    right: "droite",
  },
  pt: {
    items: {
      "page-number": "Número da página",
      "page-of": "Página de total",
      title: "Título do folheto",
      section: "Nome da seção",
      folio: "Seção e página",
      date: "Data",
      toc: "Sumário",
    },
    pageOf: "Página {page} de {pages}",
    left: "esquerda",
    right: "direita",
  },
  de: {
    items: {
      "page-number": "Seitenzahl",
      "page-of": "Seite von gesamt",
      title: "Titel der Broschüre",
      section: "Abschnittsname",
      folio: "Abschnitt und Seite",
      date: "Datum",
      toc: "Inhaltsverzeichnis",
    },
    pageOf: "Seite {page} von {pages}",
    left: "links",
    right: "rechts",
  },
  it: {
    items: {
      "page-number": "Numero di pagina",
      "page-of": "Pagina di totale",
      title: "Titolo della brochure",
      section: "Nome della sezione",
      folio: "Sezione e pagina",
      date: "Data",
      toc: "Indice",
    },
    pageOf: "Pagina {page} di {pages}",
    left: "sinistra",
    right: "destra",
  },
};

/** The language a brochure is written in: its own, else the app's (files from before). */
export function brochureLanguage(settings: Pick<BrochureSettings, "language">): string {
  return settings.language ?? getLocale();
}

/** The words of language `code` ("fr-CA" reads "fr"), English for one it doesn't know. */
export function documentTexts(code: string): DocumentTexts {
  const base = code.toLowerCase().split("-")[0] ?? "en";
  return DOCUMENT_TEXTS[base] ?? ENGLISH;
}
