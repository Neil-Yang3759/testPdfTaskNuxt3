/* Copyright 2016 Mozilla Foundation
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

import {
  animationStarted,
  DEFAULT_SCALE,
  DEFAULT_SCALE_VALUE,
  MAX_SCALE,
  MIN_SCALE,
  noContextMenuHandler,
} from './ui_utils.js'

const PAGE_NUMBER_LOADING_INDICATOR = 'visiblePageIsLoading'
// Keep the two values below up-to-date with the values in `web/viewer.css`:
const SCALE_SELECT_CONTAINER_WIDTH = 140 // px
const SCALE_SELECT_WIDTH = 162 // px

/**
 * @typedef {Object} ToolbarOptions
 * @property {HTMLDivElement} container - Container for the secondary toolbar.
 * @property {HTMLSpanElement} numPages - Label that contains number of pages.
 * @property {HTMLInputElement} pageNumber - Control for display and user input
 *   of the current page number.
 * @property {HTMLSpanElement} scaleSelectContainer - Container where scale
 *   controls are placed. The width is adjusted on UI initialization.
 * @property {HTMLSelectElement} scaleSelect - Scale selection control.
 * @property {HTMLOptionElement} customScaleOption - The item used to display
 *   a non-predefined scale.
 * @property {HTMLButtonElement} previous - Button to go to the previous page.
 * @property {HTMLButtonElement} next - Button to go to the next page.
 * @property {HTMLButtonElement} zoomIn - Button to zoom in the pages.
 * @property {HTMLButtonElement} zoomOut - Button to zoom out the pages.
 * @property {HTMLButtonElement} viewFind - Button to open find bar.
 * @property {HTMLButtonElement} openFile - Button to open a new document.
 * @property {HTMLButtonElement} presentationModeButton - Button to switch to
 *   presentation mode.
 * @property {HTMLButtonElement} download - Button to download the document.
 * @property {HTMLAElement} viewBookmark - Element to link current url of
 *   the page view.
 */

class Toolbar {
  /**
   * @param {ToolbarOptions} options
   * @param {EventBus} eventBus
   */
  constructor(
    options,
    eventBus,
    selection,
    clipboard,
    historyUndo,
    historyRedo,
    mode
  ) {
    this.toolbar = options.container
    this.eventBus = eventBus
    this.buttons = [
      { element: options.previous, eventName: 'previouspage' },
      { element: options.next, eventName: 'nextpage' },
      { element: options.zoomIn, eventName: 'zoomin' },
      { element: options.zoomOut, eventName: 'zoomout' },
      { element: options.undo, eventName: 'undo' },
      { element: options.redo, eventName: 'redo' },
      { element: options.copy, eventName: 'copy' },
      { element: options.paste, eventName: 'paste' },
      { element: options.eraser, eventName: 'eraser' },
      { element: options.eraserDraw, eventName: 'eraser', mode: [1, 4] },
      { element: options.draw, eventName: 'draw', mode: [1, 4] },
      { element: options.pointer, eventName: 'pointer', mode: [1, 4] },
    ]
    this.items = {
      numPages: options.numPages,
      pageNumber: options.pageNumber,
      scaleSelectContainer: options.scaleSelectContainer,
      scaleSelect: options.scaleSelect,
      customScaleOption: options.customScaleOption,
      previous: options.previous,
      next: options.next,
      zoomIn: options.zoomIn,
      zoomOut: options.zoomOut,
      undo: options.undo,
      redo: options.redo,
      copy: options.copy,
      paste: options.paste,
      eraser: options.eraser,
      draw: options.draw,
      pointer: options.pointer,
    }

    this.selection = selection
    this.clipboard = clipboard
    this.historyUndo = historyUndo
    this.historyRedo = historyRedo
    this.mode = mode

    this._wasLocalized = false
    this.reset()

    // Bind the event listeners for click and various other actions.
    this._bindListeners()
  }

  setPageNumber(pageNumber, pageLabel) {
    this.pageNumber = pageNumber
    this.pageLabel = pageLabel
    this._updateUIState(false)
  }

  setPagesCount(pagesCount, hasPageLabels) {
    this.pagesCount = pagesCount
    this.hasPageLabels = hasPageLabels
    this._updateUIState(true)
  }

  setPageScale(pageScaleValue, pageScale) {
    this.pageScaleValue = (pageScaleValue || pageScale).toString()
    this.pageScale = pageScale
    this._updateUIState(false)
  }

  setSelection(selection) {
    this.selection = selection
    this._updateUIState(false)
  }

  setClipboard(clipboard) {
    this.clipboard = clipboard
    this._updateUIState(false)
  }

  setHistoryUndo(historyUndo) {
    this.historyUndo = historyUndo
    this._updateUIState(false)
  }

