import { fabric } from 'fabric'
function initialize(mode, scale, i18n, self) {
  switch (mode) {
    case 0:
    case 1:
    case 4:
    case 5:
      fabric.Object.prototype.set({
        transparentCorners: false,
        borderColor: '#3183c8',
        borderScaleFactor: Math.max(Math.min(2 * scale, 4), 2),
        cornerStyle: 'circle',
        cornerColor: '#3183c8',
        cornerStrokeColor: 'rgba(0, 0, 0, 0.1)',
        cornerSize: Math.max(Math.min(10 * scale, 12), 8),
        lockScalingFlip: true,
        padding: 0,
        objectCaching: false,
      })

      fabric.Object.prototype.setControlsVisibility({
        mb: false,
        ml: false,
        mr: false,
        mt: false,
        mtr: false,
        tl: true,
        tr: true,
        bl: true,
        br: true,
      })

      if (mode !== 5) {
        fabric.Group.prototype._controlsVisibility = {
          tl: false,
          tr: false,
          br: false,
          bl: false,
          ml: false,
          mt: false,
          mr: false,
          mb: false,
          mtr: false,
        }
      } else {
        fabric.Group.prototype._controlsVisibility = {
          tl: true,
          tr: true,
          br: true,
          bl: true,
          ml: false,
          mt: false,
          mr: false,
          mb: false,
          mtr: false,
        }
      }

      fabric.Object.prototype.font = `${
        16 * self.scale
      }px Montserrat Noto Sans TC Noto Sans SC Roboto Microsoft JhengHei sans-serif`
      fabric.Object.prototype.lockMovementX = false
      fabric.Object.prototype.lockMovementY = false
      fabric.Object.prototype.evented = true
      fabric.Object.prototype.hasControls = true
      fabric.Object.prototype.selectable = true
      fabric.Object.prototype.hasBorders = true
      fabric.Object.prototype.strokeWidth = 0
      fabric.Object.prototype.objectCaching = false
      break
  }

  if (mode === 0 || mode === 1 || mode === 4 || mode === 5) {
    fabric.LabeledRect = fabric.util.createClass(fabric.Rect, {
      type: 'labeledRect',
      objectCaching: false,

      initialize(options) {
        options || (options = {})
        options.padding = `-${options.strokeWidth}`
        this.callSuper('initialize', options)
        this.set('id', options.id)
        this.set('selectId', options.selectId)
        this.set('annotateType', options.annotateType)
        this.set('name', options.name || '')
        this.set('label', options.label || '')
        this.set('icon', options.icon || null)
        this.set('fontSize', options.fontSize || 16)
        this.set('fontFamily', options.fontFamily || 'Microsoft JhengHei')
        this.set('fontStyle', options.fontStyle || '')
        this.set('fontWeight', options.fontWeight || '')
        this.set('required', options.required)
        this.set('readonly', options.readonly)
        this.set('textColor', options.textColor || 'rgba(0,0,0,1)')
        this.set('scale', self.scale || scale)
        this.set('prefill', options.prefill || false)
      },

      toObject() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
          id: this.get('id'),
          selectId: this.get('selectId'),
          annotateType: this.get('annotateType'),
          name: this.get('name'),
          label: this.get('label'),
          icon: this.get('icon'),
          fontSize: this.get('fontSize'),
          fontFamily: this.get('fontFamily'),
          fontStyle: this.get('fontStyle'),
          fontWeight: this.get('fontWeight'),
          required: this.get('required'),
          readonly: this.get('readonly'),
          textColor: this.get('textColor'),
          scale: this.get('scale'),
          prefill: this.get('prefill'),
        })
      },

      _render(ctx) {
        this.callSuper('_render', ctx)
        let metrics = null

        if (this.required) {
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'right'
          ctx.font = `${Math.max(32 * self.scale, 12)}px ${this.fontFamily}`
          ctx.fillStyle = 'red'
          metrics = ctx.measureText('*')
          ctx.fillText(
            '*',
            this.width / 2,
            -this.height / 2 + metrics.actualBoundingBoxAscent
          )
        }
        if (this.icon !== null) {
          let p = null
          ctx.rotate(((this.textDirection ? 90 : 0) * Math.PI) / 180)
          const iconSize = 16
          const margin = 8
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'center'
          ctx.font = `bold ${this.fontSize * self.scale}px ${this.fontFamily}`
          ctx.fillStyle = 'black'
          metrics = ctx.measureText(this.name)
          ctx.fillText(this.name, ((iconSize + margin) * self.scale) / 2, 0)
          switch (this.icon) {
            case 'signature':
              p = new Path2D(
                'M22,22H2V20H22V22M2.26,16.83L5.09,14L2.26,11.17L3.67,9.76L6.5,12.59L9.33,9.76L10.74,11.17L7.91,14L10.74,16.83L9.33,18.24L6.5,15.41L3.67,18.24L2.26,16.83Z'
              )
              break
            case 'stamp':
              p = new Path2D(
                'M12,3A3,3 0 0,0 9,6C9,9 14,13 6,13A2,2 0 0,0 4,15V17H20V15A2,2 0 0,0 18,13C10,13 15,9 15,6C15,4 13.66,3 12,3M6,19V21H18V19H6Z'
              )
              break
            case 'calendar-month':
              p = new Path2D(
                'M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z'
              )
              break
            case 'paperclip':
              p = new Path2D(
                'M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z'
              )
              break
            case 'image':
              p = new Path2D(
                'M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z'
              )
              break
            case 'message-draw':
              p = new Path2D(
                'M18,14H10.5L12.5,12H18M6,14V11.5L12.88,4.64C13.07,4.45 13.39,4.45 13.59,4.64L15.35,6.41C15.55,6.61 15.55,6.92 15.35,7.12L8.47,14M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z'
              )
              break
            case 'b2b2c':
              p = new Path2D(
                'M19.7 12.9L14 18.6H11.7V16.3L17.4 10.6L19.7 12.9M23.1 12.1C23.1 12.4 22.8 12.7 22.5 13L20 15.5L19.1 14.6L21.7 12L21.1 11.4L20.4 12.1L18.1 9.8L20.3 7.7C20.5 7.5 20.9 7.5 21.2 7.7L22.6 9.1C22.8 9.3 22.8 9.7 22.6 10C22.4 10.2 22.2 10.4 22.2 10.6C22.2 10.8 22.4 11 22.6 11.2C22.9 11.5 23.2 11.8 23.1 12.1M3 20V4H10V9H15V10.5L17 8.5V8L11 2H3C1.9 2 1 2.9 1 4V20C1 21.1 1.9 22 3 22H15C16.1 22 17 21.1 17 20H3M11 17.1C10.8 17.1 10.6 17.2 10.5 17.2L10 15H8.5L6.4 16.7L7 14H5.5L4.5 19H6L8.9 16.4L9.5 18.7H10.5L11 18.6V17.1Z'
              )
              break
            case 'signatureBP':
              p = new Path2D(
                'M 12.840234,1.8558033 A 8.148,8.148 0 0 0 6.9082031,4.2300218 7.7586664,7.7586664 0 0 0 4.6160155,9.8808029 v 0.6984381 a 0.78,0.78 0 0 0 0.7570313,0.799218 h 0.025779 A 0.78133331,0.78133331 0 0 0 6.176953,10.621428 V 9.8526778 A 6.2053331,6.2053331 0 0 1 8.0144528,5.3339279 6.5919997,6.5919997 0 0 1 12.814452,3.4190842 7.0866664,7.0866664 0 0 1 18.493361,6.4237717 0.78060773,0.78060773 0 1 0 19.770704,5.5261155 l 0.007,-0.00234 a 8.6533331,8.6533331 0 0 0 -6.93743,-3.667968 z m 0.04221,2.6671872 a 5.8146664,5.8146664 0 0 0 -1.4883,0.1617189 0.78133331,0.78133331 0 0 0 0.358593,1.5187499 4.6666665,4.6666665 0 0 1 1.108594,-0.1195314 4.5533332,4.5533332 0 0 1 4.514061,4.3828121 28.666665,28.666665 0 0 1 -0.180469,3.696095 0.78133331,0.78133331 0 1 0 1.551563,0.178125 30.222668,30.222668 0 0 0 0.189844,-3.897657 6.1333331,6.1333331 0 0 0 -6.053905,-5.9203125 z M 8.951953,6.3886157 A 0.78133331,0.78133331 0 0 0 8.2207029,6.6675219 5.6426666,5.6426666 0 0 0 6.9621092,10.312053 18.892001,18.892001 0 0 1 6.6667967,13.956583 0.78133331,0.78133331 0 0 0 8.2042969,14.235489 20.46,20.46 0 0 0 8.5253903,10.288615 4.02,4.02 0 0 1 9.4347654,7.6542405 0.78133331,0.78133331 0 0 0 9.3199217,6.5550217 0.78133331,0.78133331 0 0 0 8.951953,6.3886157 Z m 3.967969,0.8109375 a 3.2533331,3.2533331 0 0 0 -3.3562504,3.2882808 21.342668,21.342668 0 0 1 -0.4335937,4.635935 0.7808196,0.7808196 0 1 0 1.5281251,0.316409 22.902668,22.902668 0 0 0 0.46875,-4.978125 1.6946666,1.6946666 0 0 1 1.771875,-1.7015624 1.8826665,1.8826665 0 0 1 1.872657,1.8046874 26.152001,26.152001 0 0 1 -0.344532,4.666407 0.78045739,0.78045739 0 1 0 1.539843,0.253123 27.748001,27.748001 0 0 0 0.367969,-4.947655 3.456,3.456 0 0 0 -3.414843,-3.3374998 z m 7.228124,0.6539061 a 0.78133331,0.78133331 0 0 0 -0.590625,0.9562498 8.112,8.112 0 0 1 0.15469,1.9992189 0.78,0.78 0 0 0 0.773435,0.787499 0.78,0.78 0 0 0 0.782813,-0.77578 9.6666664,9.6666664 0 0 0 -0.187499,-2.3414065 l 0.0024,-0.00469 a 0.78133331,0.78133331 0 0 0 -0.93519,-0.621088 z m -7.199999,2.0015624 a 0.78133331,0.78133331 0 0 0 -0.78047,0.7828123 23.786666,23.786666 0 0 1 -0.902343,6.88125 0.78030922,0.78030922 0 1 0 1.502343,0.421876 25.177331,25.177331 0 0 0 0.958593,-7.30547 0.78,0.78 0 0 0 -0.778123,-0.7804683 z M 0.02929688,20.912835 v 2.664842 H 24.029297 v -2.664842 z'
              )
              break
            case 'signatureBO':
              p = new Path2D(
                'M 12.031572,0.33597152 A 2.568,2.568 0 0 0 9.6096973,2.0573258 H 6.0159471 A 1.7239999,1.7239999 0 0 0 4.2971972,3.7760759 V 15.804721 a 1.7239999,1.7239999 0 0 0 1.7187499,1.718752 H 18.049801 a 1.7239999,1.7239999 0 0 0 1.716147,-1.718752 V 3.7760759 A 1.7239999,1.7239999 0 0 0 18.049801,2.0573258 H 14.45605 A 2.568,2.568 0 0 0 12.031572,0.33597152 Z m 0,1.72135428 h 0.0026 a 0.86,0.86 0 1 1 -0.85941,0.8593747 0.86266666,0.86266666 0 0 1 0.85677,-0.8593747 z m 0,3.4374999 h 0.0026 A 2.5786665,2.5786665 0 1 1 9.4560513,8.0703468 2.5746668,2.5746668 0 0 1 12.031572,5.4948257 Z m 0.0026,6.4427083 c 1.72,0 5.156249,0.945335 5.156249,2.666666 v 1.200521 H 6.8779263 V 14.6042 c 0,-1.718665 3.4362517,-2.666666 5.1562497,-2.666666 z M 0.03417629,21.2292 v 2.666666 H 24.034176 V 21.2292 Z'
              )
              break
            case 'stampBP':
              p = new Path2D(
                'M 6.0855003,-0.00286343 A 2.2780266,2.2133218 0 0 0 3.8057978,2.2063503 2.2217461,2.1586837 0 0 0 4.0112004,3.1198334 5.1027963,4.9576877 0 0 1 4.5608621,5.2194974 0.69763864,0.67781356 0 0 1 3.8636564,5.8968862 H 2.2869694 A 2.2780266,2.2133218 0 0 0 0.0101997,8.1060999 V 8.8425091 A 0.75985424,0.7382578 0 0 0 0.76815465,9.5789184 H 8.0091841 A 8.7198194,8.4719164 0 0 1 11.989865,7.2909655 2.2647595,2.200313 0 0 0 9.8721608,5.8940652 H 8.2954738 A 0.69763864,0.67781356 0 0 1 7.598268,5.2166765 V 4.9974393 A 3.9992548,3.8856036 0 0 1 8.1045396,3.2069805 2.249956,2.1859345 0 0 0 8.3215053,1.8156948 2.2885005,2.2234554 0 0 0 6.4931626,0.03085045 2.3921233,2.3241043 0 0 0 6.0852489,-0.00287855 Z M 15.658321,8.4376942 a 8.068057,7.838717 0 0 0 -5.8756362,2.2823388 7.6814965,7.4630974 0 0 0 -2.271044,5.438751 v 0.668951 a 0.77319115,0.75119841 0 0 0 0.7492827,0.772945 h 0.023143 A 0.77319115,0.75119841 0 0 0 9.05649,16.872704 v -0.739216 a 6.144052,5.9693825 0 0 1 1.816751,-4.351053 6.52768,6.3419894 0 0 1 4.756036,-1.8409882 7.016467,6.8168889 0 0 1 5.629709,2.8922592 0.77334475,0.75134904 0 1 0 1.264227,-0.865706 l -0.003,0.0029 A 8.5673181,8.3236129 0 0 0 15.658269,8.4376807 Z M 0.76847585,10.315245 v 1.472764 H 6.5428653 a 6.9763864,6.7781356 0 0 1 0.838954,-1.472764 z M 15.693237,11.009491 a 5.7573517,5.5937628 0 0 0 -1.481166,0.154589 0.77419664,0.75218434 0 0 0 0.36451,1.461536 4.6228073,4.4914151 0 0 1 1.093542,-0.115248 4.5087104,4.3806327 0 0 1 4.47254,4.213296 28.378969,27.571009 0 0 1 -0.176466,3.555582 0.77319115,0.75119841 0 0 0 1.533253,0.171461 29.920745,29.069106 0 0 0 0.190936,-3.752365 6.0729683,5.900229 0 0 0 -5.997136,-5.688933 z m -4.093522,1.784843 a 0.77319115,0.75119841 0 0 0 -0.517834,0.272644 5.5871142,5.428205 0 0 0 -1.2497589,3.507792 18.706575,18.174353 0 0 1 -0.2950876,3.504916 0.77708747,0.75499157 0 0 0 1.5275295,0.267017 20.25952,19.683406 0 0 0 0.318228,-3.797278 3.9799827,3.8668429 0 0 1 0.896811,-2.535262 0.77319115,0.75119841 0 0 0 -0.112824,-1.054023 0.77319115,0.75119841 0 0 0 -0.567021,-0.165832 z m 4.13402,0.784187 a 3.2216647,3.129982 0 0 0 -3.32403,3.164901 21.132355,20.531048 0 0 1 -0.431054,4.460604 0.77390139,0.75189473 0 1 0 1.515938,0.303564 22.67692,22.031886 0 0 0 0.459975,-4.789529 1.6782151,1.6305157 0 0 1 1.756002,-1.638593 1.864792,1.8118211 0 0 1 1.857251,1.737053 25.894537,25.158168 0 0 1 -0.344259,4.491553 0.77319115,0.75119841 0 1 0 1.524597,0.244529 27.475413,26.69324 0 0 0 0.364509,-4.766934 3.4215087,3.3242964 0 0 0 -3.379054,-3.207078 z m 7.327894,0.621177 a 0.77319115,0.75119841 0 0 0 -0.760846,0.93316 8.032585,7.8042088 0 0 1 0.150434,1.928219 0.77319115,0.75119841 0 0 0 0.766642,0.758894 0.77319115,0.75119841 0 0 0 0.783986,-0.747652 9.5715658,9.2994302 0 0 0 -0.188042,-2.262619 h -0.003 a 0.77319115,0.75119841 0 0 0 -0.749186,-0.609921 z m -7.30178,1.936572 a 0.77319115,0.75119841 0 0 0 -0.772422,0.750458 23.551152,22.880899 0 0 1 -0.888139,6.622026 0.77319115,0.75119841 0 1 0 1.481165,0.404748 24.928135,24.220147 0 0 0 0.954669,-7.026815 0.77319115,0.75119841 0 0 0 -0.775314,-0.750459 z'
              )
              break
            case 'stampBO':
              p = new Path2D(
                'M 5.82841,0.04355421 A 2.1967852,2.1967852 0 0 0 3.6301071,2.2362776 2.1425084,2.1425084 0 0 0 3.8281775,3.142938 4.9206275,4.9206275 0 0 1 4.3582251,5.2268622 0.67274762,0.67274762 0 0 1 3.6859016,5.8991858 H 2.1655017 A 2.1967852,2.1967852 0 0 0 -0.03001143,8.0919092 V 8.822817 A 0.73273786,0.73273786 0 0 0 0.70089631,9.5537248 H 8.2554703 V 9.5481454 8.6080083 A 1.428339,1.428339 0 0 1 9.6838091,7.1796694 H 11.480391 A 2.199642,2.199642 0 0 0 9.4801592,5.896396 H 7.9597594 A 0.67274762,0.67274762 0 0 1 7.2874358,5.2240724 V 5.006474 A 3.856515,3.856515 0 0 1 7.7756376,3.2294196 2.1696468,2.1696468 0 0 0 7.9848669,1.848506 2.2067836,2.2067836 0 0 0 6.2217611,0.07703085 2.3067674,2.3067674 0 0 0 5.82841,0.04355421 Z M 17.084948,7.1991974 A 2.2853422,2.2853422 0 0 0 14.925702,8.730756 h -3.199815 a 1.5354643,1.5354643 0 0 0 -1.531558,1.531559 v 10.712542 a 1.5354643,1.5354643 0 0 0 1.531558,1.531558 h 10.712542 a 1.5354643,1.5354643 0 0 0 1.53156,-1.531558 V 10.262315 A 1.5354643,1.5354643 0 0 0 22.441219,8.730756 H 19.241405 A 2.2853422,2.2853422 0 0 0 17.084948,7.1991974 Z m 0,1.5315586 A 0.76558965,0.76558965 0 1 1 16.317774,9.4979303 0.767018,0.767018 0 0 1 17.084948,8.730756 Z M 0.70089631,10.284633 v 1.461815 H 8.2554703 v -1.461815 z m 16.38405169,1.50924 a 2.296769,2.296769 0 1 1 -2.298733,2.295944 2.2939123,2.2939123 0 0 1 2.298733,-2.295944 z m 0,5.746833 c 1.529749,0 4.591886,0.840087 4.591886,2.371266 v 1.068464 h -9.183772 v -1.068464 c 0,-1.531179 3.062136,-2.371266 4.591886,-2.371266 z'
              )
              break
            case 'signatureAndStamp':
              p = new Path2D(
                'M0.652,9.116h7.09v-1.01h-7.09V9.116z M6.742,5.056h-1.05c-0.26,0-0.47-0.21-0.47-0.47v-0.15c0.01-0.43,0.13-0.85,0.34-1.23c0.15-0.29,0.2-0.63,0.14-0.96c-0.15-0.83-0.94-1.38-1.77-1.23c-0.73,0.13-1.25,0.76-1.25,1.5c0,0.22,0.05,0.43,0.14,0.63c0.23,0.45,0.35,0.94,0.37,1.44l0,0c0,0.26-0.21,0.47-0.47,0.47c0,0,0,0,0,0h-1.06c-0.84,0-1.52,0.68-1.52,1.52c0,0,0,0,0,0v0.51c0,0.28,0.23,0.51,0.51,0.51h7.09c0.28,0,0.51-0.23,0.51-0.51l0,0v-0.51C8.274,5.726,7.606,5.056,6.742,5.056z M20.642,2.476l2.03,2.03l-4.4,4.4l-1.81,0.2c-0.21,0.03-0.4-0.12-0.43-0.33c0-0.03,0-0.06,0-0.09l0.2-1.81L20.642,2.476L20.642,2.476z M23.922,2.176l-0.95-0.95c-0.3-0.3-0.78-0.3-1.08,0l-0.9,0.9l2.03,2.02l0.9-0.9C24.222,2.946,24.222,2.476,23.922,2.176L23.922,2.176z M10.652,7.736c0.72,0.02,1.3,0.61,1.31,1.33v2.98c0.61-0.53,1.53-0.47,2.07,0.14c0.02,0.02,0.03,0.04,0.04,0.05c0.65-0.37,1.48-0.15,1.86,0.49c1.47-0.27,2.12,0.65,2.12,2.16c0,0.08-0.01,0.4-0.01,0.48c0,1.85-0.93,2.29-1.14,3.69c-0.06,0.35-0.36,0.6-0.71,0.6h-5.11c-0.56,0-1.08-0.33-1.31-0.85c-0.39-0.86-1.46-2.84-2.3-3.2c-0.51-0.17-0.86-0.65-0.87-1.19c0-0.79,0.64-1.43,1.43-1.43c0.19,0,0.38,0.04,0.56,0.11c0.26,0.11,0.51,0.26,0.74,0.42v-4.45C9.322,8.396,9.892,7.746,10.652,7.736z M10.662,20.136h5.72c0.4,0,0.72,0.32,0.72,0.72l0,0v1.43c0,0.4-0.32,0.72-0.72,0.72l0,0h-5.72c-0.4,0-0.72-0.32-0.72-0.72l0,0v-1.43C9.942,20.456,10.262,20.136,10.662,20.136L10.662,20.136L10.662,20.136z M15.672,20.976c-0.33,0-0.6,0.27-0.6,0.6s0.27,0.6,0.6,0.6s0.6-0.27,0.6-0.6C16.272,21.246,15.992,20.976,15.672,20.976z'
              )
              break
          }
          ctx.translate(
            -metrics.width / 2 - ((iconSize + margin) * self.scale) / 2,
            (-iconSize * scale) / 2
          )
          ctx.scale((iconSize * scale) / 24, (iconSize * scale) / 24)
          ctx.fillStyle = 'rgba(0 ,0 ,0, 0.7)'
          ctx.fill(p)
        } else {
          ctx.font = `${this.fontSize * self.scale}px ${this.fontFamily}`
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'center'
          ctx.fillText(this.name, 0, 0)
        }
      },
    })

    fabric.LabeledRect.fromObject = function (object, callback, forceAsync) {
      return fabric.Object._fromObject(
        'LabeledRect',
        object,
        callback,
        forceAsync
      )
    }

    fabric.Date = fabric.util.createClass(fabric.Rect, {
      type: 'date',
      objectCaching: false,

      initialize(options) {
        options || (options = {})
        options.padding = `-${options.strokeWidth}`
        this.callSuper('initialize', options)
        this.set('id', options.id)
        this.set('selectId', options.selectId)
        this.set('annotateType', options.annotateType)
        this.set('name', options.name || '')
        this.set('fontSize', options.fontSize || 16)
        this.set('fontFamily', options.fontFamily || 'Microsoft JhengHei')
        this.set('fontStyle', options.fontStyle || '')
        this.set('fontWeight', options.fontWeight || '')
        this.set('dateFormat', options.dateFormat)
        this.set('dateRange', options.dateRange || 'signDay')
        this.set('required', options.required)
        this.set('label', options.label || '')
        this.set('text', options.text)
        this.set('readonly', options.readonly)
        this.set('dateEra', options.dateEra || 'common')
        this.set('textColor', options.textColor || 'rgba(0,0,0,1)')
        this.set('textDirection', options.textDirection || false)
        this.set('scale', options.scale || 1)
      },

      toObject() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
          id: this.get('id'),
          selectId: this.get('selectId'),
          annotateType: this.get('annotateType'),
          name: this.get('name'),
          fontSize: this.get('fontSize'),
          fontFamily: this.get('fontFamily'),
          fontStyle: this.get('fontStyle'),
          fontWeight: this.get('fontWeight'),
          dateFormat: this.get('dateFormat'),
          dateRange: this.get('dateRange'),
          required: this.get('required'),
          label: this.get('label'),
          text: this.get('text'),
          readonly: this.get('readonly'),
          dateEra: this.get('dateEra'),
          textColor: this.get('textColor'),
          textDirection: this.get('textDirection'),
          scale: this.get('scale'),
        })
      },

      _render(ctx) {
        this.callSuper('_render', ctx)
        let metrics = null
        if (this.required) {
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'right'
          ctx.font = `${Math.max(32 * self.scale, 12)}px ${this.fontFamily}`
          ctx.fillStyle = 'red'
          metrics = ctx.measureText('*')
          ctx.fillText(
            '*',
            this.width / 2,
            -this.height / 2 + metrics.actualBoundingBoxAscent
          )
        }
        let p = null
        ctx.rotate(((this.textDirection ? 90 : 0) * Math.PI) / 180)
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        const fontStyle = this.fontStyle || 'normal'
        const fontWeight = this.fontWeight || 'normal'
        ctx.font = `${fontStyle} ${fontWeight} ${
          this.fontSize * self.scale
        }px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        ctx.fillText(this.name, ((12 * this.fontSize) / 16) * self.scale, 0)
        p = new Path2D(
          'M9,10V12H7V10H9M13,10V12H11V10H13M17,10V12H15V10H17M19,3A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5A2,2 0 0,1 5,3H6V1H8V3H16V1H18V3H19M19,19V8H5V19H19M9,14V16H7V14H9M13,14V16H11V14H13M17,14V16H15V14H17Z'
        )
        ctx.translate(
          ((-29 * this.fontSize) / 16) * scale,
          ((-8 * this.fontSize) / 16) * scale
        )
        ctx.scale((this.fontSize * scale) / 24, (this.fontSize * scale) / 24)
        ctx.fillStyle = 'rgba(0 ,0 ,0, 0.7)'
        ctx.fill(p)
      },
    })

    fabric.Date.fromObject = function (object, callback, forceAsync) {
      return fabric.Object._fromObject('Date', object, callback, forceAsync)
    }

    fabric.Date.prototype._controlsVisibility = {
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: false,
      mt: false,
      mr: false,
      mb: false,
      mtr: false,
    }

    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (w < 2 * r) r = w / 2
      if (h < 2 * r) r = h / 2
      this.beginPath()
      this.moveTo(x + r, y)
      this.arcTo(x + w, y, x + w, y + h, r)
      this.arcTo(x + w, y + h, x, y + h, r)
      this.arcTo(x, y + h, x, y, r)
      this.arcTo(x, y, x + w, y, r)
      this.closePath()
      return this
    }

    /* eslint-disable */
    fabric.TextArea = fabric.util.createClass(fabric.IText, fabric.Observable, {
      type: 'textArea',
      minWidth: 20,
      dynamicMinWidth: 2,
      __cachedLines: null,
      lockScalingFlip: true,
      noScaleCache: false,
      _dimensionAffectingProps:
        fabric.Text.prototype._dimensionAffectingProps.concat('width'),
      _wordJoiners: /[ \t\r]/,
      splitByGrapheme: false,
      height: 16,
      objectCaching: false,
      scale: self.scale,

      initDimensions() {
        if (this.__skipDimension) {
          return
        }
        this.isEditing && this.initDelayedCursor()
        this.clearContextTop()
        this._clearCache()
        this.dynamicMinWidth = 0
        this._styleMap = this._generateStyleMap(this._splitText())
        if (this.dynamicMinWidth > this.width) {
          this._set('width', this.dynamicMinWidth)
        }
        if (this.textAlign && this.textAlign.includes('justify')) {
          this.enlargeSpaces()
        }
        this.height = Math.max(this.height, this.calcTextHeight())
        this.saveState({ propertySet: '_dimensionAffectingProps' })
      },

      _generateStyleMap(textInfo) {
        let realLineCount = 0
        let realLineCharCount = 0
        let charCount = 0
        const map = {}
        for (let i = 0; i < textInfo.graphemeLines.length; i++) {
          if (textInfo.graphemeText[charCount] === '\n' && i > 0) {
            realLineCharCount = 0
            charCount++
            realLineCount++
          } else if (
            !this.splitByGrapheme &&
            this._reSpaceAndTab.test(textInfo.graphemeText[charCount]) &&
            i > 0
          ) {
            realLineCharCount++
            charCount++
          }
          map[i] = { line: realLineCount, offset: realLineCharCount }
          charCount += textInfo.graphemeLines[i].length
          realLineCharCount += textInfo.graphemeLines[i].length
        }
        return map
      },

      _splitText() {
        var newLines = this._splitTextIntoLines(this.text)
        this.textLines = newLines.lines
        if (this.canvas) {
          const shape = this.canvas.layer.annotate
            .find((x) => x.page === this.canvas.pageNumber)
            .data.find((y) => y.objectId === this.id)
          shape.textLines = this.textLines
        }
        this._textLines = newLines.graphemeLines
        this._unwrappedTextLines = newLines._unwrappedLines
        this._text = newLines.graphemeText
        return newLines
      },

      styleHas(property, lineIndex) {
        if (this._styleMap && !this.isWrapping) {
          const map = this._styleMap[lineIndex]
          if (map) {
            lineIndex = map.line
          }
        }
        return fabric.Text.prototype.styleHas.call(this, property, lineIndex)
      },

      isEmptyStyles(lineIndex) {
        if (!this.styles) {
          return true
        }
        let offset = 0
        let nextLineIndex = lineIndex + 1
        let nextOffset
        let obj
        let shouldLimit = false
        const map = this._styleMap[lineIndex]
        const mapNextLine = this._styleMap[lineIndex + 1]
        if (map) {
          lineIndex = map.line
          offset = map.offset
        }
        if (mapNextLine) {
          nextLineIndex = mapNextLine.line
          shouldLimit = nextLineIndex === lineIndex
          nextOffset = mapNextLine.offset
        }
        obj =
          typeof lineIndex === 'undefined'
            ? this.styles
            : { line: this.styles[lineIndex] }
        for (const p1 in obj) {
          for (const p2 in obj[p1]) {
            if (p2 >= offset && (!shouldLimit || p2 < nextOffset)) {
              for (const p3 in obj[p1][p2]) {
                return false
              }
            }
          }
        }
        return true
      },

      _getStyleDeclaration(lineIndex, charIndex) {
        if (this._styleMap && !this.isWrapping) {
          const map = this._styleMap[lineIndex]
          if (!map) {
            return null
          }
          lineIndex = map.line
          charIndex = map.offset + charIndex
        }
        return this.callSuper('_getStyleDeclaration', lineIndex, charIndex)
      },

      _setStyleDeclaration(lineIndex, charIndex, style) {
        const map = this._styleMap[lineIndex]
        lineIndex = map.line
        charIndex = map.offset + charIndex
        this.styles[lineIndex][charIndex] = style
      },

      _deleteStyleDeclaration(lineIndex, charIndex) {
        const map = this._styleMap[lineIndex]
        lineIndex = map.line
        charIndex = map.offset + charIndex
        delete this.styles[lineIndex][charIndex]
      },

      _getLineStyle(lineIndex) {
        const map = this._styleMap[lineIndex]
        return !!this.styles[map.line]
      },

      _setLineStyle(lineIndex) {
        const map = this._styleMap[lineIndex]
        this.styles[map.line] = {}
      },

      _wrapText(lines, desiredWidth) {
        let wrapped = []
        let i
        this.isWrapping = true
        for (i = 0; i < lines.length; i++) {
          wrapped = wrapped.concat(this._wrapLine(lines[i], i, desiredWidth))
        }
        this.isWrapping = false
        return wrapped
      },

      _measureWord(word, lineIndex, charOffset) {
        let width = 0
        let prevGrapheme
        const skipLeft = true
        charOffset = charOffset || 0
        for (let i = 0, len = word.length; i < len; i++) {
          const box = this._getGraphemeBox(
            word[i],
            lineIndex,
            i + charOffset,
            prevGrapheme,
            skipLeft
          )
          width += box.kernedWidth
          prevGrapheme = word[i]
        }
        return width
      },

      _wrapLine(_line, lineIndex, desiredWidth, reservedSpace) {
        let lineWidth = 0
        const splitByGrapheme = this.splitByGrapheme
        const graphemeLines = []
        let line = []
        const words = splitByGrapheme
          ? fabric.util.string.graphemeSplit(_line)
          : _line.split(this._wordJoiners)
        let word = ''
        let offset = 0
        const infix = splitByGrapheme ? '' : ' '
        let wordWidth = 0
        let infixWidth = 0
        let largestWordWidth = 0
        let lineJustStarted = true
        const additionalSpace = this._getWidthOfCharSpacing()
        var reservedSpace = reservedSpace || 0

        if (words.length === 0) {
          words.push([])
        }
        desiredWidth -= reservedSpace
        for (var i = 0; i < words.length; i++) {
          word = splitByGrapheme
            ? words[i]
            : fabric.util.string.graphemeSplit(words[i])
          wordWidth = this._measureWord(word, lineIndex, offset)
          offset += word.length
          lineWidth += infixWidth + wordWidth - additionalSpace
          if (lineWidth > desiredWidth && !lineJustStarted) {
            graphemeLines.push(line)
            line = []
            lineWidth = wordWidth
            lineJustStarted = true
          } else {
            lineWidth += additionalSpace
          }
          if (!lineJustStarted && !splitByGrapheme) {
            line.push(infix)
          }
          line = line.concat(word)
          infixWidth = splitByGrapheme
            ? 0
            : this._measureWord([infix], lineIndex, offset)
          offset++
          lineJustStarted = false
          if (wordWidth > largestWordWidth) {
            largestWordWidth = wordWidth
          }
        }
        i && graphemeLines.push(line)
        if (largestWordWidth + reservedSpace > this.dynamicMinWidth) {
          this.dynamicMinWidth =
            largestWordWidth - additionalSpace + reservedSpace
        }
        return graphemeLines
      },

      isEndOfWrapping(lineIndex) {
        if (!this._styleMap[lineIndex + 1]) {
          return true
        }
        if (
          this._styleMap[lineIndex + 1].line !== this._styleMap[lineIndex].line
        ) {
          return true
        }
        return false
      },

      missingNewlineOffset(lineIndex) {
        if (this.splitByGrapheme) {
          return this.isEndOfWrapping(lineIndex) ? 1 : 0
        }
        return 1
      },

      _splitTextIntoLines(text) {
        const newText = fabric.Text.prototype._splitTextIntoLines.call(
          this,
          text
        )
        const graphemeLines = this._wrapText(newText.lines, this.width)
        const lines = new Array(graphemeLines.length)
        for (let i = 0; i < graphemeLines.length; i++) {
          lines[i] = graphemeLines[i].join('')
        }
        newText.lines = lines
        newText.graphemeLines = graphemeLines
        return newText
      },
      getMinWidth() {
        return Math.max(this.minWidth, this.dynamicMinWidth)
      },
      _removeExtraneousStyles() {
        const linesToKeep = {}
        for (var prop in this._styleMap) {
          if (this._textLines[prop]) {
            linesToKeep[this._styleMap[prop].line] = 1
          }
        }
        for (var prop in this.styles) {
          if (!linesToKeep[prop]) {
            delete this.styles[prop]
          }
        }
      },

      toObject(propertiesToInclude) {
        return this.callSuper(
          'toObject',
          ['minWidth', 'splitByGrapheme', 'scale'].concat(propertiesToInclude)
        )
      },
    })
    /* eslint-enable */

    fabric.TextArea.fromObject = function (object, callback) {
      return fabric.Object._fromObject('TextArea', object, callback, 'text')
    }

    fabric.TextArea.prototype._renderBackground = function (ctx) {
      if (!this.backgroundColor) {
        return
      }
      const dim = this._getNonTransformedDimensions()
      ctx.fillStyle = this.backgroundColor
      ctx.roundRect(-dim.x / 2, -dim.y / 2, dim.x, dim.y, this.rx).fill()
      if (
        this.backgroundStroke !== null &&
        this.backgroundStroke !== undefined &&
        this.backgroundStrokeWidth !== null &&
        this.backgroundStrokeWidth !== undefined &&
        this.backgroundStrokeWidth !== 0
      ) {
        ctx.lineWidth = this.backgroundStrokeWidth
        ctx.strokeStyle = this.backgroundStroke
        ctx.stroke()
      }
      if (this.text === '') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        const fontStyle = this.fontStyle || 'normal'
        const fontWeight = this.fontWeight || 'normal'
        ctx.font = `${fontStyle} ${fontWeight} ${this.fontSize}px Montserrat Noto Sans TC Noto Sans SC Roboto Microsoft JhengHei  sans-serif`
        let metrics = ctx.measureText(i18n.text)
        ctx.textAlign = this.textAlign
        const x =
          this.textAlign === 'left'
            ? -this.width / 2
            : this.textAlign === 'center'
            ? 0
            : this.width / 2

        // 文字方向
        if (this.textDirection) {
          // 框高低於“文字”兩字的寬度
          if (this.height < metrics.width) {
            metrics = ctx.measureText(i18n.text.charAt(0))
            // placeholder只顯示“文”, if 框高高於“文“一字的寬度（大概）
            if (this.height >= metrics.width) {
              ctx.fillText(i18n.text.charAt(0), x, 0)
            }
          }
          // 直式placeholder
          else {
            for (let i = 0; i < i18n.text.length; i++) {
              ctx.fillText(i18n.text[i], x, this.fontSize * i)
            }
          }
        }
        // 框寬低於“文字”兩字的寬度
        else if (this.width < metrics.width) {
          metrics = ctx.measureText(i18n.text.charAt(0))
          // placeholder只顯示“文”, if 框寬高於“文“一字的寬度
          if (this.width >= metrics.width) {
            ctx.fillText(
              i18n.text.charAt(0),
              x,
              -this.height / 2 + metrics.actualBoundingBoxAscent
            )
          }
        }
        // 橫式placeholder
        else {
          ctx.fillText(
            i18n.text,
            x,
            -this.height / 2 + metrics.actualBoundingBoxAscent
          )
        }
      }

      let metrics = null
      if (this.required) {
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'right'
        ctx.font = `${Math.max(32 * self.scale, 12)}px ${this.fontFamily}`
        ctx.fillStyle = 'red'
        metrics = ctx.measureText('*')
        ctx.fillText(
          '*',
          this.width / 2,
          -this.height / 2 + metrics.actualBoundingBoxAscent
        )
      }
      this._removeShadow(ctx)
    }

    fabric.TextArea.prototype.enterEditing = function (e) {
      if (this.isEditing || !this.editable) {
        return
      }

      if (this.canvas) {
        this.canvas.calcOffset()
        this.exitEditingOnOthers(this.canvas)
      }

      this.isEditing = true

      this.initHiddenTextarea(e)
      this.hiddenTextarea.focus()
      this.hiddenTextarea.value = this.text
      this._updateTextarea()
      this._saveEditingProps()
      // this._setEditingProps()
      // override this._setEditingProps()
      // StartRegion
      this.hoverCursor = 'text'

      if (this.canvas) {
        this.canvas.defaultCursor = this.canvas.moveCursor = 'text'
      }

      // this.borderColor = this.editingBorderColor
      // this.hasControls = this.selectable = false
      this.lockMovementX = this.lockMovementY = true
      // EndRegion
      this._textBeforeEdit = this.text

      this._tick()
      this.fire('editing:entered')
      this._fireSelectionChanged()
      if (!this.canvas) {
        return this
      }
      this.canvas.fire('text:editing:entered', { target: this })
      this.initMouseMoveHandler()
      this.canvas.requestRenderAll()
      return this
    }

    fabric.Dropdown = fabric.util.createClass(fabric.Rect, {
      type: 'dropdown',
      objectCaching: false,

      initialize(options) {
        options || (options = {})
        options.padding = `-${options.strokeWidth}`
        this.callSuper('initialize', options)
        this.set('id', options.id)
        this.set('selectId', options.selectId)
        this.set('annotateType', options.annotateType)
        this.set('name', options.name || '')
        this.set('label', options.label || '')
        this.set('fontSize', options.fontSize || 16)
        this.set('fontFamily', options.fontFamily || 'Microsoft JhengHei')
        this.set('fontStyle', options.fontStyle || '')
        this.set('fontWeight', options.fontWeight || '')
        this.set('required', options.required)
        this.set('readonly', options.readonly)
        this.set('selectOptionId', options.selectOptionId)
        this.set('options', options.options)
        this.set('textColor', options.textColor || 'rgba(0,0,0,1)')
        this.set('scale', options.scale || 1)
      },

      toObject() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
          id: this.get('id'),
          selectId: this.get('selectId'),
          annotateType: this.get('annotateType'),
          name: this.get('name'),
          label: this.get('label'),
          fontSize: this.get('fontSize'),
          fontFamily: this.get('fontFamily'),
          fontStyle: this.get('fontStyle'),
          fontWeight: this.get('fontWeight'),
          required: this.get('required'),
          readonly: this.get('readonly'),
          selectOptionId: this.get('selectOptionId'),
          options: this.get('options'),
          textColor: this.get('textColor'),
          scale: this.get('scale'),
        })
      },

      _render(ctx) {
        this.callSuper('_render', ctx)
        let metrics = null
        if (this.required) {
          ctx.textBaseline = 'middle'
          ctx.textAlign = 'right'
          ctx.font = `${Math.max(32 * self.scale, 12)}px ${this.fontFamily}`
          ctx.fillStyle = 'red'
          metrics = ctx.measureText('*')
          ctx.fillText(
            '*',
            this.width / 2,
            -this.height / 2 + metrics.actualBoundingBoxAscent
          )
        }
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        const fontStyle = this.fontStyle || 'normal'
        const fontWeight = this.fontWeight || 'normal'
        ctx.font = `${fontStyle} ${fontWeight} ${
          this.fontSize * self.scale
        }px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        metrics = ctx.measureText(this.name)
        ctx.fillText(this.name, -16 * self.scale, 0)
        const p = new Path2D('M7,10L12,15L17,10H7Z')
        ctx.translate(
          this.width / 2 - (this.fontSize + 8) * scale * 0.8,
          (-11 * this.fontSize * scale) / 24
        )
        ctx.scale((this.fontSize * scale) / 24, (this.fontSize * scale) / 24)
        ctx.fillStyle = 'rgba(0 ,0 ,0, 0.7)'
        ctx.fill(p)
      },
    })

    fabric.Dropdown.fromObject = function (object, callback, forceAsync) {
      return fabric.Object._fromObject('Dropdown', object, callback, forceAsync)
    }

    fabric.Dropdown.prototype._controlsVisibility = {
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: false,
      mt: false,
      mr: false,
      mb: false,
      mtr: false,
    }

    const defaultOnTouchStartHandler = fabric.Canvas.prototype._onTouchStart
    fabric.util.object.extend(fabric.Canvas.prototype, {
      _onTouchStart(e) {
        const target = this.findTarget(e)
        // if allowTouchScrolling is enabled, no object was at the
        // the touch position and we're not in drawing mode, then
        // let the event skip the fabricjs canvas and do default
        // behavior
        if (this.allowTouchScrolling && !target && !this.isDrawingMode) {
          // returning here should allow the event to propagate and be handled
          // normally by the browser
          return
        }

        // otherwise call the default behavior
        defaultOnTouchStartHandler.call(this, e)
      },
    })

    // Fabric History
    fabric.Canvas.prototype._historyNext = function () {
      return JSON.stringify(this.toDatalessJSON(this.extraProps))
    }

    fabric.Canvas.prototype._historyInit = function () {
      this.historyUndo = []
      this.historyRedo = []
      this.extraProps = [
        'originWidth',
        'originHeight',
        'backgroundColor',
        'backgroundStroke',
        'backgroundStrokeWidth',
        'checkboxBackgroundColor',
        'checkboxStrokeWidth',
        'checkboxStroke',
        'radioBackgroundColor',
        'radioStrokeWidth',
        'radioStroke',
        'selected',
        'id',
        'selectId',
        'groupId',
        'annotateType',
        'rx',
        'ry',
        'required',
        'readonly',
        'singleLine',
        'textDirection',
        'maxlength',
        'centerWidth',
        'centerHeight',
        'ruleId',
        'maximum',
        'minimum',
        'name',
        'label',
        'groupLabel',
        'originFontSize',
        'scale',
        'validation',
        'prefill',
        'badgeId',
        'textColor',
      ]
      this.historyNextState = this._historyNext()
    }

    fabric.Canvas.prototype.initHistoryParams = function (options) {
      this.historyUndo = options.historyUndo
      this.historyRedo = options.historyRedo
      if (options.historyNext) {
        this.historyNextState = options.historyNext
        const json = this.historyNextState
        this.fire('history:append', { json })
      }
    }

    fabric.Canvas.prototype._historySaveAction = function () {
      if (this.historyProcessing) return
      // set last scene into undo
      let json = this.historyNextState
      const tempJson = JSON.parse(json)
      // 不存 checkbox, radioBtn 的 badge 物件
      tempJson.objects = tempJson.objects.filter((item) => {
        return !('badgeId' in item)
      })
      json = JSON.stringify(tempJson)
      if (json === this.historyUndo[this.historyUndo.length - 1]) return

      this.historyUndo.push(json)
      self.eventBus.dispatch('setHistoryUndo', {
        history: {
          data: json,
          page: this.pageNumber,
        },
      })
      // clear redo
      this.historyRedo = []
      self.eventBus.dispatch('initHistoryRedo')

      // set current scene
      this.historyNextState = this._historyNext()
      self.eventBus.dispatch('setHistoryNext', {
        page: this.pageNumber,
        historyNext: this.historyNextState,
      })
      this.fire('history:append', { json })
    }

    fabric.Canvas.prototype.undo = function (callback) {
      this.historyProcessing = true
      const history = this.historyUndo.pop()
      if (history) {
        this.historyRedo.push(this._historyNext())
        self.eventBus.dispatch('setHistoryRedo', {
          history: {
            data: this._historyNext(),
            page: this.pageNumber,
          },
        })

        this.historyNextState = history
        self.eventBus.dispatch('setHistoryNext', {
          page: this.pageNumber,
          historyNext: this.historyNextState,
        })
        this._loadHistory(history, 'history:undo', callback)
      } else {
        this.historyProcessing = false
      }
    }
    // force undo is undo with no redo history
    fabric.Canvas.prototype.forceUndo = function (callback) {
      this.historyProcessing = true
      const history = this.historyUndo.pop()
      if (history) {
        // this.historyRedo.push(this._historyNext())
        // self.eventBus.dispatch('setHistoryRedo', {
        //   history: {
        //     data: this._historyNext(),
        //     page: this.pageNumber,
        //   },
        // })
        this.historyNextState = history
        self.eventBus.dispatch('setHistoryNext', {
          page: this.pageNumber,
          historyNext: this.historyNextState,
        })
        this._loadHistory(history, 'history:undo', callback)
      } else {
        this.historyProcessing = false
      }
    }

    fabric.Canvas.prototype.redo = function (callback) {
      this.historyProcessing = true
      const history = this.historyRedo.pop()
      if (history) {
        this.historyUndo.push(this._historyNext())
        self.eventBus.dispatch('setHistoryUndo', {
          history: {
            data: this._historyNext(),
            page: this.pageNumber,
          },
        })
        this.historyNextState = history
        self.eventBus.dispatch('setHistoryNext', {
          page: this.pageNumber,
          historyNext: this.historyNextState,
        })
        this._loadHistory(history, 'history:redo', callback)
      } else {
        this.historyProcessing = false
      }
    }

    fabric.Canvas.prototype._loadHistory = function (history, event, callback) {
      const that = this
      const data = JSON.parse(history)
      // calculate render x,y,width,height when undo redo
      data.objects.forEach((item) => {
        if (item.scale) {
          const proportion = scale / item.scale
          item.width *= proportion
          item.height *= proportion
          if (item.left) item.left *= proportion
          if (item.top) item.top *= proportion
          if (item.originWidth) item.originWidth *= proportion
          if (item.originHeight) item.originHeight *= proportion
          if (item.x) item.x *= proportion
          if (item.y) item.y *= proportion
          if (item.rx) item.rx *= proportion
          if (item.ry) item.ry *= proportion
          if (item.strokeWidth) item.strokeWidth *= proportion
          if (item.imageWidth) item.imageWidth *= proportion
          if (item.imageHeight) item.imageHeight *= proportion
          if (item.imageX) item.imageX *= proportion
          if (item.imageY) item.imageY *= proportion
          if (item.centerWidth) item.centerWidth *= proportion
          if (item.centerHeight) item.centerHeight *= proportion
          if (item.annotateType === 1) {
            item.fontSize = item.originFontSize * scale
          }
          if (item.annotateType === 2) {
            const strokeWidth = (item.originFontSize / 14) * scale
            for (let i = 0; i < item.objects.length; i++) {
              const o = item.objects[i]
              if (i === 0) {
                o.width = o.height = item.originFontSize * scale - strokeWidth
                o.strokeWidth = strokeWidth
              } else if (i === 1) {
                if (item.selected) {
                  const origin = window.location.origin
                  const imageUrl = origin + '/checkbox.png'
                  o.fill = {
                    type: 'pattern',
                    source: imageUrl,
                    repeat: 'no-repeat',
                    offsetX: 0,
                    offsetY: 0,
                    patternTransform: [
                      (item.originFontSize * scale * 0.55) / 36, // 36 is image width
                      0,
                      0,
                      (item.originFontSize * scale * 0.55) / 36,
                      0,
                      0,
                    ],
                  }
                }
                o.width = o.height = item.originFontSize * scale * 0.55
              }
            }
            item.originWidth = item.originHeight = item.originFontSize * scale
            item.centerWidth = item.centerHeight =
              item.originFontSize * scale * 0.8
            item.strokeWidth = strokeWidth
            item.width = item.height =
              item.originFontSize * scale - 2 * strokeWidth
          }
          if (item.annotateType === 5) {
            const strokeWidth = (item.originFontSize / 15) * scale
            item.width = item.height = item.originFontSize * scale - strokeWidth
            item.originWidth = item.originHeight = item.originFontSize * scale
            item.rx = item.ry = strokeWidth / 2
            for (let i = 0; i < item.objects.length; i++) {
              const o = item.objects[i]
              if (i === 0) {
                o.width = o.height = item.originFontSize * scale - strokeWidth
                o.rx = o.ry = strokeWidth / 2
                o.strokeWidth = strokeWidth
              } else if (i === 1) {
                o.radius = (item.originFontSize * scale * 0.6) / 2
              } else {
                o.radius = item.selected
                  ? (item.originFontSize * scale * 0.45) / 2
                  : 0
                o.strokeWidth = strokeWidth
              }
            }
            item.originWidth = item.originHeight = item.originFontSize * scale
            item.centerWidth = item.centerHeight =
              item.originFontSize * scale * 0.65
            item.strokeWidth = strokeWidth
            item.rx = item.ry = strokeWidth
            item.width = item.height =
              item.originFontSize * scale - 2 * strokeWidth
          }
          item.scale = scale
        }
      })
      this.loadFromJSON(JSON.stringify(data), function () {
        that.renderAll()
        that.fire(event)
        that.historyProcessing = false

        if (callback && typeof callback === 'function') callback()
      })
    }

    fabric.Canvas.prototype.clearHistory = function () {
      this.historyUndo = []
      this.historyRedo = []
      this.fire('history:clear')
    }

    fabric.Canvas.prototype.offHistory = function () {
      this.historyProcessing = true
    }

    fabric.Canvas.prototype.onHistory = function () {
      this.historyProcessing = false

      this._historySaveAction()
    }
  }
}

