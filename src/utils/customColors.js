import * as d3 from "d3"

export const customColorScale = {
  logZeroColor: "#d9d9d9",
  lowColor: "#bdbdbd",
  highColor: "#000000"
}

export const ordinalColors = d3.schemeObservable10
export const focusColors = d3.schemeObservable10

export const focusOpacity = 0.5

export const customColors = {
  party: {
    AB: "#ff6666",
    "BastA!": "#ff66b2",
    EVP: "#ffeb66",
    FDP: "#6699cc",
    GLP: "#66b299",
    Grüne: "#b2d966",
    LDP: "#6699cc",
    Mitte: "#6699cc",
    SP: "#ff6666",
    SVP: "#66cc99",
    VA: "#ccb2d6",
    jgb: "#b2d966"
  },
  fraction: {
    CVP: "#6699cc",
    DSP: "#ffb266",
    EVP: "#ffeb66",
    "EVP/DSP": "#ffeb66",
    FDP: "#6699cc",
    GAB: "#b2d966",
    GLP: "#66b299",
    LDP: "#6699cc",
    "Mitte-EVP": "#6699cc",
    SBP: "#ff6666",
    SD: "#ff6666",
    SP: "#ff6666",
    StaB: "#cc6666",
    SVP: "#66cc99"
  },
  constituency: {
    "Grossbasel West": "#66c2a5",
    Kleinbasel: "#fc8d62",
    "Grossbasel Ost": "#8da0cb",
    Riehen: "#e78ac3",
    Bettingen: "#a6d854"
  },
  gender: {
    Frau: "#fc8d59",
    Mann: "#91bfdb"
  },
  ageGroup: {
    "18-19": "#f0f0f0",
    "20-29": "#d9d9d9",
    "30-39": "#bdbdbd",
    "40-49": "#969696",
    "50-59": "#737373",
    "60-69": "#525252",
    "70-79": "#252525",
    "80-89": "#000000",
    "90-99": "#000000"
  },
  vote: {
    Ja: "#1a9641",
    Nein: "#d7191c",
    "Nicht abgestimmt": "#bababa",
    Enthalten: "#fdae61",
    Präsidium: "#2b83ba"
  }
}