  setHistoryRedo(historyRedo) {
    this.historyRedo = historyRedo
    this._updateUIState(false)
  }

  reset() {
    this.pageNumber = 0
    this.pageLabel = null
    this.hasPageLabels = false
    this.pagesCount = 0
    this.pageScaleValue = DEFAULT_SCALE_VALUE
    this.pageScale = DEFAULT_SCALE
    this._updateUIState(true)
    this.updateLoadingIndicatorState()
  }

  _bindListeners() {
    const { pageNumber, scaleSelect } = this.items
    const self = this

    // The buttons within the toolbar.
    for (const { element, eventName, mode } of this.buttons) {
      if (mode === undefined || mode.includes(this.mode)) {
        if (element) {
          element.addEventListener('click', (evt) => {
            if (eventName !== null) {
              this.eventBus.dispatch(eventName, { source: this })
            }
          })
        }
      }
    }
    // The non-button elements within the toolbar.
    pageNumber.addEventListener('click', function () {
      this.select()
    })
    pageNumber.addEventListener('change', function () {
      self.eventBus.dispatch('pagenumberchanged', {
        source: self,
        value: this.value,
      })
    })

    scaleSelect.addEventListener('change', function () {
      if (this.value === 'custom') {
        return
      }
      self.eventBus.dispatch('scalechanged', {
        source: self,
        value: this.value,
      })
    })
    scaleSelect.addEventListener('click', function (evt) {
      const target = evt.target
      // Remove focus when an <option>-element was *clicked*, to improve the UX
      // for mouse users (fixes bug 1300525 and issue 4923).
      if (
        this.value === self.pageScaleValue &&
        target.tagName.toUpperCase() === 'OPTION'
      ) {
        this.blur()
      }
    })
    // Suppress context menus for some controls.
    scaleSelect.oncontextmenu = noContextMenuHandler

    // this.eventBus._on('localized', () => {
    //   this._wasLocalized = true
    //   this._adjustScaleWidth()
    //   this._updateUIState(true)
    // })
  }

  _updateUIState(resetNumPages = false) {
    // if (!this._wasLocalized) {
    //   // Don't update the UI state until we localize the toolbar.
    //   return
    // }
    const { pageNumber, pagesCount, pageScale, items } = this

    if (resetNumPages) {
      if (this.hasPageLabels) {
        items.pageNumber.type = 'text'
      } else {
        items.pageNumber.type = 'number'
      }
      items.numPages.textContent = `/ ${pagesCount}`
      items.pageNumber.max = pagesCount
    }

    if (this.hasPageLabels) {
      items.pageNumber.value = this.pageLabel
      items.numPages.textContent = `/ ${pagesCount}`
    } else {
      items.pageNumber.value = pageNumber
    }

    if (pageNumber <= 1) {
      items.previous.disabled = true
      items.previous.classList.add('v-btn--disabled')
    } else {
      items.previous.disabled = false
      items.previous.classList.remove('v-btn--disabled')
    }

    if (pageNumber >= pagesCount) {
      items.next.disabled = true
      items.next.classList.add('v-btn--disabled')
    } else {
      items.next.disabled = false
      items.next.classList.remove('v-btn--disabled')
    }

    if (pageScale <= MIN_SCALE) {
      items.zoomOut.disabled = true
      items.zoomOut.classList.add('v-btn--disabled')
    } else {
      items.zoomOut.disabled = false
      items.zoomOut.classList.remove('v-btn--disabled')
    }

    if (pageScale >= MAX_SCALE) {
      items.zoomIn.disabled = true
      items.zoomIn.classList.add('v-btn--disabled')
    } else {
      items.zoomIn.disabled = false
      items.zoomIn.classList.remove('v-btn--disabled')
    }

    if (!this.historyUndo || this.historyUndo.length <= 0) {
      const undo = document.getElementById('undo')
      const undoMobile = document.getElementById('undo-mobile')
      const undoDraw = document.getElementById('undo-draw')
      try {
        undo.disabled = true
        undo.classList.add('v-btn--disabled')
      } catch (e) {
        console.log(e)
      }
      if (undoMobile) {
        undoMobile.disabled = true
        undoMobile.classList.add('v-btn--disabled')
      }
      if (undoDraw) {
        undoDraw.disabled = true
        undoDraw.classList.add('v-btn--disabled')
      }
    } else {
      const undo = document.getElementById('undo')
      const undoMobile = document.getElementById('undo-mobile')
      const undoDraw = document.getElementById('undo-draw')
      try {
        undo.disabled = false
        undo.classList.remove('v-btn--disabled')
      } catch (e) {
        console.log(e)
      }
      if (undoMobile) {
        undoMobile.disabled = false
        undoMobile.classList.remove('v-btn--disabled')
      }
      if (undoDraw) {
        undoDraw.disabled = false
        undoDraw.classList.remove('v-btn--disabled')
      }
    }

    if (!this.historyRedo || this.historyRedo.length <= 0) {
      const redo = document.getElementById('redo')
      const redoMobile = document.getElementById('redo-mobile')
      const redoDraw = document.getElementById('redo-draw')
      try {
        redo.disabled = true
        redo.classList.add('v-btn--disabled')
      } catch (e) {
        console.log(e)
      }
      if (redoMobile) {
        redoMobile.disabled = true
        redoMobile.classList.add('v-btn--disabled')
      }
      if (redoDraw) {
        redoDraw.disabled = true
        redoDraw.classList.add('v-btn--disabled')
      }
    } else {
      const redo = document.getElementById('redo')
      const redoMobile = document.getElementById('redo-mobile')
      const redoDraw = document.getElementById('redo-draw')
      try {
        redo.disabled = false
        redo.classList.remove('v-btn--disabled')
      } catch (e) {
        console.log(e)
      }
      if (redoMobile) {
        redoMobile.disabled = false
        redoMobile.classList.remove('v-btn--disabled')
      }
      if (redoDraw) {
        redoDraw.disabled = false
        redoDraw.classList.remove('v-btn--disabled')
      }
    }

    if (
      !this.selection ||
      this.selection.type === 9 ||
      this.selection.type === 10
    ) {
      items.copy.disabled = true
      items.copy.classList.add('v-btn--disabled')
    } else {
      items.copy.disabled = false
      items.copy.classList.remove('v-btn--disabled')
    }

    if (!this.clipboard) {
      items.paste.disabled = true
      items.paste.classList.add('v-btn--disabled')
    } else {
      items.paste.disabled = false
      items.paste.classList.remove('v-btn--disabled')
    }

    const scale = Math.round(pageScale * 10000) / 100
    let predefinedValueFound = false
    for (const option of items.scaleSelect.options) {
      if (option.value !== pageScale) {
        option.selected = false
        continue
      }
      option.selected = true
      predefinedValueFound = true
    }
    if (!predefinedValueFound) {
      items.customScaleOption.textContent = scale + '%'
      items.customScaleOption.selected = true
    }
  }

