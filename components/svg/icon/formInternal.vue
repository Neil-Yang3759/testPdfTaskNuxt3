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
    <g
      id="Group_41833"
      data-name="Group 41833"
      transform="translate(-0.098 -0.015)"
    >
      <rect
        id="Rectangle_11398"
        data-name="Rectangle 11398"
        :width="size"
        :height="size"
        transform="translate(0.098 0.015)"
        fill="none"
      />
      <g
        id="Group_40842"
        data-name="Group 40842"
        transform="translate(2.098 1.015)"
      >
        <path
          id="Subtraction_11"
          data-name="Subtraction 11"
          d="M14.169,26.189H3.148A3.216,3.216,0,0,1,0,22.915V3.273A3.216,3.216,0,0,1,3.148,0h8.266a.767.767,0,0,1,.556.24l8.265,8.593a.831.831,0,0,1,.231.579v6.165H18.891V9.75l-7.8-8.113H3.148A1.607,1.607,0,0,0,1.575,3.273V22.915a1.607,1.607,0,0,0,1.574,1.636H14.169v1.636Z"
          transform="translate(0)"
        />
        <g
          id="Group_40830"
          data-name="Group 40830"
          transform="translate(4.851 9.689)"
        >
          <g
            id="Icon_feather-code"
            data-name="Icon feather-code"
            transform="translate(0 0.824)"
          >
            <path
              id="Path_104275"
              data-name="Path 104275"
              d="M24,14.077l2.538-2.538L24,9"
              transform="translate(-15.122 -9)"
              fill="none"
              :stroke="color"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            />
            <path
              id="Path_104276"
              data-name="Path 104276"
              d="M5.538,9,3,11.538l2.538,2.538"
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
            x1="2.413"
            y2="6.726"
            transform="translate(4.502)"
            fill="none"
            :stroke="color"
            stroke-linecap="round"
            stroke-width="1.5"
          />
        </g>
        <path
          id="Icon_awesome-lock"
          data-name="Icon awesome-lock"
          d="M8.57,4.8H8.056V3.257a3.257,3.257,0,0,0-6.513,0V4.8H1.028A1.029,1.029,0,0,0,0,5.828V9.941a1.029,1.029,0,0,0,1.028,1.028H8.57A1.029,1.029,0,0,0,9.6,9.941V5.828A1.029,1.029,0,0,0,8.57,4.8Zm-2.228,0H3.257V3.257a1.543,1.543,0,0,1,3.085,0Z"
          transform="translate(16.667 16.957)"
        />
      </g>
    </g>
  </svg>
</template>