function createEraserBrush(mode, eventBus) {
  const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {
    type: 'eraserBrush',
    width: 25,
    color: 'rgba(200, 202, 204, 0.2)',
    _finalizeAndAddPath() {
      const ctx = this.canvas.contextTop
      ctx.closePath()
      if (this.decimate) {
        this._points = this.decimatePoints(this._points, this.decimate)
      }
      const pathData = this.convertPointsToSVGPath(this._points).join('')
      if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {
        this.canvas.requestRenderAll()
        return
      }

      const path = this.createPath(pathData)
      path.globalCompositeOperation = 'destination-out'
      path.selectable = false
      path.evented = false
      path.absolutePositioned = true

      const objects = this.canvas.getObjects().filter((obj) => {
        if (!obj.intersectsWithObject(path)) return false
        return true
      })

      if (objects.length > 0) {
        const annotate = this.canvas.layer.annotate.find(
          (x) => x.page === this.canvas.pageNumber
        )
        objects.forEach((obj) => {
          const shape = annotate.data.find((y) => y.objectId === obj.id)
          const index = this.canvas.layer.annotate
            .find((x) => x.page === this.canvas.pageNumber)
            .data.indexOf(shape)
          if (index > -1) {
            this.canvas.layer.annotate
              .find((x) => x.page === this.canvas.pageNumber)
              .data.splice(index, 1)
          }
          if (mode === 0 || mode === 5) {
            if (
              shape.groupId !== null &&
              shape.groupId !== undefined &&
              shape.type === 2
            ) {
              const group = this.canvas.layer.checkboxGroup.find(
                (x) => x.id === shape.groupId
              )
              const children = this.canvas.layer.annotate
                .find((x) => x.page === this.canvas.pageNumber)
                .data.filter((y) => y.groupId === shape.groupId && y.type === 2)
              if (group) {
                const container = group.container
                const div = group.groupDiv
                container.style.top =
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.y
                    })
                  ) -
                  obj.checkboxStrokeWidth -
                  4 +
                  'px'
                container.style.left =
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.x
                    })
                  ) -
                  obj.checkboxStrokeWidth -
                  4 +
                  'px'
                div.style.width =
                  Math.max.apply(
                    Math,
                    children.map(function (child) {
                      return child.x
                    })
                  ) +
                  obj.width -
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.x
                    })
                  ) +
                  4 * obj.checkboxStrokeWidth +
                  8 +
                  'px'
                div.style.height =
                  Math.max.apply(
                    Math,
                    children.map(function (child) {
                      return child.y
                    })
                  ) +
                  obj.height -
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.y
                    })
                  ) +
                  4 * obj.checkboxStrokeWidth +
                  8 +
                  'px'
                group.groupDiv = div
              }
            } else if (
              shape.groupId !== null &&
              shape.groupId !== undefined &&
              shape.type === 5
            ) {
              const group = this.canvas.layer.radioGroup.find(
                (x) => x.id === shape.groupId
              )
              const children = this.canvas.layer.annotate
                .find((x) => x.page === this.canvas.pageNumber)
                .data.filter((y) => y.groupId === shape.groupId && y.type === 5)
              if (group) {
                const container = group.container
                const div = group.groupDiv
                container.style.top =
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.y
                    })
                  ) -
                  obj.radioStrokeWidth -
                  4 +
                  'px'
                container.style.left =
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.x
                    })
                  ) -
                  obj.radioStrokeWidth -
                  4 +
                  'px'
                div.style.width =
                  Math.max.apply(
                    Math,
                    children.map(function (child) {
                      return child.x
                    })
                  ) +
                  obj.width -
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.x
                    })
                  ) +
                  4 * obj.radioStrokeWidth +
                  8 +
                  'px'
                div.style.height =
                  Math.max.apply(
                    Math,
                    children.map(function (child) {
                      return child.y
                    })
                  ) +
                  obj.height -
                  Math.min.apply(
                    Math,
                    children.map(function (child) {
                      return child.y
                    })
                  ) +
                  4 * obj.radioStrokeWidth +
                  8 +
                  'px'
                group.groupDiv = div
              }
            }
          }
          this.canvas.remove(obj)
        })
        this.canvas.discardActiveObject().renderAll()
      }

      this.canvas.clearContext(this.canvas.contextTop)
      this.canvas.renderAll()
      this._resetShadow()
    },
  })
  return EraserBrush
}
export { initialize, createEraserBrush }