  updateLoadingIndicatorState(loading = false) {
    const pageNumberInput = this.items.pageNumber

    pageNumberInput.classList.toggle(PAGE_NUMBER_LOADING_INDICATOR, loading)
  }

  /**
   * Increase the width of the zoom dropdown DOM element if, and only if, it's
   * too narrow to fit the *longest* of the localized strings.
   * @private
   */
  async _adjustScaleWidth() {
    const { items } = this

    const predefinedValuesPromise = Promise.all([
      'Automatic Zoom',
      'Actual Size',
      'Page Fit',
      'Page Width',
    ])

    // The temporary canvas is used to measure text length in the DOM.
    let canvas = document.createElement('canvas')
    // if (
    //   typeof PDFJSDev === 'undefined' ||
    //   PDFJSDev.test('MOZCENTRAL || GENERIC')
    // ) {
    //   canvas.mozOpaque = true
    // }
    let ctx = canvas.getContext('2d', { alpha: false })

    await animationStarted
    const { fontSize, fontFamily } = getComputedStyle(items.scaleSelect)
    ctx.font = `${fontSize} ${fontFamily}`

    let maxWidth = 0
    for (const predefinedValue of await predefinedValuesPromise) {
      const { width } = ctx.measureText(predefinedValue)
      if (width > maxWidth) {
        maxWidth = width
      }
    }
    const overflow = SCALE_SELECT_WIDTH - SCALE_SELECT_CONTAINER_WIDTH
    maxWidth += 2 * overflow

    if (maxWidth > SCALE_SELECT_CONTAINER_WIDTH) {
      items.scaleSelect.style.width = `${maxWidth + overflow}px`
      items.scaleSelectContainer.style.width = `${maxWidth}px`
    }
    // Zeroing the width and height cause Firefox to release graphics resources
    // immediately, which can greatly reduce memory consumption.
    canvas.width = 0
    canvas.height = 0
    canvas = ctx = null
  }

  initialHistory() {
    this.selection = null
    this.clipboard = null
    this.historyUndo = []
    this.historyRedo = []
    this.mode = 0
  }

  bindToolbarEvent(buttons) {
    for (const { element, eventName } of buttons) {
      if (element) {
        element.addEventListener('click', (evt) => {
          if (eventName !== null) {
            this.eventBus.dispatch(eventName, { source: this })
          }
        })
      }
    }
    this._updateUIState(false)
  }
}

export { Toolbar }
