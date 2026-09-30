// Datos estructurados por ruta. Service solo en páginas que venden un servicio.
export default {
  sections: {
    "Servicios": "/servicios/",
    "Industrias": "/industrias/",
    "Aplicaciones": "/industrias/",
    "Empresa": "/nosotros/",
    "Experiencia": "/experiencia/",
    "Blog": "/blog/",
    "Categoría": "/blog/",
    "Etiqueta": "/blog/",
    "Conocimiento": "/blog/"
  },
  services: {
    "/servicios/": { name: "Servicio de georradar GPR", serviceType: "Prospección geofísica no destructiva con georradar GPR" },
    "/georadar-gpr/": { name: "Inspección y levantamiento con georradar GPR", serviceType: "Inspección y levantamiento con georradar GPR" },
    "/lem-radio-deteccion/": { name: "Localización electromagnética y radio detección", serviceType: "Localización electromagnética de redes soterradas" },
    "/informes-tecnicos/": { name: "Informes técnicos GPR", serviceType: "Informe técnico de prospección con georradar" },
    "/capacitacion-gpr/": { name: "Capacitación GPR para equipos y empresas", serviceType: "Capacitación en georradar GPR" },
    "/mentoria-gpr/": { name: "Mentoría GPR 1:1 para profesionales", serviceType: "Mentoría en interpretación de georradar GPR" },
    "/mineria/": { name: "Georradar en minería", serviceType: "Prospección con georradar GPR en minería" },
    "/construccion/": { name: "Georradar en construcción", serviceType: "Prospección con georradar GPR en construcción" },
    "/utilities/": { name: "Georradar para utilities", serviceType: "Localización de redes soterradas con georradar GPR" },
    "/pericias/": { name: "Georradar para peritajes forenses", serviceType: "Prospección forense con georradar GPR" },
    "/post/socavones-mineria-chile-deteccion-gpr/": { name: "Detección de socavones y vacíos con georradar GPR", serviceType: "Detección de vacíos y socavones con georradar GPR" }
  }
};
