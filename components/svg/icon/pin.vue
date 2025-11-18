<script>
export default {
  props: {
    enable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    fillColor() {
      return this.enable ? '#008145' : '#333'
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
      id="Group_10024"
      data-name="Group 10024"
      transform="translate(-463 -280)"
    >
      <path
        id="Icon_metro-pin"
        data-name="Icon metro-pin"
        d="M17.822,15.331l-5.34-3.083a1.37,1.37,0,1,0-1.37,2.373L16.451,17.7a1.37,1.37,0,0,0,1.371-2.373ZM13.418,12l4.153,2.4,1.413-3.931L16.116,8.808ZM10.356,22.1l3.973-4.826-1.78-1.028ZM20.7,8.29,17.141,6.234a1.028,1.028,0,0,0-1.028,1.78l3.56,2.055A1.028,1.028,0,1,0,20.7,8.29Z"
        transform="translate(456.644 274.904)"
        :fill="fillColor"
      />
      <rect
        id="Rectangle_9215"
        data-name="Rectangle 9215"
        width="18"
        height="18"
        transform="translate(463 280)"
        fill="none"
      />
    </g>
  </svg>
</template>
