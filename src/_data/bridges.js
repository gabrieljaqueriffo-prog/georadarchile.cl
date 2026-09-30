// Puente servicio + ATLAS para artículos heredados (mapa de la Etapa 1, §4 y §5).
const A = "https://georadar.cl";
export default {
  "/post/como-funciona-georadar/": {
    question: "¿Necesita aplicar el georradar en un proyecto concreto?",
    service: { url: "/georadar-gpr/", label: "Inspección y levantamiento con georradar GPR" },
    atlas: [
      { url: `${A}/georadar/`, label: "Qué puede detectar el georradar y cuáles son sus límites" },
      { url: `${A}/biblioteca/por-que-la-profundidad-del-georradar-depende-del-terreno/`, label: "Por qué la profundidad depende del terreno" }
    ]
  },
  "/post/que-es-georadar-gpr-chile-prospección-no-destructiva-con-georradar-en-chile-gpr/": {
    question: "¿Evalúa usar georradar antes de excavar o intervenir?",
    service: { url: "/georadar-gpr/", label: "Inspección y levantamiento con georradar GPR" },
    atlas: [
      { url: `${A}/georadar/`, label: "Qué puede detectar el georradar y cuáles son sus límites" },
      { url: `${A}/glosario/`, label: "Glosario GPR" }
    ]
  },
  "/post/georadar-o-georradar/": {
    question: "¿Busca una empresa de georradar para un proyecto?",
    service: { url: "/servicios/", label: "Servicio de georradar GPR en Chile" },
    atlas: [
      { url: `${A}/glosario/`, label: "Glosario GPR" },
      { url: `${A}/biblioteca/como-elegir-empresa-de-georradar/`, label: "Cómo elegir una empresa de georradar" }
    ]
  },
  "/post/localizacion-de-tuberias-ductos-con-georadar/": {
    question: "¿Necesita localizar redes antes de excavar?",
    service: { url: "/utilities/", label: "Localización de redes y servicios soterrados" },
    atlas: [
      { url: `${A}/utilities/casos/accesos-metro-de-santiago/`, label: "Caso: servicios subterráneos en accesos de Metro de Santiago" },
      { url: `${A}/biblioteca/como-afecta-la-humedad-al-georradar/`, label: "Cómo afecta la humedad al georradar" }
    ]
  },
  "/post/georradar-en-busqueda-forense/": {
    question: "¿Requiere una prospección para una investigación pericial?",
    service: { url: "/pericias/", label: "Georradar para peritajes forenses" },
    atlas: [
      { url: `${A}/forense/casos/cip-san-joaquin-cerro-chena/`, label: "Caso: CIP San Joaquín y Cerro Chena" },
      { url: `${A}/biblioteca/georradar-en-aluviones-busqueda-de-personas/`, label: "Georradar en aluviones y búsqueda de personas" }
    ]
  },
  "/post/georradar-antes-de-excavar/": {
    question: "¿Va a excavar y los planos no son confiables?",
    service: { url: "/georadar-gpr/", label: "Inspección con georradar antes de excavar" },
    atlas: [
      { url: `${A}/herramientas/necesito-gpr/`, label: "¿Necesito un estudio GPR? Árbol de decisión" },
      { url: `${A}/biblioteca/como-tomar-decisiones-antes-de-intervenir-el-subsuelo/`, label: "Cómo tomar decisiones antes de intervenir el subsuelo" }
    ]
  },
  "/post/servicio-georradar-chile-informe-tecnico/": {
    question: "¿Necesita un informe GPR para respaldar una decisión?",
    service: { url: "/informes-tecnicos/", label: "Informes técnicos GPR" },
    atlas: [
      { url: `${A}/biblioteca/que-puede-decirnos-una-senal-gpr-ademas-de-una-imagen/`, label: "Qué puede decirnos una señal GPR además de una imagen" }
    ]
  },
  "/post/estudio-con-georradar/": {
    question: "¿Quiere saber si su proyecto es viable antes de cotizar?",
    service: { url: "/contacto/", label: "Solicitar una evaluación técnica" },
    atlas: [
      { url: `${A}/herramientas/necesito-gpr/`, label: "¿Necesito un estudio GPR? Árbol de decisión" },
      { url: `${A}/biblioteca/que-hace-que-un-suelo-sea-dificil-para-el-gpr/`, label: "Qué hace que un suelo sea difícil para el GPR" }
    ]
  }
};
