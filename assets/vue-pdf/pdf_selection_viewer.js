/* Copyright 2012 Mozilla Foundation
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

/**
 * @typedef {Object} PDFSelectionViewerOptions
 * @property {HTMLDivElement} container - The viewer element.
 * @property {EventBus} eventBus - The application event bus.
 */

class PDFSelectionViewer {
  /**
   * @param {PDFSelectionViewerOptions} options
   */
  constructor({ container, eventBus, i18n }) {
    this.title = container.title
    this.deleteButton = container.deleteButton
    this.requiredButton = container.requiredButton
    this.readonlyButton = container.readonlyButton
    this.assgineeContainer = container.assgineeContainer
    this.formatContainer = container.formatContainer
    this.dateFormatContainer = container.dateFormatContainer
    this.textContainer = container.textContainer
    this.checkboxSizeContainer = container.checkboxSizeContainer
    this.checkboxContainer = container.checkboxContainer
    this.checkboxRuleContainer = container.checkboxRuleContainer
    this.radioSizeContainer = container.radioSizeContainer
    this.radioContainer = container.radioContainer
    this.dropdownContainer = container.dropdownContainer
    this.labelContainer = container.labelContainer
    this.groupLabelContainer = container.groupLabelContainer
    this.validationContainer = container.validationContainer
    this.dateRangeContainer = container.dateRangeContainer
    this.dateTextContainer = container.dateTextContainer
    this.dateEraContainer = container.dateEraContainer
    this.uploadAttachmentContainer = container.uploadAttachmentContainer
    this.textAlignToggle = container.textAlignToggle
    this.required = null
    this.writable = null
    this.fabricLayer = null
    this.container = container
    this.eventBus = eventBus
    this.i18n = i18n
    this._addEventListeners()
  }

  reset() {}

