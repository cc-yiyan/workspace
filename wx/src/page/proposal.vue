<template>

  <div style="height:100%;" class="page-bg">
    <group>
      <x-input title="标题" v-model="form.title"></x-input>
    </group>
    <group>
      <popup-radio title="类型" :options="typeList" @value="value" v-model="form.type"></popup-radio>
    </group>
    <group>
      <x-textarea title="标题" v-model="form.textareaValue" placeholder="多行输入"></x-textarea>
    </group>
    <uploader 
    :max="uploader.varmax" 
    :images="uploader.images" 
    :handle-click="true" 
    :show-header="false" 
    :readonly="true"
    :upload-url="uploader.uploadUrl" 
    name="img" 
    :params="uploader.params" 
    size="small" 
    @preview="previewMethod"
      @add-image="addImageMethod" 
      @remove-image="removeImageMethod"></uploader>
  </div>
</template>
<script>
  import {
    XTextarea,
    ViewBox,
    PopupRadio,
    Group,
    XInput,
  } from 'vux'
  import Uploader from 'vux-uploader'

  export default {
    components: {
      Group,
      "x-textarea": XTextarea,
      "view-box": ViewBox,
      "x-input": XInput,
      PopupRadio,
      Uploader,
    },
    data() {
      return {
        form: {
          textareaValue: '',
          type: '',
          title: '',
        },
        typeList: ['其他', '经营类', '运营类'],
        value: "123123122123",
        uploader: {
          varmax: 4,
          images: ['png'],
          uploadUrl: '',
          params: {},
        }
      };
    },
    mounted() {

    },
    created() {

    },
    methods: {
      previewMethod() {
        console.log(123)

      },
      removeImageMethod(){

      },
      addImageMethod(){

      }


    }
  }
</script>
<style>
  html,
  body {
    height: 100%;
    width: 100%;
    overflow-x: hidden;
  }

  .page-bg {
    background-color: #f8f8f8;
  }
</style>