<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    strokeColor() {
      return this.active ? '#009149' : '#000000b3'
    },
  },
}
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
  >
    <g
      id="Group_37968"
      data-name="Group 37968"
      transform="translate(-951 -634)"
    >
      <g
        id="Icon_ionic-ios-videocam"
        data-name="Icon ionic-ios-videocam"
        transform="translate(953.638 639.254)"
      >
        <path
          id="Path_10350"
          data-name="Path 10350"
          d="M27.587,10.8a.5.5,0,0,0-.272.079l-2.532,1.6a.25.25,0,0,0-.117.211v2.224a.25.25,0,0,0,.117.211l2.532,1.6a.526.526,0,0,0,.272.079H28.2a.249.249,0,0,0,.252-.249v-5.5A.251.251,0,0,0,28.2,10.8Z"
          transform="translate(-15.335 -10.051)"
          fill="none"
          :stroke="strokeColor"
          stroke-width="1"
        />
        <path
          id="Path_10351"
          data-name="Path 10351"
          d="M9.318,16.493H3.757a1.512,1.512,0,0,1-1.507-1.5V10.5A1.51,1.51,0,0,1,3.754,9H9.315a1.51,1.51,0,0,1,1.5,1.5v4.481A1.506,1.506,0,0,1,9.318,16.493Z"
          transform="translate(-2.25 -9)"
          fill="none"
          :stroke="strokeColor"
          stroke-width="1"
        />
      </g>
      <rect
        id="Rectangle_9788"
        data-name="Rectangle 9788"
        width="18"
        height="18"
        transform="translate(951 634)"
        fill="none"
      />
    </g>
  </svg>
</template>