  render(
    fabricLayer,
    selection,
    checkboxGroup,
    radioGroup,
    position,
    rect,
    mode
  ) {
    this.fabricLayer = fabricLayer
    if (selection && mode !== 5) {
      if (selection.length > 1) {
        this.title.innerHTML = ''
        const text = document.createElement('div')
        text.innerHTML = `${selection.length} ${this.i18n.fieldsSelected}`
        text.className = 'text-subtitle-1'
        this.title.appendChild(text)
        this.assgineeContainer.style.removeProperty('display')
        this.requiredButton.style.setProperty('display', 'none', 'important')
        this.readonlyButton.style.setProperty('display', 'none', 'important')
        this.formatContainer.style.setProperty('display', 'none', 'important')
        this.dateFormatContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.textContainer.style.setProperty('display', 'none', 'important')
        this.checkboxSizeContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.checkboxContainer.style.setProperty('display', 'none', 'important')
        this.checkboxRuleContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.radioSizeContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.radioContainer.style.setProperty('display', 'none', 'important')
        this.dropdownContainer.style.setProperty('display', 'none', 'important')
        this.labelContainer.style.setProperty('display', 'none', 'important')
        this.groupLabelContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.validationContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.dateRangeContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
        this.dateTextContainer.style.setProperty('display', 'none', 'important')
        this.dateEraContainer.style.setProperty('display', 'none', 'important')
        this.uploadAttachmentContainer.style.setProperty(
          'display',
          'none',
          'important'
        )
      } else {
        this.title.innerHTML = ''
        if (selection[0].type !== null) {
          let icon = null
          let text = null
          switch (selection[0].type) {
            case 0:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-signature theme--light mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.signature
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 1:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-format-text theme--light mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.text
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              if (!selection[0].prefill) {
                this.requiredButton.style.removeProperty('display')
                this.readonlyButton.style.removeProperty('display')
                this.assgineeContainer.style.removeProperty('display')
                this.validationContainer.style.removeProperty('display')
                this.labelContainer.style.removeProperty('display')
              } else {
                this.requiredButton.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.readonlyButton.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.assgineeContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.validationContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.labelContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
              }
              this.formatContainer.style.removeProperty('display')
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.removeProperty('display')
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textAlignToggle.style.removeProperty('display')
              break
            case 2:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-checkbox-marked theme--light mr-2'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.checkboxGrp
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              if (!selection[0].prefill) {
                this.readonlyButton.style.removeProperty('display')
                this.assgineeContainer.style.removeProperty('display')
                this.checkboxRuleContainer.style.removeProperty('display')
                this.groupLabelContainer.style.removeProperty('display')
                this.checkboxSizeContainer.style.removeProperty('display')
                this.checkboxContainer.style.removeProperty('display')
              } else {
                this.readonlyButton.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.assgineeContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.checkboxRuleContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.groupLabelContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.checkboxSizeContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.checkboxContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
              }
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.eventBus.dispatch('setSelectionViewCheckboxOption', {
                source: this,
                ruleId: selection[0].ruleId,
                minimum: selection[0].minimum,
                maximum: selection[0].maximum,
                checkboxGroup: checkboxGroup[0],
              })
              break
            case 3:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-stamper theme--light mr-2'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.stamp
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 4:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-calendar-month theme--light mr-2'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.date
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.removeProperty('display')
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.removeProperty('display')
              this.dateFormatContainer.style.removeProperty('display')
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.removeProperty('display')
              this.dateTextContainer.style.removeProperty('display')
              this.dateEraContainer.style.removeProperty('display')
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textAlignToggle.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 5:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-radiobox-marked theme--light mr-2'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.radioBtnGrp
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              if (!selection[0].prefill) {
                this.readonlyButton.style.removeProperty('display')
                this.assgineeContainer.style.removeProperty('display')
                this.groupLabelContainer.style.removeProperty('display')
                this.radioSizeContainer.style.removeProperty('display')
                this.radioContainer.style.removeProperty('display')
              } else {
                this.readonlyButton.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.assgineeContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.groupLabelContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.radioSizeContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.radioContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
              }
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.eventBus.dispatch('setSelectionViewRadioOption', {
                source: this,
                radioGroup: radioGroup[0],
              })
              break
            case 6:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-form-dropdown theme--light mr-2'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.dropdown
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.removeProperty('display')
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.removeProperty('display')
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.removeProperty('display')
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textAlignToggle.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 7:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-paperclip theme--light mr-2'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.attachment
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              if (!selection[0].prefill) {
                this.requiredButton.style.removeProperty('display')
                this.assgineeContainer.style.removeProperty('display')
                this.labelContainer.style.removeProperty('display')
                this.uploadAttachmentContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
              } else {
                this.requiredButton.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.assgineeContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.labelContainer.style.setProperty(
                  'display',
                  'none',
                  'important'
                )
                this.uploadAttachmentContainer.style.removeProperty('display')
              }
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 8:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-image theme--light mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.image
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 9:
              icon = document.createElement('i')
              icon.className = 'custom-icon icon-signatureBP mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.signatureBP
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 10:
              icon = document.createElement('i')
              icon.className = 'custom-icon icon-signatureBO mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.signatureBO
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 11:
              icon = document.createElement('i')
              icon.className = 'custom-icon icon-stampBP mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.stampBP
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 12:
              icon = document.createElement('i')
              icon.className = 'custom-icon icon-stampBO mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.stampBO
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 13:
              icon = document.createElement('i')
              icon.className = 'custom-icon icon-signatureAndStamp mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.signatureAndStamp
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
            case 14:
              icon = document.createElement('i')
              icon.className =
                'v-icon notranslate mdi mdi-image theme--light mr-4'
              icon.style.fontSize = '20px'
              text = document.createElement('div')
              text.innerHTML = this.i18n.image
              text.className = 'text-subtitle-1'
              this.title.appendChild(icon)
              this.title.appendChild(text)
              this.requiredButton.style.removeProperty('display')
              this.readonlyButton.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.assgineeContainer.style.removeProperty('display')
              this.formatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateFormatContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.textContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.checkboxRuleContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioSizeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.radioContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dropdownContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.labelContainer.style.removeProperty('display')
              this.groupLabelContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.validationContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateRangeContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateTextContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.dateEraContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              this.uploadAttachmentContainer.style.setProperty(
                'display',
                'none',
                'important'
              )
              break
          }
        }
      }
    }
    this.eventBus.dispatch('setSelectionViewSelection', {
      source: this,
      selection: selection.length > 1 ? selection : selection[0],
      position,
      checkboxGroup: checkboxGroup ? checkboxGroup[0] : null,
      radioGroup: radioGroup ? radioGroup[0] : null,
      rect,
    })
  }

  _addEventListeners() {
    const self = this
    this.deleteButton.addEventListener('click', () => {
      self.fabricLayer.deleteSelection()
    })
  }
}

export { PDFSelectionViewer }
