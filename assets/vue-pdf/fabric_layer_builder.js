import { fabric } from 'fabric'
import moment from 'moment'
import { initialize, createEraserBrush } from './fabric_layer_utils'
class FabricLayerBuilder {
  constructor({
    viewerContainer,
    canvasWrapper,
    pageIndex,
    pdfCanvas,
    scale,
    selectedFileIndex = { page: 1 },
    annotate = null,
    commentList = null,
    commentMode = { on: false },
    eventBus,
    state,
    mode,
    checkAnnotate = false,
    showOutline = false,
    colorList,
    fabricParams,
    drawColor,
    drawWidth,
    activeType,
    geometryMode,
    geometryShape,
    drawBGC,
    i18n,
    role,
    control,
    selectedCanvas,
    showDrawTool,
  }) {
    this.viewerContainer = viewerContainer
    this.canvasWrapper = canvasWrapper
    this.pageIdx = pageIndex
    this.pageNumber = this.pageIdx + 1
    this.pdfCanvas = pdfCanvas
    this.scale = scale
    this.selectedFileIndex = selectedFileIndex
    this.annotate = annotate
    this.commentList = commentList
    this.commentMode = commentMode
    this.eventBus = eventBus
    this.state = state
    this.mode = mode
    this.checkAnnotate = checkAnnotate
    this.showOutline = showOutline
    this.colorList = colorList
    this.fabricParams = fabricParams
    this.drawColor = drawColor
    this.drawWidth = drawWidth
    this.activeType = activeType
    this.geometryMode = geometryMode
    this.geometryShape = geometryShape
    this.drawBGC = drawBGC
    this.i18n = i18n
    this.canvas = null
    this.checkboxGroup = []
    this.radioGroup = []
    this.canvasScrolling = false
    this.scrollEvent = null
    this.resizeEvent = null
    this.addElements = []
    this.role = role
    this.control = control
    this.selectedCanvas = selectedCanvas
    this.showDrawTool = showDrawTool
    this.defaultSelectionColor = 'rgba(17, 119, 255, 0.3)'
    this.canControl =
      (this.control === 0 && this.role === 'HOST') ||
      (this.control === 1 && this.role === 'SIGNER')
    this.editableTypeArr = [1, 4]
    this.defaultBGC = 'rgba(245, 245, 245, 0.6)'
    this.defaultBorderColor = '#E0E0E0'
    this.useDefaultColor = true

    const self = this
    initialize(mode, scale, i18n, self)
    if (this.mode === 0 || this.mode === 1 || this.mode === 4) {
      this.EraserBrush = createEraserBrush(this.mode, eventBus)
    }
    if (this.mode === 4 || this.mode === 1) {
      this.DrawBrush = false
    }
  }

  render() {
    const pdfCanvas = this.pdfCanvas
    const scale = this.scale
    const self = this
    this.eventBus.dispatch('deselectAnnotate')
    switch (this.mode) {
      case 0:
        if (!this.canvas && pdfCanvas) {
          const canvas = document.createElement('canvas')
          this.canvas = canvas
          this.canvasWrapper.appendChild(canvas)
          canvas.style.zIndex = 30
          canvas.style.position = 'absolute'
          const c = new fabric.Canvas(canvas, {
            width: parseFloat(pdfCanvas.style.width),
            height: parseFloat(pdfCanvas.style.height),
            allowTouchScrolling: this.fabricParams.allowTouchScrolling,
          })

          canvas.fabric = c
          c.uniformScaling = false
          c.layer = self
          c.pageNumber = this.pageNumber

          if (this.fabricParams.eraserTool) {
            const eraserBrush = new this.EraserBrush(c)
            c.freeDrawingBrush = eraserBrush
            c.isDrawingMode = true
          } else {
            c.freeDrawingBrush = null
            c.isDrawingMode = false
          }

          this.initAligningGuidelines()

          c.on('object:moving', function (e) {
            const obj = e.target
            if (self.commentMode.on) return
            // if object is too big ignore
            if (
              obj.currentHeight > obj.canvas.height ||
              obj.currentWidth > obj.canvas.width
            ) {
              return
            }
            obj.setCoords()
            // top-left  corner
            if (
              obj.getBoundingRect().top < 0 ||
              obj.getBoundingRect().left < 0
            ) {
              obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top)
              obj.left = Math.max(
                obj.left,
                obj.left - obj.getBoundingRect().left
              )
            }
            // bot-right corner
            if (
              obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height ||
              obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
            ) {
              obj.top = Math.min(
                obj.top,
                obj.canvas.height -
                  obj.getBoundingRect().height +
                  obj.top -
                  obj.getBoundingRect().top
              )
              obj.left = Math.min(
                obj.left,
                obj.canvas.width -
                  obj.getBoundingRect().width +
                  obj.left -
                  obj.getBoundingRect().left
              )
            }

            if (
              obj._objects &&
              obj._objects.length > 1 &&
              (obj.id === null || obj.id === undefined)
            ) {
              obj._objects.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                shape.x = obj.left + obj.width / 2 + element.left
                shape.y = obj.top + obj.height / 2 + element.top
              })
              const groupObject = obj._objects.filter(
                (x) => x.groupId !== null && x.groupId !== undefined
              )
              groupObject.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                if (
                  shape.groupId !== null &&
                  shape.groupId !== undefined &&
                  shape.type === 2
                ) {
                  const group = self.checkboxGroup.find(
                    (x) => x.id === shape.groupId
                  )
                  const children = self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === shape.groupId && y.type === 2
                    )
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
                      element.checkboxStrokeWidth -
                      4 +
                      'px'
                    container.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.checkboxStrokeWidth -
                      4 +
                      'px'
                    div.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.strokeWidth * 2 +
                      8 +
                      'px'
                    div.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.strokeWidth * 2 +
                      8 +
                      'px'
                    group.groupDiv = div
                  }
                } else if (
                  shape.groupId !== null &&
                  shape.groupId !== undefined &&
                  shape.type === 5
                ) {
                  const group = self.radioGroup.find(
                    (x) => x.id === shape.groupId
                  )
                  const children = self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === shape.groupId && y.type === 5
                    )
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
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    container.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    div.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    div.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    group.groupDiv = div
                  }
                }
              })
            } else {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              shape.x = obj.left
              shape.y = obj.top
              if (
                shape.group !== null &&
                shape.group !== undefined &&
                obj._objects
              ) {
                obj._objects.forEach((element) => {
                  const groupShape = shape.group.find(
                    (x) => x.objectId === element.id
                  )
                  groupShape.x = obj.left + obj.width / 2 + element.left
                  groupShape.y = obj.top + obj.height / 2 + element.top
                })
              }
              self.setGroupBorder(shape, obj)
            }

            self.eventBus.dispatch('updateAnnotateTool', {
              source: self,
              on: false,
              selection: null,
              position: null,
            })
          })

          c.on('object:moved', function (e) {
            if (self.commentMode.on) {
              const obj = e.target
              // 防呆 拉出界
              if (obj.left + obj.width * obj.scaleX > obj.canvas.width) {
                obj.left = obj.canvas.width - obj.width * obj.scaleX
              }
              if (obj.left < 0) {
                obj.left = 0
              }
              if (obj.top < 0) {
                obj.top = 0
              }
              if (obj.top + obj.height * obj.scaleY > obj.canvas.height) {
                obj.top = obj.canvas.height - obj.height * obj.scaleY
              }

              // comment moved
              if (
                e.target.type === 16 &&
                self.commentList[this.selectedFileIndex.page - 1].comment
              ) {
                const comment = self.commentList[
                  this.selectedFileIndex.page - 1
                ].comment.find((com) => com.id === obj.id)
                comment.x = obj.left
                comment.y = obj.top
              }
              c.renderAll()
            } else {
              const rect = pdfCanvas.getBoundingClientRect()
              const position = {
                top: rect.top + e.target.top,
                left: rect.left + e.target.left,
              }
              const selection = e.target
              let checkboxGroup = null
              let radioGroup = null
              if (
                selection.annotateType &&
                (selection.annotateType === 2 || selection.annotateType === 5)
              ) {
                const element = selection
                if (
                  element.groupId !== null &&
                  element.groupId !== undefined &&
                  element.annotateType === 2
                ) {
                  checkboxGroup = self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 2
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                } else if (
                  element.groupId !== null &&
                  element.groupId !== undefined &&
                  element.annotateType === 5
                ) {
                  radioGroup = self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 5
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                }
              }
              self.eventBus.dispatch('updateAnnotateTool', {
                source: self,
                on: true,
                selection,
                position,
                checkboxGroup,
                radioGroup,
                rect,
              })
            }
          })

          c.on('object:scaling', function (e) {
            const obj = e.target
            if (self.commentMode.on) return
            // top-left  corner
            if (
              obj.getBoundingRect().top < 0 ||
              obj.getBoundingRect().left < 0
            ) {
              if (obj.getBoundingRect().top < 0) {
                obj.height += obj.top
              }
              if (obj.getBoundingRect().left < 0) {
                obj.width += obj.left
              }
              obj.top = Math.max(obj.top, 0)
              obj.left = Math.max(obj.left, 0)
            }
            // bot-right corner
            if (
              obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height ||
              obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
            ) {
              if (
                obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height
              ) {
                obj.height = obj.canvas.height - obj.getBoundingRect().top
              }
              if (
                obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
              ) {
                obj.width = obj.canvas.width - obj.getBoundingRect().left
              }
            }

            if (
              obj._objects &&
              obj._objects.length > 1 &&
              (obj.id === null || obj.id === undefined)
            ) {
              const scaleX = obj.scaleX
              const scaleY = obj.scaleY
              obj.set({
                height: obj.height * obj.scaleY,
                width: obj.width * obj.scaleX,
                scaleX: 1,
                scaleY: 1,
              })
              obj._objects.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                shape.x = obj.left + obj.width / 2 + element.left
                shape.y = obj.top + obj.height / 2 + element.top
                shape.width = element.width * element.group.scaleX
                shape.height = element.height * element.group.scaleY
                const type = element.get('type')
                if (type !== 'checkbox' && type !== 'group') {
                  element.set({
                    top: element.top * scaleY,
                    left: element.left * scaleX,
                    height: element.height * scaleY,
                    width: element.width * scaleX,
                    scaleX: 1,
                    scaleY: 1,
                  })
                }
              })
            } else {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              shape.x = obj.left
              shape.y = obj.top
              shape.width = obj.width
              shape.height = obj.height

              if (
                shape.group !== null &&
                shape.group !== undefined &&
                obj._objects
              ) {
                obj._objects.forEach((element) => {
                  const groupShape = shape.group.find(
                    (x) => x.objectId === element.id
                  )
                  groupShape.x = obj.left + obj.width / 2 + element.left
                  groupShape.y = obj.top + obj.height / 2 + element.top
                  groupShape.width = element.width * element.group.scaleX
                  groupShape.height = element.height * element.group.scaleY
                })
              }

              const type = obj.get('type')
              if (type !== 'checkbox' && type !== 'group') {
                obj.set({
                  height: obj.height * obj.scaleY,
                  width: obj.width * obj.scaleX,
                  scaleX: 1,
                  scaleY: 1,
                })
              }
            }
          })

          c.on('text:changed', function (e) {
            // text: setSingleLine every input when horizontal
            const obj = e.target
            if (!obj.textDirection) {
              const id = e.target.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              if (shape) {
                self.setSingleLineArea(obj, shape)
                self.save()
              }
            }
          })

          c.on('text:editing:entered', function (e) {
            // text: remove all \n before input when vertical
            const obj = e.target
            if (
              self.mode === 0 &&
              obj.textDirection &&
              obj.annotateType === 1
            ) {
              obj.text.split('\n').join('')
            }
          })

          c.on('text:editing:exited', function (e) {
            // text: setSingleLine after input when vertical
            const obj = e.target
            const id = e.target.id
            const shape = self.annotate
              .find((x) => x.page === self.pageNumber)
              .data.find((y) => y.objectId === id)
            if (shape) {
              self.setSingleLineArea(obj, shape)
              self.save()
            }
          })

          c.on('text:selection:changed', function (e) {})

          c.on('mouse:down', function (e) {
            if (self.commentMode.on) return
            self.eventBus.dispatch('deselectCanvas', {
              source: self,
            })
          })

          c.on('object:removed', function (e) {
            if (self.commentMode.on) return
            c._historySaveAction()
          })

          c.on('object:modified', function (e) {
            const obj = e.target
            if (self.commentMode.on) return
            if (obj.id !== null && obj.id !== undefined) {
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === obj.id)

              if (shape) {
                switch (shape.type) {
                  case 1:
                    self.setSingleLineArea(obj, shape)
                    break
                  case 0:
                  case 13:
                    // detect signature is horizontal or vertical according to width and height
                    if (shape.type === 0 || shape.type === 13) {
                      shape.textDirection = shape.width < shape.height
                      obj.set('textDirection', shape.textDirection)
                    }
                    break
                  default:
                    break
                }
              }
            }
            c._historySaveAction()
          })

          c.on('mouse:dblclick', function (e) {
            if (self.commentMode.on) return
            if (e.target) {
              const obj = e.target
              if (obj.id !== null && obj.id !== undefined) {
                const id = obj.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)

                switch (shape.type) {
                  case 2:
                    if (shape.group === null || shape.group === undefined) {
                      if (obj.selected) {
                        obj._objects[1].set('fill', '#ffffff')
                        c.renderAll()
                        obj.selected = false
                        shape.selected = false
                      } else {
                        const origin = window.location.origin
                        const imageUrl = origin + '/checkbox.png'

                        fabric.util.loadImage(imageUrl, function (img) {
                          obj._objects[1].set(
                            'fill',
                            new fabric.Pattern({
                              source: img,
                              offsetX: -1,
                              offsetY: -1,
                              patternTransform: [
                                (obj.originWidth * 0.6) / img.width,
                                0,
                                0,
                                (obj.originWidth * 0.6) / img.width,
                                0,
                                0,
                              ],
                            })
                          )
                          obj.selected = true
                          shape.selected = true
                          c._historySaveAction()
                          c.renderAll()
                        })
                      }
                    }
                    break
                  case 5:
                    if (shape.group === null || shape.group === undefined) {
                      if (obj.selected) {
                        if (obj._objects.length >= 2) {
                          obj._objects[2].set('radius', 0)
                          c.renderAll()
                          obj.selected = false
                          shape.selected = false
                        }
                      } else if (obj._objects.length >= 2) {
                        obj._objects[2].set(
                          'radius',
                          (obj.originWidth * 0.5 - 2 * obj.radioStrokeWidth) / 2
                        )
                        obj.selected = true
                        shape.selected = true
                        const groupId = obj.groupId
                        c.getObjects().map((o) => {
                          if (
                            o.id !== id &&
                            o.groupId === groupId &&
                            o.annotateType !== null &&
                            o.annotateType !== undefined &&
                            o.annotateType === 5 &&
                            o._objects.length >= 2 &&
                            o.selected === true
                          ) {
                            const s = self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.find((y) => y.objectId === o.id)
                            o._objects[2].set('radius', 0)
                            o.selected = false
                            s.selected = false
                          }
                        })
                        c._historySaveAction()
                        c.renderAll()
                      }
                    }
                    break
                }
              }
            }
          })

          c.on('selection:created', function (e) {
            if (self.commentMode.on) return

            const rect = pdfCanvas.getBoundingClientRect()
            const position = {
              top: rect.top + e.target.top,
              left: rect.left + e.target.left,
            }
            const selection = []
            const checkboxGroup = []
            const radioGroup = []
            e.selected.forEach((element) => {
              const annotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === element.id)
              if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 2
              ) {
                checkboxGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 2
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              } else if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 5
              ) {
                radioGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 5
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              }
              selection.push(annotate)
            })
            self.eventBus.dispatch('selectAnnotate', {
              source: self,
              selection,
              checkboxGroup,
              radioGroup,
              position,
              rect,
            })

            if (e.selected.length > 1) {
              self.eventBus.dispatch('updateAnnotateTool', {
                source: self,
                on: true,
                selection: e.target,
                position,
                checkboxGroup,
                radioGroup,
                rect,
              })
            }

            const mouseup = function (e) {
              const obj = e.target
              if (
                obj.id &&
                (obj.id === 'signButton' ||
                  obj.id === 'stampButton' ||
                  obj.id === 'signDateButton' ||
                  obj.id === 'textButton' ||
                  obj.id === 'checkboxButton' ||
                  obj.id === 'radioButton' ||
                  obj.id === 'dropdownButton' ||
                  obj.id === 'imageButton' ||
                  obj.id === 'drawCanvasButton')
              ) {
                c.discardActiveObject().renderAll()
              }
              document.removeEventListener('mouseup', mouseup)
            }

            document.addEventListener('mouseup', mouseup)

            const obj = e.target
            if (obj && obj.id !== null && obj.id !== undefined) {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              if (
                shape.groupId !== null &&
                shape.groupId !== undefined &&
                shape.type === 2
              ) {
                const checkboxGroup = self.checkboxGroup
                checkboxGroup.forEach((element) => {
                  if (
                    element &&
                    element.addCheckboxBtn &&
                    element.id === shape.groupId
                  ) {
                    element.addCheckboxBtn.style.display = 'flex'
                  } else if (element && element.addCheckboxBtn) {
                    element.addCheckboxBtn.style.display = 'none'
                  }
                })
                const radioGroup = self.radioGroup
                radioGroup.forEach((element) => {
                  if (element && element.addRadioBtn) {
                    element.addRadioBtn.style.display = 'none'
                  }
                })
              } else if (
                shape.groupId !== null &&
                shape.groupId !== undefined &&
                shape.type === 5
              ) {
                const radioGroup = self.radioGroup
                radioGroup.forEach((element) => {
                  if (
                    element &&
                    element.addRadioBtn &&
                    element.id === shape.groupId
                  ) {
                    element.addRadioBtn.style.display = 'flex'
                  } else if (element && element.addRadioBtn) {
                    element.addRadioBtn.style.display = 'none'
                  }
                })
                const checkboxGroup = self.checkboxGroup
                checkboxGroup.forEach((element) => {
                  if (element && element.addCheckboxBtn) {
                    element.addCheckboxBtn.style.display = 'none'
                  }
                })
              }
            }
          })

          c.on('selection:updated', function (e) {
            if (self.commentMode.on) return

            // label change event not trigger
            c.getObjects().forEach((obj) => {
              const annotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === obj.id)
              switch (obj.annotateType) {
                case 1:
                  if (
                    annotate &&
                    annotate.validation &&
                    ((annotate.validation.type &&
                      annotate.validation.type !== obj.validation.type) ||
                      (annotate.validation.regex &&
                        annotate.validation.regex !== obj.validation.regex) ||
                      (annotate.validation.errorMessage &&
                        annotate.validation.errorMessage !==
                          obj.validation.errorMessage))
                  ) {
                    obj.set('validation', annotate.validation)
                    c._historySaveAction()
                    c.renderAll()
                  }
                  if (
                    annotate &&
                    annotate.maxlength &&
                    annotate.maxlength !== '' &&
                    annotate.maxlength !== obj.maxlength
                  ) {
                    obj.set('maxlength', annotate.maxlength)
                    c._historySaveAction()
                    c.renderAll()
                  }
                  break
              }
            })
            const rect = pdfCanvas.getBoundingClientRect()
            const position = {
              top: rect.top + e.target.top,
              left: rect.left + e.target.left,
            }
            const selection = []
            const checkboxGroup = []
            const radioGroup = []
            e.selected.forEach((element) => {
              const annotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === element.id)
              if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 2
              ) {
                checkboxGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 2
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              } else if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 5
              ) {
                radioGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 5
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              }
              selection.push(annotate)
            })
            self.eventBus.dispatch('selectAnnotate', {
              source: self,
              selection,
              checkboxGroup,
              radioGroup,
              position,
              rect,
            })

            if (e.selected.length > 1) {
              self.eventBus.dispatch('updateAnnotateTool', {
                source: self,
                on: true,
                selection: e.target,
                position,
                checkboxGroup,
                radioGroup,
                rect,
              })
            }

            const obj = e.target
            if (obj && obj.id !== null && obj.id !== undefined) {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)

              const checkboxGroup = self.checkboxGroup
              const radioGroup = self.radioGroup
              radioGroup.forEach((element) => {
                if (element && element.addRadioBtn) {
                  element.addRadioBtn.style.display = 'none'
                }
              })
              checkboxGroup.forEach((element) => {
                if (element && element.addCheckboxBtn) {
                  element.addCheckboxBtn.style.display = 'none'
                }
              })
              if (
                shape.groupId !== null &&
                shape.groupId !== undefined &&
                shape.type === 2
              ) {
                checkboxGroup.forEach((element) => {
                  if (
                    element &&
                    element.addCheckboxBtn &&
                    element.id === shape.groupId
                  ) {
                    element.addCheckboxBtn.style.display = 'flex'
                  } else if (element && element.addCheckboxBtn) {
                    element.addCheckboxBtn.style.display = 'none'
                  }
                })
              } else if (
                shape.groupId !== null &&
                shape.groupId !== undefined &&
                shape.type === 5
              ) {
                radioGroup.forEach((element) => {
                  if (
                    element &&
                    element.addRadioBtn &&
                    element.id === shape.groupId
                  ) {
                    element.addRadioBtn.style.display = 'flex'
                  } else if (element && element.addRadioBtn) {
                    element.addRadioBtn.style.display = 'none'
                  }
                })
              }
            }
          })

          c.on('selection:cleared', function (e) {
            if (self.commentMode.on) return

            // input change event not trigger
            c.getObjects().forEach((obj) => {
              const annotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === obj.id)
              switch (obj.annotateType) {
                case 1:
                  if (
                    annotate &&
                    annotate.validation &&
                    ((annotate.validation.type &&
                      annotate.validation.type !== obj.validation.type) ||
                      (annotate.validation.regex &&
                        annotate.validation.regex !== obj.validation.regex) ||
                      (annotate.validation.errorMessage &&
                        annotate.validation.errorMessage !==
                          obj.validation.errorMessage))
                  ) {
                    obj.set('validation', annotate.validation)
                    c._historySaveAction()
                    c.renderAll()
                  }
                  if (
                    annotate &&
                    annotate.maxlength &&
                    annotate.maxlength !== '' &&
                    annotate.maxlength !== obj.maxlength
                  ) {
                    obj.set('maxlength', annotate.maxlength)
                    c._historySaveAction()
                    c.renderAll()
                  }
                  break
              }
            })
            const checkboxGroup = self.checkboxGroup
            const radioGroup = self.radioGroup
            checkboxGroup.forEach((element) => {
              if (
                element.addCheckboxBtn &&
                element.addCheckboxBtn.style.display === 'flex'
              ) {
                element.addCheckboxBtn.style.display = 'none'
              }
            })
            radioGroup.forEach((element) => {
              if (
                element.addRadioBtn &&
                element.addRadioBtn.style.display === 'flex'
              ) {
                element.addRadioBtn.style.display = 'none'
              }
            })
            self.eventBus.dispatch('deselectAnnotate')
          })

          c.hoverCursor = 'pointer'
          if (
            this.annotate &&
            this.annotate.length > 0 &&
            this.annotate.find((x) => x.page === this.pageNumber)
          ) {
            const annotate = this.annotate.find(
              (x) => x.page === this.pageNumber
            )
            annotate.data.forEach((element) => {
              if (element.scale) {
                const proportion = scale / element.scale
                element.width *= proportion
                element.height *= proportion
                if (element.originWidth) element.originWidth *= proportion
                if (element.originHeight) element.originHeight *= proportion
                element.x *= proportion
                element.y *= proportion
                if (element.rx) element.rx *= proportion
                if (element.ry) element.ry *= proportion
                if (element.strokeWidth) element.strokeWidth *= proportion
                if (element.imageWidth) element.imageWidth *= proportion
                if (element.imageHeight) element.imageHeight *= proportion
                if (element.imageX) element.imageX *= proportion
                if (element.imageY) element.imageY *= proportion
                if (element.centerWidth) element.centerWidth *= proportion
                if (element.centerHeight) element.centerHeight *= proportion
                element.scale = scale
              } else {
                element.width *= scale
                element.height *= scale
                if (element.originWidth) element.originWidth *= scale
                if (element.originHeight) element.originHeight *= scale
                element.x *= scale
                element.y *= scale
                if (element.rx) element.rx *= scale
                if (element.ry) element.ry *= scale
                if (element.strokeWidth) element.strokeWidth *= scale
                if (element.imageWidth) element.imageWidth *= scale
                if (element.imageHeight) element.imageHeight *= scale
                if (element.imageX) element.imageX *= scale
                if (element.imageY) element.imageY *= scale
                if (element.centerWidth) element.centerWidth *= scale
                if (element.centerHeight) element.centerHeight *= scale
                element.scale = scale
              }
            })

            // 讓radio or chekcbox objectId 升冪，以防複製時順序顛倒
            const noGroupAnnotate = annotate.data.filter((element) => {
              return element.groupId === null || element.groupId === undefined
            })
            const groupAnnotate = annotate.data
              .filter((element) => {
                return element.groupId
              })
              .sort((a, b) => a.objectId - b.objectId)
            annotate.data = noGroupAnnotate.concat(groupAnnotate)

            let rect = null
            let textArea = null
            let radio = null
            let dropdown = null
            annotate.data.forEach((element, index) => {
              this.setRequiredElementStyle()
              if (element.id) {
                const hex = this.colorList[element.id - 1]
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                element.color = element.color ?? `rgba(${r},${g},${b}, 0.6)`
                element.stroke =
                  element.stroke ??
                  `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g}, ${
                    b > 10 ? b - 10 : b
                  })`
              } else {
                element.color = element.color ?? '#f1f5f8'
                element.stroke = element.stroke ?? 'rgb(146, 147, 147)'
              }
              element.objectId = element.objectId ?? index
              element.strokeWidth = element.strokeWidth ?? 2
              element.rx = element.rx ?? 2
              element.ry = element.ry ?? 2
              element.selected = element.selected ?? false
              element.text = element.text ?? ''
              element.fontSize = element.fontSize ?? 16
              element.fontFamily = element.fontFamily ?? 'Microsoft JhengHei'
              element.checkboxStrokeWidth = element.checkboxStrokeWidth ?? 1
              element.radioStrokeWidth = element.radioStrokeWidth ?? 1
              element.name = element.name ?? ''
              element.label = element.label ?? ''
              element.groupLabel = element.groupLabel ?? ''
              element.validation = element.validation ?? {
                type: null,
                regex: null,
                errorMessage: null,
              }
              element.dateRange = element.dateRange ?? 'signDay'
              element.dateEra = element.dateEra ?? 'common'

              switch (element.type) {
                case 0:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.signature,
                    icon: 'signature',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 0,
                    required: element.required,
                    label: element.label,
                    textDirection: element.textDirection || false,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 1:
                  textArea = new fabric.TextArea(
                    element.textDirection
                      ? element.text.split('').join('\n')
                      : element.text,
                    {
                      width: element.width,
                      height: element.height,
                      top: element.y,
                      left: element.x,
                      backgroundColor: element.color,
                      id: element.objectId,
                      selectId: element.id,
                      textAlign: element.textAlign || 'left',
                      rx: element.rx || 2 * scale,
                      ry: element.rx || 2 * scale,
                      backgroundStroke: element.stroke || '',
                      backgroundStrokeWidth: element.strokeWidth || 0,
                      singleLine: element.singleLine || false,
                      textDirection: element.textDirection || false,
                      annotateType: 1,
                      originFontSize: element.fontSize || 16,
                      fontSize: element.fontSize * scale || 16 * scale,
                      fontFamily: element.fontFamily || 'Microsoft JhengHei',
                      fontStyle: element.fontStyle || '',
                      fontWeight: element.fontWeight || '',
                      required: element.required,
                      readonly: element.readonly,
                      maxlength: element.maxlength,
                      label: element.label,
                      validation: element.validation,
                      prefill: element.prefill,
                      textColor: element.textColor || 'rgba(0,0,0,1)',
                      fill: element.textColor || 'rgba(0,0,0,1)',
                      lockScalingY:
                        (!element.textDirection && element.singleLine) || false,
                      lockScalingX: element.textDirection || false,
                      scale: element.scale,
                    }
                  )
                  c.add(textArea)
                  break
                case 2:
                  if (element.group) {
                  } else {
                    if (
                      element.groupId === null ||
                      element.groupId === undefined
                    ) {
                      element.groupId = this.checkboxGroup.length + 1
                    }
                    this.createCheckbox(element, c)
                    if (
                      element.groupId !== null &&
                      element.groupId !== undefined &&
                      (this.checkboxGroup.find(
                        (x) => x.id === element.groupId
                      ) === null ||
                        this.checkboxGroup.find(
                          (x) => x.id === element.groupId
                        ) === undefined)
                    ) {
                      const groupId = element.groupId
                      const children = annotate.data.filter(
                        (y) => y.groupId === groupId && y.type === 2
                      )
                      const checkboxGroupContainer =
                        document.createElement('div')
                      checkboxGroupContainer.id = `checkboxGroupContainer${groupId}_${this.pageNumber}`
                      checkboxGroupContainer.style.position = 'absolute'
                      checkboxGroupContainer.style.left =
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) -
                        element.strokeWidth / 2 -
                        4 +
                        'px'

                      checkboxGroupContainer.style.top =
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) -
                        element.strokeWidth / 2 -
                        (element.prefill ? 0 : 16) -
                        4 +
                        16 +
                        'px'
                      checkboxGroupContainer.style.display = 'flex'
                      checkboxGroupContainer.style.flexDirection = 'column'
                      checkboxGroupContainer.style.alignItems = 'center'
                      const checkboxGroupDiv = document.createElement('div')
                      checkboxGroupDiv.id = `checkboxGroupDiv_${groupId}`
                      if (element.minimum > 0) {
                        checkboxGroupDiv.classList.add('required')
                      }
                      checkboxGroupDiv.style.width =
                        Math.max.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) +
                        element.width -
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) +
                        element.strokeWidth * 2 +
                        8 +
                        'px'
                      checkboxGroupDiv.style.height =
                        Math.max.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) +
                        element.height -
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) +
                        // 2.5 估略值
                        element.strokeWidth * 2.5 +
                        8 +
                        'px'
                      checkboxGroupDiv.style.border = '2px dashed #3183c8c2'
                      checkboxGroupDiv.style.zIndex = 20
                      checkboxGroupDiv.style.borderRadius = '2px'

                      checkboxGroupContainer.appendChild(checkboxGroupDiv)
                      let addCheckboxBtn = null
                      if (!element.prefill) {
                        addCheckboxBtn = document.createElement('button')
                        addCheckboxBtn.id = `addCheckboxBtn_${groupId}`
                        addCheckboxBtn.type = 'button'
                        addCheckboxBtn.style.width = '16px'
                        addCheckboxBtn.style.height = '16px'
                        addCheckboxBtn.style.backgroundColor = '#3183c8'
                        addCheckboxBtn.style.border = 'none'
                        addCheckboxBtn.style.fontSize = '16px'
                        addCheckboxBtn.style.cursor = 'pointer'
                        addCheckboxBtn.style.display = 'flex'
                        addCheckboxBtn.style.alignItems = 'center'
                        addCheckboxBtn.style.justifyContent = 'center'
                        addCheckboxBtn.style.borderRadius = '2px'
                        addCheckboxBtn.style.zIndex = 30
                        const icon = document.createElement('i')
                        icon.className =
                          'v-icon notranslate mdi mdi-plus theme--light'
                        icon.style.fontSize = '18px'
                        icon.style.color = 'white'
                        addCheckboxBtn.appendChild(icon)
                        addCheckboxBtn.addEventListener(
                          'mouseup',
                          function (e) {
                            const groupId = +addCheckboxBtn.id.split('_')[1]
                            const id =
                              Math.max(
                                ...self.annotate
                                  .find((x) => x.page === self.pageNumber)
                                  .data.map((y) => y.objectId)
                              ) + 1
                            const checkboxChildren = self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.filter(
                                (y) => y.groupId === groupId && y.type === 2
                              )
                            if (checkboxChildren.length > 0) {
                              const checkboxChild = checkboxChildren[0]
                              const top =
                                Math.max.apply(
                                  Math,
                                  checkboxChildren.map(function (child) {
                                    return child.y
                                  })
                                ) +
                                checkboxChild.height +
                                8
                              const left =
                                (Math.min.apply(
                                  Math,
                                  checkboxChildren.map(function (child) {
                                    return child.x
                                  })
                                ) +
                                  Math.max.apply(
                                    Math,
                                    checkboxChildren.map(function (child) {
                                      return child.x
                                    })
                                  )) /
                                2
                              self.createCheckbox(
                                {
                                  width: checkboxChild.width,
                                  height: checkboxChild.height,
                                  originWidth: checkboxChild.originWidth,
                                  originHeight: checkboxChild.originHeight,
                                  color: checkboxChild.color,
                                  rx: checkboxChild.rx,
                                  ry: checkboxChild.ry,
                                  strokeWidth: checkboxChild.strokeWidth,
                                  stroke: checkboxChild.stroke,
                                  checkboxColor: checkboxChild.checkboxColor,
                                  checkboxStrokeWidth:
                                    checkboxChild.checkboxStrokeWidth,
                                  checkboxStroke: checkboxChild.checkboxStroke,
                                  x: left,
                                  y: top,
                                  selected: false,
                                  groupId,
                                  objectId: id,
                                  id: checkboxChild.id,
                                  centerWidth: checkboxChild.centerWidth,
                                  centerHeight: checkboxChild.centerHeight,
                                  required: true,
                                  readonly: false,
                                  ruleId: checkboxChild.ruleId,
                                  maximum: checkboxChild.maximum,
                                  minimum: checkboxChild.minimum,
                                  label: '',
                                  groupLabel: checkboxChild.groupLabel,
                                  prefill: checkboxChild.prefill,
                                  originFontSize: checkboxChild.originFontSize,
                                },
                                c
                              )
                              c._historySaveAction()
                              self.annotate
                                .find((x) => x.page === self.pageNumber)
                                .data.unshift({
                                  x: left,
                                  y: top,
                                  width: checkboxChild.width,
                                  height: checkboxChild.height,
                                  originWidth: checkboxChild.originWidth,
                                  originHeight: checkboxChild.originHeight,
                                  centerWidth: checkboxChild.centerWidth,
                                  centerHeight: checkboxChild.centerHeight,
                                  id: checkboxChild.id,
                                  objectId: id,
                                  type: checkboxChild.type,
                                  color: checkboxChild.color,
                                  checkboxColor: checkboxChild.checkboxColor,
                                  strokeWidth: checkboxChild.strokeWidth,
                                  stroke: checkboxChild.stroke,
                                  checkboxStrokeWidth:
                                    checkboxChild.checkboxStrokeWidth,
                                  checkboxStroke: checkboxChild.checkboxStroke,
                                  rx: checkboxChild.rx,
                                  ry: checkboxChild.ry,
                                  selected: false,
                                  scale: checkboxChild.scale,
                                  required: true,
                                  readonly: false,
                                  groupId,
                                  ruleId: checkboxChild.ruleId,
                                  maximum: checkboxChild.maximum,
                                  minimum: checkboxChild.minimum,
                                  label: '',
                                  groupLabel: checkboxChild.groupLabel,
                                  prefill: checkboxChild.prefill,
                                  originFontSize: checkboxChild.originFontSize,
                                })
                              const groupDiv = document.getElementById(
                                `checkboxGroupDiv_${groupId}`
                              )
                              groupDiv.style.height =
                                parseFloat(groupDiv.style.height) +
                                checkboxChild.height +
                                8 +
                                'px'
                              const group = self.checkboxGroup.find(
                                (x) => x.id === groupId
                              )
                              if (group) {
                                group.items.push(id)
                              }
                              c.discardActiveObject().renderAll()
                            }
                          }
                        )
                        checkboxGroupContainer.appendChild(addCheckboxBtn)
                      }
                      this.canvasWrapper.appendChild(checkboxGroupContainer)
                      this.addElements.push(checkboxGroupContainer)
                      this.checkboxGroup.push({
                        id: groupId,
                        container: checkboxGroupContainer,
                        groupDiv: checkboxGroupDiv,
                        addCheckboxBtn,
                        items: children.map((x) => x.objectId),
                      })
                    }
                  }
                  break
                case 3:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * scale,
                    ry: element.rx || 2 * scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.stamp,
                    icon: 'stamp',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 3,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 4:
                  rect = new fabric.Date({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * scale,
                    ry: element.rx || 2 * scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.date,
                    fontSize: element.fontSize || 16,
                    fontFamily: element.fontFamily || 'Microsoft JhengHei',
                    fontStyle: element.fontStyle || '',
                    fontWeight: element.fontWeight || '',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 4,
                    dateFormat: element.dateFormat,
                    dateRange: element.dateRange || 'signDay',
                    required: element.required,
                    label: element.label,
                    text: element.text,
                    readonly: element.readonly,
                    dateEra: element.dateEra || 'common',
                    textColor: element.textColor || 'rgba(0,0,0,1)',
                    textDirection:
                      element.textDirection || element.width < element.height,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 5:
                  radio = this.createRadio(element)
                  c.add(radio)
                  if (
                    element.groupId !== null &&
                    element.groupId !== undefined &&
                    (this.radioGroup.find((x) => x.id === element.groupId) ===
                      null ||
                      this.radioGroup.find((x) => x.id === element.groupId) ===
                        undefined)
                  ) {
                    const groupId = element.groupId
                    const children = annotate.data.filter(
                      (y) => y.groupId === groupId && y.type === 5
                    )
                    const radioGroupContainer = document.createElement('div')
                    radioGroupContainer.id = `radioGroupContainer${groupId}_${this.pageNumber}`
                    radioGroupContainer.style.position = 'absolute'
                    radioGroupContainer.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    radioGroupContainer.style.top =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) -
                      element.radioStrokeWidth -
                      (element.prefill ? 0 : 16) -
                      4 +
                      16 +
                      'px'
                    radioGroupContainer.style.display = 'flex'
                    radioGroupContainer.style.flexDirection = 'column'
                    radioGroupContainer.style.alignItems = 'center'
                    const radioGroupDiv = document.createElement('div')
                    radioGroupDiv.classList.add('required')
                    radioGroupDiv.id = `radioGroupDiv_${groupId}`
                    radioGroupDiv.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.border = '2px dashed #3183c8c2'
                    radioGroupDiv.style.zIndex = 20
                    radioGroupDiv.style.borderRadius = '2px'
                    radioGroupContainer.appendChild(radioGroupDiv)
                    let addRadioBtn = null
                    if (!element.prefill) {
                      addRadioBtn = document.createElement('button')
                      addRadioBtn.id = `addRadioBtn_${groupId}`
                      addRadioBtn.type = 'button'
                      addRadioBtn.style.width = '16px'
                      addRadioBtn.style.height = '16px'
                      addRadioBtn.style.backgroundColor = '#3183c8'
                      addRadioBtn.style.border = 'none'
                      addRadioBtn.style.fontSize = '16px'
                      addRadioBtn.style.cursor = 'pointer'
                      addRadioBtn.style.display = 'flex'
                      addRadioBtn.style.alignItems = 'center'
                      addRadioBtn.style.justifyContent = 'center'
                      addRadioBtn.style.borderRadius = '2px'
                      addRadioBtn.style.zIndex = 30
                      const icon = document.createElement('i')
                      icon.className =
                        'v-icon notranslate mdi mdi-plus theme--light'
                      icon.style.fontSize = '18px'
                      icon.style.color = 'white'
                      addRadioBtn.appendChild(icon)
                      addRadioBtn.addEventListener('mouseup', function (e) {
                        const groupId = +addRadioBtn.id.split('_')[1]
                        const id =
                          Math.max(
                            ...self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.map((y) => y.objectId)
                          ) + 1
                        const radioChildren = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.filter(
                            (y) => y.groupId === groupId && y.type === 5
                          )
                        if (radioChildren.length > 0) {
                          const radioChild = radioChildren[0]
                          const top =
                            Math.max.apply(
                              Math,
                              radioChildren.map(function (child) {
                                return child.y
                              })
                            ) +
                            radioChild.height +
                            8
                          const left =
                            (Math.min.apply(
                              Math,
                              radioChildren.map(function (child) {
                                return child.x
                              })
                            ) +
                              Math.max.apply(
                                Math,
                                radioChildren.map(function (child) {
                                  return child.x
                                })
                              )) /
                            2
                          const strokeWidth =
                            (radioChild.originFontSize / 15) * self.scale
                          const addradio = self.createRadio({
                            width:
                              radioChild.originFontSize * self.scale -
                              strokeWidth,
                            height:
                              radioChild.originFontSize * self.scale -
                              strokeWidth,
                            originWidth: radioChild.originFontSize * self.scale,
                            originHeight:
                              radioChild.originFontSize * self.scale,
                            color: radioChild.color,
                            rx: radioChild.rx,
                            ry: radioChild.ry,
                            strokeWidth: radioChild.strokeWidth,
                            stroke: radioChild.stroke,
                            radioBackgroundColor:
                              radioChild.radioBackgroundColor,
                            radioStrokeWidth: radioChild.radioStrokeWidth,
                            radioStroke: radioChild.radioStroke,
                            x: left,
                            y: top,
                            selected: false,
                            groupId,
                            objectId: id,
                            id: radioChild.id,
                            centerWidth: radioChild.centerWidth,
                            centerHeight: radioChild.centerHeight,
                            required: true,
                            readonly: false,
                            label: '',
                            groupLabel: radioChild.groupLabel,
                            prefill: radioChild.prefill,
                            originFontSize: radioChild.originFontSize || 28,
                          })
                          c.add(addradio)
                          self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.unshift({
                              x: left,
                              y: top,
                              width: radioChild.width,
                              height: radioChild.height,
                              originWidth: radioChild.originWidth,
                              originHeight: radioChild.originHeight,
                              centerWidth: radioChild.centerWidth,
                              centerHeight: radioChild.centerHeight,
                              id: radioChild.id,
                              objectId: id,
                              type: radioChild.type,
                              color: radioChild.color,
                              strokeWidth: radioChild.strokeWidth,
                              stroke: radioChild.stroke,
                              radioBackgroundColor:
                                radioChild.radioBackgroundColor,
                              radioStrokeWidth: radioChild.radioStrokeWidth,
                              radioStroke: radioChild.radioStroke,
                              rx: radioChild.rx,
                              ry: radioChild.ry,
                              selected: false,
                              scale: radioChild.scale,
                              required: true,
                              readonly: false,
                              groupId,
                              label: '',
                              groupLabel: radioChild.groupLabel,
                              prefill: radioChild.prefill,
                              originFontSize: radioChild.originFontSize || 28,
                            })
                          const groupDiv = document.getElementById(
                            `radioGroupDiv_${groupId}`
                          )
                          groupDiv.style.height =
                            parseFloat(groupDiv.style.height) +
                            radioChild.height +
                            8 +
                            'px'
                          const group = self.radioGroup.find(
                            (x) => x.id === groupId
                          )
                          if (group) {
                            group.items.push(id)
                          }
                          c.discardActiveObject().renderAll()
                        }
                      })
                      radioGroupContainer.appendChild(addRadioBtn)
                    }
                    self.canvasWrapper.appendChild(radioGroupContainer)
                    self.addElements.push(radioGroupContainer)
                    self.radioGroup.push({
                      id: groupId,
                      container: radioGroupContainer,
                      groupDiv: radioGroupDiv,
                      addRadioBtn,
                      items: children.map((x) => x.objectId),
                    })
                  }
                  break
                case 6:
                  dropdown = new fabric.Dropdown({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * scale,
                    ry: element.rx || 2 * scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.select,
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 6,
                    fontSize: element.fontSize || 16,
                    fontFamily: element.fontFamily || 'Microsoft JhengHei',
                    fontStyle: element.fontStyle || '',
                    fontWeight: element.fontWeight || '',
                    required: element.required,
                    readonly: element.readonly,
                    selectOptionId: element.selectOptionId,
                    options: element.options,
                    label: element.label,
                    textColor: element.textColor || 'rgba(0,0,0,1)',
                    scale: element.scale,
                  })
                  c.add(dropdown)
                  break
                case 7:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * scale,
                    ry: element.rx || 2 * scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.attachment,
                    icon: 'paperclip',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 7,
                    required: element.required,
                    label: element.label,
                    prefill: element.prefill,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 8:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.image,
                    icon: 'image',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 8,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 9:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.signatureBP,
                    icon: 'signatureBP',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 9,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 10:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.signatureBO,
                    icon: 'signatureBO',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 10,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 11:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.stampBP,
                    icon: 'stampBP',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 11,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 12:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.stampBO,
                    icon: 'stampBO',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 12,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 13:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * scale,
                    ry: element.rx || 2 * scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.signatureAndStamp,
                    icon: 'signatureAndStamp',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 13,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 14:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * element.scale,
                    ry: element.rx || 2 * element.scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.canvas,
                    icon: 'message-draw',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 14,
                    required: element.required,
                    label: element.label,
                    scale: element.scale,
                  })
                  c.add(rect)
                  break
                case 15: // comment
                  break
              }
            })
          }

          if (this.commentList.length > 0) {
            if (
              this.commentList[this.selectedFileIndex.page - 1].comment &&
              this.commentList[this.selectedFileIndex.page - 1].comment.length >
                0 &&
              this.commentList[this.selectedFileIndex.page - 1].comment.find(
                (x) => x.page === this.pageNumber
              )
            ) {
              this.commentList[this.selectedFileIndex.page - 1].comment.forEach(
                (comment) => {
                  if (comment.scale) {
                    const proportion = scale / comment.scale
                    comment.x *= proportion
                    comment.y *= proportion
                    comment.scale = scale
                  }

                  this.addPdfAnnotation(comment)
                }
              )
            }
          }
          c._historyInit()
          this.eventBus.dispatch('initHistory', {
            page: this.pageNumber,
          })
          this.setState(this.state)
        }
        break
      case 1:
        // fabric.js canvas for comment
        if (!this.canvas && pdfCanvas) {
          const canvas = document.createElement('canvas')
          this.canvas = canvas
          this.canvasWrapper.appendChild(canvas)
          canvas.style.zIndex = 30
          canvas.style.position = 'absolute'

          const c = new fabric.Canvas(canvas, {
            width: parseFloat(pdfCanvas.style.width),
            height: parseFloat(pdfCanvas.style.height),
            allowTouchScrolling: true,
          })

          c.on('object:moved', function (e) {
            const obj = e.target
            // 防呆 拉出界
            if (obj.left + obj.width * obj.scaleX > obj.canvas.width) {
              obj.left = obj.canvas.width - obj.width * obj.scaleX
            }
            if (obj.left < 0) {
              obj.left = 0
            }
            if (obj.top < 0) {
              obj.top = 0
            }
            if (obj.top + obj.height * obj.scaleY > obj.canvas.height) {
              obj.top = obj.canvas.height - obj.height * obj.scaleY
            }

            // comment moved
            if (
              e.target.type === 16 &&
              self.commentList[self.selectedFileIndex.page - 1].comment.length >
                0
            ) {
              const comment = self.commentList[
                self.selectedFileIndex.page - 1
              ].comment.find((com) => com.id === obj.id)
              comment.x = obj.left
              comment.y = obj.top
            }
            c.renderAll()
          })

          canvas.fabric = c
          c.uniformScaling = false
          c.layer = self
          c.pageNumber = this.pageNumber

          this.commentList[this.selectedFileIndex.page - 1].comment.forEach(
            (comment) => {
              if (comment.scale) {
                const proportion = scale / comment.scale
                comment.x *= proportion
                comment.y *= proportion
                comment.scale = scale
              }

              if (comment.page === this.pageNumber) {
                this.addPdfAnnotation(comment)
              }
            }
          )
        }
        this.hideCanvasDraw(this.commentMode.on)
        this.renderHTMLElement(scale)
        break
      case 2:
        this.renderHTMLElement(scale)
        break
      case 4:
        this.renderHTMLElement(scale)
        if (!this.canvas && pdfCanvas) {
          const canvas = document.createElement('canvas')
          this.canvas = canvas
          this.canvasWrapper.appendChild(canvas)
          canvas.style.zIndex = '30'
          canvas.style.position = 'absolute'
          const c = new fabric.Canvas(canvas, {
            width: parseFloat(pdfCanvas.style.width),
            height: parseFloat(pdfCanvas.style.height),
            allowTouchScrolling: this.fabricParams.allowTouchScrolling,
          })

          canvas.fabric = c
          c.uniformScaling = false
          c.layer = self
          c.pageNumber = this.pageNumber

          if (this.fabricParams.eraserTool) {
            c.freeDrawingBrush = new this.EraserBrush(c)
            c.isDrawingMode = true
          } else {
            c.freeDrawingBrush = null
            c.isDrawingMode = false
          }

          if (this.fabricParams.drawTool) {
            c.freeDrawingBrush = new fabric.PencilBrush(c)
            c.isDrawingMode = true
            this.DrawBrush = true
            this.setState(90)
          } else {
            c.freeDrawingBrush = null
            c.isDrawingMode = false
          }

          c.on('object:moving', function (e) {
            const obj = e.target
            // if object is too big ignore
            if (
              obj.currentHeight > obj.canvas.height ||
              obj.currentWidth > obj.canvas.width
            ) {
              return
            }
            obj.setCoords()
            // top-left  corner
            if (
              obj.getBoundingRect().top < 0 ||
              obj.getBoundingRect().left < 0
            ) {
              obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top)
              obj.left = Math.max(
                obj.left,
                obj.left - obj.getBoundingRect().left
              )
            }
            // bot-right corner
            if (
              obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height ||
              obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
            ) {
              obj.top = Math.min(
                obj.top,
                obj.canvas.height -
                  obj.getBoundingRect().height +
                  obj.top -
                  obj.getBoundingRect().top
              )
              obj.left = Math.min(
                obj.left,
                obj.canvas.width -
                  obj.getBoundingRect().width +
                  obj.left -
                  obj.getBoundingRect().left
              )
            }
            if (
              obj._objects &&
              obj._objects.length > 1 &&
              (obj.id === null || obj.id === undefined)
            ) {
              obj._objects.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                shape.x = obj.left + obj.width / 2 + element.left
                shape.y = obj.top + obj.height / 2 + element.top
              })
            } else {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              shape.x = obj.left
              shape.y = obj.top
              if (
                shape.group !== null &&
                shape.group !== undefined &&
                obj._objects
              ) {
                obj._objects.forEach((element) => {
                  const groupShape = shape.group.find(
                    (x) => x.objectId === element.id
                  )
                  groupShape.x = obj.left + obj.width / 2 + element.left
                  groupShape.y = obj.top + obj.height / 2 + element.top
                })
              }
            }
            self.eventBus.dispatch('updateAnnotateTool', {
              source: self,
              on: false,
              selection: null,
              position: null,
            })
          })

          c.on('object:moved', function (e) {
            const rect = pdfCanvas.getBoundingClientRect()
            const position = {
              top: rect.top + e.target.top,
              left: rect.left + e.target.left,
            }
            const selection = e.target
            self.eventBus.dispatch('updateAnnotateTool', {
              source: self,
              on: true,
              selection,
              position,
              rect,
            })
          })

          c.on('object:scaling', function (e) {
            const obj = e.target
            // draw pen
            if (obj.annotateType === 90) {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              // shape.strokeUniform = true
              shape.scaleX = obj.scaleX
              shape.scaleY = obj.scaleY
              shape.x = obj.left
              shape.y = obj.top
              return
            } else if (obj.type === 'ellipse') {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              // shape.strokeUniform = true
              shape.scaleX = obj.scaleX
              shape.scaleY = obj.scaleY
              shape.x = obj.left
              shape.y = obj.top
              return
            }
            if (
              obj.getBoundingRect().top < 0 ||
              obj.getBoundingRect().left < 0
            ) {
              // top-left  corner
              if (obj.getBoundingRect().top < 0) {
                obj.height += obj.top
              }
              if (obj.getBoundingRect().left < 0) {
                obj.width += obj.left
              }
              obj.top = Math.max(obj.top, 0)
              obj.left = Math.max(obj.left, 0)
            }

            // bot-right corner
            if (
              obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height ||
              obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
            ) {
              if (
                obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height
              ) {
                obj.height = obj.canvas.height - obj.getBoundingRect().top
              }
              if (
                obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
              ) {
                obj.width = obj.canvas.width - obj.getBoundingRect().left
              }
            }

            if (
              obj._objects &&
              obj._objects.length > 1 &&
              (obj.id === null || obj.id === undefined)
            ) {
              const scaleX = obj.scaleX
              const scaleY = obj.scaleY
              obj.set({
                height: obj.height * obj.scaleY,
                width: obj.width * obj.scaleX,
                scaleX: 1,
                scaleY: 1,
              })
              obj._objects.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                shape.x = obj.left + obj.width / 2 + element.left
                shape.y = obj.top + obj.height / 2 + element.top
                shape.width = element.width * element.group.scaleX
                shape.height = element.height * element.group.scaleY
                const type = element.get('type')
                if (type !== 'checkbox' && type !== 'group') {
                  element.set({
                    top: element.top * scaleY,
                    left: element.left * scaleX,
                    height: element.height * scaleY,
                    width: element.width * scaleX,
                    scaleX: 1,
                    scaleY: 1,
                  })
                }
              })
            } else {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              shape.x = obj.left
              shape.y = obj.top
              shape.width = obj.width
              shape.height = obj.height
              if (
                shape.group !== null &&
                shape.group !== undefined &&
                obj._objects
              ) {
                obj._objects.forEach((element) => {
                  const groupShape = shape.group.find(
                    (x) => x.objectId === element.id
                  )
                  groupShape.x = obj.left + obj.width / 2 + element.left
                  groupShape.y = obj.top + obj.height / 2 + element.top
                  groupShape.width = element.width * element.group.scaleX
                  groupShape.height = element.height * element.group.scaleY
                })
              }

              const type = obj.get('type')
              if (type !== 'checkbox' && type !== 'group') {
                obj.set({
                  height: obj.height * obj.scaleY,
                  width: obj.width * obj.scaleX,
                  scaleX: 1,
                  scaleY: 1,
                })
              }
            }
          })

          c.on('text:changed', function (e) {
            const obj = e.target
            const id = e.target.id
            const shape = self.annotate
              .find((x) => x.page === self.pageNumber)
              .data.find((y) => y.objectId === id)
            shape.text = obj.text
          })

          c.on('object:removed', function (e) {
            if (self.canControl) {
              c._historySaveAction()
              self.eventBus.dispatch('notifyAnnotateChanged', {
                page: self.pageNumber,
                fabricUndo: c.historyUndo,
                fabricRedo: c.historyRedo,
                fabricNextState: c.historyNextState,
                historyProcessing: c.historyProcessing,
              })
            }
          })

          c.on('object:modified', function (e) {
            if (self.canControl) {
              c._historySaveAction()
              self.eventBus.dispatch('notifyAnnotateChanged', {
                page: self.pageNumber,
                fabricUndo: c.historyUndo,
                fabricRedo: c.historyRedo,
                fabricNextState: c.historyNextState,
                historyProcessing: c.historyProcessing,
              })
            }
          })

          c.hoverCursor = 'pointer'
          this.renderCollaborateAnnotate()
        }
        break
      case 5:
        if (!this.canvas && pdfCanvas) {
          const canvas = document.createElement('canvas')
          this.canvas = canvas
          this.canvasWrapper.appendChild(canvas)
          canvas.style.zIndex = 30
          canvas.style.position = 'absolute'
          const c = new fabric.Canvas(canvas, {
            width: parseFloat(pdfCanvas.style.width),
            height: parseFloat(pdfCanvas.style.height),
            allowTouchScrolling: this.fabricParams.allowTouchScrolling,
            uniformScaling: true,
          })

          canvas.fabric = c
          c.layer = self
          c.pageNumber = this.pageNumber

          if (this.fabricParams.eraserTool) {
            const eraserBrush = new this.EraserBrush(c)
            c.freeDrawingBrush = eraserBrush
            c.isDrawingMode = true
          } else {
            c.freeDrawingBrush = null
            c.isDrawingMode = false
          }

          const dropDown = document.createElement('div')
          dropDown.className = 'dropdown-content'
          const deleteBtn = document.createElement('a')
          deleteBtn.addEventListener('mouseup', function (e) {
            self.deleteSelection()
          })
          const editBtn = document.createElement('a')
          editBtn.addEventListener('mouseup', function (e) {
            const objs = c.getActiveObjects()
            if (objs.length === 1) {
              const obj = objs[0]
              if (self.editableTypeArr.includes(obj.annotateType)) {
                self.eventBus.dispatch('editDoneAnnotate', {
                  source: self,
                  state: obj.annotateType,
                  text: obj.text,
                  fontFamily: obj.fontFamily,
                  fontSize: obj.originFontSize,
                  dateEra: obj?.dateEra,
                  dateFormat: obj?.dateFormat,
                  doneDate: obj?.data,
                  page: self.pageNumber,
                })
              }
            }
          })
          deleteBtn.innerHTML = self.i18n.btnDelete
          deleteBtn.style.color = 'darkred'
          deleteBtn.style.fontSize = '14px'
          deleteBtn.className = 'dropDown-deleteBtn'
          editBtn.innerHTML = self.i18n.change
          editBtn.style.color = 'green'
          editBtn.style.fontSize = '14px'
          editBtn.className = 'dropDown-editBtn'
          dropDown.appendChild(editBtn)
          dropDown.appendChild(deleteBtn)
          self.canvasWrapper.appendChild(dropDown)
          self.addElements.push(dropDown)

          this.initAligningGuidelines()

          c.on('object:moving', function (e) {
            dropDown.classList.remove('dropdownOpen')
            if (!self.editableTypeArr.includes(e.target.annotateType)) {
              editBtn.classList.add('d-none')
            } else {
              editBtn.classList.remove('d-none')
            }

            const obj = e.target
            // if object is too big ignore
            if (
              obj.currentHeight > obj.canvas.height ||
              obj.currentWidth > obj.canvas.width
            ) {
              return
            }
            obj.setCoords()
            // top-left  corner
            if (
              obj.getBoundingRect().top < 0 ||
              obj.getBoundingRect().left < 0
            ) {
              obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top)
              obj.left = Math.max(
                obj.left,
                obj.left - obj.getBoundingRect().left
              )
            }
            // bot-right corner
            if (
              obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height ||
              obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
            ) {
              obj.top = Math.min(
                obj.top,
                obj.canvas.height -
                  obj.getBoundingRect().height +
                  obj.top -
                  obj.getBoundingRect().top
              )
              obj.left = Math.min(
                obj.left,
                obj.canvas.width -
                  obj.getBoundingRect().width +
                  obj.left -
                  obj.getBoundingRect().left
              )
            }

            if (
              obj._objects &&
              obj._objects.length > 1 &&
              (obj.id === null || obj.id === undefined)
            ) {
              obj._objects.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                shape.x = obj.left + obj.width / 2 + element.left
                shape.y = obj.top + obj.height / 2 + element.top
              })
              const groupObject = obj._objects.filter(
                (x) => x.groupId !== null && x.groupId !== undefined
              )
              groupObject.forEach((element) => {
                const id = element.id
                const shape = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.find((y) => y.objectId === id)
                if (
                  shape.groupId !== null &&
                  shape.groupId !== undefined &&
                  shape.type === 2
                ) {
                  const group = self.checkboxGroup.find(
                    (x) => x.id === shape.groupId
                  )
                  const children = self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === shape.groupId && y.type === 2
                    )
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
                      element.strokeWidth / 2 -
                      4 +
                      'px'
                    container.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.strokeWidth / 2 -
                      4 +
                      'px'
                    div.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.strokeWidth * 2 +
                      8 +
                      'px'
                    div.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.strokeWidth * 2 +
                      8 +
                      'px'
                    group.groupDiv = div
                  }
                } else if (
                  shape.groupId !== null &&
                  shape.groupId !== undefined &&
                  shape.type === 5
                ) {
                  const group = self.radioGroup.find(
                    (x) => x.id === shape.groupId
                  )
                  const children = self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === shape.groupId && y.type === 5
                    )
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
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    container.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    div.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    div.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    group.groupDiv = div
                  }
                }
              })
            } else {
              const id = obj.id
              const shape = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === id)
              shape.x = obj.left
              shape.y = obj.top
              if (
                shape.group !== null &&
                shape.group !== undefined &&
                obj._objects
              ) {
                obj._objects.forEach((element) => {
                  const groupShape = shape.group.find(
                    (x) => x.objectId === element.id
                  )
                  groupShape.x = obj.left + obj.width / 2 + element.left
                  groupShape.y = obj.top + obj.height / 2 + element.top
                })
              }
              if (
                shape.groupId !== null &&
                shape.groupId !== undefined &&
                shape.type === 2
              ) {
                const group = self.checkboxGroup.find(
                  (x) => x.id === shape.groupId
                )
                const children = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.filter(
                    (y) => y.groupId === shape.groupId && y.type === 2
                  )
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
                    obj.strokeWidth -
                    (!obj.newAdd && !children[0].prefill ? 16 : 0) -
                    4 +
                    'px'
                  container.style.left =
                    Math.min.apply(
                      Math,
                      children.map(function (child) {
                        return child.x
                      })
                    ) -
                    obj.strokeWidth -
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
                    obj.strokeWidth * 2 +
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
                    obj.strokeWidth * 2 +
                    8 +
                    'px'
                  group.groupDiv = div
                }
              } else if (
                shape.groupId !== null &&
                shape.groupId !== undefined &&
                shape.type === 5
              ) {
                const group = self.radioGroup.find(
                  (x) => x.id === shape.groupId
                )
                const children = self.annotate
                  .find((x) => x.page === self.pageNumber)
                  .data.filter(
                    (y) => y.groupId === shape.groupId && y.type === 5
                  )
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
                    (!obj.newAdd && !children[0].prefill ? 16 : 0) -
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

            self.eventBus.dispatch('updateAnnotateTool', {
              source: self,
              on: false,
              selection: null,
              position: null,
            })
          })

          c.on('object:moved', function (e) {
            // const rect = pdfCanvas.getBoundingClientRect()
            // const position = {
            //   top: rect.top + e.target.top,
            //   left: rect.left + e.target.left,
            // }
            // const selection = e.target
            // let checkboxGroup = null
            // let radioGroup = null
            // if (
            //   selection.annotateType &&
            //   (selection.annotateType === 2 || selection.annotateType === 5)
            // ) {
            //   const element = selection
            //   if (
            //     element.groupId !== null &&
            //     element.groupId !== undefined &&
            //     element.annotateType === 2
            //   ) {
            //     checkboxGroup = self.annotate
            //       .find((x) => x.page === self.pageNumber)
            //       .data.filter(
            //         (y) => y.groupId === element.groupId && y.type === 2
            //       )
            //       .sort((a, b) => a.objectId - b.objectId)
            //   } else if (
            //     element.groupId !== null &&
            //     element.groupId !== undefined &&
            //     element.annotateType === 5
            //   ) {
            //     radioGroup = self.annotate
            //       .find((x) => x.page === self.pageNumber)
            //       .data.filter(
            //         (y) => y.groupId === element.groupId && y.type === 5
            //       )
            //       .sort((a, b) => a.objectId - b.objectId)
            //   }
            // }
            // self.eventBus.dispatch('updateAnnotateTool', {
            //   source: self,
            //   on: true,
            //   selection,
            //   position,
            //   checkboxGroup,
            //   radioGroup,
            //   rect,
            // })
            if (dropDown.classList.contains('dropdownOpen')) {
              dropDown.style.top =
                e.target.top + e.target.height * e.target.scaleY + 20 + 'px'
              dropDown.style.left =
                e.target.left +
                (e.target.width * e.target.scaleX) / 2 -
                dropDown.clientWidth / 2 +
                'px'
            }
          })

          c.on('object:scaling', function (e) {
            dropDown.classList.remove('dropdownOpen')
            const obj = e.target
            // top-left  corner
            if (
              obj.getBoundingRect().top < 0 ||
              obj.getBoundingRect().left < 0
            ) {
              if (obj.getBoundingRect().top < 0) {
                obj.height += obj.top
              }
              if (obj.getBoundingRect().left < 0) {
                obj.width += obj.left
              }
              obj.top = Math.max(obj.top, 0)
              obj.left = Math.max(obj.left, 0)
            }
            // bot-right corner
            if (
              obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height ||
              obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
            ) {
              if (
                obj.getBoundingRect().top + obj.getBoundingRect().height >
                obj.canvas.height
              ) {
                obj.height = obj.canvas.height - obj.getBoundingRect().top
              }
              if (
                obj.getBoundingRect().left + obj.getBoundingRect().width >
                obj.canvas.width
              ) {
                obj.width = obj.canvas.width - obj.getBoundingRect().left
              }
            }

            const id = obj.id
            const shape = self.annotate
              .find((x) => x.page === self.pageNumber)
              .data.find((y) => y.objectId === id)
            shape.x = obj.left
            shape.y = obj.top
            shape.width = obj.width * obj.scaleX
            shape.height = obj.height * obj.scaleY

            if (obj.annotateType === 2 || obj.annotateType === 5) {
              shape.originWidth = obj.originWidth * obj.scaleX
              shape.originHeight = obj.originHeight * obj.scaleY
              shape.centerWidth = obj.centerWidth * obj.scaleX
              shape.centerHeight = obj.centerHeight * obj.scaleY
              shape.strokeWidth = obj.strokeWidth * obj.scaleX
              shape.rx = obj.rx * obj.scaleX
              shape.ry = obj.ry * obj.scaleY
            }

            if (shape.imageWidth !== null && shape.imageWidth !== undefined) {
              const bounds = obj.getBoundingRect()
              const scaleFactor = Math.min(
                Math.min(1, bounds.width / obj._objects[1].width),
                Math.min(1, bounds.height / obj._objects[1].height)
              )
              shape.imageWidth = obj._objects[1].width * scaleFactor
              shape.imageHeight = obj._objects[1].height * scaleFactor
            }
            if (
              shape.group !== null &&
              shape.group !== undefined &&
              obj._objects
            ) {
              obj._objects.forEach((element) => {
                const groupShape = shape.group.find(
                  (x) => x.objectId === element.id
                )
                groupShape.x = obj.left + obj.width / 2 + element.left
                groupShape.y = obj.top + obj.height / 2 + element.top
                groupShape.width = element.width * element.group.scaleX
                groupShape.height = element.height * element.group.scaleY
              })
            }

            const type = obj.get('type')
            if (type !== 'checkbox' && type !== 'group') {
              obj.set({
                height: obj.height * obj.scaleY,
                width: obj.width * obj.scaleX,
                scaleX: 1,
                scaleY: 1,
              })
            }

            if (dropDown.classList.contains('dropdownOpen')) {
              dropDown.style.top = obj.top + obj.height * obj.scaleY + 20 + 'px'
              dropDown.style.left =
                obj.left +
                (obj.width * obj.scaleX) / 2 -
                dropDown.clientWidth / 2 +
                'px'
            }
          })

          c.on('mouse:down', function (e) {
            self.eventBus.dispatch('deselectCanvas', {
              source: self,
            })
          })

          c.on('object:removed', function (e) {
            c._historySaveAction()
          })

          c.on('object:modified', function (e) {
            const obj = e.target
            dropDown.classList.add('dropdownOpen')
            dropDown.style.top = obj.top + obj.height * obj.scaleY + 20 + 'px'
            dropDown.style.left =
              obj.left +
              (obj.width * obj.scaleX) / 2 -
              dropDown.clientWidth / 2 +
              'px'

            c._historySaveAction()
          })

          c.on('selection:created', function (e) {
            dropDown.classList.toggle('dropdownOpen')
            dropDown.style.top =
              e.target.top + e.target.height * e.target.scaleY + 20 + 'px'
            dropDown.style.left =
              e.target.left +
              (e.target.width * e.target.scaleX) / 2 -
              dropDown.clientWidth / 2 +
              'px'

            if (!self.editableTypeArr.includes(e.target.annotateType)) {
              editBtn.classList.add('d-none')
            } else {
              editBtn.classList.remove('d-none')
            }

            const rect = pdfCanvas.getBoundingClientRect()
            const position = {
              top: rect.top + e.target.top,
              left: rect.left + e.target.left,
            }

            const selection = []
            const checkboxGroup = []
            const radioGroup = []
            e.selected.forEach((element) => {
              const annotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === element.id)
              if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 2
              ) {
                checkboxGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 2
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              } else if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 5
              ) {
                radioGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 5
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              }
              selection.push(annotate)
            })
            self.eventBus.dispatch('selectAnnotate', {
              source: self,
              selection,
              checkboxGroup,
              radioGroup,
              position,
              rect,
            })

            const mouseup = function (e) {
              const obj = e.target
              if (
                obj.id &&
                (obj.id === 'signButton' ||
                  obj.id === 'stampButton' ||
                  obj.id === 'signDateButton' ||
                  obj.id === 'textButton' ||
                  obj.id === 'checkboxButton' ||
                  obj.id === 'radioButton' ||
                  obj.id === 'dropdownButton' ||
                  obj.id === 'imageButton' ||
                  obj.id === 'drawCanvasButton')
              ) {
                c.discardActiveObject().renderAll()
              }
              document.removeEventListener('mouseup', mouseup)
            }
            document.addEventListener('mouseup', mouseup)
          })

          c.on('selection:updated', function (e) {
            dropDown.style.top =
              e.target.top + e.target.height * e.target.scaleY + 20 + 'px'
            dropDown.style.left =
              e.target.left +
              (e.target.width * e.target.scaleX) / 2 -
              dropDown.clientWidth / 2 +
              'px'
            if (!self.editableTypeArr.includes(e.target.annotateType)) {
              editBtn.classList.add('d-none')
            } else {
              editBtn.classList.remove('d-none')
            }

            const rect = pdfCanvas.getBoundingClientRect()
            const position = {
              top: rect.top + e.target.top,
              left: rect.left + e.target.left,
            }

            const selection = []
            const checkboxGroup = []
            const radioGroup = []
            e.selected.forEach((element) => {
              const annotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === element.id)
              if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 2
              ) {
                checkboxGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 2
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              } else if (
                element.groupId !== null &&
                element.groupId !== undefined &&
                element.annotateType === 5
              ) {
                radioGroup.push(
                  self.annotate
                    .find((x) => x.page === self.pageNumber)
                    .data.filter(
                      (y) => y.groupId === element.groupId && y.type === 5
                    )
                    .sort((a, b) => a.objectId - b.objectId)
                )
              }
              selection.push(annotate)
            })
            self.eventBus.dispatch('selectAnnotate', {
              source: self,
              selection,
              checkboxGroup,
              radioGroup,
              position,
              rect,
            })
          })

          c.on('selection:cleared', function (e) {
            dropDown.style.top = '0px'
            dropDown.style.left = '0px'
            if (dropDown.classList.contains('dropdownOpen')) {
              dropDown.classList.remove('dropdownOpen')
            }
          })

          c.hoverCursor = 'pointer'
          if (
            this.annotate &&
            this.annotate.length > 0 &&
            this.annotate.find((x) => x.page === this.pageNumber)
          ) {
            const annotate = this.annotate.find(
              (x) => x.page === this.pageNumber
            )
            annotate.data.forEach((element) => {
              if (element.scale) {
                const proportion = scale / element.scale
                element.width *= proportion
                element.height *= proportion
                if (element.originWidth) element.originWidth *= proportion
                if (element.originHeight) element.originHeight *= proportion
                element.x *= proportion
                element.y *= proportion
                if (element.rx) element.rx *= proportion
                if (element.ry) element.ry *= proportion
                if (element.strokeWidth) element.strokeWidth *= proportion
                if (element.imageWidth) element.imageWidth *= proportion
                if (element.imageHeight) element.imageHeight *= proportion
                if (element.imageX) element.imageX *= proportion
                if (element.imageY) element.imageY *= proportion
                if (element.centerWidth) element.centerWidth *= proportion
                if (element.centerHeight) element.centerHeight *= proportion

                element.scale = scale
              } else {
                element.width *= scale
                element.height *= scale
                if (element.originWidth) element.originWidth *= scale
                if (element.originHeight) element.originHeight *= scale
                element.x *= scale
                element.y *= scale
                if (element.rx) element.rx *= scale
                if (element.ry) element.ry *= scale
                if (element.strokeWidth) element.strokeWidth *= scale
                if (element.imageWidth) element.imageWidth *= scale
                if (element.imageHeight) element.imageHeight *= scale
                if (element.imageX) element.imageX *= scale
                if (element.imageY) element.imageY *= scale
                if (element.centerWidth) element.centerWidth *= scale
                if (element.centerHeight) element.centerHeight *= scale
                element.scale = scale
              }
            })

            let rect = null
            let text = null
            let radio = null
            let imageGroup = null
            annotate.data.forEach((element, index) => {
              if (element.id) {
                const hex = this.colorList[element.id - 1]
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                element.color = element.color ?? `rgba(${r},${g},${b}, 0.6)`
                element.stroke =
                  element.stroke ??
                  `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g}, ${
                    b > 10 ? b - 10 : b
                  })`
              } else {
                element.color = element.color ?? '#f1f5f8'
                element.stroke = element.stroke ?? 'rgb(146, 147, 147)'
              }
              element.objectId = element.objectId ?? index
              element.strokeWidth = element.strokeWidth ?? 2
              element.rx = element.rx ?? 2
              element.ry = element.ry ?? 2
              element.selected = element.selected ?? false
              element.text = element.text ?? ''
              element.fontSize = element.fontSize ?? 16
              element.fontFamily = element.fontFamily ?? 'Microsoft JhengHei'
              element.checkboxStrokeWidth = element.checkboxStrokeWidth ?? 1
              element.radioStrokeWidth = element.radioStrokeWidth ?? 1
              element.name = element.name ?? ''
              element.label = element.label ?? ''
              element.groupLabel = element.groupLabel ?? ''
              element.validation = element.validation ?? {
                type: null,
                regex: null,
                errorMessage: null,
              }
              element.dateRange = element.dateRange ?? 'signDay'
              element.dateEra = element.dateEra ?? 'common'
              switch (element.type) {
                case 0:
                case 3:
                case 8:
                  fabric.Image.fromURL(element.data, function (img) {
                    rect = new fabric.Rect({
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      id: element.objectId,
                      fill: 'transparent',
                      originX: 'center',
                      originY: 'center',
                      annotateType: element.type,
                      required: true,
                      label: '',
                    })
                    const bounds = rect.getBoundingRect()

                    const scaleFactor = Math.min(
                      Math.min(1, bounds.width / img.width),
                      Math.min(1, bounds.height / img.height)
                    )
                    img.scale(scaleFactor)
                    img.set({
                      top:
                        bounds.top +
                        Math.max(bounds.height - img.height * scaleFactor, 0) /
                          2,
                      left:
                        bounds.left +
                        Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                    })
                    imageGroup = new fabric.Group([rect, img], {
                      left: element.x,
                      top: element.y,
                      width: element.width,
                      height: element.height,
                      id: element.objectId,
                      annotateType: element.type,
                      required: true,
                      label: '',
                    })
                    c.add(imageGroup)
                  })
                  break
                case 1:
                  text = new fabric.Text(element.text, {
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    backgroundColor: element.color,
                    id: element.objectId,
                    originFontSize: element.fontSize || 16,
                    fontSize: element.fontSize * scale || 16 * scale,
                    fontFamily: element.fontFamily || 'Microsoft JhengHei',
                    fontStyle: element.fontStyle || '',
                    fontWeight: element.fontWeight || '',
                    fill: 'black',
                    textAlign: element.textAlign || 'left',
                    annotateType: element.type,
                    textColor: element.textColor || 'rgba(0,0,0,1)',
                  })
                  text.setControlsVisibility({
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    mtr: false,
                    tl: false,
                    tr: false,
                    bl: false,
                    br: false,
                  })
                  c.add(text)
                  break
                case 4:
                  text = new fabric.Text(element.text, {
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    backgroundColor: element.color,
                    id: element.objectId,
                    originFontSize: element.fontSize || 16,
                    fontSize: element.fontSize * scale || 16 * scale,
                    fontFamily: element.fontFamily || 'Microsoft JhengHei',
                    dateEra: element.dateEra || 'common',
                    dateFormat: element.dateFormat || 'YYYY/MM/DD',
                    data: element.date,
                    fontStyle: element.fontStyle || '',
                    fontWeight: element.fontWeight || '',
                    fill: 'black',
                    textAlign: element.textAlign || 'left',
                    annotateType: element.type,
                    textColor: element.textColor || 'rgba(0,0,0,1)',
                  })
                  text.setControlsVisibility({
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    mtr: false,
                    tl: false,
                    tr: false,
                    bl: false,
                    br: false,
                  })
                  c.add(text)
                  break
                case 2:
                  this.createCheckbox(element, c)
                  break
                case 5:
                  radio = this.createRadio(element)
                  c.add(radio)
                  break
                case 7:
                  rect = new fabric.LabeledRect({
                    width: element.width,
                    height: element.height,
                    top: element.y,
                    left: element.x,
                    fill: element.color,
                    rx: element.rx || 2 * scale,
                    ry: element.rx || 2 * scale,
                    stroke: element.stroke || '',
                    strokeWidth: element.strokeWidth || 0,
                    name: self.i18n.attachment,
                    icon: 'paperclip',
                    id: element.objectId,
                    selectId: element.id,
                    annotateType: 7,
                    required: element.required,
                    label: element.label,
                    prefill: element.prefill,
                  })
                  c.add(rect)
                  break
              }
            })
          }

          c._historyInit()
          this.eventBus.dispatch('initHistory', {
            page: this.pageNumber,
          })
          this.setState(this.state)
        }
        break
    }
  }

  renderHTMLElement(scale) {
    const pdfCanvas = this.pdfCanvas
    const self = this
    this.scale = scale
    switch (this.mode) {
      case 1:
      case 4:
        if (pdfCanvas) {
          if (
            this.annotate &&
            this.annotate.length > 0 &&
            this.annotate.find((x) => x.page === this.pageNumber)
          ) {
            const annotate = this.annotate.find(
              (x) => x.page === this.pageNumber
            )
            annotate.data.forEach((element) => {
              if (element.scale) {
                const proportion = scale / element.scale
                element.width *= proportion
                element.height *= proportion
                if (element.originWidth) element.originWidth *= proportion
                if (element.originHeight) element.originHeight *= proportion
                element.x *= proportion
                element.y *= proportion
                if (element.rx) element.rx *= proportion
                if (element.ry) element.ry *= proportion
                if (element.scaleX) element.scaleX *= proportion
                if (element.scaleY) element.scaleY *= proportion
                if (element.strokeWidth) element.strokeWidth *= proportion
                if (element.imageWidth) element.imageWidth *= proportion
                if (element.imageHeight) element.imageHeight *= proportion
                if (element.imageX) element.imageX *= proportion
                if (element.imageY) element.imageY *= proportion
                if (element.centerWidth) element.centerWidth *= proportion
                if (element.centerHeight) element.centerHeight *= proportion
                element.scale = scale
              } else {
                element.width *= scale
                element.height *= scale
                if (element.originWidth) element.originWidth *= scale
                if (element.originHeight) element.originHeight *= scale
                element.x *= scale
                element.y *= scale
                if (element.rx) element.rx *= scale
                if (element.ry) element.ry *= scale
                if (element.scaleX) element.scaleX *= scale
                if (element.scaleY) element.scaleY *= scale
                if (element.strokeWidth) element.strokeWidth *= scale
                if (element.imageWidth) element.imageWidth *= scale
                if (element.imageHeight) element.imageHeight *= scale
                if (element.imageX) element.imageX *= scale
                if (element.imageY) element.imageY *= scale
                if (element.centerWidth) element.centerWidth *= scale
                if (element.centerHeight) element.centerHeight *= scale
                element.scale = scale
              }
            })

            const canvasWidth = this.canvasWrapper.clientWidth
            const canvasHeight = this.canvasWrapper.clientHeight
            const isAnnotateDisabled = this.mode === 4 && this.role !== 'SIGNER'
            let text = null
            let textAreaContainer = null
            let textArea = null
            let radio = null
            let tooltip = null
            let date = null
            let radiomark = null
            let radiomarkContainer = null
            let label = null
            let attachment = null
            let p = null
            let textNode = null
            let textWrap = null
            let textCountElement = null
            // const isComposition = false
            let changeEvent = null
            // 文字驗證
            let regex = ''
            let errorMessage = ''
            let tooltipMessage = ''
            let tooltipError = null
            let fontWeight = null
            tooltip = document.createElement('div')
            tooltip.className = 'tooltip'
            tooltip.id = `tooltip_${this.pageNumber}`
            this.canvasWrapper.appendChild(tooltip)
            this.addElements.push(tooltip)
            tooltipError = document.createElement('span')
            tooltipError.className = 'tooltipError'
            tooltipError.id = `tooltipError_${this.pageNumber}`
            tooltipError.style.display = 'none'
            this.setRequiredElementStyle()
            annotate.data.forEach((element, index) => {
              element.objectId = element.objectId ?? index
              if (element.id) {
                const hex = this.colorList[element.id - 1]
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                element.color = element.color ?? `rgba(${r},${g},${b}, 0.6)`
                element.stroke =
                  element.stroke ??
                  `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g}, ${
                    b > 10 ? b - 10 : b
                  })`
              } else {
                element.color = element.color ?? '#f1f5f8'
                element.stroke = element.stroke ?? 'rgb(146, 147, 147)'
              }
              element.strokeWidth = element.strokeWidth ?? 2
              element.rx = element.rx ?? 2
              element.ry = element.ry ?? 2
              element.selected = element.selected ?? false
              element.text = element.text ?? ''
              element.fontSize = element.fontSize ?? 16
              element.fontFamily = element.fontFamily ?? 'Microsoft JhengHei'
              element.checkboxStrokeWidth = element.checkboxStrokeWidth ?? 1
              element.radioStrokeWidth = element.radioStrokeWidth ?? 1
              element.label = element.label ?? ''
              element.groupLabel = element.groupLabel ?? ''
              element.done =
                (element.data !== null &&
                  element.data !== undefined &&
                  element.data !== '') ??
                false
              switch (element.type) {
                case 0:
                  if (!element.done) {
                    const signature = document.createElement('button')
                    signature.id = `signature${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      signature.classList.add('required')
                    } else {
                      signature.classList.remove('required')
                    }
                    signature.style.position = 'absolute'
                    signature.style.left = element.x + 'px'
                    signature.style.top = element.y + 'px'
                    signature.style.width =
                      element.width - element.strokeWidth + 'px'
                    signature.style.height =
                      element.height - element.strokeWidth + 'px'
                    signature.style.borderRadius = `${element.rx}px`
                    signature.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color
                    signature.style.zIndex = 40
                    signature.style.padding = '0px'
                    signature.style.border = `${element.strokeWidth}px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    signature.style.display = 'flex'
                    signature.style.alignItems = 'center'
                    signature.style.justifyContent = 'center'
                    signature.style.boxSizing = 'content-box'
                    signature.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.signature)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.style.writingMode = element.textDirection
                      ? 'vertical-lr'
                      : 'horizontal-tb'
                    p.innerHTML = `<i class="v-icon notranslate mdi mdi-signature theme--light" aria-hidden="true" style="${
                      element.textDirection
                        ? 'rotate: 90deg;margin-bottom: 8px;'
                        : 'margin-right: 8px;'
                    } font-size: 16px;"></i>`
                    p.appendChild(text)
                    signature.appendChild(p)
                    if (!isAnnotateDisabled) {
                      signature.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateSignature', {
                          source: self,
                          annotateSignature: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                            type: element.type,
                            textDirection: element.textDirection || false,
                          },
                          mode: 0,
                        })
                      })
                    }
                    signature.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.sign
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    signature.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(signature)
                    this.addElements.push(signature)
                  } else {
                    const signatureImage = document.createElement('button')
                    signatureImage.id = `signatureImage${element.objectId}_${this.pageNumber}`
                    signatureImage.style.position = 'absolute'
                    signatureImage.style.left = element.x + 'px'
                    signatureImage.style.top = element.y + 'px'
                    signatureImage.style.width = element.width + 'px'
                    signatureImage.style.height = element.height + 'px'
                    signatureImage.style.borderRadius = `${element.rx}px`
                    signatureImage.style.zIndex = 40
                    signatureImage.style.padding = '0px'
                    signatureImage.style.display = 'none'
                    signatureImage.style.alignItems = 'center'
                    signatureImage.style.justifyContent = 'center'
                    signatureImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      signatureImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    signatureImage.appendChild(image)

                    signatureImage.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.sign
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    signatureImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `signatureDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateSignature', {
                        source: self,
                        annotateSignature: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                          textDirection: element.textDirection || false,
                        },
                        mode: 1,
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const deleteSignatureImage = document.getElementById(
                        `signatureImage${element.objectId}_${self.pageNumber}`
                      )
                      if (deleteSignatureImage) {
                        deleteSignatureImage.remove()
                      }
                      const sig = document.createElement('button')
                      sig.id = `signature${undoneAnnotate.objectId}_${self.pageNumber}`
                      if (undoneAnnotate.required) {
                        sig.classList.add('required')
                      } else {
                        sig.classList.remove('required')
                      }
                      sig.style.position = 'absolute'
                      sig.style.left = undoneAnnotate.x + 'px'
                      sig.style.top = undoneAnnotate.y + 'px'
                      sig.style.width = undoneAnnotate.width + 'px'
                      sig.style.height = undoneAnnotate.height + 'px'
                      sig.style.borderRadius = `${undoneAnnotate.rx}px`
                      sig.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color
                      sig.style.zIndex = 40
                      sig.style.padding = '0px'
                      sig.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      sig.style.display = 'flex'
                      sig.style.alignItems = 'center'
                      sig.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        sig.style.outline = '2px dotted red'
                      }
                      sig.style.setProperty('--required-right', '-10px')
                      sig.style.setProperty('--required-top', '-10px')
                      sig.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )

                      sig.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(self.i18n.signature)
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.style.writingMode = element.textDirection
                        ? 'vertical-lr'
                        : 'horizontal-tb'
                      p.innerHTML = `<i class="v-icon notranslate mdi mdi-signature theme--light" aria-hidden="true" style="${
                        element.textDirection
                          ? 'rotate: 90deg;margin-bottom: 8px;'
                          : 'margin-right: 8px;'
                      } font-size: 16px;"></i>`
                      p.appendChild(text)
                      sig.appendChild(p)
                      if (!isAnnotateDisabled) {
                        sig.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateSignature', {
                            source: self,
                            annotateSignature: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                              type: undoneAnnotate.type,
                              textDirection: element.textDirection || false,
                            },
                            mode: 0,
                          })
                        })
                      }
                      sig.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.sign
                        } - ${
                          undoneAnnotate.required
                            ? self.i18n.required
                            : self.i18n.optional
                        }`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      sig.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(sig)
                      self.addElements.push(sig)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      signatureImage.addEventListener('mouseup', function (e) {
                        setTimeout(() => {
                          dropDown.classList.toggle('dropdownOpen')
                          dropDown.style.top =
                            element.y + element.height + 10 + 'px'
                          dropDown.style.left = element.x + 'px'
                          signatureImage.style.border =
                            '2px solid rgba(0, 150, 199, 0.6)'
                          const mouseup = function (e) {
                            const dropdowns =
                              document.getElementsByClassName(
                                'dropdown-content'
                              )
                            for (let i = 0; i < dropdowns.length; i++) {
                              const openDropdown = dropdowns[i]
                              if (
                                openDropdown.classList.contains('dropdownOpen')
                              ) {
                                openDropdown.classList.remove('dropdownOpen')
                                signatureImage.style.removeProperty('border')
                              }
                            }
                            document.removeEventListener('mouseup', mouseup)
                          }
                          document.addEventListener('mouseup', mouseup)
                        }, 0)
                      })
                    }
                    this.canvasWrapper.appendChild(signatureImage)
                    this.addElements.push(signatureImage)
                  }
                  break
                case 1:
                  textAreaContainer = document.createElement('span')
                  textArea = document.createElement('textarea')
                  // textArea 需要用div來判斷換行
                  textWrap = document.createElement('div')
                  textCountElement = document.createElement('div')

                  textArea.value = element.text
                  textArea.disabled = element.readonly || isAnnotateDisabled
                  // placeholder
                  if (element.textDirection) {
                    if (
                      element.height >=
                      element.fontSize * 2 * element.scale
                    ) {
                      // add \n to force wrap
                      for (let i = 0; i < self.i18n.text.length; i++) {
                        textArea.placeholder = textArea.placeholder.concat(
                          '\n',
                          self.i18n.text[i]
                        )
                      }
                      // remove first \n
                      textArea.placeholder = textArea.placeholder.substring(
                        1,
                        textArea.placeholder.length
                      )
                    } else if (
                      element.height >=
                      element.fontSize * element.scale
                    ) {
                      textArea.placeholder = self.i18n.text.charAt(0)
                    }
                  } else if (
                    element.width >=
                    element.fontSize * 2 * element.scale
                  ) {
                    textArea.placeholder = self.i18n.text
                  } else if (
                    element.width >=
                    element.fontSize * element.scale
                  ) {
                    textArea.placeholder = self.i18n.text.charAt(0)
                  }
                  textAreaContainer.id = `textContainer${element.objectId}_${this.pageNumber}`
                  textArea.id = `text${element.objectId}_${this.pageNumber}`
                  if (element.required) {
                    textAreaContainer.classList.add('required')
                  } else {
                    textAreaContainer.classList.remove('required')
                  }
                  textAreaContainer.style.position = 'absolute'
                  textAreaContainer.style.left = element.x + 'px'
                  textAreaContainer.style.top = element.y + 'px'
                  textAreaContainer.style.zIndex = 40
                  textArea.style.width = element.width + 'px'
                  // padding-bottom 8px
                  textArea.style.height = element.height + 8 + 'px'
                  textArea.style.borderRadius = `${element.rx}px`
                  textArea.style.backgroundColor = this.useDefaultColor
                    ? this.defaultBGC
                    : element.color

                  fontWeight = element.fontWeight || 'normal'
                  textArea.style.font = `${fontWeight} ${
                    element.fontSize * element.scale
                  }px ${element.fontFamily}`
                  textArea.style.fontStyle = element.fontStyle
                  textArea.style.color = element.textColor || 'rgba(0,0,0,1)'
                  textArea.style.padding = '0px'
                  textArea.style.resize = 'none'
                  textArea.style.overflow = 'hidden'
                  textArea.style.wordBreak = 'break-all'
                  textArea.style.textAlign = element.textAlign || 'left'
                  textCountElement.id = `textCount${element.objectId}_${this.pageNumber}`
                  textCountElement.style.display = 'none'
                  textCountElement.style.position = 'absolute'
                  textCountElement.style.right = '0'
                  textCountElement.style.bottom = `-${10 * element.scale}px`
                  textCountElement.style.zIndex = 40
                  textCountElement.style.fontSize =
                    16 * element.scale * 0.5 + 'px'
                  textCountElement.style.letterSpacing = '1px'
                  textCountElement.innerHTML = `${element.text.length}/${element.maxlength}`
                  textCountElement.style.color =
                    element.text.length > element.maxlength ? 'red' : 'black'

                  // show error if overflow textarea or over char limit
                  if (
                    element.text.length > element.maxlength ||
                    element.isTextOverflow
                  ) {
                    textArea.style.setProperty('outline', '2px dotted red')
                    if (element.text.length > element.maxlength) {
                      textAreaContainer.classList.add(
                        `textoverlength__${self.i18n.locale}`
                      )
                    } else {
                      textAreaContainer.classList.remove(
                        `textoverlength__${self.i18n.locale}`
                      )
                    }
                    if (element.isTextOverflow) {
                      textAreaContainer.classList.add(
                        `textoverflow__${self.i18n.locale}`
                      )
                    } else {
                      textAreaContainer.classList.remove(
                        `textoverflow__${self.i18n.locale}`
                      )
                    }
                  } else {
                    textArea.style.removeProperty('outline')
                  }

                  textAreaContainer.style.setProperty(
                    '--invalid-char',
                    `${element.text.length - element.maxlength}`
                  )

                  textWrap.id = `textWrap${element.objectId}_${this.pageNumber}`
                  textWrap.style.width = element.width + 'px'
                  textWrap.style.height = 'auto'
                  textWrap.style.font = `${fontWeight} ${
                    element.fontSize * element.scale
                  }px ${element.fontFamily}`
                  textWrap.style.fontStyle = element.fontStyle
                  textWrap.style.color = element.textColor || 'rgba(0,0,0,1)'
                  textWrap.style.textAlign = element.textAlign || 'left'
                  textWrap.style.whiteSpace = 'pre-wrap'
                  textWrap.style.wordBreak = 'break-all'
                  textWrap.style.visibility = 'hidden'
                  textWrap.style.position = 'absolute'
                  textWrap.innerHTML = element.text

                  // 文字驗證 input mode
                  if (element.validation) {
                    switch (element.validation.type) {
                      case 'idcard':
                        textArea.inputMode = 'text'
                        break
                      case 'email':
                        textArea.inputMode = 'email'
                        break
                      case 'phone':
                        textArea.inputMode = 'tel'
                        break
                      case 'zip':
                        textArea.inputMode = 'numeric'
                        break
                      case 'number':
                        textArea.inputMode = 'numeric'
                        break
                      case 'custom':
                        textArea.inputMode = 'text'
                        break
                    }
                  }

                  // textArea.addEventListener('compositionstart', (e) => {
                  //   isComposition = true
                  // })
                  // textArea.addEventListener('compositionend', (e) => {
                  //   isComposition = false
                  // })
                  textArea.addEventListener('keydown', (e) => {
                    const obj = e.target
                    const pageNumber = +obj.id.split('_')[1]
                    const objectId = +obj.id.split('_')[0].replace('text', '')
                    const annotate = self.annotate
                      .find((x) => x.page === pageNumber)
                      .data.find((y) => y.objectId === objectId)
                    if (annotate.singleLine) {
                      if (e.key === 'Enter') {
                        e.preventDefault() // Prevents the default action (new line)
                      }
                    }
                  })
                  textArea.addEventListener('input', (e) => {
                    // wait composition end trigger
                    setTimeout(() => {
                      const obj = e.target
                      const pageNumber = +obj.id.split('_')[1]
                      const objectId = +obj.id.split('_')[0].replace('text', '')
                      const annotate = self.annotate
                        .find((x) => x.page === pageNumber)
                        .data.find((y) => y.objectId === objectId)
                      annotate.text = obj.value

                      if (
                        obj.value !== '' &&
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        obj.style.removeProperty('outline')
                      } else if (
                        obj.value === '' &&
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        obj.style.setProperty('outline', '2px dotted red')
                      }
                      const textContainer = document.getElementById(
                        `textContainer${objectId}_${pageNumber}`
                      )
                      const wrapDiv = document.getElementById(
                        `textWrap${objectId}_${pageNumber}`
                      )
                      const textCountElement = document.getElementById(
                        `textCount${element.objectId}_${this.pageNumber}`
                      )
                      textCountElement.innerHTML = `${element.text.length}/${element.maxlength}`
                      textCountElement.style.color =
                        element.text.length > element.maxlength
                          ? 'red'
                          : 'black'
                      textCountElement.style.display =
                        element.text.length > element.maxlength
                          ? 'block'
                          : 'none'

                      textContainer.style.setProperty(
                        '--invalid-char',
                        `${element.text.length - element.maxlength}`
                      )

                      // 文字驗證 regular expression
                      regex = null
                      if (element.validation) {
                        switch (element.validation.type) {
                          case 'idcard':
                            regex = '^[A-Z]{1}[1-2]{1}[0-9]{8}$'
                            break
                          case 'email':
                            regex = '^[^\\s@]+@[^\\s@]+.[^\\s@]+$'
                            break
                          case 'phone':
                            regex =
                              '(\\d{2,3}-?|(\\d{2,3}))\\d{3,4}-?\\d{4}|09\\d{2}(\\d{6}|-\\d{3}-\\d{3})'
                            break
                          case 'zip':
                            regex = '^\\d{6}$|^\\d{3}$'
                            break
                          case 'number':
                            regex = '^[0-9]+$'
                            break
                          case 'custom':
                            regex = element.validation.regex
                            break
                        }
                      }
                      if (regex !== null) {
                        if (obj.value.match(new RegExp(regex)) === null) {
                          annotate.isValidationFailed = true
                          if (+tooltip.dataset.objectId === objectId) {
                            tooltipError.style.removeProperty('display')
                          }
                        } else {
                          annotate.isValidationFailed = false
                          if (+tooltip.dataset.objectId === objectId) {
                            tooltipError.style.setProperty('display', 'none')
                          }
                        }
                      }

                      wrapDiv.innerHTML = obj.value
                      const height =
                        wrapDiv.clientHeight - parseInt(obj.style.fontSize) / 5
                      // if singleLine and vertical, min font size must bigger than obj height * 2 /3, or it'll be two line in chinese
                      // if singleLine and horizontal, min font size must bigger than obj height/2, or it'll be two line
                      // else if horizontal, min font size is 10
                      const minFontSize = annotate.textDirection
                        ? (obj.clientWidth * 2) / 3 / annotate.scale
                        : annotate.singleLine
                        ? obj.clientHeight / 2 / annotate.scale
                        : 10

                      // show error if over char limit
                      if (element.text.length > element.maxlength) {
                        textContainer.classList.add(
                          `textoverlength__${self.i18n.locale}`
                        )
                        annotate.isTextExceeded = true
                        obj.style.setProperty('outline', '2px dotted red')
                      } else {
                        textContainer.classList.remove(
                          `textoverlength__${self.i18n.locale}`
                        )
                        annotate.isTextExceeded = false
                        obj.style.removeProperty('outline')
                      }

                      // show error if overflow textarea
                      // shrink text
                      if (height > obj.clientHeight) {
                        while (
                          wrapDiv.clientHeight -
                            parseInt(obj.style.fontSize) / 5 >
                            obj.clientHeight &&
                          wrapDiv.style.fontSize.split('px')[0] >
                            minFontSize * annotate.scale
                        ) {
                          wrapDiv.style.fontSize = `${
                            wrapDiv.style.fontSize.split('px')[0] - 1
                          }px`
                          obj.style.fontSize = `${
                            obj.style.fontSize.split('px')[0] - 1
                          }px`
                        }
                        if (
                          wrapDiv.clientHeight -
                            parseInt(obj.style.fontSize) / 5 >
                          obj.clientHeight
                        ) {
                          annotate.isTextOverflow = true
                          textContainer.classList.add(
                            `textoverflow__${self.i18n.locale}`
                          )
                          obj.style.setProperty('outline', '2px dotted red')
                        }
                      }
                      // grow text
                      else {
                        while (
                          parseFloat(wrapDiv.style.fontSize.split('px')[0]) <
                            annotate.scale * annotate.fontSize &&
                          wrapDiv.offsetHeight +
                            parseFloat(wrapDiv.style.fontSize.split('px')[0]) <
                            obj.offsetHeight
                        ) {
                          const newWrapDivFontSize =
                            parseFloat(wrapDiv.style.fontSize.split('px')[0]) +
                            1.0
                          wrapDiv.style.fontSize = newWrapDivFontSize + 'px'

                          obj.style.fontSize = newWrapDivFontSize + 'px'
                          // expected error grow text
                          if (wrapDiv.offsetHeight > obj.offsetHeight) {
                            wrapDiv.style.fontSize = `${
                              wrapDiv.style.fontSize.split('px')[0] - 1
                            }px`
                            obj.style.fontSize = `${
                              obj.style.fontSize.split('px')[0] - 1
                            }px`
                            break
                          }
                        }
                        annotate.isTextOverflow = false
                        textContainer.classList.remove(
                          `textoverflow__${self.i18n.locale}`
                        )
                        if (
                          obj.value !== '' &&
                          element.text.length <= element.maxlength
                        ) {
                          obj.style.removeProperty('outline')
                        }
                      }

                      self.eventBus.dispatch('notifyAnnotateChanged')
                    }, 0)
                  })
                  textArea.addEventListener('change', function (e) {
                    // wait DOM rendered
                    setTimeout(() => {
                      if (self.mode === 1) {
                        self.eventBus.dispatch('checkAnnotateChanged', {
                          source: self,
                          showOutline: self.showOutline,
                        })
                      }
                    }, 0)
                  })
                  textArea.addEventListener('mouseover', function (e) {
                    // 文字驗證 tooltip
                    errorMessage = ''
                    tooltipMessage = `${
                      element.label ? element.label : self.i18n.text
                    } - ${
                      element.required ? self.i18n.required : self.i18n.optional
                    }`
                    if (element.validation) {
                      switch (element.validation.type) {
                        case 'idcard':
                          errorMessage = self.i18n.invalidIdNumber
                          tooltipMessage += ` - ${self.i18n.idCard}`
                          tooltipError.innerHTML = ` - ${errorMessage}`
                          break
                        case 'email':
                          errorMessage = self.i18n.invalidEmail
                          tooltipMessage += ` - ${self.i18n.email}`
                          tooltipError.innerHTML = ` - ${errorMessage}`
                          break
                        case 'phone':
                          errorMessage = self.i18n.invalidPhone
                          tooltipMessage += ` - ${self.i18n.phone}`
                          tooltipError.innerHTML = ` - ${errorMessage}`
                          break
                        case 'zip':
                          errorMessage = self.i18n.invalidPostalCode
                          tooltipMessage += ` - ${self.i18n.postalCode}`
                          tooltipError.innerHTML = ` - ${errorMessage}`
                          break
                        case 'number':
                          errorMessage = self.i18n.invalidNumbers
                          tooltipMessage += ` - ${self.i18n.numbers}`
                          tooltipError.innerHTML = ` - ${errorMessage}`
                          break
                        case 'custom':
                          errorMessage = element.validation.errorMessage
                          tooltipError.innerHTML = ` - ${errorMessage}`
                          break
                      }
                    }
                    tooltip.innerHTML = tooltipMessage
                    tooltip.dataset.objectId = element.objectId
                    tooltip.appendChild(tooltipError)
                    if (element.isValidationFailed) {
                      tooltipError.style.removeProperty('display')
                    } else {
                      tooltipError.style.setProperty('display', 'none')
                    }
                    tooltip.style.display = 'block'
                    tooltip.style.top =
                      element.y - tooltip.clientHeight - 10 <= 0
                        ? element.y + element.height + 10 + 'px'
                        : Math.min(
                            element.y - tooltip.clientHeight - 10,
                            canvasHeight - 100
                          ) + 'px'
                    tooltip.style.left =
                      Math.min(
                        element.x + element.width / 5,
                        canvasWidth - 150
                      ) + 'px'
                  })
                  textArea.addEventListener('mouseout', function (e) {
                    tooltip.style.top = 0
                    tooltip.style.left = 0
                    tooltip.style.display = 'none'
                  })
                  textAreaContainer.appendChild(textWrap)
                  textAreaContainer.appendChild(textCountElement)
                  textAreaContainer.appendChild(textArea)
                  this.canvasWrapper.appendChild(textAreaContainer)
                  this.addElements.push(textAreaContainer)
                  break
                case 2:
                  if (element.group === null || element.group === undefined) {
                    const label = document.createElement('label')
                    label.id = `checkboxContainer${element.objectId}_${this.pageNumber}`
                    label.className = 'checkboxContainer'
                    label.style.position = 'absolute'
                    label.style.left = element.x + 'px'
                    label.style.top = element.y + 'px'
                    label.style.width = element.width + 'px'
                    label.style.height = element.height + 'px'
                    label.style.zIndex = 40
                    label.style.transform = `scale(${1.2})`
                    const checkbox = document.createElement('input')
                    checkbox.type = 'checkbox'
                    checkbox.checked = element.selected
                    checkbox.disabled =
                      annotate.data.find(
                        (y) =>
                          y.groupId === element.groupId &&
                          y.type === 2 &&
                          y.readonly === true
                      ) || isAnnotateDisabled
                    checkbox.id = `checkbox${element.objectId}_${this.pageNumber}`
                    checkbox.style.left = '0px'
                    checkbox.style.top = '0px'
                    checkbox.style.width = element.width + 'px'
                    checkbox.style.height = element.height + 'px'
                    checkbox.style.zIndex = 40
                    const checkmarkContainer = document.createElement('div')
                    checkmarkContainer.id = `checkmarkContainer${element.objectId}_${this.pageNumber}`
                    checkmarkContainer.className = 'checkmarkContainer'
                    const checkmark = document.createElement('div')
                    checkmark.className = 'checkmark'
                    checkmark.style.width = checkmark.style.height =
                      element.width * 0.5 + 'px'

                    checkmarkContainer.appendChild(checkmark)
                    checkmarkContainer.style.width = element.width + 'px'
                    checkmarkContainer.style.height = element.width + 'px'
                    checkmarkContainer.style.backgroundColor = this
                      .useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    checkmarkContainer.style.borderRadius = '2px'
                    checkmarkContainer.style.border = `${
                      element.strokeWidth
                    }px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    checkmarkContainer.style.transformOrigin = 'left top'
                    label.appendChild(checkbox)
                    label.appendChild(checkmarkContainer)
                    if (
                      element.groupId !== null &&
                      element.groupId !== undefined &&
                      (this.checkboxGroup.find(
                        (x) => x.id === element.groupId
                      ) === null ||
                        this.checkboxGroup.find(
                          (x) => x.id === element.groupId
                        ) === undefined)
                    ) {
                      const groupId = element.groupId
                      const children = annotate.data.filter(
                        (y) => y.groupId === groupId && y.type === 2
                      )
                      const checkboxGroupContainer =
                        document.createElement('div')
                      checkboxGroupContainer.id = `checkboxGroupContainer${groupId}_${this.pageNumber}`
                      if (element.minimum > 0) {
                        checkboxGroupContainer.classList.add('required')
                      } else {
                        checkboxGroupContainer.classList.remove('required')
                      }
                      checkboxGroupContainer.style.position = 'absolute'
                      checkboxGroupContainer.style.left =
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) -
                        element.checkboxStrokeWidth -
                        4 +
                        'px'
                      checkboxGroupContainer.style.top =
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) -
                        element.checkboxStrokeWidth -
                        4 +
                        'px'
                      checkboxGroupContainer.style.display = 'flex'
                      checkboxGroupContainer.style.flexDirection = 'column'
                      checkboxGroupContainer.style.alignItems = 'center'
                      checkboxGroupContainer.style.zIndex = '40'
                      const checkboxGroupDiv = document.createElement('div')
                      checkboxGroupDiv.id = `checkboxGroupDiv_${groupId}`
                      checkboxGroupDiv.style.width =
                        Math.max.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) +
                        element.width -
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) +
                        element.strokeWidth * 2 +
                        8 +
                        'px'
                      checkboxGroupDiv.style.height =
                        Math.max.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) +
                        element.height -
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) +
                        element.strokeWidth * 2 +
                        8 +
                        'px'
                      checkboxGroupDiv.style.border = '2px dashed #3183c8c2'
                      checkboxGroupDiv.style.zIndex = 20
                      checkboxGroupDiv.style.borderRadius = '2px'
                      checkboxGroupContainer.appendChild(checkboxGroupDiv)
                      this.canvasWrapper.appendChild(checkboxGroupContainer)
                      this.addElements.push(checkboxGroupContainer)
                      const groupTooltip = document.createElement('div')
                      groupTooltip.className = 'tooltip'
                      groupTooltip.id = `checkboxGroupTooltip${groupId}_${this.pageNumber}`
                      let text = ''
                      switch (element.ruleId) {
                        case 0:
                          text = self.i18n.selectAtLeast.replace(
                            '{minimum}',
                            element.minimum
                          )
                          break
                        case 1:
                          text = self.i18n.selectAtMost.replace(
                            '{maximum}',
                            element.maximum
                          )
                          break
                        case 2:
                          text = self.i18n.selectExactly.replace(
                            '{maximum}',
                            element.maximum
                          )
                          break
                        case 3:
                          text = self.i18n.selectRange
                            .replace('{minimum}', element.minimum)
                            .replace('{maximum}', element.maximum)
                          break
                      }
                      const groupLabel =
                        element.groupLabel && element.groupLabel !== ''
                          ? element.groupLabel.length > 40
                            ? element.groupLabel.substring(0, 40) + '...'
                            : element.groupLabel
                          : self.i18n.checkboxGrp
                      groupTooltip.innerHTML = `${groupLabel} - ${text}`
                      groupTooltip.style.top =
                        Math.min(
                          parseFloat(checkboxGroupContainer.style.top) +
                            parseFloat(checkboxGroupDiv.style.height) / 2,
                          canvasHeight - 100
                        ) + 'px'
                      groupTooltip.style.left =
                        Math.min(
                          parseFloat(checkboxGroupContainer.style.left) +
                            parseFloat(checkboxGroupDiv.style.width) +
                            10,
                          canvasWidth - 150
                        ) + 'px'
                      groupTooltip.style.zIndex = 40
                      groupTooltip.style.display = 'none'
                      this.canvasWrapper.appendChild(groupTooltip)
                      this.addElements.push(groupTooltip)
                      this.checkboxGroup.push({
                        id: groupId,
                        container: checkboxGroupContainer,
                        groupDiv: checkboxGroupDiv,
                        groupTooltip,
                        items: children.map((x) => x.objectId),
                      })
                    }
                    checkbox.addEventListener('change', function (e) {
                      const obj = e.target
                      const pageNumber = +obj.id.split('_')[1]
                      const objectId = +obj.id
                        .split('_')[0]
                        .replace('checkbox', '')
                      const annotate = self.annotate
                        .find((x) => x.page === pageNumber)
                        .data.find((y) => y.objectId === objectId)
                      annotate.selected = obj.checked
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                    })
                    checkbox.addEventListener('mouseover', function (e) {
                      const obj = e.target
                      const pageNumber = +obj.id.split('_')[1]
                      const objectId = +obj.id
                        .split('_')[0]
                        .replace('checkbox', '')
                      const annotate = self.annotate
                        .find((x) => x.page === pageNumber)
                        .data.find((y) => y.objectId === objectId)
                      const label =
                        element.label && element.label !== ''
                          ? element.label.length > 40
                            ? element.label.substring(0, 40) + '...'
                            : element.label
                          : self.i18n.checkbox
                      tooltip.innerHTML = `${label} - ${
                        element.minimum > 0
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                      if (
                        annotate.groupId !== null &&
                        annotate.groupId !== undefined &&
                        annotate.type === 2
                      ) {
                        const checkboxGroup = self.checkboxGroup
                        checkboxGroup.forEach((element) => {
                          if (
                            element &&
                            element.container &&
                            element.id === annotate.groupId
                          ) {
                            element.container.style.display = 'flex'
                            element.groupTooltip.style.display = 'flex'
                          }
                        })
                      }
                    })
                    checkbox.addEventListener('mouseout', function (e) {
                      const obj = e.target
                      const pageNumber = +obj.id.split('_')[1]
                      const objectId = +obj.id
                        .split('_')[0]
                        .replace('checkbox', '')
                      const annotate = self.annotate
                        .find((x) => x.page === pageNumber)
                        .data.find((y) => y.objectId === objectId)
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                      if (
                        annotate.groupId !== null &&
                        annotate.groupId !== undefined &&
                        annotate.type === 2
                      ) {
                        const checkboxGroup = self.checkboxGroup
                        checkboxGroup.forEach((element) => {
                          if (
                            element &&
                            element.container &&
                            element.id === annotate.groupId
                          ) {
                            element.container.style.display = 'flex'
                            element.groupTooltip.style.display = 'none'
                          }
                        })
                      }
                    })
                    this.canvasWrapper.appendChild(label)
                    this.addElements.push(label)
                  }
                  break
                case 3:
                  if (!element.done) {
                    const stamp = document.createElement('button')
                    stamp.id = `stamp${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      stamp.classList.add('required')
                    } else {
                      stamp.classList.remove('required')
                    }
                    stamp.style.position = 'absolute'
                    stamp.style.left = element.x + 'px'
                    stamp.style.top = element.y + 'px'
                    stamp.style.width = element.width + 'px'
                    stamp.style.height = element.height + 'px'
                    stamp.style.borderRadius = `${element.rx}px`
                    stamp.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    stamp.style.zIndex = 40
                    stamp.style.padding = '0px'
                    stamp.style.border = `${element.strokeWidth}px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    stamp.style.display = 'flex'
                    stamp.style.alignItems = 'center'
                    stamp.style.justifyContent = 'center'
                    stamp.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.stamp)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="v-icon notranslate mdi mdi-stamper theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    stamp.appendChild(p)
                    if (!isAnnotateDisabled) {
                      stamp.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateStamp', {
                          source: self,
                          annotateStamp: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                            type: element.type,
                          },
                          mode: 0,
                        })
                      })
                    }
                    stamp.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.stamp
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stamp.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(stamp)
                    this.addElements.push(stamp)
                  } else {
                    const stampImage = document.createElement('button')
                    stampImage.id = `stampImage${element.objectId}_${this.pageNumber}`
                    stampImage.style.position = 'absolute'
                    stampImage.style.left = element.x + 'px'
                    stampImage.style.top = element.y + 'px'
                    stampImage.style.width = element.width + 'px'
                    stampImage.style.height = element.height + 'px'
                    stampImage.style.borderRadius = `${element.rx}px`
                    stampImage.style.zIndex = 40
                    stampImage.style.padding = '0px'
                    stampImage.style.display = 'none'
                    stampImage.style.alignItems = 'center'
                    stampImage.style.justifyContent = 'center'
                    stampImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      stampImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    stampImage.appendChild(image)

                    stampImage.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.stamp
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stampImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `stampDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateStamp', {
                        source: self,
                        annotateStamp: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                        },
                        mode: 1,
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const oldStampImage = document.getElementById(
                        `stampImage${element.objectId}_${self.pageNumber}`
                      )
                      if (oldStampImage) {
                        oldStampImage.remove()
                      }
                      const stmp = document.createElement('button')
                      stmp.id = `stamp${undoneAnnotate.objectId}_${self.pageNumber}`
                      if (undoneAnnotate.required) {
                        stmp.classList.add('required')
                      } else {
                        stmp.classList.remove('required')
                      }
                      stmp.style.position = 'absolute'
                      stmp.style.left = undoneAnnotate.x + 'px'
                      stmp.style.top = undoneAnnotate.y + 'px'
                      stmp.style.width = undoneAnnotate.width + 'px'
                      stmp.style.height = undoneAnnotate.height + 'px'
                      stmp.style.borderRadius = `${undoneAnnotate.rx}px`
                      stmp.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color
                      stmp.style.zIndex = 40
                      stmp.style.padding = '0px'
                      stmp.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      stmp.style.setProperty('--required-right', '-10px')
                      stmp.style.setProperty('--required-top', '-10px')
                      stmp.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )
                      stmp.style.display = 'flex'
                      stmp.style.alignItems = 'center'
                      stmp.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        stmp.style.outline = '2px dotted red'
                      }
                      stmp.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(self.i18n.stamp)
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="v-icon notranslate mdi mdi-stamper theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      stmp.appendChild(p)
                      if (!isAnnotateDisabled) {
                        stmp.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateStamp', {
                            source: self,
                            annotateStamp: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                              type: undoneAnnotate.type,
                            },
                            mode: 0,
                          })
                        })
                      }
                      stmp.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.stamp
                        } - ${
                          undoneAnnotate.required
                            ? self.i18n.required
                            : self.i18n.optional
                        }`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      stmp.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(stmp)
                      self.addElements.push(stmp)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      stampImage.addEventListener('mouseup', function (e) {
                        setTimeout(() => {
                          dropDown.classList.toggle('dropdownOpen')
                          dropDown.style.top =
                            element.y + element.height + 10 + 'px'
                          dropDown.style.left = element.x + 'px'
                          stampImage.style.border =
                            '2px solid rgba(0, 150, 199, 0.6)'
                          const mouseup = function (e) {
                            const dropdowns =
                              document.getElementsByClassName(
                                'dropdown-content'
                              )
                            for (let i = 0; i < dropdowns.length; i++) {
                              const openDropdown = dropdowns[i]
                              if (
                                openDropdown.classList.contains('dropdownOpen')
                              ) {
                                openDropdown.classList.remove('dropdownOpen')
                                stampImage.style.removeProperty('border')
                              }
                            }
                            document.removeEventListener('mouseup', mouseup)
                          }
                          document.addEventListener('mouseup', mouseup)
                        }, 0)
                      })
                    }
                    this.canvasWrapper.appendChild(stampImage)
                    this.addElements.push(stampImage)
                  }
                  break
                case 4: {
                  let y = ''
                  let m = ''
                  let d = ''
                  const rocNumber = [
                    '零',
                    '壹',
                    '貳',
                    '參',
                    '肆',
                    '伍',
                    '陸',
                    '柒',
                    '捌',
                    '玖',
                  ]
                  if (element.text) {
                    if (element.dateEra === 'roc') {
                      y = (
                        moment(element.text).format('YYYY') - 1911
                      ).toString()
                      m = moment(element.text).format('MM')
                      d = moment(element.text).format('DD')
                      if (
                        element.textDirection ||
                        element.width < element.height
                      ) {
                        y = Number(y)
                          .toString()
                          .split('')
                          .map((char) => rocNumber[char])
                        m = Number(m)
                          .toString()
                          .split('')
                          .map((char) => rocNumber[char])
                        d = Number(d)
                          .toString()
                          .split('')
                          .map((char) => rocNumber[char])
                      }
                    }
                  }
                  element.dateRange = element.dateRange ?? 'signDay'
                  if (element.text && element.readonly) {
                    element.dateEra = element.dateEra ?? 'common'
                    element.data = element.text
                    switch (element.dateEra) {
                      case 'common':
                      default:
                        text = moment(element.data).format(
                          element.dateFormat ?? 'YYYY/MM/DD'
                        )
                        break
                      case 'roc':
                        text =
                          element.textDirection ||
                          element.width < element.height
                            ? `${this.i18n.rocEra}${y.join('')}年${m.join(
                                ''
                              )}月${d.join('')}日`
                            : `${this.i18n.rocEra}${y}年${m}月${d}日`
                        text = element.dateFormat.includes('中華民國')
                          ? text
                          : text.replace(this.i18n.rocEra, '')
                        break
                    }
                    element.done = true
                    date = document.createElement('div')
                    date.id = `date${element.objectId}_${this.pageNumber}`
                    date.style.position = 'absolute'
                    date.style.left = element.x + 'px'
                    date.style.top = element.y + 'px'
                    date.style.width = element.width + 'px'
                    date.style.height = element.height + 2 + 'px'
                    fontWeight = element.fontWeight || 'normal'
                    date.style.font = `${fontWeight} ${
                      element.fontSize * element.scale
                    }px ${element.fontFamily}`
                    date.style.fontStyle = element.fontStyle
                    date.style.color = element.textColor || 'rgba(0,0,0,1)'
                    date.style.zIndex = 40
                    date.style.padding = '0px'
                    date.style.userSelect = 'none'
                    p = document.createElement('p')
                    p.style.font = `${fontWeight} ${element.fontSize}px ${element.fontFamily}`
                    p.style.fontStyle = element.fontStyle
                    p.style.color = element.textColor || 'rgba(0,0,0,1)'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'left top'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML = text
                    date.appendChild(p)
                    this.canvasWrapper.appendChild(date)
                    this.addElements.push(date)
                  } else {
                    if (element.text) {
                      element.dateEra = element.dateEra ?? 'common'
                      element.data = element.text
                    }
                    changeEvent = (e) => {
                      const obj = document.getElementById(
                        `dateText${element.objectId}_${self.pageNumber}`
                      )
                      if (e.data) {
                        element.done = true
                        if (
                          self.checkAnnotate === true &&
                          self.showOutline === true
                        ) {
                          obj.style.removeProperty('outline')
                        }
                        element.data = e.data
                      } else {
                        element.done = false
                        if (
                          self.checkAnnotate === true &&
                          self.showOutline === true
                        ) {
                          obj.style.setProperty('outline', '2px dotted red')
                        }
                        element.data = ''
                      }
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                    }
                    element.dateEra = element.dateEra ?? 'common'
                    switch (element.dateRange) {
                      case 'none':
                        self.eventBus.dispatch('createDatePicker', {
                          parent: this.canvasWrapper,
                          props: {
                            value: element.data ?? '',
                            width: element.width + 4 + 'px',
                            height: element.height + 2 + 'px',
                            left: element.x + 'px',
                            top: element.y + 'px',
                            type: 'none',
                            objectId: element.objectId,
                            pageNumber: self.pageNumber,
                            scale: element.scale,
                            fontSize: element.fontSize * element.scale,
                            fontFamily: element.fontFamily,
                            fontStyle: element.fontStyle,
                            fontWeight: element.fontWeight,
                            dateFormat: element.dateFormat,
                            dateEra: element.dateEra,
                            disabled: isAnnotateDisabled,
                            i18n: this.i18n,
                            label: element.label,
                            required: element.required,
                            tooltip,
                            canvasWidth,
                            canvasHeight,
                            isAnnotateDisabled,
                            textColor: element.textColor || 'rgba(0,0,0,1)',
                            textDirection:
                              element.textDirection ||
                              element.width < element.height,
                          },
                          changeEvent,
                        })
                        break
                      case 'beforeSignDay':
                        self.eventBus.dispatch('createDatePicker', {
                          parent: this.canvasWrapper,
                          props: {
                            value: element.data ?? '',
                            width: element.width + 4 + 'px',
                            height: element.height + 2 + 'px',
                            left: element.x + 'px',
                            top: element.y + 'px',
                            type: 'beforeSignDay',
                            objectId: element.objectId,
                            pageNumber: self.pageNumber,
                            scale: element.scale,
                            fontSize: element.fontSize * element.scale,
                            fontFamily: element.fontFamily,
                            fontStyle: element.fontStyle,
                            fontWeight: element.fontWeight,
                            dateFormat: element.dateFormat,
                            dateEra: element.dateEra,
                            disabled: isAnnotateDisabled,
                            i18n: this.i18n,
                            label: element.label,
                            required: element.required,
                            tooltip,
                            canvasWidth,
                            canvasHeight,
                            isAnnotateDisabled,
                            textColor: element.textColor || 'rgba(0,0,0,1)',
                            textDirection:
                              element.textDirection ||
                              element.width < element.height,
                          },
                          changeEvent,
                        })
                        break
                      case 'afterSignDay':
                        self.eventBus.dispatch('createDatePicker', {
                          parent: this.canvasWrapper,
                          props: {
                            value: element.data ?? '',
                            width: element.width + 4 + 'px',
                            height: element.height + 2 + 'px',
                            left: element.x + 'px',
                            top: element.y + 'px',
                            type: 'afterSignDay',
                            objectId: element.objectId,
                            pageNumber: self.pageNumber,
                            scale: element.scale,
                            fontSize: element.fontSize * element.scale,
                            fontFamily: element.fontFamily,
                            fontStyle: element.fontStyle,
                            fontWeight: element.fontWeight,
                            dateFormat: element.dateFormat,
                            dateEra: element.dateEra,
                            disabled: isAnnotateDisabled,
                            i18n: this.i18n,
                            label: element.label,
                            required: element.required,
                            tooltip,
                            canvasWidth,
                            canvasHeight,
                            isAnnotateDisabled,
                            textColor: element.textColor || 'rgba(0,0,0,1)',
                            textDirection:
                              element.textDirection ||
                              element.width < element.height,
                          },
                          changeEvent,
                        })
                        break
                      case 'signDay':
                        element.data = moment().format()
                        switch (element.dateEra) {
                          case 'common':
                          default:
                            text = moment(element.data).format(
                              element.dateFormat ?? 'YYYY/MM/DD'
                            )
                            break
                          case 'roc':
                            y = (
                              moment(element.data).format('YYYY') - 1911
                            ).toString()
                            m = moment(element.data).format('MM')
                            d = moment(element.data).format('DD')
                            if (
                              element.textDirection ||
                              element.width < element.height
                            ) {
                              y = Number(y)
                                .toString()
                                .split('')
                                .map((char) => rocNumber[char])
                              m = Number(m)
                                .toString()
                                .split('')
                                .map((char) => rocNumber[char])
                              d = Number(d)
                                .toString()
                                .split('')
                                .map((char) => rocNumber[char])
                            }
                            text =
                              element.textDirection ||
                              element.width < element.height
                                ? `${this.i18n.rocEra}${y.join('')}年${m.join(
                                    ''
                                  )}月${d.join('')}日`
                                : `${this.i18n.rocEra}${y}年${m}月${d}日`
                            text = element.dateFormat.includes('中華民國')
                              ? text
                              : text.replace(this.i18n.rocEra, '')
                            break
                        }
                        element.done = true
                        date = document.createElement('div')
                        date.id = `date${element.objectId}_${this.pageNumber}`
                        date.style.position = 'absolute'
                        date.style.left = element.x + 'px'
                        date.style.top = element.y + 'px'
                        date.style.width = element.width + 'px'
                        date.style.height = element.height + 2 + 'px'
                        fontWeight = element.fontWeight || 'normal'
                        date.style.font = `${fontWeight} ${
                          element.fontSize * element.scale
                        }px ${element.fontFamily}`
                        date.style.fontStyle = element.fontStyle
                        date.style.color = element.textColor || 'rgba(0,0,0,1)'
                        date.style.zIndex = 40
                        date.style.padding = '0px'
                        date.style.userSelect = 'none'
                        p = document.createElement('p')
                        p.style.font = `${fontWeight} ${element.fontSize}px ${element.fontFamily}`
                        p.style.fontStyle = element.fontStyle
                        p.style.color = element.textColor || 'rgba(0,0,0,1)'
                        p.style.position = 'relative'
                        p.style.display = 'flex'
                        p.style.marginBottom = '0px'
                        p.style.transform = `scale(${element.scale})`
                        p.style.transformOrigin = 'left top'
                        p.style.minWidth = `${100 / element.scale}%`
                        p.style.minHeight = `${100 / element.scale}%`
                        p.style.writingMode =
                          element.textDirection ||
                          element.width < element.height
                            ? 'vertical-lr'
                            : 'horizontal-tb'
                        p.innerHTML = text
                        date.appendChild(p)
                        this.canvasWrapper.appendChild(date)
                        this.addElements.push(date)
                        break
                    }
                  }
                  break
                }
                case 5:
                  label = document.createElement('label')
                  label.id = `radioContainer${element.objectId}_${this.pageNumber}`
                  label.className = 'radioContainer'
                  label.style.position = 'absolute'
                  label.style.left = element.x + 'px'
                  label.style.top = element.y + 'px'
                  label.style.width = element.width + 'px'
                  label.style.height = element.height + 'px'
                  label.style.zIndex = 40
                  radio = document.createElement('input')
                  radio.type = 'radio'
                  radio.checked = element.selected
                  radio.disabled =
                    annotate.data.find(
                      (y) =>
                        y.groupId === element.groupId &&
                        y.type === 5 &&
                        y.readonly === true
                    ) || isAnnotateDisabled
                  radio.id = `radio${element.objectId}_${this.pageNumber}`
                  radio.name = `radio${element.groupId}_${this.pageNumber}`
                  radio.style.left = '0px'
                  radio.style.top = '0px'
                  radio.style.width = element.width + 'px'
                  radio.style.height = element.height + 'px'
                  radio.style.zIndex = 40
                  radiomarkContainer = document.createElement('div')
                  radiomarkContainer.id = `radiomarkContainer${element.objectId}_${this.pageNumber}`
                  radiomarkContainer.className = 'radiomarkContainer'
                  radiomark = document.createElement('div')
                  radiomark.className = 'radiomark'
                  radiomarkContainer.appendChild(radiomark)
                  radiomarkContainer.style.backgroundColor = this
                    .useDefaultColor
                    ? this.defaultBGC
                    : element.color

                  radiomarkContainer.style.borderRadius = '2px'
                  radiomarkContainer.style.border = `2px solid ${
                    this.useDefaultColor
                      ? this.defaultBorderColor
                      : element.stroke
                  }`
                  radiomarkContainer.style.transform = `scale(${
                    element.width / 30
                  })`
                  radiomarkContainer.style.transformOrigin = 'left top'
                  label.appendChild(radio)
                  label.appendChild(radiomarkContainer)
                  if (
                    element.groupId !== null &&
                    element.groupId !== undefined &&
                    (this.radioGroup.find((x) => x.id === element.groupId) ===
                      null ||
                      this.radioGroup.find((x) => x.id === element.groupId) ===
                        undefined)
                  ) {
                    const groupId = element.groupId
                    const children = annotate.data.filter(
                      (y) => y.groupId === groupId && y.type === 5
                    )
                    const radioGroupContainer = document.createElement('div')
                    radioGroupContainer.id = `radioGroupContainer${groupId}_${this.pageNumber}`
                    radioGroupContainer.classList.add('required')
                    radioGroupContainer.style.position = 'absolute'
                    radioGroupContainer.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    radioGroupContainer.style.top =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    radioGroupContainer.style.display = 'flex'
                    radioGroupContainer.style.flexDirection = 'column'
                    radioGroupContainer.style.alignItems = 'center'
                    radioGroupContainer.style.zIndex = '40'
                    const radioGroupDiv = document.createElement('div')
                    radioGroupDiv.id = `radioGroupDiv_${groupId}`
                    radioGroupDiv.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.border = '2px dashed #3183c8c2'
                    radioGroupDiv.style.zIndex = 20
                    radioGroupDiv.style.borderRadius = '2px'
                    radioGroupContainer.appendChild(radioGroupDiv)
                    let groupTooltip = null
                    if (element.groupLabel && element.groupLabel !== '') {
                      groupTooltip = document.createElement('div')
                      groupTooltip.className = 'tooltip'
                      groupTooltip.id = `radioGroupTooltip${groupId}_${this.pageNumber}`
                      const groupLabel =
                        element.groupLabel.length > 40
                          ? element.groupLabel.substring(0, 40) + '...'
                          : element.groupLabel
                      groupTooltip.innerHTML = `${groupLabel}`
                      groupTooltip.style.top =
                        Math.min(
                          parseFloat(radioGroupContainer.style.top) +
                            parseFloat(radioGroupDiv.style.height) / 2,
                          canvasHeight - 100
                        ) + 'px'
                      groupTooltip.style.left =
                        Math.min(
                          parseFloat(radioGroupContainer.style.left) +
                            parseFloat(radioGroupDiv.style.width) +
                            10,
                          canvasWidth - 150
                        ) + 'px'
                      groupTooltip.style.zIndex = 40
                      groupTooltip.style.display = 'none'
                      self.canvasWrapper.appendChild(groupTooltip)
                      self.addElements.push(groupTooltip)
                    }
                    self.canvasWrapper.appendChild(radioGroupContainer)
                    self.addElements.push(radioGroupContainer)
                    self.radioGroup.push({
                      id: groupId,
                      container: radioGroupContainer,
                      groupDiv: radioGroupDiv,
                      groupTooltip,
                      items: children.map((x) => x.objectId),
                    })
                  }
                  radio.addEventListener('change', function (e) {
                    const obj = e.target
                    const pageNumber = +obj.id.split('_')[1]
                    const objectId = +obj.id.split('_')[0].replace('radio', '')
                    const annotate = self.annotate
                      .find((x) => x.page === pageNumber)
                      .data.find((y) => y.objectId === objectId)
                    annotate.selected = obj.checked
                    const children = self.annotate
                      .find((x) => x.page === pageNumber)
                      .data.filter(
                        (y) =>
                          y.groupId === annotate.groupId &&
                          y.type === 5 &&
                          y.objectId !== objectId
                      )
                    children.forEach((child) => {
                      child.selected = false
                    })
                    // wait DOM rendered
                    setTimeout(() => {
                      if (self.mode === 1) {
                        self.eventBus.dispatch('checkAnnotateChanged', {
                          source: self,
                          showOutline: self.showOutline,
                        })
                      }
                      self.eventBus.dispatch('notifyAnnotateChanged')
                    }, 0)
                  })
                  radio.addEventListener('mouseover', function (e) {
                    const obj = e.target
                    const pageNumber = +obj.id.split('_')[1]
                    const objectId = +obj.id.split('_')[0].replace('radio', '')
                    const annotate = self.annotate
                      .find((x) => x.page === pageNumber)
                      .data.find((y) => y.objectId === objectId)
                    const label =
                      element.label && element.label !== ''
                        ? element.label.length > 40
                          ? element.label.substring(0, 40) + '...'
                          : element.label
                        : self.i18n.radioBtn
                    tooltip.innerHTML = `${label} - ${
                      element.required ? self.i18n.required : self.i18n.optional
                    }`
                    tooltip.style.display = 'block'
                    tooltip.style.top =
                      element.y - tooltip.clientHeight - 10 <= 0
                        ? element.y + element.height + 10 + 'px'
                        : Math.min(
                            element.y - tooltip.clientHeight - 10,
                            canvasHeight - 100
                          ) + 'px'
                    tooltip.style.left =
                      Math.min(
                        element.x + element.width / 5,
                        canvasWidth - 150
                      ) + 'px'
                    if (
                      annotate.groupId !== null &&
                      annotate.groupId !== undefined &&
                      annotate.type === 5
                    ) {
                      const radioGroup = self.radioGroup
                      radioGroup.forEach((element) => {
                        if (
                          element &&
                          element.container &&
                          element.id === annotate.groupId
                        ) {
                          element.container.style.display = 'flex'
                          if (element.groupTooltip) {
                            element.groupTooltip.style.display = 'flex'
                          }
                        }
                      })
                    }
                  })
                  radio.addEventListener('mouseout', function (e) {
                    const obj = e.target
                    const pageNumber = +obj.id.split('_')[1]
                    const objectId = +obj.id.split('_')[0].replace('radio', '')
                    const annotate = self.annotate
                      .find((x) => x.page === pageNumber)
                      .data.find((y) => y.objectId === objectId)
                    tooltip.style.top = 0
                    tooltip.style.left = 0
                    tooltip.style.display = 'none'
                    if (
                      annotate.groupId !== null &&
                      annotate.groupId !== undefined &&
                      annotate.type === 5
                    ) {
                      const radioGroup = self.radioGroup
                      radioGroup.forEach((element) => {
                        if (
                          element &&
                          element.container &&
                          element.id === annotate.groupId
                        ) {
                          element.container.style.display = 'flex'
                          if (element.groupTooltip) {
                            element.groupTooltip.style.display = 'none'
                          }
                        }
                      })
                    }
                  })
                  this.canvasWrapper.appendChild(label)
                  this.addElements.push(label)
                  break
                case 6:
                  if (element.options && element.options.length > 0) {
                    const div = document.createElement('div')
                    const select = document.createElement('select')
                    div.appendChild(select)
                    select.disabled = element.readonly || isAnnotateDisabled
                    select.id = `dropdown${element.objectId}_${this.pageNumber}`
                    select.className = 'dropdown'
                    if (element.required) {
                      div.classList.add('required')
                    } else {
                      div.classList.remove('required')
                    }
                    div.style.position = 'absolute'
                    div.style.left = element.x + 'px'
                    div.style.top = element.y + 'px'
                    div.style.width = element.width + 'px'
                    div.style.maxWidth = element.width + 'px'
                    select.style.textOverflow = 'ellipsis'
                    select.style.width = '100%'
                    select.style.height = '100%'
                    div.style.height = element.height + 2 + 'px'
                    fontWeight = element.fontWeight || 'normal'
                    select.style.font = `${fontWeight} ${
                      element.fontSize * element.scale
                    }px ${element.fontFamily}`
                    select.style.fontStyle = element.fontStyle
                    select.style.color = element.textColor || 'rgba(0,0,0,1)'
                    div.style.zIndex = 40
                    div.style.padding = '0px'
                    this.canvasWrapper.appendChild(div)
                    this.addElements.push(div)
                    element.options.forEach((item) => {
                      const option = document.createElement('option')
                      option.className = 'text-body-1 text-truncate'
                      option.value = item.id
                      option.text = item.name
                      select.appendChild(option)
                    })
                    select.value = element.selectOptionId
                    select.addEventListener('change', function (e) {
                      const obj = e.target
                      const pageNumber = +obj.id.split('_')[1]
                      const objectId = +obj.id
                        .split('_')[0]
                        .replace('dropdown', '')
                      const annotate = self.annotate
                        .find((x) => x.page === pageNumber)
                        .data.find((y) => y.objectId === objectId)
                      annotate.selectOptionId = +obj.value
                      if (
                        obj.value !== null &&
                        obj.value !== undefined &&
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        obj.style.removeProperty('outline')
                      } else if (
                        (obj.value === null || obj.value === undefined) &&
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        obj.style.setProperty('outline', '2px dotted red')
                      }
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                    })
                    select.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.dropdown
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    select.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                  }
                  break
                case 7:
                  attachment = document.createElement('button')
                  attachment.id = `attachment${element.objectId}_${this.pageNumber}`
                  if (element.required) {
                    attachment.classList.add('required')
                  } else {
                    attachment.classList.remove('required')
                  }
                  attachment.style.position = 'absolute'
                  attachment.style.left = element.x + 'px'
                  attachment.style.top = element.y + 'px'
                  attachment.style.width = element.width + 'px'
                  attachment.style.height = element.height + 'px'
                  attachment.style.borderRadius = `${element.rx}px`
                  attachment.style.backgroundColor = element.done
                    ? 'rgba(0, 0, 0, 0.1)'
                    : this.useDefaultColor
                    ? this.defaultBGC
                    : element.color
                  attachment.style.zIndex = 40
                  attachment.style.padding = '0px'
                  attachment.style.border = `${element.strokeWidth}px solid ${
                    element.done
                      ? 'rgba(0, 0, 0, 0.4)'
                      : this.useDefaultColor
                      ? this.defaultBorderColor
                      : element.stroke
                  }`
                  attachment.style.opacity = element.done ? 0.5 : 1
                  attachment.style.display = 'flex'
                  attachment.style.alignItems = 'center'
                  attachment.style.justifyContent = 'center'
                  attachment.disabled = isAnnotateDisabled
                  p = document.createElement('p')
                  textNode = document.createTextNode(self.i18n.attachment)
                  p.style.fontSize = '16px'
                  p.style.fontFamily = 'Microsoft JhengHei'
                  p.style.fontWeight = 'bold'
                  p.style.position = 'relative'
                  p.style.display = 'flex'
                  p.style.alignItems = 'center'
                  p.style.justifyContent = 'center'
                  p.style.textAlign = 'center'
                  p.style.marginBottom = '0px'
                  p.style.transform = `scale(${element.scale})`
                  p.style.transformOrigin = 'center center'
                  p.style.minWidth = `${100 / element.scale}%`
                  p.style.minHeight = `${100 / element.scale}%`
                  p.innerHTML =
                    '<i class="v-icon notranslate mdi mdi-paperclip theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                  p.appendChild(textNode)
                  attachment.appendChild(p)
                  if (!isAnnotateDisabled) {
                    attachment.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateAttachment', {
                        source: self,
                        annotateAttachment: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          data: element.done ? element.attachments : [],
                        },
                        mode: 0,
                      })
                    })
                  }
                  attachment.addEventListener('mouseover', function (e) {
                    tooltip.innerHTML = element.done
                      ? `${self.i18n.attachAdded} (${element.attachments[0].name})`
                      : `${
                          element.label ? element.label : self.i18n.attachment
                        } - ${
                          element.required
                            ? self.i18n.required
                            : self.i18n.optional
                        }`
                    tooltip.style.display = 'block'
                    tooltip.style.top =
                      element.y - tooltip.clientHeight - 10 <= 0
                        ? element.y + element.height + 10 + 'px'
                        : Math.min(
                            element.y - tooltip.clientHeight - 10,
                            canvasHeight - 100
                          ) + 'px'
                    tooltip.style.left =
                      Math.min(
                        element.x + element.width / 5,
                        canvasWidth - 150
                      ) + 'px'
                  })
                  attachment.addEventListener('mouseout', function (e) {
                    tooltip.style.top = 0
                    tooltip.style.left = 0
                    tooltip.style.display = 'none'
                  })
                  this.canvasWrapper.appendChild(attachment)
                  this.addElements.push(attachment)
                  break
                case 8:
                  if (!element.done) {
                    const imageField = document.createElement('button')
                    imageField.id = `imageField${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      imageField.classList.add('required')
                    } else {
                      imageField.classList.remove('required')
                    }
                    imageField.style.position = 'absolute'
                    imageField.style.left = element.x + 'px'
                    imageField.style.top = element.y + 'px'
                    imageField.style.width = element.width + 'px'
                    imageField.style.height = element.height + 'px'
                    imageField.style.borderRadius = `${element.rx}px`
                    imageField.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    imageField.style.zIndex = 40
                    imageField.style.padding = '0px'
                    imageField.style.border = `${element.strokeWidth}px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    imageField.style.display = 'flex'
                    imageField.style.alignItems = 'center'
                    imageField.style.justifyContent = 'center'
                    imageField.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.image)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="v-icon notranslate mdi mdi-image theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    imageField.appendChild(p)
                    if (!isAnnotateDisabled) {
                      imageField.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateImage', {
                          source: self,
                          annotateImage: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                          },
                          mode: 0,
                        })
                      })
                    }
                    imageField.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.image
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    imageField.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(imageField)
                    this.addElements.push(imageField)
                  } else {
                    const imageFieldImage = document.createElement('button')
                    imageFieldImage.id = `imageFieldImage${element.objectId}_${this.pageNumber}`
                    imageFieldImage.style.position = 'absolute'
                    imageFieldImage.style.left = element.x + 'px'
                    imageFieldImage.style.top = element.y + 'px'
                    imageFieldImage.style.width = element.width + 'px'
                    imageFieldImage.style.height = element.height + 'px'
                    imageFieldImage.style.borderRadius = `${element.rx}px`
                    imageFieldImage.style.zIndex = 40
                    imageFieldImage.style.padding = '0px'
                    imageFieldImage.style.display = 'none'
                    imageFieldImage.style.alignItems = 'center'
                    imageFieldImage.style.justifyContent = 'center'
                    imageFieldImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      imageFieldImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                      if (
                        element.imageWidth === undefined ||
                        element.imageHeight === undefined ||
                        element.imageX === undefined ||
                        element.imageY === undefined
                      ) {
                        element.imageWidth = i.width * scaleFactor
                        element.imageHeight = i.height * scaleFactor
                        element.imageX =
                          element.x +
                          Math.max(element.width - i.width * scaleFactor, 0) / 2
                        element.imageY =
                          element.y +
                          Math.max(element.height - i.height * scaleFactor, 0) /
                            2
                      }
                    }
                    i.src = element.data
                    imageFieldImage.appendChild(image)

                    imageFieldImage.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.image
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    imageFieldImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `imageFieldDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateImage', {
                        source: self,
                        annotateImage: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                        },
                        mode: 1,
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const oldImageFieldImage = document.getElementById(
                        `imageFieldImage${element.objectId}_${self.pageNumber}`
                      )
                      if (oldImageFieldImage) {
                        oldImageFieldImage.remove()
                      }
                      const img = document.createElement('button')
                      img.id = `imageField${undoneAnnotate.objectId}_${self.pageNumber}`
                      if (undoneAnnotate.required) {
                        img.classList.add('required')
                      } else {
                        img.classList.remove('required')
                      }
                      img.style.position = 'absolute'
                      img.style.left = undoneAnnotate.x + 'px'
                      img.style.top = undoneAnnotate.y + 'px'
                      img.style.width = undoneAnnotate.width + 'px'
                      img.style.height = undoneAnnotate.height + 'px'
                      img.style.borderRadius = `${undoneAnnotate.rx}px`
                      img.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color
                      img.style.zIndex = 40
                      img.style.padding = '0px'
                      img.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      img.style.setProperty('--required-right', '-10px')
                      img.style.setProperty('--required-top', '-10px')
                      img.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )
                      img.style.display = 'flex'
                      img.style.alignItems = 'center'
                      img.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        img.style.outline = '2px dotted red'
                      }
                      img.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(self.i18n.image)
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="v-icon notranslate mdi mdi-image theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      img.appendChild(p)
                      if (!isAnnotateDisabled) {
                        img.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateImage', {
                            source: self,
                            annotateImage: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                            },
                            mode: 0,
                          })
                        })
                      }
                      img.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.image
                        } - ${
                          undoneAnnotate.required
                            ? self.i18n.required
                            : self.i18n.optional
                        }`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      img.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(img)
                      self.addElements.push(img)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      imageFieldImage.addEventListener('mouseup', function (e) {
                        setTimeout(() => {
                          dropDown.classList.toggle('dropdownOpen')
                          dropDown.style.top =
                            element.y + element.height + 10 + 'px'
                          dropDown.style.left = element.x + 'px'
                          imageFieldImage.style.border =
                            '2px solid rgba(0, 150, 199, 0.6)'
                          const mouseup = function (e) {
                            const dropdowns =
                              document.getElementsByClassName(
                                'dropdown-content'
                              )
                            for (let i = 0; i < dropdowns.length; i++) {
                              const openDropdown = dropdowns[i]
                              if (
                                openDropdown.classList.contains('dropdownOpen')
                              ) {
                                openDropdown.classList.remove('dropdownOpen')
                                imageFieldImage.style.removeProperty('border')
                              }
                            }
                            document.removeEventListener('mouseup', mouseup)
                          }
                          document.addEventListener('mouseup', mouseup)
                        }, 0)
                      })
                    }
                    this.canvasWrapper.appendChild(imageFieldImage)
                    this.addElements.push(imageFieldImage)
                  }
                  break
                case 9:
                  if (!element.done) {
                    const signatureBP = document.createElement('button')
                    signatureBP.id = `signatureBP${element.objectId}_${this.pageNumber}`
                    signatureBP.classList.add('required')
                    signatureBP.style.position = 'absolute'
                    signatureBP.style.left = element.x + 'px'
                    signatureBP.style.top = element.y + 'px'
                    signatureBP.style.width = element.width + 'px'
                    signatureBP.style.height = element.height + 'px'
                    signatureBP.style.borderRadius = `${element.rx}px`
                    signatureBP.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    signatureBP.style.zIndex = 40
                    signatureBP.style.padding = '0px'
                    signatureBP.style.border = `${
                      element.strokeWidth
                    }px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    signatureBP.style.display = 'flex'
                    signatureBP.style.alignItems = 'center'
                    signatureBP.style.justifyContent = 'center'
                    signatureBP.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.signatureBP)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-signatureBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    signatureBP.appendChild(p)
                    if (!isAnnotateDisabled) {
                      signatureBP.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateSignature', {
                          source: self,
                          annotateSignature: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                            type: element.type,
                            textDirection: element.textDirection || false,
                          },
                        })
                      })
                    }
                    signatureBP.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.signatureBP
                      } - ${self.i18n.required}`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    signatureBP.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(signatureBP)
                    this.addElements.push(signatureBP)
                  } else {
                    const signatureBPImage = document.createElement('button')
                    signatureBPImage.id = `signatureBPImage${element.objectId}_${this.pageNumber}`
                    signatureBPImage.style.position = 'absolute'
                    signatureBPImage.style.left = element.x + 'px'
                    signatureBPImage.style.top = element.y + 'px'
                    signatureBPImage.style.width = element.width + 'px'
                    signatureBPImage.style.height = element.height + 'px'
                    signatureBPImage.style.borderRadius = `${element.rx}px`
                    signatureBPImage.style.zIndex = 40
                    signatureBPImage.style.padding = '0px'
                    signatureBPImage.style.display = 'none'
                    signatureBPImage.style.alignItems = 'center'
                    signatureBPImage.style.justifyContent = 'center'
                    signatureBPImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      signatureBPImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    signatureBPImage.appendChild(image)

                    signatureBPImage.addEventListener(
                      'mouseover',
                      function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.signatureBP
                        } - ${self.i18n.required}`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          element.y - tooltip.clientHeight - 10 <= 0
                            ? element.y + element.height + 10 + 'px'
                            : Math.min(
                                element.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            element.x + element.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      }
                    )
                    signatureBPImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `signatureDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateSignature', {
                        source: self,
                        annotateSignature: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                          textDirection: element.textDirection || false,
                        },
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const deleteSignatureImage = document.getElementById(
                        `signatureBPImage${element.objectId}_${self.pageNumber}`
                      )
                      if (deleteSignatureImage) {
                        deleteSignatureImage.remove()
                      }
                      const signatureBP = document.createElement('button')
                      signatureBP.id = `signatureBP${undoneAnnotate.objectId}_${self.pageNumber}`
                      signatureBP.classList.add('required')
                      signatureBP.style.position = 'absolute'
                      signatureBP.style.left = undoneAnnotate.x + 'px'
                      signatureBP.style.top = undoneAnnotate.y + 'px'
                      signatureBP.style.width = undoneAnnotate.width + 'px'
                      signatureBP.style.height = undoneAnnotate.height + 'px'
                      signatureBP.style.borderRadius = `${undoneAnnotate.rx}px`
                      signatureBP.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color
                      signatureBP.style.zIndex = 40
                      signatureBP.style.padding = '0px'
                      signatureBP.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      signatureBP.style.setProperty('--required-right', '-10px')
                      signatureBP.style.setProperty('--required-top', '-10px')
                      signatureBP.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )
                      signatureBP.style.display = 'flex'
                      signatureBP.style.alignItems = 'center'
                      signatureBP.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        signatureBP.style.outline = '2px dotted red'
                      }
                      signatureBP.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(
                        self.i18n.signatureBP
                      )
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="custom-icon icon-signatureBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      signatureBP.appendChild(p)
                      if (!isAnnotateDisabled) {
                        signatureBP.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateSignature', {
                            source: self,
                            annotateSignature: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                              type: undoneAnnotate.type,
                              textDirection: element.textDirection || false,
                            },
                          })
                        })
                      }
                      signatureBP.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.signatureBP
                        } - ${self.i18n.required}`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      signatureBP.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(signatureBP)
                      self.addElements.push(signatureBP)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      signatureBPImage.addEventListener(
                        'mouseup',
                        function (e) {
                          setTimeout(() => {
                            dropDown.classList.toggle('dropdownOpen')
                            dropDown.style.top =
                              element.y + element.height + 10 + 'px'
                            dropDown.style.left = element.x + 'px'
                            signatureBPImage.style.border =
                              '2px solid rgba(0, 150, 199, 0.6)'
                            const mouseup = function (e) {
                              const dropdowns =
                                document.getElementsByClassName(
                                  'dropdown-content'
                                )
                              for (let i = 0; i < dropdowns.length; i++) {
                                const openDropdown = dropdowns[i]
                                if (
                                  openDropdown.classList.contains(
                                    'dropdownOpen'
                                  )
                                ) {
                                  openDropdown.classList.remove('dropdownOpen')
                                  signatureBPImage.style.removeProperty(
                                    'border'
                                  )
                                }
                              }
                              document.removeEventListener('mouseup', mouseup)
                            }
                            document.addEventListener('mouseup', mouseup)
                          }, 0)
                        }
                      )
                    }
                    this.canvasWrapper.appendChild(signatureBPImage)
                    this.addElements.push(signatureBPImage)
                  }
                  break
                case 10:
                  if (!element.done) {
                    const signatureBO = document.createElement('button')
                    signatureBO.id = `signatureBO${element.objectId}_${this.pageNumber}`
                    signatureBO.classList.add('required')
                    signatureBO.style.position = 'absolute'
                    signatureBO.style.left = element.x + 'px'
                    signatureBO.style.top = element.y + 'px'
                    signatureBO.style.width = element.width + 'px'
                    signatureBO.style.height = element.height + 'px'
                    signatureBO.style.borderRadius = `${element.rx}px`
                    signatureBO.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    signatureBO.style.zIndex = 40
                    signatureBO.style.padding = '0px'
                    signatureBO.style.border = `${
                      element.strokeWidth
                    }px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    signatureBO.style.display = 'flex'
                    signatureBO.style.alignItems = 'center'
                    signatureBO.style.justifyContent = 'center'
                    signatureBO.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.signatureBO)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-signatureBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    signatureBO.appendChild(p)
                    if (!isAnnotateDisabled) {
                      signatureBO.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateSignature', {
                          source: self,
                          annotateSignature: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                            type: element.type,
                            textDirection: element.textDirection || false,
                          },
                        })
                      })
                    }
                    signatureBO.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.signatureBO
                      } - ${self.i18n.required}`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    signatureBO.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(signatureBO)
                    this.addElements.push(signatureBO)
                  } else {
                    const signatureBOImage = document.createElement('button')
                    signatureBOImage.id = `signatureBOImage${element.objectId}_${this.pageNumber}`
                    signatureBOImage.style.position = 'absolute'
                    signatureBOImage.style.left = element.x + 'px'
                    signatureBOImage.style.top = element.y + 'px'
                    signatureBOImage.style.width = element.width + 'px'
                    signatureBOImage.style.height = element.height + 'px'
                    signatureBOImage.style.borderRadius = `${element.rx}px`
                    signatureBOImage.style.zIndex = 40
                    signatureBOImage.style.padding = '0px'
                    signatureBOImage.style.display = 'none'
                    signatureBOImage.style.alignItems = 'center'
                    signatureBOImage.style.justifyContent = 'center'
                    signatureBOImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      signatureBOImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    signatureBOImage.appendChild(image)

                    signatureBOImage.addEventListener(
                      'mouseover',
                      function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.signatureBO
                        } - ${self.i18n.required}`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          element.y - tooltip.clientHeight - 10 <= 0
                            ? element.y + element.height + 10 + 'px'
                            : Math.min(
                                element.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            element.x + element.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      }
                    )
                    signatureBOImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `signatureDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateSignature', {
                        source: self,
                        annotateSignature: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                          textDirection: element.textDirection || false,
                        },
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const deleteSignatureImage = document.getElementById(
                        `signatureBOImage${element.objectId}_${self.pageNumber}`
                      )
                      if (deleteSignatureImage) {
                        deleteSignatureImage.remove()
                      }
                      const signatureBO = document.createElement('button')
                      signatureBO.id = `signatureBO${undoneAnnotate.objectId}_${self.pageNumber}`
                      signatureBO.classList.add('required')
                      signatureBO.style.position = 'absolute'
                      signatureBO.style.left = undoneAnnotate.x + 'px'
                      signatureBO.style.top = undoneAnnotate.y + 'px'
                      signatureBO.style.width = undoneAnnotate.width + 'px'
                      signatureBO.style.height = undoneAnnotate.height + 'px'
                      signatureBO.style.borderRadius = `${undoneAnnotate.rx}px`
                      signatureBO.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color

                      signatureBO.style.zIndex = 40
                      signatureBO.style.padding = '0px'
                      signatureBO.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      signatureBO.style.setProperty('--required-right', '-10px')
                      signatureBO.style.setProperty('--required-top', '-10px')
                      signatureBO.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )
                      signatureBO.style.display = 'flex'
                      signatureBO.style.alignItems = 'center'
                      signatureBO.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        signatureBO.style.outline = '2px dotted red'
                      }
                      signatureBO.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(
                        self.i18n.signatureBO
                      )
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="custom-icon icon-signatureBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      signatureBO.appendChild(p)
                      if (!isAnnotateDisabled) {
                        signatureBO.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateSignature', {
                            source: self,
                            annotateSignature: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                              type: undoneAnnotate.type,
                              textDirection: element.textDirection || false,
                            },
                          })
                        })
                      }
                      signatureBO.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.signatureBO
                        } - ${self.i18n.required}`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      signatureBO.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(signatureBO)
                      self.addElements.push(signatureBO)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      signatureBOImage.addEventListener(
                        'mouseup',
                        function (e) {
                          setTimeout(() => {
                            dropDown.classList.toggle('dropdownOpen')
                            dropDown.style.top =
                              element.y + element.height + 10 + 'px'
                            dropDown.style.left = element.x + 'px'
                            signatureBOImage.style.border =
                              '2px solid rgba(0, 150, 199, 0.6)'
                            const mouseup = function (e) {
                              const dropdowns =
                                document.getElementsByClassName(
                                  'dropdown-content'
                                )
                              for (let i = 0; i < dropdowns.length; i++) {
                                const openDropdown = dropdowns[i]
                                if (
                                  openDropdown.classList.contains(
                                    'dropdownOpen'
                                  )
                                ) {
                                  openDropdown.classList.remove('dropdownOpen')
                                  signatureBOImage.style.removeProperty(
                                    'border'
                                  )
                                }
                              }
                              document.removeEventListener('mouseup', mouseup)
                            }
                            document.addEventListener('mouseup', mouseup)
                          }, 0)
                        }
                      )
                    }
                    this.canvasWrapper.appendChild(signatureBOImage)
                    this.addElements.push(signatureBOImage)
                  }
                  break
                case 11:
                  if (!element.done) {
                    const stampBP = document.createElement('button')
                    stampBP.id = `stampBP${element.objectId}_${this.pageNumber}`
                    stampBP.classList.add('required')
                    stampBP.style.position = 'absolute'
                    stampBP.style.left = element.x + 'px'
                    stampBP.style.top = element.y + 'px'
                    stampBP.style.width = element.width + 'px'
                    stampBP.style.height = element.height + 'px'
                    stampBP.style.borderRadius = `${element.rx}px`
                    stampBP.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    stampBP.style.zIndex = 40
                    stampBP.style.padding = '0px'
                    stampBP.style.border = `${element.strokeWidth}px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    stampBP.style.display = 'flex'
                    stampBP.style.alignItems = 'center'
                    stampBP.style.justifyContent = 'center'
                    stampBP.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.stampBP)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-stampBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    stampBP.appendChild(p)
                    if (!isAnnotateDisabled) {
                      stampBP.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateStamp', {
                          source: self,
                          annotateStamp: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                            type: element.type,
                          },
                        })
                      })
                    }
                    stampBP.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.stampBP
                      } - ${self.i18n.required}`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stampBP.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(stampBP)
                    this.addElements.push(stampBP)
                  } else {
                    const stampBPImage = document.createElement('button')
                    stampBPImage.id = `stampBPImage${element.objectId}_${this.pageNumber}`
                    stampBPImage.style.position = 'absolute'
                    stampBPImage.style.left = element.x + 'px'
                    stampBPImage.style.top = element.y + 'px'
                    stampBPImage.style.width = element.width + 'px'
                    stampBPImage.style.height = element.height + 'px'
                    stampBPImage.style.borderRadius = `${element.rx}px`
                    stampBPImage.style.zIndex = 40
                    stampBPImage.style.padding = '0px'
                    stampBPImage.style.display = 'none'
                    stampBPImage.style.alignItems = 'center'
                    stampBPImage.style.justifyContent = 'center'
                    stampBPImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      stampBPImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    stampBPImage.appendChild(image)

                    stampBPImage.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.stampBP
                      } - ${self.i18n.required}`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stampBPImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `stampDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateStamp', {
                        source: self,
                        annotateStamp: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                        },
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const deleteStampImage = document.getElementById(
                        `stampBPImage${element.objectId}_${self.pageNumber}`
                      )
                      if (deleteStampImage) {
                        deleteStampImage.remove()
                      }
                      const stampBP = document.createElement('button')
                      stampBP.id = `stampBP${undoneAnnotate.objectId}_${self.pageNumber}`
                      stampBP.classList.add('required')
                      stampBP.style.position = 'absolute'
                      stampBP.style.left = undoneAnnotate.x + 'px'
                      stampBP.style.top = undoneAnnotate.y + 'px'
                      stampBP.style.width = undoneAnnotate.width + 'px'
                      stampBP.style.height = undoneAnnotate.height + 'px'
                      stampBP.style.borderRadius = `${undoneAnnotate.rx}px`
                      stampBP.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color
                      stampBP.style.zIndex = 40
                      stampBP.style.padding = '0px'
                      stampBP.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      stampBP.style.setProperty('--required-right', '-10px')
                      stampBP.style.setProperty('--required-top', '-10px')
                      stampBP.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )
                      stampBP.style.display = 'flex'
                      stampBP.style.alignItems = 'center'
                      stampBP.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        stampBP.style.outline = '2px dotted red'
                      }
                      stampBP.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(self.i18n.stampBP)
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="custom-icon icon-stampBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      stampBP.appendChild(p)
                      if (!isAnnotateDisabled) {
                        stampBP.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateStamp', {
                            source: self,
                            annotateStamp: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                              type: undoneAnnotate.type,
                            },
                          })
                        })
                      }
                      stampBP.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.stampBP
                        } - ${self.i18n.required}`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      stampBP.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(stampBP)
                      self.addElements.push(stampBP)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      stampBPImage.addEventListener('mouseup', function (e) {
                        setTimeout(() => {
                          dropDown.classList.toggle('dropdownOpen')
                          dropDown.style.top =
                            element.y + element.height + 10 + 'px'
                          dropDown.style.left = element.x + 'px'
                          stampBPImage.style.border =
                            '2px solid rgba(0, 150, 199, 0.6)'
                          const mouseup = function (e) {
                            const dropdowns =
                              document.getElementsByClassName(
                                'dropdown-content'
                              )
                            for (let i = 0; i < dropdowns.length; i++) {
                              const openDropdown = dropdowns[i]
                              if (
                                openDropdown.classList.contains('dropdownOpen')
                              ) {
                                openDropdown.classList.remove('dropdownOpen')
                                stampBPImage.style.removeProperty('border')
                              }
                            }
                            document.removeEventListener('mouseup', mouseup)
                          }
                          document.addEventListener('mouseup', mouseup)
                        }, 0)
                      })
                    }
                    this.canvasWrapper.appendChild(stampBPImage)
                    this.addElements.push(stampBPImage)
                  }
                  break
                case 12:
                  if (!element.done) {
                    const stampBO = document.createElement('button')
                    stampBO.id = `stampBO${element.objectId}_${this.pageNumber}`
                    stampBO.classList.add('required')
                    stampBO.style.position = 'absolute'
                    stampBO.style.left = element.x + 'px'
                    stampBO.style.top = element.y + 'px'
                    stampBO.style.width = element.width + 'px'
                    stampBO.style.height = element.height + 'px'
                    stampBO.style.borderRadius = `${element.rx}px`
                    stampBO.style.backgroundColor = this.useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    stampBO.style.zIndex = 40
                    stampBO.style.padding = '0px'
                    stampBO.style.border = `${element.strokeWidth}px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    stampBO.style.display = 'flex'
                    stampBO.style.alignItems = 'center'
                    stampBO.style.justifyContent = 'center'
                    stampBO.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.stampBO)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-stampBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    stampBO.appendChild(p)
                    if (!isAnnotateDisabled) {
                      stampBO.addEventListener('mouseup', function (e) {
                        self.eventBus.dispatch('setAnnotateStamp', {
                          source: self,
                          annotateStamp: {
                            page: self.pageNumber,
                            width: element.width,
                            height: element.height,
                            top: element.y,
                            left: element.x,
                            id: element.objectId,
                            scale: element.scale,
                            type: element.type,
                          },
                        })
                      })
                    }
                    stampBO.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.stampBO
                      } - ${self.i18n.required}`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stampBO.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })
                    this.canvasWrapper.appendChild(stampBO)
                    this.addElements.push(stampBO)
                  } else {
                    const stampBOImage = document.createElement('button')
                    stampBOImage.id = `stampBOImage${element.objectId}_${this.pageNumber}`
                    stampBOImage.style.position = 'absolute'
                    stampBOImage.style.left = element.x + 'px'
                    stampBOImage.style.top = element.y + 'px'
                    stampBOImage.style.width = element.width + 'px'
                    stampBOImage.style.height = element.height + 'px'
                    stampBOImage.style.borderRadius = `${element.rx}px`
                    stampBOImage.style.zIndex = 40
                    stampBOImage.style.padding = '0px'
                    stampBOImage.style.display = 'none'
                    stampBOImage.style.alignItems = 'center'
                    stampBOImage.style.justifyContent = 'center'
                    stampBOImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      stampBOImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    stampBOImage.appendChild(image)

                    stampBOImage.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label ? element.label : self.i18n.stampBO
                      } - ${self.i18n.required}`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stampBOImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `stampDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateStamp', {
                        source: self,
                        annotateStamp: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                        },
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const deleteStampImage = document.getElementById(
                        `stampBOImage${element.objectId}_${self.pageNumber}`
                      )
                      if (deleteStampImage) {
                        deleteStampImage.remove()
                      }
                      const stampBO = document.createElement('button')
                      stampBO.id = `stampBO${undoneAnnotate.objectId}_${self.pageNumber}`
                      stampBO.classList.add('required')
                      stampBO.style.position = 'absolute'
                      stampBO.style.left = undoneAnnotate.x + 'px'
                      stampBO.style.top = undoneAnnotate.y + 'px'
                      stampBO.style.width = undoneAnnotate.width + 'px'
                      stampBO.style.height = undoneAnnotate.height + 'px'
                      stampBO.style.borderRadius = `${undoneAnnotate.rx}px`
                      stampBO.style.backgroundColor = self.useDefaultColor
                        ? self.defaultBGC
                        : undoneAnnotate.color
                      stampBO.style.zIndex = 40
                      stampBO.style.padding = '0px'
                      stampBO.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      stampBO.style.setProperty('--required-right', '-10px')
                      stampBO.style.setProperty('--required-top', '-10px')
                      stampBO.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )
                      stampBO.style.display = 'flex'
                      stampBO.style.alignItems = 'center'
                      stampBO.style.justifyContent = 'center'
                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        stampBO.style.outline = '2px dotted red'
                      }
                      stampBO.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(
                        self.i18n.signatureBO
                      )
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="custom-icon icon-stampBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      stampBO.appendChild(p)
                      if (!isAnnotateDisabled) {
                        stampBO.addEventListener('mouseup', function (e) {
                          self.eventBus.dispatch('setAnnotateStamp', {
                            source: self,
                            annotateStamp: {
                              page: self.pageNumber,
                              width: undoneAnnotate.width,
                              height: undoneAnnotate.height,
                              top: undoneAnnotate.y,
                              left: undoneAnnotate.x,
                              id: undoneAnnotate.objectId,
                              scale: undoneAnnotate.scale,
                              type: undoneAnnotate.type,
                            },
                          })
                        })
                      }
                      stampBO.addEventListener('mouseover', function (e) {
                        tooltip.innerHTML = `${
                          element.label ? element.label : self.i18n.stampBO
                        } - ${self.i18n.required}`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                            ? undoneAnnotate.y +
                              undoneAnnotate.height +
                              10 +
                              'px'
                            : Math.min(
                                undoneAnnotate.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            undoneAnnotate.x + undoneAnnotate.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      })
                      stampBO.addEventListener('mouseout', function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      })
                      self.canvasWrapper.appendChild(stampBO)
                      self.addElements.push(stampBO)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      stampBOImage.addEventListener('mouseup', function (e) {
                        setTimeout(() => {
                          dropDown.classList.toggle('dropdownOpen')
                          dropDown.style.top =
                            element.y + element.height + 10 + 'px'
                          dropDown.style.left = element.x + 'px'
                          stampBOImage.style.border =
                            '2px solid rgba(0, 150, 199, 0.6)'
                          const mouseup = function (e) {
                            const dropdowns =
                              document.getElementsByClassName(
                                'dropdown-content'
                              )
                            for (let i = 0; i < dropdowns.length; i++) {
                              const openDropdown = dropdowns[i]
                              if (
                                openDropdown.classList.contains('dropdownOpen')
                              ) {
                                openDropdown.classList.remove('dropdownOpen')
                                stampBOImage.style.removeProperty('border')
                              }
                            }
                            document.removeEventListener('mouseup', mouseup)
                          }
                          document.addEventListener('mouseup', mouseup)
                        }, 0)
                      })
                    }
                    this.canvasWrapper.appendChild(stampBOImage)
                    this.addElements.push(stampBOImage)
                  }
                  break
                case 13:
                  if (!element.done) {
                    const signatureAndStamp = document.createElement('button')
                    signatureAndStamp.id = `signatureAndStamp${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      signatureAndStamp.classList.add('required')
                    } else {
                      signatureAndStamp.classList.remove('required')
                    }
                    signatureAndStamp.style.position = 'absolute'
                    signatureAndStamp.style.left = element.x + 'px'
                    signatureAndStamp.style.top = element.y + 'px'
                    signatureAndStamp.style.width = element.width + 'px'
                    signatureAndStamp.style.height = element.height + 'px'
                    signatureAndStamp.style.borderRadius = `${element.rx}px`
                    signatureAndStamp.style.backgroundColor = this
                      .useDefaultColor
                      ? this.defaultBGC
                      : element.color

                    signatureAndStamp.style.zIndex = 40
                    signatureAndStamp.style.padding = '0px'
                    signatureAndStamp.style.border = `${
                      element.strokeWidth
                    }px solid ${
                      this.useDefaultColor
                        ? this.defaultBorderColor
                        : element.stroke
                    }`
                    signatureAndStamp.style.display = 'flex'
                    signatureAndStamp.style.alignItems = 'center'
                    signatureAndStamp.style.justifyContent = 'center'
                    signatureAndStamp.disabled = isAnnotateDisabled
                    const p = document.createElement('p')
                    const text = document.createTextNode(
                      self.i18n.signatureAndStamp
                    )
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.style.writingMode = element.textDirection
                      ? 'vertical-lr'
                      : 'horizontal-tb'
                    p.innerHTML = `<i class="custom-icon icon-signatureAndStamp" aria-hidden="true" style="${
                      element.textDirection
                        ? 'margin-bottom: 8px;'
                        : 'margin-right: 8px;'
                    } font-size: 16px;"></i>`
                    p.appendChild(text)
                    signatureAndStamp.appendChild(p)
                    if (!isAnnotateDisabled) {
                      signatureAndStamp.addEventListener(
                        'mouseup',
                        function (e) {
                          self.eventBus.dispatch(
                            'setAnnotateSignatureAndStamp',
                            {
                              source: self,
                              annotateSignatureAndStamp: {
                                page: self.pageNumber,
                                width: element.width,
                                height: element.height,
                                top: element.y,
                                left: element.x,
                                id: element.objectId,
                                scale: element.scale,
                                type: element.type,
                                textDirection: element.textDirection || false,
                              },
                              mode: 0,
                            }
                          )
                        }
                      )
                    }
                    signatureAndStamp.addEventListener(
                      'mouseover',
                      function (e) {
                        tooltip.innerHTML = `${
                          element.label
                            ? element.label
                            : self.i18n.signatureAndStamp
                        } - ${
                          element.required
                            ? self.i18n.required
                            : self.i18n.optional
                        }`
                        tooltip.style.display = 'block'
                        tooltip.style.top =
                          element.y - tooltip.clientHeight - 10 <= 0
                            ? element.y + element.height + 10 + 'px'
                            : Math.min(
                                element.y - tooltip.clientHeight - 10,
                                canvasHeight - 100
                              ) + 'px'
                        tooltip.style.left =
                          Math.min(
                            element.x + element.width / 5,
                            canvasWidth - 150
                          ) + 'px'
                      }
                    )
                    signatureAndStamp.addEventListener(
                      'mouseout',
                      function (e) {
                        tooltip.style.top = 0
                        tooltip.style.left = 0
                        tooltip.style.display = 'none'
                      }
                    )
                    this.canvasWrapper.appendChild(signatureAndStamp)
                    this.addElements.push(signatureAndStamp)
                  } else {
                    const stampImage = document.createElement('button')
                    stampImage.id = `signatureAndStampImage${element.objectId}_${this.pageNumber}`
                    stampImage.style.position = 'absolute'
                    stampImage.style.left = element.x + 'px'
                    stampImage.style.top = element.y + 'px'
                    stampImage.style.width = element.width + 'px'
                    stampImage.style.height = element.height + 'px'
                    stampImage.style.borderRadius = `${element.rx}px`
                    stampImage.style.zIndex = 40
                    stampImage.style.padding = '0px'
                    stampImage.style.display = 'none'
                    stampImage.style.alignItems = 'center'
                    stampImage.style.justifyContent = 'center'
                    stampImage.disabled = isAnnotateDisabled
                    const image = document.createElement('img')
                    image.src = element.data
                    image.style.position = 'relative'
                    image.style.display = 'none'
                    image.style.alignItems = 'center'
                    image.style.justifyContent = 'center'
                    const i = new Image()
                    i.onload = function () {
                      const scaleFactor = Math.min(
                        Math.min(1, element.width / i.width),
                        Math.min(1, element.height / i.height)
                      )
                      stampImage.style.display = 'flex'
                      image.style.display = 'flex'
                      image.width = i.width * scaleFactor
                      image.height = i.height * scaleFactor
                    }
                    i.src = element.data
                    stampImage.appendChild(image)

                    stampImage.addEventListener('mouseover', function (e) {
                      tooltip.innerHTML = `${
                        element.label
                          ? element.label
                          : self.i18n.signatureAndStamp
                      } - ${
                        element.required
                          ? self.i18n.required
                          : self.i18n.optional
                      }`
                      tooltip.style.display = 'block'
                      tooltip.style.top =
                        element.y - tooltip.clientHeight - 10 <= 0
                          ? element.y + element.height + 10 + 'px'
                          : Math.min(
                              element.y - tooltip.clientHeight - 10,
                              canvasHeight - 100
                            ) + 'px'
                      tooltip.style.left =
                        Math.min(
                          element.x + element.width / 5,
                          canvasWidth - 150
                        ) + 'px'
                    })
                    stampImage.addEventListener('mouseout', function (e) {
                      tooltip.style.top = 0
                      tooltip.style.left = 0
                      tooltip.style.display = 'none'
                    })

                    const dropDown = document.createElement('div')
                    dropDown.className = 'dropdown-content'
                    dropDown.id = `stampDropdown${element.objectId}_${self.pageNumber}`
                    const editBtn = document.createElement('a')
                    editBtn.innerHTML = self.i18n.change
                    editBtn.addEventListener('mouseup', function (e) {
                      self.eventBus.dispatch('setAnnotateSignatureAndStamp', {
                        source: self,
                        annotateSignatureAndStamp: {
                          page: self.pageNumber,
                          width: element.width,
                          height: element.height,
                          top: element.y,
                          left: element.x,
                          id: element.objectId,
                          scale: element.scale,
                          type: element.type,
                        },
                        mode: 1,
                      })
                    })
                    editBtn.style.fontSize = '14px'
                    const deleteBtn = document.createElement('a')
                    deleteBtn.addEventListener('mouseup', function (e) {
                      let undoneAnnotate = null
                      if (
                        self.annotate &&
                        self.annotate.length > 0 &&
                        self.annotate.find((x) => x.page === self.pageNumber)
                      ) {
                        undoneAnnotate = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.find((y) => y.objectId === element.objectId)
                        undoneAnnotate.done = false
                        undoneAnnotate.data = null
                      }
                      const oldStampImage = document.getElementById(
                        `signatureAndStampImage${element.objectId}_${self.pageNumber}`
                      )
                      if (oldStampImage) {
                        oldStampImage.remove()
                      }
                      const signatureAndStamp = document.createElement('button')
                      signatureAndStamp.id = `signatureAndStamp${undoneAnnotate.objectId}_${self.pageNumber}`
                      if (undoneAnnotate.required) {
                        signatureAndStamp.classList.add('required')
                      } else {
                        signatureAndStamp.classList.remove('required')
                      }
                      signatureAndStamp.style.position = 'absolute'
                      signatureAndStamp.style.left = undoneAnnotate.x + 'px'
                      signatureAndStamp.style.top = undoneAnnotate.y + 'px'
                      signatureAndStamp.style.width =
                        undoneAnnotate.width + 'px'
                      signatureAndStamp.style.height =
                        undoneAnnotate.height + 'px'
                      signatureAndStamp.style.borderRadius = `${undoneAnnotate.rx}px`
                      signatureAndStamp.style.backgroundColor =
                        self.useDefaultColor
                          ? self.defaultBGC
                          : undoneAnnotate.color
                      signatureAndStamp.style.zIndex = 40
                      signatureAndStamp.style.padding = '0px'
                      signatureAndStamp.style.border = `${
                        undoneAnnotate.strokeWidth
                      }px solid ${
                        self.useDefaultColor
                          ? self.defaultBorderColor
                          : undoneAnnotate.stroke
                      }`
                      signatureAndStamp.style.display = 'flex'
                      signatureAndStamp.style.alignItems = 'center'
                      signatureAndStamp.style.justifyContent = 'center'
                      signatureAndStamp.style.setProperty(
                        '--required-right',
                        '-10px'
                      )
                      signatureAndStamp.style.setProperty(
                        '--required-top',
                        '-10px'
                      )
                      signatureAndStamp.style.setProperty(
                        '--required-size',
                        `${Math.max(32 * self.scale, 12)}px`
                      )

                      if (
                        self.checkAnnotate === true &&
                        self.showOutline === true
                      ) {
                        signatureAndStamp.style.outline = '2px dotted red'
                      }
                      signatureAndStamp.disabled = isAnnotateDisabled
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                        self.eventBus.dispatch('notifyAnnotateChanged')
                      }, 0)
                      const p = document.createElement('p')
                      const text = document.createTextNode(
                        self.i18n.signatureAndStamp
                      )
                      p.style.fontSize = '16px'
                      p.style.fontFamily = 'Microsoft JhengHei'
                      p.style.fontWeight = 'bold'
                      p.style.position = 'relative'
                      p.style.display = 'flex'
                      p.style.alignItems = 'center'
                      p.style.justifyContent = 'center'
                      p.style.textAlign = 'center'
                      p.style.marginBottom = '0px'
                      p.style.transform = `scale(${undoneAnnotate.scale})`
                      p.style.transformOrigin = 'center center'
                      p.style.minWidth = `${100 / undoneAnnotate.scale}%`
                      p.style.minHeight = `${100 / undoneAnnotate.scale}%`
                      p.innerHTML =
                        '<i class="custom-icon icon-signatureAndStamp" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                      p.appendChild(text)
                      signatureAndStamp.appendChild(p)
                      if (!isAnnotateDisabled) {
                        signatureAndStamp.addEventListener(
                          'mouseup',
                          function (e) {
                            self.eventBus.dispatch(
                              'setAnnotateSignatureAndStamp',
                              {
                                source: self,
                                annotateSignatureAndStamp: {
                                  page: self.pageNumber,
                                  width: undoneAnnotate.width,
                                  height: undoneAnnotate.height,
                                  top: undoneAnnotate.y,
                                  left: undoneAnnotate.x,
                                  id: undoneAnnotate.objectId,
                                  scale: undoneAnnotate.scale,
                                  type: undoneAnnotate.type,
                                },
                                mode: 0,
                              }
                            )
                          }
                        )
                      }
                      signatureAndStamp.addEventListener(
                        'mouseover',
                        function (e) {
                          tooltip.innerHTML = `${
                            element.label
                              ? element.label
                              : self.i18n.signatureAndStamp
                          } - ${
                            undoneAnnotate.required
                              ? self.i18n.required
                              : self.i18n.optional
                          }`
                          tooltip.style.display = 'block'
                          tooltip.style.top =
                            undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
                              ? undoneAnnotate.y +
                                undoneAnnotate.height +
                                10 +
                                'px'
                              : Math.min(
                                  undoneAnnotate.y - tooltip.clientHeight - 10,
                                  canvasHeight - 100
                                ) + 'px'
                          tooltip.style.left =
                            Math.min(
                              undoneAnnotate.x + undoneAnnotate.width / 5,
                              canvasWidth - 150
                            ) + 'px'
                        }
                      )
                      signatureAndStamp.addEventListener(
                        'mouseout',
                        function (e) {
                          tooltip.style.top = 0
                          tooltip.style.left = 0
                          tooltip.style.display = 'none'
                        }
                      )
                      self.canvasWrapper.appendChild(signatureAndStamp)
                      self.addElements.push(signatureAndStamp)
                    })
                    deleteBtn.innerHTML = self.i18n.btnDelete
                    deleteBtn.style.color = 'darkred'
                    deleteBtn.style.fontSize = '14px'
                    dropDown.appendChild(editBtn)
                    dropDown.appendChild(deleteBtn)
                    self.canvasWrapper.appendChild(dropDown)
                    self.addElements.push(dropDown)
                    if (!isAnnotateDisabled) {
                      stampImage.addEventListener('mouseup', function (e) {
                        setTimeout(() => {
                          dropDown.classList.toggle('dropdownOpen')
                          dropDown.style.top =
                            element.y + element.height + 10 + 'px'
                          dropDown.style.left = element.x + 'px'
                          stampImage.style.border =
                            '2px solid rgba(0, 150, 199, 0.6)'
                          const mouseup = function (e) {
                            const dropdowns =
                              document.getElementsByClassName(
                                'dropdown-content'
                              )
                            for (let i = 0; i < dropdowns.length; i++) {
                              const openDropdown = dropdowns[i]
                              if (
                                openDropdown.classList.contains('dropdownOpen')
                              ) {
                                openDropdown.classList.remove('dropdownOpen')
                                stampImage.style.removeProperty('border')
                              }
                            }
                            document.removeEventListener('mouseup', mouseup)
                          }
                          document.addEventListener('mouseup', mouseup)
                        }, 0)
                      })
                    }
                    this.canvasWrapper.appendChild(stampImage)
                    this.addElements.push(stampImage)
                  }
                  break
                case 14: // canvas area
                  if (self.mode === 1) {
                    const item = element
                    const canvasField = document.createElement('canvas')
                    canvasField.id = `canvasField_${item.objectId}_${self.pageNumber}`
                    canvasField.style.cssText = `
                      border: ${item.strokeWidth}px dashed ${item.stroke};
                      border-radius: ${item.rx}px;
                      z-index: ${self.commentMode.on ? 29 : 41};
                      position: absolute;
                    `
                    canvasField.disabled = isAnnotateDisabled
                    self.canvas = canvasField
                    self.canvasWrapper.appendChild(canvasField)
                    const c = new fabric.Canvas(canvasField, {
                      allowTouchScrolling:
                        self.fabricParams.allowTouchScrolling,
                      uniformScaling: false,
                      layer: self,
                      pageNumber: self.pageNumber,
                      hoverCursor: 'pointer',
                      width: (item.width * scale) / item.scale,
                      height: (item.height * scale) / item.scale,
                      position: 'absolute',
                      containerClass: `canvasDraw${0 + 1}_${
                        self.pageNumber
                      } canvasDraw`,
                    })
                    canvasField.fabric = c
                    document.querySelector(
                      `.canvasDraw${0 + 1}_${self.pageNumber}`
                    ).style.position = 'absolute'

                    if (
                      this.fabricParams.eraserTool ||
                      this.fabricParams.drawTool
                    ) {
                      c.freeDrawingBrush = new this.EraserBrush(c)
                      c.isDrawingMode = true
                      if (this.fabricParams.drawTool) {
                        c.freeDrawingBrush = new fabric.PencilBrush(c)
                        self.DrawBrush = true
                        self.setState(90)
                      }
                    } else {
                      c.freeDrawingBrush = null
                      c.isDrawingMode = false
                    }

                    canvasField.parentElement.style.top =
                      (item.y * scale) / item.scale + 'px'
                    canvasField.parentElement.style.left =
                      (item.x * scale) / item.scale + 'px'

                    let isMobile =
                      /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(
                        navigator.userAgent
                      ) ||
                      /\b(Android|Windows Phone|iPod)\b/i.test(
                        navigator.userAgent
                      )
                    if (!isMobile) {
                      isMobile =
                        'ontouchstart' in window ||
                        navigator.maxTouchPoints > 1 ||
                        navigator.msMaxTouchPoints > 1 ||
                        /\b(iPad)\b/i.test(navigator.userAgent)
                    }
                    let mouseDowned = false
                    c.on('mouse:down', function (e) {
                      // set selected canvas if multi canvas in one page
                      // self.canvas = e.e.target.previousElementSibling
                      // if (Object.keys(self.selectedCanvas.source).length) {
                      //   const classArr = [
                      //     ...self.selectedCanvas.source.parentElement.classList,
                      //   ]
                      //   const canvasClass = classArr.filter(
                      //     (c) => c.includes('_') && c.includes('canvasDraw')
                      //   ).length
                      //     ? classArr.filter(
                      //         (c) => c.includes('_') && c.includes('canvasDraw')
                      //       )[0]
                      //     : null
                      //   const targetClassArr = [...e.e.target.parentElement.classList]
                      //   const targetClass = targetClassArr.filter(
                      //     (c) => c.includes('_') && c.includes('canvasDraw')
                      //   ).length
                      //     ? targetClassArr.filter(
                      //         (c) => c.includes('_') && c.includes('canvasDraw')
                      //       )[0]
                      //     : null
                      //   if (canvasClass && targetClass) {
                      //     if (canvasClass !== targetClass) {
                      //       self.initDrawToolBar()
                      //     }
                      //   }
                      // }

                      // IOS don't trigger mouse:over, so mobile save canvas to base64 every mouse:down
                      // this is reseting tool
                      if (isMobile) {
                        if (!self.showDrawTool.on) {
                          c.freeDrawingBrush = null
                          self.DrawBrush = false
                          c.isDrawingMode = false
                          Object.keys(self.geometryMode).every(
                            (v) => (self.geometryMode[v] = false)
                          )
                          self.setState(0)
                        }
                      }

                      mouseDowned = true
                      self.eventBus.dispatch('setSelectedCanvas', {
                        source: self.canvas,
                      })

                      self.eventBus.dispatch('toggleDrawTool', {
                        source: self,
                        on: true,
                      })

                      document
                        .querySelectorAll('.upper-canvas')
                        .forEach((ele) => {
                          if (
                            Array.from(ele.parentNode.classList).includes(
                              'canvasDraw'
                            )
                          ) {
                            ele.style.border = `${
                              element.strokeWidth
                            }px dashed ${
                              self.useDefaultColor
                                ? self.defaultBorderColor
                                : element.stroke
                            }`
                          }
                        })
                      e.e.target.style.border = 'orange 3px solid'
                    })

                    c.on('mouse:up', function (e) {
                      // if mouse up outside the canvas, then undo
                      // or there'll be unexpected error when turned to base 64
                      setTimeout(() => {
                        if (
                          (!mouseDowned && self.DrawBrush) ||
                          (!mouseDowned && e.target) ||
                          (!mouseDowned &&
                            Object.keys(self.geometryMode).some(
                              (v) => self.geometryMode[v] === true
                            ))
                        ) {
                          self.undo('force')
                        }
                        mouseDowned = false

                        // IOS don't trigger mouse:out, so mobile save canvas to base64 every mouse:up
                        if (isMobile) {
                          const page = self.canvas.id.split('_')[2]
                          const annotate = self.annotate.find(
                            (x) => x.page === parseInt(page)
                          )
                          const anno = annotate.data.filter(
                            (x) => x.type === 14
                          )
                          // 沒設 toDataUrl option, IOS似乎會因螢幕resolution過高而沒執行
                          anno[0].data = c.toDataURL({
                            multiplier: 4,
                            format: 'png',
                            quality: 0.5,
                          })
                          anno[0].imageHeight = scale / element.scale
                          anno[0].imageX = scale / element.scale
                          element.imageHeight *= scale / element.scale
                          element.imageX *= scale / element.scale
                          c.renderAll()
                          // save to base64 when mouse:up, so can't wait til entered text
                          // textarea can't add continually, init tool after add one textarea
                          if (self.activeType.text || self.isTextEditing) {
                            self.isTextEditing = self.activeType.text = false
                            self.setState(0)
                            self.initDrawToolBar()
                          }
                        }
                      }, 10)
                    })

                    c.on('object:modified', function (e) {
                      c._historySaveAction()
                    })

                    c.on('object:scaling', function (e) {
                      const obj = e.target
                      const id = obj.id
                      const shape = self.annotate
                        .find((x) => x.page === self.pageNumber)
                        .data.find((y) => y.objectId === id)
                      shape.x = obj.left
                      shape.y = obj.top
                      shape.width = obj.width
                      shape.height = obj.height

                      const type = obj.get('type')
                      if (type !== 'checkbox' && type !== 'group') {
                        obj.set({
                          height: obj.height * obj.scaleY,
                          width: obj.width * obj.scaleX,
                          scaleX: 1,
                          scaleY: 1,
                        })
                      }
                    })

                    // IOS don't trigger mouse:out or mouse:over
                    if (!isMobile) {
                      c.on('mouse:over', function (e) {
                        if (!e.target) {
                          mouseDowned = self.isDown
                          if (!self.showDrawTool.on) {
                            c.freeDrawingBrush = null
                            self.DrawBrush = false
                            c.isDrawingMode = false
                            Object.keys(self.geometryMode).every(
                              (v) => (self.geometryMode[v] = false)
                            )
                            self.setState(0)
                          }
                          tooltip.innerHTML = `${self.i18n.canvas} - ${
                            element.required
                              ? self.i18n.required
                              : self.i18n.optional
                          }`
                          tooltip.style.display = 'block'
                          tooltip.style.top =
                            element.y - tooltip.clientHeight - 10 <= 0
                              ? element.y + element.height + 10 + 'px'
                              : Math.min(
                                  element.y - tooltip.clientHeight - 10,
                                  canvasHeight - 100
                                ) + 'px'
                          tooltip.style.left =
                            Math.min(
                              element.x + element.width / 5,
                              canvasWidth - 150
                            ) + 'px'
                        }
                      })

                      c.on('mouse:out', function (e) {
                        if (!e.target) {
                          mouseDowned = false
                          const page = self.canvas.id.split('_')[2]
                          const annotate = self.annotate.find(
                            (x) => x.page === parseInt(page)
                          )
                          const anno = annotate.data.filter(
                            (x) => x.type === 14
                          )
                          anno[0].data = c.toDataURL()
                          anno[0].imageHeight = scale / element.scale
                          anno[0].imageX = scale / element.scale
                          element.imageHeight *= scale / element.scale
                          element.imageX *= scale / element.scale
                          tooltip.style.top = 0
                          tooltip.style.left = 0
                          tooltip.style.display = 'none'
                          c.renderAll()
                        }
                      })
                    }
                  }
                  break
              }
            })
          }

          if (this.checkAnnotate === true && this.mode === 1) {
            this.checkNotComplete(this.showOutline)
          }

          this.renderCollaborateAnnotate()
        }
        break
      case 2:
        if (pdfCanvas) {
          if (
            this.annotate &&
            this.annotate.length > 0 &&
            this.annotate.find((x) => x.page === this.pageNumber)
          ) {
            const annotate = this.annotate.find(
              (x) => x.page === this.pageNumber
            )
            annotate.data.forEach((element) => {
              if (element.scale) {
                const proportion = scale / element.scale
                element.width *= proportion
                element.height *= proportion
                if (element.originWidth) element.originWidth *= proportion
                if (element.originHeight) element.originHeight *= proportion
                element.x *= proportion
                element.y *= proportion
                if (element.rx) element.rx *= proportion
                if (element.ry) element.ry *= proportion
                if (element.strokeWidth) element.strokeWidth *= proportion
                if (element.imageWidth) element.imageWidth *= proportion
                if (element.imageHeight) element.imageHeight *= proportion
                if (element.imageX) element.imageX *= proportion
                if (element.imageY) element.imageY *= proportion
                if (element.centerWidth) element.centerWidth *= proportion
                if (element.centerHeight) element.centerHeight *= proportion
                element.scale = scale
              } else {
                element.width *= scale
                element.height *= scale
                if (element.originWidth) element.originWidth *= scale
                if (element.originHeight) element.originHeight *= scale
                element.x *= scale
                element.y *= scale
                if (element.rx) element.rx *= scale
                if (element.ry) element.ry *= scale
                if (element.strokeWidth) element.strokeWidth *= scale
                if (element.imageWidth) element.imageWidth *= scale
                if (element.imageHeight) element.imageHeight *= scale
                if (element.imageX) element.imageX *= scale
                if (element.imageY) element.imageY *= scale
                if (element.centerWidth) element.centerWidth *= scale
                if (element.centerHeight) element.centerHeight *= scale
                element.scale = scale
              }
            })

            const canvasWidth = self.canvasWrapper.clientWidth
            const canvasHeight = self.canvasWrapper.clientHeight
            let text = null
            let textAreaContainer = null
            let textArea = null
            let textCountElement = null
            let radio = null
            let date = null
            let radiomark = null
            let radiomarkContainer = null
            let label = null
            let attachment = null
            let p = null
            let textNode = null
            let changeEvent = null
            let fontWeight = null
            this.setRequiredElementStyle()
            annotate.data.forEach((element, index) => {
              element.objectId = element.objectId ?? index
              if (element.id) {
                const hex = this.colorList[element.id - 1]
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                element.color = element.color ?? `rgba(${r},${g},${b}, 0.6)`
                element.stroke =
                  element.stroke ??
                  `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g}, ${
                    b > 10 ? b - 10 : b
                  })`
              } else {
                element.color = element.color ?? '#f1f5f8'
                element.stroke = element.stroke ?? 'rgb(146, 147, 147)'
              }
              element.strokeWidth = element.strokeWidth ?? 2
              element.rx = element.rx ?? 2
              element.ry = element.ry ?? 2
              element.selected = element.selected ?? false
              element.text = element.text ?? ''
              element.fontSize = element.fontSize ?? 16
              element.fontFamily = element.fontFamily ?? 'Microsoft JhengHei'
              element.checkboxStrokeWidth = element.checkboxStrokeWidth ?? 1
              element.radioStrokeWidth = element.radioStrokeWidth ?? 1
              element.label = element.label ?? ''
              switch (element.type) {
                case 0:
                  if (!element.done) {
                    const signature = document.createElement('button')
                    signature.id = `signature${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      signature.classList.add('required')
                    } else {
                      signature.classList.remove('required')
                    }
                    signature.style.position = 'absolute'
                    signature.style.left = element.x + 'px'
                    signature.style.top = element.y + 'px'
                    signature.style.width =
                      element.width - element.strokeWidth + 'px'
                    signature.style.height =
                      element.height - element.strokeWidth + 'px'
                    signature.style.borderRadius = `${element.rx}px`
                    signature.style.backgroundColor = element.color
                    signature.style.zIndex = 40
                    signature.style.padding = '0px'
                    signature.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    signature.style.display = 'flex'
                    signature.style.alignItems = 'center'
                    signature.style.justifyContent = 'center'
                    signature.style.cursor = 'default'
                    signature.style.boxSizing = 'content-box'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.signature)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="v-icon notranslate mdi mdi-signature theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    signature.appendChild(p)
                    this.canvasWrapper.appendChild(signature)
                    this.addElements.push(signature)
                  }
                  break
                case 1:
                  textAreaContainer = document.createElement('span')
                  textArea = document.createElement('textarea')
                  textCountElement = document.createElement('div')
                  textArea.value = element.text
                  textArea.disabled = true
                  if (element.width >= element.fontSize * 2 * element.scale) {
                    textArea.placeholder = self.i18n.text
                  } else if (
                    element.width >=
                    element.fontSize * element.scale
                  ) {
                    textArea.placeholder = self.i18n.text.charAt(0)
                  }
                  textAreaContainer.id = `textContainer${element.objectId}_${this.pageNumber}`
                  textArea.id = `text${element.objectId}_${this.pageNumber}`
                  if (element.required) {
                    textAreaContainer.classList.add('required')
                  } else {
                    textAreaContainer.classList.remove('required')
                  }
                  textAreaContainer.style.position = 'absolute'
                  textAreaContainer.style.left = element.x + 'px'
                  textAreaContainer.style.top = element.y + 'px'
                  textAreaContainer.style.zIndex = 40
                  textArea.style.width = element.width + 'px'
                  // padding-bottom 8px
                  textArea.style.height = element.height + 8 + 'px'
                  textArea.style.borderRadius = `${element.rx}px`
                  textArea.style.backgroundColor = element.color
                  fontWeight = element.fontWeight || 'normal'
                  textArea.style.font = `${fontWeight} ${
                    element.fontSize * element.scale
                  }px ${element.fontFamily}`
                  textArea.style.fontStyle = element.fontStyle
                  textArea.style.color = element.textColor || 'rgba(0,0,0,1)'
                  textArea.style.textAlign = element.textAlign || 'left'
                  textArea.style.padding = '0px'
                  textArea.style.resize = 'none'
                  textArea.style.overflow = 'hidden'
                  textArea.style.wordBreak = 'break-all'

                  textCountElement.id = `textCount${element.objectId}_${this.pageNumber}`
                  textCountElement.style.position = 'absolute'
                  textCountElement.style.right = `${3 * element.scale}px`
                  textCountElement.style.bottom = `-${element.scale}px`
                  textCountElement.style.zIndex = 40
                  textCountElement.style.fontSize =
                    16 * element.scale * 0.5 + 'px'
                  textCountElement.style.letterSpacing = '1px'
                  textCountElement.innerHTML = `${element.text.length}/${element.maxlength}`
                  textCountElement.style.color =
                    element.text.length > element.maxlength ? 'red' : 'black'

                  textAreaContainer.style.setProperty(
                    '--invalid-char',
                    `${element.text.length - element.maxlength}`
                  )
                  if (element.text.length > element.maxlength) {
                    textAreaContainer.classList.add(
                      `textoverlength__${self.i18n.locale}`
                    )
                    textArea.style.setProperty('outline', '2px dotted red')
                  } else {
                    textAreaContainer.classList.remove(
                      `textoverlength__${self.i18n.locale}`
                    )
                    textArea.style.removeProperty('outline')
                  }
                  if (element.isTextOverflow) {
                    textAreaContainer.classList.add(
                      `textoverflow__${self.i18n.locale}`
                    )
                    textArea.style.setProperty('outline', '2px dotted red')
                  } else {
                    textAreaContainer.classList.remove(
                      `textoverflow__${self.i18n.locale}`
                    )
                    textArea.style.removeProperty('outline')
                  }

                  textAreaContainer.appendChild(textCountElement)
                  textAreaContainer.appendChild(textArea)
                  this.canvasWrapper.appendChild(textAreaContainer)
                  this.addElements.push(textAreaContainer)
                  break
                case 2:
                  if (element.group === null || element.group === undefined) {
                    const label = document.createElement('label')
                    label.id = `checkboxContainer${element.objectId}_${this.pageNumber}`
                    label.className = 'checkboxContainer'
                    label.style.position = 'absolute'
                    label.style.left = element.x + 'px'
                    label.style.top = element.y + 'px'
                    label.style.width = element.width + 'px'
                    label.style.height = element.height + 'px'
                    label.style.zIndex = 40
                    label.style.transform = `scale(${1.2})`
                    const checkbox = document.createElement('input')
                    checkbox.type = 'checkbox'
                    checkbox.checked = element.selected
                    checkbox.disabled = true
                    checkbox.id = `checkbox${element.objectId}_${this.pageNumber}`
                    checkbox.style.left = '0px'
                    checkbox.style.top = '0px'
                    checkbox.style.width = element.width + 'px'
                    checkbox.style.height = element.height + 'px'
                    checkbox.style.zIndex = 40
                    const checkmarkContainer = document.createElement('div')
                    checkmarkContainer.id = `checkmarkContainer${element.objectId}_${this.pageNumber}`
                    checkmarkContainer.className = 'checkmarkContainer'
                    const checkmark = document.createElement('div')
                    checkmark.className = 'checkmark'
                    checkmark.style.width = checkmark.style.height =
                      element.width * 0.5 + 'px'
                    checkmarkContainer.appendChild(checkmark)
                    checkmarkContainer.style.width = element.width + 'px'
                    checkmarkContainer.style.height = element.width + 'px'
                    checkmarkContainer.style.backgroundColor = element.color
                    checkmarkContainer.style.borderRadius = '2px'
                    checkmarkContainer.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    checkmarkContainer.style.transformOrigin = 'left top'
                    label.appendChild(checkbox)
                    label.appendChild(checkmarkContainer)
                    if (
                      element.groupId !== null &&
                      element.groupId !== undefined &&
                      (this.checkboxGroup.find(
                        (x) => x.id === element.groupId
                      ) === null ||
                        this.checkboxGroup.find(
                          (x) => x.id === element.groupId
                        ) === undefined)
                    ) {
                      const groupId = element.groupId
                      const children = annotate.data.filter(
                        (y) => y.groupId === groupId && y.type === 2
                      )
                      const checkboxGroupContainer =
                        document.createElement('div')
                      checkboxGroupContainer.id = `checkboxGroupContainer${groupId}_${this.pageNumber}`
                      checkboxGroupContainer.style.position = 'absolute'
                      checkboxGroupContainer.style.left =
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) -
                        element.checkboxStrokeWidth -
                        4 +
                        'px'
                      checkboxGroupContainer.style.top =
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) -
                        element.checkboxStrokeWidth -
                        4 +
                        'px'
                      checkboxGroupContainer.style.display = 'flex'
                      checkboxGroupContainer.style.flexDirection = 'column'
                      checkboxGroupContainer.style.alignItems = 'center'
                      checkboxGroupContainer.style.zIndex = '40'
                      if (element.minimum > 0) {
                        checkboxGroupContainer.classList.add('required')
                      }
                      const checkboxGroupDiv = document.createElement('div')
                      checkboxGroupDiv.id = `checkboxGroupDiv_${groupId}`
                      checkboxGroupDiv.style.width =
                        Math.max.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) +
                        element.width -
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.x
                          })
                        ) +
                        element.strokeWidth * 2 +
                        8 +
                        'px'
                      checkboxGroupDiv.style.height =
                        Math.max.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) +
                        element.height -
                        Math.min.apply(
                          Math,
                          children.map(function (child) {
                            return child.y
                          })
                        ) +
                        element.strokeWidth * 2 +
                        8 +
                        'px'
                      checkboxGroupDiv.style.border = '2px dashed #3183c8c2'
                      checkboxGroupDiv.style.zIndex = 20
                      checkboxGroupDiv.style.borderRadius = '2px'
                      checkboxGroupContainer.appendChild(checkboxGroupDiv)
                      this.canvasWrapper.appendChild(checkboxGroupContainer)
                      this.addElements.push(checkboxGroupContainer)
                      const groupTooltip = document.createElement('div')
                      groupTooltip.className = 'tooltip'
                      groupTooltip.id = `checkboxGroupTooltip${groupId}_${this.pageNumber}`
                      let text = ''
                      switch (element.ruleId) {
                        case 0:
                          text = self.i18n.selectAtLeast.replace(
                            '{minimum}',
                            element.minimum
                          )
                          break
                        case 1:
                          text = self.i18n.selectAtMost.replace(
                            '{maximum}',
                            element.maximum
                          )
                          break
                        case 2:
                          text = self.i18n.selectExactly.replace(
                            '{maximum}',
                            element.maximum
                          )
                          break
                        case 3:
                          text = self.i18n.selectRange
                            .replace('{minimum}', element.minimum)
                            .replace('{maximum}', element.maximum)
                          break
                      }
                      const groupLabel =
                        element.groupLabel && element.groupLabel !== ''
                          ? element.groupLabel.length > 40
                            ? element.groupLabel.substring(0, 40) + '...'
                            : element.groupLabel
                          : self.i18n.checkboxGrp
                      groupTooltip.innerHTML = `${groupLabel} - ${text}`
                      groupTooltip.style.top =
                        Math.min(
                          parseFloat(checkboxGroupContainer.style.top) +
                            parseFloat(checkboxGroupDiv.style.height) / 2,
                          canvasHeight - 100
                        ) + 'px'
                      groupTooltip.style.left =
                        Math.min(
                          parseFloat(checkboxGroupContainer.style.left) +
                            parseFloat(checkboxGroupDiv.style.width) +
                            10,
                          canvasWidth - 150
                        ) + 'px'
                      groupTooltip.style.zIndex = 40
                      groupTooltip.style.display = 'none'
                      this.canvasWrapper.appendChild(groupTooltip)
                      this.addElements.push(groupTooltip)
                      this.checkboxGroup.push({
                        id: groupId,
                        container: checkboxGroupContainer,
                        groupDiv: checkboxGroupDiv,
                        groupTooltip,
                        items: children.map((x) => x.objectId),
                      })
                    }
                    this.canvasWrapper.appendChild(label)
                    this.addElements.push(label)
                  }
                  break
                case 3:
                  if (!element.done) {
                    const stamp = document.createElement('button')
                    stamp.id = `stamp${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      stamp.classList.add('required')
                    } else {
                      stamp.classList.remove('required')
                    }
                    stamp.style.position = 'absolute'
                    stamp.style.left = element.x + 'px'
                    stamp.style.top = element.y + 'px'
                    stamp.style.width = element.width + 'px'
                    stamp.style.height = element.height + 'px'
                    stamp.style.borderRadius = `${element.rx}px`
                    stamp.style.backgroundColor = element.color
                    stamp.style.zIndex = 40
                    stamp.style.padding = '0px'
                    stamp.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    stamp.style.display = 'flex'
                    stamp.style.alignItems = 'center'
                    stamp.style.justifyContent = 'center'
                    stamp.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.stamp)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="v-icon notranslate mdi mdi-stamper theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    stamp.appendChild(p)
                    this.canvasWrapper.appendChild(stamp)
                    this.addElements.push(stamp)
                  }
                  break
                case 4:
                  element.dateRange = element.dateRange ?? 'signDay'
                  if (element.text && element.readonly) {
                    element.dateEra = element.dateEra ?? 'common'
                    element.data = element.text
                    switch (element.dateEra) {
                      case 'common':
                      default:
                        text = moment(element.data).format(
                          element.dateFormat ?? 'YYYY/MM/DD'
                        )
                        break
                      case 'roc':
                        text =
                          this.i18n.rocEra +
                          (+moment(element.data).format('YYYY') - 1911) +
                          moment(element.data).format('年MM月DD日')
                        text = element.dateFormat.includes('中華民國')
                          ? text
                          : text.replace(this.i18n.rocEra, '')
                        break
                    }
                    element.done = true
                    date = document.createElement('div')
                    date.id = `date${element.objectId}_${this.pageNumber}`
                    date.style.position = 'absolute'
                    date.style.left = element.x + 'px'
                    date.style.top = element.y + 'px'
                    date.style.width = element.width + 'px'
                    date.style.height = element.height + 2 + 'px'
                    fontWeight = element.fontWeight || 'normal'
                    date.style.font = `${fontWeight} ${
                      element.fontSize * element.scale
                    }px ${element.fontFamily}`
                    date.style.fontStyle = element.fontStyle
                    date.style.color = element.textColor || 'rgba(0,0,0,1)'
                    date.style.zIndex = 40
                    date.style.padding = '0px'
                    date.style.userSelect = 'none'
                    p = document.createElement('p')
                    p.style.font = `${fontWeight} ${element.fontSize}px ${element.fontFamily}`
                    p.style.fontStyle = element.fontStyle
                    p.style.color = element.textColor || 'rgba(0,0,0,1)'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'left top'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML = text
                    date.appendChild(p)
                    this.canvasWrapper.appendChild(date)
                    this.addElements.push(date)
                  } else {
                    if (element.text) {
                      element.dateEra = element.dateEra ?? 'common'
                      element.data = element.text
                    }
                    changeEvent = (e) => {
                      const obj = document.getElementById(
                        `dateText${element.objectId}_${self.pageNumber}`
                      )
                      if (e.data) {
                        element.done = true
                        if (
                          self.checkAnnotate === true &&
                          self.showOutline === true
                        ) {
                          obj.style.removeProperty('outline')
                        }
                        element.data = e.data
                      } else {
                        element.done = false
                        if (
                          self.checkAnnotate === true &&
                          self.showOutline === true
                        ) {
                          obj.style.setProperty('outline', '2px dotted red')
                        }
                        element.data = ''
                      }
                      // wait DOM rendered
                      setTimeout(() => {
                        if (self.mode === 1) {
                          self.eventBus.dispatch('checkAnnotateChanged', {
                            source: self,
                            showOutline: self.showOutline,
                          })
                        }
                      }, 0)
                    }
                    element.dateEra = element.dateEra ?? 'common'
                    switch (element.dateRange) {
                      case 'none':
                        self.eventBus.dispatch('createDatePicker', {
                          parent: this.canvasWrapper,
                          props: {
                            value: element.data ?? '',
                            width: element.width + 4 + 'px',
                            height: element.height + 2 + 'px',
                            left: element.x + 'px',
                            top: element.y + 'px',
                            type: 'none',
                            objectId: element.objectId,
                            pageNumber: self.pageNumber,
                            scale: element.scale,
                            fontSize: element.fontSize * element.scale,
                            fontFamily: element.fontFamily,
                            fontStyle: element.fontStyle,
                            fontWeight: element.fontWeight,
                            dateFormat: element.dateFormat,
                            disabled: true,
                            dateEra: element.dateEra,
                            i18n: this.i18n,
                            label: null,
                            required: element.required,
                            tooltip: null,
                            canvasWidth: null,
                            canvasHeight: null,
                            textColor: element.textColor || 'rgba(0,0,0,1)',
                          },
                          changeEvent,
                        })
                        break
                      case 'beforeSignDay':
                        self.eventBus.dispatch('createDatePicker', {
                          parent: this.canvasWrapper,
                          props: {
                            value: element.data ?? '',
                            width: element.width + 4 + 'px',
                            height: element.height + 2 + 'px',
                            left: element.x + 'px',
                            top: element.y + 'px',
                            type: 'beforeSignDay',
                            objectId: element.objectId,
                            pageNumber: self.pageNumber,
                            scale: element.scale,
                            fontSize: element.fontSize * element.scale,
                            fontFamily: element.fontFamily,
                            fontStyle: element.fontStyle,
                            fontWeight: element.fontWeight,
                            dateFormat: element.dateFormat,
                            disabled: true,
                            dateEra: element.dateEra,
                            i18n: this.i18n,
                            label: null,
                            required: element.required,
                            tooltip: null,
                            canvasWidth: null,
                            canvasHeight: null,
                            textColor: element.textColor || 'rgba(0,0,0,1)',
                          },
                          changeEvent,
                        })
                        break
                      case 'afterSignDay':
                        self.eventBus.dispatch('createDatePicker', {
                          parent: this.canvasWrapper,
                          props: {
                            value: element.data ?? '',
                            width: element.width + 4 + 'px',
                            height: element.height + 2 + 'px',
                            left: element.x + 'px',
                            top: element.y + 'px',
                            type: 'afterSignDay',
                            objectId: element.objectId,
                            pageNumber: self.pageNumber,
                            scale: element.scale,
                            fontSize: element.fontSize * element.scale,
                            fontFamily: element.fontFamily,
                            fontStyle: element.fontStyle,
                            fontWeight: element.fontWeight,
                            dateFormat: element.dateFormat,
                            disabled: true,
                            dateEra: element.dateEra,
                            i18n: this.i18n,
                            label: null,
                            required: element.required,
                            tooltip: null,
                            canvasWidth: null,
                            canvasHeight: null,
                            textColor: element.textColor || 'rgba(0,0,0,1)',
                          },
                          changeEvent,
                        })
                        break
                      case 'signDay':
                        element.data = moment()
                        switch (element.dateEra) {
                          case 'common':
                          default:
                            text = moment(element.data).format(
                              element.dateFormat ?? 'YYYY/MM/DD'
                            )
                            break
                          case 'roc':
                            text =
                              this.i18n.rocEra +
                              (+moment(element.data).format('YYYY') - 1911) +
                              moment(element.data).format('年MM月DD日')
                            text = element.dateFormat.includes('中華民國')
                              ? text
                              : text.replace(this.i18n.rocEra, '')
                            break
                        }
                        element.done = true
                        date = document.createElement('div')
                        date.id = `date${element.objectId}_${this.pageNumber}`
                        date.style.position = 'absolute'
                        date.style.left = element.x + 'px'
                        date.style.top = element.y + 'px'
                        date.style.width = element.width + 'px'
                        date.style.height = element.height + 2 + 'px'
                        fontWeight = element.fontWeight || 'normal'
                        date.style.font = `${fontWeight} ${
                          element.fontSize * element.scale
                        }px ${element.fontFamily}`
                        date.style.fontStyle = element.fontStyle
                        date.style.color = element.textColor || 'rgba(0,0,0,1)'
                        date.style.zIndex = 40
                        date.style.padding = '0px'
                        date.style.userSelect = 'none'
                        p = document.createElement('p')
                        p.style.font = `${fontWeight} ${element.fontSize}px ${element.fontFamily}`
                        p.style.fontStyle = element.fontStyle
                        p.style.color = element.textColor || 'rgba(0,0,0,1)'
                        p.style.position = 'relative'
                        p.style.display = 'flex'
                        p.style.marginBottom = '0px'
                        p.style.transform = `scale(${element.scale})`
                        p.style.transformOrigin = 'left top'
                        p.style.minWidth = `${100 / element.scale}%`
                        p.style.minHeight = `${100 / element.scale}%`
                        p.innerHTML = text
                        date.appendChild(p)
                        this.canvasWrapper.appendChild(date)
                        this.addElements.push(date)
                        break
                    }
                  }
                  break
                case 5:
                  label = document.createElement('label')
                  label.id = `radioContainer${element.objectId}_${this.pageNumber}`
                  label.className = 'radioContainer'
                  label.style.position = 'absolute'
                  label.style.left = element.x + 'px'
                  label.style.top = element.y + 'px'
                  label.style.width = element.width + 'px'
                  label.style.height = element.height + 'px'
                  label.style.zIndex = 40
                  radio = document.createElement('input')
                  radio.type = 'radio'
                  radio.checked = element.selected
                  radio.disabled = true
                  radio.id = `radio${element.objectId}_${this.pageNumber}`
                  radio.name = `radio${element.groupId}_${this.pageNumber}`
                  radio.style.left = '0px'
                  radio.style.top = '0px'
                  radio.style.width = element.width + 'px'
                  radio.style.height = element.height + 'px'
                  radio.style.zIndex = 40
                  radiomarkContainer = document.createElement('div')
                  radiomarkContainer.id = `radiomarkContainer${element.objectId}_${this.pageNumber}`
                  radiomarkContainer.className = 'radiomarkContainer'
                  radiomark = document.createElement('div')
                  radiomark.className = 'radiomark'
                  radiomarkContainer.appendChild(radiomark)
                  radiomarkContainer.style.backgroundColor = element.color
                  radiomarkContainer.style.borderRadius = '2px'
                  radiomarkContainer.style.border = `2px solid ${element.stroke}`
                  radiomarkContainer.style.transform = `scale(${
                    element.width / 30
                  })`
                  radiomarkContainer.style.transformOrigin = 'left top'
                  label.appendChild(radio)
                  label.appendChild(radiomarkContainer)
                  if (
                    element.groupId !== null &&
                    element.groupId !== undefined &&
                    (this.radioGroup.find((x) => x.id === element.groupId) ===
                      null ||
                      this.radioGroup.find((x) => x.id === element.groupId) ===
                        undefined)
                  ) {
                    const groupId = element.groupId
                    const children = annotate.data.filter(
                      (y) => y.groupId === groupId && y.type === 5
                    )
                    const radioGroupContainer = document.createElement('div')
                    radioGroupContainer.id = `radioGroupContainer${groupId}_${this.pageNumber}`
                    radioGroupContainer.style.position = 'absolute'
                    radioGroupContainer.style.zIndex = '40'
                    radioGroupContainer.classList.add('required')
                    radioGroupContainer.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    radioGroupContainer.style.top =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) -
                      element.radioStrokeWidth -
                      4 +
                      'px'
                    radioGroupContainer.style.display = 'flex'
                    radioGroupContainer.style.flexDirection = 'column'
                    radioGroupContainer.style.alignItems = 'center'
                    const radioGroupDiv = document.createElement('div')
                    radioGroupDiv.id = `radioGroupDiv_${groupId}`
                    radioGroupDiv.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      element.width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      element.height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * element.radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.border = '2px dashed #3183c8c2'
                    radioGroupDiv.style.zIndex = 20
                    radioGroupDiv.style.borderRadius = '2px'
                    radioGroupContainer.appendChild(radioGroupDiv)
                    let groupTooltip = null
                    if (element.groupLabel && element.groupLabel !== '') {
                      groupTooltip = document.createElement('div')
                      groupTooltip.className = 'tooltip'
                      groupTooltip.id = `radioGroupTooltip${groupId}_${this.pageNumber}`
                      const groupLabel =
                        element.groupLabel.length > 40
                          ? element.groupLabel.substring(0, 40) + '...'
                          : element.groupLabel
                      groupTooltip.innerHTML = `${groupLabel}`
                      groupTooltip.style.top =
                        Math.min(
                          parseFloat(radioGroupContainer.style.top) +
                            parseFloat(radioGroupDiv.style.height) / 2,
                          canvasHeight - 100
                        ) + 'px'
                      groupTooltip.style.left =
                        Math.min(
                          parseFloat(radioGroupContainer.style.left) +
                            parseFloat(radioGroupDiv.style.width) +
                            10,
                          canvasWidth - 150
                        ) + 'px'
                      groupTooltip.style.zIndex = 40
                      groupTooltip.style.display = 'none'
                      self.canvasWrapper.appendChild(groupTooltip)
                      self.addElements.push(groupTooltip)
                    }
                    self.canvasWrapper.appendChild(radioGroupContainer)
                    self.addElements.push(radioGroupContainer)
                    self.radioGroup.push({
                      id: groupId,
                      container: radioGroupContainer,
                      groupDiv: radioGroupDiv,
                      groupTooltip,
                      items: children.map((x) => x.objectId),
                    })
                  }
                  this.canvasWrapper.appendChild(label)
                  this.addElements.push(label)
                  break
                case 6:
                  if (element.options && element.options.length > 0) {
                    const div = document.createElement('div')
                    const select = document.createElement('select')
                    div.appendChild(select)
                    select.disabled = true
                    select.id = `dropdown${element.objectId}_${this.pageNumber}`
                    select.className = 'dropdown'
                    if (element.required) {
                      div.classList.add('required')
                    } else {
                      div.classList.remove('required')
                    }
                    div.style.position = 'absolute'
                    div.style.left = element.x + 'px'
                    div.style.top = element.y + 'px'
                    div.style.width = element.width + 'px'
                    div.style.maxWidth = element.width + 'px'
                    select.style.textOverflow = 'ellipsis'
                    select.style.width = '100%'
                    select.style.height = '100%'
                    div.style.height = element.height + 2 + 'px'
                    fontWeight = element.fontWeight || 'normal'
                    select.style.font = `${fontWeight} ${
                      element.fontSize * element.scale
                    }px ${element.fontFamily}`
                    select.style.fontStyle = element.fontStyle
                    select.style.color = element.textColor || 'rgba(0,0,0,1)'
                    div.style.zIndex = 40
                    div.style.padding = '0px'
                    this.canvasWrapper.appendChild(div)
                    this.addElements.push(div)
                    element.options.forEach((item) => {
                      const option = document.createElement('option')
                      option.className = 'text-body-1 text-truncate'
                      option.value = item.id
                      option.text = item.name
                      select.appendChild(option)
                    })
                    select.value = element.selectOptionId
                  }
                  break
                case 7:
                  attachment = document.createElement('button')
                  attachment.id = `attachment${element.objectId}_${this.pageNumber}`
                  if (element.required) {
                    attachment.classList.add('required')
                  } else {
                    attachment.classList.remove('required')
                  }
                  attachment.style.position = 'absolute'
                  attachment.style.left = element.x + 'px'
                  attachment.style.top = element.y + 'px'
                  attachment.style.width = element.width + 'px'
                  attachment.style.height = element.height + 'px'
                  attachment.style.borderRadius = `${element.rx}px`
                  attachment.style.backgroundColor = element.done
                    ? 'rgba(0, 0, 0, 0.1)'
                    : element.color
                  attachment.style.zIndex = 40
                  attachment.style.padding = '0px'
                  attachment.style.border = `${element.strokeWidth}px solid ${
                    element.done ? 'rgba(0, 0, 0, 0.4)' : element.stroke
                  }`
                  attachment.style.opacity = element.done ? 0.5 : 1
                  attachment.style.display = 'flex'
                  attachment.style.alignItems = 'center'
                  attachment.style.justifyContent = 'center'
                  attachment.style.cursor = 'default'
                  p = document.createElement('p')
                  textNode = document.createTextNode(self.i18n.attachment)
                  p.style.fontSize = '16px'
                  p.style.fontFamily = 'Microsoft JhengHei'
                  p.style.fontWeight = 'bold'
                  p.style.position = 'relative'
                  p.style.display = 'flex'
                  p.style.alignItems = 'center'
                  p.style.justifyContent = 'center'
                  p.style.textAlign = 'center'
                  p.style.marginBottom = '0px'
                  p.style.transform = `scale(${element.scale})`
                  p.style.transformOrigin = 'center center'
                  p.style.minWidth = `${100 / element.scale}%`
                  p.style.minHeight = `${100 / element.scale}%`
                  p.innerHTML =
                    '<i class="v-icon notranslate mdi mdi-paperclip theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                  p.appendChild(textNode)
                  attachment.appendChild(p)
                  this.canvasWrapper.appendChild(attachment)
                  this.addElements.push(attachment)
                  break
                case 8:
                  if (!element.done) {
                    const imageField = document.createElement('button')
                    imageField.id = `imageField${element.objectId}_${this.pageNumber}`
                    if (element.required) {
                      imageField.classList.add('required')
                    } else {
                      imageField.classList.remove('required')
                    }
                    imageField.style.position = 'absolute'
                    imageField.style.left = element.x + 'px'
                    imageField.style.top = element.y + 'px'
                    imageField.style.width = element.width + 'px'
                    imageField.style.height = element.height + 'px'
                    imageField.style.borderRadius = `${element.rx}px`
                    imageField.style.backgroundColor = element.color
                    imageField.style.zIndex = 40
                    imageField.style.padding = '0px'
                    imageField.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    imageField.style.display = 'flex'
                    imageField.style.alignItems = 'center'
                    imageField.style.justifyContent = 'center'
                    imageField.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.image)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="v-icon notranslate mdi mdi-image theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    imageField.appendChild(p)
                    this.canvasWrapper.appendChild(imageField)
                    this.addElements.push(imageField)
                  }
                  break
                case 9:
                  if (!element.done) {
                    const signatureBP = document.createElement('button')
                    signatureBP.id = `signatureBP${element.objectId}_${this.pageNumber}`
                    signatureBP.classList.add('required')
                    signatureBP.style.position = 'absolute'
                    signatureBP.style.left = element.x + 'px'
                    signatureBP.style.top = element.y + 'px'
                    signatureBP.style.width = element.width + 'px'
                    signatureBP.style.height = element.height + 'px'
                    signatureBP.style.borderRadius = `${element.rx}px`
                    signatureBP.style.backgroundColor = element.color
                    signatureBP.style.zIndex = 40
                    signatureBP.style.padding = '0px'
                    signatureBP.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    signatureBP.style.display = 'flex'
                    signatureBP.style.alignItems = 'center'
                    signatureBP.style.justifyContent = 'center'
                    signatureBP.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.signatureBP)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-signatureBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    signatureBP.appendChild(p)
                    this.canvasWrapper.appendChild(signatureBP)
                    this.addElements.push(signatureBP)
                  }
                  break
                case 10:
                  if (!element.done) {
                    const signatureBO = document.createElement('button')
                    signatureBO.id = `signatureBO${element.objectId}_${this.pageNumber}`
                    signatureBO.classList.add('required')
                    signatureBO.style.position = 'absolute'
                    signatureBO.style.left = element.x + 'px'
                    signatureBO.style.top = element.y + 'px'
                    signatureBO.style.width = element.width + 'px'
                    signatureBO.style.height = element.height + 'px'
                    signatureBO.style.borderRadius = `${element.rx}px`
                    signatureBO.style.backgroundColor = element.color
                    signatureBO.style.zIndex = 40
                    signatureBO.style.padding = '0px'
                    signatureBO.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    signatureBO.style.display = 'flex'
                    signatureBO.style.alignItems = 'center'
                    signatureBO.style.justifyContent = 'center'
                    signatureBO.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.signatureBO)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-signatureBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    signatureBO.appendChild(p)
                    this.canvasWrapper.appendChild(signatureBO)
                    this.addElements.push(signatureBO)
                  }
                  break
                case 11:
                  if (!element.done) {
                    const stampBP = document.createElement('button')
                    stampBP.id = `stampBP${element.objectId}_${this.pageNumber}`
                    stampBP.classList.add('required')
                    stampBP.style.position = 'absolute'
                    stampBP.style.left = element.x + 'px'
                    stampBP.style.top = element.y + 'px'
                    stampBP.style.width = element.width + 'px'
                    stampBP.style.height = element.height + 'px'
                    stampBP.style.borderRadius = `${element.rx}px`
                    stampBP.style.backgroundColor = element.color
                    stampBP.style.zIndex = 40
                    stampBP.style.padding = '0px'
                    stampBP.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    stampBP.style.display = 'flex'
                    stampBP.style.alignItems = 'center'
                    stampBP.style.justifyContent = 'center'
                    stampBP.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.stampBP)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-stampBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    stampBP.appendChild(p)
                    this.canvasWrapper.appendChild(stampBP)
                    this.addElements.push(stampBP)
                  }
                  break
                case 12:
                  if (!element.done) {
                    const stampBO = document.createElement('button')
                    stampBO.id = `stampBO${element.objectId}_${this.pageNumber}`
                    stampBO.classList.add('required')
                    stampBO.style.position = 'absolute'
                    stampBO.style.left = element.x + 'px'
                    stampBO.style.top = element.y + 'px'
                    stampBO.style.width = element.width + 'px'
                    stampBO.style.height = element.height + 'px'
                    stampBO.style.borderRadius = `${element.rx}px`
                    stampBO.style.backgroundColor = element.color
                    stampBO.style.zIndex = 40
                    stampBO.style.padding = '0px'
                    stampBO.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    stampBO.style.display = 'flex'
                    stampBO.style.alignItems = 'center'
                    stampBO.style.justifyContent = 'center'
                    stampBO.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(self.i18n.stampBO)
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-stampBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    stampBO.appendChild(p)
                    this.canvasWrapper.appendChild(stampBO)
                    this.addElements.push(stampBO)
                  }
                  break
                case 13:
                  if (!element.done) {
                    const signatureAndStamp = document.createElement('button')
                    signatureAndStamp.id = `signatureAndStamp${element.objectId}_${this.pageNumber}`
                    signatureAndStamp.classList.add('required')
                    signatureAndStamp.style.position = 'absolute'
                    signatureAndStamp.style.left = element.x + 'px'
                    signatureAndStamp.style.top = element.y + 'px'
                    signatureAndStamp.style.width = element.width + 'px'
                    signatureAndStamp.style.height = element.height + 'px'
                    signatureAndStamp.style.borderRadius = `${element.rx}px`
                    signatureAndStamp.style.backgroundColor = element.color
                    signatureAndStamp.style.zIndex = 40
                    signatureAndStamp.style.padding = '0px'
                    signatureAndStamp.style.border = `${element.strokeWidth}px solid ${element.stroke}`
                    signatureAndStamp.style.display = 'flex'
                    signatureAndStamp.style.alignItems = 'center'
                    signatureAndStamp.style.justifyContent = 'center'
                    signatureAndStamp.style.cursor = 'default'
                    const p = document.createElement('p')
                    const text = document.createTextNode(
                      self.i18n.signatureAndStamp
                    )
                    p.style.fontSize = '16px'
                    p.style.fontFamily = 'Microsoft JhengHei'
                    p.style.fontWeight = 'bold'
                    p.style.position = 'relative'
                    p.style.display = 'flex'
                    p.style.alignItems = 'center'
                    p.style.justifyContent = 'center'
                    p.style.textAlign = 'center'
                    p.style.marginBottom = '0px'
                    p.style.transform = `scale(${element.scale})`
                    p.style.transformOrigin = 'center center'
                    p.style.minWidth = `${100 / element.scale}%`
                    p.style.minHeight = `${100 / element.scale}%`
                    p.innerHTML =
                      '<i class="custom-icon icon-signatureAndStamp" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                    p.appendChild(text)
                    signatureAndStamp.appendChild(p)
                    this.canvasWrapper.appendChild(signatureAndStamp)
                    this.addElements.push(signatureAndStamp)
                  }
                  break
              }
            })
          }
        }
        break
    }
  }

  renderCollaborateAnnotate() {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const c = this.canvas.fabric
        if (
          this.annotate &&
          this.annotate.length > 0 &&
          this.annotate.find((x) => x.page === this.pageNumber)
        ) {
          const annotate = this.annotate.find((x) => x.page === this.pageNumber)
          const data = annotate.data
          data.reverse()
          let textArea = null
          let rect = null
          let ellipse = null
          let path = null
          let line = null

          data.forEach((element, index) => {
            if (element.type !== 90) {
              if (element.id) {
                const hex = this.colorList[element.id - 1]
                const r = parseInt(hex.slice(1, 3), 16)
                const g = parseInt(hex.slice(3, 5), 16)
                const b = parseInt(hex.slice(5, 7), 16)
                element.color = element.color ?? `rgba(${r},${g},${b}, 0.6)`
                element.stroke =
                  element.stroke ??
                  `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g}, ${
                    b > 10 ? b - 10 : b
                  })`
              } else {
                element.color = element.color ?? '#f1f5f8'
                element.stroke = element.stroke ?? 'rgb(146, 147, 147)'
              }
              if (element.type === 92) {
                element.color = element.color ?? '#f1f5f8'
                element.stroke = element.stroke ?? 'rgb(146, 147, 147)'
              }
            }
            element.objectId = element.objectId ?? index
            element.strokeWidth = element.strokeWidth ?? 2
            element.rx = element.rx ?? 2
            element.ry = element.ry ?? 2
            element.selected = element.selected ?? false
            element.text = element.text ?? ''
            element.fontSize = element.fontSize ?? 16
            element.fontFamily = element.fontFamily ?? 'Microsoft JhengHei'
            element.checkboxStrokeWidth = element.checkboxStrokeWidth ?? 1
            element.radioStrokeWidth = element.radioStrokeWidth ?? 1
            element.name = element.name ?? ''
            element.label = element.label ?? ''
            element.groupLabel = element.groupLabel ?? ''
            element.validation = element.validation ?? {
              type: null,
              regex: null,
              errorMessage: null,
            }
            element.dateRange = element.dateRange ?? 'signDay'
            element.dateEra = element.dateEra ?? 'common'
            switch (element.type) {
              case 90: {
                let pathString = ''
                for (let i = 0; i < element.path.length; i++) {
                  if (Array.isArray(element.path[i])) {
                    pathString += element.path[i].join(' ')
                  }
                  pathString += ' '
                }
                path = new fabric.Path(pathString.trim(), {
                  type: 'path',
                  originX: 'left',
                  originY: 'top',
                  top: element.y,
                  left: element.x,
                  scaleX: element.scaleX,
                  scaleY: element.scaleY,
                  stroke: element.stroke || '',
                  strokeWidth: element.brushWidth,
                  strokeLineCap: 'round',
                  strokeLineJoin: 'round',
                  id: element.objectId,
                  selectId: element.id,
                  annotateType: 90,
                  fill: '',
                  opacity: element.opacity,
                })
                c.add(path)
                break
              }
              case 91:
                switch (element.shape) {
                  case 'rect':
                    rect = new fabric.Rect({
                      width: element.width,
                      height: element.height,
                      top: element.y,
                      left: element.x,
                      fill: '',
                      rx: element.rx || 0,
                      ry: element.rx || 0,
                      stroke: element.stroke || '',
                      strokeWidth: element.brushWidth * this.scale || 0,
                      id: element.objectId,
                      selectId: element.id,
                      annotateType: 91,
                      type: 'rect',
                    })
                    c.add(rect)
                    break
                  case 'ellipse':
                    ellipse = new fabric.Ellipse({
                      left: element.x,
                      top: element.y,
                      originX: 'left',
                      originY: 'top',
                      rx: element.width / 2,
                      ry: element.height / 2,
                      scaleX: element.scaleX,
                      scaleY: element.scaleY,
                      angle: 0,
                      fill: '',
                      stroke: element.stroke || '',
                      strokeWidth: element.brushWidth * this.scale || 0,
                      strokeUniform: true,
                      id: element.objectId,
                      selectId: element.id,
                      annotateType: 91,
                      type: 'ellipse',
                    })
                    c.add(ellipse)
                    break
                }
                break
              case 92:
                textArea = new fabric.TextArea(element.text, {
                  width: element.width,
                  height: element.height,
                  top: element.y,
                  left: element.x,
                  backgroundColor: element.color,
                  fill: element.fill,
                  id: element.objectId,
                  selectId: element.id,
                  textAlign: 'left',
                  splitByGrapheme: true,
                  backgroundStroke: element.stroke || '',
                  annotateType: 92,
                  originFontSize: element.fontSize || 16,
                  fontSize: element.fontSize * this.scale || 16 * this.scale,
                  fontFamily: element.fontFamily || 'Microsoft JhengHei',
                  fontStyle: element.fontStyle || '',
                  fontWeight: element.fontWeight || '',
                  required: element.required,
                  readonly: element.readonly,
                  maxlength: element.maxlength,
                  label: element.label,
                  validation: element.validation,
                  prefill: element.prefill,
                })
                c.add(textArea)
                break
              case 94: {
                const points = [element.x1, element.y1, element.x2, element.y2]
                line = new fabric.Line(points, {
                  top: element.y,
                  left: element.x,
                  scaleX: element.scaleX,
                  scaleY: element.scaleY,
                  angle: 0,
                  fill: '',
                  stroke: element.stroke || '',
                  strokeWidth: element.brushWidth * this.scale || 0,
                  strokeUniform: true,
                  id: element.objectId,
                  selectId: element.id,
                  annotateType: 94,
                  type: 'line',
                })
                c.add(line)
                break
              }
            }
          })
        }
        if (this.mode === 4 || this.mode === 1) {
          c._historyInit()
          this.eventBus.dispatch('initHistory', {
            page: this.pageNumber,
          })
        }
      }
    }
  }

  cssTransform(viewport) {
    const CSS_UNITS = 96.0 / 72.0
    let childNodes = null
    if (this.canvasWrapper) {
      switch (this.mode) {
        case 0:
        case 1:
          if (this.canvas) {
            const canvas = this.canvas.fabric
            if (canvas) {
              const lowerCanvas = canvas.getElement()
              const upperCanvas = canvas.getSelectionElement()
              const scale = viewport.width / parseInt(lowerCanvas.style.width)
              if (lowerCanvas && upperCanvas) {
                lowerCanvas.style.transform = `scale(${scale})`
                lowerCanvas.style.transformOrigin = 'left top'
                upperCanvas.style.transform = `scale(${scale})`
                upperCanvas.style.transformOrigin = 'left top'
              }
            }
          }
          break
        case 2:
          while (this.canvasWrapper.childNodes.length > 1) {
            this.canvasWrapper.removeChild(this.canvasWrapper.lastChild)
          }
          this.checkboxGroup = []
          this.radioGroup = []
          this.renderHTMLElement(viewport.scale / CSS_UNITS)
          break
        case 4:
          if (this.canvas) {
            const canvas = this.canvas.fabric
            if (canvas) {
              const lowerCanvas = canvas.getElement()
              const upperCanvas = canvas.getSelectionElement()
              const scale = viewport.width / parseInt(lowerCanvas.style.width)
              if (lowerCanvas && upperCanvas) {
                lowerCanvas.style.transform = `scale(${scale})`
                lowerCanvas.style.transformOrigin = 'left top'
                upperCanvas.style.transform = `scale(${scale})`
                upperCanvas.style.transformOrigin = 'left top'
              }
            }
          }
          childNodes = Array.from(this.canvasWrapper.childNodes).filter(
            (node) =>
              node.tagName.toUpperCase() !== 'CANVAS' &&
              !node.classList.contains('canvas-container')
          )
          childNodes.forEach((node) => {
            this.canvasWrapper.removeChild(node)
          })
          this.checkboxGroup = []
          this.radioGroup = []
          this.renderHTMLElement(viewport.scale / CSS_UNITS)
          break
      }
    }
  }

  initAligningGuidelines() {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const c = this.canvas.fabric
        const self = this
        const aligningLineOffset = 5
        const ctx = c.getSelectionContext()
        let viewportTransform
        let zoom = 1
        let verticalLines = []
        let horizontalLines = []

        c.on('mouse:down', function () {
          viewportTransform = c.viewportTransform
          zoom = c.getZoom()
        })

        c.on('object:moving', function (e) {
          if (!c._currentTransform) return
          const activeObject = e.target
          const activeObjectCenter = activeObject.getCenterPoint()
          const activeObjectBoundingRect = activeObject.getBoundingRect()
          const activeObjectHalfHeight =
            activeObjectBoundingRect.height / (2 * viewportTransform[3])
          const activeObjectHalfWidth =
            activeObjectBoundingRect.width / (2 * viewportTransform[0])

          c.getObjects()
            .filter((object) => object !== activeObject && object.visible)
            .forEach((object) => {
              const objectCenter = object.getCenterPoint()
              const objectBoundingRect = object.getBoundingRect()
              const objectHalfHeight =
                objectBoundingRect.height / (2 * viewportTransform[3])
              const objectHalfWidth =
                objectBoundingRect.width / (2 * viewportTransform[0])

              // snap by the horizontal center line
              snapVertical(objectCenter.x, activeObjectCenter.x, objectCenter.x)
              // snap by the left object edge matching left active edge
              snapVertical(
                objectCenter.x - objectHalfWidth,
                activeObjectCenter.x - activeObjectHalfWidth,
                objectCenter.x - objectHalfWidth + activeObjectHalfWidth
              )
              // snap by the left object edge matching right active edge
              snapVertical(
                objectCenter.x - objectHalfWidth,
                activeObjectCenter.x + activeObjectHalfWidth,
                objectCenter.x - objectHalfWidth - activeObjectHalfWidth
              )
              // snap by the right object edge matching right active edge
              snapVertical(
                objectCenter.x + objectHalfWidth,
                activeObjectCenter.x + activeObjectHalfWidth,
                objectCenter.x + objectHalfWidth - activeObjectHalfWidth
              )
              // snap by the right object edge matching left active edge
              snapVertical(
                objectCenter.x + objectHalfWidth,
                activeObjectCenter.x - activeObjectHalfWidth,
                objectCenter.x + objectHalfWidth + activeObjectHalfWidth
              )

              function snapVertical(objEdge, activeEdge, snapCenter) {
                if (self.isInRange(objEdge, activeEdge)) {
                  verticalLines.push({
                    x: objEdge,
                    y1:
                      objectCenter.y < activeObjectCenter.y
                        ? objectCenter.y - objectHalfHeight - aligningLineOffset
                        : objectCenter.y +
                          objectHalfHeight +
                          aligningLineOffset,
                    y2:
                      activeObjectCenter.y > objectCenter.y
                        ? activeObjectCenter.y +
                          activeObjectHalfHeight +
                          aligningLineOffset
                        : activeObjectCenter.y -
                          activeObjectHalfHeight -
                          aligningLineOffset,
                  })
                  activeObject.setPositionByOrigin(
                    new fabric.Point(snapCenter, activeObjectCenter.y),
                    'center',
                    'center'
                  )
                }
              }

              // snap by the vertical center line
              snapHorizontal(
                objectCenter.y,
                activeObjectCenter.y,
                objectCenter.y
              )
              // snap by the top object edge matching the top active edge
              snapHorizontal(
                objectCenter.y - objectHalfHeight,
                activeObjectCenter.y - activeObjectHalfHeight,
                objectCenter.y - objectHalfHeight + activeObjectHalfHeight
              )
              // snap by the top object edge matching the bottom active edge
              snapHorizontal(
                objectCenter.y - objectHalfHeight,
                activeObjectCenter.y + activeObjectHalfHeight,
                objectCenter.y - objectHalfHeight - activeObjectHalfHeight
              )
              // snap by the bottom object edge matching the bottom active edge
              snapHorizontal(
                objectCenter.y + objectHalfHeight,
                activeObjectCenter.y + activeObjectHalfHeight,
                objectCenter.y + objectHalfHeight - activeObjectHalfHeight
              )
              // snap by the bottom object edge matching the top active edge
              snapHorizontal(
                objectCenter.y + objectHalfHeight,
                activeObjectCenter.y - activeObjectHalfHeight,
                objectCenter.y + objectHalfHeight + activeObjectHalfHeight
              )

              function snapHorizontal(objEdge, activeObjEdge, snapCenter) {
                if (self.isInRange(objEdge, activeObjEdge)) {
                  horizontalLines.push({
                    y: objEdge,
                    x1:
                      objectCenter.x < activeObjectCenter.x
                        ? objectCenter.x - objectHalfWidth - aligningLineOffset
                        : objectCenter.x + objectHalfWidth + aligningLineOffset,
                    x2:
                      activeObjectCenter.x > objectCenter.x
                        ? activeObjectCenter.x +
                          activeObjectHalfWidth +
                          aligningLineOffset
                        : activeObjectCenter.x -
                          activeObjectHalfWidth -
                          aligningLineOffset,
                  })
                  activeObject.setPositionByOrigin(
                    new fabric.Point(activeObjectCenter.x, snapCenter),
                    'center',
                    'center'
                  )
                }
              }
            })
        })

        c.on('before:render', () => {
          c.clearContext(c.contextTop)
        })

        c.on('after:render', function () {
          verticalLines.forEach((line) =>
            self.drawVerticalLine(ctx, zoom, viewportTransform, line)
          )
          horizontalLines.forEach((line) =>
            self.drawHorizontalLine(ctx, zoom, viewportTransform, line)
          )

          verticalLines = []
          horizontalLines = []
        })

        c.on('mouse:up', function () {
          c.renderAll()
        })
      }
    }
  }

  drawVerticalLine(ctx, zoom, viewportTransform, coords) {
    this.drawLine(
      ctx,
      zoom,
      viewportTransform,
      coords.x + 0.5,
      coords.y1 > coords.y2 ? coords.y2 : coords.y1,
      coords.x + 0.5,
      coords.y2 > coords.y1 ? coords.y2 : coords.y1
    )
  }

  drawHorizontalLine(ctx, zoom, viewportTransform, coords) {
    this.drawLine(
      ctx,
      zoom,
      viewportTransform,
      coords.x1 > coords.x2 ? coords.x2 : coords.x1,
      coords.y + 0.5,
      coords.x2 > coords.x1 ? coords.x2 : coords.x1,
      coords.y + 0.5
    )
  }

  drawLine(ctx, zoom, viewportTransform, x1, y1, x2, y2) {
    const aligningLineWidth = 2
    const aligningLineColor = 'rgb(255,0,0)'
    const aligningDash = [5, 5]
    ctx.save()
    ctx.lineWidth = aligningLineWidth
    ctx.strokeStyle = aligningLineColor
    ctx.setLineDash(aligningDash)
    ctx.beginPath()
    ctx.moveTo(
      x1 * zoom + viewportTransform[4],
      y1 * zoom + viewportTransform[5]
    )
    ctx.lineTo(
      x2 * zoom + viewportTransform[4],
      y2 * zoom + viewportTransform[5]
    )
    ctx.stroke()
    ctx.restore()
  }

  addPdfAnnotation(newComment) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const orange = new fabric.Circle({
            radius: 10,
            top: newComment.y,
            left: newComment.x,
            fill: newComment.color,
          })
          const rectCenter = orange.getCenterPoint()
          // icon of comment
          // const iconPath = new fabric.Path(
          //   'M20 2H4C2.89 2 2 2.89 2 4V16C2 17.11 2.9 18 4 18H8V21C8 21.55 8.45 22 9 22H9.5C9.75 22 10 21.9 10.2 21.71L13.9 18H20C21.1 18 22 17.1 22 16V4C22 2.89 21.1 2 20 2M9.08 15H7V12.91L13.17 6.72L15.24 8.8L9.08 15M16.84 7.2L15.83 8.21L13.76 6.18L14.77 5.16C14.97 4.95 15.31 4.94 15.55 5.16L16.84 6.41C17.05 6.62 17.06 6.96 16.84 7.2Z',
          //   {
          //     left: rectCenter.x,
          //     top: rectCenter.y,
          //     originX: 'center',
          //     originY: 'center',
          //     scaleX: 1,
          //     scaleY: 1,
          //     fill: '#000',
          //   }
          // )
          const cornerNumber = new fabric.Text(`${newComment.id + 1}`, {
            fontSize: 10,
            fill: 'black',
            originX: 'center',
            originY: 'center',
            left: rectCenter.x,
            top: rectCenter.y,
          })

          const group = new fabric.Group([orange, cornerNumber])
          group.set({
            id: newComment.id,
            scaleX: this.scale,
            scaleY: this.scale,
            type: 16,
          })
          canvas.add(group)
          newComment.scale = this.scale
        }
      }
    }
  }

  removePdfAnnotation(id) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          canvas.remove(
            canvas.getObjects().find((obj) => obj.type === 16 && obj.id === id)
          )
        }
      }
    }
  }

  focusPdfAnnotation(id) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas
            .getObjects()
            .find((obj) => obj.type === 16 && obj.id === id)
          if (obj) {
            canvas.setActiveObject(obj)
            canvas.requestRenderAll()
          }
        }
      }
    }
  }

  /**
   * return true if value2 is within value1 +/- aligningLineMargin
   * @param {number} value1
   * @param {number} value2
   * @returns Boolean
   */
  isInRange(value1, value2) {
    const aligningLineMargin = 4
    return (
      value2 > value1 - aligningLineMargin &&
      value2 < value1 + aligningLineMargin
    )
  }

  // Match both rgb() and rgba() formats
  getRGBA(str) {
    const regex =
      /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*\.?\d+)\s*)?\)/
    const match = str.match(regex)
    if (!match) return null
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] !== undefined ? parseFloat(match[4]) : 1,
    }
  }

  setState(state, data = null) {
    this.state = state
    const self = this
    const cursor = document.getElementById('cursor')
    let selectId = null
    let prefill = false
    if (cursor) {
      if (
        cursor.getAttribute('data-select-id') &&
        cursor.getAttribute('data-select-id') !== 'prefill'
      ) {
        selectId = +cursor.getAttribute('data-select-id')
      } else if (
        cursor.getAttribute('data-select-id') &&
        cursor.getAttribute('data-select-id') === 'prefill'
      ) {
        selectId = null
        prefill = true
      }
    }
    this.setRequiredElementStyle()
    const cursorCheckbox = document.getElementById('cursorCheckbox')
    const cursorRadio = document.getElementById('cursorRadio')
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (self.mode === 1 || self.mode === 4) {
            if (state !== 90) {
              canvas.isDrawingMode = false
              this.DrawBrush = false
              canvas.freeDrawingBrush = null
            }
            if (this.activeType.text) {
              this.activeType.text = false
            }
            if (!Object.values(self.geometryMode).every((v) => v === false)) {
              if (self.mode === 4) {
                canvas.off('mouse:down')
              }
              canvas.off('mouse:move')
            }
            if (self.mode === 4) {
              canvas.off('mouse:up')
            }
            canvas.off('path:created')
          }
          let deltaX = 0
          let deltaY = 0
          let anno = null

          switch (state) {
            case 0: // pointer
              if (self.mode === 1 || self.mode === 4) {
                self.geometryMode.geometry = false
                self.geometryMode.line = false
                self.geometryMode.arrow = false
                canvas.off('path:created')
                self.setIsAllowTouchScrolling(true)
              }
              if (self.mode === 4) {
                canvas.off('mouse:down')
                canvas.off('mouse:out')
                canvas.off('mouse:up')
              }
              canvas.off('mouse:move')
              canvas.defaultCursor = 'default'
              self.eventBus.dispatch('removeAnnotateToggled', {
                source: self,
              })
              break
            case 1: // sign
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                let rect = null
                let imageGroup = null
                if (self.mode !== 5) {
                  rect = new fabric.LabeledRect({
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    top: posY,
                    left: posX,
                    fill: cursor.style.backgroundColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    name: self.i18n.signature,
                    icon: 'signature',
                    id,
                    selectId,
                    annotateType: 0,
                    required: true,
                    label: '',
                    textDirection: false,
                    scale: self.scale,
                  })
                  canvas.add(rect)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    id: selectId,
                    objectId: id,
                    type: 0,
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    scale: self.scale,
                    required: true,
                    label: '',
                    textDirection: false,
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(rect)
                } else {
                  fabric.Image.fromURL(data.base64, function (img) {
                    rect = new fabric.Rect({
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      fill: 'transparent',
                      originX: 'center',
                      originY: 'center',
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      selectId,
                      annotateType: 0,
                      required: true,
                      label: '',
                      textDirection: false,
                      scale: self.scale,
                    })
                    const bounds = rect.getBoundingRect()

                    const scaleFactor = Math.min(
                      Math.min(1, bounds.width / img.width),
                      Math.min(1, bounds.height / img.height)
                    )
                    img.scale(scaleFactor)
                    img.set({
                      top:
                        bounds.top +
                        Math.max(bounds.height - img.height * scaleFactor, 0) /
                          2,
                      left:
                        bounds.left +
                        Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                    })
                    imageGroup = new fabric.Group([rect, img], {
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      annotateType: 0,
                      required: true,
                      label: '',
                      scale: self.scale,
                    })

                    canvas.add(imageGroup)
                    canvas._historySaveAction()

                    anno = {
                      x: posX,
                      y: posY,
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      id: selectId,
                      objectId: id,
                      type: 0,
                      color: cursor.style.backgroundColor,
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      scale: self.scale,
                      required: true,
                      label: '',
                      done: true,
                      data: data.base64,
                      imageData: img.toDataURL(),
                      imageWidth: img.width * scaleFactor,
                      imageHeight: img.height * scaleFactor,
                      textDirection: false,
                    }
                    self.insertAnnotate(anno)
                    self.setState(0)
                    canvas.setActiveObject(imageGroup)
                  })
                }
              })
              break
            case 2: // text
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                if (self.mode !== 5) {
                  const validation = {
                    type: null,
                    regex: null,
                    errorMessage: null,
                  }
                  const textArea = new fabric.TextArea('', {
                    width: parseFloat(cursor.style.width),
                    height: parseFloat(cursor.style.height),
                    top: posY,
                    left: posX,
                    backgroundColor: cursor.style.backgroundColor,
                    id,
                    selectId,
                    originFontSize: 16,
                    fontSize: 16 * self.scale,
                    fontFamily: 'Microsoft JhengHei',
                    fontStyle: '',
                    fontWeight: '',
                    singleLine: false,
                    textDirection: false,
                    fill: 'black',
                    textAlign: 'left',
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    backgroundStroke: cursor.style.borderColor,
                    backgroundStrokeWidth: parseFloat(cursor.style.borderWidth),
                    annotateType: 1,
                    required: true,
                    readonly: false,
                    maxlength: 4000,
                    label: '',
                    validation,
                    prefill,
                    lockScalingY: false,
                    textColor: 'rgba(0,0,0,1)',
                    scale: self.scale,
                  })
                  canvas.add(textArea)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width: parseFloat(cursor.style.width),
                    height: parseFloat(cursor.style.height),
                    id: selectId,
                    objectId: id,
                    type: 1,
                    fill: 'black',
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    text: textArea.text,
                    scale: self.scale,
                    required: true,
                    readonly: false,
                    singleLine: false,
                    textDirection: false,
                    textAlign: 'left',
                    fontSize: 16,
                    fontFamily: 'Microsoft JhengHei',
                    fontStyle: '',
                    fontWeight: '',
                    maxlength: 4000,
                    validation,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    label: '',
                    prefill,
                    lockScalingY: false,
                    textColor: 'rgba(0,0,0,1)',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(textArea)
                } else {
                  const text = new fabric.Text(data.text, {
                    width: parseFloat(cursor.style.width),
                    height: parseFloat(cursor.style.height),
                    top: posY,
                    left: posX,
                    backgroundColor: cursor.style.backgroundColor,
                    id,
                    selectId,
                    singleLine: false,
                    textDirection: false,
                    originFontSize: data.style.fontSize,
                    fontSize: data.style.fontSize * self.scale,
                    fontFamily: data.style.fontFamily,
                    fontStyle: '',
                    fontWeight: '',
                    fill: 'black',
                    textAlign: 'left',
                    annotateType: 1,
                    textColor: 'rgba(0,0,0,1)',
                    scale: self.scale,
                  })
                  text.setControlsVisibility({
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    mtr: false,
                    tl: false,
                    tr: false,
                    bl: false,
                    br: false,
                  })
                  canvas.add(text)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width: parseFloat(cursor.style.width),
                    height: parseFloat(cursor.style.height),
                    id: selectId,
                    objectId: id,
                    type: 1,
                    fill: 'black',
                    singleLine: false,
                    textDirection: false,
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    text: data.text,
                    scale: self.scale,
                    required: true,
                    readonly: false,
                    fontSize: data.style.fontSize,
                    textAlign: 'left',
                    fontFamily: data.style.fontFamily,
                    fontStyle: '',
                    fontWeight: '',
                    maxlength: 4000,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    label: '',
                    prefill,
                    textColor: 'rgba(0,0,0,1)',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(text)
                }
              })
              break
            case 3: // checkbox
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const checkboxGroupIdArray = self.checkboxGroup.map(
                  (group) => group.id
                )
                const groupId =
                  checkboxGroupIdArray.length > 0
                    ? Math.max(...checkboxGroupIdArray) + 1
                    : 1
                const checkbox = self.createCheckbox(
                  {
                    width:
                      parseFloat(cursor.style.width) -
                      2 * parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      2 * parseFloat(cursor.style.borderWidth),
                    originWidth: parseFloat(cursor.style.width),
                    originHeight: parseFloat(cursor.style.height),
                    color: cursor.style.backgroundColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    checkboxColor: cursorCheckbox.style.backgroundColor,
                    checkboxStrokeWidth: parseFloat(
                      cursorCheckbox.style.borderWidth
                    ),
                    originFontSize: 28,
                    checkboxStroke: cursorCheckbox.style.borderColor,
                    x: posX + parseFloat(cursor.style.borderWidth) / 2,
                    y: posY + parseFloat(cursor.style.borderWidth) / 2,
                    selected: !!prefill,
                    groupId,
                    objectId: id,
                    id: selectId,
                    centerWidth: parseFloat(cursorCheckbox.style.width),
                    centerHeight: parseFloat(cursorCheckbox.style.height),
                    required: true,
                    readonly: false,
                    ruleId: 0,
                    maximum: 1,
                    minimum: 0,
                    label: '',
                    groupLabel: '',
                    prefill,
                    newAdd: true,
                    scale: self.scale,
                  },
                  canvas
                )
                canvas._historySaveAction()
                anno = {
                  x: posX + parseFloat(cursor.style.borderWidth) / 2,
                  y: posY + parseFloat(cursor.style.borderWidth) / 2,
                  width:
                    parseFloat(cursor.style.width) -
                    2 * parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    2 * parseFloat(cursor.style.borderWidth),
                  originWidth: parseFloat(cursor.style.width),
                  originHeight: parseFloat(cursor.style.height),
                  centerWidth: parseFloat(cursorCheckbox.style.width),
                  centerHeight: parseFloat(cursorCheckbox.style.height),
                  originFontSize: 28,
                  id: selectId,
                  objectId: id,
                  type: 2,
                  color: cursor.style.backgroundColor,
                  checkboxColor: cursorCheckbox.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  checkboxStrokeWidth: parseFloat(
                    cursorCheckbox.style.borderWidth
                  ),
                  checkboxStroke: cursorCheckbox.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  selected: !!prefill,
                  scale: self.scale,
                  required: true,
                  readonly: false,
                  groupId,
                  ruleId: 0,
                  maximum: 1,
                  minimum: 0,
                  label: '',
                  groupLabel: '',
                  prefill,
                }

                self.insertAnnotate(anno)

                const checkboxGroupContainer = document.createElement('div')
                checkboxGroupContainer.id = `checkboxGroupContainer${groupId}_${this.pageNumber}`
                checkboxGroupContainer.style.position = 'absolute'
                checkboxGroupContainer.style.left = posX - 4 + 'px'
                checkboxGroupContainer.style.top = posY - 4 + 'px'
                checkboxGroupContainer.style.display = !prefill
                  ? 'flex'
                  : 'none'
                checkboxGroupContainer.style.flexDirection = 'column'
                checkboxGroupContainer.style.alignItems = 'center'
                const checkboxGroupDiv = document.createElement('div')
                checkboxGroupDiv.id = `checkboxGroupDiv_${groupId}`
                checkboxGroupDiv.style.width =
                  parseFloat(cursor.style.width) + 1 + 8 + 'px'
                checkboxGroupDiv.style.height =
                  parseFloat(cursor.style.height) + 1 + 8 + 'px'
                checkboxGroupDiv.style.border = '2px dashed #3183c8c2'
                checkboxGroupDiv.style.zIndex = 20
                checkboxGroupDiv.style.borderRadius = '2px'
                checkboxGroupContainer.appendChild(checkboxGroupDiv)
                let addCheckboxBtn = null
                if (!prefill) {
                  addCheckboxBtn = document.createElement('button')
                  addCheckboxBtn.id = `addCheckboxBtn_${groupId}`
                  addCheckboxBtn.type = 'button'
                  addCheckboxBtn.style.width = '16px'
                  addCheckboxBtn.style.height = '16px'
                  addCheckboxBtn.style.backgroundColor = '#3183c8'
                  addCheckboxBtn.style.border = 'none'
                  addCheckboxBtn.style.fontSize = '16px'
                  addCheckboxBtn.style.cursor = 'pointer'
                  addCheckboxBtn.style.display = 'flex'
                  addCheckboxBtn.style.alignItems = 'center'
                  addCheckboxBtn.style.justifyContent = 'center'
                  addCheckboxBtn.style.borderRadius = '2px'
                  addCheckboxBtn.style.zIndex = 30
                  const icon = document.createElement('i')
                  icon.className =
                    'v-icon notranslate mdi mdi-plus theme--light'
                  icon.style.fontSize = '18px'
                  icon.style.color = 'white'
                  addCheckboxBtn.appendChild(icon)
                  addCheckboxBtn.addEventListener('mouseup', function (e) {
                    const groupId = +addCheckboxBtn.id.split('_')[1]
                    const id =
                      Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    const checkboxChildren = self.annotate
                      .find((x) => x.page === self.pageNumber)
                      .data.filter((y) => y.groupId === groupId && y.type === 2)

                    if (checkboxChildren.length > 0) {
                      const checkboxChild = checkboxChildren[0]
                      const top =
                        Math.max.apply(
                          Math,
                          checkboxChildren.map(function (child) {
                            return child.y
                          })
                        ) +
                        checkboxChild.height +
                        8
                      const left =
                        (Math.min.apply(
                          Math,
                          checkboxChildren.map(function (child) {
                            return child.x
                          })
                        ) +
                          Math.max.apply(
                            Math,
                            checkboxChildren.map(function (child) {
                              return child.x
                            })
                          )) /
                        2
                      const addCheckbox = self.createCheckbox(
                        {
                          width: checkboxChild.width,
                          height: checkboxChild.height,
                          originWidth: checkboxChild.originWidth,
                          originHeight: checkboxChild.originHeight,
                          color: checkboxChild.color,
                          rx: checkboxChild.rx,
                          ry: checkboxChild.ry,
                          strokeWidth: checkboxChild.strokeWidth,
                          stroke: checkboxChild.stroke,
                          checkboxColor: checkboxChild.checkboxColor,
                          checkboxStrokeWidth:
                            checkboxChild.checkboxStrokeWidth,
                          checkboxStroke: checkboxChild.checkboxStroke,
                          x: left,
                          y: top,
                          selected: false,
                          groupId,
                          objectId: id,
                          id: checkboxChild.id,
                          centerWidth: checkboxChild.centerWidth,
                          centerHeight: checkboxChild.centerHeight,
                          required: true,
                          readonly: false,
                          ruleId: checkboxChild.ruleId,
                          maximum: checkboxChild.maximum,
                          minimum: checkboxChild.minimum,
                          label: '',
                          groupLabel: checkboxChild.groupLabel,
                          newAdd: true,
                          originFontSize: checkboxChild.originFontSize,
                          scale: checkboxChild.scale,
                        },
                        canvas
                      )
                      canvas._historySaveAction()

                      self.annotate
                        .find((x) => x.page === self.pageNumber)
                        .data.unshift({
                          x: left,
                          y: top,
                          width: checkboxChild.width,
                          height: checkboxChild.height,
                          originWidth: checkboxChild.originWidth,
                          originHeight: checkboxChild.originHeight,
                          centerWidth: checkboxChild.centerWidth,
                          centerHeight: checkboxChild.centerHeight,
                          id: checkboxChild.id,
                          objectId: id,
                          type: checkboxChild.type,
                          color: checkboxChild.color,
                          checkboxColor: checkboxChild.checkboxColor,
                          strokeWidth: checkboxChild.strokeWidth,
                          stroke: checkboxChild.stroke,
                          checkboxStrokeWidth:
                            checkboxChild.checkboxStrokeWidth,
                          checkboxStroke: checkboxChild.checkboxStroke,
                          rx: checkboxChild.rx,
                          ry: checkboxChild.ry,
                          selected: false,
                          scale: checkboxChild.scale,
                          required: true,
                          readonly: false,
                          groupId,
                          ruleId: checkboxChild.ruleId,
                          maximum: checkboxChild.maximum,
                          minimum: checkboxChild.minimum,
                          label: '',
                          groupLabel: checkboxChild.groupLabel,
                          originFontSize: checkboxChild.originFontSize,
                        })

                      canvas.setActiveObject(addCheckbox)

                      const groupDiv = document.getElementById(
                        `checkboxGroupDiv_${groupId}`
                      )

                      groupDiv.style.height =
                        parseFloat(groupDiv.style.height) +
                        checkboxChild.height +
                        8 +
                        'px'
                      const group = self.checkboxGroup.find(
                        (x) => x.id === groupId
                      )
                      if (group) {
                        group.items.push(id)
                      }
                    }
                  })
                  checkboxGroupContainer.appendChild(addCheckboxBtn)

                  self.checkboxGroup.push({
                    id: groupId,
                    container: checkboxGroupContainer,
                    groupDiv: checkboxGroupDiv,
                    addCheckboxBtn,
                    items: [id],
                    ruleId: 0,
                    maximum: 1,
                    minimum: 0,
                  })
                }
                self.canvasWrapper.appendChild(checkboxGroupContainer)
                self.addElements.push(checkboxGroupContainer)

                self.setState(0)
                canvas.setActiveObject(checkbox)
              })
              break
            case 4: // stamp
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                let rect = null
                let imageGroup = null
                if (self.mode !== 5) {
                  rect = new fabric.LabeledRect({
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    top: posY,
                    left: posX,
                    fill: cursor.style.backgroundColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    name: self.i18n.stamp,
                    icon: 'stamp',
                    id,
                    selectId,
                    annotateType: 3,
                    required: true,
                    label: '',
                    scale: self.scale,
                  })
                  canvas.add(rect)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    id: selectId,
                    objectId: id,
                    type: 3,
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    scale: self.scale,
                    required: true,
                    label: '',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(rect)
                } else {
                  fabric.Image.fromURL(data.base64, function (img) {
                    rect = new fabric.Rect({
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      fill: 'transparent',
                      originX: 'center',
                      originY: 'center',
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      selectId,
                      annotateType: 3,
                      required: true,
                      label: '',
                      scale: self.scale,
                    })
                    const bounds = rect.getBoundingRect()

                    const scaleFactor = Math.min(
                      Math.min(1, bounds.width / img.width),
                      Math.min(1, bounds.height / img.height)
                    )
                    img.scale(scaleFactor)
                    img.set({
                      top:
                        bounds.top +
                        Math.max(bounds.height - img.height * scaleFactor, 0) /
                          2,
                      left:
                        bounds.left +
                        Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                    })
                    imageGroup = new fabric.Group([rect, img], {
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      annotateType: 3,
                      required: true,
                      label: '',
                      scale: self.scale,
                    })

                    canvas.add(imageGroup)
                    canvas._historySaveAction()

                    anno = {
                      x: posX,
                      y: posY,
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      id: selectId,
                      objectId: id,
                      type: 3,
                      color: cursor.style.backgroundColor,
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      scale: self.scale,
                      required: true,
                      label: '',
                      done: true,
                      data: data.base64,
                      imageData: img.toDataURL(),
                      imageWidth: img.width * scaleFactor,
                      imageHeight: img.height * scaleFactor,
                    }
                    self.insertAnnotate(anno)

                    self.setState(0)
                    canvas.setActiveObject(imageGroup)
                  })
                }
              })
              break
            case 5: // date
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                if (self.mode !== 5) {
                  const rect = new fabric.Date({
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    top: posY,
                    left: posX,
                    fill: cursor.style.backgroundColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    name: self.i18n.date,
                    icon: 'calendar-month',
                    fontSize: 16,
                    fontFamily: 'Microsoft JhengHei',
                    fontStyle: '',
                    fontWeight: '',
                    id,
                    selectId,
                    annotateType: 4,
                    dateFormat: 'YYYY/MM/DD',
                    dateRange: 'signDay',
                    label: '',
                    required: true,
                    text: '',
                    readonly: false,
                    dateEra: 'common',
                    textColor: 'rgba(0,0,0,1)',
                    textDirection: false,
                    scale: self.scale,
                  })
                  canvas.add(rect)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    id: selectId,
                    objectId: id,
                    type: 4,
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    scale: self.scale,
                    fontSize: 16,
                    fontFamily: 'Microsoft JhengHei',
                    fontStyle: '',
                    fontWeight: '',
                    required: true,
                    dateFormat: 'YYYY/MM/DD',
                    dateRange: 'signDay',
                    label: '',
                    text: '',
                    readonly: false,
                    dateEra: 'common',
                    textColor: 'rgba(0,0,0,1)',
                    textDirection: false,
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(rect)
                } else {
                  const text = new fabric.Text(data.text, {
                    width: parseFloat(cursor.style.width),
                    height: parseFloat(cursor.style.height),
                    top: posY,
                    left: posX,
                    backgroundColor: cursor.style.backgroundColor,
                    id,
                    selectId,
                    singleLine: false,
                    textDirection: false,
                    originFontSize: data.style.fontSize,
                    fontSize: data.style.fontSize * self.scale,
                    fontFamily: data.style.fontFamily,
                    dateEra: data.style.dateEra,
                    dateFormat: data.style.dateFormat,
                    data: data.date,
                    fontStyle: '',
                    fontWeight: '',
                    fill: 'black',
                    textAlign: 'left',
                    annotateType: 4,
                    textColor: 'rgba(0,0,0,1)',
                    scale: self.scale,
                  })
                  text.setControlsVisibility({
                    mb: false,
                    ml: false,
                    mr: false,
                    mt: false,
                    mtr: false,
                    tl: false,
                    tr: false,
                    bl: false,
                    br: false,
                  })
                  canvas.add(text)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width: parseFloat(cursor.style.width),
                    height: parseFloat(cursor.style.height),
                    id: selectId,
                    objectId: id,
                    type: 4,
                    fill: 'black',
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    text: data.text,
                    scale: self.scale,
                    required: true,
                    readonly: false,
                    fontSize: data.style.fontSize,
                    singleLine: false,
                    textDirection: false,
                    textAlign: 'left',
                    fontFamily: data.style.fontFamily,
                    dateEra: data.style.dateEra,
                    dateFormat: data.style.dateFormat,
                    data: data.date,
                    fontStyle: '',
                    fontWeight: '',
                    maxlength: 4000,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    label: '',
                    prefill,
                    textColor: 'rgba(0,0,0,1)',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(text)
                }
              })
              break
            case 6: // radioBtn
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                let id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const radioGroupIdArray = self.radioGroup.map(
                  (group) => group.id
                )
                const groupId =
                  radioGroupIdArray.length > 0
                    ? Math.max(...radioGroupIdArray) + 1
                    : 1

                const radioOpt = {
                  width:
                    parseFloat(cursor.style.width) -
                    2 * parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    2 * parseFloat(cursor.style.borderWidth),
                  originWidth: parseFloat(cursor.style.width),
                  originHeight: parseFloat(cursor.style.height),
                  color: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  radioBackgroundColor: cursorRadio.style.backgroundColor,
                  radioStrokeWidth: parseFloat(cursorRadio.style.borderWidth),
                  radioStroke: cursorRadio.style.borderColor,
                  x: posX + parseFloat(cursor.style.borderWidth) / 2,
                  y: posY + parseFloat(cursor.style.borderWidth) / 2,
                  selected: !!prefill,
                  groupId,
                  objectId: id,
                  id: selectId,
                  centerWidth: parseFloat(cursorRadio.style.width),
                  centerHeight: parseFloat(cursorRadio.style.height),
                  required: true,
                  readonly: false,
                  label: '',
                  groupLabel: '',
                  prefill,
                  newAdd: true,
                  originFontSize: 28,
                  scale: self.scale,
                }
                const radio = self.createRadio(radioOpt)
                canvas.add(radio)
                canvas._historySaveAction()

                anno = {
                  x: posX + parseFloat(cursor.style.borderWidth) / 2,
                  y: posY + parseFloat(cursor.style.borderWidth) / 2,
                  width:
                    parseFloat(cursor.style.width) -
                    2 * parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    2 * parseFloat(cursor.style.borderWidth),
                  originWidth: parseFloat(cursor.style.width),
                  originHeight: parseFloat(cursor.style.height),
                  centerWidth: parseFloat(cursorRadio.style.width),
                  centerHeight: parseFloat(cursorRadio.style.height),
                  id: selectId,
                  objectId: id,
                  type: 5,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  radioBackgroundColor: cursorRadio.style.backgroundColor,
                  radioStrokeWidth: parseFloat(cursorRadio.style.borderWidth),
                  radioStroke: cursorRadio.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  selected: !!prefill,
                  scale: self.scale,
                  required: true,
                  readonly: false,
                  groupId,
                  label: '',
                  groupLabel: '',
                  prefill,
                  originFontSize: 28,
                }
                self.insertAnnotate(Object.assign({}, anno))

                let radio2 = null
                if (!prefill) {
                  id =
                    Math.max(
                      ...self.annotate
                        .find((x) => x.page === self.pageNumber)
                        .data.map((y) => y.objectId)
                    ) + 1
                  anno.objectId = radioOpt.objectId = id
                  anno.y = radioOpt.y =
                    posY +
                    parseFloat(cursor.style.borderWidth) / 2 +
                    radio.height +
                    8

                  radio2 = self.createRadio(radioOpt)
                  canvas.add(radio2)
                  canvas._historySaveAction()
                  self.insertAnnotate(Object.assign({}, anno))
                }

                const radioGroupContainer = document.createElement('div')
                radioGroupContainer.id = `radioGroupContainer${groupId}_${this.pageNumber}`
                radioGroupContainer.style.position = 'absolute'
                radioGroupContainer.style.left = posX - 4 + 'px'
                radioGroupContainer.style.top = posY - 4 + 'px'
                radioGroupContainer.style.display = !prefill ? 'flex' : 'none'
                radioGroupContainer.style.flexDirection = 'column'
                radioGroupContainer.style.alignItems = 'center'
                const radioGroupDiv = document.createElement('div')
                radioGroupDiv.id = `radioGroupDiv_${groupId}`
                radioGroupDiv.classList.add('required')
                radioGroupDiv.style.width =
                  parseFloat(cursor.style.width) + 8 + 'px'
                if (!prefill) {
                  radioGroupDiv.style.height =
                    2 * parseFloat(cursor.style.height) + 11 + 'px'
                } else {
                  radioGroupDiv.style.height =
                    parseFloat(cursor.style.height) + 6 + 'px'
                }
                radioGroupDiv.style.border = '2px dashed #3183c8c2'
                radioGroupDiv.style.zIndex = 20
                radioGroupDiv.style.borderRadius = '2px'
                radioGroupContainer.appendChild(radioGroupDiv)
                let addRadioBtn = null
                if (!prefill) {
                  addRadioBtn = document.createElement('button')
                  addRadioBtn.id = `addRadioBtn_${groupId}`
                  addRadioBtn.type = 'button'
                  addRadioBtn.style.width = '16px'
                  addRadioBtn.style.height = '16px'
                  addRadioBtn.style.backgroundColor = '#3183c8'
                  addRadioBtn.style.border = 'none'
                  addRadioBtn.style.fontSize = '16px'
                  addRadioBtn.style.cursor = 'pointer'
                  addRadioBtn.style.display = 'flex'
                  addRadioBtn.style.alignItems = 'center'
                  addRadioBtn.style.justifyContent = 'center'
                  addRadioBtn.style.borderRadius = '2px'
                  addRadioBtn.style.zIndex = 30
                  const icon = document.createElement('i')
                  icon.className =
                    'v-icon notranslate mdi mdi-plus theme--light'
                  icon.style.fontSize = '18px'
                  icon.style.color = 'white'
                  addRadioBtn.appendChild(icon)
                  addRadioBtn.addEventListener('mouseup', function (e) {
                    const groupId = +addRadioBtn.id.split('_')[1]
                    const id =
                      Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    const radioChildren = self.annotate
                      .find((x) => x.page === self.pageNumber)
                      .data.filter((y) => y.groupId === groupId && y.type === 5)

                    if (radioChildren.length > 0) {
                      const radioChild = radioChildren[0]
                      const top =
                        Math.max.apply(
                          Math,
                          radioChildren.map(function (child) {
                            return child.y
                          })
                        ) +
                        radioChild.height +
                        8
                      const left =
                        (Math.min.apply(
                          Math,
                          radioChildren.map(function (child) {
                            return child.x
                          })
                        ) +
                          Math.max.apply(
                            Math,
                            radioChildren.map(function (child) {
                              return child.x
                            })
                          )) /
                        2
                      const addradio = self.createRadio({
                        width: radioChild.width,
                        height: radioChild.height,
                        originWidth: radioChild.originWidth,
                        originHeight: radioChild.originHeight,
                        color: radioChild.color,
                        rx: radioChild.rx,
                        ry: radioChild.ry,
                        strokeWidth: radioChild.strokeWidth,
                        stroke: radioChild.stroke,
                        radioBackgroundColor: radioChild.radioBackgroundColor,
                        radioStrokeWidth: radioChild.radioStrokeWidth,
                        radioStroke: radioChild.radioStroke,
                        x: left,
                        y: top,
                        selected: false,
                        groupId,
                        objectId: id,
                        id: radioChild.id,
                        centerWidth: radioChild.centerWidth,
                        centerHeight: radioChild.centerHeight,
                        required: true,
                        readonly: false,
                        label: '',
                        groupLabel: radioChild.groupLabel,
                        newAdd: true,
                        originFontSize: radioChild.originFontSize || 28,
                        scale: self.scale,
                      })
                      canvas.add(addradio)
                      canvas._historySaveAction()
                      self.annotate
                        .find((x) => x.page === self.pageNumber)
                        .data.unshift({
                          x: left,
                          y: top,
                          width: radioChild.width,
                          height: radioChild.height,
                          originWidth: radioChild.originWidth,
                          originHeight: radioChild.originHeight,
                          centerWidth: radioChild.centerWidth,
                          centerHeight: radioChild.centerHeight,
                          id: radioChild.id,
                          objectId: id,
                          type: radioChild.type,
                          color: radioChild.color,
                          strokeWidth: radioChild.strokeWidth,
                          stroke: radioChild.stroke,
                          radioBackgroundColor: radioChild.radioBackgroundColor,
                          radioStrokeWidth: radioChild.radioStrokeWidth,
                          radioStroke: radioChild.radioStroke,
                          rx: radioChild.rx,
                          ry: radioChild.ry,
                          selected: false,
                          scale: radioChild.scale,
                          required: true,
                          readonly: false,
                          groupId,
                          label: '',
                          groupLabel: radioChild.groupLabel,
                          originFontSize: radioChild.originFontSize || 28,
                        })
                      const groupDiv = document.getElementById(
                        `radioGroupDiv_${groupId}`
                      )
                      groupDiv.style.height =
                        parseFloat(groupDiv.style.height) +
                        radioChild.height +
                        8 +
                        'px'
                      const group = self.radioGroup.find(
                        (x) => x.id === groupId
                      )
                      if (group) {
                        group.items.push(id)
                      }
                      canvas.discardActiveObject().renderAll()
                    }
                  })
                  radioGroupContainer.appendChild(addRadioBtn)
                }
                self.canvasWrapper.appendChild(radioGroupContainer)
                self.addElements.push(radioGroupContainer)
                self.radioGroup.push({
                  id: groupId,
                  container: radioGroupContainer,
                  groupDiv: radioGroupDiv,
                  addRadioBtn,
                  items: !prefill ? [radio.id, radio2.id] : [radio.id],
                })
                self.setState(0)
                canvas.setActiveObject(radio)
              })
              break
            case 7: // dropdown
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const dropdown = new fabric.Dropdown({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.select,
                  id,
                  selectId,
                  annotateType: 6,
                  fontSize: 16,
                  fontFamily: 'Microsoft JhengHei',
                  fontStyle: '',
                  fontWeight: '',
                  required: true,
                  readonly: false,
                  selectOptionId: null,
                  options: [],
                  label: '',
                  textColor: 'rgba(0,0,0,1)',
                  scale: self.scale,
                })
                canvas.add(dropdown)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 6,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  readonly: false,
                  fontSize: 16,
                  fontFamily: 'Microsoft JhengHei',
                  fontStyle: '',
                  fontWeight: '',
                  selectOptionId: null,
                  options: [],
                  label: '',
                  textColor: 'rgba(0,0,0,1)',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(dropdown)
              })
              break
            case 8: // file
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const rect = new fabric.LabeledRect({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.attachment,
                  icon: 'paperclip',
                  id,
                  selectId,
                  annotateType: 7,
                  required: true,
                  label: '',
                  prefill,
                  scale: self.scale,
                })
                canvas.add(rect)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 7,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  label: '',
                  prefill,
                  attachments: data != null ? data.base64 : [],
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(rect)
              })
              break
            case 9: // picture
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                let rect = null
                let imageGroup = null
                if (self.mode !== 5) {
                  rect = new fabric.LabeledRect({
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    top: posY,
                    left: posX,
                    fill: cursor.style.backgroundColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    name: self.i18n.image,
                    icon: 'image',
                    id,
                    selectId,
                    annotateType: 8,
                    required: true,
                    label: '',
                    scale: self.scale,
                  })
                  canvas.add(rect)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    id: selectId,
                    objectId: id,
                    type: 8,
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    scale: self.scale,
                    required: true,
                    label: '',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(rect)
                } else {
                  fabric.Image.fromURL(data.base64, function (img) {
                    rect = new fabric.Rect({
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      fill: 'transparent',
                      originX: 'center',
                      originY: 'center',
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      selectId,
                      annotateType: 8,
                      required: true,
                      label: '',
                      scale: self.scale,
                    })
                    const bounds = rect.getBoundingRect()

                    const scaleFactor = Math.min(
                      Math.min(1, bounds.width / img.width),
                      Math.min(1, bounds.height / img.height)
                    )
                    img.scale(scaleFactor)
                    img.set({
                      top:
                        bounds.top +
                        Math.max(bounds.height - img.height * scaleFactor, 0) /
                          2,
                      left:
                        bounds.left +
                        Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                    })
                    imageGroup = new fabric.Group([rect, img], {
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      annotateType: 8,
                      required: true,
                      label: '',
                      scale: self.scale,
                    })

                    canvas.add(imageGroup)
                    canvas._historySaveAction()

                    anno = {
                      x: posX,
                      y: posY,
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      id: selectId,
                      objectId: id,
                      type: 8,
                      color: cursor.style.backgroundColor,
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      scale: self.scale,
                      required: true,
                      label: '',
                      done: true,
                      data: data.base64,
                      imageData: img.toDataURL(),
                      imageWidth: img.width * scaleFactor,
                      imageHeight: img.height * scaleFactor,
                    }
                    self.insertAnnotate(anno)

                    self.setState(0)
                    canvas.setActiveObject(imageGroup)
                  })
                }
              })
              break
            case 10: // signatureBP
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const rect = new fabric.LabeledRect({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.signatureBP,
                  icon: 'signatureBP',
                  id,
                  selectId,
                  annotateType: 9,
                  required: true,
                  label: '',
                  scale: self.scale,
                })
                canvas.add(rect)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 9,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  label: '',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(rect)
              })
              break
            case 11: // signatureBO
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const rect = new fabric.LabeledRect({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.signatureBO,
                  icon: 'signatureBO',
                  id,
                  selectId,
                  annotateType: 10,
                  required: true,
                  label: '',
                  scale: self.scale,
                })
                canvas.add(rect)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 10,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  label: '',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(rect)
              })
              break
            case 12: // stampBP
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const rect = new fabric.LabeledRect({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.stampBP,
                  icon: 'stampBP',
                  id,
                  selectId,
                  annotateType: 11,
                  required: true,
                  label: '',
                  scale: self.scale,
                })
                canvas.add(rect)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 11,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  label: '',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(rect)
              })
              break
            case 13: // stampBO
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const rect = new fabric.LabeledRect({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.stampBO,
                  icon: 'stampBO',
                  id,
                  selectId,
                  annotateType: 12,
                  required: true,
                  label: '',
                  scale: self.scale,
                })
                canvas.add(rect)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 12,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  label: '',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(rect)
              })
              break
            case 14: // signatureAndStamp
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                let rect = null
                rect = new fabric.LabeledRect({
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  top: posY,
                  left: posX,
                  fill: cursor.style.backgroundColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  name: self.i18n.signatureAndStamp,
                  icon: 'signatureAndStamp',
                  id,
                  selectId,
                  annotateType: 13,
                  required: true,
                  label: '',
                  scale: self.scale,
                })
                canvas.add(rect)
                canvas._historySaveAction()

                anno = {
                  x: posX,
                  y: posY,
                  width:
                    parseFloat(cursor.style.width) -
                    parseFloat(cursor.style.borderWidth),
                  height:
                    parseFloat(cursor.style.height) -
                    parseFloat(cursor.style.borderWidth),
                  id: selectId,
                  objectId: id,
                  type: 13,
                  color: cursor.style.backgroundColor,
                  strokeWidth: parseFloat(cursor.style.borderWidth),
                  stroke: cursor.style.borderColor,
                  rx: parseFloat(cursor.style.borderRadius),
                  ry: parseFloat(cursor.style.borderRadius),
                  scale: self.scale,
                  required: true,
                  label: '',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                canvas.setActiveObject(rect)
              })
              break
            case 15: // canvas
              canvas.on('mouse:move', function (obj) {
                cursor.style.opacity = '1'
              })
              canvas.on('mouse:out', function (obj) {
                cursor.style.opacity = '0'
              })
              canvas.on('mouse:up', function (obj) {
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                let rect = null
                let imageGroup = null
                if (self.mode !== 5) {
                  rect = new fabric.LabeledRect({
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    top: posY,
                    left: posX,
                    fill: cursor.style.backgroundColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    name: self.i18n.canvas,
                    icon: 'message-draw',
                    id,
                    selectId,
                    annotateType: 14,
                    required: false,
                    label: '',
                    scale: self.scale,
                  })
                  canvas.add(rect)
                  canvas._historySaveAction()

                  anno = {
                    x: posX,
                    y: posY,
                    width:
                      parseFloat(cursor.style.width) -
                      parseFloat(cursor.style.borderWidth),
                    height:
                      parseFloat(cursor.style.height) -
                      parseFloat(cursor.style.borderWidth),
                    id: selectId,
                    objectId: id,
                    type: 14,
                    color: cursor.style.backgroundColor,
                    strokeWidth: parseFloat(cursor.style.borderWidth),
                    stroke: cursor.style.borderColor,
                    rx: parseFloat(cursor.style.borderRadius),
                    ry: parseFloat(cursor.style.borderRadius),
                    scale: self.scale,
                    required: false,
                    label: '',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(rect)
                } else {
                  fabric.Image.fromURL(data.base64, function (img) {
                    rect = new fabric.Rect({
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      fill: 'transparent',
                      originX: 'center',
                      originY: 'center',
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      selectId,
                      annotateType: 14,
                      required: false,
                      label: '',
                      scale: self.scale,
                    })
                    const bounds = rect.getBoundingRect()

                    const scaleFactor = Math.min(
                      Math.min(1, bounds.width / img.width),
                      Math.min(1, bounds.height / img.height)
                    )
                    img.scale(scaleFactor)
                    img.set({
                      top:
                        bounds.top +
                        Math.max(bounds.height - img.height * scaleFactor, 0) /
                          2,
                      left:
                        bounds.left +
                        Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                    })
                    imageGroup = new fabric.Group([rect, img], {
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      top: posY,
                      left: posX,
                      id,
                      annotateType: 14,
                      required: false,
                      label: '',
                      scale: self.scale,
                    })

                    canvas.add(imageGroup)
                    canvas._historySaveAction()

                    anno = {
                      x: posX,
                      y: posY,
                      width: parseFloat(cursor.style.width),
                      height: parseFloat(cursor.style.height),
                      id: selectId,
                      objectId: id,
                      type: 14,
                      color: cursor.style.backgroundColor,
                      rx: parseFloat(cursor.style.borderRadius),
                      ry: parseFloat(cursor.style.borderRadius),
                      scale: self.scale,
                      required: false,
                      label: '',
                      done: true,
                      data: data.base64,
                      imageData: img.toDataURL(),
                      imageWidth: img.width * scaleFactor,
                      imageHeight: img.height * scaleFactor,
                    }
                    self.insertAnnotate(anno)

                    self.setState(0)
                    canvas.setActiveObject(imageGroup)
                  })
                }
              })
              break
            case 16: // comment, don't delete
              break
            // draw
            case 90:
              // set brush
              if (canvas.isDrawingMode && self.DrawBrush) {
                self.changeBrushColor()
                self.changeBrushWidth()
                self.changeBrushOpacity()
              }
              canvas.on('mouse:down', function (e) {
                self.eventBus.dispatch('deselectCanvas', {
                  source: self,
                })
              })
              canvas.on('path:created', function (o) {
                if (canvas.isDrawingMode && self.DrawBrush) {
                  const id =
                    self.annotate &&
                    self.annotate.find((x) => x.page === self.pageNumber) &&
                    self.annotate.find((x) => x.page === self.pageNumber).data
                      .length > 0
                      ? Math.max(
                          ...self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.map((y) => y.objectId)
                        ) + 1
                      : 1
                  const selectId = 1
                  o.path.set({
                    scaleX: 1,
                    scaleY: 1,
                    id,
                    selectId,
                    annotateType: 90,
                    opacity: self.drawColor.brush[self.activeType.brush].a,
                    scale: self.scale,
                  })
                  canvas._historySaveAction()

                  anno = {
                    x: o.path.left,
                    y: o.path.top,
                    width: o.path.width,
                    height: o.path.height,
                    id: selectId,
                    objectId: id,
                    type: 90,
                    color: o.path.stroke,
                    strokeWidth: o.path.strokeWidth,
                    stroke: `rgb(${
                      self.drawColor.brush[self.activeType.brush].r
                    }, ${self.drawColor.brush[self.activeType.brush].g}, ${
                      self.drawColor.brush[self.activeType.brush].b
                    })`,
                    path: o.path.path,
                    fill: null,
                    scale: self.scale,
                    scaleX: 1,
                    scaleY: 1,
                    brushWidth: o.path.strokeWidth,
                    opacity: self.drawColor.brush[self.activeType.brush].a,
                  }
                  self.insertAnnotate(anno)

                  if (self.mode === 4) {
                    self.eventBus.dispatch('notifyAnnotateChanged', {
                      page: self.pageNumber,
                      fabricUndo: canvas.historyUndo,
                      fabricRedo: canvas.historyRedo,
                      fabricNextState: canvas.historyNextState,
                      historyProcessing: canvas.historyProcessing,
                    })
                  }
                }
              })
              break
            // geometry
            case 91:
              self.changeCursorAppearance('crosshair', 'crosshair', 'crosshair')
              self.initGeometryMode('geometry')
              canvas.on('mouse:down', function (o) {
                self.eventBus.dispatch('deselectCanvas', {
                  source: self,
                })
                if (self.geometryMode.geometry) {
                  self.isDown = true
                  self.setIsAllowTouchScrolling(false)

                  // lock background object while draging geometry
                  const activeObject = canvas.getActiveObject()
                  if (activeObject) {
                    activeObject.lockMovementX = true
                    activeObject.lockMovementY = true
                    activeObject.selectable = false
                    activeObject.evented = false
                  }
                }
                if (self.isDown) {
                  canvas.selectionColor = 'transparent'
                  const selectId = 1

                  const id =
                    self.annotate &&
                    self.annotate.find((x) => x.page === self.pageNumber) &&
                    self.annotate.find((x) => x.page === self.pageNumber).data
                      .length > 0
                      ? Math.max(
                          ...self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.map((y) => y.objectId)
                        ) + 1
                      : 1
                  const pointer = canvas.getPointer(o.e)
                  self.origX = pointer.x
                  self.origY = pointer.y
                  self.changeGeometryColor()
                  self.changeGeometryWidth()
                  self.rect = null
                  self.ellipse = null
                  switch (self.geometryShape.id) {
                    case 1:
                      self.rect = new fabric.Rect({
                        left: self.origX,
                        top: self.origY,
                        width: pointer.x - self.origX,
                        height: pointer.y - self.origY,
                        fill: '',
                        stroke: self.drawColor.geometry,
                        type: 'rect',
                        strokeWidth: self.drawWidth.geometry * self.scale,
                        id,
                        selectId,
                        annotateType: 91,
                        hasBorders: false,
                        hasControls: false,
                        scale: self.scale,
                      })
                      canvas.add(self.rect)

                      anno = {
                        x: self.origX,
                        y: self.origY,
                        width: pointer.x - self.origX,
                        height: pointer.y - self.origY,
                        id: selectId,
                        objectId: id,
                        type: 91,
                        shape: 'rect',
                        strokeWidth: self.drawWidth.geometry * self.scale,
                        stroke: self.drawColor.geometry,
                        rx: 0,
                        ry: 0,
                        scale: self.scale,
                        brushWidth: self.drawWidth.geometry,
                      }
                      self.insertAnnotate(anno)

                      canvas.setActiveObject(self.rect)
                      break
                    case 2:
                      self.ellipse = new fabric.Ellipse({
                        left: self.origX,
                        top: self.origY,
                        originX: 'left',
                        originY: 'top',
                        rx: pointer.x - self.origX,
                        ry: pointer.y - self.origY,
                        angle: 0,
                        fill: '',
                        stroke: self.drawColor.geometry,
                        strokeWidth: self.drawWidth.geometry * self.scale,
                        type: 'ellipse',
                        id,
                        selectId,
                        annotateType: 91,
                        strokeUniform: true,
                        hasBorders: false,
                        hasControls: false,
                        scale: self.scale,
                      })
                      canvas.add(self.ellipse)

                      anno = {
                        x: self.origX,
                        y: self.origY,
                        width: pointer.x - self.origX,
                        height: pointer.y - self.origY,
                        rx: pointer.x - self.origX,
                        ry: pointer.y - self.origY,
                        id: selectId,
                        objectId: id,
                        type: 91,
                        shape: 'ellipse',
                        strokeWidth: self.drawWidth.geometry * self.scale,
                        stroke: self.drawColor.geometry,
                        scale: self.scale,
                        scaleX: 1,
                        scaleY: 1,
                        brushWidth: self.drawWidth.geometry,
                        strokeUniform: true,
                      }
                      self.insertAnnotate(anno)

                      canvas.setActiveObject(self.ellipse)
                  }
                }
              })
              canvas.on('mouse:move', function (o) {
                const pointer = canvas.getPointer(o.e)
                if (
                  self.isDown &&
                  self.geometryMode.geometry &&
                  (self.rect || self.ellipse)
                ) {
                  switch (self.geometryShape.id) {
                    case 1:
                      if (self.origX > pointer.x) {
                        self.rect.set({ left: Math.abs(pointer.x) })
                      }
                      if (self.origY > pointer.y) {
                        self.rect.set({ top: Math.abs(pointer.y) })
                      }
                      self.rect.set({ width: Math.abs(self.origX - pointer.x) })
                      self.rect.set({
                        height: Math.abs(self.origY - pointer.y),
                      })
                      break
                    case 2: {
                      if (self.ellipse === null) {
                        return
                      }
                      let rx = Math.abs(self.origX - pointer.x) / 2
                      let ry = Math.abs(self.origY - pointer.y) / 2
                      if (rx > self.ellipse.strokeWidth) {
                        rx -= self.ellipse.strokeWidth / 2
                      }
                      if (ry > self.ellipse.strokeWidth) {
                        ry -= self.ellipse.strokeWidth / 2
                      }
                      self.ellipse.set({ rx, ry })

                      if (self.origX > pointer.x) {
                        self.ellipse.set({ originX: 'right' })
                      } else {
                        self.ellipse.set({ originX: 'left' })
                      }
                      if (self.origY > pointer.y) {
                        self.ellipse.set({ originY: 'bottom' })
                      } else {
                        self.ellipse.set({ originY: 'top' })
                      }
                      break
                    }
                  }
                  canvas.renderAll()
                }
              })
              canvas.on('mouse:up', function (o) {
                // self.initDrawToolBar()
                if (self.geometryMode.geometry) {
                  canvas.selectionColor = self.defaultSelectionColor
                  if (self.isDown) {
                    if (self.rect) {
                      const element = self.annotate.find(
                        (x) => x.page === self.pageNumber
                      ).data[0]
                      if (self.rect.width === 0 || self.rect.height === 0) {
                        canvas.remove(canvas.getActiveObject())
                        self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.shift()
                      } else {
                        const pointer = canvas.getPointer(o.e)
                        element.width = pointer.x - self.origX
                        element.height = pointer.y - self.origY
                        self.rect.hasBorders = true
                        self.rect.hasControls = true
                        canvas.renderAll()
                        canvas._historySaveAction()
                      }
                    } else if (self.ellipse) {
                      const element = self.annotate.find(
                        (x) => x.page === self.pageNumber
                      ).data[0]
                      if (
                        self.ellipse.width === 0 ||
                        self.ellipse.height === 0
                      ) {
                        canvas.remove(canvas.getActiveObject())
                        self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.shift()
                      } else {
                        const pointer = canvas.getPointer(o.e)
                        element.width = pointer.x - self.origX
                        element.height = pointer.y - self.origY
                        self.ellipse.hasBorders = true
                        self.ellipse.hasControls = true
                        canvas.renderAll()
                        canvas._historySaveAction()
                      }
                    }
                  }

                  const items = canvas.getObjects()
                  if (!items) {
                    return
                  }

                  items.forEach(function (item) {
                    if (!item.selectable) {
                      item.selectable = true
                      item.evented = true
                      item.lockMovementX = false
                      item.lockMovementY = false
                    }
                  })
                  self.isDown = false
                  if (self.mode === 4) {
                    self.eventBus.dispatch('notifyAnnotateChanged', {
                      page: self.pageNumber,
                      fabricUndo: canvas.historyUndo,
                      fabricRedo: canvas.historyRedo,
                      fabricNextState: canvas.historyNextState,
                      historyProcessing: canvas.historyProcessing,
                    })
                  }
                  self.eventBus.dispatch('deselectCanvas')
                }
              })
              break
            // text
            case 92:
              self.changeCursorAppearance('text', 'grab', 'move')
              self.activeType.text = true
              Object.keys(self.geometryMode).every(
                (v) => (self.geometryMode[v] = false)
              )
              canvas.on('mouse:move', function (obj) {
                canvas.defaultCursor = 'text'
              })
              canvas.on('mouse:out', function (obj) {
                canvas.defaultCursor = 'default'
              })
              canvas.on('mouse:up', function (obj) {
                if (self.isTextEditing) {
                  return
                }
                let drawBGCText = null
                if (!self.activeType.text) {
                  return
                }
                self.changeTextSize()
                self.changeTextBGC()
                self.changeTextBGOpacity()
                self.changeTextColor()
                drawBGCText = `rgba(${self.drawBGC.text.r},${self.drawBGC.text.g},${self.drawBGC.text.b},${self.drawBGC.text.a})`
                const pointer = canvas.getPointer(obj.e)
                const posX = pointer.x
                const posY = pointer.y
                const id =
                  self.annotate &&
                  self.annotate.find((x) => x.page === self.pageNumber) &&
                  self.annotate.find((x) => x.page === self.pageNumber).data
                    .length > 0
                    ? Math.max(
                        ...self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.map((y) => y.objectId)
                      ) + 1
                    : 1
                const validation = {
                  type: null,
                  regex: null,
                  errorMessage: null,
                }
                const textArea = new fabric.TextArea('', {
                  width: 120 * self.scale,
                  height: 40 * self.scale,
                  top: posY,
                  left: posX,
                  backgroundColor: drawBGCText,
                  id,
                  selectId,
                  originFontSize: self.drawWidth.text,
                  fontSize: self.drawWidth.text * self.scale,
                  fontFamily: 'Microsoft JhengHei',
                  fontStyle: '',
                  fontWeight: '',
                  fill: self.drawColor.text,
                  textAlign: 'left',
                  splitByGrapheme: true,
                  backgroundStroke: 'transparent',
                  annotateType: 92,
                  required: false,
                  readonly: false,
                  maxlength: 4000,
                  label: '',
                  validation,
                  prefill,
                  textColor: 'rgba(0,0,0,1)',
                  scale: self.scale,
                })
                canvas.add(textArea)

                anno = {
                  x: posX,
                  y: posY,
                  width: 120 * self.scale,
                  height: 40 * self.scale,
                  id: selectId,
                  objectId: id,
                  type: 92,
                  fill: self.drawColor.text,
                  color: drawBGCText,
                  stroke: 'transparent',
                  text: textArea.text,
                  scale: self.scale,
                  required: false,
                  readonly: false,
                  fontSize: self.drawWidth.text,
                  fontFamily: 'Microsoft JhengHei',
                  fontStyle: '',
                  fontWeight: '',
                  maxlength: 4000,
                  validation,
                  label: '',
                  prefill,
                  textColor: 'rgba(0,0,0,1)',
                }
                self.insertAnnotate(anno)

                if (self.mode === 4) {
                  self.eventBus.dispatch('notifyAnnotateChanged', {
                    page: self.pageNumber,
                    fabricUndo: canvas.historyUndo,
                    fabricRedo: canvas.historyRedo,
                    fabricNextState: canvas.historyNextState,
                    historyProcessing: canvas.historyProcessing,
                  })
                }
                canvas.setActiveObject(textArea)
                self.isTextEditing = true
                textArea.enterEditing()
                setTimeout(() => {
                  const checkEvent = (e) => {
                    if (
                      ((self.isTextEditing && !textArea.isEditing) ||
                        e.target.tagName !== 'CANVAS') &&
                      self.annotate
                    ) {
                      if (textArea.text === '') {
                        canvas.remove(textArea)
                        self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.shift()
                      } else {
                        self.annotate.find(
                          (x) => x.page === self.pageNumber
                        ).data[0].text = textArea.text
                        canvas._historySaveAction()

                        // 特殊狀況，未釐清（若無此，text編輯完後畫的物件將無法正常儲存）
                        if (e.target.tagName === 'CANVAS') {
                          canvas.undo()
                        } else {
                          canvas.undo()
                          canvas.redo()
                        }
                        canvas.renderAll()
                      }
                      textArea.exitEditing()
                      self.isTextEditing = false
                      document.removeEventListener('click', checkEvent)
                    }
                  }
                  document.addEventListener('click', checkEvent)
                }, 0)
              })
              break
            // arrow (not ready)
            case 93:
              self.changeCursorAppearance('crosshair', 'crosshair', 'crosshair')
              self.initGeometryMode('arrow')
              canvas.on('mouse:down', function (o) {
                self.eventBus.dispatch('deselectCanvas', {
                  source: self,
                })
                if (self.geometryMode.arrow) {
                  self.isDown = true
                  self.setIsAllowTouchScrolling(false)

                  // lock background object while draging geometry
                  const activeObject = canvas.getActiveObject()
                  if (activeObject) {
                    activeObject.lockMovementX = true
                    activeObject.lockMovementY = true
                    activeObject.selectable = false
                    activeObject.evented = false
                  }
                }
                if (self.isDown) {
                  const selectId = 1
                  const id =
                    self.annotate &&
                    self.annotate.find((x) => x.page === self.pageNumber) &&
                    self.annotate.find((x) => x.page === self.pageNumber).data
                      .length > 0
                      ? Math.max(
                          ...self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.map((y) => y.objectId)
                        ) + 1
                      : 1
                  const pointer = canvas.getPointer(o.e)
                  self.origX = pointer.x
                  self.origY = pointer.y
                  // self.changeGeometryColor()
                  // self.changeGeometryWidth()
                  self.line = null
                  self.triangle = null
                  const points = [pointer.x, pointer.y, pointer.x, pointer.y]
                  self.line = new fabric.Line(points, {
                    strokeWidth: 6,
                    fill: 'red',
                    stroke: 'red',
                    originX: 'center',
                    originY: 'center',
                    id,
                    selectId,
                    type: 'arrow',
                    annotateType: 93,
                    scale: self.scale,
                  })
                  const centerX = (self.line.x1 + self.line.x2) / 2
                  const centerY = (self.line.y1 + self.line.y2) / 2
                  deltaX = self.line.left - centerX
                  deltaY = self.line.top - centerY

                  self.triangle = new fabric.Triangle({
                    left: self.line.get('x1') + deltaX,
                    top: self.line.get('y1') + deltaY,
                    originX: 'center',
                    originY: 'center',
                    selectable: false,
                    pointType: 'arrow_start',
                    angle: -45,
                    width: 20,
                    height: 20,
                    fill: 'red',
                    id: 'arrow_triangle',
                    scale: self.scale,
                  })
                  canvas.add(self.line, self.triangle)
                }
              })
              canvas.on('mouse:move', function (o) {
                const pointer = canvas.getPointer(o.e)
                if (self.isDown && self.geometryMode.arrow) {
                  self.line.set({
                    x2: pointer.x,
                    y2: pointer.y,
                  })
                  self.triangle.set({
                    left: pointer.x + deltaX,
                    top: pointer.y + deltaY,
                    angle: self._FabricCalcArrowAngle(
                      self.line.x1,
                      self.line.y1,
                      self.line.x2,
                      self.line.y2
                    ),
                  })
                  canvas.renderAll()
                }
              })
              canvas.on('mouse:up', function (o) {
                // self.initDrawToolBar()
                if (self.geometryMode.arrow) {
                  const group = new window.fabric.Group(
                    [self.line, self.triangle],
                    {
                      borderColor: 'black',
                      cornerColor: 'green',
                      lockScalingFlip: true,
                      typeOfGroup: 'arrow',
                      userLevel: 1,
                      name: 'my_ArrowGroup',
                      type: 'arrow',
                    }
                  )
                  canvas.remove(self.line, self.triangle) // removing old object
                  canvas.add(group)
                  const items = canvas.getObjects()

                  if (!items) {
                    return
                  }

                  items.forEach(function (item) {
                    if (!item.selectable) {
                      item.selectable = true
                      item.evented = true
                      item.lockMovementX = false
                      item.lockMovementY = false
                    }
                  })
                  self.isDown = false
                  self.geometryMode.arrow = false
                  if (self.mode === 4) {
                    self.eventBus.dispatch('notifyAnnotateChanged', {
                      page: self.pageNumber,
                      fabricUndo: canvas.historyUndo,
                      fabricRedo: canvas.historyRedo,
                      fabricNextState: canvas.historyNextState,
                      historyProcessing: canvas.historyProcessing,
                    })
                  }
                  self.setState(0)
                  self.setIsAllowTouchScrolling(true)
                }
              })
              break
            // line
            case 94:
              self.changeCursorAppearance('crosshair', 'crosshair', 'crosshair')
              self.initGeometryMode('line')
              canvas.on('mouse:down', function (o) {
                self.eventBus.dispatch('deselectCanvas', {
                  source: self,
                })
                if (self.geometryMode.line) {
                  self.isDown = true
                  self.setIsAllowTouchScrolling(false)

                  // lock background object while draging geometry
                  const activeObject = canvas.getActiveObject()
                  if (activeObject) {
                    activeObject.lockMovementX = true
                    activeObject.lockMovementY = true
                    activeObject.selectable = false
                    activeObject.evented = false
                  }
                }
                if (self.isDown) {
                  const selectId = 1
                  const id =
                    self.annotate &&
                    self.annotate.find((x) => x.page === self.pageNumber) &&
                    self.annotate.find((x) => x.page === self.pageNumber).data
                      .length > 0
                      ? Math.max(
                          ...self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.map((y) => y.objectId)
                        ) + 1
                      : 1
                  const pointer = canvas.getPointer(o.e)
                  self.origX = pointer.x
                  self.origY = pointer.y
                  self.changeLineColor()
                  self.changeLineWidth()
                  const points = [pointer.x, pointer.y, pointer.x, pointer.y]
                  canvas.selectionColor = 'transparent'
                  self.line = new fabric.Line(points, {
                    strokeWidth: self.drawWidth.line * self.scale,
                    stroke: self.drawColor.line,
                    originX: 'center',
                    originY: 'center',
                    id,
                    selectId,
                    type: 'line',
                    annotateType: 94,
                    strokeUniform: true,
                    hasBorders: false,
                    hasControls: false,
                    scale: self.scale,
                  })
                  canvas.add(self.line)

                  anno = {
                    width: pointer.x - self.origX,
                    height: pointer.y - self.origY,
                    id: selectId,
                    objectId: id,
                    scaleX: 1,
                    scaleY: 1,
                    type: 94,
                    shape: 'line',
                    strokeWidth: self.drawWidth.line * self.scale,
                    stroke: self.drawColor.line || '#5b811e',
                    scale: self.scale,
                    brushWidth: self.drawWidth.line || 5,
                    x1: self.line.x1,
                    y1: self.line.y1,
                  }
                  self.insertAnnotate(anno)

                  canvas.setActiveObject(self.line)
                }
              })
              canvas.on('mouse:move', function (o) {
                const pointer = canvas.getPointer(o.e)
                if (self.isDown && self.geometryMode.line) {
                  self.line.set({
                    x2: pointer.x,
                    y2: pointer.y,
                  })

                  canvas.renderAll()
                }
              })
              canvas.on('mouse:up', function (o) {
                // self.initDrawToolBar()
                if (self.geometryMode.line) {
                  canvas.selectionColor = self.defaultSelectionColor
                  if (self.isDown) {
                    const element = self.annotate.find(
                      (x) => x.page === self.pageNumber
                    ).data[0]
                    if (self.line.width === 0 && self.line.height === 0) {
                      canvas.remove(canvas.getActiveObject())
                      self.annotate
                        .find((x) => x.page === self.pageNumber)
                        .data.shift()
                    } else {
                      const pointer = canvas.getPointer(o.e)
                      element.x2 = self.line.x2
                      element.y2 = self.line.y2
                      element.x = Math.min(pointer.x, self.origX)
                      element.y = Math.min(pointer.y, self.origY)
                      self.line.hasBorders = true
                      self.line.hasControls = true
                      canvas.renderAll()
                      canvas._historySaveAction()
                    }
                  }

                  const items = canvas.getObjects()
                  if (!items) {
                    return
                  }

                  items.forEach(function (item) {
                    if (!item.selectable) {
                      item.selectable = true
                      item.evented = true
                      item.lockMovementX = false
                      item.lockMovementY = false
                    }
                  })

                  self.isDown = false
                  if (self.mode === 4) {
                    self.eventBus.dispatch('notifyAnnotateChanged', {
                      page: self.pageNumber,
                      fabricUndo: canvas.historyUndo,
                      fabricRedo: canvas.historyRedo,
                      fabricNextState: canvas.historyNextState,
                      historyProcessing: canvas.historyProcessing,
                    })
                  }
                  self.eventBus.dispatch('deselectCanvas')
                }
              })
              break
          }
        }
      }
    }
  }

  changeCursorAppearance(
    defaultCursor = 'auto',
    hoverCursor = 'grab',
    moveCursor = 'move'
  ) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        this.canvas.fabric.defaultCursor = defaultCursor
        this.canvas.fabric.hoverCursor = hoverCursor
        this.canvas.fabric.moveCursor = moveCursor
      }
    }
  }

  // switch all Geometry tool to off
  initGeometryMode(tool) {
    Object.entries(this.geometryMode).forEach(([key, value]) => {
      this.geometryMode[key] = key === tool
    })
  }

  // arrow line
  _FabricCalcArrowAngle = function (x1, y1, x2, y2) {
    let angle = 0
    const x = x2 - x1
    const y = y2 - y1
    if (x === 0) {
      angle = y === 0 ? 0 : y > 0 ? Math.PI / 2 : (Math.PI * 3) / 2
    } else if (y === 0) {
      angle = x > 0 ? 0 : Math.PI
    } else {
      angle =
        x < 0
          ? Math.atan(y / x) + Math.PI
          : y < 0
          ? Math.atan(y / x) + 2 * Math.PI
          : Math.atan(y / x)
    }
    return (angle * 180) / Math.PI + 90
  }

  // init draw toolbar
  initDrawToolBar() {
    this.eventBus.dispatch('initDrawTool')
  }

  changeBrushColor(selectedColor, id) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        if (id !== undefined) {
          const canvas = this.canvas.fabric
          if (canvas) {
            if (selectedColor) {
              this.drawColor.brush[id] = this.hex2rgb(
                selectedColor,
                id === 0 ? 1 : 0.5
              )
            } else {
              this.drawColor.brush[id] = this.hex2rgb(
                this.role === 'HOST' ? '#1C6A9D' : '#000000',
                id === 0 ? 1 : 0.5
              )
            }
            this.changeBrushType(id)
          }
        } else if (!this.drawColor.brush[this.activeType.brush]) {
          this.drawColor.brush[this.activeType.brush] = this.hex2rgb(
            this.role === 'HOST' ? '#1C6A9D' : '#000000',
            1
          )
          this.changeBrushType(this.activeType.brush)
        } else {
          this.changeBrushType(this.activeType.brush)
        }
      }
    }
  }

  hex2rgb(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b, a: opacity }
  }

  changeBrushOpacity(selectedOpacity, id) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        if (id !== undefined) {
          const canvas = this.canvas.fabric
          if (canvas) {
            this.drawColor.brush[id].a = selectedOpacity
          }
          this.changeBrushType(id)
        }
      }
    }
  }

  changeBrushType(id) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        if (id !== undefined) {
          this.activeType.brush = id
          const canvas = this.canvas.fabric
          if (canvas) {
            canvas.freeDrawingBrush.color = `rgba(${this.drawColor.brush[id].r},${this.drawColor.brush[id].g},${this.drawColor.brush[id].b},${this.drawColor.brush[id].a})`
            canvas.freeDrawingBrush.width =
              this.drawWidth.brush[id] * this.scale
          }
        }
      }
    }
  }

  changeGeometryShape(selectedShape) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          this.geometryShape.id = selectedShape
        }
      }
    }
  }

  changeGeometryColor(selectedColor) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedColor) {
            this.drawColor.geometry = selectedColor
          } else if (!this.drawColor.geometry) {
            this.drawColor.geometry = '#000'
          }
        }
      }
    }
  }

  changeLineColor(selectedColor) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedColor) {
            this.drawColor.line = selectedColor
          } else if (!this.drawColor.line) {
            this.drawColor.line = '#000'
          }
        }
      }
    }
  }

  changeBrushWidth(selectedWidth, id) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (id !== undefined) {
          if (canvas) {
            if (selectedWidth) {
              this.drawWidth.brush[id] = selectedWidth
              canvas.freeDrawingBrush.width = selectedWidth * this.scale
            } else if (this.drawWidth.brush[id]) {
              canvas.freeDrawingBrush.width =
                this.drawWidth.brush[id] * this.scale
            } else {
              this.drawWidth.brush[id] = 10
              canvas.freeDrawingBrush.width = 10 * this.scale
            }
          }
          this.changeBrushType(id)
        }
      }
    }
  }

  changeGeometryWidth(selectedWidth) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedWidth) {
            this.drawWidth.geometry = selectedWidth
          } else if (!this.drawWidth.geometry) {
            this.drawWidth.geometry = 1
          }
        }
      }
    }
  }

  changeLineWidth(selectedWidth) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedWidth) {
            this.drawWidth.line = selectedWidth
          } else if (!this.drawWidth.line) {
            this.drawWidth.line = 1
          }
        }
      }
    }
  }

  changeTextSize(selectedWidth) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedWidth) {
            this.drawWidth.text = selectedWidth
          } else if (!this.drawWidth.text) {
            this.drawWidth.text = 26
          }
        }
      }
    }
  }

  changeTextBGC(selectedBGC) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedBGC) {
            this.drawBGC.text = this.hex2rgb(selectedBGC, this.drawBGC.text.a)
          } else if (!this.drawBGC.text) {
            this.drawBGC.text = { r: 0, g: 0, b: 0, a: 0 }
          }
          if (!this.drawBGC.text.a) {
            this.drawBGC.text.a = 0
          }
        }
      }
    }
  }

  changeTextBGOpacity(selectedOpacity) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedOpacity || selectedOpacity === 0) {
            this.drawBGC.text.a = selectedOpacity
          } else if (!this.drawBGC.text.a) {
            this.drawBGC.text.a = 0
          }
        }
      }
    }
  }

  changeTextColor(selectedColor) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selectedColor) {
            this.drawColor.text = selectedColor
          } else if (!this.drawColor.line) {
            this.drawColor.line = '#000'
          }
        }
      }
    }
  }

  createCheckbox(element, canvas) {
    const rect1 = new fabric.Rect({
      width: element.originWidth - element.strokeWidth,
      height: element.originHeight - element.strokeWidth,
      fill: element.color,
      rx: element.rx / 2,
      ry: element.ry / 2,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      originX: 'center',
      originY: 'center',
    })
    let rect2 = null
    if (element.selected !== null && element.selected === false) {
      rect2 = new fabric.Rect({
        width: element.originWidth * 0.5 - element.checkboxStrokeWidth,
        height: element.originHeight * 0.5 - element.checkboxStrokeWidth,
        fill: element.checkboxColor,
        stroke: element.checkboxStroke,
        strokeWidth: element.checkboxStrokeWidth,
        originX: 'center',
        originY: 'center',
      })
    } else {
      const origin = window.location.origin
      const imageUrl = origin + '/checkbox.png'
      rect2 = new fabric.Rect({
        width: element.originWidth * 0.5 - 2 * element.checkboxStrokeWidth,
        height: element.originHeight * 0.5 - 2 * element.checkboxStrokeWidth,
        fill: element.checkboxColor,
        stroke: element.checkboxStroke,
        strokeWidth: element.checkboxStrokeWidth,
        originX: 'center',
        originY: 'center',
      })
      fabric.util.loadImage(imageUrl, function (img) {
        rect2.set(
          'fill',
          new fabric.Pattern({
            source: img,
            offsetX: -1,
            offsetY: -2,
            repeat: 'no-repeat',
            patternTransform: [
              (element.originWidth * 0.5) / img.width,
              0,
              0,
              (element.originWidth * 0.6) / img.width,
              0,
              0,
            ],
          })
        )
        canvas.renderAll()
      })
    }
    const checkbox = new fabric.Group([rect1, rect2], {
      width: element.width,
      height: element.height,
      originWidth: element.originWidth || element.width,
      originHeight: element.originHeight || element.height,
      top: element.y,
      left: element.x,
      backgroundColor: element.color,
      strokeWidth: element.strokeWidth || 0,
      stroke: element.stroke || '',
      checkboxBackgroundColor: element.checkboxColor,
      checkboxStrokeWidth: element.checkboxStrokeWidth || 1,
      checkboxStroke: element.checkboxStroke || 'rgb(146, 147, 147)',
      rx: element.rx || 2 * element.scale,
      ry: element.ry || 2 * element.scale,
      selected: element.selected,
      groupId: element.groupId,
      id: element.objectId,
      annotateType: 2,
      selectId: element.id,
      centerWidth: element.centerWidth,
      centerHeight: element.centerHeight,
      required: element.required,
      readonly: element.readonly,
      ruleId: element.ruleId,
      originFontSize: element.originFontSize || 28,
      maximum: element.maximum,
      minimum: element.minimum,
      label: element.label,
      groupLabel: element.groupLabel,
      prefill: element.prefill,
      newAdd: element.newAdd,
      scale: element.scale,
    })
    canvas.add(checkbox)
    return checkbox
  }

  createRadio(element) {
    const rect = new fabric.Rect({
      width: element.originWidth - element.strokeWidth,
      height: element.originHeight - element.strokeWidth,
      fill: element.color,
      rx: element.rx / 2,
      ry: element.ry / 2,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      originX: 'center',
      originY: 'center',
    })
    let circle = null
    let circle2 = null
    if (element.selected !== null && element.selected === false) {
      circle = new fabric.Circle({
        radius: (element.originWidth * 0.65 - 2 * element.radioStrokeWidth) / 2,
        fill: element.radioBackgroundColor,
        stroke: element.radioStroke,
        strokeWidth: element.radioStrokeWidth,
        originX: 'center',
        originY: 'center',
      })
      circle2 = new fabric.Circle({
        radius: 0,
        fill: '#000000',
        originX: 'center',
        originY: 'center',
      })
    } else {
      circle = new fabric.Circle({
        radius: (element.originWidth * 0.65 - 2 * element.radioStrokeWidth) / 2,
        fill: element.radioBackgroundColor,
        stroke: element.radioStroke,
        strokeWidth: element.radioStrokeWidth,
        originX: 'center',
        originY: 'center',
      })
      circle2 = new fabric.Circle({
        radius: (element.originWidth * 0.5 - 2 * element.radioStrokeWidth) / 2,
        fill: '#000000',
        originX: 'center',
        originY: 'center',
      })
    }
    const radio = new fabric.Group([rect, circle, circle2], {
      width: element.width,
      height: element.height,
      originWidth: element.originWidth || element.width,
      originHeight: element.originHeight || element.height,
      top: element.y,
      left: element.x,
      backgroundColor: element.color,
      rx: element.rx || 2 * element.scale,
      ry: element.ry || 2 * element.scale,
      strokeWidth: element.strokeWidth || 0,
      stroke: element.stroke || '',
      radioBackgroundColor: element.radioBackgroundColor || '#ffffff',
      radioStrokeWidth: element.radioStrokeWidth || 1,
      radioStroke: element.radioStroke || 'rgb(146, 147, 147)',
      selected: element.selected,
      id: element.objectId,
      groupId: element.groupId,
      annotateType: 5,
      selectId: element.id,
      centerWidth: element.centerWidth,
      centerHeight: element.centerHeight,
      required: element.required,
      readonly: element.readonly,
      label: element.label,
      groupLabel: element.groupLabel,
      prefill: element.prefill,
      newAdd: element.newAdd,
      originFontSize: element.originFontSize,
      scale: element.scale,
    })
    return radio
  }

  addSignature(signature) {
    const tooltip = document.getElementById(`tooltip_${this.pageNumber}`)
    let doneAnnotate = null
    const self = this
    if (this.canvasWrapper) {
      const canvasWidth = this.canvasWrapper.clientWidth
      const canvasHeight = this.canvasWrapper.clientHeight
      let oldSignature = null
      let oldSignatureImage = null
      switch (signature.type) {
        case 0:
          oldSignature = document.getElementById(
            `signature${signature.id}_${self.pageNumber}`
          )
          oldSignatureImage = document.getElementById(
            `signatureImage${signature.id}_${self.pageNumber}`
          )
          break
        case 9:
          oldSignature = document.getElementById(
            `signatureBP${signature.id}_${self.pageNumber}`
          )
          oldSignatureImage = document.getElementById(
            `signatureBPImage${signature.id}_${self.pageNumber}`
          )
          break
        case 10:
          oldSignature = document.getElementById(
            `signatureBO${signature.id}_${self.pageNumber}`
          )
          oldSignatureImage = document.getElementById(
            `signatureBOImage${signature.id}_${self.pageNumber}`
          )
          break
        case 13:
          oldSignature = document.getElementById(
            `signatureAndStamp${signature.id}_${self.pageNumber}`
          )
          oldSignatureImage = document.getElementById(
            `signatureAndStampImage${signature.id}_${self.pageNumber}`
          )
          break
      }
      if (oldSignature) {
        oldSignature.remove()
      } else if (oldSignatureImage) {
        oldSignatureImage.remove()
      }
      if (this.scale !== signature.scale) {
        signature.left *= this.scale / signature.scale
        signature.top *= this.scale / signature.scale
        signature.width *= this.scale / signature.scale
        signature.height *= this.scale / signature.scale
        signature.scale = this.scale
      }
      const signatureImage = document.createElement('button')
      switch (signature.type) {
        case 0:
          signatureImage.id = `signatureImage${signature.id}_${this.pageNumber}`
          break
        case 9:
          signatureImage.id = `signatureBPImage${signature.id}_${this.pageNumber}`
          break
        case 10:
          signatureImage.id = `signatureBOImage${signature.id}_${this.pageNumber}`
          break
        case 13:
          signatureImage.id = `signatureAndStampImage${signature.id}_${this.pageNumber}`
          break
      }
      signatureImage.style.position = 'absolute'
      signatureImage.style.left = signature.left + 'px'
      signatureImage.style.top = signature.top + 'px'
      signatureImage.style.width = signature.width + 'px'
      signatureImage.style.height = signature.height + 'px'
      signatureImage.style.borderRadius = `${signature.rx}px`
      signatureImage.style.zIndex = 40
      signatureImage.style.padding = '0px'
      signatureImage.style.display = 'none'
      signatureImage.style.alignItems = 'center'
      signatureImage.style.justifyContent = 'center'
      const image = document.createElement('img')
      image.src = signature.base64
      image.style.position = 'relative'
      image.style.display = 'none'
      image.style.alignItems = 'center'
      image.style.justifyContent = 'center'
      const i = new Image()
      i.onload = function () {
        const scaleFactor = Math.min(
          Math.min(1, signature.width / i.width),
          Math.min(1, signature.height / i.height)
        )
        signatureImage.style.display = 'flex'
        image.style.display = 'flex'
        image.width = i.width * scaleFactor
        image.height = i.height * scaleFactor
        if (
          self.annotate &&
          self.annotate.length > 0 &&
          self.annotate.find((x) => x.page === self.pageNumber)
        ) {
          doneAnnotate = self.annotate
            .find((x) => x.page === self.pageNumber)
            .data.find((y) => y.objectId === signature.id)
          doneAnnotate.done = true
          doneAnnotate.data = signature.base64
          doneAnnotate.imageWidth = i.width * scaleFactor
          doneAnnotate.imageHeight = i.height * scaleFactor
          doneAnnotate.imageX =
            signature.left +
            Math.max(signature.width - i.width * scaleFactor, 0) / 2
          doneAnnotate.imageY =
            signature.top +
            Math.max(signature.height - i.height * scaleFactor, 0) / 2
        }
      }
      i.src = signature.base64
      signatureImage.appendChild(image)

      signatureImage.addEventListener('mouseover', function (e) {
        switch (signature.type) {
          case 0:
            tooltip.innerHTML = `${
              doneAnnotate.label ? doneAnnotate.label : self.i18n.sign
            } - ${
              doneAnnotate.required ? self.i18n.required : self.i18n.optional
            }`
            break
          case 9:
            tooltip.innerHTML = `${
              doneAnnotate.label ? doneAnnotate.label : self.i18n.signatureBP
            } - ${self.i18n.required}`
            break
          case 10:
            tooltip.innerHTML = `${
              doneAnnotate.label ? doneAnnotate.label : self.i18n.signatureBO
            } - ${self.i18n.required}`
            break
          case 13:
            tooltip.innerHTML = `${
              doneAnnotate.label
                ? doneAnnotate.label
                : self.i18n.signatureAndStamp
            } - ${
              doneAnnotate.required ? self.i18n.required : self.i18n.optional
            }`
            break
        }
        tooltip.style.display = 'block'
        tooltip.style.top =
          signature.top - tooltip.clientHeight - 10 <= 0
            ? signature.top + signature.height + 10 + 'px'
            : Math.min(
                signature.top - tooltip.clientHeight - 10,
                canvasHeight - 100
              ) + 'px'
        tooltip.style.left =
          Math.min(signature.left + signature.width / 5, canvasWidth - 150) +
          'px'
      })
      signatureImage.addEventListener('mouseout', function (e) {
        tooltip.style.top = 0
        tooltip.style.left = 0
        tooltip.style.display = 'none'
      })
      // wait DOM rendered
      setTimeout(() => {
        if (self.mode === 1) {
          self.eventBus.dispatch('checkAnnotateChanged', {
            source: self,
            showOutline: self.showOutline,
          })
        }
        self.eventBus.dispatch('notifyAnnotateChanged')
      }, 0)

      const dropDown = document.createElement('div')
      dropDown.className = 'dropdown-content'
      dropDown.id = `signatureDropdown${signature.id}_${self.pageNumber}`
      const editBtn = document.createElement('a')
      editBtn.innerHTML = self.i18n.change
      editBtn.addEventListener('mouseup', function (e) {
        switch (signature.type) {
          case 0:
          case 9:
          case 10:
            self.eventBus.dispatch('setAnnotateSignature', {
              source: self,
              annotateSignature: {
                page: self.pageNumber,
                width: signature.width,
                height: signature.height,
                top: signature.top,
                left: signature.left,
                id: signature.id,
                scale: signature.scale,
                type: signature.type,
                textDirection: signature.textDirection || false,
              },
              mode: 1,
            })
            break
          case 13:
            self.eventBus.dispatch('setAnnotateSignatureAndStamp', {
              source: self,
              annotateSignatureAndStamp: {
                page: self.pageNumber,
                width: signature.width,
                height: signature.height,
                top: signature.top,
                left: signature.left,
                id: signature.id,
                scale: signature.scale,
                type: signature.type,
                textDirection: signature.textDirection || false,
              },
              mode: 1,
            })
            break
        }
      })
      editBtn.style.fontSize = '14px'
      const deleteBtn = document.createElement('a')
      deleteBtn.addEventListener('mouseup', function (e) {
        let undoneAnnotate = null
        if (
          self.annotate &&
          self.annotate.length > 0 &&
          self.annotate.find((x) => x.page === self.pageNumber)
        ) {
          undoneAnnotate = self.annotate
            .find((x) => x.page === self.pageNumber)
            .data.find((y) => y.objectId === signature.id)
          undoneAnnotate.done = false
          undoneAnnotate.data = null
        }
        let deleteSignatureImage = null
        switch (signature.type) {
          case 0:
            deleteSignatureImage = document.getElementById(
              `signatureImage${signature.id}_${self.pageNumber}`
            )
            break
          case 9:
            deleteSignatureImage = document.getElementById(
              `signatureBPImage${signature.id}_${self.pageNumber}`
            )
            break
          case 10:
            deleteSignatureImage = document.getElementById(
              `signatureBOImage${signature.id}_${self.pageNumber}`
            )
            break
          case 13:
            deleteSignatureImage = document.getElementById(
              `signatureAndStampImage${signature.id}_${self.pageNumber}`
            )
            break
        }
        if (deleteSignatureImage) {
          deleteSignatureImage.remove()
        }
        const sig = document.createElement('button')
        const p = document.createElement('p')
        let text = null
        self.setRequiredElementStyle()
        switch (signature.type) {
          case 0:
            sig.id = `signature${undoneAnnotate.objectId}_${self.pageNumber}`
            if (undoneAnnotate.required) {
              sig.classList.add('required')
            } else {
              sig.classList.remove('required')
            }
            text = document.createTextNode(self.i18n.signature)
            p.style.writingMode = undoneAnnotate.textDirection
              ? 'vertical-lr'
              : 'horizontal-tb'
            p.innerHTML = `<i class="v-icon notranslate mdi mdi-signature theme--light" aria-hidden="true" style="${
              undoneAnnotate.textDirection
                ? 'rotate: 90deg;margin-bottom: 8px;'
                : 'margin-right: 8px;'
            } font-size: 16px;"></i>`
            break
          case 9:
            sig.id = `signatureBP${undoneAnnotate.objectId}_${self.pageNumber}`
            sig.classList.add('required')
            text = document.createTextNode(self.i18n.signatureBP)
            p.innerHTML =
              '<i class="custom-icon icon-signatureBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
            break
          case 10:
            sig.id = `signatureBO${undoneAnnotate.objectId}_${self.pageNumber}`
            sig.classList.add('required')
            text = document.createTextNode(self.i18n.signatureBO)
            p.innerHTML =
              '<i class="custom-icon icon-signatureBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
            break
          case 13:
            sig.id = `signatureAndStamp${undoneAnnotate.objectId}_${self.pageNumber}`
            if (undoneAnnotate.required) {
              sig.classList.add('required')
            } else {
              sig.classList.remove('required')
            }
            text = document.createTextNode(self.i18n.signatureAndStamp)
            p.style.writingMode = undoneAnnotate.textDirection
              ? 'vertical-lr'
              : 'horizontal-tb'
            p.innerHTML = `<i class="custom-icon icon-signatureAndStamp" aria-hidden="true" style="${
              undoneAnnotate.textDirection
                ? 'margin-bottom: 8px;'
                : 'margin-right: 8px;'
            } font-size: 16px;"></i>`
            break
        }
        sig.style.position = 'absolute'
        sig.style.left = undoneAnnotate.x + 'px'
        sig.style.top = undoneAnnotate.y + 'px'
        sig.style.width = undoneAnnotate.width + 'px'
        sig.style.height = undoneAnnotate.height + 'px'
        sig.style.borderRadius = `${undoneAnnotate.rx}px`
        sig.style.backgroundColor = self.useDefaultColor
          ? self.defaultBGC
          : undoneAnnotate.color
        sig.style.zIndex = 40
        sig.style.padding = '0px'
        sig.style.border = `${undoneAnnotate.strokeWidth}px solid ${
          self.useDefaultColor ? self.defaultBorderColor : undoneAnnotate.stroke
        }`
        sig.style.display = 'flex'
        sig.style.alignItems = 'center'
        sig.style.justifyContent = 'center'
        if (self.checkAnnotate === true && self.showOutline === true) {
          sig.style.outline = '2px dotted red'
        }
        // wait DOM rendered
        setTimeout(() => {
          if (self.mode === 1) {
            self.eventBus.dispatch('checkAnnotateChanged', {
              source: self,
              showOutline: self.showOutline,
            })
          }
          self.eventBus.dispatch('notifyAnnotateChanged')
        }, 0)
        p.style.fontSize = '16px'
        p.style.fontFamily = 'Microsoft JhengHei'
        p.style.fontWeight = 'bold'
        p.style.position = 'relative'
        p.style.display = 'flex'
        p.style.alignItems = 'center'
        p.style.justifyContent = 'center'
        p.style.textAlign = 'center'
        p.style.marginBottom = '0px'
        p.style.transform = `scale(${undoneAnnotate.scale})`
        p.style.transformOrigin = 'center center'
        p.style.minWidth = `${100 / undoneAnnotate.scale}%`
        p.style.minHeight = `${100 / undoneAnnotate.scale}%`
        p.appendChild(text)
        sig.appendChild(p)
        sig.addEventListener('mouseup', function (e) {
          switch (signature.type) {
            case 0:
            case 9:
            case 10:
              self.eventBus.dispatch('setAnnotateSignature', {
                source: self,
                annotateSignature: {
                  page: self.pageNumber,
                  width: undoneAnnotate.width,
                  height: undoneAnnotate.height,
                  top: undoneAnnotate.y,
                  left: undoneAnnotate.x,
                  id: undoneAnnotate.objectId,
                  scale: undoneAnnotate.scale,
                  type: undoneAnnotate.type,
                  textDirection: undoneAnnotate.textDirection || false,
                },
                mode: 0,
              })
              break
            case 13:
              self.eventBus.dispatch('setAnnotateSignatureAndStamp', {
                source: self,
                annotateSignatureAndStamp: {
                  page: self.pageNumber,
                  width: undoneAnnotate.width,
                  height: undoneAnnotate.height,
                  top: undoneAnnotate.y,
                  left: undoneAnnotate.x,
                  id: undoneAnnotate.objectId,
                  scale: undoneAnnotate.scale,
                  type: undoneAnnotate.type,
                  textDirection: undoneAnnotate.textDirection || false,
                },
                mode: 0,
              })
              break
          }
        })
        sig.addEventListener('mouseover', function (e) {
          switch (signature.type) {
            case 0:
              tooltip.innerHTML = `${
                undoneAnnotate.label ? undoneAnnotate.label : self.i18n.sign
              } - ${
                undoneAnnotate.required
                  ? self.i18n.required
                  : self.i18n.optional
              }`
              break
            case 9:
              tooltip.innerHTML = `${
                undoneAnnotate.label
                  ? undoneAnnotate.label
                  : self.i18n.signatureBP
              } - ${self.i18n.required}`
              break
            case 10:
              tooltip.innerHTML = `${
                undoneAnnotate.label
                  ? undoneAnnotate.label
                  : self.i18n.signatureBO
              } - ${self.i18n.required}`
              break
            case 13:
              tooltip.innerHTML = `${
                undoneAnnotate.label
                  ? undoneAnnotate.label
                  : self.i18n.signatureAndStamp
              } - ${
                undoneAnnotate.required
                  ? self.i18n.required
                  : self.i18n.optional
              }`
              break
          }
          tooltip.style.display = 'block'
          tooltip.style.top =
            undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
              ? undoneAnnotate.y + undoneAnnotate.height + 10 + 'px'
              : Math.min(
                  undoneAnnotate.y - tooltip.clientHeight - 10,
                  canvasHeight - 100
                ) + 'px'
          tooltip.style.left =
            Math.min(
              undoneAnnotate.x + undoneAnnotate.width / 5,
              canvasWidth - 150
            ) + 'px'
        })
        sig.addEventListener('mouseout', function (e) {
          tooltip.style.top = 0
          tooltip.style.left = 0
          tooltip.style.display = 'none'
        })
        self.canvasWrapper.appendChild(sig)
        self.addElements.push(sig)
      })
      deleteBtn.innerHTML = self.i18n.btnDelete
      deleteBtn.style.color = 'darkred'
      deleteBtn.style.fontSize = '14px'
      dropDown.appendChild(editBtn)
      dropDown.appendChild(deleteBtn)
      self.canvasWrapper.appendChild(dropDown)
      self.addElements.push(dropDown)
      signatureImage.addEventListener('mouseup', function (e) {
        setTimeout(() => {
          dropDown.classList.toggle('dropdownOpen')
          dropDown.style.top = signature.top + signature.height + 10 + 'px'
          dropDown.style.left = signature.left + 'px'
          signatureImage.style.border = '2px solid rgba(0, 150, 199, 0.6)'
          const mouseup = function (e) {
            const dropdowns =
              document.getElementsByClassName('dropdown-content')
            for (let i = 0; i < dropdowns.length; i++) {
              const openDropdown = dropdowns[i]
              if (openDropdown.classList.contains('dropdownOpen')) {
                openDropdown.classList.remove('dropdownOpen')
                signatureImage.style.removeProperty('border')
              }
            }
            document.removeEventListener('mouseup', mouseup)
          }
          document.addEventListener('mouseup', mouseup)
        }, 0)
      })

      this.canvasWrapper.appendChild(signatureImage)
      this.addElements.push(signatureImage)
    }
  }

  addStamp(stamp) {
    const tooltip = document.getElementById(`tooltip_${this.pageNumber}`)
    let doneAnnotate = null
    const self = this
    if (this.canvasWrapper) {
      const canvasWidth = this.canvasWrapper.clientWidth
      const canvasHeight = this.canvasWrapper.clientHeight
      let oldStamp = null
      let oldStampImage = null
      switch (stamp.type) {
        case 3:
          oldStamp = document.getElementById(
            `stamp${stamp.id}_${self.pageNumber}`
          )
          oldStampImage = document.getElementById(
            `stampImage${stamp.id}_${self.pageNumber}`
          )
          break
        case 11:
          oldStamp = document.getElementById(
            `stampBP${stamp.id}_${self.pageNumber}`
          )
          oldStampImage = document.getElementById(
            `stampBPImage${stamp.id}_${self.pageNumber}`
          )
          break
        case 12:
          oldStamp = document.getElementById(
            `stampBO${stamp.id}_${self.pageNumber}`
          )
          oldStampImage = document.getElementById(
            `stampBOImage${stamp.id}_${self.pageNumber}`
          )
          break
        case 13:
          oldStamp = document.getElementById(
            `signatureAndStamp${stamp.id}_${self.pageNumber}`
          )
          oldStampImage = document.getElementById(
            `signatureAndStampImage${stamp.id}_${self.pageNumber}`
          )
          break
      }
      if (oldStamp) {
        oldStamp.remove()
      } else if (oldStampImage) {
        oldStampImage.remove()
      }
      if (this.scale !== stamp.scale) {
        stamp.left *= this.scale / stamp.scale
        stamp.top *= this.scale / stamp.scale
        stamp.width *= this.scale / stamp.scale
        stamp.height *= this.scale / stamp.scale
        stamp.scale = this.scale
      }
      const stampImage = document.createElement('button')
      switch (stamp.type) {
        case 3:
          stampImage.id = `stampImage${stamp.id}_${this.pageNumber}`
          break
        case 11:
          stampImage.id = `stampBPImage${stamp.id}_${this.pageNumber}`
          break
        case 12:
          stampImage.id = `stampBOImage${stamp.id}_${this.pageNumber}`
          break
        case 13:
          stampImage.id = `signatureAndStampImage${stamp.id}_${this.pageNumber}`
          break
      }
      stampImage.style.position = 'absolute'
      stampImage.style.left = stamp.left + 'px'
      stampImage.style.top = stamp.top + 'px'
      stampImage.style.width = stamp.width + 'px'
      stampImage.style.height = stamp.height + 'px'
      stampImage.style.borderRadius = `${stamp.rx}px`
      stampImage.style.zIndex = 40
      stampImage.style.padding = '0px'
      stampImage.style.display = 'none'
      stampImage.style.alignItems = 'center'
      stampImage.style.justifyContent = 'center'
      const image = document.createElement('img')
      image.src = stamp.base64
      image.style.position = 'relative'
      image.style.display = 'none'
      image.style.alignItems = 'center'
      image.style.justifyContent = 'center'
      const i = new Image()
      i.onload = function () {
        const scaleFactor = Math.min(
          Math.min(1, stamp.width / i.width),
          Math.min(1, stamp.height / i.height)
        )
        stampImage.style.display = 'flex'
        image.style.display = 'flex'
        image.width = i.width * scaleFactor
        image.height = i.height * scaleFactor
        if (
          self.annotate &&
          self.annotate.length > 0 &&
          self.annotate.find((x) => x.page === self.pageNumber)
        ) {
          doneAnnotate = self.annotate
            .find((x) => x.page === self.pageNumber)
            .data.find((y) => y.objectId === stamp.id)
          doneAnnotate.done = true
          doneAnnotate.data = stamp.base64
          doneAnnotate.imageWidth = i.width * scaleFactor
          doneAnnotate.imageHeight = i.height * scaleFactor
          doneAnnotate.imageX =
            stamp.left + Math.max(stamp.width - i.width * scaleFactor, 0) / 2
          doneAnnotate.imageY =
            stamp.top + Math.max(stamp.height - i.height * scaleFactor, 0) / 2
        }
      }
      i.src = stamp.base64
      stampImage.appendChild(image)

      stampImage.addEventListener('mouseover', function (e) {
        switch (stamp.type) {
          case 3:
            tooltip.innerHTML = `${
              doneAnnotate.label ? doneAnnotate.label : self.i18n.stamp
            } - ${
              doneAnnotate.required ? self.i18n.required : self.i18n.optional
            }`
            break
          case 11:
            tooltip.innerHTML = `${
              doneAnnotate.label ? doneAnnotate.label : self.i18n.stampBP
            } - ${self.i18n.required}`
            break
          case 12:
            tooltip.innerHTML = `${
              doneAnnotate.label ? doneAnnotate.label : self.i18n.stampBO
            } - ${self.i18n.required}`
            break
          case 13:
            tooltip.innerHTML = `${
              doneAnnotate.label
                ? doneAnnotate.label
                : self.i18n.signatureAndStamp
            } - ${self.i18n.required}`
            break
        }
        tooltip.style.display = 'block'
        tooltip.style.top =
          stamp.top - tooltip.clientHeight - 10 <= 0
            ? stamp.top + stamp.height + 10 + 'px'
            : Math.min(
                stamp.top - tooltip.clientHeight - 10,
                canvasHeight - 100
              ) + 'px'
        tooltip.style.left =
          Math.min(stamp.left + stamp.width / 5, canvasWidth - 150) + 'px'
      })
      stampImage.addEventListener('mouseout', function (e) {
        tooltip.style.top = 0
        tooltip.style.left = 0
        tooltip.style.display = 'none'
      })
      // wait DOM rendered
      setTimeout(() => {
        if (self.mode === 1) {
          self.eventBus.dispatch('checkAnnotateChanged', {
            source: self,
            showOutline: self.showOutline,
          })
        }
        self.eventBus.dispatch('notifyAnnotateChanged')
      }, 0)

      const dropDown = document.createElement('div')
      dropDown.className = 'dropdown-content'
      dropDown.id = `stampDropdown${stamp.id}_${self.pageNumber}`
      const editBtn = document.createElement('a')
      editBtn.innerHTML = self.i18n.change
      editBtn.addEventListener('mouseup', function (e) {
        switch (stamp.type) {
          case 3:
          case 11:
          case 12:
            self.eventBus.dispatch('setAnnotateStamp', {
              source: self,
              annotateStamp: {
                page: self.pageNumber,
                width: stamp.width,
                height: stamp.height,
                top: stamp.top,
                left: stamp.left,
                id: stamp.id,
                scale: stamp.scale,
                type: stamp.type,
              },
              mode: 1,
            })
            break
          case 13:
            self.eventBus.dispatch('setAnnotateSignatureAndStamp', {
              source: self,
              annotateSignatureAndStamp: {
                page: self.pageNumber,
                width: stamp.width,
                height: stamp.height,
                top: stamp.top,
                left: stamp.left,
                id: stamp.id,
                scale: stamp.scale,
                type: stamp.type,
                textDirection: stamp.textDirection,
              },
              mode: 1,
            })
            break
        }
      })
      editBtn.style.fontSize = '14px'
      const deleteBtn = document.createElement('a')
      deleteBtn.addEventListener('mouseup', function (e) {
        let undoneAnnotate = null
        if (
          self.annotate &&
          self.annotate.length > 0 &&
          self.annotate.find((x) => x.page === self.pageNumber)
        ) {
          undoneAnnotate = self.annotate
            .find((x) => x.page === self.pageNumber)
            .data.find((y) => y.objectId === stamp.id)
          undoneAnnotate.done = false
          undoneAnnotate.data = null
        }
        let deleteStampImage = null
        switch (stamp.type) {
          case 3:
            deleteStampImage = document.getElementById(
              `stampImage${stamp.id}_${self.pageNumber}`
            )
            break
          case 11:
            deleteStampImage = document.getElementById(
              `stampBPImage${stamp.id}_${self.pageNumber}`
            )
            break
          case 12:
            deleteStampImage = document.getElementById(
              `stampBOImage${stamp.id}_${self.pageNumber}`
            )
            break
          case 13:
            deleteStampImage = document.getElementById(
              `signatureAndStampImage${stamp.id}_${self.pageNumber}`
            )
            break
        }
        if (deleteStampImage) {
          deleteStampImage.remove()
        }
        const stmp = document.createElement('button')
        const p = document.createElement('p')
        let text = null

        self.setRequiredElementStyle()

        switch (stamp.type) {
          case 3:
            stmp.id = `stamp${undoneAnnotate.objectId}_${self.pageNumber}`
            if (undoneAnnotate.required) {
              stmp.classList.add('required')
            } else {
              stmp.classList.remove('required')
            }
            text = document.createTextNode(self.i18n.stamp)
            p.innerHTML =
              '<i class="v-icon notranslate mdi mdi-stamper theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
            break
          case 11:
            stmp.id = `stampBP${undoneAnnotate.objectId}_${self.pageNumber}`
            stmp.classList.add('required')
            text = document.createTextNode(self.i18n.stampBP)
            p.innerHTML =
              '<i class="custom-icon icon-stampBP-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
            break
          case 12:
            stmp.id = `stampBO${undoneAnnotate.objectId}_${self.pageNumber}`
            stmp.classList.add('required')
            text = document.createTextNode(self.i18n.stampBO)
            p.innerHTML =
              '<i class="custom-icon icon-stampBO-black" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
            break
          case 13:
            stmp.id = `signatureAndStamp${undoneAnnotate.objectId}_${self.pageNumber}`
            stmp.classList.add('required')
            text = document.createTextNode(self.i18n.signatureAndStamp)
            p.style.writingMode = undoneAnnotate.textDirection
              ? 'vertical-lr'
              : 'horizontal-tb'
            p.innerHTML = `<i class="custom-icon icon-signatureAndStamp" aria-hidden="true" style="${
              undoneAnnotate.textDirection
                ? 'margin-bottom: 8px;'
                : 'margin-right: 8px;'
            } font-size: 16px;"></i>`
            break
        }
        stmp.style.position = 'absolute'
        stmp.style.left = undoneAnnotate.x + 'px'
        stmp.style.top = undoneAnnotate.y + 'px'
        stmp.style.width = undoneAnnotate.width + 'px'
        stmp.style.height = undoneAnnotate.height + 'px'
        stmp.style.borderRadius = `${undoneAnnotate.rx}px`
        stmp.style.backgroundColor = self.useDefaultColor
          ? self.defaultBGC
          : undoneAnnotate.color
        stmp.style.zIndex = 40
        stmp.style.padding = '0px'
        stmp.style.border = `${undoneAnnotate.strokeWidth}px solid ${
          self.useDefaultColor ? self.defaultBorderColor : undoneAnnotate.stroke
        }`
        stmp.style.display = 'flex'
        stmp.style.alignItems = 'center'
        stmp.style.justifyContent = 'center'
        if (self.checkAnnotate === true && self.showOutline === true) {
          stmp.style.outline = '2px dotted red'
        }
        // wait DOM rendered
        setTimeout(() => {
          if (self.mode === 1) {
            self.eventBus.dispatch('checkAnnotateChanged', {
              source: self,
              showOutline: self.showOutline,
            })
          }
          self.eventBus.dispatch('notifyAnnotateChanged')
        }, 0)
        p.style.fontSize = '16px'
        p.style.fontFamily = 'Microsoft JhengHei'
        p.style.fontWeight = 'bold'
        p.style.position = 'relative'
        p.style.display = 'flex'
        p.style.alignItems = 'center'
        p.style.justifyContent = 'center'
        p.style.textAlign = 'center'
        p.style.marginBottom = '0px'
        p.style.transform = `scale(${undoneAnnotate.scale})`
        p.style.transformOrigin = 'center center'
        p.style.minWidth = `${100 / undoneAnnotate.scale}%`
        p.style.minHeight = `${100 / undoneAnnotate.scale}%`
        p.appendChild(text)
        stmp.appendChild(p)
        stmp.addEventListener('mouseup', function (e) {
          switch (stamp.type) {
            case 3:
            case 11:
            case 12:
              self.eventBus.dispatch('setAnnotateStamp', {
                source: self,
                annotateStamp: {
                  page: self.pageNumber,
                  width: undoneAnnotate.width,
                  height: undoneAnnotate.height,
                  top: undoneAnnotate.y,
                  left: undoneAnnotate.x,
                  id: undoneAnnotate.objectId,
                  scale: undoneAnnotate.scale,
                  type: undoneAnnotate.type,
                },
                mode: 0,
              })
              break
            case 13:
              self.eventBus.dispatch('setAnnotateSignatureAndStamp', {
                source: self,
                annotateSignatureAndStamp: {
                  page: self.pageNumber,
                  width: undoneAnnotate.width,
                  height: undoneAnnotate.height,
                  top: undoneAnnotate.y,
                  left: undoneAnnotate.x,
                  id: undoneAnnotate.objectId,
                  scale: undoneAnnotate.scale,
                  type: undoneAnnotate.type,
                  textDirection: undoneAnnotate.textDirection,
                },
                mode: 0,
              })
              break
          }
        })
        stmp.addEventListener('mouseover', function (e) {
          switch (stamp.type) {
            case 3:
              tooltip.innerHTML = `${
                undoneAnnotate.label ? undoneAnnotate.label : self.i18n.stamp
              } - ${
                undoneAnnotate.required
                  ? self.i18n.required
                  : self.i18n.optional
              }`
              break
            case 11:
              tooltip.innerHTML = `${
                undoneAnnotate.label ? undoneAnnotate.label : self.i18n.stampBP
              } - ${self.i18n.required}`
              break
            case 12:
              tooltip.innerHTML = `${
                undoneAnnotate.label ? undoneAnnotate.label : self.i18n.stampBO
              } - ${self.i18n.required}`
              break
            case 13:
              tooltip.innerHTML = `${
                undoneAnnotate.label
                  ? undoneAnnotate.label
                  : self.i18n.signatureAndStamp
              } - ${self.i18n.required}`
              break
          }
          tooltip.style.display = 'block'
          tooltip.style.top =
            undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
              ? undoneAnnotate.y + undoneAnnotate.height + 10 + 'px'
              : Math.min(
                  undoneAnnotate.y - tooltip.clientHeight - 10,
                  canvasHeight - 100
                ) + 'px'
          tooltip.style.left =
            Math.min(
              undoneAnnotate.x + undoneAnnotate.width / 5,
              canvasWidth - 150
            ) + 'px'
        })
        stmp.addEventListener('mouseout', function (e) {
          tooltip.style.top = 0
          tooltip.style.left = 0
          tooltip.style.display = 'none'
        })
        self.canvasWrapper.appendChild(stmp)
        self.addElements.push(stmp)
      })
      deleteBtn.innerHTML = self.i18n.btnDelete
      deleteBtn.style.color = 'darkred'
      deleteBtn.style.fontSize = '14px'
      dropDown.appendChild(editBtn)
      dropDown.appendChild(deleteBtn)
      self.canvasWrapper.appendChild(dropDown)
      self.addElements.push(dropDown)
      stampImage.addEventListener('mouseup', function (e) {
        setTimeout(() => {
          dropDown.classList.toggle('dropdownOpen')
          dropDown.style.top = stamp.top + stamp.height + 10 + 'px'
          dropDown.style.left = stamp.left + 'px'
          stampImage.style.border = '2px solid rgba(0, 150, 199, 0.6)'
          const mouseup = function (e) {
            const dropdowns =
              document.getElementsByClassName('dropdown-content')
            for (let i = 0; i < dropdowns.length; i++) {
              const openDropdown = dropdowns[i]
              if (openDropdown.classList.contains('dropdownOpen')) {
                openDropdown.classList.remove('dropdownOpen')
                stampImage.style.removeProperty('border')
              }
            }
            document.removeEventListener('mouseup', mouseup)
          }
          document.addEventListener('mouseup', mouseup)
        }, 0)
      })
      this.canvasWrapper.appendChild(stampImage)
      this.addElements.push(stampImage)
    }
  }

  addAttachment(attachment) {
    const self = this
    let doneAnnotate = null
    if (this.canvasWrapper) {
      switch (this.mode) {
        case 0:
          if (
            self.annotate &&
            self.annotate.length > 0 &&
            self.annotate.find((x) => x.page === self.pageNumber)
          ) {
            doneAnnotate = self.annotate
              .find((x) => x.page === self.pageNumber)
              .data.find((y) => y.objectId === attachment.id)
            doneAnnotate.attachments =
              attachment && attachment.data.length > 0 ? attachment.data : []
            this.save()
          }
          break
        case 1:
        case 4:
          if (attachment && attachment.data.length > 0) {
            if (
              self.annotate &&
              self.annotate.length > 0 &&
              self.annotate.find((x) => x.page === self.pageNumber)
            ) {
              doneAnnotate = self.annotate
                .find((x) => x.page === self.pageNumber)
                .data.find((y) => y.objectId === attachment.id)
              doneAnnotate.done = true
              doneAnnotate.data = attachment.data[0].attachmentId
              // 儲存草稿用來parse出file id
              doneAnnotate.attachments = attachment.data
              const obj = document.getElementById(
                `attachment${attachment.id}_${self.pageNumber}`
              )
              if (obj) {
                obj.style.setProperty('background-color', 'rgba(0, 0, 0, 0.1)')
                obj.style.setProperty('border-color', 'rgba(0, 0, 0, 0.4)')
                obj.style.setProperty('opacity', 0.5)
                const textNode = document.createTextNode(self.i18n.attachment)
                const p = obj.children[0]
                p.innerHTML =
                  '<i class="v-icon notranslate mdi mdi-check-underline theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
                p.appendChild(textNode)
                if (self.checkAnnotate === true && self.showOutline === true) {
                  obj.style.removeProperty('outline')
                }
                // wait DOM rendered
                setTimeout(() => {
                  if (self.mode === 1) {
                    self.eventBus.dispatch('checkAnnotateChanged', {
                      source: self,
                      showOutline: self.showOutline,
                    })
                  }
                }, 0)
              }
            }
          } else if (
            self.annotate &&
            self.annotate.length > 0 &&
            self.annotate.find((x) => x.page === self.pageNumber)
          ) {
            doneAnnotate = self.annotate
              .find((x) => x.page === self.pageNumber)
              .data.find((y) => y.objectId === attachment.id)
            doneAnnotate.done = false
            doneAnnotate.data = null
            doneAnnotate.attachments = []
            const obj = document.getElementById(
              `attachment${attachment.id}_${self.pageNumber}`
            )
            if (obj) {
              obj.style.setProperty(
                'background-color',
                this.useDefaultColor ? this.defaultBGC : doneAnnotate.color
              )
              obj.style.setProperty(
                'border-color',
                this.useDefaultColor
                  ? this.defaultBorderColor
                  : doneAnnotate.stroke
              )
              obj.style.setProperty('opacity', 1)
              const textNode = document.createTextNode(self.i18n.attachment)
              const p = obj.children[0]
              p.innerHTML =
                '<i class="v-icon notranslate mdi mdi-paperclip theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
              p.appendChild(textNode)
              if (self.checkAnnotate === true && self.showOutline === true) {
                obj.style.setProperty('outline', '2px dotted red')
              }
              // wait DOM rendered
              setTimeout(() => {
                if (self.mode === 1) {
                  self.eventBus.dispatch('checkAnnotateChanged', {
                    source: self,
                    showOutline: self.showOutline,
                  })
                }
                self.eventBus.dispatch('notifyAnnotateChanged')
              }, 0)
            }
          }
          break
      }
    }
  }

  addImage(uploadImage) {
    const tooltip = document.getElementById(`tooltip_${this.pageNumber}`)
    let doneAnnotate = null
    const self = this
    if (this.canvasWrapper) {
      const canvasWidth = this.canvasWrapper.clientWidth
      const canvasHeight = this.canvasWrapper.clientHeight
      const oldImageField = document.getElementById(
        `imageField${uploadImage.id}_${self.pageNumber}`
      )
      const oldImageFieldImage = document.getElementById(
        `imageFieldImage${uploadImage.id}_${self.pageNumber}`
      )
      if (oldImageField) {
        oldImageField.remove()
      } else if (oldImageFieldImage) {
        oldImageFieldImage.remove()
      }
      if (this.scale !== uploadImage.scale) {
        uploadImage.left *= this.scale / uploadImage.scale
        uploadImage.top *= this.scale / uploadImage.scale
        uploadImage.width *= this.scale / uploadImage.scale
        uploadImage.height *= this.scale / uploadImage.scale
        uploadImage.scale = this.scale
      }
      const imageFieldImage = document.createElement('button')
      imageFieldImage.id = `imageFieldImage${uploadImage.id}_${this.pageNumber}`
      imageFieldImage.style.position = 'absolute'
      imageFieldImage.style.left = uploadImage.left + 'px'
      imageFieldImage.style.top = uploadImage.top + 'px'
      imageFieldImage.style.width = uploadImage.width + 'px'
      imageFieldImage.style.height = uploadImage.height + 'px'
      imageFieldImage.style.borderRadius = `${uploadImage.rx}px`
      imageFieldImage.style.zIndex = 40
      imageFieldImage.style.padding = '0px'
      imageFieldImage.style.display = 'none'
      imageFieldImage.style.alignItems = 'center'
      imageFieldImage.style.justifyContent = 'center'
      const image = document.createElement('img')
      image.src = uploadImage.base64
      image.style.position = 'relative'
      image.style.display = 'none'
      image.style.alignItems = 'center'
      image.style.justifyContent = 'center'
      const i = new Image()
      i.onload = function () {
        const scaleFactor = Math.min(
          Math.min(1, uploadImage.width / i.width),
          Math.min(1, uploadImage.height / i.height)
        )
        imageFieldImage.style.display = 'flex'
        image.style.display = 'flex'
        image.width = i.width * scaleFactor
        image.height = i.height * scaleFactor
        if (
          self.annotate &&
          self.annotate.length > 0 &&
          self.annotate.find((x) => x.page === self.pageNumber)
        ) {
          doneAnnotate = self.annotate
            .find((x) => x.page === self.pageNumber)
            .data.find((y) => y.objectId === uploadImage.id)
          doneAnnotate.done = true
          doneAnnotate.data = uploadImage.base64
          doneAnnotate.imageWidth = i.width * scaleFactor
          doneAnnotate.imageHeight = i.height * scaleFactor
          doneAnnotate.imageX =
            uploadImage.left +
            Math.max(uploadImage.width - i.width * scaleFactor, 0) / 2
          doneAnnotate.imageY =
            uploadImage.top +
            Math.max(uploadImage.height - i.height * scaleFactor, 0) / 2
        }
      }
      i.src = uploadImage.base64
      imageFieldImage.appendChild(image)

      imageFieldImage.addEventListener('mouseover', function (e) {
        tooltip.innerHTML = `${
          doneAnnotate.label ? doneAnnotate.label : self.i18n.image
        } - ${doneAnnotate.required ? self.i18n.required : self.i18n.optional}`
        tooltip.style.display = 'block'
        tooltip.style.top =
          uploadImage.top - tooltip.clientHeight - 10 <= 0
            ? uploadImage.top + uploadImage.height + 10 + 'px'
            : Math.min(
                uploadImage.top - tooltip.clientHeight - 10,
                canvasHeight - 100
              ) + 'px'
        tooltip.style.left =
          Math.min(
            uploadImage.left + uploadImage.width / 5,
            canvasWidth - 150
          ) + 'px'
      })
      imageFieldImage.addEventListener('mouseout', function (e) {
        tooltip.style.top = 0
        tooltip.style.left = 0
        tooltip.style.display = 'none'
      })
      // wait DOM rendered
      setTimeout(() => {
        if (self.mode === 1) {
          self.eventBus.dispatch('checkAnnotateChanged', {
            source: self,
            showOutline: self.showOutline,
          })
        }
        self.eventBus.dispatch('notifyAnnotateChanged')
      }, 0)

      const dropDown = document.createElement('div')
      dropDown.className = 'dropdown-content'
      dropDown.id = `imageFieldDropdown${uploadImage.id}_${self.pageNumber}`
      const editBtn = document.createElement('a')
      editBtn.innerHTML = self.i18n.change
      editBtn.addEventListener('mouseup', function (e) {
        self.eventBus.dispatch('setAnnotateImage', {
          source: self,
          annotateImage: {
            page: self.pageNumber,
            width: uploadImage.width,
            height: uploadImage.height,
            top: uploadImage.top,
            left: uploadImage.left,
            id: uploadImage.id,
            scale: uploadImage.scale,
          },
          mode: 1,
        })
      })
      editBtn.style.fontSize = '14px'
      const deleteBtn = document.createElement('a')
      deleteBtn.addEventListener('mouseup', function (e) {
        let undoneAnnotate = null
        if (
          self.annotate &&
          self.annotate.length > 0 &&
          self.annotate.find((x) => x.page === self.pageNumber)
        ) {
          undoneAnnotate = self.annotate
            .find((x) => x.page === self.pageNumber)
            .data.find((y) => y.objectId === uploadImage.id)
          undoneAnnotate.done = false
          undoneAnnotate.data = null
        }
        const deleteImageFieldImage = document.getElementById(
          `imageFieldImage${uploadImage.id}_${self.pageNumber}`
        )
        if (deleteImageFieldImage) {
          deleteImageFieldImage.remove()
        }
        const img = document.createElement('button')
        img.id = `imageField${undoneAnnotate.objectId}_${self.pageNumber}`
        if (undoneAnnotate.required) {
          img.classList.add('required')
        } else {
          img.classList.remove('required')
        }
        img.style.position = 'absolute'
        img.style.left = undoneAnnotate.x + 'px'
        img.style.top = undoneAnnotate.y + 'px'
        img.style.width = undoneAnnotate.width + 'px'
        img.style.height = undoneAnnotate.height + 'px'
        img.style.borderRadius = `${undoneAnnotate.rx}px`
        img.style.backgroundColor = self.useDefaultColor
          ? self.defaultBGC
          : undoneAnnotate.color
        img.style.zIndex = 40
        img.style.padding = '0px'
        img.style.border = `${undoneAnnotate.strokeWidth}px solid ${
          self.useDefaultColor ? self.defaultBorderColor : undoneAnnotate.stroke
        }`
        img.style.display = 'flex'
        img.style.alignItems = 'center'
        img.style.justifyContent = 'center'
        if (self.checkAnnotate === true && self.showOutline === true) {
          img.style.outline = '2px dotted red'
        }
        // wait DOM rendered
        setTimeout(() => {
          if (self.mode === 1) {
            self.eventBus.dispatch('checkAnnotateChanged', {
              source: self,
              showOutline: self.showOutline,
            })
          }
          self.eventBus.dispatch('notifyAnnotateChanged')
        }, 0)
        const p = document.createElement('p')
        const text = document.createTextNode(self.i18n.image)
        p.style.fontSize = '16px'
        p.style.fontFamily = 'Microsoft JhengHei'
        p.style.fontWeight = 'bold'
        p.style.position = 'relative'
        p.style.display = 'flex'
        p.style.alignItems = 'center'
        p.style.justifyContent = 'center'
        p.style.textAlign = 'center'
        p.style.marginBottom = '0px'
        p.style.transform = `scale(${undoneAnnotate.scale})`
        p.style.transformOrigin = 'center center'
        p.style.minWidth = `${100 / undoneAnnotate.scale}%`
        p.style.minHeight = `${100 / undoneAnnotate.scale}%`
        p.innerHTML =
          '<i class="v-icon notranslate mdi mdi-image theme--light" aria-hidden="true" style="margin-right: 8px; font-size: 16px;"></i>'
        p.appendChild(text)
        img.appendChild(p)
        img.addEventListener('mouseup', function (e) {
          self.eventBus.dispatch('setAnnotateImage', {
            source: self,
            annotateImage: {
              page: self.pageNumber,
              width: undoneAnnotate.width,
              height: undoneAnnotate.height,
              top: undoneAnnotate.y,
              left: undoneAnnotate.x,
              id: undoneAnnotate.objectId,
              scale: undoneAnnotate.scale,
            },
            mode: 0,
          })
        })
        img.addEventListener('mouseover', function (e) {
          tooltip.innerHTML = `${
            undoneAnnotate.label ? undoneAnnotate.label : self.i18n.stamp
          } - ${
            undoneAnnotate.required ? self.i18n.required : self.i18n.optional
          }`
          tooltip.style.display = 'block'
          tooltip.style.top =
            undoneAnnotate.y - tooltip.clientHeight - 10 <= 0
              ? undoneAnnotate.y + undoneAnnotate.height + 10 + 'px'
              : Math.min(
                  undoneAnnotate.y - tooltip.clientHeight - 10,
                  canvasHeight - 100
                ) + 'px'
          tooltip.style.left =
            Math.min(
              undoneAnnotate.x + undoneAnnotate.width / 5,
              canvasWidth - 150
            ) + 'px'
        })
        img.addEventListener('mouseout', function (e) {
          tooltip.style.top = 0
          tooltip.style.left = 0
          tooltip.style.display = 'none'
        })
        self.canvasWrapper.appendChild(img)
        self.addElements.push(img)
      })
      deleteBtn.innerHTML = self.i18n.btnDelete
      deleteBtn.style.color = 'darkred'
      deleteBtn.style.fontSize = '14px'
      dropDown.appendChild(editBtn)
      dropDown.appendChild(deleteBtn)
      self.canvasWrapper.appendChild(dropDown)
      self.addElements.push(dropDown)
      imageFieldImage.addEventListener('mouseup', function (e) {
        setTimeout(() => {
          dropDown.classList.toggle('dropdownOpen')
          dropDown.style.top = uploadImage.top + uploadImage.height + 10 + 'px'
          dropDown.style.left = uploadImage.left + 'px'
          imageFieldImage.style.border = '2px solid rgba(0, 150, 199, 0.6)'
          const mouseup = function (e) {
            const dropdowns =
              document.getElementsByClassName('dropdown-content')
            for (let i = 0; i < dropdowns.length; i++) {
              const openDropdown = dropdowns[i]
              if (openDropdown.classList.contains('dropdownOpen')) {
                openDropdown.classList.remove('dropdownOpen')
                imageFieldImage.style.removeProperty('border')
              }
            }
            document.removeEventListener('mouseup', mouseup)
          }
          document.addEventListener('mouseup', mouseup)
        }, 0)
      })
      this.canvasWrapper.appendChild(imageFieldImage)
      this.addElements.push(imageFieldImage)
    }
  }

  setReadOnly(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (selection.type === 2 || selection.type === 5) {
            const groupId = selection.groupId
            const children = this.annotate
              .find((x) => x.page === this.pageNumber)
              .data.filter(
                (y) => y.groupId === groupId && y.type === selection.type
              )
            children.forEach((element) => {
              element.readonly = selection.readonly
              canvas.getObjects().forEach((obj) => {
                if (obj.id === element.objectId) {
                  obj.set('readonly', selection.readonly)
                }
              })
            })
          } else {
            const obj = canvas.getActiveObject()
            if (obj && selection) {
              obj.set('readonly', selection.readonly)
            }
          }
        }
      }
    }
  }

  setRequired(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('required', selection.required)
          }
        }
      }
    }
  }

  estimateCharArea(text, target = 'max', edge = 'width', fontSize = `16px`) {
    const charArea = []
    const tempEle = document.createElement('div')
    tempEle.id = 'tempEle'
    tempEle.style.position = 'absolute'
    tempEle.style.fontSize = fontSize
    document.body.appendChild(tempEle)
    for (let i = 0; i < text.length; i++) {
      tempEle.textContent = text[i]
      charArea.push(
        edge === 'width' ? tempEle.clientWidth : tempEle.clientHeight
      )
    }
    tempEle.remove()
    return Math[target](...charArea)
  }

  // calculate single line text box area
  setSingleLineArea(obj, selection) {
    if (obj.annotateType === 1) {
      const canvas = this.canvas.fabric
      if (selection.singleLine) {
        // horizontal
        if (!selection.textDirection) {
          let needFixWidth = false
          selection.textAlign = obj.textAlign = obj.textAlign ?? 'left'
          // calculate two time in case multi line to single line convert imcompletely
          for (let i = 0; i < 2; i++) {
            // remove '\n' line break and set cursor position to last char
            if (obj.text.match(/(?:\\[n]|[\n]+)+/g)) {
              obj.text = obj.text.replace(/(?:\\[n]|[\n]+)+/g, '')
              obj.selectionEnd = obj.selectionStart = obj.text.length
            }

            // convert array textLines from multiple to single value and concatenate with ' ' space
            if (obj.textLines.length === 2 && obj.textLines[1].length === 0) {
              obj.textLines = [obj.text]
            }
            obj.text = obj.textLines.join('')

            // hiddenTextarea is origin value of text input, need to update it too if it exist
            if (obj.hiddenTextarea && obj.hiddenTextarea.value) {
              obj.hiddenTextarea.value = obj.text
            }
            // calculate single line height
            obj.oneLineHeight = parseFloat(
              (selection.scale * (selection.fontSize + 3)).toFixed(4)
            )

            // calculate charWidth : width per char
            let maxString = 0
            obj.textLines.forEach((s) => {
              if (s.length > maxString) maxString = s.length
            })
            const charWidth = obj.calcTextWidth() / maxString || 0
            // add width buffer in case that text won't auto break line
            const widthBuffer = selection.scale * selection.fontSize

            // only first loop calculate if box need to be fit at last
            if (i === 0) {
              needFixWidth =
                obj.width < charWidth * obj.text.length + widthBuffer
            }

            // update width, if origin width is larger than string then ignore, else set string width with buffer
            obj.width =
              needFixWidth && i === 1
                ? charWidth * obj.text.length + widthBuffer
                : Math.max(
                    obj.width,
                    charWidth * obj.text.length + widthBuffer
                  ) || 0

            selection.width = obj.width || widthBuffer
            selection.height = obj.height = obj.oneLineHeight
            canvas.renderAll()
          }
        }
        // vetical
        else {
          const targetTextLines = []
          obj.textLines.forEach((line) => {
            for (let i = 0; i < line.length; i++) {
              targetTextLines.push(line[i])
            }
          })
          const targetText = targetTextLines.join('\n')
          selection.textAlign = obj.textAlign = 'center'
          obj.text = targetText
          obj.textLines = targetTextLines

          obj.selectionEnd = obj.selectionStart = obj.text.length
          // calculate single line width
          selection.width =
            obj.width =
            obj.oneLineWidth =
              this.estimateCharArea(targetTextLines) > 0
                ? parseFloat(
                    (selection.scale * selection.fontSize)
                      // *
                      // (this.estimateCharArea(targetTextLines) + 3)
                      .toFixed(4)
                  )
                : parseFloat(
                    (selection.scale * selection.fontSize)
                      // * 15
                      .toFixed(4)
                  )
          selection.height = obj.height
        }
      } else {
        obj.textAlign = obj.textAlign ?? 'left'
        selection.height = obj.height
        selection.width = obj.width
      }
      selection.text = selection.singleLine
        ? obj.text.replace(/(?:\\[n]|[\n]+)+/g, '')
        : obj.text
    }
  }

  setSingleLine(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            // horizontal
            obj.set('textDirection', selection.textDirection)
            obj.set('singleLine', selection.singleLine)
            if (!selection.textDirection) {
              obj.set('lockScalingY', selection.singleLine)
              obj.set('lockScalingX', false)
            }
            // vertical
            else {
              obj.set('lockScalingY', false)
              obj.set('lockScalingX', selection.singleLine)
            }
            this.setSingleLineArea(obj, selection)
          }
        }
      }
    }
  }

  setTextDirection(selection, target = null) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = target || canvas.getActiveObject()
          if (obj && selection) {
            switch (selection.type) {
              // text
              case 1:
                // horizontal
                if (!selection.textDirection) {
                  obj.set('singleLine', selection.singleLine)
                }
                // vertical
                else {
                  selection.singleLine = true
                  obj.set('singleLine', true)
                }
                obj.set('textDirection', selection.textDirection)
                obj.set('lockScalingX', selection.textDirection)
                obj.set(
                  'lockScalingY',
                  !selection.textDirection && selection.singleLine
                )
                this.setSingleLineArea(obj, selection)
                break
              case 4: {
                let div = document.createElement('div')
                document.body.appendChild(div)
                div.innerHTML = selection.textDirection
                  ? '中華民國 我我我我 年 我我 月 我我 日'
                  : '中華民國YYYY年MM月DD日'
                div.innerHTML = selection.dateFormat.includes('中華民國')
                  ? div.innerHTML
                  : div.innerHTML.replace('中華民國', '')
                div.style.fontSize = selection.fontSize * selection.scale + 'px'
                div.style.position = 'absolute'
                div.style.left = -1000
                div.style.top = -1000
                obj.set('textDirection', selection.textDirection)
                // switch width and height
                if (
                  (selection.textDirection &&
                    selection.width > selection.height) ||
                  (!selection.textDirection &&
                    selection.width < selection.height)
                ) {
                  selection.width += selection.height
                  selection.height = selection.width - selection.height
                  selection.width -= selection.height
                }
                if (selection.dateEra === 'roc') {
                  selection.width = selection.textDirection
                    ? div.clientHeight
                    : div.clientWidth
                  selection.height = selection.textDirection
                    ? div.clientWidth
                    : div.clientHeight
                }
                obj.set('width', selection.width)
                obj.set('height', selection.height)
                document.body.removeChild(div)
                div = null
                break
              }
            }
          }
        }
      }
    }
  }

  setTextAlign(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && obj.textAlign && selection) {
            obj.set('textAlign', selection.textAlign)
          }
        }
      }
    }
  }

  setTextColor(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('textColor', selection.textColor)
            if (selection.type === 1) {
              obj.set('fill', selection.textColor)
            }
          }
        }
      }
    }
  }

  setRule(group, ruleId, minimum, maximum) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          group.forEach((element) => {
            const annotate = this.annotate
              .find((x) => x.page === this.pageNumber)
              .data.find((y) => y.objectId === element.objectId)
            annotate.ruleId = ruleId
            annotate.minimum = minimum
            annotate.maximum = maximum
            canvas.getObjects().forEach((obj) => {
              if (obj.id === element.objectId) {
                obj.set('ruleId', ruleId)
                obj.set('minimum', minimum)
                obj.set('maximum', maximum)
              }
            })
            this.setRequiredElementStyle()
            const checkboxGroupDiv = document.querySelector(
              `#checkboxGroupContainer${element.groupId}_${this.pageNumber} > #checkboxGroupDiv_${element.groupId}`
            )
            if (minimum > 0) {
              checkboxGroupDiv.classList.add('required')
            } else {
              checkboxGroupDiv.classList.remove('required')
            }
          })
          canvas._historySaveAction()
        }
      }
    }
  }

  setRuleRange(group, minimum, maximum) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          group.forEach((element) => {
            const annotate = this.annotate
              .find((x) => x.page === this.pageNumber)
              .data.find((y) => y.objectId === element.objectId)
            // 防呆
            maximum = minimum > maximum ? minimum : maximum
            annotate.minimum = minimum
            annotate.maximum = maximum
            canvas.getObjects().forEach((obj) => {
              if (obj.id === element.objectId) {
                obj.set('minimum', minimum)
                obj.set('maximum', maximum)
              }
            })
            this.setRequiredElementStyle()
            const checkboxGroupDiv = document.querySelector(
              `#checkboxGroupContainer${element.groupId}_${this.pageNumber} > #checkboxGroupDiv_${element.groupId}`
            )
            if (minimum > 0) {
              checkboxGroupDiv.classList.add('required')
            } else {
              checkboxGroupDiv.classList.remove('required')
            }
          })
          canvas._historySaveAction()
        }
      }
    }
  }

  setCheckboxSelected(group) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          group.forEach((element) => {
            const annotate = this.annotate
              .find((x) => x.page === this.pageNumber)
              .data.find((y) => y.objectId === element.objectId)
            canvas.getObjects().forEach((obj) => {
              if (obj.id === element.objectId) {
                if (element.selected === false) {
                  obj._objects[1].set('fill', '#ffffff')
                  obj.selected = false
                  annotate.selected = false
                  canvas._historySaveAction()
                  canvas.renderAll()
                } else {
                  const origin = window.location.origin
                  const imageUrl = origin + '/checkbox.png'
                  fabric.util.loadImage(imageUrl, function (img) {
                    obj._objects[1].set(
                      'fill',
                      new fabric.Pattern({
                        source: img,
                        offsetX: -1,
                        offsetY: -1,
                        patternTransform: [
                          (obj.originWidth * 0.6) / img.width,
                          0,
                          0,
                          (obj.originWidth * 0.6) / img.width,
                          0,
                          0,
                        ],
                      })
                    )
                    obj.selected = true
                    annotate.selected = true
                    canvas._historySaveAction()
                    canvas.renderAll()
                  })
                }
              }
            })
          })
        }
      }
    }
  }

  addBadge(element, index) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const badgeShape = new fabric.Circle({
            radius: Math.max(10 * element.scale, 10),
            fill: '#eef',
            originX: 'center',
            originY: 'center',
          })
          const badgeText = new fabric.Text(index.toString(), {
            fontSize: Math.max(12 * element.scale, 12),
            originX: 'center',
            originY: 'center',
          })
          const badge = new fabric.Group([badgeShape, badgeText], {
            top: element.y - element.strokeWidth - 8,
            left: element.x + element.width + element.strokeWidth + 8,
            badgeId: `badge${element.objectId}`,
          })
          canvas.add(badge)
        }
      }
    }
  }

  // radioBtn, checkbox 填值時顯示的hint
  removeBadge(element) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const objs = canvas.getObjects()
          if (objs) {
            let saveTime = 0
            objs.forEach((obj) => {
              switch (obj.annotateType) {
                case 0:
                case 2:
                case 3:
                case 4:
                case 5:
                case 7:
                case 8:
                  if (
                    element.label !== obj.label &&
                    element.objectId === obj.id &&
                    saveTime < 1
                  ) {
                    obj.set('label', element.label)
                    ++saveTime
                  }
              }
              if (obj.badgeId && obj.badgeId === `badge${element.objectId}`) {
                canvas.remove(obj)
              }
            })
          }
        }
      }
    }
  }

  setRadioSelected(group) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          group.forEach((element) => {
            const annotate = this.annotate
              .find((x) => x.page === this.pageNumber)
              .data.find((y) => y.objectId === element.objectId)
            canvas.getObjects().forEach((obj) => {
              if (obj.id === element.objectId) {
                if (element.selected === false) {
                  if (obj._objects.length >= 2) {
                    obj._objects[2].set('radius', 0)
                    obj.selected = false
                    annotate.selected = false
                    canvas._historySaveAction()
                    canvas.renderAll()
                  }
                } else {
                  obj._objects[2].set(
                    'radius',
                    (obj.originWidth * 0.5 - 2 * obj.radioStrokeWidth) / 2
                  )
                  obj.selected = true
                  annotate.selected = true
                  canvas._historySaveAction()
                  canvas.renderAll()
                }
              }
            })
          })
        }
      }
    }
  }

  setFont(selection) {
    const self = this
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('fontFamily', selection.fontFamily)
            let c = document.createElement('canvas')
            let ctx = c.getContext('2d', { alpha: false })
            ctx.font = `${selection.fontSize * selection.scale}px ${
              selection.fontFamily
            }`
            if (selection.type === 1) {
              obj.set('fontSize', selection.fontSize * selection.scale)
              obj.set('originFontSize', selection.fontSize)
              const annotate = this.annotate
                .find((x) => x.page === this.pageNumber)
                .data.find((y) => y.objectId === selection.objectId)

              self.setSingleLineArea(obj, annotate)

              if (annotate && annotate.text === '') {
                let div = document.createElement('div')
                document.body.appendChild(div)
                div.innerHTML = self.i18n.text
                div.style.fontSize = selection.fontSize + 'px'
                div.style.position = 'absolute'
                div.style.left = -1000
                div.style.top = -1000
                const width = selection.textDirection
                  ? Math.min(obj.width, div.clientWidth)
                  : Math.max(obj.width, div.clientWidth)
                const height =
                  !selection.textDirection && selection.singleLine
                    ? Math.min(obj.height, div.clientHeight)
                    : Math.max(obj.height, div.clientHeight)
                obj.set('width', width)
                obj.set('height', height)
                annotate.width = width
                annotate.height = height
                document.body.removeChild(div)
                div = null
              }
            } else if (selection.type === 2) {
              const objs = canvas.getObjects()
              const strokeWidth =
                (selection.originFontSize / 14) * selection.scale

              // update fabric.js object
              if (objs) {
                objs.forEach((o) => {
                  if (
                    o.groupId === selection.groupId &&
                    o.annotateType === selection.type
                  ) {
                    // update outer rect
                    o.item(0).set({
                      width:
                        selection.originFontSize * selection.scale -
                        strokeWidth,
                      height:
                        selection.originFontSize * selection.scale -
                        strokeWidth,
                      strokeWidth,
                    })
                    // update inner rect
                    o.item(1).set({
                      width:
                        selection.originFontSize * selection.scale * 0.6 - 1,
                      height:
                        selection.originFontSize * selection.scale * 0.6 - 1,
                    })
                    // update group object (whole checkbox)
                    o.set({
                      originHeight: selection.originFontSize * selection.scale,
                      originWidth: selection.originFontSize * selection.scale,
                      centerHeight:
                        selection.originFontSize * selection.scale * 0.6,
                      centerWidth:
                        selection.originFontSize * selection.scale * 0.6,
                      strokeWidth,
                      width:
                        selection.originFontSize * selection.scale -
                        2 * strokeWidth,
                      height:
                        selection.originFontSize * selection.scale -
                        2 * strokeWidth,
                      originFontSize: selection.originFontSize,
                    })

                    // update selected image size
                    if (o.selected) {
                      const origin = window.location.origin
                      const imageUrl = origin + '/checkbox.png'
                      fabric.util.loadImage(imageUrl, function (img) {
                        o.item(1).set(
                          'fill',
                          new fabric.Pattern({
                            source: img,
                            repeat: 'no-repeat',
                            offsetX: -1,
                            offsetY: -1,
                            patternTransform: [
                              (selection.originFontSize *
                                selection.scale *
                                0.6) /
                                img.width,
                              0,
                              0,
                              (selection.originFontSize *
                                selection.scale *
                                0.6) /
                                img.width,
                              0,
                              0,
                            ],
                          })
                        )
                        canvas._historySaveAction()
                        canvas.renderAll()
                      })
                    }
                  }
                })
              }

              const children = this.annotate
                .find((x) => x.page === this.pageNumber)
                .data.filter(
                  (y) =>
                    y.groupId === selection.groupId && y.type === selection.type
                )

              // update annotate object
              if (children) {
                children.forEach((checkbox) => {
                  checkbox.originWidth = checkbox.originHeight =
                    selection.originFontSize * selection.scale
                  checkbox.centerHeight = checkbox.centerWidth =
                    checkbox.originWidth * 0.6
                  checkbox.height = checkbox.width =
                    checkbox.originWidth - 2 * strokeWidth
                  checkbox.originFontSize = selection.originFontSize
                  checkbox.strokeWidth = strokeWidth
                })
              }

              this.setGroupBorder(selection, obj)
            } else if (selection.type === 4) {
              obj.set('fontSize', selection.fontSize)
              const annotate = this.annotate
                .find((x) => x.page === this.pageNumber)
                .data.find((y) => y.objectId === selection.objectId)
              if (annotate) {
                let div = document.createElement('div')
                let originWidth = null
                let originHeight = null
                let width = null
                let height = null
                document.body.appendChild(div)
                switch (selection.dateEra) {
                  case 'common':
                  default:
                    div.innerHTML = 'YYYY-MM-DD'
                    div.style.position = 'absolute'
                    div.style.left = -1000
                    div.style.top = -1000
                    originWidth = div.clientWidth
                    originHeight = div.clientHeight
                    div.style.fontSize =
                      selection.fontSize * selection.scale + 'px'
                    width =
                      120 * selection.scale -
                      originWidth +
                      div.clientWidth +
                      selection.fontSize -
                      18
                    height =
                      32 * selection.scale - originHeight + div.clientHeight
                    if (selection.textDirection) {
                      obj.set('width', height)
                      obj.set('height', width)
                      annotate.width = height
                      annotate.height = width
                    } else {
                      obj.set('width', width)
                      obj.set('height', height)
                      annotate.width = width
                      annotate.height = height
                    }
                    break
                  case 'roc':
                    div.innerHTML = selection.textDirection
                      ? '中華民國 我我我我 年 我我 月 我我 日'
                      : '中華民國YYYY年MM月DD日'
                    div.innerHTML = selection.dateFormat.includes('中華民國')
                      ? div.innerHTML
                      : div.innerHTML.replace('中華民國', '')
                    div.style.position = 'absolute'
                    div.style.left = -1000
                    div.style.top = -1000
                    originWidth = div.clientWidth
                    originHeight = div.clientHeight
                    div.style.fontSize =
                      selection.fontSize * selection.scale + 'px'
                    width = div.clientWidth
                    height =
                      32 * selection.scale - originHeight + div.clientHeight
                    if (selection.textDirection) {
                      obj.set('width', height)
                      obj.set('height', width)
                      annotate.width = height
                      annotate.height = width
                    } else {
                      obj.set('width', width)
                      obj.set('height', height)
                      annotate.width = width
                      annotate.height = height
                    }
                    break
                }
                document.body.removeChild(div)
                div = null
              }
            } else if (selection.type === 5) {
              const objs = canvas.getObjects()
              const strokeWidth = (selection.originFontSize / 15) * self.scale

              // update fabric.js object
              if (objs) {
                objs.forEach((o) => {
                  if (
                    o.groupId === selection.groupId &&
                    o.annotateType === selection.type
                  ) {
                    // update inner outer rect
                    o.item(0).set({
                      width:
                        selection.originFontSize * self.scale - strokeWidth,
                      height:
                        selection.originFontSize * self.scale - strokeWidth,
                      rx: strokeWidth / 2,
                      ry: strokeWidth / 2,
                      strokeWidth,
                    })
                    // update inner circle
                    o.item(1).set({
                      radius:
                        (selection.originFontSize * self.scale * 0.65 - 2) / 2,
                      // strokeWidth,
                    })
                    // update outer circle
                    o.item(2).set({
                      width:
                        selection.originFontSize * self.scale * 0.65 -
                        strokeWidth / 2,
                      height:
                        selection.originFontSize * self.scale * 0.65 -
                        strokeWidth / 2,
                      strokeWidth,
                    })
                    // update group object (whole checkbox)
                    o.set({
                      originHeight: selection.originFontSize * self.scale,
                      originWidth: selection.originFontSize * self.scale,
                      centerHeight:
                        selection.originFontSize * self.scale * 0.65,
                      centerWidth: selection.originFontSize * self.scale * 0.65,
                      strokeWidth,
                      rx: strokeWidth,
                      ry: strokeWidth,
                      width:
                        selection.originFontSize * self.scale - 2 * strokeWidth,
                      height:
                        selection.originFontSize * self.scale - 2 * strokeWidth,
                      originFontSize: selection.originFontSize,
                    })

                    // update selected image size
                    if (o.selected) {
                      o._objects[2].set(
                        'radius',
                        (o.originWidth * 0.5 - 2 * o.radioStrokeWidth) / 2
                      )
                      canvas._historySaveAction()
                      canvas.renderAll()
                    }
                  }
                })
              }

              const children = this.annotate
                .find((x) => x.page === this.pageNumber)
                .data.filter(
                  (y) =>
                    y.groupId === selection.groupId && y.type === selection.type
                )

              // update annotate object
              if (children) {
                children.forEach((radioBtn) => {
                  radioBtn.originWidth = radioBtn.originHeight =
                    selection.originFontSize * self.scale
                  radioBtn.centerHeight = radioBtn.centerWidth =
                    radioBtn.originWidth * 0.65
                  radioBtn.height = radioBtn.width =
                    radioBtn.originWidth - 2 * strokeWidth
                  radioBtn.originFontSize = selection.originFontSize
                  radioBtn.strokeWidth = radioBtn.ry = radioBtn.rx = strokeWidth
                })
              }

              this.setGroupBorder(selection, obj)
            } else if (selection.type === 6) {
              obj.set('fontSize', selection.fontSize)
              const annotate = this.annotate
                .find((x) => x.page === this.pageNumber)
                .data.find((y) => y.objectId === selection.objectId)
              if (annotate) {
                let longest = null
                if (annotate.options !== null && annotate.options.length > 0) {
                  longest = annotate.options
                    .map((x) => x.name)
                    .reduce((a, b) => (a.length > b.length ? a : b))
                } else {
                  longest = self.i18n.select
                }
                let metrics = ctx.measureText(longest)
                let width = metrics.width
                const height =
                  metrics.actualBoundingBoxAscent +
                  metrics.actualBoundingBoxDescent +
                  16 * selection.scale
                metrics = ctx.measureText(self.i18n.select)
                width = width < metrics.width ? metrics.width : width
                if (
                  width + 20 >
                  (46 + selection.fontSize * 2) * selection.scale
                ) {
                  obj.set('width', width + 20)
                  obj.set('height', height)
                  annotate.width = width + 20
                  annotate.height = height
                  canvas.renderAll()
                } else {
                  obj.set(
                    'width',
                    (46 + selection.fontSize * 2) * selection.scale
                  )
                  obj.set('height', height)
                  annotate.width =
                    (46 + selection.fontSize * 2) * selection.scale
                  annotate.height = height
                  canvas.renderAll()
                }
              }
            }
            c.width = 0
            c.height = 0
            c = ctx = null
            obj.set('fontStyle', selection.fontStyle)
            obj.set('fontWeight', selection.fontWeight)
          }
        }
      }
    }
  }

  setTextarea(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            if (selection.textDirection) {
              const targetTextLines = []
              const text = selection.text.replace(/(\r\n|\n|\r)/gm, '')
              for (let i = 0; i < text.length; i++) {
                targetTextLines.push(text[i])
              }
              obj.set('text', targetTextLines.join('\n'))
            } else {
              obj.set('text', selection.text)
            }
            this.setSingleLineArea(obj, selection)
          }
        }
      }
    }
  }

  changeLabel(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const objs = canvas.getObjects()
          if (objs) {
            objs.forEach((obj) => {
              if (
                selection.label !== obj.label &&
                selection.objectId === obj.id
              ) {
                obj.set('label', selection.label)
              }
            })
          }
        }
      }
    }
  }

  changeGroupLabel(group, label) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          group.forEach((element) => {
            canvas.getObjects().forEach((obj) => {
              if (obj.id === element.objectId) {
                obj.set('groupLabel', label)
              }
            })
          })
        }
      }
    }
  }

  changeValidation(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('validation', selection.validation)
          }
        }
      }
    }
  }

  changeDateFormat(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('dateFormat', selection.dateFormat)
            this.setDateStyle(obj, selection)
          }
        }
      }
    }
  }

  changeDateRange(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('dateRange', selection.dateRange)
          }
        }
      }
    }
  }

  changeDateValue(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('text', selection.text)
          }
        }
      }
    }
  }

  changeDateEra(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('dateEra', selection.dateEra)
            if (selection.dateEra !== 'roc') {
              selection.textDirection = false
              this.setTextDirection(selection)
              obj.set('textDirection', false)
            }
            this.setDateStyle(obj, selection)
          }
        }
      }
    }
  }

  setDateStyle(obj, selection) {
    const annotate = this.annotate
      .find((x) => x.page === this.pageNumber)
      .data.find((y) => y.objectId === selection.objectId)
    if (annotate) {
      let div = document.createElement('div')
      let originWidth = null
      let originHeight = null
      let width = null
      let height = null
      document.body.appendChild(div)
      switch (selection.dateEra) {
        case 'common':
        default:
          div.innerHTML = 'YYYY-MM-DD'
          div.style.position = 'absolute'
          div.style.left = -1000
          div.style.top = -1000
          div.style.fontSize = selection.fontSize * selection.scale + 'px'
          originWidth = div.clientWidth
          originHeight = div.clientHeight
          div.style.fontSize = selection.fontSize * selection.scale + 'px'
          width =
            120 * selection.scale -
            originWidth +
            div.clientWidth +
            selection.fontSize -
            18
          height = 32 * selection.scale - originHeight + div.clientHeight
          if (selection.textDirection) {
            obj.set('width', height)
            obj.set('height', width)
            annotate.width = height
            annotate.height = width
          } else {
            obj.set('width', width)
            obj.set('height', height)
            annotate.width = width
            annotate.height = height
          }
          break
        case 'roc':
          div.innerHTML = selection.textDirection
            ? '中華民國 我我我我 年 我我 月 我我 日'
            : '中華民國YYYY年MM月DD日'
          div.innerHTML = selection.dateFormat.includes('中華民國')
            ? div.innerHTML
            : div.innerHTML.replace('中華民國', '')
          div.style.position = 'absolute'
          div.style.left = -1000
          div.style.top = -1000
          div.style.fontSize = selection.fontSize * selection.scale + 'px'
          originWidth = div.clientWidth
          originHeight = div.clientHeight
          div.style.fontSize = selection.fontSize * selection.scale + 'px'
          width = div.clientWidth
          height = 32 * selection.scale - originHeight + div.clientHeight
          if (selection.textDirection) {
            obj.set('width', height)
            obj.set('height', width)
            annotate.width = height
            annotate.height = width
          } else {
            obj.set('width', width)
            obj.set('height', height)
            annotate.width = width
            annotate.height = height
          }
          break
      }
      document.body.removeChild(div)
      div = null
    }
  }

  changeMaxlength(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('maxlength', selection.maxlength)
            canvas._historySaveAction()
            canvas.renderAll()
          }
        }
      }
    }
  }

  checkOptionWidth(selection) {
    const self = this
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection && selection.type === 6) {
            const annotate = this.annotate
              .find((x) => x.page === this.pageNumber)
              .data.find((y) => y.objectId === selection.objectId)
            if (annotate) {
              let c = document.createElement('canvas')
              let ctx = c.getContext('2d', { alpha: false })
              ctx.font = `${selection.fontSize * selection.scale}px ${
                selection.fontFamily
              }`
              const longest = annotate.options
                .map((x) => x.name)
                .reduce((a, b) => (a.length > b.length ? a : b))
              let metrics = ctx.measureText(longest)
              let width = metrics.width
              metrics = ctx.measureText(self.i18n.select)
              width = width < metrics.width ? metrics.width : width
              if (
                width + 20 >
                (46 + selection.fontSize * 2) * selection.scale
              ) {
                obj.set('width', width + 20)
                annotate.width = width + 20
              } else {
                obj.set(
                  'width',
                  (46 + selection.fontSize * 2) * selection.scale
                )
                annotate.width = (46 + selection.fontSize * 2) * selection.scale
              }
              canvas.renderAll()

              c.width = 0
              c.height = 0
              c = ctx = null
            }
          }
        }
      }
    }
  }

  changeSelectOption(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection && selection.options.toString() !== obj.option) {
            obj.set('options', selection.options)
          }
        }
      }
    }
  }

  changeSelectOptionId(selection) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const obj = canvas.getActiveObject()
          if (obj && selection) {
            obj.set('selectOptionId', selection.selectOptionId)
          }
        }
      }
    }
  }

  deselectAll() {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          canvas.discardActiveObject().renderAll()
        }
      }
    }
  }

  changeAnnotate(annotate, history) {
    this.annotate = annotate
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          canvas.clear()
          this.renderCollaborateAnnotate()
          if (history.page === this.pageNumber) {
            canvas.historyUndo = history.fabricUndo
            canvas.historyRedo = history.fabricRedo
            canvas.historyNextState = history.fabricNextState
            canvas.historyProcessing = history.historyProcessing
          }
          const childNodes = Array.from(this.canvasWrapper.childNodes).filter(
            (node) =>
              node.tagName.toUpperCase() !== 'CANVAS' &&
              !node.classList.contains('canvas-container')
          )
          childNodes.forEach((node) => {
            this.canvasWrapper.removeChild(node)
          })
          this.checkboxGroup = []
          this.radioGroup = []
          this.renderHTMLElement(this.scale)
        }
      }
    }
  }

  keyEvent(event, options = null) {
    const self = this
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          if (
            this.mode === 0 ||
            this.mode === 1 ||
            this.mode === 4 ||
            this.mode === 5
          ) {
            switch (event) {
              case 'delete':
                this.deleteSelection()
                break
              case 'paste':
                if (Array.isArray(options.clipboard)) {
                  const objects = []
                  const maxCheckboxGroupId = options.clipboard.prefill
                    ? 1
                    : this.checkboxGroup.length
                  const maxRadioGroupId = options.clipboard.prefill
                    ? 1
                    : this.radioGroup.length
                  const checkboxList = options.clipboard.filter(
                    (x) => x.type === 2
                  )
                  const radioList = options.clipboard.filter(
                    (x) => x.type === 5
                  )
                  const checkGroupIds = [
                    ...new Set(checkboxList.map((x) => x.groupId)),
                  ]
                  checkGroupIds.forEach((groupId, index) => {
                    const children = checkboxList.filter(
                      (x) => x.groupId === groupId
                    )
                    const newGroupId = maxCheckboxGroupId + index + 1
                    const checkboxGroupContainer = document.createElement('div')
                    checkboxGroupContainer.id = `checkboxGroupContainer${newGroupId}_${this.pageNumber}`
                    checkboxGroupContainer.style.position = 'absolute'
                    checkboxGroupContainer.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      children[0].checkboxStrokeWidth -
                      4 +
                      10 +
                      'px'
                    checkboxGroupContainer.style.top =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) -
                      children[0].strokeWidth / 2 -
                      4 +
                      10 +
                      'px'
                    checkboxGroupContainer.style.display = 'flex'
                    checkboxGroupContainer.style.flexDirection = 'column'
                    checkboxGroupContainer.style.alignItems = 'center'
                    const checkboxGroupDiv = document.createElement('div')
                    checkboxGroupDiv.id = `checkboxGroupDiv_${newGroupId}`
                    checkboxGroupDiv.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      children[0].width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * children[0].checkboxStrokeWidth +
                      8 +
                      'px'
                    checkboxGroupDiv.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      children[0].height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * children[0].checkboxStrokeWidth +
                      8 +
                      'px'
                    checkboxGroupDiv.style.border = '2px dashed #3183c8c2'
                    checkboxGroupDiv.style.zIndex = 20
                    checkboxGroupDiv.style.borderRadius = '2px'
                    if (options.clipboard[0].minimum > 0) {
                      checkboxGroupDiv.classList.add('required')
                    }
                    checkboxGroupContainer.appendChild(checkboxGroupDiv)
                    let addCheckboxBtn = null
                    if (!children[0].prefill) {
                      addCheckboxBtn = document.createElement('button')
                      addCheckboxBtn.id = `addCheckboxBtn_${newGroupId}`
                      addCheckboxBtn.type = 'button'
                      addCheckboxBtn.style.width = '16px'
                      addCheckboxBtn.style.height = '16px'
                      addCheckboxBtn.style.backgroundColor = '#3183c8'
                      addCheckboxBtn.style.border = 'none'
                      addCheckboxBtn.style.fontSize = '16px'
                      addCheckboxBtn.style.cursor = 'pointer'
                      addCheckboxBtn.style.display = 'flex'
                      addCheckboxBtn.style.alignItems = 'center'
                      addCheckboxBtn.style.justifyContent = 'center'
                      addCheckboxBtn.style.borderRadius = '2px'
                      addCheckboxBtn.style.zIndex = 30
                      const icon = document.createElement('i')
                      icon.className =
                        'v-icon notranslate mdi mdi-plus theme--light'
                      icon.style.fontSize = '18px'
                      icon.style.color = 'white'
                      addCheckboxBtn.appendChild(icon)
                      addCheckboxBtn.addEventListener('mouseup', function (e) {
                        const groupId = +addCheckboxBtn.id.split('_')[1]
                        const id =
                          Math.max(
                            ...self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.map((y) => y.objectId)
                          ) + 1
                        const checkboxChildren = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.filter(
                            (y) => y.groupId === groupId && y.type === 2
                          )
                        if (checkboxChildren.length > 0) {
                          const checkboxChild = checkboxChildren[0]
                          const top =
                            Math.max.apply(
                              Math,
                              checkboxChildren.map(function (child) {
                                return child.y
                              })
                            ) +
                            checkboxChild.height +
                            8
                          const left =
                            (Math.min.apply(
                              Math,
                              checkboxChildren.map(function (child) {
                                return child.x
                              })
                            ) +
                              Math.max.apply(
                                Math,
                                checkboxChildren.map(function (child) {
                                  return child.x
                                })
                              )) /
                            2
                          self.createCheckbox(
                            {
                              width: checkboxChild.width,
                              height: checkboxChild.height,
                              originWidth: checkboxChild.originWidth,
                              originHeight: checkboxChild.originHeight,
                              color: checkboxChild.color,
                              rx: checkboxChild.rx,
                              ry: checkboxChild.ry,
                              strokeWidth: checkboxChild.strokeWidth,
                              stroke: checkboxChild.stroke,
                              checkboxColor: checkboxChild.checkboxColor,
                              checkboxStrokeWidth:
                                checkboxChild.checkboxStrokeWidth,
                              checkboxStroke: checkboxChild.checkboxStroke,
                              x: left,
                              y: top,
                              selected: false,
                              groupId,
                              objectId: id,
                              id: checkboxChild.id,
                              centerWidth: checkboxChild.centerWidth,
                              centerHeight: checkboxChild.centerHeight,
                              required: true,
                              readonly: false,
                              ruleId: checkboxChild.ruleId,
                              maximum: checkboxChild.maximum,
                              minimum: checkboxChild.minimum,
                              label: '',
                              groupLabel: checkboxChild.groupLabel,
                              originFontSize: checkboxChild.originFontSize,
                            },
                            canvas
                          )
                          self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.unshift({
                              x: left,
                              y: top,
                              width: checkboxChild.width,
                              height: checkboxChild.height,
                              originWidth: checkboxChild.originWidth,
                              originHeight: checkboxChild.originHeight,
                              centerWidth: checkboxChild.centerWidth,
                              centerHeight: checkboxChild.centerHeight,
                              id: checkboxChild.id,
                              objectId: id,
                              type: checkboxChild.type,
                              color: checkboxChild.color,
                              checkboxColor: checkboxChild.checkboxColor,
                              strokeWidth: checkboxChild.strokeWidth,
                              stroke: checkboxChild.stroke,
                              checkboxStrokeWidth:
                                checkboxChild.checkboxStrokeWidth,
                              checkboxStroke: checkboxChild.checkboxStroke,
                              rx: checkboxChild.rx,
                              ry: checkboxChild.ry,
                              selected: false,
                              scale: checkboxChild.scale,
                              required: true,
                              readonly: false,
                              groupId,
                              ruleId: checkboxChild.ruleId,
                              maximum: checkboxChild.maximum,
                              minimum: checkboxChild.minimum,
                              label: '',
                              groupLabel: checkboxChild.groupLabel,
                              originFontSize: checkboxChild.originFontSize,
                            })
                          const groupDiv = document.getElementById(
                            `checkboxGroupDiv_${groupId}`
                          )
                          groupDiv.style.height =
                            parseFloat(groupDiv.style.height) +
                            checkboxChild.height +
                            8 +
                            'px'
                          const group = self.checkboxGroup.find(
                            (x) => x.id === groupId
                          )
                          if (group) {
                            group.items.push(id)
                          }
                          canvas.discardActiveObject().renderAll()
                        }
                      })
                      checkboxGroupContainer.appendChild(addCheckboxBtn)
                    }
                    this.canvasWrapper.appendChild(checkboxGroupContainer)
                    this.addElements.push(checkboxGroupContainer)
                    this.checkboxGroup.push({
                      id: newGroupId,
                      container: checkboxGroupContainer,
                      groupDiv: checkboxGroupDiv,
                      addCheckboxBtn,
                      items: [],
                      ruleId: 0,
                      maximum: options.clipboard.maximum,
                      minimum: options.clipboard.minimum,
                    })
                  })
                  const radioGroupIds = [
                    ...new Set(radioList.map((x) => x.groupId)),
                  ]
                  radioGroupIds.forEach((groupId, index) => {
                    const children = radioList.filter(
                      (x) => x.groupId === groupId
                    )
                    const newGroupId = maxRadioGroupId + index + 1
                    const radioGroupContainer = document.createElement('div')
                    radioGroupContainer.id = `radioGroupContainer${newGroupId}_${this.pageNumber}`
                    radioGroupContainer.style.position = 'absolute'
                    radioGroupContainer.style.top =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) -
                      children[0].radioStrokeWidth -
                      4 +
                      10 +
                      'px'
                    radioGroupContainer.style.left =
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) -
                      children[0].radioStrokeWidth -
                      4 +
                      10 +
                      'px'
                    radioGroupContainer.style.display = 'flex'
                    radioGroupContainer.style.flexDirection = 'column'
                    radioGroupContainer.style.alignItems = 'center'
                    const radioGroupDiv = document.createElement('div')
                    radioGroupDiv.id = `radioGroupDiv_${newGroupId}`
                    radioGroupDiv.style.width =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      children[0].width -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.x
                        })
                      ) +
                      4 * children[0].radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.height =
                      Math.max.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      children[0].height -
                      Math.min.apply(
                        Math,
                        children.map(function (child) {
                          return child.y
                        })
                      ) +
                      4 * children[0].radioStrokeWidth +
                      8 +
                      'px'
                    radioGroupDiv.style.border = '2px dashed #3183c8c2'
                    radioGroupDiv.style.zIndex = 20
                    radioGroupDiv.style.borderRadius = '2px'
                    radioGroupDiv.classList.add('required')
                    radioGroupContainer.appendChild(radioGroupDiv)

                    let addRadioBtn = null
                    if (!children[0].prefill) {
                      addRadioBtn = document.createElement('button')
                      addRadioBtn.id = `addRadioBtn_${newGroupId}`
                      addRadioBtn.type = 'button'
                      addRadioBtn.style.width = '16px'
                      addRadioBtn.style.height = '16px'
                      addRadioBtn.style.backgroundColor = '#3183c8'
                      addRadioBtn.style.border = 'none'
                      addRadioBtn.style.fontSize = '16px'
                      addRadioBtn.style.cursor = 'pointer'
                      addRadioBtn.style.display = 'flex'
                      addRadioBtn.style.alignItems = 'center'
                      addRadioBtn.style.justifyContent = 'center'
                      addRadioBtn.style.borderRadius = '2px'
                      addRadioBtn.style.zIndex = 30
                      const icon = document.createElement('i')
                      icon.className =
                        'v-icon notranslate mdi mdi-plus theme--light'
                      icon.style.fontSize = '18px'
                      icon.style.color = 'white'
                      addRadioBtn.appendChild(icon)
                      addRadioBtn.addEventListener('mouseup', function (e) {
                        const groupId = +addRadioBtn.id.split('_')[1]
                        const id =
                          Math.max(
                            ...self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.map((y) => y.objectId)
                          ) + 1
                        const radioChildren = self.annotate
                          .find((x) => x.page === self.pageNumber)
                          .data.filter(
                            (y) => y.groupId === groupId && y.type === 5
                          )
                        if (radioChildren.length > 0) {
                          const radioChild = radioChildren[0]
                          const top =
                            Math.max.apply(
                              Math,
                              radioChildren.map(function (child) {
                                return child.y
                              })
                            ) +
                            radioChild.height +
                            8
                          const left =
                            (Math.min.apply(
                              Math,
                              radioChildren.map(function (child) {
                                return child.x
                              })
                            ) +
                              Math.max.apply(
                                Math,
                                radioChildren.map(function (child) {
                                  return child.x
                                })
                              )) /
                            2
                          const addradio = self.createRadio({
                            width: radioChild.width,
                            height: radioChild.height,
                            originWidth: radioChild.originWidth,
                            originHeight: radioChild.originHeight,
                            color: radioChild.color,
                            rx: radioChild.rx,
                            ry: radioChild.ry,
                            strokeWidth: radioChild.strokeWidth,
                            stroke: radioChild.stroke,
                            radioBackgroundColor:
                              radioChild.radioBackgroundColor,
                            radioStrokeWidth: radioChild.radioStrokeWidth,
                            radioStroke: radioChild.radioStroke,
                            x: left,
                            y: top,
                            selected: false,
                            groupId,
                            objectId: id,
                            id: radioChild.id,
                            centerWidth: radioChild.centerWidth,
                            centerHeight: radioChild.centerHeight,
                            required: true,
                            readonly: false,
                            label: '',
                            groupLabel: radioChild.groupLabel,
                            originFontSize: radioChild.originFontSize || 28,
                          })
                          canvas.add(addradio)
                          self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.unshift({
                              x: left,
                              y: top,
                              width: radioChild.width,
                              height: radioChild.height,
                              originWidth: radioChild.originWidth,
                              originHeight: radioChild.originHeight,
                              centerWidth: radioChild.centerWidth,
                              centerHeight: radioChild.centerHeight,
                              id: radioChild.id,
                              objectId: id,
                              type: radioChild.type,
                              color: radioChild.color,
                              strokeWidth: radioChild.strokeWidth,
                              stroke: radioChild.stroke,
                              radioBackgroundColor:
                                radioChild.radioBackgroundColor,
                              radioStrokeWidth: radioChild.radioStrokeWidth,
                              radioStroke: radioChild.radioStroke,
                              rx: radioChild.rx,
                              ry: radioChild.ry,
                              selected: false,
                              scale: radioChild.scale,
                              required: true,
                              readonly: false,
                              groupId,
                              label: '',
                              groupLabel: radioChild.groupLabel,
                            })
                          const groupDiv = document.getElementById(
                            `radioGroupDiv_${groupId}`
                          )
                          groupDiv.style.height =
                            parseFloat(groupDiv.style.height) +
                            radioChild.height +
                            8 +
                            'px'
                          const group = self.radioGroup.find(
                            (x) => x.id === groupId
                          )
                          if (group) {
                            group.items.push(id)
                          }
                          canvas.discardActiveObject().renderAll()
                        }
                      })
                      radioGroupContainer.appendChild(addRadioBtn)
                    }
                    this.canvasWrapper.appendChild(radioGroupContainer)
                    this.addElements.push(radioGroupContainer)
                    this.radioGroup.push({
                      id: newGroupId,
                      container: radioGroupContainer,
                      groupDiv: radioGroupDiv,
                      addRadioBtn,
                      items: [],
                    })
                  })

                  let id = 0
                  options.clipboard.forEach((element) => {
                    if (element.type === 2) {
                      element.newGroupId =
                        maxCheckboxGroupId +
                        checkGroupIds.indexOf(element.groupId) +
                        1
                    } else if (element.type === 5) {
                      element.newGroupId =
                        maxRadioGroupId +
                        radioGroupIds.indexOf(element.groupId) +
                        1
                    }

                    // mode 5 有fabric.Image.fromURL，promise，id要先產生，否則重複id
                    if (this.mode === 5) {
                      id =
                        id > 0
                          ? id + 1
                          : self.annotate &&
                            self.annotate.find(
                              (x) => x.page === self.pageNumber
                            ) &&
                            self.annotate.find(
                              (x) => x.page === self.pageNumber
                            ).data.length > 0
                          ? Math.max(
                              ...self.annotate
                                .find((x) => x.page === self.pageNumber)
                                .data.map((y) => y.objectId)
                            ) + 1
                          : 1
                    }
                    const obj = this.paste(element, id)
                    objects.push(obj)
                  })

                  const selection = new fabric.ActiveSelection(objects, {
                    canvas,
                  })
                  canvas.setActiveObject(selection)
                  canvas.renderAll()
                  canvas._historySaveAction()
                } else {
                  const maxCheckboxGroupId = options.clipboard.prefill
                    ? 1
                    : this.checkboxGroup.length
                  const maxRadioGroupId = options.clipboard.prefill
                    ? 1
                    : this.radioGroup.length
                  if (!options.clipboard.prefill) {
                    if (options.clipboard.type === 2) {
                      options.clipboard.newGroupId = maxCheckboxGroupId + 1
                      const obj = options.clipboard
                      const groupId = obj.newGroupId
                      const checkboxGroupContainer =
                        document.createElement('div')
                      checkboxGroupContainer.id = `checkboxGroupContainer${groupId}_${this.pageNumber}`
                      checkboxGroupContainer.style.position = 'absolute'
                      checkboxGroupContainer.style.left = obj.x - 5 + 10 + 'px'
                      checkboxGroupContainer.style.top =
                        obj.y - 16 - 4 + 10 + 16 + 'px'
                      checkboxGroupContainer.style.display = 'flex'
                      checkboxGroupContainer.style.flexDirection = 'column'
                      checkboxGroupContainer.style.alignItems = 'center'
                      const checkboxGroupDiv = document.createElement('div')
                      checkboxGroupDiv.id = `checkboxGroupDiv_${groupId}`
                      checkboxGroupDiv.style.width =
                        (obj.originWidth * self.scale) / obj.scale + 8 + 'px'
                      checkboxGroupDiv.style.height =
                        (obj.originHeight * self.scale) / obj.scale + 8 + 'px'
                      checkboxGroupDiv.style.border = '2px dashed #3183c8c2'
                      checkboxGroupDiv.style.zIndex = 20
                      checkboxGroupDiv.style.borderRadius = '2px'
                      if (options.clipboard.minimum > 0) {
                        checkboxGroupDiv.classList.add('required')
                      }
                      checkboxGroupContainer.appendChild(checkboxGroupDiv)
                      let addCheckboxBtn = null
                      if (!obj.prefill) {
                        addCheckboxBtn = document.createElement('button')
                        addCheckboxBtn.id = `addCheckboxBtn_${groupId}`
                        addCheckboxBtn.type = 'button'
                        addCheckboxBtn.style.width = '16px'
                        addCheckboxBtn.style.height = '16px'
                        addCheckboxBtn.style.backgroundColor = '#3183c8'
                        addCheckboxBtn.style.border = 'none'
                        addCheckboxBtn.style.fontSize = '16px'
                        addCheckboxBtn.style.cursor = 'pointer'
                        addCheckboxBtn.style.display = 'flex'
                        addCheckboxBtn.style.alignItems = 'center'
                        addCheckboxBtn.style.justifyContent = 'center'
                        addCheckboxBtn.style.borderRadius = '2px'
                        addCheckboxBtn.style.zIndex = 30
                        const icon = document.createElement('i')
                        icon.className =
                          'v-icon notranslate mdi mdi-plus theme--light'
                        icon.style.fontSize = '18px'
                        icon.style.color = 'white'
                        addCheckboxBtn.appendChild(icon)
                        addCheckboxBtn.addEventListener(
                          'mouseup',
                          function (e) {
                            const groupId = +addCheckboxBtn.id.split('_')[1]
                            const id =
                              Math.max(
                                ...self.annotate
                                  .find((x) => x.page === self.pageNumber)
                                  .data.map((y) => y.objectId)
                              ) + 1
                            const checkboxChildren = self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.filter(
                                (y) => y.groupId === groupId && y.type === 2
                              )
                            if (checkboxChildren.length > 0) {
                              const checkboxChild = checkboxChildren[0]
                              const top =
                                Math.max.apply(
                                  Math,
                                  checkboxChildren.map(function (child) {
                                    return child.y
                                  })
                                ) +
                                checkboxChild.height +
                                8
                              const left =
                                (Math.min.apply(
                                  Math,
                                  checkboxChildren.map(function (child) {
                                    return child.x
                                  })
                                ) +
                                  Math.max.apply(
                                    Math,
                                    checkboxChildren.map(function (child) {
                                      return child.x
                                    })
                                  )) /
                                2
                              self.createCheckbox(
                                {
                                  width: checkboxChild.width,
                                  height: checkboxChild.height,
                                  originWidth: checkboxChild.originWidth,
                                  originHeight: checkboxChild.originHeight,
                                  color: checkboxChild.color,
                                  rx: checkboxChild.rx,
                                  ry: checkboxChild.ry,
                                  strokeWidth: checkboxChild.strokeWidth,
                                  stroke: checkboxChild.stroke,
                                  checkboxColor: checkboxChild.checkboxColor,
                                  checkboxStrokeWidth:
                                    checkboxChild.checkboxStrokeWidth,
                                  checkboxStroke: checkboxChild.checkboxStroke,
                                  x: left,
                                  y: top,
                                  selected: false,
                                  groupId,
                                  objectId: id,
                                  id: checkboxChild.id,
                                  centerWidth: checkboxChild.centerWidth,
                                  centerHeight: checkboxChild.centerHeight,
                                  required: true,
                                  readonly: false,
                                  ruleId: checkboxChild.ruleId,
                                  maximum: checkboxChild.maximum,
                                  minimum: checkboxChild.minimum,
                                  label: '',
                                  groupLabel: checkboxChild.groupLabel,
                                  originFontSize: checkboxChild.originFontSize,
                                },
                                canvas
                              )
                              canvas._historySaveAction()
                              self.annotate
                                .find((x) => x.page === self.pageNumber)
                                .data.unshift({
                                  x: left,
                                  y: top,
                                  width: checkboxChild.width,
                                  height: checkboxChild.height,
                                  originWidth: checkboxChild.originWidth,
                                  originHeight: checkboxChild.originHeight,
                                  centerWidth: checkboxChild.centerWidth,
                                  centerHeight: checkboxChild.centerHeight,
                                  id: checkboxChild.id,
                                  objectId: id,
                                  type: checkboxChild.type,
                                  color: checkboxChild.color,
                                  checkboxColor: checkboxChild.checkboxColor,
                                  strokeWidth: checkboxChild.strokeWidth,
                                  stroke: checkboxChild.stroke,
                                  checkboxStrokeWidth:
                                    checkboxChild.checkboxStrokeWidth,
                                  checkboxStroke: checkboxChild.checkboxStroke,
                                  rx: checkboxChild.rx,
                                  ry: checkboxChild.ry,
                                  selected: false,
                                  scale: checkboxChild.scale,
                                  required: true,
                                  readonly: false,
                                  groupId,
                                  ruleId: checkboxChild.ruleId,
                                  maximum: checkboxChild.maximum,
                                  minimum: checkboxChild.minimum,
                                  label: '',
                                  groupLabel: checkboxChild.groupLabel,
                                  originFontSize: checkboxChild.originFontSize,
                                })
                              const groupDiv = document.getElementById(
                                `checkboxGroupDiv_${groupId}`
                              )
                              groupDiv.style.height =
                                parseFloat(groupDiv.style.height) +
                                checkboxChild.height +
                                8 +
                                'px'
                              const group = self.checkboxGroup.find(
                                (x) => x.id === groupId
                              )
                              if (group) {
                                group.items.push(id)
                              }
                              canvas.discardActiveObject().renderAll()
                            }
                          }
                        )
                        checkboxGroupContainer.appendChild(addCheckboxBtn)
                      }
                      this.canvasWrapper.appendChild(checkboxGroupContainer)
                      this.addElements.push(checkboxGroupContainer)
                      this.checkboxGroup.push({
                        id: groupId,
                        container: checkboxGroupContainer,
                        groupDiv: checkboxGroupDiv,
                        addCheckboxBtn,
                        items: [],
                        ruleId: 0,
                        maximum: options.clipboard.maximum,
                        minimum: options.clipboard.minimum,
                      })
                    } else if (options.clipboard.type === 5) {
                      options.clipboard.newGroupId = maxRadioGroupId + 1
                      const obj = options.clipboard
                      const groupId = obj.newGroupId
                      const radioGroupContainer = document.createElement('div')
                      radioGroupContainer.id = `radioGroupContainer${groupId}_${this.pageNumber}`
                      radioGroupContainer.style.position = 'absolute'
                      radioGroupContainer.style.left =
                        obj.x - obj.strokeWidth / 2 - 4 + 10 + 'px'
                      radioGroupContainer.style.top =
                        obj.y - obj.strokeWidth / 2 - 16 - 4 + 10 + 16 + 'px'
                      radioGroupContainer.style.display = 'flex'
                      radioGroupContainer.style.flexDirection = 'column'
                      radioGroupContainer.style.alignItems = 'center'
                      const radioGroupDiv = document.createElement('div')
                      radioGroupDiv.id = `radioGroupDiv_${groupId}`
                      radioGroupDiv.style.width =
                        (obj.originWidth * self.scale) / obj.scale + 8 + 'px'
                      radioGroupDiv.style.height =
                        (obj.originHeight * self.scale) / obj.scale + 8 + 'px'
                      radioGroupDiv.style.border = '2px dashed #3183c8c2'
                      radioGroupDiv.style.zIndex = 20
                      radioGroupDiv.style.borderRadius = '2px'
                      radioGroupDiv.classList.add('required')
                      radioGroupContainer.appendChild(radioGroupDiv)
                      let addRadioBtn = null
                      if (!obj.prefill) {
                        addRadioBtn = document.createElement('button')
                        addRadioBtn.id = `addRadioBtn_${groupId}`
                        addRadioBtn.type = 'button'
                        addRadioBtn.style.width = '16px'
                        addRadioBtn.style.height = '16px'
                        addRadioBtn.style.backgroundColor = '#3183c8'
                        addRadioBtn.style.border = 'none'
                        addRadioBtn.style.fontSize = '16px'
                        addRadioBtn.style.cursor = 'pointer'
                        addRadioBtn.style.display = 'flex'
                        addRadioBtn.style.alignItems = 'center'
                        addRadioBtn.style.justifyContent = 'center'
                        addRadioBtn.style.borderRadius = '2px'
                        addRadioBtn.style.zIndex = 30
                        const icon = document.createElement('i')
                        icon.className =
                          'v-icon notranslate mdi mdi-plus theme--light'
                        icon.style.fontSize = '18px'
                        icon.style.color = 'white'
                        addRadioBtn.appendChild(icon)
                        addRadioBtn.addEventListener('mouseup', function (e) {
                          const groupId = +addRadioBtn.id.split('_')[1]
                          const id =
                            Math.max(
                              ...self.annotate
                                .find((x) => x.page === self.pageNumber)
                                .data.map((y) => y.objectId)
                            ) + 1
                          const radioChildren = self.annotate
                            .find((x) => x.page === self.pageNumber)
                            .data.filter(
                              (y) => y.groupId === groupId && y.type === 5
                            )
                          if (radioChildren.length > 0) {
                            const radioChild = radioChildren[0]
                            const top =
                              Math.max.apply(
                                Math,
                                radioChildren.map(function (child) {
                                  return child.y
                                })
                              ) +
                              radioChild.height +
                              8
                            const left =
                              (Math.min.apply(
                                Math,
                                radioChildren.map(function (child) {
                                  return child.x
                                })
                              ) +
                                Math.max.apply(
                                  Math,
                                  radioChildren.map(function (child) {
                                    return child.x
                                  })
                                )) /
                              2
                            const proportion = self.scale / radioChild.scale
                            const addradio = self.createRadio({
                              width: radioChild.width * proportion,
                              height: radioChild.height * proportion,
                              originWidth: radioChild.originWidth * proportion,
                              originHeight:
                                radioChild.originHeight * proportion,
                              color: radioChild.color,
                              rx: radioChild.rx,
                              ry: radioChild.ry,
                              strokeWidth: radioChild.strokeWidth * proportion,
                              stroke: radioChild.stroke,
                              radioBackgroundColor:
                                radioChild.radioBackgroundColor,
                              radioStrokeWidth: radioChild.radioStrokeWidth,
                              radioStroke: radioChild.radioStroke,
                              x: left,
                              y: top,
                              selected: false,
                              groupId,
                              objectId: id,
                              id: radioChild.id,
                              centerWidth: radioChild.centerWidth,
                              centerHeight: radioChild.centerHeight,
                              required: true,
                              readonly: false,
                              label: '',
                              groupLabel: radioChild.groupLabel,
                              originFontSize: radioChild.originFontSize || 28,
                            })
                            canvas.add(addradio)
                            canvas._historySaveAction()
                            self.annotate
                              .find((x) => x.page === self.pageNumber)
                              .data.unshift({
                                x: left,
                                y: top,
                                width: radioChild.width,
                                height: radioChild.height,
                                originWidth: radioChild.originWidth,
                                originHeight: radioChild.originHeight,
                                centerWidth: radioChild.centerWidth,
                                centerHeight: radioChild.centerHeight,
                                id: radioChild.id,
                                objectId: id,
                                type: radioChild.type,
                                color: radioChild.color,
                                strokeWidth: radioChild.strokeWidth,
                                stroke: radioChild.stroke,
                                radioBackgroundColor:
                                  radioChild.radioBackgroundColor,
                                radioStrokeWidth: radioChild.radioStrokeWidth,
                                radioStroke: radioChild.radioStroke,
                                rx: radioChild.rx,
                                ry: radioChild.ry,
                                selected: false,
                                scale: radioChild.scale,
                                required: true,
                                readonly: false,
                                groupId,
                                label: '',
                                groupLabel: radioChild.groupLabel,
                                originFontSize: radioChild.originFontSize || 28,
                              })
                            const groupDiv = document.getElementById(
                              `radioGroupDiv_${groupId}`
                            )
                            groupDiv.style.height =
                              parseFloat(groupDiv.style.height) +
                              radioChild.height +
                              8 +
                              'px'
                            const group = this.radioGroup.find(
                              (x) => x.id === groupId
                            )
                            if (group) {
                              group.items.push(id)
                            }
                            canvas.discardActiveObject().renderAll()
                          }
                        })
                        radioGroupContainer.appendChild(addRadioBtn)
                      }
                      this.canvasWrapper.appendChild(radioGroupContainer)
                      this.addElements.push(radioGroupContainer)
                      this.radioGroup.push({
                        id: groupId,
                        container: radioGroupContainer,
                        groupDiv: radioGroupDiv,
                        addRadioBtn,
                        items: [],
                      })
                    }
                  }
                  const obj = this.paste(options.clipboard)
                  if (obj) {
                    canvas.setActiveObject(obj)
                  }
                  canvas._historySaveAction()
                }
                break
              case 'undo':
                this.undo()
                break
              case 'redo':
                this.redo()
                break
            }
          }
        }
      }
    }
  }

  deleteSelection() {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const objs = canvas.getActiveObjects()
          const annotate = this.annotate.find((x) => x.page === this.pageNumber)
          if (objs) {
            objs.forEach((obj) => {
              const shape = annotate.data.find((y) => y.objectId === obj.id)
              const index = this.annotate
                .find((x) => x.page === this.pageNumber)
                .data.indexOf(shape)
              if (index > -1) {
                this.annotate
                  .find((x) => x.page === this.pageNumber)
                  .data.splice(index, 1)
              }
              this.setGroupBorder(shape, obj, true)
              canvas.remove(obj)
            })
            canvas.discardActiveObject().renderAll()
          }
        }
      }
    }
  }

  editSelection(state, data) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const objs = canvas.getActiveObjects()
          const annotate = this.annotate.find((x) => x.page === this.pageNumber)
          if (objs && objs.length === 1) {
            const obj = objs[0]
            const shape = annotate.data.find((y) => y.objectId === obj.id)
            switch (state) {
              case 1:
                obj.fontSize = data.style.fontSize * this.scale
                shape.fontSize = obj.originFontSize = data.style.fontSize
                shape.fontFamily = obj.fontFamily = data.style.fontFamily
                shape.text = obj.text = data.text
                break
              case 4:
                obj.fontSize = data.style.fontSize * this.scale
                shape.fontSize = obj.originFontSize = data.style.fontSize
                shape.fontFamily = obj.fontFamily = data.style.fontFamily
                shape.dateEra = obj.dateEra = data.style.dateEra
                shape.dateFormat = obj.dateFormat = data.style.dateFormat
                shape.text = obj.text = data.text
                shape.data = obj.data = data.text
                break
            }
            canvas.renderAll()
            const dropDown = document.querySelector('.dropdown-content')
            dropDown.style.top = obj.top + obj.height * obj.scale + 20 + 'px'
            dropDown.style.left =
              obj.left +
              (obj.width * obj.scale) / 2 -
              dropDown.clientWidth / 2 +
              'px'
          }
        }
      }
    }
  }

  hideCanvasDraw(on) {
    if (this.mode === 0) {
      if (this.canvasWrapper) {
        if (this.canvas) {
          const canvas = this.canvas.fabric
          if (canvas) {
            canvas.discardActiveObject()
            const objs = canvas.getObjects()
            objs.forEach((obj) => {
              obj.selectable = obj.type === 16 ? on : !on
            })
            canvas.renderAll()
          }
        }
      }
    }
    // for comment icon 被html element 蓋住
    // if (this.mode === 1) {
    //   document.querySelectorAll('.canvasDraw').forEach((element) => {
    //     for (const canvas of element.children) {
    //       canvas.style.zIndex = on ? '29' : '41'
    //     }
    //   })
    //   document.querySelectorAll('.upper-canvas').forEach((element) => {
    //     element.style.zIndex = on ? '41' : '30'
    //   })
    // }
  }

  paste(obj, payloadId = null) {
    const self = this
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          let groupId = 0
          let rect = null
          let group = null
          let textArea = null
          let checkbox = null
          let radio = null
          let dropdown = null
          let imageGroup = null
          let anno = null
          const proportion = self.scale / obj.scale

          let id = null
          if (this.mode === 5) {
            id = payloadId
          }
          if (!id) {
            id =
              self.annotate &&
              self.annotate.find((x) => x.page === self.pageNumber) &&
              self.annotate.find((x) => x.page === self.pageNumber).data
                .length > 0
                ? Math.max(
                    ...self.annotate
                      .find((x) => x.page === self.pageNumber)
                      .data.map((y) => y.objectId)
                  ) + 1
                : 1
          }

          switch (obj.type) {
            case 0:
              obj.label = this.indexOfCopy(obj)
              if (this.mode !== 5) {
                rect = new fabric.LabeledRect({
                  width: obj.width,
                  height: obj.height,
                  top: obj.y + 10,
                  left: obj.x + 10,
                  fill: obj.color,
                  rx: obj.rx,
                  ry: obj.ry,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  name: self.i18n.signature,
                  icon: 'signature',
                  id,
                  selectId: obj.id,
                  annotateType: 0,
                  required: obj.required,
                  label: obj.label,
                  textDirection: obj.textDirection,
                  scale: obj.scale,
                })
                canvas.add(rect)

                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 0,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  rx: obj.rx,
                  ry: obj.ry,
                  scale: obj.scale,
                  required: obj.required,
                  label: obj.label,
                  textDirection: obj.textDirection,
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return rect
              } else {
                fabric.Image.fromURL(obj.data, function (img) {
                  rect = new fabric.Rect({
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    id: payloadId ?? id,
                    fill: 'transparent',
                    rx: obj.rx,
                    ry: obj.ry,
                    name: self.i18n.signature,
                    originX: 'center',
                    originY: 'center',
                    selectId: obj.id,
                    annotateType: 0,
                    required: obj.required,
                    label: obj.label,
                    textDirection: obj.textDirection,
                    scale: self.scale,
                  })
                  const bounds = rect.getBoundingRect()

                  const scaleFactor = Math.min(
                    Math.min(1, bounds.width / img.width),
                    Math.min(1, bounds.height / img.height)
                  )
                  img.scale(scaleFactor)
                  img.set({
                    top:
                      bounds.top +
                      Math.max(bounds.height - img.height * scaleFactor, 0) / 2,
                    left:
                      bounds.left +
                      Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                  })
                  imageGroup = new fabric.Group([rect, img], {
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    id,
                    annotateType: 0,
                    required: obj.required,
                    label: obj.label,
                    scale: self.scale,
                  })

                  canvas.add(imageGroup)
                  anno = {
                    x: obj.x + 10,
                    y: obj.y + 10,
                    width: obj.width,
                    height: obj.height,
                    objectId: id,
                    type: 0,
                    color: obj.color,
                    strokeWidth: obj.strokeWidth,
                    stroke: obj.stroke,
                    rx: obj.rx,
                    ry: obj.ry,
                    scale: obj.scale,
                    required: obj.required,
                    label: obj.label,
                    textDirection: obj.textDirection,
                    done: true,
                    data: obj.data,
                    imageData: obj.data,
                    imageWidth: img.width * scaleFactor,
                    imageHeight: img.height * scaleFactor,
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(imageGroup)
                })
              }
              break
            case 1:
              obj.label = this.indexOfCopy(obj)
              if (this.mode !== 5) {
                textArea = new fabric.TextArea(
                  obj.textDirection ? obj.text.split('').join('\n') : obj.text,
                  {
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    backgroundColor: obj.color,
                    id,
                    selectId: obj.id,
                    textAlign: obj.textAlign || 'left',
                    splitByGrapheme: true,
                    rx: obj.rx || 2 * obj.scale,
                    ry: obj.rx || 2 * obj.scale,
                    backgroundStroke: obj.stroke,
                    backgroundStrokeWidth: obj.strokeWidth,
                    annotateType: 1,
                    originFontSize: obj.fontSize,
                    fontSize: obj.fontSize * obj.scale,
                    fontFamily: obj.fontFamily,
                    fontStyle: obj.fontStyle,
                    fontWeight: obj.fontWeight,
                    required: obj.required,
                    readonly: obj.readonly,
                    maxlength: obj.maxlength,
                    label: obj.label,
                    validation: {
                      type: obj.validation.type,
                      regex: obj.validation.regex,
                      errorMessage: obj.validation.errorMessage,
                    },
                    prefill: obj.prefill,
                    textColor: obj.textColor,
                    fill: obj.textColor || 'rgba(0,0,0,1)',
                    singleLine: obj.singleLine || false,
                    textDirection: obj.textDirection || false,
                    lockScalingY:
                      (!obj.textDirection && obj.singleLine) || false,
                    lockScalingX: obj.textDirection || false,
                    scale: obj.scale,
                  }
                )
                canvas.add(textArea)

                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 1,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  text: obj.text,
                  scale: obj.scale,
                  required: obj.required,
                  readonly: obj.readonly,
                  fontSize: obj.fontSize,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  maxlength: obj.maxlength,
                  rx: obj.rx,
                  ry: obj.ry,
                  validation: {
                    type: obj.validation.type,
                    regex: obj.validation.regex,
                    errorMessage: obj.validation.errorMessage,
                  },
                  label: obj.label,
                  prefill: obj.prefill,
                  textAlign: obj.textAlign || 'left',
                  textColor: obj.textColor,
                  singleLine: obj.singleLine,
                  textDirection: obj.textDirection,
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return textArea
              } else {
                const text = new fabric.Text(obj.text, {
                  width: obj.width,
                  height: obj.height,
                  top: obj.y + 10,
                  left: obj.x + 10,
                  backgroundColor: obj.color,
                  id,
                  selectId: obj.id,
                  textAlign: obj.textAlign || 'left',
                  splitByGrapheme: true,
                  rx: obj.rx || 2 * obj.scale,
                  ry: obj.rx || 2 * obj.scale,
                  backgroundStroke: obj.stroke,
                  backgroundStrokeWidth: obj.strokeWidth,
                  annotateType: 1,
                  originFontSize: obj.fontSize,
                  fontSize: obj.fontSize * obj.scale,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  required: obj.required,
                  readonly: obj.readonly,
                  maxlength: obj.maxlength,
                  label: obj.label,
                  prefill: obj.prefill,
                  textColor: obj.textColor,
                  fill: obj.textColor || 'rgba(0,0,0,1)',
                  singleLine: obj.singleLine || false,
                  textDirection: obj.textDirection || false,
                  lockScalingY: (!obj.textDirection && obj.singleLine) || false,
                  lockScalingX: obj.textDirection || false,
                  scale: obj.scale,
                })
                text.setControlsVisibility({
                  mb: false,
                  ml: false,
                  mr: false,
                  mt: false,
                  mtr: false,
                  tl: false,
                  tr: false,
                  bl: false,
                  br: false,
                })
                canvas.add(text)
                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 1,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  text: obj.text,
                  scale: obj.scale,
                  required: obj.required,
                  readonly: obj.readonly,
                  fontSize: obj.fontSize,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  maxlength: obj.maxlength,
                  rx: obj.rx,
                  ry: obj.ry,
                  label: obj.label,
                  prefill: obj.prefill,
                  textAlign: obj.textAlign || 'left',
                  textColor: obj.textColor,
                  singleLine: obj.singleLine,
                  textDirection: obj.textDirection,
                  fill: 'black',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return text
              }
            case 2:
              groupId = obj.newGroupId
              obj.groupLabel = this.indexOfCopy(obj)

              checkbox = self.createCheckbox(
                {
                  width: obj.width * proportion,
                  height: obj.height * proportion,
                  originWidth: obj.originWidth * proportion,
                  originHeight: obj.originHeight * proportion,
                  color: obj.color,
                  rx: obj.rx,
                  ry: obj.ry,
                  strokeWidth: obj.strokeWidth * proportion,
                  stroke: obj.stroke,
                  checkboxColor: obj.checkboxColor,
                  checkboxStrokeWidth: obj.checkboxStrokeWidth,
                  checkboxStroke: obj.checkboxStroke,
                  x: obj.x + 10,
                  y: obj.y + 10,
                  selected: obj.prefill ? true : obj.selected,
                  groupId: obj.prefill ? null : groupId,
                  objectId: id,
                  id: obj.id,
                  centerWidth: obj.centerWidth,
                  centerHeight: obj.centerHeight,
                  required: true,
                  readonly: false,
                  ruleId: obj.ruleId,
                  maximum: obj.maximum,
                  minimum: obj.minimum,
                  label: obj.label,
                  groupLabel: obj.groupLabel,
                  prefill: obj.prefill,
                  originFontSize: obj.originFontSize,
                  scale: obj.scale,
                },
                canvas
              )
              anno = {
                x: obj.x + 10,
                y: obj.y + 10,
                width: obj.width,
                height: obj.height,
                originWidth: obj.originWidth,
                originHeight: obj.originHeight,
                centerWidth: obj.centerWidth,
                centerHeight: obj.centerHeight,
                id: obj.id,
                objectId: id,
                type: 2,
                color: obj.color,
                checkboxColor: obj.checkboxColor,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                checkboxStrokeWidth: obj.checkboxStrokeWidth,
                checkboxStroke: obj.checkboxStroke,
                rx: obj.rx,
                ry: obj.ry,
                selected: obj.prefill ? true : obj.selected,
                scale: obj.scale,
                required: true,
                readonly: false,
                groupId: obj.prefill ? null : groupId,
                ruleId: obj.ruleId,
                maximum: obj.maximum,
                minimum: obj.minimum,
                label: obj.label,
                groupLabel: obj.groupLabel,
                prefill: obj.prefill,
                originFontSize: obj.originFontSize,
              }
              self.insertAnnotate(anno)

              if (!obj.prefill) {
                group = self.checkboxGroup.find((x) => x.id === groupId)
                if (group) {
                  group.items.push(id)
                }
              }
              self.setState(0)
              return checkbox
            case 3:
              obj.label = this.indexOfCopy(obj)
              if (this.mode !== 5) {
                rect = new fabric.LabeledRect({
                  width: obj.width,
                  height: obj.height,
                  top: obj.y + 10,
                  left: obj.x + 10,
                  fill: obj.color,
                  rx: obj.rx,
                  ry: obj.ry,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  name: self.i18n.stamp,
                  icon: 'stamp',
                  id,
                  selectId: obj.id,
                  annotateType: 3,
                  required: obj.required,
                  label: obj.label,
                  scale: obj.scale,
                })
                canvas.add(rect)

                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 3,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  rx: obj.rx,
                  ry: obj.ry,
                  scale: obj.scale,
                  required: obj.required,
                  label: obj.label,
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return rect
              } else {
                fabric.Image.fromURL(obj.data, function (img) {
                  rect = new fabric.Rect({
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    fill: obj.color,
                    rx: obj.rx,
                    ry: obj.ry,
                    name: self.i18n.stamp,
                    icon: 'stamp',
                    id,
                    selectId: obj.id,
                    annotateType: 3,
                    required: obj.required,
                    label: obj.label,
                    scale: obj.scale,
                    originX: 'center',
                    originY: 'center',
                  })
                  const bounds = rect.getBoundingRect()

                  const scaleFactor = Math.min(
                    Math.min(1, bounds.width / img.width),
                    Math.min(1, bounds.height / img.height)
                  )
                  img.scale(scaleFactor)
                  img.set({
                    top:
                      bounds.top +
                      Math.max(bounds.height - img.height * scaleFactor, 0) / 2,
                    left:
                      bounds.left +
                      Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                  })
                  imageGroup = new fabric.Group([rect, img], {
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    id,
                    annotateType: 3,
                    required: obj.required,
                    label: obj.label,
                    scale: self.scale,
                  })

                  canvas.add(imageGroup)

                  anno = {
                    x: obj.x + 10,
                    y: obj.y + 10,
                    width: obj.width,
                    height: obj.height,
                    objectId: id,
                    color: obj.color,
                    strokeWidth: obj.strokeWidth,
                    stroke: obj.stroke,
                    rx: obj.rx,
                    ry: obj.ry,
                    scale: obj.scale,
                    required: obj.required,
                    label: obj.label,
                    textDirection: obj.textDirection,
                    done: true,
                    data: obj.data,
                    imageData: obj.data,
                    imageWidth: img.width * scaleFactor,
                    imageHeight: img.height * scaleFactor,
                    type: 3,
                    originX: 'center',
                    originY: 'center',
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(imageGroup)
                })
              }
              break
            case 4:
              obj.label = this.indexOfCopy(obj)
              if (this.mode !== 5) {
                rect = new fabric.Date({
                  width: obj.width,
                  height: obj.height,
                  top: obj.y + 10,
                  left: obj.x + 10,
                  fill: obj.color,
                  rx: obj.rx,
                  ry: obj.ry,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  name: self.i18n.date,
                  fontSize: obj.fontSize,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  id,
                  selectId: obj.id,
                  annotateType: 4,
                  dateFormat: obj.dateFormat,
                  dateRange: obj.dateRange || 'signDay',
                  label: obj.label,
                  required: obj.required,
                  text: obj.text,
                  readonly: obj.readonly,
                  dateEra: obj.dateEra,
                  textColor: obj.textColor,
                  textDirection: obj.textDirection || false,
                  scale: obj.scale,
                })
                canvas.add(rect)

                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 4,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  rx: obj.rx,
                  ry: obj.ry,
                  scale: obj.scale,
                  fontSize: obj.fontSize,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  required: obj.required,
                  dateFormat: obj.dateFormat,
                  dateRange: obj.dateRange,
                  label: obj.label,
                  text: obj.text,
                  readonly: obj.readonly,
                  dateEra: obj.dateEra,
                  textColor: obj.textColor,
                  textDirection: obj.textDirection,
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return rect
              } else {
                const text = new fabric.Text(obj.text, {
                  width: obj.width,
                  height: obj.height,
                  top: obj.y + 10,
                  left: obj.x + 10,
                  backgroundColor: obj.color,
                  id,
                  selectId: obj.id,
                  textAlign: obj.textAlign || 'left',
                  splitByGrapheme: true,
                  rx: obj.rx || 2 * obj.scale,
                  ry: obj.rx || 2 * obj.scale,
                  backgroundStroke: obj.stroke,
                  backgroundStrokeWidth: obj.strokeWidth,
                  annotateType: 4,
                  originFontSize: obj.fontSize,
                  fontSize: obj.fontSize * obj.scale,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  required: obj.required,
                  readonly: obj.readonly,
                  maxlength: obj.maxlength,
                  label: obj.label,
                  prefill: obj.prefill,
                  textColor: obj.textColor,
                  fill: obj.textColor || 'rgba(0,0,0,1)',
                  singleLine: obj.singleLine || false,
                  textDirection: obj.textDirection || false,
                  lockScalingY: (!obj.textDirection && obj.singleLine) || false,
                  lockScalingX: obj.textDirection || false,
                  scale: obj.scale,
                })
                text.setControlsVisibility({
                  mb: false,
                  ml: false,
                  mr: false,
                  mt: false,
                  mtr: false,
                  tl: false,
                  tr: false,
                  bl: false,
                  br: false,
                })
                canvas.add(text)
                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 4,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  text: obj.text,
                  scale: obj.scale,
                  required: obj.required,
                  readonly: obj.readonly,
                  fontSize: obj.fontSize,
                  fontFamily: obj.fontFamily,
                  fontStyle: obj.fontStyle,
                  fontWeight: obj.fontWeight,
                  maxlength: obj.maxlength,
                  rx: obj.rx,
                  ry: obj.ry,
                  label: obj.label,
                  prefill: obj.prefill,
                  textAlign: obj.textAlign || 'left',
                  textColor: obj.textColor,
                  singleLine: obj.singleLine,
                  textDirection: obj.textDirection,
                  fill: 'black',
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return text
              }
            case 5:
              groupId = obj.newGroupId
              obj.groupLabel = this.indexOfCopy(obj)

              radio = self.createRadio({
                width: obj.width * proportion,
                height: obj.height * proportion,
                originWidth: obj.originWidth * proportion,
                originHeight: obj.originHeight * proportion,
                color: obj.color,
                rx: obj.rx,
                ry: obj.ry,
                strokeWidth: obj.strokeWidth * proportion,
                stroke: obj.stroke,
                radioBackgroundColor: obj.radioBackgroundColor,
                radioStrokeWidth: obj.radioStrokeWidth,
                radioStroke: obj.radioStroke,
                x: obj.x + 10,
                y: obj.y + 10,
                selected: obj.prefill ? true : obj.selected,
                groupId,
                objectId: id,
                id: obj.id,
                centerWidth: obj.centerWidth,
                centerHeight: obj.centerHeight,
                required: obj.required,
                readonly: obj.readonly,
                label: obj.label,
                groupLabel: obj.groupLabel,
                prefill: obj.prefill,
                originFontSize: obj.originFontSize,
                scale: obj.scale,
              })
              canvas.add(radio)

              anno = {
                x: obj.x + 10,
                y: obj.y + 10,
                width: obj.width * proportion,
                height: obj.height * proportion,
                originWidth: obj.originWidth * proportion,
                originHeight: obj.originHeight * proportion,
                centerWidth: obj.centerWidth,
                centerHeight: obj.centerHeight,
                id: obj.id,
                objectId: id,
                type: 5,
                color: obj.color,
                strokeWidth: obj.strokeWidth * proportion,
                stroke: obj.stroke,
                radioBackgroundColor: obj.radioBackgroundColor,
                radioStrokeWidth: obj.radioStrokeWidth,
                radioStroke: obj.radioStroke,
                rx: obj.rx,
                ry: obj.ry,
                selected: obj.prefill ? true : obj.selected,
                scale: self.scale,
                required: obj.required,
                readonly: obj.readonly,
                groupId,
                label: obj.label,
                groupLabel: obj.groupLabel,
                prefill: obj.prefill,
                originFontSize: obj.originFontSize,
              }
              self.insertAnnotate(anno)

              group = self.radioGroup.find((x) => x.id === groupId)
              if (group) {
                group.items.push(id)
              }
              self.setState(0)
              return radio
            case 6:
              obj.label = this.indexOfCopy(obj)
              dropdown = new fabric.Dropdown({
                width: obj.width,
                height: obj.height,
                top: obj.y + 10,
                left: obj.x + 10,
                fill: obj.color,
                rx: obj.rx,
                ry: obj.ry,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                name: self.i18n.select,
                id,
                selectId: obj.id,
                annotateType: 6,
                fontSize: obj.fontSize,
                fontFamily: obj.fontFamily,
                fontStyle: obj.fontStyle,
                fontWeight: obj.fontWeight,
                required: obj.required,
                readonly: obj.readonly,
                selectOptionId: obj.selectOptionId,
                options: obj.options,
                label: obj.label,
                textColor: obj.textColor,
                scale: obj.scale,
              })
              canvas.add(dropdown)

              anno = {
                x: obj.x + 10,
                y: obj.y + 10,
                width: obj.width,
                height: obj.height,
                id: obj.id,
                objectId: id,
                type: 6,
                color: obj.color,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                rx: obj.rx,
                ry: obj.ry,
                scale: obj.scale,
                required: obj.required,
                readonly: obj.readonly,
                fontSize: obj.fontSize,
                fontFamily: obj.fontFamily,
                fontStyle: obj.fontStyle,
                fontWeight: obj.fontWeight,
                selectOptionId: obj.selectOptionId,
                options: obj.options,
                label: obj.label,
                textColor: obj.textColor,
              }
              self.insertAnnotate(anno)

              self.setState(0)
              return dropdown
            case 7:
              obj.label = this.indexOfCopy(obj)
              rect = new fabric.LabeledRect({
                width: obj.width,
                height: obj.height,
                top: obj.y + 10,
                left: obj.x + 10,
                fill: obj.color,
                rx: obj.rx,
                ry: obj.ry,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                name: self.i18n.attachment,
                icon: 'paperclip',
                id,
                selectId: obj.id,
                annotateType: 7,
                required: obj.required,
                label: obj.label,
                readonly: obj.readonly,
                prefill: obj.prefill,
                scale: obj.scale,
              })
              canvas.add(rect)
              anno = {
                x: obj.x + 10,
                y: obj.y + 10,
                width: obj.width,
                height: obj.height,
                id: obj.id,
                objectId: id,
                type: 7,
                color: obj.color,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                rx: obj.rx,
                ry: obj.ry,
                scale: obj.scale,
                required: obj.required,
                label: obj.label,
                readonly: obj.readonly,
                prefill: obj.prefill,
              }
              self.insertAnnotate(anno)

              self.setState(0)
              return rect
            case 8:
              obj.label = this.indexOfCopy(obj)
              if (this.mode !== 5) {
                rect = new fabric.LabeledRect({
                  width: obj.width,
                  height: obj.height,
                  top: obj.y + 10,
                  left: obj.x + 10,
                  fill: obj.color,
                  rx: obj.rx,
                  ry: obj.ry,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  name: self.i18n.image,
                  icon: 'image',
                  id,
                  selectId: obj.id,
                  annotateType: 8,
                  required: obj.required,
                  label: obj.label,
                  readonly: obj.readonly,
                  scale: obj.scale,
                })
                canvas.add(rect)

                anno = {
                  x: obj.x + 10,
                  y: obj.y + 10,
                  width: obj.width,
                  height: obj.height,
                  id: obj.id,
                  objectId: id,
                  type: 8,
                  color: obj.color,
                  strokeWidth: obj.strokeWidth,
                  stroke: obj.stroke,
                  rx: obj.rx,
                  ry: obj.ry,
                  scale: obj.scale,
                  required: obj.required,
                  label: obj.label,
                  readonly: obj.readonly,
                }
                self.insertAnnotate(anno)

                self.setState(0)
                return rect
              } else {
                fabric.Image.fromURL(obj.data, function (img) {
                  rect = new fabric.Rect({
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    fill: 'transparent',
                    rx: obj.rx,
                    ry: obj.ry,
                    name: self.i18n.image,
                    icon: 'image',
                    id,
                    selectId: obj.id,
                    annotateType: 8,
                    required: obj.required,
                    label: obj.label,
                    scale: obj.scale,
                    originX: 'center',
                    originY: 'center',
                  })
                  const bounds = rect.getBoundingRect()

                  const scaleFactor = Math.min(
                    Math.min(1, bounds.width / img.width),
                    Math.min(1, bounds.height / img.height)
                  )
                  img.scale(scaleFactor)
                  img.set({
                    top:
                      bounds.top +
                      Math.max(bounds.height - img.height * scaleFactor, 0) / 2,
                    left:
                      bounds.left +
                      Math.max(bounds.width - img.width * scaleFactor, 0) / 2,
                  })
                  imageGroup = new fabric.Group([rect, img], {
                    width: obj.width,
                    height: obj.height,
                    top: obj.y + 10,
                    left: obj.x + 10,
                    id,
                    annotateType: 8,
                    required: obj.required,
                    label: obj.label,
                    scale: obj.scale,
                  })

                  canvas.add(imageGroup)
                  canvas._historySaveAction()

                  anno = {
                    x: obj.x + 10,
                    y: obj.y + 10,
                    width: obj.width,
                    height: obj.height,
                    objectId: id,
                    type: 8,
                    rx: obj.rx,
                    ry: obj.ry,
                    scale: self.scale,
                    required: obj.required,
                    label: obj.label,
                    done: true,
                    data: obj.data,
                    imageData: img.toDataURL(),
                    imageWidth: img.width * scaleFactor,
                    imageHeight: img.height * scaleFactor,
                  }
                  self.insertAnnotate(anno)

                  self.setState(0)
                  canvas.setActiveObject(imageGroup)
                })
              }
              break
            case 13:
              obj.label = this.indexOfCopy(obj)
              rect = new fabric.LabeledRect({
                width: obj.width,
                height: obj.height,
                top: obj.y + 10,
                left: obj.x + 10,
                fill: obj.color,
                rx: obj.rx,
                ry: obj.ry,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                name: self.i18n.signatureAndStamp,
                icon: 'signatureAndStamp',
                id,
                selectId: obj.id,
                annotateType: 13,
                required: obj.required,
                label: obj.label,
                scale: obj.scale,
              })
              canvas.add(rect)

              anno = {
                x: obj.x + 10,
                y: obj.y + 10,
                width: obj.width,
                height: obj.height,
                id: obj.id,
                objectId: id,
                type: 13,
                color: obj.color,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                rx: obj.rx,
                ry: obj.ry,
                scale: obj.scale,
                required: obj.required,
                label: obj.label,
              }
              self.insertAnnotate(anno)

              self.setState(0)
              return rect
            case 14:
              obj.label = this.indexOfCopy(obj)
              rect = new fabric.LabeledRect({
                width: obj.width,
                height: obj.height,
                top: obj.y + 10,
                left: obj.x + 10,
                fill: obj.color,
                rx: obj.rx,
                ry: obj.ry,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                name: self.i18n.canvas,
                icon: 'message-draw',
                id,
                selectId: obj.id,
                annotateType: 14,
                required: obj.required,
                label: obj.label,
                readonly: obj.readonly,
                scale: obj.scale,
              })
              canvas.add(rect)

              anno = {
                x: obj.x + 10,
                y: obj.y + 10,
                width: obj.width,
                height: obj.height,
                id: obj.id,
                objectId: id,
                type: 14,
                color: obj.color,
                strokeWidth: obj.strokeWidth,
                stroke: obj.stroke,
                rx: obj.rx,
                ry: obj.ry,
                scale: obj.scale,
                required: obj.required,
                label: obj.label,
                readonly: obj.readonly,
              }
              self.insertAnnotate(anno)

              self.setState(0)
              return rect
          }
          if (this.mode === 4) {
            setTimeout(() => {
              this.eventBus.dispatch('notifyAnnotateChanged', {
                page: self.pageNumber,
                fabricUndo: canvas.historyUndo,
                fabricRedo: canvas.historyRedo,
                fabricNextState: canvas.historyNextState,
                historyProcessing: canvas.historyProcessing,
              })
            }, 0)
          }
          canvas._historySaveAction()
        }
      }
    }
  }

  indexOfCopy(obj) {
    const regex = /\((\d+)\)/
    let copyIndex = 1
    let result = ''
    switch (obj.type) {
      case 2:
      case 5:
        // 簡易複製檔名編號(目前被複製的編號+1)
        if (obj.groupLabel.match(regex)) {
          // 如果找到匹配，match[1] 就是括號內的數字字串
          copyIndex = parseInt(obj.groupLabel.match(regex)[1], 10) + 1
          result = obj.groupLabel.replace(regex, `(${copyIndex})`)
        } else if (obj.groupLabel.length > 0) {
          result = `${obj.groupLabel}(1)`
        }
        break
      default:
        // 簡易複製檔名編號(目前被複製的編號+1)
        if (obj.label.match(regex)) {
          // 如果找到匹配，match[1] 就是括號內的數字字串
          copyIndex = parseInt(obj.label.match(regex)[1], 10) + 1
          result = obj.label.replace(regex, `(${copyIndex})`)
        } else if (obj.label.length > 0) {
          result = `${obj.label}(1)`
        }
        break
    }
    return result
  }

  undo(mode = 'normal') {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          // wait canvas undo finish
          // checkboxGroup/radioGroup container
          if (this.mode === 0 || this.mode === 1 || this.mode === 4) {
            const originObjects = canvas.getObjects()
            if (mode === 'force') {
              canvas.forceUndo()
            } else canvas.undo()
            this.adjustUndoRedo(canvas, originObjects)
          }
        }
      }
    }
  }

  redo() {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          // wait canvas redo finish
          // checkboxGroup/radioGroup container
          if (this.mode === 0 || this.mode === 1 || this.mode === 4) {
            const originObjects = canvas.getObjects()
            canvas.redo()
            this.adjustUndoRedo(canvas, originObjects)
          }
        }
      }
    }
  }

  adjustUndoRedo(canvas, originObjects) {
    setTimeout(() => {
      const objs = canvas.getObjects()

      const annotate = this.annotate.find((x) => x.page === this.pageNumber)
      let diff = this.getObjectDiff(originObjects, objs)
      if (diff) {
        diff = Object.entries(diff)[0][1]
        diff = diff.newValue ?? diff.oldValue
        if (diff.annotateType === 2 || diff.annotateType === 5) {
          // check 是否有其餘group物件
          let sameGroupObject = 0
          Object.entries(objs).forEach(([key, value]) => {
            if (
              value.annotateType === diff.annotateType &&
              value.groupId === diff.groupId
            ) {
              ++sameGroupObject
            }
          })
          // 若沒有同group物件則display: none虛線框
          if (sameGroupObject === 0) {
            const container = document.getElementById(
              `${
                diff.annotateType === 2
                  ? 'checkboxGroupContainer'
                  : diff.annotateType === 5
                  ? 'radioGroupContainer'
                  : 'unknownGroupContainer'
              }${diff.groupId}_${this.pageNumber}`
            )
            if (container) {
              container.style.display = 'none'
            }
          }
        }
      }
      if (objs) {
        objs.forEach((obj) => {
          const shape = annotate.data.find((y) => y.objectId === obj.id)
          if (shape) {
            this.setGroupBorder(shape, obj)
          }
        })
      }
    }, 0)
    if (this.mode === 4) {
      this.eventBus.dispatch('notifyAnnotateChanged', {
        page: this.pageNumber,
        fabricUndo: canvas.historyUndo,
        fabricRedo: canvas.historyRedo,
        fabricNextState: canvas.historyNextState,
        historyProcessing: canvas.historyProcessing,
      })
    }
  }

  initHistoryParams(options) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          canvas.initHistoryParams(options)
        }
      }
    }
  }

  destroy() {
    if (
      this.mode === 0 ||
      this.mode === 1 ||
      this.mode === 4 ||
      this.mode === 5
    ) {
      if (this.canvasWrapper) {
        if (this.canvas) {
          const canvas = this.canvas.fabric
          if (canvas) {
            canvas.clearHistory()
            canvas.offHistory()
            canvas.dispose()
          }
          this.canvas.width = 0
          this.canvas.height = 0
          let ctx = this.canvas.getContext('2d')
          ctx && ctx.clearRect(0, 0, 1, 1)
          delete this.canvas
          this.canvas = ctx = null
        }

        if (this.addElements) {
          for (let i = 0; i < this.addElements.length; i++) {
            let element = this.addElements[i]
            if (element && element.parentNode) {
              element.parentNode.removeChild(element)
              element = null
            }
          }
          this.addElements = []
        }

        if (this.canvasScrolling && this.scrollEvent) {
          this.viewerContainer.removeEventListener('scroll', self.scrollEvent)
        }
        if (this.resizeEvent) {
          window.removeEventListener('resize', self.resizeEvent)
        }
        this.annotate = null
      }
      this.EraserBrush = null
    }

    this.viewerContainer = null
    this.canvasWrapper = null
    this.pageIdx = null
    this.pageNumber = null
    this.pdfCanvas = null
    this.scale = null
    this.annotate = null
    this.eventBus = null
    this.state = null
    this.mode = null
    this.checkAnnotate = null
    this.showOutline = null
    this.colorList = null
    this.fabricParams = null
    this.drawColor = null
    this.drawWidth = null
    this.geometryMode = null

    this.canvas = null
    this.checkboxGroup = []
    this.radioGroup = []
    this.canvasScrolling = false
    this.scrollEvent = null
    this.resizeEvent = null
  }

  setAnnotateSelectId(annotateSelectId, color, strokeColor) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          const objs = canvas.getActiveObjects()
          const annotate = this.annotate.find((x) => x.page === this.pageNumber)
          if (objs) {
            objs.forEach((obj) => {
              const shape = annotate.data.find((y) => y.objectId === obj.id)
              switch (shape.type) {
                case 0:
                case 3:
                case 4:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                  shape.id = annotateSelectId
                  shape.color = color
                  shape.stroke = strokeColor
                  obj.set('selectId', annotateSelectId)
                  obj.set('fill', color)
                  obj.set('stroke', strokeColor)
                  break
                case 1:
                  shape.id = annotateSelectId
                  shape.color = color
                  shape.stroke = strokeColor
                  obj.set('selectId', annotateSelectId)
                  obj.set('backgroundColor', color)
                  obj.set('backgroundStroke', strokeColor)
                  break
                case 2:
                  if (obj.groupId !== null && obj.groupId !== undefined) {
                    const groupId = obj.groupId
                    const children = annotate.data.filter(
                      (y) => y.groupId === groupId && y.type === 2
                    )
                    children.forEach((child) => {
                      child.id = annotateSelectId
                      child.color = color
                      child.stroke = strokeColor
                      const childObj = canvas
                        .getObjects()
                        .find((x) => x.id === child.objectId)
                      if (childObj) {
                        childObj.set('selectId', annotateSelectId)
                        childObj._objects[0].set('fill', color)
                        childObj._objects[0].set('stroke', strokeColor)
                      }
                    })
                  }
                  canvas.renderAll()
                  break
                case 5:
                  if (obj.groupId !== null && obj.groupId !== undefined) {
                    const groupId = obj.groupId
                    const children = annotate.data.filter(
                      (y) => y.groupId === groupId && y.type === 5
                    )
                    children.forEach((child) => {
                      child.id = annotateSelectId
                      child.color = color
                      child.stroke = strokeColor
                      const childObj = canvas
                        .getObjects()
                        .find((x) => x.id === child.objectId)
                      if (childObj) {
                        childObj.set('selectId', annotateSelectId)
                        childObj._objects[0].set('fill', color)
                        childObj._objects[0].set('stroke', strokeColor)
                      }
                    })
                  }
                  canvas.renderAll()
                  break
              }
              canvas._historySaveAction()
            })
            canvas.renderAll()
          }
        }
      }
    }
  }

  setIsAllowTouchScrolling(allowed) {
    if (this.mode === 1) return
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          this.fabricParams.allowTouchScrolling = allowed
          canvas.allowTouchScrolling = allowed
        }
      }
    }
  }

  eraseObjects(isEraserToolOn) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          this.fabricParams.eraserTool = isEraserToolOn
          if (this.fabricParams.eraserTool) {
            if (
              !Object.values(this.geometryMode).every((v) => v === false) &&
              (this.mode === 4 || this.mode === 1)
            ) {
              Object.keys(this.geometryMode).forEach(
                (v) => (this.geometryMode[v] = false)
              )
              if (this.mode === 4) {
                canvas.off('mouse:down')
                canvas.off('mouse:up')
              }
              canvas.off('mouse:move')
              canvas.off('path:created')
            }
            if (this.activeType.text) {
              this.setState(0)
            }
            const eraserBrush = new this.EraserBrush(canvas)
            canvas.freeDrawingBrush = eraserBrush
            canvas.isDrawingMode = true
          } else {
            canvas.isDrawingMode = false
          }
        }
      }
    }
  }

  drawObjects(isDrawToolOn) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          this.fabricParams.drawTool = isDrawToolOn
          if (this.fabricParams.drawTool) {
            if (
              !Object.values(this.geometryMode).every((v) => v === false) &&
              (this.mode === 4 || this.mode === 1)
            ) {
              Object.keys(this.geometryMode).forEach(
                (v) => (this.geometryMode[v] = false)
              )
              if (this.mode === 4) {
                canvas.off('mouse:down')
                canvas.off('mouse:up')
              }
              canvas.off('mouse:move')
              canvas.off('path:created')
            }
            const drawBrush = new fabric.PencilBrush(canvas)
            canvas.freeDrawingBrush = drawBrush
            canvas.isDrawingMode = true
            this.DrawBrush = true
            this.setState(90)
          } else {
            canvas.freeDrawingBrush = null
            canvas.isDrawingMode = false
            this.DrawBrush = false
          }
        }
      }
    }
  }

  pointerObjects(isPointerToolOn) {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          this.fabricParams.pointerTool = isPointerToolOn
          this.changeCursorAppearance()
          if (
            !Object.values(this.geometryMode).every((v) => v === false) &&
            (this.mode === 4 || this.mode === 1)
          ) {
            Object.keys(this.geometryMode).forEach(
              (v) => (this.geometryMode[v] = false)
            )
            if (this.mode === 4) {
              canvas.off('mouse:up')
              canvas.off('mouse:down')
            }
            canvas.off('mouse:move')
            canvas.off('path:created')
          }
          this.setState(0)

          canvas.freeDrawingBrush = null
          canvas.isDrawingMode = false
          this.DrawBrush = false
        }
      }
    }
  }

  checkNotComplete(showOutline) {
    if (this.canvasWrapper && this.mode === 1) {
      this.checkAnnotate = true
      this.showOutline = this.showOutline || showOutline
      const annotateList = this.annotate.find((x) => x.page === this.pageNumber)
      if (annotateList) {
        let obj = null
        let minimum = 0
        let maximum = 0
        let checkboxSelectedLength = 0
        let radioSelectedLength = 0
        let firstNotComplete = null
        annotateList.data
          .sort((a, b) => {
            return a.objectId - b.objectId
          })
          .forEach((shape) => {
            switch (shape.type) {
              case 0:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `signature${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 1:
                if (
                  shape.required === true &&
                  (shape.text === '' || shape.text === null)
                ) {
                  obj = document.getElementById(
                    `text${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                } else if (shape.text !== null && shape.isTextExceeded) {
                  obj = document.getElementById(
                    `text${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                } else if (shape.text !== null && shape.isTextOverflow) {
                  obj = document.getElementById(
                    `text${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                } else if (
                  shape.validation !== null &&
                  shape.isValidationFailed
                ) {
                  obj = document.getElementById(
                    `text${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                } else {
                  obj = document.getElementById(
                    `text${shape.objectId}_${this.pageNumber}`
                  )
                  obj.style.removeProperty('outline')
                }
                break
              case 2:
                minimum = shape.minimum
                maximum = shape.maximum
                checkboxSelectedLength = annotateList.data.filter(
                  (x) =>
                    x.selected === true &&
                    x.groupId === shape.groupId &&
                    x.type === 2
                ).length
                switch (shape.ruleId) {
                  case 0:
                    if (checkboxSelectedLength < minimum) {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      if (showOutline) {
                        obj.style.setProperty(
                          'outline',
                          `${Math.ceil(2 / (shape.width / 25))}px dotted red`
                        )
                      }
                      if (firstNotComplete === null) {
                        firstNotComplete = obj
                      }
                    } else {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      obj.style.removeProperty('outline')
                    }
                    break
                  case 1:
                    if (checkboxSelectedLength > maximum) {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      if (showOutline) {
                        obj.style.setProperty(
                          'outline',
                          `${Math.ceil(2 / (shape.width / 25))}px dotted red`
                        )
                      }
                      if (firstNotComplete === null) {
                        firstNotComplete = obj
                      }
                    } else {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      obj.style.removeProperty('outline')
                    }
                    break
                  case 2:
                    if (
                      checkboxSelectedLength > maximum ||
                      checkboxSelectedLength < minimum
                    ) {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      if (showOutline) {
                        obj.style.setProperty(
                          'outline',
                          `${Math.ceil(2 / (shape.width / 25))}px dotted red`
                        )
                      }
                      if (firstNotComplete === null) {
                        firstNotComplete = obj
                      }
                    } else {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      obj.style.removeProperty('outline')
                    }
                    break
                  case 3:
                    if (
                      checkboxSelectedLength > maximum ||
                      checkboxSelectedLength < minimum
                    ) {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      if (showOutline) {
                        obj.style.setProperty(
                          'outline',
                          `${Math.ceil(2 / (shape.width / 25))}px dotted red`
                        )
                      }
                      if (firstNotComplete === null) {
                        firstNotComplete = obj
                      }
                    } else {
                      obj = document.getElementById(
                        `checkmarkContainer${shape.objectId}_${this.pageNumber}`
                      )
                      obj.style.removeProperty('outline')
                    }
                    break
                }
                break
              case 3:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `stamp${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 4:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done) &&
                  (shape.text === '' || shape.text === null)
                ) {
                  obj = document.getElementById(
                    `dateText${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 5:
                radioSelectedLength = annotateList.data.filter(
                  (x) =>
                    x.selected === true &&
                    x.groupId === shape.groupId &&
                    x.type === 5
                ).length
                if (radioSelectedLength !== 1) {
                  obj = document.getElementById(
                    `radiomarkContainer${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty(
                      'outline',
                      `${Math.ceil(2 / (shape.width / 30))}px dotted red`
                    )
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                } else {
                  obj = document.getElementById(
                    `radiomarkContainer${shape.objectId}_${this.pageNumber}`
                  )
                  obj.style.removeProperty('outline')
                }
                break
              case 6:
                if (
                  shape.required === true &&
                  (shape.selectOptionId === undefined ||
                    shape.selectOptionId === null ||
                    !shape.options ||
                    !shape.options.find((x) => x.id === shape.selectOptionId))
                ) {
                  obj = document.getElementById(
                    `dropdown${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                } else {
                  obj = document.getElementById(
                    `dropdown${shape.objectId}_${this.pageNumber}`
                  )
                  obj.style.removeProperty('outline')
                }
                break
              case 7:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `attachment${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 8:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `imageField${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 9:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `signatureBP${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 10:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `signatureBO${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 11:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `stampBP${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 12:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `stampBO${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
              case 13:
                if (
                  shape.required === true &&
                  (shape.done === undefined || !shape.done)
                ) {
                  obj = document.getElementById(
                    `signatureAndStamp${shape.objectId}_${this.pageNumber}`
                  )
                  if (showOutline) {
                    obj.style.setProperty('outline', '2px dotted red')
                  }
                  if (firstNotComplete === null) {
                    firstNotComplete = obj
                  }
                }
                break
            }
          })

        return firstNotComplete
      }
    }
  }

  setRequiredElementStyle() {
    let requiredElement = null
    // wait DOM rendered
    setTimeout(() => {
      requiredElement = document.querySelectorAll('.required')
      requiredElement.forEach((element) => {
        element.style.setProperty(
          '--required-size',
          `${Math.max(32 * this.scale, 12)}px`
        )
        element.style.setProperty(
          '--required-right',
          `-${Math.max(20 * this.scale, 6)}px`
        )
        element.style.setProperty(
          '--required-top',
          `-${Math.max(15 * this.scale, 6)}px`
        )
        element.style.setProperty(
          '--textoverflow-size',
          `${Math.max(12 * this.scale, 12)}px`
        )
        element.style.setProperty(
          '--textoverflow-bottom',
          `${-Math.max(24 * this.scale, 12)}px`
        )
      })
    }, 0)
  }

  getObjectDiff(first, second) {
    const changes = {}
    for (const [key, value] of Object.entries(second)) {
      // new value
      if (!(key in first)) {
        changes[key] = {
          oldValue: undefined,
          newValue: value,
        }
        continue
      }
      const originalValue = first[key]
      const currentValue = value

      // Handle different types of comparisons
      if (
        // originalValue !== currentValue &&
        // String(originalValue) !== String(currentValue) &&
        JSON.stringify(originalValue) !== JSON.stringify(currentValue)
      ) {
        changes[key] = {
          oldValue: originalValue,
          newValue: currentValue,
        }
      }
    }
    // Check for removed properties
    for (const key of Object.keys(first)) {
      if (!(key in second)) {
        changes[key] = {
          oldValue: first[key],
          newValue: undefined,
        }
      }
    }

    return Object.keys(changes).length === 0 ? null : changes
  }

  setGroupBorder(shape, element, checkMax = false) {
    // checkMax 檢查checkbox 選擇條件是否正常
    if (
      shape.groupId !== null &&
      shape.groupId !== undefined &&
      shape.type === 2
    ) {
      const group = this.checkboxGroup.find((x) => x.id === shape.groupId)
      const children = this.annotate
        .find((x) => x.page === this.pageNumber)
        .data.filter((y) => y.groupId === shape.groupId && y.type === 2)

      if (checkMax && children.length > 0) {
        const max =
          children[0].maximum < children.length
            ? children[0].maximum
            : children.length
        const min = children[0].minimum < max ? children[0].minimum : max
        children.forEach((item) => {
          item.maximum = max
          item.minimum = min
        })
      }
      if (group) {
        const container = group.container
        const div = group.groupDiv
        container.style.display = children.length > 0 ? 'flex' : 'none'
        container.style.top =
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.y
            })
          ) -
          element.checkboxStrokeWidth -
          4 +
          'px'
        container.style.left =
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.x
            })
          ) -
          element.checkboxStrokeWidth -
          4 +
          'px'
        div.style.width =
          Math.max.apply(
            Math,
            children.map(function (child) {
              return child.x
            })
          ) +
          element.width -
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.x
            })
          ) +
          element.strokeWidth * 2 +
          8 +
          'px'
        div.style.height =
          Math.max.apply(
            Math,
            children.map(function (child) {
              return child.y
            })
          ) +
          element.height -
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.y
            })
          ) +
          element.strokeWidth * 2 +
          8 +
          'px'
        group.groupDiv = div
      }
    } else if (
      shape.groupId !== null &&
      shape.groupId !== undefined &&
      shape.type === 5
    ) {
      const group = this.radioGroup.find((x) => x.id === shape.groupId)
      const children = this.annotate
        .find((x) => x.page === this.pageNumber)
        .data.filter((y) => y.groupId === shape.groupId && y.type === 5)
      if (group) {
        const container = group.container
        const div = group.groupDiv
        container.style.display = children.length > 0 ? 'flex' : 'none'
        container.style.top =
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.y
            })
          ) -
          element.radioStrokeWidth -
          4 +
          'px'
        container.style.left =
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.x
            })
          ) -
          element.radioStrokeWidth -
          4 +
          'px'
        div.style.width =
          Math.max.apply(
            Math,
            children.map(function (child) {
              return child.x
            })
          ) +
          element.width -
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.x
            })
          ) +
          2 * element.strokeWidth +
          8 +
          'px'
        div.style.height =
          Math.max.apply(
            Math,
            children.map(function (child) {
              return child.y
            })
          ) +
          element.height -
          Math.min.apply(
            Math,
            children.map(function (child) {
              return child.y
            })
          ) +
          2 * element.strokeWidth +
          8 +
          'px'
        group.groupDiv = div
      }
    }
  }

  insertAnnotate(anno) {
    if (
      this.annotate &&
      this.annotate.length > 0 &&
      this.annotate.find((x) => x.page === this.pageNumber)
    ) {
      this.annotate.find((x) => x.page === this.pageNumber).data.unshift(anno)
    } else {
      this.annotate.push({
        page: this.pageNumber,
        data: [anno],
      })
    }
  }

  save() {
    if (this.canvasWrapper) {
      if (this.canvas) {
        const canvas = this.canvas.fabric
        if (canvas) {
          canvas._historySaveAction()
          canvas.renderAll()
        }
      }
    }
  }
}

class DefaultFabricLayerFactory {
  createFabricLayerBuilder(
    viewerContainer,
    canvasWrapper,
    pageIndex,
    pdfCanvas,
    scale,
    annotate = null,
    commentList = null,
    commentMode = { on: false },
    eventBus,
    state,
    mode,
    checkAnnotate = false,
    showOutline = false,
    colorList,
    i18n,
    role,
    control
  ) {
    return new FabricLayerBuilder({
      viewerContainer,
      canvasWrapper,
      pageIndex,
      pdfCanvas,
      scale,
      annotate,
      commentList,
      commentMode,
      eventBus,
      state,
      mode,
      checkAnnotate,
      showOutline,
      colorList,
      i18n,
      role,
      control,
    })
  }
}

export { FabricLayerBuilder, DefaultFabricLayerFactory }
