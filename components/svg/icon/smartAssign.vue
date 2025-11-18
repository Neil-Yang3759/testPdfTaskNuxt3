<script>
export default {
  props: {
    color: {
      type: String,
      default: '#717171',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    fill() {
      return this.disabled ? '#e0e0e0' : this.color
    },
  },
}
</script>

<template>
  <svg
    id="icon_action_setting_un-open"
    xmlns="http://www.w3.org/2000/svg"
    width="27"
    height="27"
    viewBox="0 0 27 27"
  >
    <circle
      id="Ellipse_957"
      data-name="Ellipse 957"
      cx="13.5"
      cy="13.5"
      r="13.5"
      fill="none"
    />
    <g
      id="Icon_ionic-ios-school"
      data-name="Icon ionic-ios-school"
      transform="translate(5.627 6.753)"
    >
      <path
        id="Path_104278"
        data-name="Path 104278"
        d="M6.813,18.721v3.258a.285.285,0,0,0,.141.246l4.639,2.667a.282.282,0,0,0,.422-.246v-3.3a.285.285,0,0,0-.141-.246L7.235,18.472A.286.286,0,0,0,6.813,18.721Z"
        transform="translate(-4.566 -11.437)"
        :fill="fill"
      />
      <path
        id="Path_104279"
        data-name="Path 104279"
        d="M19.332,24.858l4.642-2.667a.28.28,0,0,0,.141-.246V18.652a.282.282,0,0,0-.422-.246l-4.639,2.667a.28.28,0,0,0-.141.246v3.3A.278.278,0,0,0,19.332,24.858Z"
        transform="translate(-10.619 -11.403)"
        :fill="fill"
      />
      <path
        id="Path_104280"
        data-name="Path 104280"
        d="M9.909,4.5,2.459,8.854a.281.281,0,0,0,0,.488l7.45,4.14a.566.566,0,0,0,.559,0L17.078,9.7c.186-.109.246.028.246.246v5.391c0,.239.137.351.387.351h0a.346.346,0,0,0,.351-.351V9.3a.285.285,0,0,0-.141-.246L10.468,4.5A.566.566,0,0,0,9.909,4.5Z"
        transform="translate(-2.317 -4.43)"
        :fill="fill"
      />
    </g>
  </svg>
</template>
