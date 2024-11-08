const mainColor = "#33302e"
const backgroundColor = "#f7f7f7"
const hoverColor = "#e0e0e0"

export const naiveUithemeOverrides = {
  common: {
    primaryColor: mainColor,
    primaryColorPressed: mainColor,
    primaryColorHover: mainColor,
    modalColor: backgroundColor,
    popoverColor: backgroundColor,
    hoverColor: hoverColor,
    inputColor: backgroundColor,
    inputColorDisabled: backgroundColor
  },
  Radio: {
    buttonColor: backgroundColor,
    buttonColorActive: backgroundColor
  },
  DatePicker: {
    panelColor: backgroundColor,
    itemColorHover: hoverColor
  },
  DataTable: {
    thColor: backgroundColor,
    tdColor: backgroundColor,
    tdColorHover: hoverColor
  }
}
