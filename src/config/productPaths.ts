export type CompanyName = "1komma5" | "ostrom" | "spotmyenergy";

export const COMPANY_PRODUCT_PATHS: Record<CompanyName, string[]> = {
  "1komma5": [
    "/solaranlage/",
    "/waermepumpe/",
    "/stromspeicher/",
    "/wallbox/",
    "/heartbeat/",
    "/solar-pv",
    "/battery-storage",
    "/smart-ev-charging",
    "/smart-hvac",
  ],
  ostrom: [
    "/our-tariff",
    "/dynamic-pricing",
    "/simplyfair",
    "/simplydynamic",
    "/smart-meter",
    "/ostrom-price-cap",
    "/smart-heating",
    "/solar-pv",
    "/battery-storage",
    "/virtual-power-plant",
    "/smart",
  ],
  spotmyenergy: [
    "/produkte",
    "/smart-meter",
    "/dynamischer-stromtarif",
    "/home-energy-management-system-hems",
  ],
};
