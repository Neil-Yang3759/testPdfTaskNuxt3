<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    color() {
      return this.active ? '#009138' : '#868686'
    },
  },
}
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 22 22"
  >
    <g
      id="Group_40252"
      data-name="Group 40252"
      transform="translate(-252 -536)"
    >
      <rect
        id="Rectangle_10913"
        data-name="Rectangle 10913"
        width="22"
        height="22"
        transform="translate(252 536)"
        fill="none"
      />
      <g
        id="Group_39775"
        data-name="Group 39775"
        transform="translate(761.834 -19.495)"
      >
        <path
          id="Path_104162"
          data-name="Path 104162"
          d="M-86.929-31.782l-.566,5.354,2.661-1.456,2.177,1.456-.539-5.354"
          transform="translate(-413.681 602.419)"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
        />
        <path
          id="Ellipse_929"
          data-name="Ellipse 929"
          d="M6.416,1.833A4.583,4.583,0,1,0,11,6.416,4.588,4.588,0,0,0,6.416,1.833M6.416,0A6.416,6.416,0,1,1,0,6.416,6.416,6.416,0,0,1,6.416,0Z"
          transform="translate(-505 556)"
          :fill="color"
        />
        <circle
          id="Ellipse_930"
          data-name="Ellipse 930"
          cx="2.75"
          cy="2.75"
          r="2.75"
          transform="translate(-501.334 559.666)"
          :fill="color"
        />
      </g>
    </g>
  </svg>
</template>
