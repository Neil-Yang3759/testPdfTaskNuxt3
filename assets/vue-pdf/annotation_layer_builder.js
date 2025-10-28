/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// import { AnnotationLayer } from 'pdfjs-dist/legacy/build/pdf.js'
import { NullL10n } from './l10n_utils.js'
import { SimpleLinkService } from './pdf_link_service.js'

/**
 * @typedef {Object} AnnotationLayerBuilderOptions
 * @property {HTMLDivElement} pageDiv
 * @property {PDFPage} pdfPage
 * @property {EventBus} eventBus - The application event bus.
 * @property {AnnotationStorage} [annotationStorage]
 * @property {string} [imageResourcesPath] - Path for image resources, mainly
 *   for annotation icons. Include trailing slash.
 * @property {boolean} renderInteractiveForms
 * @property {IPDFLinkService} linkService
 * @property {DownloadManager} downloadManager
 * @property {IL10n} l10n - Localization service.
 * @property {boolean} [enableScripting]
 * @property {Promise<boolean>} [hasJSActionsPromise]
 * @property {Object} [mouseState]
 */

class AnnotationLayerBuilder {
  /**
   * @param {AnnotationLayerBuilderOptions} options
   */
  constructor({
    pageDiv,
    pdfPage,
    eventBus,
    linkService,
    downloadManager,
    annotationStorage = null,
    imageResourcesPath = '',
    renderForms = true,
    l10n = NullL10n,
    enableScripting = false,
    hasJSActionsPromise = null,
    fieldObjectsPromise = null,
    mouseState = null,
    annotationCanvasMap = null,
    annotate = null,
    mode,
    keepAnnotationId = null,
    colorList,
  }) {
    this.pageDiv = pageDiv
    this.pdfPage = pdfPage
    this.eventBus = eventBus
    this.linkService = linkService
    this.downloadManager = downloadManager
    this.imageResourcesPath = imageResourcesPath
    this.renderForms = renderForms
    this.l10n = l10n
    this.annotationStorage = annotationStorage
    this.enableScripting = enableScripting
    this._hasJSActionsPromise = hasJSActionsPromise
    this._fieldObjectsPromise = fieldObjectsPromise
    this._mouseState = mouseState
    this._annotationCanvasMap = annotationCanvasMap
    this.annotate = annotate
    this.mode = mode
    this.keepAnnotationId = keepAnnotationId
    this.colorList = colorList
    this.div = null
    this._cancelled = false
  }

