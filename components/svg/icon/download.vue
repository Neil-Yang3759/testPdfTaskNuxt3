<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15.5"
    height="15.5"
    viewBox="0 0 15.5 15.5"
  >
    <g
      id="Icon_feather-download"
      data-name="Icon feather-download"
      transform="translate(0.75 0.75)"
    >
      <path
        id="Path_10717"
        data-name="Path 10717"
        d="M18.5,22.5v3.069A1.545,1.545,0,0,1,16.944,27.1H6.056A1.545,1.545,0,0,1,4.5,25.569V22.5"
        transform="translate(-4.5 -13.104)"
        fill="none"
        :stroke="strokeColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        id="Path_10718"
        data-name="Path 10718"
        d="M10.5,15l3.931,3.836L18.362,15"
        transform="translate(-7.431 -9.527)"
        fill="none"
        :stroke="strokeColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        id="Path_10719"
        data-name="Path 10719"
        d="M18,13.707V4.5"
        transform="translate(-11 -4.5)"
        fill="none"
        :stroke="strokeColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
    </g>
  </svg>
</template>

<script>
export default {
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    strokeColor() {
      return this.disabled ? '#a9a9a9' : '#fff'
    },
  },
}
</script>
