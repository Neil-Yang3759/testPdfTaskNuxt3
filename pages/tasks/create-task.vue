<template>
  <div class="taskContainer">
    <v-app-bar :clipped-left="true" color="primary" dark fixed flat :extended="mdAndDown" height="50">
      <div v-if="model.taskName" class="d-flex align-center">
        <img v-if="isB2b2c" width="20" height="20" src="/images/tasks/taskCloud.svg" />
        <img v-else width="20" height="20" src="/images/tasks/taskStandard.svg" />
        <div class="ml-2 taskName" style="font-size: 13px">
          {{ model.taskName }}
        </div>
      </div>
      <template v-if="!mdAndDown">
        <v-stepper v-model="step" class="align-center justify-center text-center elevation-0" style="
            position: absolute;
            left: 28%;
            right: 28%;
            background: transparent !important;
          ">
          <v-stepper-header>
            <v-stepper-step step="1">
              {{ getTitle(1) }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="2">
              {{ getTitle(2) }}
            </v-stepper-step>

            <v-divider></v-divider>

            <v-stepper-step step="3">
              {{ getTitle(3) }}
            </v-stepper-step>

            <v-divider></v-divider>
          </v-stepper-header>
        </v-stepper>
      </template>
      <template v-if="mdAndDown" v-slot:extension>
        <v-row no-gutters justify="center" align="center">
          <v-col cols="2">
            <v-btn v-if="step !== 1" block depressed text color="white" @click="step--">
              {{ $t('button.previous') }}
            </v-btn>
          </v-col>
          <v-col cols="8">
            <div class="text-center text-subtitle-1" style="width: 100%">
              {{
                $t('heading.stepTitle', {
                  step,
                  totalStep,
                  stepTitle: getTitle(step),
                })
              }}
            </div>
          </v-col>
          <v-col cols="2">
            <v-btn v-if="step === 1" class="tour-create-task-3" block depressed text color="white"
              :disabled="!fileReady" @click="finishPersonPrepare()">
              {{ $t('button.next') }}
            </v-btn>
            <v-btn v-if="step === 2" block depressed text color="white" @click="checkAnnotate">
              {{ $t('button.next') }}
            </v-btn>
            <div v-if="step === 3" class="d-flex flex-row align-center justify-center">
              <v-btn small outlined @click="startPdfTask()">
                {{ $t('button.send') }}
              </v-btn>
              <v-menu offset-y bottom max-width="150px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn class="ml-1" icon small v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item dense>
                    <v-list-item-title>
                      <v-btn depressed text @click="previewPdfDialog = true">
                        {{ $t('button.preview') }}
                      </v-btn>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-col>
        </v-row>
      </template>
      <v-spacer></v-spacer>
      <v-btn outlined dark small class="mr-md-2 mr-n2" @click="leaveCreateTask">
        {{ $t('button.giveUp') }}
      </v-btn>
    </v-app-bar>
    <v-window v-model="step" touchless class="fill-height">
      <v-window-item v-if="step === 1" :value="1" class="fill-height mt-6">
        <v-row justify="center" no-gutters>
          <v-col cols="12" sm="10" md="8" lg="6" xl="6">
            <pdf-upload ref="pdfUpload" class="tour-create-task-0" :is-b2b2c="isB2b2c"
              :parent-task-name="model.taskName" @loadTemplateTaskPeople="loadTemplateTask"
              @initFirstKeepFindAnnotation="
                () => {
                  firstKeepFindAnnotation = true
                }
              "></pdf-upload>
          </v-col>
        </v-row>
        <v-row justify="center" no-gutters>
          <v-col cols="12" sm="10" md="8" lg="6" xl="6">
            <v-card flat class="pa-0">
              <v-card-text class="pt-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-card flat>
                      <v-card-title class="text-h6 text-sm-h5">{{
                        $t('label.taskName')
                      }}</v-card-title>
                      <v-card-text>
                        <validation-observer ref="taskNameObserver" vid="taskName">
                          <validation-provider v-slot="{ errors }" vid="taskName" :name="$t('label.taskName')"
                            rules="required" style="width: 100%">
                            <v-text-field v-model="model.taskName" :error-messages="errors"
                              :placeholder="$t('label.taskName')" outlined dense hide-details required
                              class="text-subtitle-1 mr-2"></v-text-field>
                          </validation-provider>
                        </validation-observer>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card flat>
                      <v-card-title class="text-h6 text-sm-h5">{{
                        $t('heading.setSigners')
                      }}</v-card-title>
                      <v-card-text>
                        <validation-observer ref="personObserver" vid="person">
                          <v-form ref="personForm">
                            <div class="d-flex flex-row align-center">
                              <v-checkbox v-model="model.isNotParallel" :label="$t('label.setSigningOrder')"
                                hide-details class="mb-4" :disabled="hasAuditorOrNotNormalSign"></v-checkbox>
                              <v-tooltip max-width="250" min-width="250" eager bottom>
                                <template v-slot:activator="{ on, attrs }">
                                  <v-icon small class="ml-2 mt-1" color="grey " v-bind="attrs"
                                    v-on="on">mdi-information</v-icon>
                                </template>
                                <div>
                                  {{ $t('tooltip.setSigningOrder') }}
                                  <ul>
                                    <li>
                                      {{ $t('options.emailSign') }}/{{
                                        $t('label.reviewOnly')
                                      }}
                                    </li>
                                    <li>{{ $t('options.faceSign') }}</li>
                                    <li v-if="planInfo.useCollaborateSign">
                                      {{ $t('options.collaborateSign') }}
                                    </li>
                                  </ul>
                                </div>
                              </v-tooltip>
                              <v-spacer />
                              <v-btn v-if="planInfo.signingGroupCount > 0" color="primary" text
                                @click="dialogSignerGroupApply = true">
                                {{ $t('button.applySignerGroup') }}
                              </v-btn>
                            </div>
                            <draggable v-model="model.taskPerson" v-bind="dragOptions" handle=".handle"
                              @start="drag = true" @end="taskPersonEnd">
                              <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                                <div v-for="(person, index) in model.taskPerson" :key="`task${person.id}`"
                                  class="d-flex flex-row align-center">
                                  <v-card width="100%" outlined class="mb-4">
                                    <v-icon v-if="!person.noSMS" medium class="handle" style="
                                        position: absolute;
                                        bottom: 10px;
                                        left: 10px;
                                      ">
                                      mdi-drag-vertical
                                    </v-icon>
                                    <div style="
                                        position: absolute;
                                        top: 5px;
                                        right: 10px;
                                      ">
                                      <!-- 不設定簽署順序的時候或方案不提供的時候不能選擇現場簽 -->
                                      <widget-select-sign-mode v-model="person.signMode" :disabled="!model.isNotParallel || isB2b2c
                                        " :no-line-sign="index !== 0" @change="
                                          changeSignMode(person.id, $event)
                                          " />
                                    </div>
                                    <v-card-title class="
                                        py-2
                                        d-flex
                                        flex-column flex-md-row
                                        align-start align-md-center
                                      ">
                                      <div class="d-flex" style="width: 60%">
                                        <v-chip :color="getPersonColor(person)" class="text-subtitle-1 mr-4" style="
                                            width: 30px;
                                            height: 30px;
                                            justify-content: center;
                                          ">
                                          <template v-if="model.isNotParallel">
                                            <div class="text-caption">
                                              {{ index + 1 }}
                                            </div>
                                          </template>
                                        </v-chip>
                                        <div>
                                          {{
                                            person.placeholder
                                              ? person.placeholder.name
                                              : '&nbsp;'
                                          }}
                                        </div>
                                      </div>
                                      <v-spacer v-if="$vuetify.breakpoint.mdAndUp" />
                                    </v-card-title>
                                    <v-card-text>
                                      <div class="d-flex flex-row align-bottom">
                                        <div style="
                                            width: 76px;
                                            margin-right: 10px;
                                            align-self: flex-end;
                                            padding: 0 8px;
                                          ">
                                          <!--寄送選項，現場簽只有姓名，所以不顯示-->
                                          <widget-select-send-method v-show="person.signMode !== 'FACE_SIGN' &&
                                            person.signMode !== 'NO_SMS_SIGN'
                                            " v-model="person.sendMethod" :disabled="person.signMode ===
                                              'COLLABORATE_SIGN' || isB2b2c
                                              " @input="
                                                changeSendMethod(
                                                  person.id,
                                                  $event
                                                )
                                                ">
                                          </widget-select-send-method>
                                        </div>
                                        <div class="flex-grow-1" :class="{
                                          'tour-create-task-1': index === 0,
                                        }">
                                          <v-row no-gutter>
                                            <v-col cols="12" md="6" class="pr-md-2">
                                              <validation-provider v-slot="{ errors }" :vid="`name${index}`"
                                                :name="$t('label.name')" rules="required" style="width: 100%">
                                                <v-text-field v-model="person.name" :error-messages="errors"
                                                  :label="$t('label.name')" :placeholder="$t('label.name')
                                                    " outlined dense hide-details required class="text-subtitle-1">
                                                  <template v-if="person.signMode !==
                                                    'FACE_SIGN'
                                                    " #append>
                                                    <v-menu bottom offset-y>
                                                      <template v-slot:activator="{
                                                        on,
                                                        attrs,
                                                      }">
                                                        <v-btn :disabled="isTour" icon v-bind="attrs"
                                                          v-on="on"><svg-icon-contacts /></v-btn>
                                                      </template>
                                                      <v-list>
                                                        <v-list-item @click="
                                                          chooseContact(
                                                            index,
                                                            'task',
                                                            'google'
                                                          )
                                                          ">
                                                          <v-list-item-title>
                                                            {{
                                                              $t(
                                                                'button.googContacts'
                                                              )
                                                            }}
                                                          </v-list-item-title>
                                                        </v-list-item>
                                                        <v-list-item @click="
                                                          chooseContact(
                                                            index,
                                                            'task',
                                                            'CONTACT'
                                                          )
                                                          ">
                                                          <v-list-item-title>{{
                                                            $t(
                                                              'button.contacts'
                                                            )
                                                          }}
                                                          </v-list-item-title>
                                                        </v-list-item>
                                                        <v-list-item @click="
                                                          chooseContact(
                                                            index,
                                                            'task',
                                                            'COMPANY_MEMBER'
                                                          )
                                                          ">
                                                          <v-list-item-title>
                                                            {{
                                                              $t(
                                                                'button.compMembers'
                                                              )
                                                            }}
                                                          </v-list-item-title>
                                                        </v-list-item>
                                                      </v-list>
                                                    </v-menu>
                                                  </template>
                                                </v-text-field>
                                              </validation-provider>
                                            </v-col>
                                          </v-row>
                                          <!-- 現場簽不填電子郵件和手機號碼 -->
                                          <v-row v-if="
                                            person.signMode !== 'FACE_SIGN'
                                          " no-gutters class="mt-md-2 mt-0">
                                            <v-col v-if="
                                              [
                                                'EMAIL',
                                                'EMAIL_PHONE',
                                              ].includes(person.sendMethod)
                                            " cols="12" md="6" class="pr-md-2 mt-2 mt-md-0">
                                              <validation-provider v-slot="{ errors }" :vid="`email${index}`"
                                                :name="$t('label.email')" :rules="{
                                                  email: true,
                                                  required: [
                                                    'EMAIL',
                                                    'EMAIL_PHONE',
                                                  ].includes(person.sendMethod),
                                                }" style="width: 100%">
                                                <v-text-field v-model="person.email" type="email"
                                                  :error-messages="errors" :label="$t('label.email')" :placeholder="$t('label.email')
                                                    " outlined dense hide-details required class="text-subtitle-1">
                                                </v-text-field>
                                              </validation-provider>
                                            </v-col>
                                            <v-col v-if="
                                              [
                                                'PHONE',
                                                'EMAIL_PHONE',
                                              ].includes(person.sendMethod)
                                            " cols="12" md="6" class="mt-2 mt-md-0">
                                              <validation-provider v-slot="{ errors }" :vid="`phone${index}`"
                                                :name="$t('label.mobilePhone')" :rules="{
                                                  required: [
                                                    'PHONE',
                                                    'EMAIL_PHONE',
                                                  ].includes(person.sendMethod),
                                                }" style="width: 100%">
                                                <v-text-field v-model="person.phone" autocapitalize="none"
                                                  :error-messages="errors" :label="$t('label.mobilePhone')
                                                    " :placeholder="$t('label.mobilePhone')
                                                      " outlined dense hide-details required class="
                                                    text-subtitle-1
                                                    pr-md-2
                                                  ">
                                                </v-text-field>
                                              </validation-provider>
                                            </v-col>
                                          </v-row>
                                        </div>
                                      </div>
                                      <v-row no-gutters class="ml-16 pl-2 pl-md-6">
                                        <!--現場簽設定主持人-->
                                        <div v-if="
                                          person.signMode !== 'NORMAL_SIGN' &&
                                          person.signMode !== 'NO_SMS_SIGN'
                                        " class="mt-2 flex-grow-1">
                                          <v-checkbox v-model="person.setNewHost" :label="person.signMode === 'FACE_SIGN'
                                            ? $t(
                                              'label.designatedRecipient'
                                            )
                                            : $t('label.signHost')
                                            " hide-details dense class="text-subtitle-1" />
                                          <v-row v-if="person.setNewHost" class="mt-2" no-gutters>
                                            <v-col cols="12" class="pr-md-2" md="6">
                                              <validation-provider v-slot="{ errors }" :vid="`hostName${index}`"
                                                :name="$t('label.name')" rules="required">
                                                <v-text-field v-model="person.hostName" :error-messages="errors"
                                                  :label="$t('label.name')" :placeholder="$t('label.name')
                                                    " outlined dense hide-details required readonly
                                                  class="text-subtitle-1">
                                                  <template #append>
                                                    <v-menu bottom offset-y>
                                                      <template v-slot:activator="{
                                                        on,
                                                        attrs,
                                                      }">
                                                        <v-btn icon v-bind="attrs" class="ma-0"
                                                          v-on="on"><svg-icon-contacts />
                                                        </v-btn>
                                                      </template>
                                                      <v-list>
                                                        <!--現場簽主持人只能從公司成員選取 -->
                                                        <v-list-item @click="
                                                          chooseContact(
                                                            index,
                                                            'host',
                                                            'COMPANY_MEMBER'
                                                          )
                                                          ">
                                                          <v-list-item-title>{{
                                                            $t(
                                                              'button.compMembers'
                                                            )
                                                          }}</v-list-item-title>
                                                        </v-list-item>
                                                      </v-list>
                                                    </v-menu>
                                                  </template>
                                                </v-text-field>
                                              </validation-provider>
                                            </v-col>
                                          </v-row>
                                          <v-row v-if="person.setNewHost" class="mt-2" no-gutters>
                                            <v-col cols="12" md="6">
                                              <validation-provider v-slot="{ errors }" :vid="`hostEmail${index + 1}`"
                                                :name="$t('label.email')" rules="required">
                                                <v-text-field v-model="person.hostEmail" :error-messages="errors"
                                                  :label="$t('label.email')" :placeholder="$t('label.email')
                                                    " outlined dense hide-details required readonly class="
                                                    mt-md-0 mt-1
                                                    text-subtitle-1
                                                    pr-md-2
                                                  ">
                                                </v-text-field>
                                              </validation-provider>
                                            </v-col>
                                          </v-row>
                                        </div>
                                      </v-row>
                                      <div class="
                                          d-flex
                                          align-md-center align-end
                                          flex-md-row flex-column
                                        ">
                                        <v-spacer></v-spacer>

                                        <div class="d-flex align-center mr-md-3">
                                          <div class="
                                              d-flex
                                              flex-md-row flex-column
                                              align-md-center
                                              alien-end
                                            ">
                                            <!-- 只審核時不能選擇聲明錄影 -->
                                            <div class="d-flex align-center">
                                              <v-checkbox v-if="planInfo.useVideo" v-model="person.needVideo"
                                                class="ml-3" style="height: 24px" dense :label="$t('label.consentVideo')
                                                  " :disabled="person.isAuditor ||
                                                    person.signMode ===
                                                    'COLLABORATE_SIGN'
                                                    ">
                                              </v-checkbox>
                                              <v-tooltip max-width="250" min-width="250" eager bottom>
                                                <template v-slot:activator="{
                                                  on,
                                                  attrs,
                                                }">
                                                  <v-icon v-if="planInfo.useVideo" small class="ml-2 mt-3"
                                                    color="#949494" v-bind="attrs" v-on="on">mdi-information</v-icon>
                                                </template>
                                                {{ $t('tooltip.consentVideo') }}
                                              </v-tooltip>
                                            </div>

                                            <div class="d-flex align-center">
                                              <!-- 現場簽和雲端憑證任務沒有只審核 -->
                                              <!-- tour活動不顯示只審核 -->
                                              <v-checkbox v-if="!isTour" v-model="person.isAuditor"
                                                :label="$t('label.reviewOnly')" class="ml-3" style="height: 24px" dense
                                                :disabled="!model.isNotParallel ||
                                                  person.signMode !==
                                                  'NORMAL_SIGN'
                                                  " @change="
                                                    changePersonSignRole(
                                                      person.id,
                                                      $event
                                                    )
                                                    ">
                                              </v-checkbox>
                                              <v-tooltip max-width="250" min-width="250" eager bottom>
                                                <template v-slot:activator="{
                                                  on,
                                                  attrs,
                                                }">
                                                  <v-icon v-if="!isTour" small class="ml-2 mt-3" color="#949494"
                                                    v-bind="attrs" v-on="on">mdi-information</v-icon>
                                                </template>
                                                {{ $t('tooltip.reviewOnly') }}
                                              </v-tooltip>
                                            </div>
                                            <div class="d-flex align-center">
                                              <v-checkbox v-model="person.isNeedOtp" :disabled="person.signMode !==
                                                'NORMAL_SIGN' ||
                                                [
                                                  'PHONE',
                                                  'EMAIL_PHONE',
                                                ].includes(person.sendMethod)
                                                " label="OTP" class="ml-3" dense style="height: 24px"></v-checkbox>
                                              <v-tooltip max-width="250" min-width="250" eager bottom>
                                                <template v-slot:activator="{
                                                  on,
                                                  attrs,
                                                }">
                                                  <v-icon small class="ml-2 mt-3" color="#949494" v-bind="attrs"
                                                    v-on="on">mdi-information</v-icon>
                                                </template>
                                                <span>
                                                  {{ $t('tooltip.otp') }}
                                                </span>
                                              </v-tooltip>
                                            </div>
                                          </div>
                                        </div>

                                        <div class="d-flex align-center mt-3">
                                          <div v-if="
                                            person.signMode !== 'FACE_SIGN'
                                          " class="text--button" @click="
                                            openSignSettingDialog(person)
                                            ">
                                            {{ $t('heading.advSettings') }}
                                          </div>
                                          <v-icon v-show="model.taskPerson.length > 1" medium class="ml-2"
                                            color="#949494" @click="deletePerson(index, 'task')">
                                            mdi-trash-can
                                          </v-icon>
                                        </div>
                                      </div>
                                    </v-card-text>
                                  </v-card>
                                </div>
                              </transition-group>
                            </draggable>
                            <dialog-sign-setting ref="signSettingDialog" page="useTemplate"
                              :open-dialog="signSettingDialog" @close="signSettingDialog = false"
                              @update="updateSignSetting">
                            </dialog-sign-setting>
                          </v-form>
                        </validation-observer>
                        <v-btn v-if="model.taskPerson.length < maxSignaturePerPdf" class="ml-n4 tour-create-task-2"
                          color="primary" text @click="addPerson('task')">
                          <v-icon class="mr-1"> mdi-plus-circle </v-icon>
                          {{ $t('button.addSigner') }}
                        </v-btn>
                        <p v-else class="red--text text--lighten-1">
                          {{
                            $t('text.pdfSignMax', { max: maxSignaturePerPdf })
                          }}
                        </p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card flat>
                      <v-card-title class="text-h6 text-sm-h5">{{
                        $t('button.sendCopy')
                      }}</v-card-title>
                      <v-card-text>
                        <validation-observer ref="ccObserver" vid="cc">
                          <v-form ref="ccForm">
                            <div v-for="(person, index) in model.ccPerson" :key="`cc${person.id}`"
                              class="d-flex flex-row align-center">
                              <v-card width="100%" outlined class="mb-4">
                                <v-card-text class="d-flex flex-row align-center pa-5">
                                  <v-row no-gutters justify="center" align="center">
                                    <v-col cols="12" class="pr-md-2" md="4">
                                      <validation-provider v-slot="{ errors }" :vid="`name${index}`"
                                        :name="$t('label.name')" rules="required" style="width: 100%">
                                        <v-text-field v-model="person.name" :error-messages="errors"
                                          :label="$t('label.name')" :placeholder="$t('label.name')" outlined dense
                                          hide-details required class="text-subtitle-1">
                                        </v-text-field>
                                      </validation-provider>
                                    </v-col>
                                    <v-col cols="12" md="8">
                                      <validation-provider v-slot="{ errors }" :vid="`email${index}`"
                                        :name="$t('label.email')" rules="required|email" style="width: 100%">
                                        <v-text-field v-model="person.email" type="email" :error-messages="errors"
                                          :label="$t('label.email')" :placeholder="$t('label.email')" outlined dense
                                          hide-details required class="mt-md-0 mt-1 text-subtitle-1">
                                          <template #append>
                                            <v-menu bottom offset-y>
                                              <template v-slot:activator="{ on, attrs }">
                                                <v-btn icon v-bind="attrs" v-on="on">
                                                  <svg-icon-contacts />
                                                </v-btn>
                                              </template>
                                              <v-list>
                                                <v-list-item @click="
                                                  chooseContact(
                                                    index,
                                                    'cc',
                                                    'google'
                                                  )
                                                  ">
                                                  <v-list-item-title>{{
                                                    $t('button.googContacts')
                                                  }}</v-list-item-title>
                                                </v-list-item>
                                                <v-list-item @click="
                                                  chooseContact(
                                                    index,
                                                    'cc',
                                                    'CONTACT'
                                                  )
                                                  ">
                                                  <v-list-item-title>{{
                                                    $t('button.contacts')
                                                  }}</v-list-item-title>
                                                </v-list-item>
                                                <v-list-item @click="
                                                  chooseContact(
                                                    index,
                                                    'cc',
                                                    'COMPANY_MEMBER'
                                                  )
                                                  ">
                                                  <v-list-item-title>{{
                                                    $t('button.compMembers')
                                                  }}</v-list-item-title>
                                                </v-list-item>
                                              </v-list>
                                            </v-menu>
                                          </template>
                                        </v-text-field>
                                      </validation-provider>
                                    </v-col>
                                  </v-row>
                                  <v-icon medium class="ml-4" color="#949494" @click="deletePerson(index, 'cc')">
                                    mdi-trash-can
                                  </v-icon>
                                </v-card-text>
                              </v-card>
                            </div>
                          </v-form>
                        </validation-observer>

                        <v-btn color="primary" class="ml-n4" text @click="addPerson('cc')">
                          <v-icon class="mr-1"> mdi-plus-circle </v-icon>
                          {{ $t('button.addCc') }}
                        </v-btn>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col v-if="!mdAndDown" cols="12" class="grey-zone pt-5 pb-8">
            <v-row>
              <v-col></v-col>
              <v-col></v-col>
              <v-col>
                <v-btn class="tour-create-task-3" color="primary" large @click="finishPersonPrepare()">
                  {{ $t('button.next') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-window-item>

      <v-window-item v-if="step === 2" :value="2" class="fill-height">
        <template>
          <div class="fill-height">
            <div class="fill-height" :class="{
              pdfViewer: !mdAndDown,
              'pdfViewer-sm': mdAndDown,
            }">
              <client-only v-if="loaded">
                <pdf ref="vuePdf" :user-info="userInfo" :file-list="fileSrcList"
                  :people-names="taskPeopleWithoutAuditor" :color-list="colorList" :mode="0" :use-hand-writing="false"
                  :keep-annotation-id="model.keepFindAnnotation === true
                    ? model.keepFindAnnotationPersonId
                    : null
                    " :use-b2b2c="isB2b2c" :watermark="watermark"></pdf>
              </client-only>
            </div>
            <v-footer v-if="!mdAndDown" absolute color="grey lighten-3"
              style="z-index: 199; border-top: 1px solid #e0e0e0 !important">
              <v-card color="grey lighten-3" width="100%" flat tile>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" outlined large class="mr-2" @click="step--">
                    {{ $t('button.previous') }}
                  </v-btn>
                  <v-btn color="primary" depressed large class="tour-create-task-10" @click="checkAnnotate">
                    {{ $t('button.next') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-footer>
          </div>
        </template>
      </v-window-item>

      <v-window-item v-if="step === 3" :value="3" class="fill-height mt-3">
        <v-row justify="center" class="px-3">
          <v-col cols="12" class="grey-zone mt-n3">
            <v-row justify="center">
              <v-col cols="12" sm="10" md="8" lg="6" xl="5">
                <!--文件列表-->
                <div v-if="fileSrcList.length > 0" width="100%" class="
                    mt-3
                    d-flex
                    flex-row
                    align-center
                    justify-space-between
                  ">
                  <div>
                    <div v-for="file in fileSrcList" :key="file.id">
                      <div class="d-flex flex-row align-center">
                        <v-icon large class="mr-3">mdi-file-pdf-box</v-icon>
                        <div class="confirm-file-name" style="word-break: break-word">
                          {{ file.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="
                    border-top: 4px solid #e3e3e3;
                    height: 0;
                    margin-top: 10px;
                    margin-bottom: 20px;
                  "></div>
                <div class="d-flex">
                  <div class="chip-label">
                    <span>{{ $t('heading.signers') }}</span>
                  </div>
                  <div>
                    <v-chip v-for="(p, i) in model.taskPerson" :key="`task${i}`" class="mr-1 mb-2" outlined>
                      <v-icon left :color="getPersonColor(p)" class="mr-0">mdi-circle-medium</v-icon>
                      <!--現場簽沒有email-->
                      <span class="chip-name-wrap" :class="{
                        'chip-text-mobile': mdAndDown,
                        'chip-text-desktop': !mdAndDown,
                      }">
                        {{ p.email ? p.email : p.name }}
                      </span>
                    </v-chip>
                  </div>
                </div>
                <div v-if="model.ccPerson.length > 0" class="mt-3 d-flex flex-column">
                  <v-divider class="mb-5"></v-divider>
                  <div class="d-flex">
                    <div class="chip-label">
                      <span>{{ $t('heading.cc') }}</span>
                    </div>
                    <div>
                      <v-chip v-for="(p, i) in model.ccPerson" :key="`cc${i}`" class="mr-1 mb-2" outlined>
                        {{ p.email }}
                      </v-chip>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" sm="10" md="8" lg="6" xl="5">
            <v-card flat>
              <v-row>
                <v-col cols="12">
                  <v-subheader>{{ $t('heading.mailSubject') }}</v-subheader>
                  <validation-observer ref="emailSubjectObserver" vid="emailSubject">
                    <validation-provider v-slot="{ errors }" vid="emailSubject" :name="$t('heading.mailSubject')"
                      rules="required|max:200" style="width: 100%">
                      <v-text-field v-model="model.emailSubject" outlined :error-messages="errors" counter="200" dense
                        required class="text-subtitle-1"></v-text-field>
                    </validation-provider>
                  </validation-observer>
                  <v-subheader>{{ $t('heading.mailMessage') }}</v-subheader>
                  <validation-observer ref="emailMessageObserver" vid="emailMessage">
                    <validation-provider v-slot="{ errors }" vid="emailMessage" :name="$t('heading.mailMessage')"
                      rules="max:200" style="width: 100%">
                      <v-textarea v-model="model.emailMessage" outlined :error-messages="errors" counter="200" rows="3"
                        required class="text-subtitle-1"></v-textarea>
                    </validation-provider>
                  </validation-observer>
                  <!-- v1.7.0 隱藏附件區塊
                        <v-subheader class="mt-4">附件</v-subheader>
                        <attachment-upoad
                          ref="uploadAttachment"
                        ></attachment-upoad>
                        -->
                </v-col>
                <v-col v-if="getUserTemplateIsRemain()" cols="12">
                  <v-checkbox v-model="model.notUseOnce" :label="$t('label.saveAsTmpl')" hide-details
                    class="mt-0"></v-checkbox>
                </v-col>

                <v-col v-if="model.isNotParallel && model.taskPerson.length > 1" cols="12">
                  <v-checkbox v-model="model.isOverlay" :label="$t('label.isOverlay')" hide-details
                    class="mt-0"></v-checkbox>
                </v-col>
                <v-col v-if="planInfo.useSIBlockChain" cols="12">
                  <v-checkbox v-model="model.siBlockChain" :label="$t('label.siBlockChain')" hide-details
                    class="mt-0"></v-checkbox>
                </v-col>
                <!-- <v-col
                    v-if="
                      getUserRemindAatlTime() !== null &&
                      getUserRemindAatlTime() > 0
                    "
                    cols="12"
                  >
                    <v-checkbox
                      v-model="model.isFinalAatl"
                      label="簽署結果安全憑證"
                      hide-details
                      class="ml-7 mt-0"
                    ></v-checkbox>
                  </v-col> -->
                <v-divider v-if="model.setExpiredDate" class="mx-8"></v-divider>
                <v-col cols="12">
                  <v-checkbox v-model="model.setExpiredDate" :label="$t('label.setSigningDeadline')" hide-details
                    class="mt-0">
                  </v-checkbox>
                  <widget-expired-date v-if="model.setExpiredDate" ref="widgetExpiredDate"
                    :parent-expired-date="model.expiredDate" class="ml-5"></widget-expired-date>
                </v-col>
              </v-row>

              <v-card-actions v-if="!mdAndDown">
                <v-spacer></v-spacer>
                <v-btn color="primary" outlined large class="mr-2" @click="step--">
                  {{ $t('button.previous') }}
                </v-btn>

                <v-btn color="primary" class="tour-create-task-11" depressed large @click="startPdfTask()">
                  {{ $t('button.send') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>
    </v-window>
    <!-- 聯絡人列表 dialog -->
    <dialog-contact ref="dialogContact" :open-dialog="contactDialog" :source="editSource" @close="chooseContactCancel"
      @submitContact="chooseContactOK">
    </dialog-contact>
    <!-- 聯絡人列表(連結Google) dialog -->
    <dialog-contact-from-google ref="dialogContactFromGoogle" :open-dialog="contactFromGoogleDialog"
      @close="chooseContactCancel" @submitContact="chooseContactOK">
    </dialog-contact-from-google>
    <v-dialog v-model="deletePeopleDialog" overlay-opacity="0.9" max-width="500" @input="deletePeopleDialog = false">
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-alert-outline</v-icon>
          <span style="font-weight: 700">{{ $t('heading.headsUp') }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">
            {{ $t('text.delNotFinish', { notFinish: notFinishList.length }) }}
          </div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn text class="mr-2" @click="deletePeopleDialog = false">
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn color="#AA0000" dark class="text-subtitle-2" @click="deleteNotFinishPeople">
            {{ $t('button.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="warningDialog" overlay-opacity="0.9" max-width="500" @input="warningDialog = false">
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-alert-outline</v-icon>
          <span style="font-weight: 700">{{ $t('heading.warning') }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">{{ $t('text.confirmGiveUpTask') }}</div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn text class="mr-2" @click="warningDialog = false">
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn color="#AA0000" dark class="text-subtitle-2" @click="confirmLeave">
            {{ $t('button.giveUp') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="previewPdfDialog" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card class="fill-height">
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="previewPdfDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ $t('heading.preview') }}</v-toolbar-title>
        </v-toolbar>
        <v-card-text class="fill-height pa-0" style="background: #f1f3f5">
          <client-only v-if="loaded && previewPdfDialog">
            <pdf key="previewPdf" :file-list="fileSrcList" :people-names="model.taskPerson" :color-list="colorList"
              :mode="2" :use-hand-writing="false" :keep-annotation-id="null" :use-b2b2c="false" :watermark="watermark">
            </pdf>
          </client-only>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- 如果第一個簽署人是自己，詢問是否要現在開始簽核 -->
    <v-dialog v-model="startTaskNowDialog" overlay-opacity="0.9" max-width="500"
      @input="$router.push(localePath('/tasks'))">
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-information</v-icon>
          <span style="font-weight: 700">{{ $t('heading.headsUp') }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">{{ $t('text.startSigningNow') }}</div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn text class="text-button mr-2" @click="$router.push(localePath('/tasks'))">
            {{ $t('button.no') }}
          </v-btn>
          <v-btn color="primary" @click="goToSign">
            {{ $t('button.yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="findAnnotationDialog" overlay-opacity="0.9" max-width="500" @input="keepFindAnnotationCancel()">
      <v-card class="rounded-lg">
        <v-app-bar dark flat color="primary">
          <v-toolbar-title class="ml-5 mx-auto text-h6">{{
            $t('heading.pdfFormFields')
          }}</v-toolbar-title>
        </v-app-bar>
        <v-card-text class="px-10 pt-10 pb-5">
          <v-radio-group v-model="model.keepFindAnnotation" column>
            <v-radio :label="$t('label.preserveFormFields')" :value="true"></v-radio>
            <div>
              <div class="annotationPeopleTitle text-subtitle-2">
                {{ $t('label.assignToSigner') }}
              </div>
              <v-select v-model="model.keepFindAnnotationPersonId" :items="model.taskPerson" item-text="name"
                item-value="id" height="42" solo flat single-line hide-details class="annotationPeopleSelect"
                :label="$t('label.selectSignerAssign')" :disabled="!model.keepFindAnnotation ||
                  model.keepFindAnnotation === false
                  " :menu-props="{
                    auto: true,
                    bottom: true,
                    offsetY: true,
                    maxHeight: '100%',
                  }">
                <template v-slot:[`selection`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
                <template v-slot:[`item`]="{ item }">
                  <div class="text-body-2 text-truncate" style="max-width: 240px; overflow: hidden">
                    {{ item.name }}
                  </div>
                </template>
              </v-select>
            </div>
            <v-radio :label="$t('label.notPreserveFormFields')" :value="false"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="px-10 py-5 grey lighten-3">
          <v-spacer></v-spacer>
          <v-btn large outlined color="primary" class="text-button mr-2" @click="keepFindAnnotationCancel()">
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn large color="primary" class="text-button" :disabled="model.keepFindAnnotation === null ||
            model.keepFindAnnotation === undefined ||
            (model.keepFindAnnotation === true &&
              (model.keepFindAnnotationPersonId === null ||
                model.keepFindAnnotationPersonId === undefined))
            " @click="keepFindAnnotationOk()">
            {{ $t('button.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="changeAuditorDialog" overlay-opacity="0.9" max-width="500" persistent>
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-alert-outline</v-icon>
          <span style="font-weight: 700">{{ $t('heading.warning') }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">{{ $t('text.auditorNoAnnotate') }}</div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn text class="text-button mr-2" @click="cancelChangeAuditor">
            {{ $t('button.no') }}
          </v-btn>
          <v-btn color="#AA0000" dark @click="confirmChangeAuditor">
            {{ $t('button.yes') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="collaborateNotSetDialog" overlay-opacity="0.9" max-width="500" persistent>
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-alert-outline</v-icon>
          <span style="font-weight: 700">{{
            $t('heading.settingNotFinished')
          }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">{{ $t('text.fieldsNotSet') }}</div>
          <div class="text-subtitle-1 red--text">
            {{ $t('label.collaborateDate') }}
          </div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="goSetCollaborateSign">
            {{ $t('button.goSet') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="checkSmsSubjectLengthDialog" overlay-opacity="0.9" max-width="500" persistent>
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-alert-outline</v-icon>
          <span style="font-weight: 700">{{ $t('heading.headsUp') }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">
            {{
              $t('message.smsSubjectLengthConfirm', {
                limit: $config.smsLengthLimit,
              })
            }}
          </div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn text class="text-button mr-2" @click="checkSmsSubjectLengthDialog = false">
            {{ $t('button.cancel') }}
          </v-btn>
          <v-btn color="primary" dark @click="confirmSmsLengthStartPdf">
            {{ $t('button.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogB2b2cNotSet" overlay-opacity="0.9" max-width="450" persistent>
      <v-card class="rounded-lg pa-8">
        <v-card-title style="border-bottom: #707070 solid 0.5px" class="px-0">
          <v-icon color="#AA0000" class="mr-1">mdi-alert-outline</v-icon>
          <span style="font-weight: 700; word-break: break-word">{{
            $t('heading.b2b2cNotSet')
          }}</span>
        </v-card-title>
        <v-card-text class="px-0 pt-5 pb-5">
          <div class="text-subtitle-1">
            {{ $t('message.b2b2cNotSet') }}
          </div>
        </v-card-text>
        <v-card-actions class="px-0 pt-5">
          <v-spacer></v-spacer>

          <v-btn color="primary" large class="text-subtitle-2" @click="switchB2b2cSetting">
            {{ $t('button.goSet') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogTourNotFinish" overlay-opacity="0.9" max-width="500" persistent>
      <v-card class="rounded-lg pa-5">
        <v-card-title>
          <v-icon class="mr-1">mdi-information-outline</v-icon>
          <span style="font-weight: 700">{{ $t('heading.headsUp') }}</span>
        </v-card-title>
        <v-card-text class="px-10 pt-5 pb-5">
          <div class="text-subtitle-1">{{ $t('message.tourNotFinish') }}</div>
        </v-card-text>
        <v-card-actions class="px-5 py-5">
          <v-spacer></v-spacer>
          <v-btn color="primary" dark @click="leaveTour">
            {{ $t('button.ok') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <dialog-leave-tour :open-dialog="dialogLeaveTour" @close="startTour" @confirm="endTour" />
    <dialog-signer-group-apply :open-dialog="dialogSignerGroupApply" :current-signer-length="model.taskPerson.length"
      :apply-to-create="emptyPerson" @close="dialogSignerGroupApply = false" @choose="applySignerGroup" />
    <v-dialog v-model="showLinkDialog" overlay-opacity="0.9" max-width="550" persistent @input="closeShowLinkDialog">
      <v-card class="rounded-lg">
        <v-app-bar flat class="dialog-header">
          {{ $t('heading.shareSignLink') }}
        </v-app-bar>
        <v-card-text class="px-10 pt-5 pb-5">
          <div v-if="$vuetify.breakpoint.mdAndUp" class="text-subtitle-1">
            {{ $t('text.shareSignLink') }}
          </div>
          <div v-else class="text-subtitle-1">
            {{ $t('text.shareSignLinkMobile') }}
          </div>
          <div class="qrcode">
            <div class="qrcode-spacing">
              <v-btn outlined @click="copyShareLink"><v-icon left>mdi-content-copy</v-icon>{{ $t('button.copyLink')
              }}</v-btn>
            </div>
            <v-divider v-if="$vuetify.breakpoint.mdAndUp" class="mx-4" vertical></v-divider>
            <div v-if="$vuetify.breakpoint.mdAndUp" class="qrcode-spacing">
              <canvas id="qrcode-canvas"></canvas>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="px-10 py-5 grey lighten-3">
          <v-spacer />
          <v-btn text class="text-subtitle-2" @click="closeShowLinkDialog">
            {{ $t('button.leave') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'empty',
})
import { useEventListener } from '@vueuse/core'
import { useDisplay } from 'vuetify'
import { driver } from 'driver.js'
import { validateTaiwanIdCard } from '~/composables/taiwanIdCardValidation'
import { isDefined, useStorage } from '@vueuse/core'

const snackbarStore = useSnackbarStore()
const globalVarStore = useGlobalVarStore()
const messageDialogStore = useMessageDialogStore()
const alertStore = useAlertStore()
const uploadPdfStore = useUploadPdfStore()
const tourStore = useTourStore()
const mainStore = useMainStore()
const route = useRoute()
const router = useRouter()
const { $store } = useNuxtApp()
const { getColorList } = useColors()
const { t, locale, locales, setLocale } = useI18n()
const { mdAndDown, mdAndUp } = useDisplay()
const { $clevertap } = useNuxtApp()
const { getRestrictApi } = usePlanApi()
const { getRulesApi } = useCreditApi()
const { getWatermarkApi } = useCompanyApi()

const userInfo = ref(null)
const step = ref(1)
const totalStep = ref(4)
const isEditTaskName = ref(false)
const fileSrcList = ref([])
const annotateForPerson = ref([])
const dragging = ref(false)
const warningDialog = ref(false)
const deletePeopleDialog = ref(false)
const notFinishList = ref([])
const numPages = ref(undefined)
const mode = ref(0)
const singDone = ref(false)
const resultId = ref('')
const userId = ref(1)
const loaded = ref(false)
const pdfTaskDialog = ref(false)
const contactCompanyOnly = ref(false)
const contactDialog = ref(false)
const contactFromGoogleDialog = ref(false)
const previewPdfDialog = ref(false)
const drag = ref(false)
const editIndex = ref(null)
const editType = ref(null)
const editSource = ref(null)
const model = ref({
  taskName: '',
  taskPerson: [
    {
      id: 1,
      email: '',
      name: '',
      phone: '',
      setNewHost: false,
      hostName: '',
      hostEmail: '',
      culture: locale.value,
      signRole: 'SIGNER',
      signMode: 'NORMAL_SIGN',
      isAuditor: false,
      isNeedOtp: false,
      face: false,
      needVideo: false,
      sendMethod: 'EMAIL',
      collaborateSignDate: '',
      noSMS: false,
    },
  ],
  ccPerson: [],
  account: '',
  notUseOnce: false,
  isOverlay: true,
  isNotParallel: true,
  isFinalAatl: false,
  isNeedOtp: false,
  otpTimingType: 'READ',
  otpMethodType: 'EMAIL',
  keepFindAnnotation: null,
  keepFindAnnotationPersonId: null,
  setExpiredDate: false,
  expiredDate: null,
  emailSubject: '',
  emailMessage: '',
  siBlockChain: false,
})
const pdfUpload = ref(null)
const startTaskId = ref('')
const startTaskPhone = ref(null)
const startTaskNowDialog = ref(false)
const findAnnotationDialog = ref(false)
const changeAuditorDialog = ref(false)
const signSettingDialog = ref(false)
const changeRoleId = ref('')
const isFindAnnotation = ref(false)
const firstKeepFindAnnotation = ref(true)
const maxSignaturePerPdf = ref(8)
const from = ref(null)
const fileId = ref(null)
const creditRules = ref([])
const watermark = ref(null)
const collaborateNotSetDialog = ref(false)
const confirmSmsSubjectLength = ref(false)
const checkSmsSubjectLengthDialog = ref(false)
const pointPerSms = ref(1)
const startTime = ref(null)
const successStarted = ref(false)
const ctEvent = ref({
  TaskName: '',
  DurationSecs: 0,
  SignatoryCount: 0,
  Template: '',
  LeaveOn: '',
})
const isEditing = ref(false)
const isB2b2c = ref(false)
const dialogB2b2cNotSet = ref(false)
const dialogLeaveTour = ref(false)
const dialogSignerGroupApply = ref(false)
const confirmLeaveTour = ref(false)
const tourLeaveProgress = ref(-1)
const driverObj = ref(null)
const leaveTo = ref(null)
const tourSteps = ref({
  1: [
    {
      popover: {
        title: '',
        description: '',
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-0',
      popover: {
        title: t('heading.tourCreateTask0'),
        description: t('text.tourCreateTask0Descr'),
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-1',
      popover: {
        title: t('heading.tourCreateTask1'),
        description: t('text.tourCreateTask1Descr'),
        side: 'bottom',
        onNextClick: tourNextFillSigner,
      },
    },
    {
      element: '.tour-create-task-2',
      popover: {
        title: t('heading.tourCreateTask2'),
        description: t('text.tourCreateTask2Descr'),
        side: 'top',
      },
    },
    {
      element: '.tour-create-task-3',
      popover: {
        title: t('heading.tourCreateTask3'),
        description: t('text.tourCreateTask3Descr'),
        showButtons: ['next'],
        onNextClick: showConfirmLeaveTour,
      },
    },
  ],
  2: [
    {
      popover: {
        title: '',
        description: '',
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-4',
      popover: {
        title: t('heading.tourCreateTask4'),
        description: t('text.tourCreateTask4Descr'),
        onNextClick: tourNextChangeTextSize,
      },
    },
    {
      element: '.tour-create-task-5',
      popover: {
        title: t('heading.tourCreateTask5'),
        description: t('text.tourCreateTask5Descr'),
        onNextClick: tourNextHideSidebar,
      },
    },
    {
      element: '.tour-create-task-8',
      popover: {
        title: t('heading.tourCreateTask8'),
        description: t('text.tourCreateTask8Descr'),
      },
    },
    {
      element: '.tour-create-task-10',
      popover: {
        title: t('heading.tourCreateTask10'),
        description: t('text.tourCreateTask10Descr'),
        showButtons: ['next'],
        onNextClick: showConfirmLeaveTour,
      },
    },
  ],
  3: [
    {
      popover: {
        title: '',
        description: '',
        side: 'bottom',
      },
    },
    {
      element: '.tour-create-task-11',
      popover: {
        title: t('heading.tourCreateTask11'),
        description: t('text.tourCreateTask11Descr'),
        showButtons: ['next'],
        onNextClick: showConfirmLeaveTour,
      },
    },
  ],
})
const dialogTourNotFinish = ref(false)
const showLinkDialog = ref(false)
const shareLink = ref('')
const pdfRef = ref(null)

const fileReady = computed(() => {
  return uploadPdfStore.fileCount > 0
})
const dragOptions = computed(() => {
  return {
    animation: 200,
    group: 'description',
    disabled: false,
    ghostClass: 'ghost',
    move: ({ relatedContext, draggedContext }) => {
      const draggedElement = draggedContext.element
      const relatedElement = relatedContext.element

      // 如果拖拽的是 noSMS 的 person 或者試圖將其他 person 拖到 noSMS person 前面
      if (
        draggedElement.noSMS ||
        (relatedElement.noSMS && draggedContext.index > relatedContext.index)
      ) {
        // 顯示提示訊息
        alertStore.showAlert({
          message: t('message.cannotMoveNoSMSPerson'),
          type: 'error',
        })
        return false // 阻止拖拽
      }
      return true // 允許拖拽
    },
  }
})
const hasAuditorOrNotNormalSign = computed(() => {
  return (
    model.value.taskPerson.some((p) => p.isAuditor) ||
    model.value.taskPerson.some((p) => p.signMode !== 'NORMAL_SIGN')
  )
})
const taskPeopleWithoutAuditor = computed(() => {
  return model.value.taskPerson.filter((p) => p.signRole === 'SIGNER')
})
const annotate = computed(() => {
  return fileSrcList.value.map((f) => f.annotate)
})
const planInfo = computed(() => {
  console.log(mainStore.planInfo)
  return mainStore.planInfo
})
const isTour = computed(() => {
  return tourStore.startCreateTask
})
const emptyPerson = computed(() => {
  if (model.value.taskPerson.length === 1) {
    const person = model.value.taskPerson[0]
    // 檢查annotate是否有這個簽署人的資料，如果有才需要跳出警告dialog
    let hasAnnotate = false
    annotateForPerson.value.forEach((file) => {
      file.forEach((page) => {
        hasAnnotate =
          hasAnnotate || page.data.some((data) => data.id === person.id)
      })
    })
    return (
      !hasAnnotate &&
      person.email === '' &&
      person.name === '' &&
      person.phone === ''
    )
  }
  return false
})

watch(userId, () => {
  pdfRef.value.setIdAndStrokeColor(
    userId.value,
    getColorList()[userId.value - 1]
  )
})
watch(step, async (newStep, oldStep) => {
  // 回到第一步的時候因爲component沒有資料所以要重新載入檔案
  if (newStep === 1 && oldStep === 2) {
    loaded.value = false
    await nextTick()
    loadFileList(fileSrcList.value)
  }
  // 進入指派簽署時檢查
  if (newStep === 2) {
    // 是否沒有需要指派簽署的人員（都是只審核）
    if (taskPeopleWithoutAuditor.value.length === 0) {
      messageDialogStore.showMessage({
        message: t('message.noOneNeedsSign'),
        width: 450,
      })
      if (oldStep === 1) {
        // 如果是新增收件人到下一步，直接跳到審閱並傳送
        step.value = 3
      } else if (oldStep === 3) {
        // 如果是審閱並傳送回到上一步，直接跳到新增收件人
        step.value = 1
      }
    }
  }
})

userInfo.value = mainStore.userInfo
from.value = route.query.from
isB2b2c.value = route.query.isB2b2c === 'true'
fileId.value = route.query.fileId
mainStore.pageTitle = t('title.createTask')

useEventListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'hidden' && !successStarted.value) {
    leavePushEvent()
  }
})
useEventListener(window, 'beforeunload', preventNav)
useEventListener(window, 'pagehide', visibilityChangeHidden)

onMounted(async () => {
  // 取得目前方案對每份文件簽署人數的限制
  const restrictResult = await getRestrictApi()
  if (restrictResult !== null && restrictResult.body !== null) {
    maxSignaturePerPdf.value = restrictResult.body.maxSignaturePerPdf
    mainStore.planInfo = restrictResult.body
  }

  const creditRulesResult = await getRulesApi()
  if (creditRulesResult !== null && creditRulesResult.body !== null) {
    creditRules.value = creditRulesResult.body.data
  }

  // 取得公司浮水印
  const watermarkResult = await getWatermarkApi()
  if (watermarkResult !== null && watermarkResult.body !== null) {
    watermark.value = watermarkResult.body
  }

  if (from.value && fileId.value) {
    preDownloadFile()
  }
  const sendTemplateData = mainStore.sendTemplateData
  if (sendTemplateData) {
    passDataFromTemplate(sendTemplateData)
  }
  const preventGesture = (e) => {
    e.preventDefault()
    document.body.style.zoom = 0.99
  }
  const preventGestureEnd = (e) => {
    e.preventDefault()
    document.body.style.zoom = 1
  }
  useEventListener(document, 'gesturestart', preventGesture)
  useEventListener(document, 'gesturechange', preventGesture)
  useEventListener(document, 'gestureend', preventGestureEnd)

  if (useStorage('tourNotFinish', '').value) {
    dialogTourNotFinish.value = true
  } else if (isTour.value) {
    preDownloadFileForTour()
    await nextTick()
    startTour()
  }
  startTime.value = new Date()
})

onBeforeRouteLeave((to, from, next) => {
  // 先關閉目前的tour，highlight才不會蓋到dialog
  if (driverObj.value !== null) {
    tourLeaveProgress.value = driverObj.value.getActiveIndex()
    driverObj.value.destroy()
  }
  // 沒有成功送出前離開需要dialog提示
  if (!successStarted.value) {
    // 先判斷是否爲tour
    if (isTour.value && !confirmLeaveTour.value) {
      // 進行tour活動並且沒有確認離開
      leaveTo.value = to
      dialogLeaveTour.value = true
      next(false)
      return false
    } else if (isEditing.value) {
      // 詢問是否放棄已編輯內容
      warningDialog.value = true
      next(false)
      return false
    }
  }
  leaveTo.value = null
  next()
})

onUnmounted(() => {
  uploadPdfStore.fileUploadFromIndex = null
  mainStore.attachmentFiles = []
})
function leaveTour() {
  localStorage.removeItem('tourNotFinish')
  dialogTourNotFinish.value = false
  router.push('/')
}
function visibilityChangeHidden() {
  if (isTour.value) {
    localStorage.setItem('tourNotFinish', true)
  }
}
function preventNav(event) {
  if (!isEditing.value && !isTour.value) return
  event.preventDefault()
  event.returnValue = true
}
function leaveCreateTask() {
  if (isTour.value) {
    // 如果是tour活動優先顯示確認是否離開活動
    dialogLeaveTour.value = true
  } else if (isEditing.value) {
    // 詢問是否放棄目前編輯的內容
    warningDialog.value = true
  } else {
    confirmLeave()
  }
}
function confirmLeave() {
  isEditing.value = false
  router.push('/tasks')
}
function getTitle(step) {
  switch (step) {
    case 1:
      return t('heading.uploadDocAndSetSigners')
    case 2:
      return t('heading.editSigningContent')
    case 3:
      return t('heading.confirm')
    default:
      return ''
  }
}
function getPersonColor(person) {
  if (person.isAuditor) {
    return '000000'
  }
  const index = person.id - 1
  return getColorList()[index] ?? '000000'
}
function addPerson(type) {
  if (isTour.value) {
    return
  }
  switch (type) {
    case 'task':
      model.value.taskPerson.push({
        id: model.value.taskPerson.length + 1,
        email: '',
        name: '',
        phone: '',
        setNewHost: false,
        hostName: '',
        hostEmail: '',
        signRole: 'SIGNER',
        signMode: 'NORMAL_SIGN',
        isAuditor: false,
        isNeedOtp: false,
        culture: locale.value,
        face: false,
        needVideo: false,
        sendMethod: 'EMAIL',
        collaborateSignDate: '',
        noSMS: false,
      })
      uploadPdfStore.taskPersonCount = model.value.taskPerson.length
      break
    case 'cc':
      model.value.ccPerson.push({
        id: model.value.ccPerson.length + 1,
        email: '',
        name: '',
      })
      break
  }
}
function deletePerson(index, type) {
  switch (type) {
    case 'task':
      if (
        index !== null &&
        index !== undefined &&
        model.value.taskPerson[index]
      ) {
        const deleteId = model.value.taskPerson[index].id

        model.value.taskPerson.splice(index, 1)
        uploadPdfStore.taskPersonCount = model.value.taskPerson.length
        const changeMap = {}
        model.value.taskPerson.forEach((element, index) => {
          const oldId = element.id
          const newId = index + 1
          changeMap[oldId] = newId
          element.id = newId
        })

        if (annotateForPerson.value) {
          annotateForPerson.value.forEach((file) => {
            file.forEach((element) => {
              element.data = element.data
                .filter((data) => {
                  return data.id !== deleteId
                })
                .map((data) => {
                  if (isDefined(data.id)) {
                    const newId = changeMap[data.id]
                    data.id = newId
                    const hex = getColorList()[newId - 1] ?? '000000'
                    const r = parseInt(hex.slice(1, 3), 16)
                    const g = parseInt(hex.slice(3, 5), 16)
                    const b = parseInt(hex.slice(5, 7), 16)
                    data.color = `rgba(${r},${g},${b}, 0.6)`
                    data.stroke = `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g
                      }, ${b > 10 ? b - 10 : b})`
                  }
                  return data
                })
            })
          })
          // 載入範本的時候要刪除預設空白的人員，id會更新
          if (pdfUpload.value) {
            pdfUpload.value.replaceAnnotate(annotateForPerson.value)
          }
        }
      }
      break
    case 'cc':
      if (
        index !== null &&
        index !== undefined &&
        model.value.ccPerson[index]
      ) {
        model.value.ccPerson.splice(index, 1)
      }
      break
  }
}
function loadTemplateTask(payload) {
  isEditing.value = true
  if (model.value.taskName === '') {
    model.value.taskName = payload.taskName
  }
  annotateForPerson.value = JSON.parse(payload.annotate)
  // 只有更新annotate沒有更新人員
  if (payload.taskPerson.length === 0) {
    return
  }
  ctEvent.value.Template += `${payload.taskName} `

  // 多文件：將人員取代現有資料或加到後面
  if (payload.clearPerson) {
    model.value.taskPerson = payload.taskPerson
    model.value.ccPerson = payload.ccPerson
  } else {
    payload.taskPerson.forEach((tp, index) => {
      model.value.taskPerson.push(tp)
    })
    payload.ccPerson.forEach((c) => {
      model.value.ccPerson.push(c)
    })
  }

  uploadPdfStore.taskPersonCount = model.value.taskPerson.length
}
function loadFileList(list) {
  pdfUpload.value.loadFileList(list)
  pdfUpload.value.replaceAnnotate(annotateForPerson.value)
}
async function finishPersonPrepare() {
  const pdfData = pdfUpload.value.getData()
  // TODO: pdfData就三個值
  const pdfDataRef = toRef(pdfData)
  // Object.assign(this, pdfDataRef.value);
  if (pdfDataRef.value.fileSrcList.some((file) => file.fileWatermarked)) {
    watermark.value = null
  }
  if (!fileReady.value) {
    alertStore.showAlert({
      message: t('message.noDoc'),
      type: 'error',
    })
    return
  }
  globalVarStore.loading = true
  const result = await getMyInfoApi()
  if (result !== null && result.body !== null) {
    mainStore.userInfo = result.body
  }
  globalVarStore.loading = false

  // 設定多文件ID & 可能變更過的annotate（變更順序、刪除、切換角色）
  for (let i = 0; pdfDataRef.value.fileSrcList.length > i; i++) {
    pdfDataRef.value.fileSrcList[i].id = i + 1
    pdfDataRef.value.fileSrcList[i].annotate = annotateForPerson.value[i] ?? []
  }
  isFindAnnotation.value = pdfDataRef.value.fileSrcList.some(
    (f) => f.isFindAnnotation
  )

  let message = ''
  let taskPersonOk = true
  let taskPersonDuplicate = false
  let ccPersonOk = true
  let ccPersonDuplicate = false
  let collaborateSignOk = true
  let collaborateSignHostOk = true
  const taskPersonLengthOk = model.value.taskPerson.length <= maxSignaturePerPdf
  const collaborateSignList = model.value.taskPerson.filter(
    (person) => person.signMode === 'COLLABORATE_SIGN'
  )
  const collaborateSignLimitOk = collaborateSignList.length < 2

  const taskNameValidation = await taskNameObserver.validate()

  // 方案有視訊簽時檢查視訊簽人員是否有設定日期 & 視訊簽會議主持人email不可與簽署人相同
  if (planInfo.value.useCollaborateSign) {
    collaborateSignOk =
      collaborateSignList.filter((person) => !person.collaborateSignDate)
        .length === 0
    collaborateSignHostOk =
      collaborateSignList.filter((person) => person.email === person.hostEmail)
        .length === 0
  }

  // 非平行簽時檢查簽署人email是否重複，排除現場簽
  const emailList = model.value.taskPerson
    .filter((person) => person.signMode !== 'FACE_SIGN' && person.email !== '')
    .map((person) => person.email)
  // 非平行簽時檢查簽署人phone是否重複，排除現場簽以及noSMS為true的簽署人
  const phoneList = model.value.taskPerson
    .filter(
      (person) =>
        person.signMode !== 'FACE_SIGN' &&
        person.phone !== '' &&
        person.noSMS === false
    )
    .map((person) => person.phone)
  await personObserver.value.validate().then((success) => {
    if (!success || model.value.taskPerson.length <= 0) {
      taskPersonOk = false
    } else if (
      !model.value.isNotParallel &&
      emailList.length > 1 &&
      emailList.filter((item, index) => emailList.indexOf(item) !== index)
        .length !== 0
    ) {
      taskPersonDuplicate = true
    } else if (
      !model.value.isNotParallel &&
      planInfo.value.useSMSPerson &&
      phoneList.length > 1 &&
      phoneList.filter((item, index) => phoneList.indexOf(item) !== index)
        .length !== 0
    ) {
      taskPersonDuplicate = true
    } else {
      taskPersonOk = true
    }
  })

  // 檢查副本列表email是否重複
  const ccEmailList = model.value.ccPerson.map((person) => person.email)
  await ccObserver.value.validate().then((success) => {
    if (!success) {
      ccPersonOk = false
    } else if (
      ccEmailList.length > 1 &&
      ccEmailList.filter((item, index) => ccEmailList.indexOf(item) !== index)
        .length !== 0
    ) {
      ccPersonDuplicate = true
    } else {
      ccPersonOk = true
    }
  })
  // 設定信件主旨
  const userInfo = mainStore.userInfo
  model.value.emailSubject = t('placeholder.subjectInviteSign', {
    userName: userInfo.name,
    taskName: model.value.taskName,
  })
  // 確認信件主旨長度
  const showConfirmSmsLengthDialog = checkSmsSubjectLength()
  if (showConfirmSmsLengthDialog) {
    checkSmsSubjectLengthDialog.value = true
    return
  }

  // 計算點數是否足夠可以發送簡訊
  const companyCredit = userInfo.companyCredit
  const SMS_PER_PERSON = Number(config.public.smsPerPerson)
  const SMS_RULE = creditRules.value.find((r) => r.txType === 'USE_SMS')
  const needPoints =
    SMS_RULE.amount * pointPerSms.value * SMS_PER_PERSON * phoneList.length
  const creditOK = companyCredit >= needPoints

  if (taskPeopleWithoutAuditor.value.length === 0 && isB2b2c.value) {
    alertStore.showAlert({
      message: t('message.b2b2cAllAuditor'),
      type: 'error',
    })
    return
  }

  if (
    taskNameValidation &&
    taskPersonOk &&
    !taskPersonDuplicate &&
    ccPersonOk &&
    !ccPersonDuplicate &&
    taskPersonLengthOk &&
    creditOK &&
    collaborateSignOk &&
    collaborateSignLimitOk &&
    collaborateSignHostOk &&
    !showConfirmSmsLengthDialog
  ) {
    if (
      firstKeepFindAnnotation.value === true &&
      isFindAnnotation.value === true
    ) {
      findAnnotationDialog.value = true
      model.value.keepFindAnnotation = true
      model.value.keepFindAnnotationPersonId = 1
    } else {
      step.value++
      if (isTour.value) {
        loadTourAnnotate()
        startTour()
      }
    }
  } else {
    if (!collaborateSignLimitOk) {
      message = t('message.collaborateSignLimit')
    }

    if (!collaborateSignHostOk) {
      message = t('message.collaborateSignHostError')
    }

    if (!creditOK) {
      message = t('message.insufficientSmsPoints', {
        nowPoints: companyCredit,
        needPoints,
      })
    }

    if (!taskPersonLengthOk) {
      message = t('message.personLengthExceed')
    }

    if (!ccPersonOk) {
      message = t('message.ccError')
    } else if (ccPersonDuplicate) {
      message = t('message.ccDuplicate')
    }

    if (!taskPersonOk) {
      message = t('message.signerSettingError')
    } else if (taskPersonDuplicate) {
      message = t('message.signersDuplicate')
    }

    if (!taskNameValidation) {
      message = t('message.noTaskName')
    }

    if (message !== '') {
      alertStore.showAlert({
        message,
        type: 'error',
      })
      return
    }

    if (!collaborateSignOk) {
      collaborateNotSetDialog.value = true
      return
    }
  }

  // 當人員只審核的時候刪除現有的annotate
  const notAuditorIds = taskPeopleWithoutAuditor.value.map((t) => t.id)
  annotateForPerson.value.forEach((file) => {
    file.forEach((page) => {
      page.data = page.data.filter(
        (data) => notAuditorIds.includes(data.id) || !!data.prefill
      )
    })
  })
}
function loadTourAnnotate() {
  const annotate = [
    {
      page: 1,
      data: [
        {
          x: 228,
          y: 263,
          width: 167.617,
          height: 55.8725,
          id: 1,
          objectId: 1,
          type: 1,
          fill: 'black',
          color: 'rgba(187, 222, 251, 0.6)',
          strokeWidth: 2.79362,
          stroke: 'rgb(177, 212, 241)',
          text: '',
          scale: 1.3968120805369129,
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
          validation: {
            type: null,
            regex: null,
            errorMessage: null,
          },
          rx: 2.79362,
          ry: 2.79362,
          label: '',
          prefill: false,
          lockScalingY: false,
          textColor: 'rgba(0,0,0,1)',
        },
      ],
    },
    {
      page: 6,
      data: [
        {
          x: 739,
          y: 1348,
          width: 164.82338,
          height: 108.95138,
          id: 1,
          objectId: 1,
          type: 0,
          color: 'rgba(187, 222, 251, 0.6)',
          strokeWidth: 2.79362,
          stroke: 'rgb(177, 212, 241)',
          rx: 2.79362,
          ry: 2.79362,
          scale: 1.3968120805369129,
          required: true,
          label: '',
          textDirection: false,
          textAlign: 'left',
        },
      ],
    },
  ]
  pdfDataRef.value.fileSrcList[0].annotate = annotate
}
function getExpiredDatetime() {
  if (!model.value.setExpiredDate) {
    return null
  }
  return widgetExpiredDate.getExpiredDatetime()
}
function pushCleverTapEvent(leaveOn) {
  // 如果沒有cleverTap Project則不發送事件
  if (!config.public.clevertapProjectId) {
    return
  }
  const endTime = new Date()
  ctEvent.value.DurationSecs = (endTime - startTime) / 1000
  ctEvent.value.TaskName = model.value.taskName
  ctEvent.value.SignatoryCount = model.value.taskPerson.length
  ctEvent.value.LeaveOn = leaveOn
  try {
    $clevertap.event.push('Create task', ctEvent.value)
  } catch (e) {
    console.log(e)
  }
}
function leavePushEvent() {
  const stepMap = {
    1: 'uploadDoc',
    2: 'setSigners',
    3: 'editSigningContent',
    4: 'confirm',
  }
  pushCleverTapEvent(stepMap[step.value])
}
async function startPdfTask() {
  globalVarStore.loading = true
  // 檢查信件主旨是否為空
  const emailSubjectSuccess = await emailSubjectObserver.validate()
  const emailMessageSuccess = await emailMessageObserver.validate()
  if (!emailSubjectSuccess || !emailMessageSuccess) {
    globalVarStore.loading = false
    return
  }

  // 上傳附件
  // v1.7.0隱藏附件區塊
  // const uploadAllAttachmentResult =
  //   await this.$refs.uploadAttachment.uploadAll()
  //
  // if (!uploadAllAttachmentResult.success) {
  //   this.$nuxt.$loading.finish()
  //   this.$alert.showMessage({
  //     message: '上傳附件失敗',
  //     type: 'error',
  //   })
  //   return
  // }
  // const attachmentIds = uploadAllAttachmentResult.attachmentIds

  // 上傳PDF檔案
  const fileIds = []
  let allUploadSuccess = true
  for (let i = 0; pdfDataRef.value.fileSrcList.length > i; i++) {
    const file = pdfDataRef.value.fileSrcList[i].file
    const formData = new FormData()
    formData.append('file', file, file.name)
    const { uploadFileApi } = useFileApi()
    const uploadResult = await uploadFileApi(file)
    if (uploadResult) {
      fileIds.push(uploadResult.body.id)
    } else {
      allUploadSuccess = false
      break
    }
  }

  if (!allUploadSuccess) {
    alertStore.showAlert({
      message: t('message.uploadPdfFail'),
      type: 'error',
    })
    globalVarStore.loading = false
    return
  }

  const templatePlaceholder = []
  const taskPeople = []
  const now = new Date()
  let collaborateSignDate = null
  model.value.taskPerson.forEach((person, index) => {
    // 拿掉原本從範本帶進來的placeholder資料
    const { placeholder, ...p } = person
    // 複製資料給儲存爲範本資料使用
    const tempPH = Object.assign({}, p)
    tempPH.defaultName = p.name
    tempPH.defaultEmail = p.email
    tempPH.defaultPhone = p.phone
    tempPH.name = `${t('label.signer')}${index + 1}`
    // 方案沒有使用SMS或傳送方式沒有電話則不送出電話欄位
    if (
      !planInfo.value.useSMSPerson ||
      !['PHONE', 'EMAIL_PHONE'].includes(p.sendMethod)
    ) {
      delete p.phone
      delete tempPH.defaultPhone
    }
    // 現場簽的email必須是空值
    if (p.signMode === 'FACE_SIGN') {
      p.email = ''
    } else if (p.signMode === 'COLLABORATE_SIGN') {
      // 視訊簽的phone必須是空值
      p.phone = ''
      collaborateSignDate = new Date(p.collaborateSignDate)
    } else if (p.signMode === 'NO_SMS_SIGN') {
      p.signMode = 'NORMAL_SIGN'
      tempPH.signMode = 'NORMAL_SIGN'
    }
    taskPeople.push(p)
    templatePlaceholder.push(tempPH)
  })
  // 送出任務的時候判斷視訊簽日期不能晚於現在時間
  if (
    planInfo.value.useVideo &&
    collaborateSignDate !== null &&
    now >= collaborateSignDate
  ) {
    alertStore.showAlert({
      message: t('message.collaDatePast'),
      type: 'error',
    })
    globalVarStore.loading = false
    return
  }

  const ccPerson = []
  model.value.ccPerson.forEach((c) => {
    ccPerson.push({
      ...c,
      defaultEmail: c.email,
      defaultName: c.name,
    })
  })

  annotate.value.forEach((file) => {
    file.forEach((item) => {
      item.data.forEach((dataItem) => {
        switch (dataItem.type) {
          case 1:
            if (dataItem.prefill) {
              /* eslint-disable no-case-declarations */
              // 用wrapDiv來判斷文字換行
              const wrapDiv = document.createElement('div')
              wrapDiv.style.width = 'auto'
              wrapDiv.style.height = 'auto'
              const fontWeight = dataItem.fontWeight || 'normal'
              wrapDiv.style.font = `${fontWeight} ${dataItem.fontSize * dataItem.scale
                }px ${dataItem.fontFamily}`
              wrapDiv.style.fontStyle = dataItem.fontStyle
              wrapDiv.style.whiteSpace = 'pre'
              wrapDiv.style.visibility = 'hidden'
              wrapDiv.style.position = 'absolute'
              wrapDiv.style.width = 'auto'
              document.body.appendChild(wrapDiv)
              const splitTexts = dataItem.text.split('\n')
              let result = ''
              let c = document.createElement('canvas')
              let ctx = c.getContext('2d', { alpha: false })
              let metrics = null
              ctx.font = `${wrapDiv.style.fontSize} ${wrapDiv.style.fontFamily}`
              splitTexts.forEach((text) => {
                if (text.length > 0) {
                  const temp = []
                  let i = 0
                  let j = 1
                  wrapDiv.innerHTML = text[0]
                  while (j < text.length) {
                    wrapDiv.innerHTML = text.slice(i, j)
                    metrics = ctx.measureText(text[j])
                    const charWidth = metrics.width
                    if (dataItem.width - wrapDiv.clientWidth < charWidth) {
                      temp.push(text.slice(i, j))
                      i = j
                    }
                    j++
                  }
                  if (i !== j) {
                    temp.push(text.slice(i, text.length))
                  }
                  result +=
                    result === '' ? temp.join('\n') : '\n' + temp.join('\n')
                }
              })
              c.width = 0
              c.height = 0
              c = ctx = null
              document.body.removeChild(wrapDiv)
              dataItem.singleLine = false
              dataItem.text = result
            }
            break
          case 6:
            const arr = []
            dataItem.options.forEach((item) => {
              if (item.name.length > 0) arr.push(item)
            })
            dataItem.options = arr
            break
        }
      })
    })
  })
  const contents = annotate.value.map((a) => JSON.stringify(a))
  // 建立任務範本
  const data = {
    name: model.value.taskName,
    signPeople: model.value.notUseOnce ? templatePlaceholder : taskPeople,
    cc: ccPerson,
    useOnce: !model.value.notUseOnce,
    contents,
    fileIds,
  }

  const { createPdfTaskApi } = usePdfTaskApi()
  const createResult = await createPdfTaskApi(data)
  if (createResult !== null && createResult.body !== null) {
    // 開始簽核
    const startPdfData = {
      emailSubject: model.value.emailSubject,
      emailMessage: model.value.emailMessage,
      // attachments: attachmentIds,
      expiredDate: getExpiredDatetime(),
      isOverlay: model.value.isOverlay,
      person: taskPeople,
      isParallel: !model.value.isNotParallel,
      isFinalAatl: model.value.isFinalAatl,
      cc: model.value.ccPerson,
    }

    // SI客製，使用專業存證選項
    if (planInfo.value.useSIBlockChain) {
      Object.assign(startPdfData, {
        siBlockChain: model.value.siBlockChain,
      })
    }

    const { startPdfTaskApi } = useTaskApi()
    const startResult = await startPdfTaskApi(
      createResult.body.id,
      startPdfData
    )
    globalVarStore.loading = false
    if (startResult !== null) {
      successStarted.value = true
      pushCleverTapEvent('finished')

      // 如果第一個人是自己，詢問是否要開始簽核，否則回到tasks
      // 視訊簽和tour除外
      const firstPerson = taskPeople[0]
      if (
        startResult.body &&
        startResult.body.myProcess &&
        firstPerson.signMode !== 'COLLABORATE_SIGN' &&
        !isTour.value
      ) {
        startTaskId.value = startResult.body.id
        // 如果自己的聯絡方式有填入電話需要帶入到網址中才能發送OTP
        if (['PHONE', 'EMAIL_PHONE'].includes(firstPerson.sendMethod)) {
          startTaskPhone.value = firstPerson.phone
        }
        startTaskNowDialog.value = true
        snackbarStore.showSnackbar({
          message: t('message.createTask'),
          color: 'error',
        })
      } else if (isTour.value) {
        const createTaskEvent = tourStore.eventInfo.value.eventList.find(
          (event) => event.type === 'CREATE_TASK'
        )
        if (createTaskEvent) {
          await updateTourEventApi({
            eventId: createTaskEvent.id,
            isDone: true,
            isCloseTour: true,
          })

          // 自動完成第三個任務
          const createTemplateEvent = tourStore.eventInfo.value.eventList.find(
            (event) => event.type === 'CREATE_TEMPLATE'
          )
          if (createTemplateEvent) {
            await updateTourEventApi({
              eventId: createTemplateEvent.id,
              isDone: true,
              isCloseTour: true,
            })
            tourStore.startCreateTemplate = false
          }

          $clevertap.event.push('Onboarding', {
            TourName: 'CreateTask',
            TourStatus: 'Completed',
            DeviceType: mdAndUp ? 'Desktop' : 'Mobile',
            OnboardingStatus: 'Ongoing',
          })
          tourStore.startCreateTask = false
          tourStore.minimizeTourEventBlock = false
          // 自動完成兌換升級
          const completeTourResult = await completeTourApi()
          if (completeTourResult !== null) {
            $clevertap.event.push('Onboarding', {
              TourName: 'Redeem',
              TourStatus: 'Completed',
              DeviceType: mdAndUp ? 'Desktop' : 'Mobile',
              OnboardingStatus: 'Redeemed',
            })
            tourStore.redeemSuccess = true
            // 到方案資訊頁面顯示兌換成功
            router.push({
              path: '/settings/plan',
              query: {
                redeemSuccess: true,
              },
            })
          }
        }
      } else if (
        model.value.taskPerson[0].noSMS &&
        startResult.body &&
        startResult.body.link
      ) {
        shareLink.value = `${startResult.body.link}?openExternalBrowser=1`
        showLinkDialog.value = true
        await nextTick()
        const canvases = document.querySelectorAll('#qrcode-canvas')
        for (const canvas of canvases) {
          QRCode.toCanvas(canvas, shareLink.value, {
            width: 200,
          })
        }

        snackbarStore.showSnackbar({
          message: t('message.createTask'),
          color: 'error',
        })
      } else {
        snackbarStore.showSnackbar({
          message: t('message.createTask'),
          color: 'error',
        })
        router.push('/tasks')
      }
    } else {
      alertStore.showAlert({
        message: startResult.message,
        type: 'error',
      })
    }
  } else {
    globalVarStore.loading = false
    alertStore.showAlert({
      message: createResult.message,
      type: 'error',
    })
  }
}
function taskPersonEnd(evt) {
  drag.value = false
  const changeMap = {}
  model.value.taskPerson.forEach((element, index) => {
    const oldId = element.id
    const newId = index + 1
    changeMap[oldId] = newId
    element.id = newId
  })

  if (annotateForPerson.value) {
    // 多文件： 檔案 ->
    annotateForPerson.value.forEach((file) => {
      file.forEach((element) => {
        element.data.forEach((data) => {
          if (data.id !== null && data.id !== undefined) {
            const newId = changeMap[data.id]
            data.id = newId
            const hex = getColorList()[newId - 1] ?? '000000'
            const r = parseInt(hex.slice(1, 3), 16)
            const g = parseInt(hex.slice(3, 5), 16)
            const b = parseInt(hex.slice(5, 7), 16)
            data.color = `rgba(${r},${g},${b}, 0.6)`
            data.stroke = `rgb(${r > 10 ? r - 10 : r}, ${g > 10 ? g - 10 : g
              }, ${b > 10 ? b - 10 : b})`
          }
        })
      })
    })
  }
}
function getUserRemindAatlTime() {
  return userInfo.value?.remindAatlTimes || null
}
function getUserTemplateIsRemain() {
  return userInfo.value
    ? userInfo.value.templateNow < userInfo.value.templateCount
    : false
}
function chooseContact(index, type, source = 'COMPANY_LIST') {
  if (source === 'google') {
    contactFromGoogleDialog.value = true
  } else {
    // 通訊錄或公司成員
    contactDialog.value = true
  }
  editIndex.value = index
  editType.value = type
  editSource.value = source
}
function chooseContactOK(selectedContact) {
  switch (editType.value) {
    case 'task':
      model.value.taskPerson[editIndex.value].name = selectedContact.name
      // 傳送方式有email再填入
      if (
        ['EMAIL', 'EMAIL_PHONE'].includes(
          model.value.taskPerson[editIndex.value].sendMethod
        )
      ) {
        model.value.taskPerson[editIndex.value].email =
          selectedContact.email || ''
      }
      // 傳送方式有手機號碼再填入手機
      if (
        ['PHONE', 'EMAIL_PHONE'].includes(
          model.value.taskPerson[editIndex.value].sendMethod
        )
      ) {
        model.value.taskPerson[editIndex.value].phone =
          selectedContact.phone || ''
      }
      break
    case 'cc':
      model.value.ccPerson[editIndex.value].email = selectedContact.email
      model.value.ccPerson[editIndex.value].name = selectedContact.name
      break
    case 'host':
      model.value.taskPerson[editIndex.value].hostEmail = selectedContact.email
      model.value.taskPerson[editIndex.value].hostName = selectedContact.name
      break
  }
  if (editSource.value === 'google') {
    contactFromGoogleDialog.value = false
  } else {
    contactDialog.value = false
  }
  editIndex.value = null
  editType.value = null
  editSource.value = null
}
function chooseContactCancel() {
  if (editSource.value === 'google') {
    contactFromGoogleDialog.value = false
  } else {
    contactDialog.value = false
  }
  editIndex.value = null
  editType.value = null
  editSource.value = null
}
function checkAnnotate() {
  if (annotate.value && model.value.taskPerson) {
    const planInfo = mainStore.planInfo
    const checkList = []
    const b2b2cCheckList = []
    let minimum = 0
    let maximum = 0
    let checkboxSelectedLength = 0
    let radioSelectedLength = 0
    let isNotComplete = false
    let message = ''
    let regex = null
    let b2b2cPerson = null
    pdfDataRef.value.fileSrcList.forEach((file) => {
      let imageFieldCount = 0
      let attactmentFieldCount = 0
      const drawCanvasCount = new Array(20).fill(0)
      // 檔案名稱超過5個字省略並加上...
      let fileName = file.name
      if (fileName.length > 5) {
        fileName = fileName.substring(0, 5) + '...'
      }
      // 把所有page中的data加上page統整成一個新的array
      const annotateData = file.annotate.flatMap(({ page, data }) =>
        data.map((item) => ({ page, ...item }))
      )

      annotateData.forEach((data) => {
        switch (data.type) {
          case 1:
            if (
              data.readonly === true &&
              (data.text === '' || data.text === null)
            ) {
              message = t('message.readOnlyTextNoValue')
              isNotComplete = true
            } else if (
              data.text &&
              data.text !== '' &&
              data.text.length > data.maxlength
            ) {
              message = t('message.textExceedLimit')
              isNotComplete = true
            } else if (
              data.text &&
              data.text !== '' &&
              data.validation !== null
            ) {
              // 文字驗證 regular expression
              // eslint-disable no-useless-escape, prettier/prettier
              regex = null
              if (data.validation) {
                switch (data.validation.type) {
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
                    regex = data.validation.regex
                    break
                }
              }

              if (regex !== null) {
                if (data.text.match(new RegExp(regex)) === null) {
                  message = t('message.textDefaultFailRegex')
                  isNotComplete = true
                } else if (data.validation.type === 'idcard') {
                  // 台灣身分證驗證規則
                  if (!validateTaiwanIdCard(data.text)) {
                    message = t('message.textDefaultFailRegex')
                    isNotComplete = true
                  }
                }
              }
            } else if (
              !!data.prefill &&
              (data.text === '' || data.text === null)
            ) {
              message = t('message.prefillTextNoValue')
              isNotComplete = true
            }
            break
          case 2:
            minimum = data.minimum
            maximum = data.maximum
            checkboxSelectedLength = annotateData.filter(
              (x) =>
                x.selected === true &&
                x.groupId === data.groupId &&
                x.type === 2 &&
                x.page === data.page
            ).length
            if (data.readonly === true) {
              switch (data.ruleId) {
                case 0:
                  if (checkboxSelectedLength < minimum) {
                    message = t('message.readonlyCheckBoxSelect0', {
                      minimum,
                    })
                    isNotComplete = true
                  }
                  break
                case 1:
                  if (checkboxSelectedLength > maximum) {
                    message = t('message.readOnlyCheckBoxSelect1', {
                      maximum,
                    })
                    isNotComplete = true
                  }
                  break
                case 2:
                  if (
                    checkboxSelectedLength > maximum ||
                    checkboxSelectedLength < minimum
                  ) {
                    message = t('message.readOnlyCheckBoxSelect2', {
                      maximum,
                    })
                    isNotComplete = true
                  }
                  break
                case 3:
                  if (
                    checkboxSelectedLength > maximum ||
                    checkboxSelectedLength < minimum
                  ) {
                    message = t('message.readOnlyCheckBoxSelect3', {
                      minimum,
                      maximum,
                    })
                    isNotComplete = true
                  }
                  break
              }
            } else if (!!data.prefill && data.selected === false) {
              message = t('message.prefillCheckboxNotSelect')
              isNotComplete = true
            }
            break
          case 4:
            if (
              data.readonly === true &&
              (data.text === '' || data.text === null)
            ) {
              message = t('message.readOnlyDateNoValue')
              isNotComplete = true
            }
            break
          case 5:
            radioSelectedLength = annotateData.filter(
              (x) =>
                x.selected === true &&
                x.groupId === data.groupId &&
                x.type === 5 &&
                x.page === data.page
            ).length
            if (data.readonly === true && radioSelectedLength !== 1) {
              message = t('message.readOnlyRadioNoSelet')
              isNotComplete = true
            } else if (!!data.prefill && data.selected === false) {
              message = t('message.prefillRadioNotSelect')
              isNotComplete = true
            }
            break
          case 6:
            if (data.options && data.options.length) {
              const arr = []
              data.options.forEach((item) => {
                if (item.name.length > 0) arr.push(item)
              })
              data.options = arr
            }
            if (!data.options || data.options.length <= 0) {
              message = t('message.dropdownNoOptions')
              isNotComplete = true
            } else if (
              data.readonly === true &&
              (data.selectOptionId === undefined ||
                data.selectOptionId === null ||
                !data.options ||
                !data.options.find((x) => x.id === data.selectOptionId))
            ) {
              message = t('message.readOnlyDropdownNoOptions')
              isNotComplete = true
            }
            break
          case 7: // 附件
            if (
              !!data.prefill &&
              (!data.attachments || data.attachments.length <= 0)
            ) {
              message = t('message.prefillAttachmentNoValue')
              isNotComplete = true
            }
            attactmentFieldCount++
            break
          case 8: // 圖片
            imageFieldCount++
            break
          case 9:
          case 10:
          case 11:
          case 12:
            b2b2cPerson = model.value.taskPerson.find(
              (person) => person.id === data.id
            )
            if (!b2b2cCheckList.includes(b2b2cPerson.id)) {
              b2b2cCheckList.push(b2b2cPerson.id)
            } else {
              message = t('message.b2b2cFieldsExceedLimit')
              isNotComplete = true
              break
            }
            break
          case 14:
            ++drawCanvasCount[data.page - 1]
            break
        }
        const person = model.value.taskPerson.find(
          (person) => person.id === data.id
        )
        if (person && !checkList.includes(person.id)) {
          checkList.push(person.id)
        }
      })
      // 目前設定一份pdf只能有一個畫布
      // 目前架構一頁pdf最多一個畫布
      // planInfo.canvasFieldCount
      if (drawCanvasCount.reduce((partialSum, a) => partialSum + a, 0) > 1) {
        message = t('message.canvasFieldsExceedLimit', {
          fileName,
          canvasCount: drawCanvasCount.reduce(
            (partialSum, a) => partialSum + a,
            0
          ),
          planCanvasCount: planInfo.canvasFieldCount || 1,
        })
        isNotComplete = true
      }
      if (planInfo.imageFieldCount < imageFieldCount) {
        message = t('message.imgFieldsExceedLimit', {
          fileName,
          imgCount: imageFieldCount,
          planImgCount: planInfo.imageFieldCount,
        })
        isNotComplete = true
      }
      if (planInfo.attachmentFieldCount < attactmentFieldCount) {
        message = t('message.attaFieldsExceedLimit', {
          fileName,
          attaCount: attactmentFieldCount,
          planAttaCount: planInfo.attachmentFieldCount,
        })
        isNotComplete = true
      }
    })

    // 計算b2b2c費用
    // const companyCredit = this.userInfo.companyCredit
    // const B2B2C_RULE = this.creditRules.find(
    //   (r) => r.txType === 'USE_B2B2C'
    // )
    // const needPoints = B2B2C_RULE.amount * this.fileSrcList.length
    // const creditOK = companyCredit >= needPoints
    // if (!creditOK) {
    //   message = this.$t('message.insufficientB2b2cPoints', {
    //     nowPoints: companyCredit,
    //     needPoints,
    //   })
    //   isNotComplete = true
    // }
    // 審核人(isAuditor)不用檢查設定簽核位置
    notFinishList.value = model.value.taskPerson.filter(
      (person) => !checkList.includes(person.id) && !person.isAuditor
    )

    if (
      isB2b2c.value &&
      b2b2cCheckList.length !== taskPeopleWithoutAuditor.value.length
    ) {
      console.log(b2b2cCheckList.length, taskPeopleWithoutAuditor.value.length)
      dialogB2b2cNotSet.value = true
      return
    } else if (isNotComplete) {
      alertStore.showAlert({
        message,
        type: 'error',
      })
      return
    } else if (model.value.taskPerson.length === notFinishList.value.length) {
      alertStore.showAlert({
        message: t('message.noSigningPos'),
        type: 'error',
      })
      return
    } else if (!isTour.value && notFinishList.value.length > 0) {
      deletePeopleDialog.value = true
      return
    }
  }
  step.value++
  if (isTour.value) {
    startTour()
  }
}
function switchB2b2cSetting() {
  vuePdfRef.value.switchB2b2cSetting()
  dialogB2b2cNotSet.value = false
}
function cancelChangeAuditor() {
  const person = model.value.taskPerson.find(
    (p) => p.id === changeRoleId.value
  )
  person.isAuditor = false
  person.signRole = 'SIGNER'
  changeAuditorDialog.value = false
}
function confirmChangeAuditor() {
  const person = model.value.taskPerson.find(
    (p) => p.id === changeRoleId.value
  )
  person.signRole = 'AUDITOR'
  // 只審核不需要聲明錄影
  person.needVideo = false
  changeAuditorDialog.value = false
}
// 變更是否爲現場簽
async function changeSignMode(personId, signMode) {
  const myInfo = userInfo.value
  const person = model.value.taskPerson.find((p) => p.id === personId)
  person.noSMS = false
  if (signMode === 'FACE_SIGN') {
    person.face = true
    // 現場簽不能勾選只審核
    person.isAuditor = false
    person.signRole = 'SIGNER'
    person.isNeedOtp = false
    // 現場簽清空email與手機號碼資料
    person.email = ''
    person.phone = ''
    // 現場簽預設的主持人是目前的帳號
    person.hostEmail = myInfo.email
    person.hostName = myInfo.name
  } else {
    person.face = false
    if (signMode === 'COLLABORATE_SIGN') {
      const collaborateSigners = model.value.taskPerson.filter(
        (person) => person.signMode === 'COLLABORATE_SIGN'
      )
      if (collaborateSigners.length > 1) {
        alertStore.showAlert({
          message: t('message.collaborateSignLimit'),
          type: 'error',
        })
        await nextTick()
        person.signMode = 'NORMAL_SIGN'
        return
      }
      person.isAuditor = false
      person.signRole = 'SIGNER'
      // 視訊簽沒有聲明錄影
      person.needVideo = false
      // 視訊簽預設的主持人是目前的帳號
      person.hostEmail = myInfo.email
      person.hostName = myInfo.name
      person.isNeedOtp = false
      // 視訊簽只能使用email寄送
      person.sendMethod = 'EMAIL'
      person.phone = ''
    } else {
      if (signMode === 'NO_SMS_SIGN') {
        person.sendMethod = 'PHONE'
        person.email = ''
        person.noSMS = true
      }
      person.hostEmail = ''
      person.hostName = ''
      person.collaborateSignDate = ''
      person.isNeedOtp = ['PHONE', 'EMAIL_PHONE'].includes(
        person.sendMethod
      )
    }
  }
}
function keepFindAnnotationCancel() {
  findAnnotationDialog.value = false
  model.value.keepFindAnnotation = null
  model.value.keepFindAnnotationPersonId = null
}
function keepFindAnnotationOk() {
  if (
    model.value.keepFindAnnotation === true &&
    model.value.keepFindAnnotationPersonId !== null &&
    model.value.keepFindAnnotationPersonId !== undefined
  ) {
    firstKeepFindAnnotation.value = false
    findAnnotationDialog.value = false
    step.value++
  } else if (model.value.keepFindAnnotation === false) {
    firstKeepFindAnnotation.value = false
    isFindAnnotation.value = false
    findAnnotationDialog.value = false
    model.value.keepFindAnnotation = null
    model.value.keepFindAnnotationPersonId = null
    step.value++
  }
}
function deleteNotFinishPeople() {
  // 刪除沒有設定簽署的人員
  model.value.taskPerson = model.value.taskPerson.filter(
    (p) => !notFinishList.value.map((f) => f.id).includes(p.id)
  )
  // 重新設定id與annotate
  taskPersonEnd(null)
  notFinishList.value = []
  // 進入確認頁
  step.value++
  deletePeopleDialog.value = false
}
function changeSendMethod(personId, value) {
  const person = model.value.taskPerson.find((p) => p.id === personId)
  // 如果只有email或手機號碼則清空另一欄位
  // 有手機號碼則必須勾選OTP
  if (value === 'EMAIL') {
    person.phone = ''
    person.isNeedOtp = false
  } else if (value === 'PHONE') {
    person.email = ''
    person.isNeedOtp = person.signMode === 'NORMAL_SIGN'
  } else if (value === 'EMAIL_PHONE') {
    person.isNeedOtp = person.signMode === 'NORMAL_SIGN'
  }
}
async function preDownloadFile() {
  const result = await downloadFileApi(fileId.value)
  if (result !== null && result !== '') {
    const blobData = await fetch(result.pdfLink).then((res) => res.blob())
    const file = new Blob([blobData])
    file.name = `${result.fileName}`
    uploadPdfStore.fileUploadFromIndex = [file]
    pdfUpload.checkFileInStore()
  } else {
    alertStore.showAlert({
      message: t('message.preDownloadFileError'),
      type: 'error',
    })
  }
}
async function preDownloadFileForTour() {
  const tourPdfFileName =
    locale.value === 'en'
      ? 'TermsOfService(Tour).pdf'
      : '服務條款(活動).pdf'

  const blobData = await fetch(`/${tourPdfFileName}`).then((res) =>
    res.blob()
  )
  const file = new Blob([blobData])
  file.name = tourPdfFileName
  uploadPdfStore.fileUploadFromIndex = [file]
  pdfUpload.checkFileInStore()
}
function passDataFromTemplate(data) {
  model.value.ccPerson = data.ccPerson
  model.value.isOverlay = data.isOverlay
  model.value.isNotParallel = data.isNotParallel
  model.value.isFinalAatl = data.isFinalAatl
  model.value.setExpiredDate = data.setExpiredDate
  model.value.expiredDate = data.expiredDate
  model.value.emailSubject = data.emailSubject
  model.value.emailMessage = data.emailMessage
  model.value.taskName = data.pdfTaskName
  pdfUpload.loadFileList(pdfDataRef.value.fileSrcList)
  pdfUpload.passDataFromTemplate(data)
  mainStore.sendTemplateData = null
}
function goToSign() {
  const query = {
    taskId: startTaskId.value,
    email: mainStore.userInfo.email,
  }
  if (startTaskPhone.value) {
    Object.assign(query, { phone: startTaskPhone.value })
  }
  router.push({
    path: '/tasks/sign-task',
    query,
  })
}
function openSignSettingDialog(person) {
  signSettingDialog.value = true
  const editSettingPerson = Object.assign({}, person)
  editSettingPerson.id = person.id
  signSettingDialog.loadSetting(editSettingPerson)
}
function updateSignSetting(setting) {
  const person = model.value.taskPerson.find((p) => p.id === setting.id)
  Object.assign(person, setting)
}
function goSetCollaborateSign() {
  const person = model.value.taskPerson.find(
    (p) => p.signMode === 'COLLABORATE_SIGN' && !p.collaborateSignDate
  )
  if (person) {
    collaborateNotSetDialog.value = false
    openSignSettingDialog(person)
  }
}
// 變更簽核角色（只審核 - AUDITOR，簽署 - SIGNER）
function changePersonSignRole(personId, value) {
  if (value) {
    changeRoleId.value = personId
    // 檢查annotate是否有這個簽署人的資料，如果有才需要跳出警告dialog
    let hasAnnotate = false
    annotateForPerson.value.forEach((file) => {
      file.forEach((page) => {
        hasAnnotate =
          hasAnnotate || page.data.some((data) => data.id === personId)
      })
    })
    if (hasAnnotate) {
      changeAuditorDialog.value = true
    } else {
      confirmChangeAuditor()
    }
  } else {
    const person = model.value.taskPerson.find((p) => p.id === personId)
    person.signRole = 'SIGNER'
  }
}
function checkSmsSubjectLength() {
  // 是否有寄送簡訊
  const sendSms = model.value.taskPerson.some(
    (p) =>
      ['PHONE', 'EMAIL_PHONE'].includes(p.sendMethod) && p.noSMS === false
  )
  // 計算SMS主旨是否會增加點數用量
  pointPerSms.value = Math.ceil(
    (model.value.emailSubject.length +
      config.public.frontendURL.length +
      config.public.smsPathLength) /
    config.public.smsLengthLimit
  )
  const subjectLengthExceed = pointPerSms.value > 1
  // confirmSmsSubjectLength=true 表示已經確認過提示
  return sendSms && subjectLengthExceed && !confirmSmsSubjectLength.value
}
function confirmSmsLengthStartPdf() {
  checkSmsSubjectLengthDialog.value = false
  confirmSmsSubjectLength.value = true
  finishPersonPrepare()
}
function startTour() {
  dialogLeaveTour.value = false
  confirmLeaveTour.value = false
  driverObj.value = driver({
    overlayOpacity: 0,
    popoverClass: 'onboarding-popover',
    allowClose: false,
    stagePadding: 4,
    prevBtnText: t('button.cancel'),
    nextBtnText: t('button.tourNext'),
    doneBtnText: t('button.cancel'),
    showButtons: ['previous', 'next'],
    steps: tourSteps[step.value],
    onPrevClick: () => {
      // 將上一步按鈕的位置作為取消
      showConfirmLeaveTour()
    },
  })
  setTimeout(() => {
    if (tourLeaveProgress.value > -1) {
      driverObj.value.drive(tourLeaveProgress.value)
      tourLeaveProgress.value = -1
    } else {
      driverObj.value.drive(1)
    }
  }, 300)
}
function showConfirmLeaveTour() {
  tourLeaveProgress.value = driverObj.value.getActiveIndex()
  driverObj.destroy()
  dialogLeaveTour.value = true
}
function endTour() {
  dialogLeaveTour.value = false
  confirmLeaveTour.value = true
  isEditing.value = false
  tourStore.startCreateTask = false
  $clevertap.event.push('Onboarding', {
    TourName: 'CreateTask',
    TourStatus: 'Aborted',
    DeviceType: mdAndUp ? 'Desktop' : 'Mobile',
    OnboardingStatus: 'Ongoing',
  })
  tourStore.minimizeTourEventBlock = true
  if (leaveTo.value !== null) {
    // 如果是按「上一頁」離開則確認後回到「上一頁」
    router.push(leaveTo.value.path)
  } else {
    // 預設回到首頁
    router.push('/')
  }
}
function tourNextChangeTextSize() {
  vuePdf.showSidebar()
  tourMoveNext()
}
function tourNextHideSidebar() {
  vuePdf.hideSidebar()
  tourNextScrollToLastPage()
}
function tourNextScrollToLastPage() {
  vuePdf.scrollToBottom()
  tourMoveNext()
}
function tourNextScrollBackToTop() {
  vuePdf.scrollToTop()
  tourMoveNext()
}
async function tourMoveNext() {
  await nextTick()
  setTimeout(() => {
    driverObj.moveNext()
  }, 300)
}
function tourNextFillSigner() {
  model.value.taskPerson[0].name = userInfo.value.name
  model.value.taskPerson[0].email = userInfo.value.email
  tourMoveNext()
}
function applySignerGroup(signerGroup) {
  // 如果簽署人為空的時候則將簽署組合的內容新增
  if (emptyPerson) {
    model.value.taskPerson = []
    for (let i = 0; i < signerGroup.person.length; i++) {
      const newPerson = {
        placeholder: {
          name: signerGroup.person[i].role,
        },
        name: signerGroup.person[i].name,
        email: signerGroup.person[i].email,
        id: i + 1,
        phone: '',
        setNewHost: false,
        hostName: '',
        hostEmail: '',
        signRole: 'SIGNER',
        signMode: 'NORMAL_SIGN',
        isAuditor: false,
        isNeedOtp: false,
        culture: locale.value,
        face: false,
        needVideo: false,
        sendMethod: 'EMAIL',
        collaborateSignDate: '',
      }
      model.value.taskPerson.push(newPerson)
    }
  } else {
    for (let i = 0; i < signerGroup.person.length; i++) {
      model.value.taskPerson[i].placeholder = {
        name: signerGroup.person[i].role,
      }
      model.value.taskPerson[i].name = signerGroup.person[i].name
      // 如果noSMS為true，則跳過設定email
      if (model.value.taskPerson[i].noSMS) {
        continue
      }
      model.value.taskPerson[i].email = signerGroup.person[i].email
      if (
        planInfo.value.useSMSPerson &&
        model.value.taskPerson[i].sendMethod !== 'EMAIL'
      ) {
        model.value.taskPerson[i].sendMethod = 'EMAIL'
        model.value.taskPerson[i].phone = ''
        model.value.taskPerson[i].isNeedOtp = false
      }
    }
  }
}
function copyShareLink() {
  navigator.clipboard.writeText(shareLink)
  snackbarStore.showSnackbar({
    message: t('message.shareLinkCopied'),
    color: 'error',
  })
}
function closeShowLinkDialog() {
  const canvases = document.querySelectorAll('#qrcode-canvas')
  for (const canvas of canvases) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  shareLink.value = ''
  showLinkDialog.value = false
  router.push('/tasks')
}

useHead({
  title: t('title.createTask'),
})
</script>

<style scoped>
@use 'driver.js/dist/driver.css';
@use '~/assets/onboarding.css';
</style>
<style lang="scss" scoped>
:v-deep .v-stepper__step>span {
  background-color: #009138 !important;
  color: white;
  border: 1px solid white;
}

:v-deep .v-stepper__step--active>span {
  background-color: white !important;
  color: #009138 !important;
}

.v-stepper__header .v-divider {
  width: 100px;
}

.grey-zone {
  background-color: #f7f7f7;
}

.pdf-icon-area {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: #00653e;
  width: 60px;
  height: 100%;
  border-radius: 4px 0 0 4px;
}

.taskContainer {
  width: 100%;
  height: 100%;
  align-items: center;
  padding-top: 50px;
}

:v-deep .v-stepper__step__step {
  width: 15px !important;
  min-width: 15px !important;
  height: 15px;
}

:v-deep .v-stepper__step {
  font-size: 13px;
}

@media screen and (max-width: 1264px) {
  .taskContainer {
    padding-top: 112px;
  }
}

@media screen and (max-width: 960px) {
  .taskContainer {
    padding-top: 104px;
  }
}

.handle {
  cursor: grab;
}

.splitButton {
  display: flex;
  flex-direction: row;
}

.mainButton {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.actionsButton {
  border-left: 0px !important;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  padding: 0 !important;
  min-width: 35px !important;
  margin-left: -3.5px;
  padding-left: 10px !important;
}

.pdfViewer {
  height: calc(100% - 73px);
}

.pdfViewer-sm {
  height: 100%;
}

.taskName {
  max-width: 300px;
  font-size: 13px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.annotationPeopleTitle {
  margin: 0 2rem;
  color: rgba(0, 0, 0, 0.6);
}

.annotationPeopleSelect {
  max-width: 300px !important;
  border: 1px solid #dfe1e6;
  overflow: hidden;
  margin: 1rem 2rem;
}

.annotationPeopleSelect.v-input--is-disabled {
  border: 1px solid #e7e9ee;
}

:v-deep .v-input__slot>.v-input__append-inner {
  margin-top: 2px !important;
}

.chip-label {
  flex: 0 0 55px;
  font-size: calc(15 / 16 * 1rem);
  font-weight: normal;
}

.confirm-file-name {
  font-size: calc(14 / 16 * 1rem);
  font-weight: bold;
}

.chip-label>span {
  display: inline-block;
  margin-top: 3px;
}

.confirm-otp-block {
  flex: 0 0 200px;
}

.chip-name-wrap {
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-text-mobile {
  max-width: 250px;
}

.chip-text-desktop {
  max-width: 360px;
}

.sign-setting-title {
  background-color: #f8fafa;
  padding: 20px 40px !important;
}

.sign-setting-heading {
  font-size: calc(14 / 16 * 1rem);
  font-weight: bold;
  color: black;
}

.text--button {
  cursor: pointer;
  color: #00653e;
  padding: 2px 4px;
}

div.qrcode {
  margin-top: 15px;
  display: grid;
  grid-template-columns: 50% auto 50%;
  justify-content: space-around;
  align-items: center;
}

div.qrcode>div.qrcode-spacing {
  flex: 1 1;
  justify-self: center;
}

.dialog-header {
  font-size: 20px;
  font-weight: 700;
  border-bottom: 1px solid #009138;
}

:v-deep .hide-scrollbar textarea {
  overflow-y: hidden;
}
</style>