  /**
   * @param {PageViewport} viewport
   * @param {string} intent (default value is 'display')
   * @returns {Promise<void>} A promise that is resolved when rendering of the
   *   annotations is complete.
   */
  render(viewport, intent = 'display') {
    return Promise.all([
      this.pdfPage.getAnnotations({ intent }),
      this._hasJSActionsPromise,
    ]).then(([annotations, hasJSActions = false, fieldObjects = null]) => {
      if (this._cancelled) {
        return
      }
      const parameters = {
        viewport: viewport.clone({ dontFlip: true }),
        div: this.div,
        annotations,
        page: this.pdfPage,
        imageResourcesPath: this.imageResourcesPath,
        renderForms: this.renderForms,
        linkService: this.linkService,
        downloadManager: this.downloadManager,
        annotationStorage: this.annotationStorage,
        enableScripting: this.enableScripting,
        hasJSActions,
        fieldObjects,
        mouseState: this._mouseState,
        annotationCanvasMap: this._annotationCanvasMap,
      }

      const page = this.pdfPage.pageNumber
      const _util = require('pdfjs-dist/lib/shared/util.js')
      let element = null
      let wrapper = null
      let header = null
      let popup = null
      let title = null
      let rect = null
      let p = null
      let lines = null
      let showPopup = null
      let hidePopup = null

      switch (this.mode) {
        case 0:
          if (
            this.keepAnnotationId !== null &&
            (!this.annotate.find((x) => x.page === page) ||
              this.annotate.find((x) => x.page === page).data.length === 0)
          ) {
            const hex = this.colorList[this.keepAnnotationId - 1]
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            let checkboxGroupId = 1
            const radioGroup = []
            let options = []
            const findAnnotations = annotations.filter(
              (x) =>
                x.annotationType === 20 && !x.pushButton && x.hidden === false
            )
            findAnnotations.forEach((annotation) => {
              const id =
                this.annotate &&
                this.annotate.find((x) => x.page === page) &&
                this.annotate.find((x) => x.page === page).data.length > 0
                  ? Math.max(
                      ...this.annotate
                        .find((x) => x.page === page)
                        .data.map((y) => y.objectId)
                    ) + 1
                  : 1
              const rect = _util.Util.normalizeRect([
                annotation.rect[0],
                this.pdfPage.view[3] -
                  annotation.rect[1] +
                  this.pdfPage.view[1],
                annotation.rect[2],
                this.pdfPage.view[3] -
                  annotation.rect[3] +
                  this.pdfPage.view[1],
              ])
              annotation.page = page
              annotation.viewRect = rect
              let messure = document.createElement('div')
              messure.style.position = 'absolute'
              messure.style.zIndex = 40
              messure.style.left = `${rect[0]}px`
              messure.style.top = `${rect[1]}px`
              messure.style.width =
                annotation.rect[2] - annotation.rect[0] + 'px'
              messure.style.height =
                annotation.rect[3] - annotation.rect[1] + 'px'
              messure.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
              messure.style.transformOrigin = `${-rect[0]}px ${-rect[1]}px`
              document.body.appendChild(messure)
              const messureRect = messure.getBoundingClientRect()
              document.body.removeChild(messure)
              messure = null
              const CSS_UNITS = 96.0 / 72.0
              const scale = viewport.scale / CSS_UNITS
              const validation = {
                type: null,
                regex: null,
                errorMessage: null,
              }
              switch (annotation.fieldType) {
                case 'Tx':
                  if (annotation.fieldName.includes('sign')) {
                    if (
                      this.annotate &&
                      this.annotate.length > 0 &&
                      this.annotate.find((x) => x.page === page)
                    ) {
                      this.annotate
                        .find((x) => x.page === page)
                        .data.unshift({
                          x: messureRect.left,
                          y: messureRect.top,
                          width: messureRect.right - messureRect.left,
                          height: messureRect.bottom - messureRect.top,
                          id: this.keepAnnotationId,
                          objectId: id,
                          type: 0,
                          color: `rgba(${r},${g},${b}, 0.6)`,
                          strokeWidth: 2 * scale,
                          stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                            g > 10 ? g - 10 : g
                          }, ${b > 10 ? b - 10 : b})`,
                          rx: 2 * scale,
                          ry: 2 * scale,
                          scale,
                          required: false,
                          label: '',
                        })
                    } else {
                      this.annotate.push({
                        page,
                        data: [
                          {
                            x: messureRect.left,
                            y: messureRect.top,
                            width: messureRect.right - messureRect.left,
                            height: messureRect.bottom - messureRect.top,
                            id: this.keepAnnotationId,
                            objectId: id,
                            type: 0,
                            color: `rgba(${r},${g},${b}, 0.6)`,
                            strokeWidth: 2 * scale,
                            stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                              g > 10 ? g - 10 : g
                            }, ${b > 10 ? b - 10 : b})`,
                            rx: 2 * scale,
                            ry: 2 * scale,
                            scale,
                            required: false,
                            label: '',
                          },
                        ],
                      })
                    }
                  } else if (
                    this.annotate &&
                    this.annotate.length > 0 &&
                    this.annotate.find((x) => x.page === page)
                  ) {
                    this.annotate
                      .find((x) => x.page === page)
                      .data.unshift({
                        x: messureRect.left,
                        y: messureRect.top,
                        width: messureRect.right - messureRect.left,
                        height: messureRect.bottom - messureRect.top,
                        id: this.keepAnnotationId,
                        objectId: id,
                        type: 1,
                        color: `rgba(${r},${g},${b}, 0.6)`,
                        strokeWidth: 2 * scale,
                        stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                          g > 10 ? g - 10 : g
                        }, ${b > 10 ? b - 10 : b})`,
                        text: '',
                        scale,
                        required: false,
                        readonly: false,
                        fontSize:
                          messureRect.right - messureRect.left >= 16 * scale &&
                          messureRect.bottom - messureRect.top >= 16 * scale
                            ? 16
                            : Math.min(
                                Math.floor(
                                  (messureRect.right - messureRect.left) / scale
                                ),
                                Math.floor(
                                  (messureRect.bottom - messureRect.top) / scale
                                )
                              ),
                        fontFamily: 'Microsoft JhengHei',
                        fontStyle: '',
                        fontWeight: '',
                        maxlength: 4000,
                        validation,
                        rx: 2 * scale,
                        ry: 2 * scale,
                        label: '',
                        textAlign: 'left',
                        textColor: 'rgba(0,0,0,1)',
                      })
                  } else {
                    this.annotate.push({
                      page,
                      data: [
                        {
                          x: messureRect.left,
                          y: messureRect.top,
                          width: messureRect.right - messureRect.left,
                          height: messureRect.bottom - messureRect.top,
                          id: this.keepAnnotationId,
                          objectId: id,
                          type: 1,
                          color: `rgba(${r},${g},${b}, 0.6)`,
                          strokeWidth: 2 * scale,
                          stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                            g > 10 ? g - 10 : g
                          }, ${b > 10 ? b - 10 : b})`,
                          text: '',
                          scale,
                          required: false,
                          readonly: false,
                          fontSize:
                            messureRect.right - messureRect.left >=
                              16 * scale &&
                            messureRect.bottom - messureRect.top >= 16 * scale
                              ? 16
                              : Math.min(
                                  Math.floor(
                                    (messureRect.right - messureRect.left) /
                                      scale
                                  ),
                                  Math.floor(
                                    (messureRect.bottom - messureRect.top) /
                                      scale
                                  )
                                ),
                          fontFamily: 'Microsoft JhengHei',
                          fontStyle: '',
                          fontWeight: '',
                          maxlength: 4000,
                          validation,
                          rx: 2 * scale,
                          ry: 2 * scale,
                          label: '',
                          textAlign: 'left',
                          textColor: 'rgba(0,0,0,1)',
                        },
                      ],
                    })
                  }
                  break
                case 'Btn':
                  if (annotation.checkBox === true) {
                    if (
                      this.annotate &&
                      this.annotate.length > 0 &&
                      this.annotate.find((x) => x.page === page)
                    ) {
                      this.annotate
                        .find((x) => x.page === page)
                        .data.unshift({
                          x: messureRect.left - 6 * scale,
                          y: messureRect.top - 6 * scale,
                          width: 26 * scale,
                          height: 26 * scale,
                          originWidth: 30 * scale,
                          originHeight: 30 * scale,
                          centerWidth: 18 * scale,
                          centerHeight: 18 * scale,
                          id: this.keepAnnotationId,
                          objectId: id,
                          type: 2,
                          color: `rgba(${r},${g},${b}, 0.6)`,
                          checkboxColor: 'rgba(255, 255, 255)',
                          strokeWidth: 2 * scale,
                          stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                            g > 10 ? g - 10 : g
                          }, ${b > 10 ? b - 10 : b})`,
                          checkboxStrokeWidth: 1,
                          checkboxStroke: 'rgb(146, 147, 147)',
                          rx: 2 * scale,
                          ry: 2 * scale,
                          selected: false,
                          scale,
                          required: false,
                          readonly: false,
                          groupId: checkboxGroupId,
                          ruleId: 0,
                          maximum: 1,
                          minimum: 0,
                          label: annotation.fieldName,
                          groupLabel: '',
                        })
                      checkboxGroupId++
                    } else {
                      this.annotate.push({
                        page,
                        data: [
                          {
                            x: messureRect.left - 6 * scale,
                            y: messureRect.top - 6 * scale,
                            width: 26 * scale,
                            height: 26 * scale,
                            originWidth: 30 * scale,
                            originHeight: 30 * scale,
                            centerWidth: 18 * scale,
                            centerHeight: 18 * scale,
                            id: this.keepAnnotationId,
                            objectId: id,
                            type: 2,
                            color: `rgba(${r},${g},${b}, 0.6)`,
                            checkboxColor: 'rgba(255, 255, 255)',
                            strokeWidth: 2 * scale,
                            stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                              g > 10 ? g - 10 : g
                            }, ${b > 10 ? b - 10 : b})`,
                            checkboxStrokeWidth: 1,
                            checkboxStroke: 'rgb(146, 147, 147)',
                            rx: 2 * scale,
                            ry: 2 * scale,
                            selected: false,
                            scale,
                            required: false,
                            readonly: false,
                            groupId: checkboxGroupId,
                            ruleId: 0,
                            maximum: 1,
                            minimum: 0,
                            label: annotation.fieldName,
                            groupLabel: '',
                          },
                        ],
                      })
                      checkboxGroupId++
                    }
                  } else if (annotation.radioButton === true) {
                    if (
                      this.annotate &&
                      this.annotate.length > 0 &&
                      this.annotate.find((x) => x.page === page)
                    ) {
                      if (!radioGroup.find((x) => x === annotation.fieldName)) {
                        radioGroup.push(annotation.fieldName)
                      }
                      this.annotate
                        .find((x) => x.page === page)
                        .data.unshift({
                          x: messureRect.left - 12.25 * scale,
                          y: messureRect.top - 12.25 * scale,
                          width: 31 * scale,
                          height: 31 * scale,
                          originWidth: 35 * scale,
                          originHeight: 35 * scale,
                          centerWidth: 22.75 * scale,
                          centerHeight: 22.75 * scale,
                          id: this.keepAnnotationId,
                          objectId: id,
                          type: 5,
                          color: `rgba(${r},${g},${b}, 0.6)`,
                          strokeWidth: 2 * scale,
                          stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                            g > 10 ? g - 10 : g
                          }, ${b > 10 ? b - 10 : b})`,
                          radioBackgroundColor: 'rgba(255, 255, 255)',
                          radioStrokeWidth: 1,
                          radioStroke: 'rgb(146, 147, 147)',
                          rx: 2 * scale,
                          ry: 2 * scale,
                          selected: false,
                          scale,
                          required: false,
                          readonly: false,
                          groupId: radioGroup.length,
                          label: annotation.buttonName,
                          groupLabel: '',
                        })
                    } else {
                      if (!radioGroup.find((x) => x === annotation.fieldName)) {
                        radioGroup.push(annotation.fieldName)
                      }
                      this.annotate.push({
                        page,
                        data: [
                          {
                            x: messureRect.left - 12.25 * scale,
                            y: messureRect.top - 12.25 * scale,
                            width: 31 * scale,
                            height: 31 * scale,
                            originWidth: 35 * scale,
                            originHeight: 35 * scale,
                            centerWidth: 22.75 * scale,
                            centerHeight: 22.75 * scale,
                            id: this.keepAnnotationId,
                            objectId: id,
                            type: 5,
                            color: `rgba(${r},${g},${b}, 0.6)`,
                            strokeWidth: 2 * scale,
                            stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                              g > 10 ? g - 10 : g
                            }, ${b > 10 ? b - 10 : b})`,
                            radioBackgroundColor: 'rgba(255, 255, 255)',
                            radioStrokeWidth: 1,
                            radioStroke: 'rgb(146, 147, 147)',
                            rx: 2 * scale,
                            ry: 2 * scale,
                            selected: false,
                            scale,
                            required: false,
                            readonly: false,
                            groupId: radioGroup.length,
                            label: annotation.buttonName,
                            groupLabel: '',
                          },
                        ],
                      })
                    }
                  }
                  break
                case 'Sig':
                  if (
                    this.annotate &&
                    this.annotate.length > 0 &&
                    this.annotate.find((x) => x.page === page)
                  ) {
                    this.annotate
                      .find((x) => x.page === page)
                      .data.unshift({
                        x: messureRect.left,
                        y: messureRect.top,
                        width: messureRect.right - messureRect.left,
                        height: messureRect.bottom - messureRect.top,
                        id: this.keepAnnotationId,
                        objectId: id,
                        type: 0,
                        color: `rgba(${r},${g},${b}, 0.6)`,
                        strokeWidth: 2 * scale,
                        stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                          g > 10 ? g - 10 : g
                        }, ${b > 10 ? b - 10 : b})`,
                        rx: 2 * scale,
                        ry: 2 * scale,
                        scale,
                        required: false,
                        label: '',
                      })
                  } else {
                    this.annotate.push({
                      page,
                      data: [
                        {
                          x: messureRect.left,
                          y: messureRect.top,
                          width: messureRect.right - messureRect.left,
                          height: messureRect.bottom - messureRect.top,
                          id: this.keepAnnotationId,
                          objectId: id,
                          type: 0,
                          color: `rgba(${r},${g},${b}, 0.6)`,
                          strokeWidth: 2 * scale,
                          stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                            g > 10 ? g - 10 : g
                          }, ${b > 10 ? b - 10 : b})`,
                          rx: 2 * scale,
                          ry: 2 * scale,
                          scale,
                          required: false,
                          label: '',
                        },
                      ],
                    })
                  }
                  break
                case 'Ch':
                  options = annotation.options.map((option, index) => {
                    return {
                      id: index,
                      name: option.displayValue,
                    }
                  })
                  if (
                    this.annotate &&
                    this.annotate.length > 0 &&
                    this.annotate.find((x) => x.page === page)
                  ) {
                    this.annotate
                      .find((x) => x.page === page)
                      .data.unshift({
                        x: messureRect.left,
                        y: messureRect.top,
                        width: messureRect.right - messureRect.left,
                        height: messureRect.bottom - messureRect.top,
                        id: this.keepAnnotationId,
                        objectId: id,
                        type: 6,
                        color: `rgba(${r},${g},${b}, 0.6)`,
                        strokeWidth: 2 * scale,
                        stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                          g > 10 ? g - 10 : g
                        }, ${b > 10 ? b - 10 : b})`,
                        rx: 2 * scale,
                        ry: 2 * scale,
                        scale,
                        required: false,
                        readonly: false,
                        fontSize:
                          messureRect.right - messureRect.left >= 16 &&
                          messureRect.bottom - messureRect.top >= 16
                            ? 16
                            : Math.min(
                                Math.floor(
                                  messureRect.right - messureRect.left
                                ),
                                Math.floor(messureRect.bottom - messureRect.top)
                              ),
                        fontFamily: 'Microsoft JhengHei',
                        fontStyle: '',
                        fontWeight: '',
                        selectOptionId:
                          !annotation.defaultFieldValue ||
                          annotation.defaultFieldValue === ''
                            ? null
                            : options.findIndex(
                                (x) => x.name === annotation.defaultFieldValue
                              ),
                        options,
                        label: '',
                        textColor: 'rgba(0,0,0,1)',
                      })
                  } else {
                    this.annotate.push({
                      page,
                      data: [
                        {
                          x: messureRect.left,
                          y: messureRect.top,
                          width: messureRect.right - messureRect.left,
                          height: messureRect.bottom - messureRect.top,
                          id: this.keepAnnotationId,
                          objectId: id,
                          type: 6,
                          color: `rgba(${r},${g},${b}, 0.6)`,
                          strokeWidth: 2 * scale,
                          stroke: `rgb(${r > 10 ? r - 10 : r}, ${
                            g > 10 ? g - 10 : g
                          }, ${b > 10 ? b - 10 : b})`,
                          rx: 2 * scale,
                          ry: 2 * scale,
                          scale,
                          required: false,
                          readonly: false,
                          fontSize:
                            messureRect.right - messureRect.left >= 16 &&
                            messureRect.bottom - messureRect.top >= 16
                              ? 16
                              : Math.min(
                                  Math.floor(
                                    messureRect.right - messureRect.left
                                  ),
                                  Math.floor(
                                    messureRect.bottom - messureRect.top
                                  )
                                ),
                          fontFamily: 'Microsoft JhengHei',
                          fontStyle: '',
                          fontWeight: '',
                          selectOptionId:
                            !annotation.defaultFieldValue ||
                            annotation.defaultFieldValue === ''
                              ? null
                              : options.findIndex(
                                  (x) => x.name === annotation.defaultFieldValue
                                ),
                          options,
                          label: '',
                          textColor: 'rgba(0,0,0,1)',
                        },
                      ],
                    })
                  }
                  break
              }
            })
          }
          break
        case 1:
        case 2:
        case 3:
        case 4:
          if (this.div) {
            this.div.hidden = false
            annotations.forEach((annotate) => {
              switch (annotate.annotationType) {
                case 1:
                  element = document.getElementById(annotate.id)
                  rect = _util.Util.normalizeRect([
                    annotate.rect[0],
                    this.pdfPage.view[3] -
                      annotate.rect[1] +
                      this.pdfPage.view[1],
                    annotate.rect[2],
                    this.pdfPage.view[3] -
                      annotate.rect[3] +
                      this.pdfPage.view[1],
                  ])

                  annotate.page = page
                  annotate.viewRect = rect
                  element.style.left = `${rect[0]}px`
                  element.style.top = `${rect[1]}px`
                  element.style.fontSize = rect[2] - rect[0] - 8 + 'px'
                  element.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
                  element.style.transformOrigin = `${-rect[0]}px ${-(
                    rect[1] +
                    (rect[3] - rect[1]) / 2
                  )}px`

                  wrapper = document.getElementById(`wrapper_${annotate.id}`)
                  wrapper.style.left = `${rect[2] * viewport.scale}px`
                  wrapper.style.top = `${rect[3] * viewport.scale}px`
                  break
                case 2:
                  if (
                    annotate.url &&
                    (annotate.url.includes('https://testapp.breezysign.com') ||
                      annotate.url.includes('https://app.breezysign.com'))
                  ) {
                    element = document.getElementById(annotate.id)
                    rect = _util.Util.normalizeRect([
                      annotate.rect[0],
                      this.pdfPage.view[3] -
                        annotate.rect[1] +
                        this.pdfPage.view[1],
                      annotate.rect[2],
                      this.pdfPage.view[3] -
                        annotate.rect[3] +
                        this.pdfPage.view[1],
                    ])

                    annotate.page = page
                    annotate.viewRect = rect
                    element.style.left = `${rect[0]}px`
                    element.style.top = `${rect[1]}px`
                    element.style.width =
                      annotate.rect[2] - annotate.rect[0] + 'px'
                    element.style.height =
                      annotate.rect[3] - annotate.rect[1] + 'px'
                    element.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
                    element.style.transformOrigin = `${-rect[0]}px ${-rect[1]}px`
                  }
                  break
                case 17:
                  element = document.getElementById(annotate.id)
                  rect = _util.Util.normalizeRect([
                    annotate.rect[0],
                    this.pdfPage.view[3] -
                      annotate.rect[1] +
                      this.pdfPage.view[1],
                    annotate.rect[2],
                    this.pdfPage.view[3] -
                      annotate.rect[3] +
                      this.pdfPage.view[1],
                  ])
                  annotate.page = page
                  annotate.viewRect = rect
                  element.style.left = `${rect[0]}px`
                  element.style.top = `${rect[1]}px`
                  element.style.width =
                    annotate.rect[2] - annotate.rect[0] + 8 + 'px'
                  element.style.height =
                    annotate.rect[3] - annotate.rect[1] + 8 + 'px'
                  element.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
                  element.style.transformOrigin = `${-rect[0]}px ${-rect[1]}px`
                  wrapper = document.getElementById(`wrapper_${annotate.id}`)
                  wrapper.style.left = `${rect[2] * viewport.scale + 12}px`
                  wrapper.style.top = `${rect[3] * viewport.scale + 12}px`
                  break
              }
            })
          } else {
            this.div = document.createElement('div')
            this.div.className = 'annotationLayer'
            this.div.style.zIndex = 40
            this.pageDiv.appendChild(this.div)
            parameters.div = this.div
            annotations.forEach((annotate) => {
              switch (annotate.annotationType) {
                case 1:
                  element = document.createElement('i')
                  element.id = annotate.id
                  element.className =
                    'v-icon notranslate mdi mdi-comment-text theme--light'
                  element.style.fontSize = '18px'
                  element.style.color = 'black'
                  element.style.position = 'absolute'

                  if (annotate.color) {
                    element.style.color = `rgba(${annotate.color[0]},${
                      annotate.color[1]
                    },${annotate.color[2]}, ${
                      annotate.name === 'NoIcon' ? 0 : 0.9
                    })`
                  } else {
                    element.style.color = `rgba(0,0,0,${
                      annotate.name === 'NoIcon' ? 0 : 0.9
                    })`
                  }

                  rect = _util.Util.normalizeRect([
                    annotate.rect[0],
                    this.pdfPage.view[3] -
                      annotate.rect[1] +
                      this.pdfPage.view[1],
                    annotate.rect[2],
                    this.pdfPage.view[3] -
                      annotate.rect[3] +
                      this.pdfPage.view[1],
                  ])

                  annotate.page = page
                  annotate.viewRect = rect
                  element.style.left = `${rect[0]}px`
                  element.style.top = `${rect[1]}px`
                  element.style.fontSize = rect[2] - rect[0] - 8 + 'px'
                  element.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
                  element.style.transformOrigin = `${-rect[0]}px ${-(
                    rect[1] +
                    (rect[3] - rect[1]) / 2
                  )}px`

                  element.style.zIndex = 40
                  element.style.display = 'flex'
                  element.style.alignItems = 'center'
                  element.style.justifyContent = 'center'
                  element.style.pointerEvents = 'auto'
                  element.style.cursor = 'pointer'
                  this.div.appendChild(element)
                  wrapper = document.createElement('div')
                  wrapper.id = `wrapper_${annotate.id}`
                  wrapper.className = 'popupWrapper'
                  wrapper.hidden = true
                  popup = document.createElement('div')
                  popup.className = 'popup'
                  popup.style.position = 'relative'
                  if (annotate.color) {
                    popup.style.backgroundColor = `rgba(${
                      (0.7 * (255 - annotate.color[0]) + annotate.color[0]) | 0
                    },${
                      (0.7 * (255 - annotate.color[1]) + annotate.color[1]) | 0
                    },${
                      (0.7 * (255 - annotate.color[2]) + annotate.color[2]) | 0
                    }, 0.9)`
                  }
                  header = document.createElement('span')
                  header.className = 'header'
                  title = document.createElement('h1')
                  title.dir = annotate.titleObj.dir
                  title.textContent = annotate.titleObj.str
                  header.append(title)
                  if (annotate.modificationDate) {
                    const dateTimeStr = annotate.modificationDate.slice(2, 16)
                    const year = dateTimeStr.slice(0, 4)
                    const month = dateTimeStr.slice(4, 6)
                    const day = dateTimeStr.slice(6, 8)
                    const hours = dateTimeStr.slice(8, 10)
                    const minutes = dateTimeStr.slice(10, 12)
                    const seconds = dateTimeStr.slice(12, 14)

                    // add browser timezone
                    const originDateForm = new Date(
                      year,
                      month - 1,
                      day,
                      hours,
                      minutes,
                      seconds
                    )
                    const offsetTime = new Date(
                      originDateForm.getTime() -
                        originDateForm.getTimezoneOffset() * 60 * 1000
                    )
                    const modificationDate = document.createElement('span')
                    modificationDate.className = 'popupDate'
                    annotate.modificationDateString =
                      modificationDate.textContent = `${offsetTime.getFullYear()}/${
                        offsetTime.getMonth() + 1
                      }/${offsetTime.getDate()} ${offsetTime.getHours()}:${offsetTime.getMinutes()}`
                    header.append(modificationDate)
                  }
                  popup.append(header)
                  p = document.createElement('p')
                  p.className = 'popupContent'
                  p.dir = annotate.contentsObj.dir
                  lines = annotate.contentsObj.str.split(/(?:\r\n?|\n)/)
                  for (let i = 0, ii = lines.length; i < ii; ++i) {
                    const line = lines[i]
                    p.append(document.createTextNode(line))
                    if (i < ii - 1) {
                      p.append(document.createElement('br'))
                    }
                  }
                  popup.append(p)
                  wrapper.pinned = false
                  element.addEventListener('mouseover', (e) => {
                    const id = e.target.id
                    const wrapper = document.getElementById(`wrapper_${id}`)
                    wrapper.style.minWidth = 'max-content'
                    const box = e.target.getBoundingClientRect()
                    const viewBox = document
                      .getElementById('viewerContainer')
                      .getBoundingClientRect()

                    const scale =
                      parseFloat(
                        document
                          .getElementById('customScaleOption')
                          .textContent.split('%')[0]
                      ) / 100

                    let pageBox = null
                    try {
                      pageBox = document
                        .querySelectorAll('.page')
                        [
                          parseInt(
                            document.getElementById('pageNumber').value
                          ) - 1
                        ].getBoundingClientRect()
                    } catch (e) {}

                    if (250 * scale + box.x > viewBox.width) {
                      wrapper.style.left = `${
                        (box.right / viewBox.width) * pageBox.width -
                        220 * (scale > 1 ? scale : 1)
                      }px`
                    }
                    if (150 * scale + box.y > viewBox.bottom) {
                      wrapper.style.top = `${
                        (box.bottom / viewBox.bottom) * pageBox.height -
                        30 * (scale > 1 ? scale : 1)
                      }px`
                    }

                    if (wrapper.hidden) {
                      wrapper.hidden = false
                    }
                  })
                  element.addEventListener('mouseout', (e) => {
                    const id = e.target.id
                    const wrapper = document.getElementById(`wrapper_${id}`)
                    if (!wrapper.hidden && !wrapper.pinned) {
                      wrapper.hidden = true
                    }
                  })

                  wrapper.append(popup)
                  wrapper.style.position = 'absolute'
                  wrapper.style.left = `${rect[2] * viewport.scale}px`
                  wrapper.style.top = `${rect[3] * viewport.scale}px`
                  wrapper.style.zIndex = 40
                  this.div.append(wrapper)
                  break
                case 2:
                  if (
                    annotate.url &&
                    (annotate.url.includes('https://testapp.breezysign.com') ||
                      annotate.url.includes('https://app.breezysign.com'))
                  ) {
                    element = document.createElement('a')
                    element.id = annotate.id
                    element.style.position = 'absolute'
                    rect = _util.Util.normalizeRect([
                      annotate.rect[0],
                      this.pdfPage.view[3] -
                        annotate.rect[1] +
                        this.pdfPage.view[1],
                      annotate.rect[2],
                      this.pdfPage.view[3] -
                        annotate.rect[3] +
                        this.pdfPage.view[1],
                    ])
                    annotate.page = page
                    annotate.viewRect = rect
                    element.style.left = `${rect[0]}px`
                    element.style.top = `${rect[1]}px`
                    element.style.width =
                      annotate.rect[2] - annotate.rect[0] + 'px'
                    element.style.height =
                      annotate.rect[3] - annotate.rect[1] + 'px'
                    element.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
                    element.style.transformOrigin = `${-rect[0]}px ${-rect[1]}px`
                    element.style.zIndex = 40
                    element.style.display = 'flex'
                    element.style.alignItems = 'center'
                    element.style.justifyContent = 'center'
                    element.style.borderRadius = '2px'
                    element.style.pointerEvents = 'auto'
                    element.addEventListener('mouseenter', function () {
                      this.style.cursor = 'pointer'
                      this.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'
                    })
                    element.addEventListener('mouseleave', function () {
                      this.style.cursor = 'default'
                      this.style.backgroundColor = 'transparent'
                    })
                    element.addEventListener('click', function (e) {
                      e.preventDefault()
                      e.stopPropagation()
                      window.open(annotate.url, '_blank')
                    })
                    this.div.appendChild(element)
                  }
                  break
                case 17:
                  element = document.createElement('button')
                  element.id = annotate.id
                  element.style.position = 'absolute'
                  rect = _util.Util.normalizeRect([
                    annotate.rect[0],
                    this.pdfPage.view[3] -
                      annotate.rect[1] +
                      this.pdfPage.view[1],
                    annotate.rect[2],
                    this.pdfPage.view[3] -
                      annotate.rect[3] +
                      this.pdfPage.view[1],
                  ])
                  annotate.page = page
                  annotate.viewRect = rect
                  element.style.left = `${rect[0]}px`
                  element.style.top = `${rect[1]}px`
                  element.style.width =
                    annotate.rect[2] - annotate.rect[0] + 8 + 'px'
                  element.style.height =
                    annotate.rect[3] - annotate.rect[1] + 8 + 'px'
                  element.style.transform = `matrix(${viewport.scale}, 0, 0, ${viewport.scale}, 0, 0)`
                  element.style.transformOrigin = `${-rect[0]}px ${-rect[1]}px`
                  element.style.zIndex = 40
                  element.style.display = 'flex'
                  element.style.alignItems = 'center'
                  element.style.justifyContent = 'center'
                  element.style.border = '1px solid rgba(0, 0, 0, 0.2)'
                  element.style.borderRadius = '2px'
                  element.style.backgroundColor = '#f1f2f3'
                  element.style.pointerEvents = 'auto'
                  p = document.createElement('p')
                  p.style.fontSize = '20px'
                  p.style.position = 'relative'
                  p.style.display = 'flex'
                  p.style.alignItems = 'center'
                  p.style.justifyContent = 'center'
                  p.style.textAlign = 'center'
                  p.style.margin = '0px'

                  p.innerHTML = `<i id="icon_${annotate.id}" class="v-icon notranslate mdi mdi-paperclip theme--light" aria-hidden="true" style="font-size: 20px;"></i>`
                  element.appendChild(p)

                  element.addEventListener('click', function (e) {
                    if (annotate.file) {
                      const link = document.createElement('a')
                      document.body.appendChild(link)
                      const blob = new Blob([annotate.file.content])
                      const url = window.URL.createObjectURL(blob)
                      link.href = url
                      link.download = annotate.file.filename
                      const clickHandler = () => {
                        setTimeout(() => {
                          window.URL.revokeObjectURL(url)
                          this.removeEventListener('click', clickHandler)
                          document.body.removeChild(link)
                        }, 150)
                      }
                      link.addEventListener('click', clickHandler, false)
                      link.click()
                    }
                  })
                  this.div.appendChild(element)
                  wrapper = document.createElement('div')
                  wrapper.id = `wrapper_${annotate.id}`
                  wrapper.className = 'popupWrapper'
                  wrapper.hidden = true
                  popup = document.createElement('div')
                  popup.className = 'popup'
                  popup.style.position = 'relative'
                  title = document.createElement('span')
                  title.className = 'popupTitle'
                  title.textContent = annotate.file.filename
                  popup.append(title)
                  wrapper.pinned = false
                  showPopup = () => {
                    const wrapper = document.getElementById(
                      `wrapper_${annotate.id}`
                    )
                    wrapper.style.minWidth = 'max-content'
                    const element = document.getElementById(`${annotate.id}`)
                    const box = element.getBoundingClientRect()
                    const viewBox = document
                      .getElementById('viewerContainer')
                      .getBoundingClientRect()

                    const scale =
                      parseFloat(
                        document
                          .getElementById('customScaleOption')
                          .textContent.split('%')[0]
                      ) / 100

                    let pageBox = null
                    try {
                      pageBox = document
                        .querySelectorAll('.page')
                        [
                          parseInt(
                            document.getElementById('pageNumber').value
                          ) - 1
                        ].getBoundingClientRect()
                    } catch (e) {}

                    if (150 * scale + box.x > viewBox.width) {
                      wrapper.style.left = `${
                        (box.right / viewBox.width) * pageBox.width -
                        120 * (scale > 1 ? scale : 1)
                      }px`
                    }
                    if (30 * scale + box.y > viewBox.bottom) {
                      wrapper.style.top = `${
                        (box.bottom / viewBox.bottom) * pageBox.height -
                        10 * (scale > 1 ? scale : 1)
                      }px`
                    }

                    if (wrapper.hidden) {
                      wrapper.hidden = false
                    }
                  }
                  hidePopup = (e) => {
                    const wrapper = document.getElementById(
                      `wrapper_${annotate.id}`
                    )
                    if (!wrapper.hidden && !wrapper.pinned) {
                      wrapper.hidden = true
                    }
                  }
                  element.addEventListener('mouseenter', showPopup)
                  element.addEventListener('mouseleave', hidePopup)

                  wrapper.append(popup)
                  wrapper.style.position = 'absolute'
                  wrapper.style.left = `${rect[2] * viewport.scale + 12}px`
                  wrapper.style.top = `${rect[3] * viewport.scale + 12}px`
                  wrapper.style.zIndex = 40
                  this.div.append(wrapper)
                  break
              }
            })
            this.eventBus.dispatch('getPdfAnnotations', {
              annotations: annotations.filter((x) =>
                [1, 17].includes(x.annotationType)
              ),
            })
          }

          break
      }
    })
  }

  cancel() {
    this._cancelled = true
  }

  hide() {
    if (!this.div) {
      return
    }
    this.div.hidden = true
  }
}

/**
 * @implements IPDFAnnotationLayerFactory
 */
class DefaultAnnotationLayerFactory {
  /**
   * @param {HTMLDivElement} pageDiv
   * @param {PDFPage} pdfPage
   * @param {EventBus} eventBus - The application event bus.
   * @param {AnnotationStorage} [annotationStorage]
   * @param {string} [imageResourcesPath] - Path for image resources, mainly
   *   for annotation icons. Include trailing slash.
   * @param {boolean} renderInteractiveForms
   * @param {IL10n} l10n
   * @param {boolean} [enableScripting]
   * @param {Promise<boolean>} [hasJSActionsPromise]
   * @param {Object} [mouseState]
   * @returns {AnnotationLayerBuilder}
   */
  createAnnotationLayerBuilder(
    pageDiv,
    pdfPage,
    eventBus,
    annotationStorage = null,
    imageResourcesPath = '',
    renderInteractiveForms = true,
    l10n = NullL10n,
    enableScripting = false,
    hasJSActionsPromise = null,
    mouseState = null,
    annotate = null,
    mode,
    keepAnnotationId = null,
    colorList
  ) {
    return new AnnotationLayerBuilder({
      pageDiv,
      pdfPage,
      eventBus,
      imageResourcesPath,
      renderInteractiveForms,
      linkService: new SimpleLinkService(),
      l10n,
      annotationStorage,
      enableScripting,
      hasJSActionsPromise,
      mouseState,
      annotate,
      mode,
      keepAnnotationId,
      colorList,
    })
  }
}

export { AnnotationLayerBuilder, DefaultAnnotationLayerFactory }
