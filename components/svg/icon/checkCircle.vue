<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20.075"
    height="20.075"
    viewBox="0 0 20.075 20.075"
  >
    <path
      id="Icon_awesome-check-circle"
      data-name="Icon awesome-check-circle"
      d="M20.638,10.6A10.038,10.038,0,1,1,10.6.563,10.038,10.038,0,0,1,20.638,10.6Zm-11.2,5.315,7.447-7.447a.648.648,0,0,0,0-.916l-.916-.916a.648.648,0,0,0-.916,0L8.981,12.709,6.146,9.874a.648.648,0,0,0-.916,0l-.916.916a.648.648,0,0,0,0,.916l4.209,4.209A.648.648,0,0,0,9.439,15.915Z"
      transform="translate(-0.563 -0.563)"
      :fill="fillColor"
    />
  </svg>
</template>

<script>
export default {
  props: {
    fillColor: {
      type: String,
      default: '#f1f2f4',
    },
  },
}
</script>
