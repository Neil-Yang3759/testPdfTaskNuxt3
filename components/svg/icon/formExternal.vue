<script>
export default {
  props: {
    color: {
      type: String,
      default: '#000',
    },
    size: {
      type: Number,
      default: 30,
    },
  },
}
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 30 30"
  >
    <g id="Group_41834" data-name="Group 41834" transform="translate(-22 -286)">
      <rect
        id="Rectangle_11399"
        data-name="Rectangle 11399"
        :width="size"
        :height="size"
        transform="translate(22 286)"
        fill="none"
      />
      <path
        id="Subtraction_12"
        data-name="Subtraction 12"
        d="M18.2,26.465H3.308A3.312,3.312,0,0,1,0,23.158V3.308A3.312,3.312,0,0,1,3.308,0h8.685a.821.821,0,0,1,.584.243l8.684,8.684a.823.823,0,0,1,.243.585V23.158A3.312,3.312,0,0,1,18.2,26.465ZM3.308,1.655A1.655,1.655,0,0,0,1.655,3.308v19.85a1.655,1.655,0,0,0,1.653,1.653H18.2a1.655,1.655,0,0,0,1.653-1.653V9.853l-8.2-8.2Z"
        transform="translate(26.346 287.449)"
      />
      <g
        id="Group_40840"
        data-name="Group 40840"
        transform="translate(30.692 299.038)"
      >
        <g
          id="Icon_feather-code"
          data-name="Icon feather-code"
          transform="translate(0 0.866)"
        >
          <path
            id="Path_104275"
            data-name="Path 104275"
            d="M24,14.334l2.667-2.667L24,9"
            transform="translate(-14.672 -9)"
            fill="none"
            :stroke="color"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
          />
          <path
            id="Path_104276"
            data-name="Path 104276"
            d="M5.667,9,3,11.667l2.667,2.667"
            transform="translate(-3 -9)"
            fill="none"
            :stroke="color"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
          />
        </g>
        <line
          id="Line_1758"
          data-name="Line 1758"
          x1="2.535"
          y2="7.066"
          transform="translate(4.73)"
          fill="none"
          :stroke="color"
          stroke-linecap="round"
          stroke-width="1.5"
        />
      </g>
    </g>
  </svg>
</template>
