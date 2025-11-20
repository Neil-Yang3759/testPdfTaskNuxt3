// composables/useColors.ts
import colors from 'vuetify/util/colors'
// import colors from 'vuetify/lib/util/colors.js'

export const useColors = () => {
  const getColorList = () => {
    const colorSet = [
      'blue',
      'red',
      'green',
      'yellow',
      'purple',
      'orange',
      'pink',
      'teal',
      'deepPurple',
      'lightBlue',
      'lightGreen',
      'amber',
      'cyan',
      'deepOrange',
      'indigo',
      'lime',
    ]
    const paletteSet = [
      'lighten4',
      'darken4',
      'accent4',
      'base',
      'lighten1',
      'darken1',
      'accent1',
      'lighten2',
      'darken2',
      'accent2',
      'lighten3',
      'darken3',
      'accent3',
    ]
    const colorList = []
    paletteSet.forEach((palette) => {
      colorSet.forEach((color) => {
        colorList.push(colors[color][palette])
      })
    })
    return colorList
  }

  return {
    getColorList,
  }
}
